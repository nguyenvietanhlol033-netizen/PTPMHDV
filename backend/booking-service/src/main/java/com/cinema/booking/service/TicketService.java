package com.cinema.booking.service;

import com.cinema.booking.client.SeatClient;
import com.cinema.booking.client.ShowtimeClient;
import com.cinema.booking.dto.SeatInfo;
import com.cinema.booking.dto.ShowtimeInfo;
import com.cinema.booking.dto.ShowtimeSeatStatus;
import com.cinema.booking.model.SeatClaim;
import com.cinema.booking.model.Ticket;
import com.cinema.booking.model.TicketStatus;
import com.cinema.booking.repository.SeatClaimRepository;
import com.cinema.booking.repository.TicketRepository;
import com.cinema.common.exception.ConflictException;
import com.cinema.common.exception.GoneException;
import com.cinema.common.exception.ResourceNotFoundException;
import com.cinema.common.messaging.BookingEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.math.BigDecimal;
import java.math.RoundingMode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

@Service
public class TicketService {
    private static final Logger log = LoggerFactory.getLogger(TicketService.class);

    private static final DefaultRedisScript<Long> RELEASE_SCRIPT = new DefaultRedisScript<>(
            "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end", Long.class);

    // Redis Lua Script khóa nhiều ghế nguyên tử (all-or-nothing)
    private static final DefaultRedisScript<Long> LOCK_MULTI_SCRIPT = new DefaultRedisScript<>(
            "for i = 1, #KEYS do\n" +
            "    if redis.call('exists', KEYS[i]) == 1 then\n" +
            "        return 0\n" +
            "    end\n" +
            "end\n" +
            "for i = 1, #KEYS do\n" +
            "    redis.call('set', KEYS[i], ARGV[1], 'EX', ARGV[2])\n" +
            "end\n" +
            "return 1\n", Long.class);

    // Redis Lua Script mở khóa nhiều ghế nguyên tử
    private static final DefaultRedisScript<Long> RELEASE_MULTI_SCRIPT = new DefaultRedisScript<>(
            "for i = 1, #KEYS do\n" +
            "    if redis.call('get', KEYS[i]) == ARGV[1] then\n" +
            "        redis.call('del', KEYS[i])\n" +
            "    end\n" +
            "end\n" +
            "return 1\n", Long.class);

    private final TicketRepository tickets;
    private final SeatClaimRepository claims;
    private final ShowtimeClient showtimes;
    private final SeatClient seats;
    private final StringRedisTemplate redis;
    private final BookingProducer producer;
    private final long holdSeconds;
    private final ZoneId zone;
    private final BigDecimal vipSurcharge;
    private final BigDecimal sweetboxSurcharge;

    public TicketService(TicketRepository tickets, SeatClaimRepository claims, ShowtimeClient showtimes,
                         SeatClient seats, StringRedisTemplate redis, BookingProducer producer,
                         @Value("${cinema.seat-hold-seconds:600}") long holdSeconds,
                         @Value("${cinema.zone-id:Asia/Ho_Chi_Minh}") String timeZone,
                         @Value("${cinema.pricing.vip-surcharge:20000.00}") BigDecimal vipSurcharge,
                         @Value("${cinema.pricing.sweetbox-surcharge:50000.00}") BigDecimal sweetboxSurcharge) {
        if (holdSeconds < 60 || holdSeconds > 3600) throw new IllegalArgumentException("Invalid seat hold seconds");
        this.tickets = tickets;
        this.claims = claims;
        this.showtimes = showtimes;
        this.seats = seats;
        this.redis = redis;
        this.producer = producer;
        this.holdSeconds = holdSeconds;
        this.zone = ZoneId.of(timeZone);
        this.vipSurcharge = vipSurcharge != null ? vipSurcharge : TicketRules.DEFAULT_VIP_SURCHARGE;
        this.sweetboxSurcharge = sweetboxSurcharge != null ? sweetboxSurcharge : TicketRules.DEFAULT_SWEETBOX_SURCHARGE;
    }

    /** Kết quả đặt vé đơn lẻ */
    public record BookingResult(Ticket ticket, boolean replayed) {}

