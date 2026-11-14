package com.cinema.booking.dto;

import java.math.BigDecimal;

public class ShowtimeSeatStatus {
    private Long seatId;
    private String seatName;
    private String seatType;
    private String status; // AVAILABLE, HELD, SOLD, MAINTENANCE
    private BigDecimal price;

    public ShowtimeSeatStatus() {}

    public ShowtimeSeatStatus(Long seatId, String seatName, String seatType, String status, BigDecimal price) {
        this.seatId = seatId;
        this.seatName = seatName;
        this.seatType = seatType;
        this.status = status;
        this.price = price;
    }

    public Long getSeatId() { return seatId; }
    public void setSeatId(Long seatId) { this.seatId = seatId; }
    public String getSeatName() { return seatName; }
    public void setSeatName(String seatName) { this.seatName = seatName; }
    public String getSeatType() { return seatType; }
    public void setSeatType(String seatType) { this.seatType = seatType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
}
