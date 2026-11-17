package com.cinema.booking.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class PaymentCreateRequest {
    @NotEmpty(message = "Danh sách vé không được để trống")
    private List<Long> ticketIds;

    private String paymentMethod = "MOCK_TEST";

    private String idempotencyKey;

    public PaymentCreateRequest() {}

    public PaymentCreateRequest(List<Long> ticketIds, String paymentMethod) {
        this.ticketIds = ticketIds;
        this.paymentMethod = paymentMethod;
    }

    public List<Long> getTicketIds() { return ticketIds; }
    public void setTicketIds(List<Long> ticketIds) { this.ticketIds = ticketIds; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
}