    /** Kết quả đặt vé hàng loạt nguyên tử (Batch Atomic Booking) */
    public record BatchBookingResult(List<Ticket> tickets, boolean replayed) {}

    public BigDecimal getVipSurcharge() {
        try {
            String val = redis.opsForValue().get("config:pricing:vip");
            if (val != null && !val.isBlank()) {
                return new BigDecimal(val.trim()).setScale(2, RoundingMode.HALF_UP);
            }
        } catch (Exception e) {
            log.warn("Không thể đọc vipSurcharge từ Redis: {}", e.getMessage());
        }
        return vipSurcharge;
    }

    public BigDecimal getSweetboxSurcharge() {
        try {
            String val = redis.opsForValue().get("config:pricing:sweetbox");
            if (val != null && !val.isBlank()) {
                return new BigDecimal(val.trim()).setScale(2, RoundingMode.HALF_UP);
            }
        } catch (Exception e) {
            log.warn("Không thể đọc sweetboxSurcharge từ Redis: {}", e.getMessage());
        }
        return sweetboxSurcharge;
    }

    public void updatePricingSurcharge(BigDecimal newVip, BigDecimal newSweetbox) {
        if (newVip != null && newVip.compareTo(BigDecimal.ZERO) >= 0) {
            redis.opsForValue().set("config:pricing:vip", newVip.setScale(2, RoundingMode.HALF_UP).toPlainString());
        }
        if (newSweetbox != null && newSweetbox.compareTo(BigDecimal.ZERO) >= 0) {
            redis.opsForValue().set("config:pricing:sweetbox", newSweetbox.setScale(2, RoundingMode.HALF_UP).toPlainString());
        }
    }

    private LocalDateTime now() { return LocalDateTime.now(zone); }
    private String lockKey(Long showtimeId, Long seatId) { return "seat_lock:" + showtimeId + ":" + seatId; }

    public boolean lockSeat(Long showtimeId, Long seatId, String lockToken) {
        return Boolean.TRUE.equals(redis.opsForValue().setIfAbsent(
                lockKey(showtimeId, seatId), lockToken, Duration.ofSeconds(holdSeconds)));
    }

    public boolean lockSeatBatch(Long showtimeId, List<Long> seatIds, String lockToken) {
        List<String> keys = seatIds.stream().map(sId -> lockKey(showtimeId, sId)).toList();
        Long res = redis.execute(LOCK_MULTI_SCRIPT, keys, lockToken, String.valueOf(holdSeconds));
        return res != null && res == 1L;
    }

    private void releaseLock(Long showtimeId, Long seatId, String lockToken) {
        if (lockToken == null) return;
        try {
            redis.execute(RELEASE_SCRIPT, List.of(lockKey(showtimeId, seatId)), lockToken);
        } catch (RuntimeException e) {
            log.warn("Cannot release Redis lock for showtime {} seat {}: {}", showtimeId, seatId, e.toString());
        }
    }

    private void releaseBatchLock(Long showtimeId, List<Long> seatIds, String lockToken) {
        if (lockToken == null || seatIds == null || seatIds.isEmpty()) return;
        try {
            List<String> keys = seatIds.stream().map(sid -> lockKey(showtimeId, sid)).toList();
            redis.execute(RELEASE_MULTI_SCRIPT, keys, lockToken);
        } catch (RuntimeException e) {
            log.warn("Cannot release Redis batch lock for showtime {}: {}", showtimeId, e.toString());
        }
    }

