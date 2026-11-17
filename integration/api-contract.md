# ĐẶC TẢ HỢP ĐỒNG API LIÊN DỊCH VỤ (API CONTRACT SPECIFICATION)
## BÀI THỰC HÀNH SỐ 6: TÍCH HỢP VÀ TIÊU THỤ DỊCH VỤ
**Dự án:** Aura Cinema Microservices  
**Phiên bản API:** `v1`  
**Giao thức:** HTTP/1.1 REST (JSON) & AMQP (RabbitMQ)  

---

## 1. Danh mục các Hợp đồng Tích hợp

| STT | Phương thức | Đường dẫn API | Dịch vụ gọi (Consumer) | Dịch vụ cung cấp (Provider) | Mục đích |
|:---:|:---:|:---|:---|:---|:---|
| **API-01** | `GET` | `/api/v1/showtimes/{id}` | `booking-service` | `movie-service` | Lấy chi tiết suất chiếu & giá vé cơ sở |
| **API-02** | `GET` | `/api/v1/seats/{id}` | `booking-service` | `venue-service` | Lấy thông tin loại ghế (VIP, SWEETBOX, NORMAL) |
| **API-03** | `GET` | `/api/v1/rooms/{id}/seats` | `booking-service` | `venue-service` | Lấy sơ đồ toàn bộ ghế của phòng chiếu |
| **API-04** | `GET` | `/api/v1/rooms/{id}` | `movie-service` | `venue-service` | Xác thực phòng chiếu tồn tại khi lên lịch |
| **API-05** | `POST` | `/api/v1/tickets/batch` | `api-gateway` / Client | `booking-service` | Đặt nhiều vé nguyên tử (Batch Atomic Booking) |
| **API-06** | `GET` | `/api/v1/showtimes/{id}/seats` | `api-gateway` / Client | `booking-service` | Lấy sơ đồ ghế theo suất chiếu kèm trạng thái |
| **MSG-01** | `AMQP` | `booking.events` (Topic) | `notification-service` | `booking-service` | Sự kiện đặt vé / thanh toán / hủy vé |

---

## 2. Chi tiết từng Hợp đồng API

### API-01: Lấy chi tiết Suất chiếu (`GET /api/v1/showtimes/{id}`)
- **Caller (Consumer):** `booking-service` (`ShowtimeClient.java`)
- **Callee (Provider):** `movie-service` (`ShowtimeController.java`)
- **URL Pattern:** `http://movie-service:8082/api/v1/showtimes/{id}`

#### Request Headers:
```http
Accept: application/json
```

#### Response Cases:
- **`200 OK` — Thành công:**
```json
{
  "id": 260,
  "movieId": 1,
  "roomId": 2,
  "startTime": "2026-11-16T16:30:00",
  "endTime": "2026-11-16T18:30:00",
  "price": 100000.00,
  "status": "OPEN"
}
```
- **`404 Not Found` — Suất chiếu không tồn tại:**
```json
{
  "timestamp": "2026-11-16T10:45:00.123Z",
  "status": 404,
  "error": "Not Found",
  "message": "Không tìm thấy Suất chiếu với ID: 9999",
  "path": "/api/v1/showtimes/9999"
}
```
- **`503 Service Unavailable` — Fallback khi movie-service sập:**
```json
{
  "timestamp": "2026-11-16T10:45:06.500Z",
  "status": 503,
  "error": "Service Unavailable",
  "message": "movie-service tạm thời không khả dụng, vui lòng thử lại sau",
  "path": "/api/v1/tickets/batch"
}
```

---

### API-02: Lấy thông tin Ghế đơn (`GET /api/v1/seats/{id}`)
- **Caller (Consumer):** `booking-service` (`SeatClient.java`)
- **Callee (Provider):** `venue-service` (`SeatController.java`)
- **URL Pattern:** `http://venue-service:8083/api/v1/seats/{id}`

#### Response Cases:
- **`200 OK` — Thành công:**
```json
{
  "id": 173,
  "roomId": 3,
  "seatRow": "F",
  "seatColumn": 3,
  "seatName": "F3",
  "seatType": "SWEETBOX",
  "active": true
}
```
- **`404 Not Found` — Ghế không tồn tại:**
```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Không tìm thấy Ghế với ID: 173"
}
```

---

### API-03: Lấy danh sách Ghế theo Phòng (`GET /api/v1/rooms/{id}/seats`)
- **Caller (Consumer):** `booking-service` (`SeatClient.java`)
- **Callee (Provider):** `venue-service` (`RoomController.java`)
- **Cơ chế Cache:** Có Redis Cache 60 phút tại `venue-service`.

#### Response:
- **`200 OK`:**
```json
[
  {
    "id": 1,
    "roomId": 1,
    "seatRow": "A",
    "seatColumn": 1,
    "seatName": "A1",
    "seatType": "NORMAL",
    "active": true
  },
  {
    "id": 21,
    "roomId": 1,
    "seatRow": "C",
    "seatColumn": 1,
    "seatName": "C1",
    "seatType": "VIP",
    "active": true
  }
]
```

---

