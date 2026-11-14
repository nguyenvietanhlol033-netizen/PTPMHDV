package com.cinema.booking.service;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

class TicketRulesTest {
    private final LocalDateTime now = LocalDateTime.of(2026, 10, 25, 12, 0);

    @Test void rejectsPastAndCurrentShows() {
        assertFalse(TicketRules.isShowtimeBookable(now.minusSeconds(1), now));
        assertFalse(TicketRules.isShowtimeBookable(now, now));
        assertTrue(TicketRules.isShowtimeBookable(now.plusSeconds(1), now));
    }
    @Test void checksSeatRoomAndHoldExpiry() {
        assertTrue(TicketRules.seatBelongsToRoom(10L, 10L));
        assertFalse(TicketRules.seatBelongsToRoom(10L, 20L));
        assertFalse(TicketRules.seatBelongsToRoom(null, 20L));
        assertFalse(TicketRules.holdValid(now, now));
        assertTrue(TicketRules.holdValid(now.plusSeconds(1), now));
    }
    @Test void handlesSurcharges() {
        assertEquals(80_000, TicketRules.calculatePrice(80_000, "STANDARD"));
        assertEquals(100_000, TicketRules.calculatePrice(80_000, "VIP"));
        assertEquals(130_000, TicketRules.calculatePrice(80_000, "SWEETBOX"));
        assertThrows(IllegalArgumentException.class, () -> TicketRules.calculatePrice(-1, "VIP"));
    }
    @Test void handlesBigDecimalSurchargesAndRounding() {
        // Standard (không phụ thu)
        assertEquals(new java.math.BigDecimal("80000.00"), TicketRules.calculatePriceBigDecimal(new java.math.BigDecimal("80000"), "STANDARD"));
        // VIP phụ thu mặc định +20.000,00
        assertEquals(new java.math.BigDecimal("100000.00"), TicketRules.calculatePriceBigDecimal(new java.math.BigDecimal("80000"), "VIP"));
        // SWEETBOX phụ thu mặc định +50.000,00
        assertEquals(new java.math.BigDecimal("130000.00"), TicketRules.calculatePriceBigDecimal(new java.math.BigDecimal("80000"), "SWEETBOX"));

        // Cấu hình phụ thu tùy chỉnh của Admin (VIP +25.000,00; SWEETBOX +60.000,00)
        java.math.BigDecimal customVip = new java.math.BigDecimal("25000.00");
        java.math.BigDecimal customSweetbox = new java.math.BigDecimal("60000.00");
        assertEquals(new java.math.BigDecimal("105000.00"), TicketRules.calculatePriceBigDecimal(new java.math.BigDecimal("80000"), "VIP", customVip, customSweetbox));
        assertEquals(new java.math.BigDecimal("140000.00"), TicketRules.calculatePriceBigDecimal(new java.math.BigDecimal("80000"), "SWEETBOX", customVip, customSweetbox));

        // Kiểm tra làm tròn RoundingMode.HALF_UP 2 chữ số thập phân
        assertEquals(new java.math.BigDecimal("85000.56"), TicketRules.calculatePriceBigDecimal(new java.math.BigDecimal("85000.555"), "STANDARD"));
        assertEquals(new java.math.BigDecimal("85000.55"), TicketRules.calculatePriceBigDecimal(new java.math.BigDecimal("85000.554"), "STANDARD"));

        // Lỗi khi basePrice âm hoặc null
        assertThrows(IllegalArgumentException.class, () -> TicketRules.calculatePriceBigDecimal(new java.math.BigDecimal("-1"), "VIP"));
        assertThrows(IllegalArgumentException.class, () -> TicketRules.calculatePriceBigDecimal(null, "VIP"));
    }
    @Test void seatStatusSellableOnlyWhenAvailable() {
        assertTrue(TicketRules.seatSellable(null));
        assertTrue(TicketRules.seatSellable("AVAILABLE"));
        assertFalse(TicketRules.seatSellable("HELD"));
        assertFalse(TicketRules.seatSellable("MAINTENANCE"));
    }
    @Test void validatesIdempotencyKey() {
        assertNull(TicketRules.normalizeIdempotencyKey(null));
        assertNull(TicketRules.normalizeIdempotencyKey("   "));
        assertEquals("order-123:a.b_c", TicketRules.normalizeIdempotencyKey("  order-123:a.b_c "));
        assertThrows(IllegalArgumentException.class, () -> TicketRules.normalizeIdempotencyKey("có dấu cách"));
        assertThrows(IllegalArgumentException.class, () -> TicketRules.normalizeIdempotencyKey("x".repeat(101)));
    }
}
