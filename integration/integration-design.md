# TÀI LIỆU THIẾT KẾ TÍCH HỢP HỆ THỐNG MICROSERVICES (INTEGRATION DESIGN)
## BÀI THỰC HÀNH SỐ 6: TÍCH HỢP VÀ TIÊU THỤ DỊCH VỤ (SERVICE INTEGRATION AND CONSUMPTION)
**Hệ thống:** Cinema Microservices Management System (Aura Cinema)  
**Môn học:** Phát triển phần mềm hướng dịch vụ (PTPMHDV)  
**Thời gian:** Học kỳ I - Năm học 2026  

---

## 1. Tổng quan & Bối cảnh bài toán

Trong kiến trúc Microservices, mỗi dịch vụ sở hữu cơ sở dữ liệu riêng biệt (Database-per-Service) và chịu trách nhiệm cho một nghiệp vụ độc lập. Để thực hiện một quy trình nghiệp vụ phức tạp của rạp chiếu phim như **"Đặt vé xem phim hàng loạt" (Batch Ticket Booking)** hoặc **"Lập lịch suất chiếu" (Showtime Scheduling)**, các dịch vụ bắt buộc phải phối hợp, tích hợp và tiêu thụ dịch vụ của nhau.

Tài liệu này đặc tả kiến trúc tích hợp, vai trò của từng dịch vụ (Consumer / Provider), giao thức giao tiếp đồng bộ (HTTP/REST) và bất đồng bộ (AMQP/RabbitMQ), các chiến lược đảm bảo khả năng chịu lỗi (Resilience: Timeout, Retry, Fallback) và tính toàn vẹn dữ liệu (Idempotency, Distributed Lock).

---

## 2. Kiến trúc Tích hợp và Phân định Vai trò (Consumer - Provider)

Hệ thống bao gồm các dịch vụ cốt lõi sau:

```
[ Client / SPA Frontend (Port 3000) ]
                 │
                 ▼ (HTTP REST)
┌─────────────────────────────────────────────────────────────┐
│             API GATEWAY (Spring Cloud Gateway : 8080)       │
└───────────────────────┬─────────────────────────────────────┘
                        │
         ┌──────────────┼──────────────┬──────────────┐
         ▼              ▼              ▼              ▼
  [user-service] [movie-service] [venue-service] [booking-service]
     (:8081)        (:8082)         (:8083)         (:8084)
                        │              ▲              │
                        │ (HTTP REST)  │ (HTTP REST)  │
                        └──────────────┴──────────────┘
                                                      │
                                                      ▼ (AMQP Events)
                                              [RabbitMQ Broker]
                                                      │
                                                      ▼ (AMQP Consumer)
                                            [notification-service]
                                                   (:8085)
```

### 2.1. Ma trận Vai trò Consumer - Provider

| STT | Luồng nghiệp vụ | Dịch vụ gọi (Consumer) | Dịch vụ được gọi (Provider) | Giao thức | Lớp triển khai (Client) | Mục đích nghiệp vụ |
|:---:|:---|:---|:---|:---:|:---|:---|
| **1** | Xác thực Suất chiếu | `booking-service` | `movie-service` | HTTP / REST | `ShowtimeClient.java` | Lấy thông tin suất chiếu, kiểm tra phim, thời gian chiếu và giá vé gốc. |
| **2** | Lấy Sơ đồ ghế & Ghế đơn | `booking-service` | `venue-service` | HTTP / REST | `SeatClient.java` | Kiểm tra phòng chiếu, danh sách ghế, loại ghế (VIP, SWEETBOX, NORMAL) để tính phụ thu. |
| **3** | Xác thực Phòng chiếu | `movie-service` | `venue-service` | HTTP / REST | `VenueClient.java` | Kiểm tra phòng chiếu (`roomId`) có tồn tại và hợp lệ trước khi tạo hoặc cập nhật lịch chiếu. |
| **4** | Phát thông báo / Vé điện tử | `booking-service` (Producer) | `notification-service` (Consumer) | AMQP / RabbitMQ | `BookingProducer.java` & `NotificationConsumer.java` | Xử lý bất đồng bộ việc gửi vé điện tử (E-Ticket) khi khách giữ vé, thanh toán hoặc hủy vé. |

---

## 3. Cơ chế Giao tiếp & Công nghệ Sử dụng

