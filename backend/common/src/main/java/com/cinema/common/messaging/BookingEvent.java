package com.cinema.common.messaging;

public class BookingEvent {
    public static final String TYPE_TICKET_HELD = "TICKET_HELD";
    public static final String TYPE_TICKET_PAID = "TICKET_PAID";
    public static final String TYPE_TICKET_CANCELLED = "TICKET_CANCELLED";

    private Long ticketId;
    private Long userId;
    private Long showtimeId;
    private Long seatId;
    private double finalPrice;
    private String eventType = TYPE_TICKET_HELD;
    private String message;

    public BookingEvent() {}

    public BookingEvent(String eventType, Long ticketId, Long userId, Long showtimeId, Long seatId, double finalPrice, String message) {
        this.eventType = eventType;
        this.ticketId = ticketId;
        this.userId = userId;
        this.showtimeId = showtimeId;
        this.seatId = seatId;
        this.finalPrice = finalPrice;
        this.message = message;
    }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    public Long getTicketId() { return ticketId; }
    public void setTicketId(Long ticketId) { this.ticketId = ticketId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getShowtimeId() { return showtimeId; }
    public void setShowtimeId(Long showtimeId) { this.showtimeId = showtimeId; }
    public Long getSeatId() { return seatId; }
    public void setSeatId(Long seatId) { this.seatId = seatId; }
    public double getFinalPrice() { return finalPrice; }
    public void setFinalPrice(double finalPrice) { this.finalPrice = finalPrice; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
