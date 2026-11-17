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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PaymentServiceTest {

    private PaymentRepository paymentRepository;
    private TicketRepository ticketRepository;
    private FakeTicketService fakeTicketService;
    private PaymentService paymentService;

    static class FakeTicketService extends TicketService {
        List<Ticket> batchResult = new ArrayList<>();
        List<Long> capturedBatchIds;

        public FakeTicketService() {
            super(null, null, null, null, null, null, 600, "Asia/Ho_Chi_Minh", BigDecimal.ZERO, BigDecimal.ZERO);
        }

        @Override
        public List<Ticket> payTicketsBatch(List<Long> ticketIds, Long requesterId, boolean admin) {
            this.capturedBatchIds = ticketIds;
            return batchResult;
        }
    }

    @BeforeEach
    void setUp() {
        paymentRepository = mock(PaymentRepository.class);
        ticketRepository = mock(TicketRepository.class);
        fakeTicketService = new FakeTicketService();
        paymentService = new PaymentService(paymentRepository, ticketRepository, fakeTicketService);
    }

    private Ticket createDummyTicket(Long id, Long userId, double price, TicketStatus status) {
        Ticket t = new Ticket();
        t.setId(id);
        t.setUserId(userId);
        t.setShowtimeId(1L);
        t.setSeatId(10L + id);
        t.setFinalPrice(price);
        t.setStatus(status);
        t.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        return t;
    }

    @Test
    void createPayment_Success() {
        Long userId = 100L;
        Ticket t1 = createDummyTicket(1L, userId, 100_000, TicketStatus.PENDING);
        Ticket t2 = createDummyTicket(2L, userId, 120_000, TicketStatus.PENDING);

        when(ticketRepository.findAllById(List.of(1L, 2L))).thenReturn(List.of(t1, t2));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> {
            Payment p = inv.getArgument(0);
            p.setId(99L);
            return p;
        });

        PaymentCreateRequest req = new PaymentCreateRequest(List.of(1L, 2L), "VIETQR");
        PaymentResponse response = paymentService.createPayment(userId, req);

        assertNotNull(response);
        assertEquals(99L, response.getId());
        assertEquals(PaymentStatus.PENDING, response.getStatus());
        assertEquals(new BigDecimal("220000.00"), response.getAmount());
        assertTrue(response.getTransactionCode().startsWith("PAY"));
        assertTrue(response.getQrUrl().contains("img.vietqr.io"));
        verify(paymentRepository, times(1)).save(any(Payment.class));
    }

    @Test
    void createPayment_RejectsNonOwnerTicket() {
        Long userId = 100L;
        Ticket t1 = createDummyTicket(1L, 999L, 100_000, TicketStatus.PENDING);

        when(ticketRepository.findAllById(List.of(1L))).thenReturn(List.of(t1));

        PaymentCreateRequest req = new PaymentCreateRequest(List.of(1L), "VIETQR");
        assertThrows(AccessDeniedException.class, () -> paymentService.createPayment(userId, req));
    }

    @Test
    void createPayment_RejectsNonPendingTicket() {
        Long userId = 100L;
        Ticket t1 = createDummyTicket(1L, userId, 100_000, TicketStatus.PAID);

        when(ticketRepository.findAllById(List.of(1L))).thenReturn(List.of(t1));

        PaymentCreateRequest req = new PaymentCreateRequest(List.of(1L), "VIETQR");
        assertThrows(ConflictException.class, () -> paymentService.createPayment(userId, req));
    }

    @Test
    void createPayment_RejectsExpiredTicket() {
        Long userId = 100L;
        Ticket t1 = createDummyTicket(1L, userId, 100_000, TicketStatus.PENDING);
        t1.setExpiresAt(LocalDateTime.now().minusMinutes(1)); // Expired

        when(ticketRepository.findAllById(List.of(1L))).thenReturn(List.of(t1));

        PaymentCreateRequest req = new PaymentCreateRequest(List.of(1L), "VIETQR");
        assertThrows(GoneException.class, () -> paymentService.createPayment(userId, req));
    }

    @Test
    void processMockPayment_Success() {
        Long userId = 100L;
        Payment payment = new Payment();
        payment.setId(50L);
        payment.setUserId(userId);
        payment.setTransactionCode("PAY-12345");
        payment.setAmount(BigDecimal.valueOf(150_000));
        payment.setPaymentMethod("MOCK_TEST");
        payment.setStatus(PaymentStatus.PENDING);
        payment.setTicketIds("1,2");

        Ticket t1 = createDummyTicket(1L, userId, 75_000, TicketStatus.PAID);
        Ticket t2 = createDummyTicket(2L, userId, 75_000, TicketStatus.PAID);

        when(paymentRepository.findById(50L)).thenReturn(Optional.of(payment));
        fakeTicketService.batchResult = List.of(t1, t2);
        when(paymentRepository.saveAndFlush(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        PaymentResponse response = paymentService.processMockPayment(50L, userId, false);

        assertEquals(PaymentStatus.SUCCESS, response.getStatus());
        assertNotNull(response.getPaidAt());
        assertEquals(List.of(1L, 2L), fakeTicketService.capturedBatchIds);
    }
}
