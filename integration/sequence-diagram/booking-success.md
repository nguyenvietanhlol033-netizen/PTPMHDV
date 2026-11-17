# SƠ ĐỒ TUẦN TỰ: ĐẶT VÉ NGUYÊN TỬ THÀNH CÔNG (HAPPY PATH)
## BÀI THỰC HÀNH SỐ 6 - TÍCH HỢP VÀ TIÊU THỤ DỊCH VỤ

Sơ đồ thể hiện quy trình tích hợp giữa Client, API Gateway, Booking Service (Consumer), Movie Service (Provider), Venue Service (Provider), Redis Cache, MySQL và RabbitMQ trong kịch bản đặt vé thành công.

---

## 1. Sơ đồ Mermaid (Sequence Diagram)

```mermaid
sequenceDiagram
    autonumber
    actor Client as Khách Hàng (SPA Frontend)
    participant Gateway as API Gateway (:8080)
    participant Booking as Booking Service (:8084)<br/>[Consumer]
    participant Movie as Movie Service (:8082)<br/>[Provider]
    participant Venue as Venue Service (:8083)<br/>[Provider]
    participant Redis as Redis Server (:6379)<br/>[Distributed Lock]
    participant MySQL as MySQL Database (:3307)
    participant Rabbit as RabbitMQ (:5672)<br/>[Event Broker]
    participant Notif as Notification Service (:8085)<br/>[Async Consumer]

    Client->>Gateway: POST /api/v1/tickets/batch<br/>[Header: Idempotency-Key, Bearer Token]<br/>{showtimeId: 260, seatIds: [1, 21]}
    Gateway->>Booking: Chuyển tiếp Request đã xác thực JWT

    Note over Booking: Bước 1: Tiêu thụ Movie Service
    Booking->>Movie: GET /api/v1/showtimes/260 (qua ShowtimeClient)
    Movie-->>Booking: 200 OK {id: 260, price: 100000, status: OPEN}

    Note over Booking: Bước 2: Tiêu thụ Venue Service
    loop Cho từng ghế trong danh sách
        Booking->>Venue: GET /api/v1/seats/{seatId} (qua SeatClient)
        Venue-->>Booking: 200 OK {id: 1, type: NORMAL}, {id: 21, type: VIP}
    end

    Note over Booking: Bước 3: Tính toán giá bằng BigDecimal<br/>Ghế 1: 100k + Ghế 21: 100k + 20k = 220k

    Note over Booking: Bước 4: Khóa phân tán nguyên tử (All-or-Nothing)
    Booking->>Redis: EVALSHA LOCK_MULTI_SCRIPT (seatIds: [1, 21], ttl: 900s)
    Redis-->>Booking: 1 (Khóa thành công toàn bộ ghế)

    Note over Booking: Bước 5: Ghi dữ liệu vào CSDL
    Booking->>MySQL: BEGIN TRANSACTION
    Booking->>MySQL: INSERT INTO tickets (showtime_id, seat_id, user_id, price, status, idempotency_key)
    Booking->>MySQL: INSERT INTO seat_claims (showtime_id, seat_id, user_id, expires_at)
    Booking->>MySQL: COMMIT TRANSACTION

    Note over Booking: Bước 6: Phát sự kiện sau khi Commit
    Booking-)Rabbit: Publish TICKET_HELD -> Exchange 'booking.events'
    Rabbit-)Notif: Consume 'booking.held' (Ghi log chuẩn bị E-Ticket)

    Booking-->>Gateway: 201 Created [Danh sách vé vừa tạo]
    Gateway-->>Client: 201 Created (Hiển thị trang thanh toán và đồng hồ đếm ngược 15:00)
```

---

## 2. Diễn giải các bước nghiệp vụ

1. **Client** gửi yêu cầu đặt nhiều ghế trong 1 đơn hàng qua API Gateway kèm mã `Idempotency-Key` (UUID) để đảm bảo không bị trừ tiền 2 lần.
2. **Booking Service (Consumer)** đóng vai trò trung tâm điều phối, lần lượt gọi:
   - `ShowtimeClient` gọi sang `Movie Service` để xác thực suất chiếu còn mở bán và lấy giá vé cơ bản (100.000 ₫).
   - `SeatClient` gọi sang `Venue Service` để lấy loại ghế (Ghế #1 là Ghế Thường, Ghế #21 là Ghế VIP).
3. **Tính toán tiền tệ:** Sử dụng `TicketRules.calculatePriceBigDecimal` áp dụng phụ thu VIP (+20.000 ₫), tổng thanh toán là 220.000 ₫ (loại bỏ sai số số thực).
4. **Khóa nguyên tử (Atomic Lock):** Sử dụng Redis Lua script để kiểm tra và giữ cả 2 ghế cùng lúc. Nếu 1 trong 2 ghế đã có người giữ thì không khóa ghế nào.
5. **Giao dịch SQL:** Lưu vé vào bảng `tickets` và bảng `seat_claims` với thời hạn giữ chỗ 15 phút.
6. **Bắn tin nhắn RabbitMQ:** Sử dụng `afterCommit()` để đảm bảo khi cơ sở dữ liệu đã commit an toàn thì sự kiện `TICKET_HELD` mới được phát sang RabbitMQ.
7. **Phản hồi:** Trả về HTTP `201 Created` cho người dùng kèm danh sách mã vé.