### API-04: Xác thực Phòng chiếu (`GET /api/v1/rooms/{id}`)
- **Caller (Consumer):** `movie-service` (`VenueClient.java`)
- **Callee (Provider):** `venue-service` (`RoomController.java`)
- **Mục đích:** Trước khi tạo hoặc chỉnh sửa một suất chiếu, `movie-service` phải đảm bảo phòng chiếu thực sự tồn tại trong cụm rạp.

#### Response Cases:
- **`200 OK` — Phòng hợp lệ:**
```json
{
  "id": 2,
  "cinemaId": 1,
  "name": "P.02 (Dolby Atmos)",
  "screenType": "DOLBY_ATMOS",
  "totalSeats": 60,
  "active": true
}
```
- **`404 Not Found` — Phòng không tồn tại:**
```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Không tìm thấy Phòng chiếu với ID: 999"
}
```

---

### API-05: Đặt nhiều vé nguyên tử (`POST /api/v1/tickets/batch`)
- **Caller:** Client SPA hoặc Khách hàng thông qua API Gateway.
- **Handler (Consumer):** `booking-service` (`TicketController.java`, `TicketService.java`).

#### Request Headers:
```http
POST /api/v1/tickets/batch HTTP/1.1
Host: localhost:8080
Authorization: Bearer <JWT_ACCESS_TOKEN>
Idempotency-Key: e4a706b2-6582-4f11-8288-59ea21f8a70c
Content-Type: application/json
```

#### Request Body:
```json
{
  "showtimeId": 260,
  "seatIds": [1, 2, 21]
}
```

#### Response Cases:
- **`201 Created` — Đặt vé thành công:**
```json
[
  {
    "id": 101,
    "ticketCode": "TKT-20261116-000101",
    "showtimeId": 260,
    "seatId": 1,
    "userId": 2,
    "price": 100000.00,
    "status": "HELD",
    "createdAt": "2026-11-16T10:50:00",
    "expiresAt": "2026-11-16T11:05:00"
  },
  {
    "id": 102,
    "ticketCode": "TKT-20261116-000102",
    "showtimeId": 260,
    "seatId": 2,
    "userId": 2,
    "price": 100000.00,
    "status": "HELD",
    "createdAt": "2026-11-16T10:50:00",
    "expiresAt": "2026-11-16T11:05:00"
  },
  {
    "id": 103,
    "ticketCode": "TKT-20261116-000103",
    "showtimeId": 260,
    "seatId": 21,
    "userId": 2,
    "price": 120000.00,
    "status": "HELD",
    "createdAt": "2026-11-16T10:50:00",
    "expiresAt": "2026-11-16T11:05:00"
  }
]
```
- **`400 Bad Request` — Danh sách ghế không hợp lệ:**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Mỗi lần đặt vé chỉ được chọn từ 1 đến 10 ghế"
}
```
- **`409 Conflict` — Xung đột ghế (Ghế đã bị người khác đặt hoặc đang giữ):**
```json
{
  "status": 409,
  "error": "Conflict",
  "message": "Các ghế sau đã được người khác giữ hoặc đã bán: [21]"
}
```
- **`200 OK` (Idempotent replay) — Khi gửi lại cùng `Idempotency-Key`:**
  - Hệ thống trả về chính xác danh sách vé `[101, 102, 103]` đã tạo ở trên mà không trừ thêm tiền hay khóa thêm ghế.

---

### API-06: Sơ đồ Ghế theo Suất Chiếu (`GET /api/v1/showtimes/{id}/seats`)
- **Caller:** Client / Frontend
- **Handler:** `booking-service` kết hợp dữ liệu từ `venue-service` và `booking-service` DB.

#### Response:
- **`200 OK`:**
```json
[
  {
    "seatId": 1,
    "seatName": "A1",
    "seatRow": "A",
    "seatColumn": 1,
    "seatType": "NORMAL",
    "basePrice": 100000.00,
    "surcharge": 0.00,
    "finalPrice": 100000.00,
    "status": "HELD"
  },
  {
    "seatId": 21,
    "seatName": "C1",
    "seatRow": "C",
    "seatColumn": 1,
    "seatType": "VIP",
    "basePrice": 100000.00,
    "surcharge": 20000.00,
    "finalPrice": 120000.00,
    "status": "AVAILABLE"
  },
  {
    "seatId": 173,
    "seatName": "F3",
    "seatRow": "F",
    "seatColumn": 3,
    "seatType": "SWEETBOX",
    "basePrice": 100000.00,
    "surcharge": 50000.00,
    "finalPrice": 150000.00,
    "status": "AVAILABLE"
  }
]
```

---

## 3. Hợp đồng Thông điệp Bất đồng bộ (RabbitMQ Message Contract)

### MSG-01: Sự kiện Đặt Vé (`Exchange: booking.events`)
- **Exchange:** `booking.events` (Topic Exchange)
- **Routing Key:** `booking.held`, `booking.paid`, `booking.cancelled`
- **Producer:** `booking-service`
- **Consumer:** `notification-service`

#### Payload Format (JSON):
```json
{
  "eventId": "f78d30e5-7821-4f91-88f1-62a937a09d31",
  "eventType": "TICKET_HELD",
  "ticketId": 101,
  "showtimeId": 260,
  "seatId": 1,
  "userId": 2,
  "amount": 100000.00,
  "status": "HELD",
  "timestamp": "2026-11-16T10:50:00Z"
}
```
