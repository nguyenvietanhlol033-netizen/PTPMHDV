package com.cinema.booking.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

public final class TicketRules {
    public static final BigDecimal DEFAULT_VIP_SURCHARGE = new BigDecimal("20000.00");
    public static final BigDecimal DEFAULT_SWEETBOX_SURCHARGE = new BigDecimal("50000.00");

    private TicketRules() {}

    public static boolean isShowtimeBookable(LocalDateTime showStart, LocalDateTime now) {
        return showStart != null && showStart.isAfter(now);
    }
    public static boolean seatBelongsToRoom(Long seatRoomId, Long showtimeRoomId) {
        return seatRoomId != null && Objects.equals(seatRoomId, showtimeRoomId);
    }
    public static boolean holdValid(LocalDateTime expiresAt, LocalDateTime now) {
        return expiresAt != null && expiresAt.isAfter(now);
    }
    public static double calculatePrice(double basePrice, String seatType) {
        if (!Double.isFinite(basePrice) || basePrice <= 0) throw new IllegalArgumentException("Base price must be positive");
        return calculatePriceBigDecimal(BigDecimal.valueOf(basePrice), seatType).doubleValue();
    }

    /** Chuẩn hóa tính toán tiền tệ bằng BigDecimal với RoundingMode.HALF_UP (2 chữ số thập phân). */
    public static BigDecimal calculatePriceBigDecimal(BigDecimal basePrice, String seatType,
                                                      BigDecimal vipSurcharge, BigDecimal sweetboxSurcharge) {
        if (basePrice == null || basePrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Base price must be positive");
        }
        BigDecimal vip = vipSurcharge != null ? vipSurcharge : DEFAULT_VIP_SURCHARGE;
        BigDecimal sweetbox = sweetboxSurcharge != null ? sweetboxSurcharge : DEFAULT_SWEETBOX_SURCHARGE;

        BigDecimal finalPrice = switch (seatType == null ? "" : seatType.trim().toUpperCase()) {
            case "VIP" -> basePrice.add(vip);
            case "SWEETBOX" -> basePrice.add(sweetbox);
            default -> basePrice;
        };
        return finalPrice.setScale(2, RoundingMode.HALF_UP);
    }

    public static BigDecimal calculatePriceBigDecimal(BigDecimal basePrice, String seatType) {
        return calculatePriceBigDecimal(basePrice, seatType, DEFAULT_VIP_SURCHARGE, DEFAULT_SWEETBOX_SURCHARGE);
    }

    /** Sắp xếp ID ghế chống Deadlock & Kiểm tra tính hợp lệ của lô ghế. */
    public static List<Long> normalizeSeatBatch(List<Long> seatIds) {
        if (seatIds == null || seatIds.isEmpty()) {
            throw new IllegalArgumentException("Danh sách ghế không được để trống");
        }
        if (seatIds.size() > 10) {
            throw new IllegalArgumentException("Mỗi lần đặt tối đa 10 ghế");
        }
        for (Long id : seatIds) {
            if (id == null || id <= 0) {
                throw new IllegalArgumentException("ID ghế không hợp lệ: " + id);
            }
        }
        // Loại bỏ ID trùng lặp và sắp xếp tăng dần để chống deadlock khi lock nhiều resource
        return seatIds.stream().distinct().sorted().toList();
    }

    /** Ghế chỉ bán được khi trạng thái AVAILABLE (null coi như AVAILABLE cho dữ liệu cũ). */
    public static boolean seatSellable(String seatStatus) {
        return seatStatus == null || seatStatus.isBlank() || "AVAILABLE".equalsIgnoreCase(seatStatus);
    }

    /**
     * Chuẩn hoá header Idempotency-Key. Trả null nếu không gửi; ném IllegalArgumentException nếu sai định dạng
     * (1-100 ký tự gồm chữ, số, '-', '_', '.', ':').
     */
    public static String normalizeIdempotencyKey(String raw) {
        if (raw == null || raw.isBlank()) return null;
        String key = raw.trim();
        if (key.length() > 100 || !key.matches("[A-Za-z0-9_.:\\-]+")) {
            throw new IllegalArgumentException(
                    "Idempotency-Key chỉ gồm chữ, số, - _ . : và tối đa 100 ký tự");
        }
        return key;
    }
}
