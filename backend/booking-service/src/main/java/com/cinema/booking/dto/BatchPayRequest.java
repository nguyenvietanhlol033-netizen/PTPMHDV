package com.cinema.booking.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class BatchPayRequest {
    @NotEmpty(message = "Danh sách ID vé không được để trống")
    private List<Long> ticketIds;

    private String paymentMethod = "MOCK_TEST";

    public BatchPayRequest() {}

    public BatchPayRequest(List<Long> ticketIds) {
        this.ticketIds = ticketIds;
    }

    public List<Long> getTicketIds() { return ticketIds; }
    public void setTicketIds(List<Long> ticketIds) { this.ticketIds = ticketIds; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
}
