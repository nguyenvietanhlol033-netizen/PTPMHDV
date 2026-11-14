package com.cinema.booking.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.List;

public class BatchTicketRequest {
    @NotNull(message = "showtimeId không được để trống")
    @Positive(message = "showtimeId phải là số dương")
    private Long showtimeId;

    @NotEmpty(message = "Danh sách ghế không được để trống")
    @Size(max = 10, message = "Chỉ được đặt tối đa 10 ghế trong một đơn")
    private List<Long> seatIds;

    public BatchTicketRequest() {}

    public BatchTicketRequest(Long showtimeId, List<Long> seatIds) {
        this.showtimeId = showtimeId;
        this.seatIds = seatIds;
    }

    public Long getShowtimeId() { return showtimeId; }
    public void setShowtimeId(Long showtimeId) { this.showtimeId = showtimeId; }
    public List<Long> getSeatIds() { return seatIds; }
    public void setSeatIds(List<Long> seatIds) { this.seatIds = seatIds; }
}
