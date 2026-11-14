package com.cinema.notification.consumer;

import com.cinema.common.messaging.BookingEvent;
import com.cinema.common.messaging.MessagingConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
public class NotificationConsumer {

    private static final Logger log = LoggerFactory.getLogger(NotificationConsumer.class);

    // Lắng nghe thông điệp từ Queue và phân loại theo eventType
    @RabbitListener(queues = MessagingConstants.QUEUE_NAME)
    public void handleBookingNotification(BookingEvent event) {
        String eventType = event.getEventType() != null ? event.getEventType() : BookingEvent.TYPE_TICKET_HELD;

        switch (eventType) {
            case BookingEvent.TYPE_TICKET_PAID -> {
                log.info("=================================================");
                log.info("[NOTIFICATION - E-TICKET] XÁC NHẬN THANH TOÁN THÀNH CÔNG");
                log.info("-> Gửi Vé Điện Tử (E-Ticket) đến User #{}: Vé #{}, Ghế #{}, Suất chiếu #{}, Số tiền: {} đ",
                        event.getUserId(), event.getTicketId(), event.getSeatId(), event.getShowtimeId(), (long) event.getFinalPrice());
                log.info("-> Nội dung: Quý khách vui lòng quét mã QR vé tại rạp để vào xem phim!");
                log.info("=================================================");
            }
            case BookingEvent.TYPE_TICKET_CANCELLED -> {
                log.info("[NOTIFICATION - CANCEL] HỦY VÉ / GIẢI PHÓNG GHẾ: Vé #{}, Ghế #{}, Suất chiếu #{}. Lý do: {}",
                        event.getTicketId(), event.getSeatId(), event.getShowtimeId(), event.getMessage());
            }
            case BookingEvent.TYPE_TICKET_HELD -> {
                log.info("[NOTIFICATION - HOLD] GIỮ GHẾ TẠM THỜI: Vé #{} cho User #{}, Ghế #{}, Hết hạn sau 10 phút",
                        event.getTicketId(), event.getUserId(), event.getSeatId());
            }
            default -> {
                log.info("[NOTIFICATION] Sự kiện khác: [{}] Vé #{}, Nội dung: {}",
                        eventType, event.getTicketId(), event.getMessage());
            }
        }
    }
}
