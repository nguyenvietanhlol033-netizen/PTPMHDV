package com.cinema.booking.service;

import com.cinema.common.client.RetryExecutor;
import com.cinema.common.messaging.BookingEvent;
import com.cinema.common.messaging.MessagingConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class BookingProducer {
    private static final Logger log = LoggerFactory.getLogger(BookingProducer.class);

    private final RabbitTemplate rabbitTemplate;

    public BookingProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendBookingEvent(BookingEvent event) {
        try {
            RetryExecutor.execute(() -> {
                rabbitTemplate.convertAndSend(
                    MessagingConstants.EXCHANGE_NAME,
                    MessagingConstants.ROUTING_KEY,
                    event
                );
                return Boolean.TRUE;
            },
            e -> e instanceof AmqpException,
            3, 200,
            last -> {
                log.error("[BOOKING PRODUCER] Thất bại gửi sự kiện RabbitMQ sau 3 lần thử cho vé #{}: {}",
                        event.getTicketId(), last.getMessage());
                return Boolean.FALSE;
            });
            log.info("[BOOKING PRODUCER] Đã bắn sự kiện [{}] cho vé #{}", event.getEventType(), event.getTicketId());
        } catch (Exception e) {
            log.warn("[BOOKING PRODUCER] Không thể gửi sự kiện RabbitMQ cho vé #{}: {}", event.getTicketId(), e.getMessage());
        }
    }
}