### 3.1. Giao tiếp Đồng bộ (Synchronous HTTP/REST)
- **Công nghệ Consumer:** Sử dụng `RestClient` (Spring Framework 6 / Spring Boot 3.2.x) kết hợp với `SimpleClientHttpRequestFactory` để tùy biến tầng kết nối mạng.
- **Dữ liệu trao đổi:** Định dạng chuẩn `application/json;charset=UTF-8`.
- **Cơ chế gọi tập trung:** Tất cả các cuộc gọi liên dịch vụ (Service-to-Service) được bọc qua lớp tiện ích `RemoteCaller.java` để đảm bảo chuẩn hóa Timeout, Retry và Fallback.

### 3.2. Giao tiếp Bất đồng bộ (Asynchronous Event-Driven)
- **Message Broker:** RabbitMQ 3.13.
- **Exchange:** `booking.events` (Loại `TopicExchange`).
- **Routing Keys:** 
  - `booking.held`: Sự kiện giữ ghế thành công.
  - `booking.paid`: Sự kiện khách thanh toán thành công (xuất vé điện tử).
  - `booking.cancelled`: Sự kiện hủy vé hoặc quá hạn giữ chỗ.
- **Đảm bảo tính nhất quán:** Bắn sự kiện bất đồng bộ thông qua `TransactionSynchronizationManager.registerSynchronization` với callback `afterCommit()` để chỉ gửi tin nhắn khi giao dịch cơ sở dữ liệu đã commit thành công.

---

## 4. Chiến lược Chịu lỗi và Phục hồi (Resilience Strategy)

Để chống lại hiện tượng **Suy sập dây chuyền (Cascading Failure)** và đảm bảo tính sẵn sàng cao, hệ thống áp dụng các mẫu thiết kế chịu lỗi nghiêm ngặt:

### 4.1. Cấu hình Timeout (Timeout Pattern)
Mọi kết nối liên dịch vụ đều được áp đặt giới hạn thời gian chặt chẽ:
- **Connect Timeout:** `2000 ms` (2 giây) — Giới hạn thời gian thiết lập bắt tay TCP với Provider.
- **Read Timeout:** `3000 ms` (3 giây) — Giới hạn thời gian tối đa chờ phản hồi từ Provider.
- **Lợi ích:** Giải phóng luồng (thread) của Consumer ngay lập tức nếu Provider gặp sự cố treo hoặc quá tải, tránh cạn kiệt thread pool của Tomcat.

