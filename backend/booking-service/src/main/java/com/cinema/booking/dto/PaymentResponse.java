package com.cinema.booking.dto;

import com.cinema.booking.model.PaymentStatus;
import com.cinema.booking.model.Ticket;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class PaymentResponse {
    private Long id;
    private String transactionCode;
    private Long userId;
    private BigDecimal amount;
    private String paymentMethod;
    private PaymentStatus status;
    private List<Long> ticketIds;
    private String qrUrl;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    private List<Ticket> tickets;

    public PaymentResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTransactionCode() { return transactionCode; }
    public void setTransactionCode(String transactionCode) { this.transactionCode = transactionCode; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }

    public List<Long> getTicketIds() { return ticketIds; }
    public void setTicketIds(List<Long> ticketIds) { this.ticketIds = ticketIds; }

    public String getQrUrl() { return qrUrl; }
    public void setQrUrl(String qrUrl) { this.qrUrl = qrUrl; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }

    public List<Ticket> getTickets() { return tickets; }
    public void setTickets(List<Ticket> tickets) { this.tickets = tickets; }
}
