package com.cinema.booking.service;

import com.cinema.booking.dto.PaymentCreateRequest;
import com.cinema.booking.dto.PaymentResponse;
import com.cinema.booking.model.Payment;
import com.cinema.booking.model.PaymentStatus;
import com.cinema.booking.model.Ticket;
import com.cinema.booking.model.TicketStatus;
import com.cinema.booking.repository.PaymentRepository;
import com.cinema.booking.repository.TicketRepository;
import com.cinema.common.exception.ConflictException;
import com.cinema.common.exception.GoneException;
import com.cinema.common.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PaymentService {
    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final TicketRepository ticketRepository;
    private final TicketService ticketService;

    public PaymentService(PaymentRepository paymentRepository,
                          TicketRepository ticketRepository,
                          TicketService ticketService) {
        this.paymentRepository = paymentRepository;
        this.ticketRepository = ticketRepository;
        this.ticketService = ticketService;
    }

    @Transactional
    public PaymentResponse createPayment(Long userId, PaymentCreateRequest req) {
        if (req.getTicketIds() == null || req.getTicketIds().isEmpty()) {
            throw new IllegalArgumentException("Danh sách vé thanh toán không được rỗng");
        }

        // Kiểm tra Idempotency-Key nếu có
        if (req.getIdempotencyKey() != null && !req.getIdempotencyKey().isBlank()) {
            Optional<Payment> existing = paymentRepository.findByUserIdAndIdempotencyKey(userId, req.getIdempotencyKey());
            if (existing.isPresent()) {
                Payment p = existing.get();
                List<Ticket> tList = ticketRepository.findAllById(parseTicketIds(p.getTicketIds()));
                return toResponse(p, tList);
            }
        }

        List<Long> distinctIds = req.getTicketIds().stream().filter(Objects::nonNull).distinct().toList();
        List<Ticket> tickets = ticketRepository.findAllById(distinctIds);
        if (tickets.size() != distinctIds.size()) {
            throw new ResourceNotFoundException("Một số mã vé không tồn tại trong hệ thống");
        }

        LocalDateTime now = LocalDateTime.now();
        for (Ticket t : tickets) {
            if (!t.getUserId().equals(userId)) {
                throw new AccessDeniedException("Vé #" + t.getId() + " không thuộc sở hữu của bạn");
            }
            if (t.getStatus() != TicketStatus.PENDING) {
                throw new ConflictException("Vé #" + t.getId() + " không ở trạng thái chờ thanh toán (PENDING)");
            }
            if (!TicketRules.holdValid(t.getExpiresAt(), now)) {
                throw new GoneException("Vé #" + t.getId() + " đã hết hạn thời gian giữ ghế");
            }
        }

        BigDecimal total = tickets.stream()
                .map(t -> BigDecimal.valueOf(t.getFinalPrice()))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        String transactionCode = "PAY" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        String ticketIdsStr = distinctIds.stream().map(String::valueOf).collect(Collectors.joining(","));
        String method = (req.getPaymentMethod() != null && !req.getPaymentMethod().isBlank())
                ? req.getPaymentMethod().toUpperCase() : "MOCK_TEST";

        // Tạo URL VietQR QuickLink chuẩn
        String qrUrl = String.format(
                "https://img.vietqr.io/image/970422-0987654321-compact2.png?amount=%d&addInfo=%s&accountName=AURA%%20CINEMA",
                total.setScale(0, RoundingMode.HALF_UP).longValue(),
                transactionCode
        );

        Payment payment = new Payment();
        payment.setTransactionCode(transactionCode);
        payment.setUserId(userId);
        payment.setAmount(total);
        payment.setPaymentMethod(method);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setTicketIds(ticketIdsStr);
        payment.setIdempotencyKey(req.getIdempotencyKey());
        payment.setQrUrl(qrUrl);
        payment.setNote("Thanh toán đơn vé: " + ticketIdsStr);
        payment.setCreatedAt(now);

        Payment saved = paymentRepository.save(payment);
        log.info("[PAYMENT] Khởi tạo đơn thanh toán {} cho user #{} với tổng tiền {} VND",
                transactionCode, userId, total);

        return toResponse(saved, tickets);
    }

    @Transactional
    public PaymentResponse processMockPayment(Long paymentId, Long userId, boolean isAdmin) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn thanh toán #" + paymentId));

        if (!isAdmin && !payment.getUserId().equals(userId)) {
            throw new AccessDeniedException("Bạn không có quyền truy cập đơn thanh toán này");
        }

        // Idempotency: nếu đã thành công rồi thì trả về luôn
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            List<Ticket> tList = ticketRepository.findAllById(parseTicketIds(payment.getTicketIds()));
            return toResponse(payment, tList);
        }

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new ConflictException("Đơn thanh toán không ở trạng thái PENDING");
        }

        List<Long> ticketIds = parseTicketIds(payment.getTicketIds());
        // Gọi batch pay trên TicketService để xử lý giao dịch nguyên tử, giải phóng Redis lock và bắn RabbitMQ TICKET_PAID
        List<Ticket> paidTickets = ticketService.payTicketsBatch(ticketIds, userId, isAdmin);

        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaidAt(LocalDateTime.now());
        payment.setNote("Đã thanh toán thành công (Xác nhận giả lập)");
        Payment saved = paymentRepository.saveAndFlush(payment);

        log.info("[PAYMENT] Hoàn tất thanh toán {} cho {} vé thành công", payment.getTransactionCode(), paidTickets.size());
        return toResponse(saved, paidTickets);
    }

    @Transactional
    public PaymentResponse quickMockPayment(PaymentCreateRequest req, Long userId, boolean isAdmin) {
        PaymentResponse created = createPayment(userId, req);
        return processMockPayment(created.getId(), userId, isAdmin);
    }

    public PaymentResponse getPaymentById(Long paymentId, Long userId, boolean isAdmin) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn thanh toán #" + paymentId));
        if (!isAdmin && !payment.getUserId().equals(userId)) {
            throw new AccessDeniedException("Bạn không có quyền xem đơn thanh toán này");
        }
        List<Ticket> tickets = ticketRepository.findAllById(parseTicketIds(payment.getTicketIds()));
        return toResponse(payment, tickets);
    }

    public List<PaymentResponse> getMyPayments(Long userId) {
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(p -> toResponse(p, null))
                .toList();
    }

    @Transactional
    public PaymentResponse cancelPayment(Long paymentId, Long userId, boolean isAdmin) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn thanh toán #" + paymentId));
        if (!isAdmin && !payment.getUserId().equals(userId)) {
            throw new AccessDeniedException("Bạn không có quyền hủy đơn thanh toán này");
        }
        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new ConflictException("Chỉ có thể hủy đơn thanh toán đang ở trạng thái PENDING");
        }
        payment.setStatus(PaymentStatus.CANCELLED);
        payment.setNote("Người dùng hủy đơn thanh toán");
        Payment saved = paymentRepository.saveAndFlush(payment);

        // Hủy các vé pending liên quan
        List<Long> ticketIds = parseTicketIds(payment.getTicketIds());
        for (Long tId : ticketIds) {
            try {
                ticketService.cancelTicket(tId, userId, isAdmin);
            } catch (Exception e) {
                log.warn("Không thể hủy kèm vé #{} khi hủy payment: {}", tId, e.getMessage());
            }
        }
        return toResponse(saved, null);
    }

    private List<Long> parseTicketIds(String raw) {
        if (raw == null || raw.isBlank()) return Collections.emptyList();
        return Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Long::parseLong)
                .toList();
    }

    private PaymentResponse toResponse(Payment p, List<Ticket> tickets) {
        PaymentResponse res = new PaymentResponse();
        res.setId(p.getId());
        res.setTransactionCode(p.getTransactionCode());
        res.setUserId(p.getUserId());
        res.setAmount(p.getAmount());
        res.setPaymentMethod(p.getPaymentMethod());
        res.setStatus(p.getStatus());
        res.setTicketIds(parseTicketIds(p.getTicketIds()));
        res.setQrUrl(p.getQrUrl());
        res.setNote(p.getNote());
        res.setCreatedAt(p.getCreatedAt());
        res.setPaidAt(p.getPaidAt());
        res.setTickets(tickets);
        return res;
    }
}