### 4.2. Cơ chế Thử lại (Retry Pattern với Backoff)
Được triển khai trong `com.cinema.common.client.RetryExecutor`:
- **Số lần thử tối đa:** `3` lần (`maxAttempts = 3`).
- **Thời gian chờ giữa các lần (Backoff):** `200 ms`.
- **Phân loại lỗi để Retry (`isRetryable`):**
  - **CHỈ RETRY** với các lỗi tạm thời (Transient Errors):
    - `ResourceAccessException`: Lỗi I/O, mạng chập chờn, kết nối bị ngắt đột ngột, Read Timeout.
    - `HttpServerErrorException`: Các mã lỗi 5xx (`500 Internal Server Error`, `502 Bad Gateway`, `503 Service Unavailable`, `504 Gateway Timeout`).
  - **TUYỆT ĐỐI KHÔNG RETRY** với các lỗi 4xx (`400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `409 Conflict`) vì đây là lỗi dữ liệu hoặc nghiệp vụ, việc thử lại sẽ chỉ gây lãng phí tài nguyên.

### 4.3. Cơ chế Dự phòng (Fallback Mechanism - Fail-Closed)
- Khi quá 3 lần thử lại mà Provider vẫn không phản hồi, `RemoteCaller` kích hoạt Fallback:
  - Ném ngoại lệ `ServiceUnavailableException`.
  - Được `GlobalExceptionHandler` đón bắt và trả về mã HTTP `503 Service Unavailable` cho Client kèm thông báo: `"<service-name> tạm thời không khả dụng, vui lòng thử lại sau"`.
- **Triết lý Fail-Closed:** Hệ thống rạp chiếu phim tuyệt đối không cho phép đặt vé khi chưa kiểm tra được trạng thái phòng hoặc giá suất chiếu từ các dịch vụ phụ trách, nhằm bảo vệ tính toàn vẹn tài chính và lịch chiếu.

### 4.4. Đảm bảo Tính Lũy kế & Bất biến (Idempotency Pattern)
- Trong các hoạt động tài chính/đặt vé, mạng chập chờn có thể khiến Client bấm nút 2 lần hoặc retry nhầm.
- Hệ thống hỗ trợ header `Idempotency-Key` (chuẩn UUID v4).
- Khi nhận yêu cầu `POST /api/v1/tickets/batch` kèm `Idempotency-Key`:
  - `TicketService` kiểm tra xem khóa này đã tồn tại trong cơ sở dữ liệu chưa.
  - Nếu đã tồn tại: Trả về trực tiếp danh sách vé đã tạo của lần gọi trước (kèm HTTP 200/201), không trừ tiền và không tạo thêm bản ghi mới.

### 4.5. Khóa Phân tán Nguyên tử (Atomic Distributed Locking via Redis Lua)
- Khi khách hàng chọn đặt nhiều ghế cùng lúc (ví dụ: A1, A2, A3), nếu kiểm tra từng ghế tuần tự sẽ dễ dẫn đến **Race Condition** hoặc **Deadlock**.
- Hệ thống triển khai Redis Lua Script `LOCK_MULTI_SCRIPT`:
  - Kiểm tra trạng thái của toàn bộ danh sách ghế trong cùng một lệnh nguyên tử Redis.
  - **Nguyên tắc All-or-Nothing:** Nếu tất cả các ghế đều trống -> Khóa toàn bộ và cấp thời gian giữ chỗ (TTL = 15 phút). Nếu có bất kỳ ghế nào đã bị người khác giữ hoặc đã bán -> Không khóa bất kỳ ghế nào, trả về danh sách ghế xung đột để báo lỗi `409 Conflict`.
- Sắp xếp thứ tự ID ghế tăng dần trước khi khóa (`TicketRules.normalizeSeatBatch`) để loại trừ khả năng Deadlock chéo giữa hai người dùng đặt các ghế đảo ngược nhau.

### 4.6. Tính toán Tiền tệ Chuẩn xác (BigDecimal Currency Pattern)
- Thay vì sử dụng số thực dấu phẩy động `Double` hay `Float` (dễ phát sinh sai số như `0.1 + 0.2 = 0.30000000000000004`), toàn bộ logic tính giá vé và phụ thu ghế VIP (+20.000 ₫), SWEETBOX (+50.000 ₫) được chuẩn hóa bằng `BigDecimal` với chế độ làm tròn `RoundingMode.HALF_UP` (2 chữ số thập phân).

---

## 5. Quy trình Nghiệp vụ Tích hợp Cốt lõi

### 5.1. Quy trình Đặt Vé Hàng Loạt Nguyên tử (Batch Ticket Booking Flow)
1. **Client** gửi `POST /api/v1/tickets/batch` với header `Idempotency-Key` và body gồm `showtimeId`, danh sách `seatIds`.
2. **Booking Service** gọi `ShowtimeClient` (Provider: `movie-service`) để lấy thông tin suất chiếu và giá vé gốc.
3. **Booking Service** gọi `SeatClient` (Provider: `venue-service`) để lấy thông tin chi tiết từng ghế và loại ghế.
4. **Booking Service** tính toán tổng tiền bằng `BigDecimal`.
5. **Booking Service** thực thi Redis Lua Script kiểm tra và khóa nguyên tử danh sách ghế.
6. Nếu thành công, mở Transaction SQL lưu đồng thời `Ticket` và `SeatClaim` vào MySQL.
7. Sau khi commit DB, `BookingProducer` bắn sự kiện `TICKET_HELD` vào RabbitMQ.
8. Trả về kết quả mã `201 Created` cho Client.

### 5.2. Quy trình Xác thực Phòng chiếu (Room Validation Flow)
1. **Admin** gửi `POST /api/v1/showtimes` để tạo suất chiếu mới tại phòng `roomId`.
2. **Movie Service** đóng vai trò Consumer gọi `VenueClient` sang `venue-service` (`GET /api/v1/rooms/{id}`).
3. Nếu phòng không tồn tại -> `venue-service` trả về `404 Not Found` -> `Movie Service` ném `ResourceNotFoundException` và từ chối tạo suất chiếu.
4. Nếu `venue-service` bị sập -> `RemoteCaller` tự động retry 3 lần rồi trả về `503 Service Unavailable`, bảo vệ hệ thống không tạo dữ liệu mồ côi (Orphan Data).