    private void releaseAfterCommit(Ticket ticket) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override public void afterCommit() {
                    releaseLock(ticket.getShowtimeId(), ticket.getSeatId(), ticket.getLockToken());
                }
            });
        } else {
            releaseLock(ticket.getShowtimeId(), ticket.getSeatId(), ticket.getLockToken());
        }
    }

    // ==========================================
    // 1. ĐẶT VÉ ĐƠN LẺ
    // ==========================================
    @Transactional
    public BookingResult createTicket(Long userId, Long showtimeId, Long seatId, String idempotencyKeyRaw) {
        if (userId == null || showtimeId == null || seatId == null || showtimeId <= 0 || seatId <= 0) {
            throw new IllegalArgumentException("userId, showtimeId and seatId are required");
        }
        // Idempotency: cùng (user, key) thì trả lại vé cũ, không tạo vé thứ hai.
        String idempotencyKey = TicketRules.normalizeIdempotencyKey(idempotencyKeyRaw);
        if (idempotencyKey != null) {
            Optional<Ticket> previous = tickets.findByUserIdAndIdempotencyKey(userId, idempotencyKey);
            if (previous.isPresent()) {
                Ticket old = previous.get();
                if (!old.getShowtimeId().equals(showtimeId) || !old.getSeatId().equals(seatId)) {
                    throw new ConflictException("Idempotency-Key này đã được dùng cho một yêu cầu đặt vé khác");
                }
                return new BookingResult(old, true);
            }
        }
        // Validate before opening a lock, fail closed if movie or venue service is unavailable.
        ShowtimeInfo showtime = showtimes.getShowtime(showtimeId);
        SeatInfo seat = seats.getSeat(seatId);
        if (!TicketRules.seatBelongsToRoom(seat.getRoomId(), showtime.getRoomId())) {
            throw new IllegalArgumentException("Ghế không thuộc phòng chiếu của suất này");
        }
        if (!TicketRules.seatSellable(seat.getStatus())) {
            throw new ConflictException("Ghế đang bị khóa hoặc bảo trì, vui lòng chọn ghế khác");
        }
        if ("CLOSED".equalsIgnoreCase(showtime.getStatus())) {
            throw new ConflictException("Suất chiếu đã đóng");
        }
        if (showtime.getShowDate() == null || showtime.getStartTime() == null
                || !TicketRules.isShowtimeBookable(showtime.getShowDate().atTime(showtime.getStartTime()), now())) {
            throw new ConflictException("Suất chiếu đã bắt đầu hoặc không hợp lệ");
        }
        if (showtime.getBasePrice() == null) throw new IllegalArgumentException("Suất chiếu chưa có giá");

        String token = UUID.randomUUID().toString();
        if (!lockSeat(showtimeId, seatId, token)) {
            throw new ConflictException("Ghế đang được giữ, vui lòng chọn ghế khác");
        }
        try {
            // SQL's unique claim key is the final authority after a Redis restart/TTL expiration.
            String claimKey = SeatClaim.key(showtimeId, seatId);
            SeatClaim previous = claims.findById(claimKey).orElse(null);
            if (previous != null) {
                Ticket old = tickets.findByIdForUpdate(previous.getTicketId()).orElse(null);
                if (old != null && old.getStatus() == TicketStatus.PENDING
                        && !TicketRules.holdValid(old.getExpiresAt(), now())) {
                    old.setStatus(TicketStatus.EXPIRED);
                    tickets.saveAndFlush(old);
                    claims.delete(previous);
                    claims.flush();
                } else {
                    throw new ConflictException("Ghế đã được giữ hoặc đã bán");
                }
            }
            // Legacy tickets made before the claims table existed are also considered.
            for (Ticket legacy : tickets.findByShowtimeIdAndSeatId(showtimeId, seatId)) {
                if (legacy.getStatus() == TicketStatus.PAID
                        || (legacy.getStatus() == TicketStatus.PENDING
                            && (legacy.getExpiresAt() == null || TicketRules.holdValid(legacy.getExpiresAt(), now())))) {
                    throw new ConflictException("Ghế đã được giữ hoặc đã bán");
                }
            }
            BigDecimal finalPriceBD = TicketRules.calculatePriceBigDecimal(
                    BigDecimal.valueOf(showtime.getBasePrice()), seat.getSeatType(), getVipSurcharge(), getSweetboxSurcharge());

            Ticket ticket = new Ticket();
            ticket.setUserId(userId);
            ticket.setShowtimeId(showtimeId);
            ticket.setSeatId(seatId);
            ticket.setFinalPrice(finalPriceBD.doubleValue());
            ticket.setStatus(TicketStatus.PENDING);
            ticket.setCreatedAt(now());
            ticket.setExpiresAt(now().plusSeconds(holdSeconds));
            ticket.setLockToken(token);
            ticket.setIdempotencyKey(idempotencyKey);
            Ticket saved = tickets.saveAndFlush(ticket);
            claims.saveAndFlush(new SeatClaim(showtimeId, seatId, saved.getId()));

            if (TransactionSynchronizationManager.isSynchronizationActive()) {
                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                    @Override public void afterCommit() {
                        publishEvent(saved, BookingEvent.TYPE_TICKET_HELD, "Giữ ghế thành công, thanh toán trước thời hạn");
                    }
                });
            }
            return new BookingResult(saved, false);
        } catch (DataIntegrityViolationException e) {
            releaseLock(showtimeId, seatId, token);
            throw new ConflictException(idempotencyKey != null
                    ? "Yêu cầu đang được xử lý hoặc ghế vừa được đặt, vui lòng thử lại"
                    : "Ghế vừa được người khác đặt");
        } catch (RuntimeException e) {
            releaseLock(showtimeId, seatId, token);
            throw e;
        }
    }

    // ==========================================
    // 2. ĐẶT NHIỀU GHẾ NGUYÊN TỬ (BATCH ATOMIC BOOKING)
    // ==========================================
    @Transactional
    public BatchBookingResult createBatchTickets(Long userId, Long showtimeId, List<Long> seatIdsRaw, String idempotencyKeyRaw) {
        if (userId == null || showtimeId == null || seatIdsRaw == null) {
            throw new IllegalArgumentException("userId, showtimeId và seatIds là bắt buộc");
        }
        List<Long> seatIds = TicketRules.normalizeSeatBatch(seatIdsRaw);
        String idempotencyKey = TicketRules.normalizeIdempotencyKey(idempotencyKeyRaw);

        // Kiểm tra Idempotency cho lô ghế
        if (idempotencyKey != null) {
            List<Ticket> previous = tickets.findByUserIdAndIdempotencyKeyStartingWith(userId, idempotencyKey + ":");
            if (!previous.isEmpty()) {
                List<Long> prevSeatIds = previous.stream().map(Ticket::getSeatId).sorted().toList();
                if (!prevSeatIds.equals(seatIds) || !previous.get(0).getShowtimeId().equals(showtimeId)) {
                    throw new ConflictException("Idempotency-Key này đã được dùng cho một yêu cầu đặt vé khác");
                }
                return new BatchBookingResult(previous, true);
            }
        }

        ShowtimeInfo showtime = showtimes.getShowtime(showtimeId);
        if ("CLOSED".equalsIgnoreCase(showtime.getStatus())) {
            throw new ConflictException("Suất chiếu đã đóng");
        }
        if (showtime.getShowDate() == null || showtime.getStartTime() == null
                || !TicketRules.isShowtimeBookable(showtime.getShowDate().atTime(showtime.getStartTime()), now())) {
            throw new ConflictException("Suất chiếu đã bắt đầu hoặc không hợp lệ");
        }
        if (showtime.getBasePrice() == null) throw new IllegalArgumentException("Suất chiếu chưa có giá");

        // Xác thực từng ghế trước khi giữ
        List<SeatInfo> seatInfoList = new ArrayList<>();
        for (Long seatId : seatIds) {
            SeatInfo seat = seats.getSeat(seatId);
            if (!TicketRules.seatBelongsToRoom(seat.getRoomId(), showtime.getRoomId())) {
                throw new IllegalArgumentException("Ghế #" + seatId + " không thuộc phòng chiếu của suất này");
            }
            if (!TicketRules.seatSellable(seat.getStatus())) {
                throw new ConflictException("Ghế " + (seat.getSeatName() != null ? seat.getSeatName() : ("#" + seatId)) + " đang bị khóa hoặc bảo trì");
            }
            seatInfoList.add(seat);
        }

        // Khóa tất cả ghế cùng lúc bằng Redis Lua Script (All-or-Nothing)
        String token = UUID.randomUUID().toString();
        if (!lockSeatBatch(showtimeId, seatIds, token)) {
            throw new ConflictException("Một hoặc nhiều ghế đang được người khác giữ, vui lòng chọn lại");
        }

        try {
            List<Ticket> newTickets = new ArrayList<>();
            List<SeatClaim> newClaims = new ArrayList<>();

            for (int i = 0; i < seatIds.size(); i++) {
                Long seatId = seatIds.get(i);
                SeatInfo seat = seatInfoList.get(i);

                String claimKey = SeatClaim.key(showtimeId, seatId);
                SeatClaim previous = claims.findById(claimKey).orElse(null);
                if (previous != null) {
                    Ticket old = tickets.findByIdForUpdate(previous.getTicketId()).orElse(null);
                    if (old != null && old.getStatus() == TicketStatus.PENDING
                            && !TicketRules.holdValid(old.getExpiresAt(), now())) {
                        old.setStatus(TicketStatus.EXPIRED);
                        tickets.saveAndFlush(old);
                        claims.delete(previous);
                        claims.flush();
                    } else {
                        throw new ConflictException("Ghế #" + seatId + " đã được giữ hoặc đã bán");
                    }
                }

                for (Ticket legacy : tickets.findByShowtimeIdAndSeatId(showtimeId, seatId)) {
                    if (legacy.getStatus() == TicketStatus.PAID
                            || (legacy.getStatus() == TicketStatus.PENDING
                                && (legacy.getExpiresAt() == null || TicketRules.holdValid(legacy.getExpiresAt(), now())))) {
                        throw new ConflictException("Ghế #" + seatId + " đã được giữ hoặc đã bán");
                    }
                }

                BigDecimal calculatedPrice = TicketRules.calculatePriceBigDecimal(
                        BigDecimal.valueOf(showtime.getBasePrice()), seat.getSeatType(), getVipSurcharge(), getSweetboxSurcharge());

                Ticket ticket = new Ticket();
                ticket.setUserId(userId);
                ticket.setShowtimeId(showtimeId);
                ticket.setSeatId(seatId);
                ticket.setFinalPrice(calculatedPrice.doubleValue());
                ticket.setStatus(TicketStatus.PENDING);
                ticket.setCreatedAt(now());
                ticket.setExpiresAt(now().plusSeconds(holdSeconds));
                ticket.setLockToken(token);
                ticket.setIdempotencyKey(idempotencyKey != null ? (idempotencyKey + ":" + seatId) : null);
                newTickets.add(ticket);
            }

            List<Ticket> savedTickets = tickets.saveAllAndFlush(newTickets);
            for (Ticket t : savedTickets) {
                newClaims.add(new SeatClaim(showtimeId, t.getSeatId(), t.getId()));
            }
            claims.saveAllAndFlush(newClaims);

            if (TransactionSynchronizationManager.isSynchronizationActive()) {
                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                    @Override public void afterCommit() {
                        for (Ticket t : savedTickets) {
                            publishEvent(t, BookingEvent.TYPE_TICKET_HELD, "Giữ ghế thành công trong đơn lô");
                        }
                    }
                });
            }

            return new BatchBookingResult(savedTickets, false);
        } catch (DataIntegrityViolationException e) {
            releaseBatchLock(showtimeId, seatIds, token);
            throw new ConflictException("Ghế vừa được người khác đặt hoặc đơn đang được xử lý, vui lòng thử lại");
        } catch (RuntimeException e) {
            releaseBatchLock(showtimeId, seatIds, token);
            throw e;
        }
    }

    // ==========================================
    // 3. SƠ ĐỒ GHẾ SUẤT CHIẾU (SHOWTIME SEAT MAP)
    // ==========================================
    public List<ShowtimeSeatStatus> getShowtimeSeatStatuses(Long showtimeId) {
        if (showtimeId == null || showtimeId <= 0) {
            throw new IllegalArgumentException("showtimeId không hợp lệ");
        }
        ShowtimeInfo showtime = showtimes.getShowtime(showtimeId);
        List<SeatInfo> physicalSeats = seats.getSeatsByRoom(showtime.getRoomId());
        List<Ticket> showtimeTickets = tickets.findByShowtimeId(showtimeId);

        LocalDateTime current = now();
        Set<Long> soldSeatIds = new HashSet<>();
        Set<Long> heldSeatIds = new HashSet<>();

        for (Ticket t : showtimeTickets) {
            if (t.getStatus() == TicketStatus.PAID) {
                soldSeatIds.add(t.getSeatId());
            } else if (t.getStatus() == TicketStatus.PENDING && TicketRules.holdValid(t.getExpiresAt(), current)) {
                heldSeatIds.add(t.getSeatId());
            }
        }

        BigDecimal basePrice = showtime.getBasePrice() != null
                ? BigDecimal.valueOf(showtime.getBasePrice()) : BigDecimal.ZERO;

        List<ShowtimeSeatStatus> result = new ArrayList<>();
        for (SeatInfo s : physicalSeats) {
            String status;
            if (soldSeatIds.contains(s.getId())) {
                status = "SOLD";
            } else if (heldSeatIds.contains(s.getId())) {
                status = "HELD";
            } else if (!TicketRules.seatSellable(s.getStatus())) {
                status = "MAINTENANCE";
            } else {
                status = "AVAILABLE";
            }

            BigDecimal seatPrice = TicketRules.calculatePriceBigDecimal(
                    basePrice, s.getSeatType(), getVipSurcharge(), getSweetboxSurcharge());

            result.add(new ShowtimeSeatStatus(
                    s.getId(),
                    s.getSeatName(),
                    s.getSeatType(),
                    status,
                    seatPrice
            ));
        }

        return result;
    }

    // ==========================================
    // 4. THANH TOÁN & HỦY VÉ
    // ==========================================
    @Transactional
    public Ticket payTicket(Long id, Long requesterId, boolean admin) {
        Ticket ticket = lockedTicket(id);
        assertOwner(ticket, requesterId, admin);
        if (ticket.getStatus() != TicketStatus.PENDING) throw new ConflictException("Vé không ở trạng thái PENDING");
        if (!TicketRules.holdValid(ticket.getExpiresAt(), now())) {
            throw new GoneException("Vé đã hết thời gian giữ ghế");
        }
        ShowtimeInfo showtime = showtimes.getShowtime(ticket.getShowtimeId());
        if ("CLOSED".equalsIgnoreCase(showtime.getStatus())
                || showtime.getShowDate() == null || showtime.getStartTime() == null
                || !TicketRules.isShowtimeBookable(
                        showtime.getShowDate().atTime(showtime.getStartTime()), now())) {
            throw new ConflictException("Suất chiếu đã đóng hoặc bắt đầu");
        }
        String token = redis.opsForValue().get(lockKey(ticket.getShowtimeId(), ticket.getSeatId()));
        if (token == null || !token.equals(ticket.getLockToken())) {
            throw new GoneException("Khóa giữ ghế không còn hiệu lực");
        }
        SeatClaim claim = claims.findById(SeatClaim.key(ticket.getShowtimeId(), ticket.getSeatId()))
                .orElseThrow(() -> new ConflictException("Không tìm thấy quyền giữ ghế trong SQL"));
        if (!ticket.getId().equals(claim.getTicketId())) throw new ConflictException("Ghế thuộc đơn khác");
        ticket.setStatus(TicketStatus.PAID);
        ticket.setPaidAt(now());
        Ticket saved = tickets.saveAndFlush(ticket);
        releaseAfterCommit(saved); // SeatClaim retained forever for PAID ticket.

        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override public void afterCommit() {
                    publishEvent(saved, BookingEvent.TYPE_TICKET_PAID, "Thanh toán thành công vé xem phim");
                }
            });
        } else {
            publishEvent(saved, BookingEvent.TYPE_TICKET_PAID, "Thanh toán thành công vé xem phim");
        }

        return saved;
    }

    @Transactional
    public Ticket cancelTicket(Long id, Long requesterId, boolean admin) {
        Ticket ticket = lockedTicket(id);
        assertOwner(ticket, requesterId, admin);
        if (ticket.getStatus() != TicketStatus.PENDING) throw new ConflictException("Chỉ có thể hủy vé PENDING");
        ticket.setStatus(TicketStatus.CANCELLED);
        releaseClaim(ticket);
        Ticket saved = tickets.saveAndFlush(ticket);
        releaseAfterCommit(saved);

        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override public void afterCommit() {
                    publishEvent(saved, BookingEvent.TYPE_TICKET_CANCELLED, "Hủy giữ chỗ thành công");
                }
            });
        } else {
            publishEvent(saved, BookingEvent.TYPE_TICKET_CANCELLED, "Hủy giữ chỗ thành công");
        }

        return saved;
    }

    private void expire(Ticket ticket) {
        if (ticket.getStatus() == TicketStatus.PENDING) {
            ticket.setStatus(TicketStatus.EXPIRED);
            releaseClaim(ticket);
            tickets.saveAndFlush(ticket);
            releaseAfterCommit(ticket);
        }
    }

    private void releaseClaim(Ticket ticket) {
        String key = SeatClaim.key(ticket.getShowtimeId(), ticket.getSeatId());
        claims.findById(key).ifPresent(existing -> {
            if (ticket.getId().equals(existing.getTicketId())) {
                claims.delete(existing);
                claims.flush();
            }
        });
    }

    private Ticket lockedTicket(Long id) {
        return tickets.findByIdForUpdate(id)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy vé"));
    }

    private void assertOwner(Ticket ticket, Long userId, boolean admin) {
        if (!admin && !ticket.getUserId().equals(userId)) {
            throw new org.springframework.security.access.AccessDeniedException("Không có quyền với vé này");
        }
    }

    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void expirePendingTickets() {
        for (Ticket pending : tickets.findByStatusAndExpiresAtBefore(TicketStatus.PENDING, now())) {
            tickets.findByIdForUpdate(pending.getId()).ifPresent(ticket -> {
                if (ticket.getStatus() == TicketStatus.PENDING
                        && !TicketRules.holdValid(ticket.getExpiresAt(), now())) expire(ticket);
            });
        }
    }

    private void publishEvent(Ticket ticket, String eventType, String message) {
        try {
            BookingEvent event = new BookingEvent(
                    eventType,
                    ticket.getId(),
                    ticket.getUserId(),
                    ticket.getShowtimeId(),
                    ticket.getSeatId(),
                    ticket.getFinalPrice(),
                    message
            );
            producer.sendBookingEvent(event);
        } catch (Exception e) {
            log.warn("Không gửi được thông báo vé #{}: {}", ticket.getId(), e.toString());
        }
    }

    public List<Ticket> getTicketsByUserId(Long userId) { return tickets.findByUserId(userId); }
    public List<Ticket> getAllTickets() { return tickets.findAll(); }
    public Ticket getTicketById(Long id) {
        return tickets.findById(id).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy vé"));
    }

    public List<Long> getOccupiedSeatIdsByShowtime(Long showtimeId) {
        if (showtimeId == null || showtimeId <= 0) {
            return List.of();
        }
        LocalDateTime current = now();
        return tickets.findByShowtimeId(showtimeId).stream()
                .filter(t -> t.getStatus() == TicketStatus.PAID
                        || (t.getStatus() == TicketStatus.PENDING && TicketRules.holdValid(t.getExpiresAt(), current)))
                .map(Ticket::getSeatId)
                .distinct()
                .toList();
    }

    @Transactional
    public Ticket updateTicketStatus(Long id, TicketStatus newStatus) {
        if (newStatus != TicketStatus.CANCELLED) {
            throw new ConflictException("Không thể đặt PAID trực tiếp; hãy dùng luồng thanh toán");
        }
        Ticket ticket = lockedTicket(id);
        return cancelTicket(id, ticket.getUserId(), true);
    }

    @Transactional
    public void deleteTicket(Long id) {
        Ticket ticket = lockedTicket(id);
        if (ticket.getStatus() == TicketStatus.PAID || ticket.getStatus() == TicketStatus.PENDING) {
            throw new ConflictException("Không xóa vé PAID/PENDING; chỉ xóa vé đã hủy hoặc hết hạn");
        }
        tickets.delete(ticket);
    }
}
