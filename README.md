# AURA CINEMA - HỆ THỐNG ĐẶT VÉ RẠP CHIẾU PHIM KIẾN TRÚC MICROSERVICES

Hệ thống quản lý cụm rạp và đặt vé xem phim trực tuyến hiện đại, ứng dụng kiến trúc Microservices chuẩn doanh nghiệp với Spring Boot 3.2.3, Spring Cloud Gateway, Redis Cache/Lock, RabbitMQ Event-Driven, MySQL và Giao diện Web SPA Nginx.

---

## 🏛 Kiến Trúc Hệ Thống (Microservices Architecture)

```
[Khách Hàng / Admin Web SPA (Port 3000)]
                 │
                 ▼
    [API Gateway (Spring Cloud - Port 8080)]
                 │
  ┌──────────────┼──────────────┬──────────────┬──────────────┐
  ▼              ▼              ▼              ▼              ▼
[user-service] [movie-service] [venue-service] [booking-svc]  [notification-svc]
(Port 8081)    (Port 8082)    (Port 8083)    (Port 8084)    (Port 8085)
     │              │              │              │               │
     └──────────────┴──────────────┼──────────────┴───────────────┘
                                   ▼
                 [MySQL 8 (3307) | Redis 7 (6379) | RabbitMQ (5672/15672)]
```

### Các Dịch Vụ Chính:
1. **API Gateway (8080)**: Điểm tiếp nhận trung tâm (Reverse Proxy, Dynamic Routing, CORS, Rate Limit).
2. **User Service (8081)**: Quản lý người dùng, phân quyền Role-based (CUSTOMER/ADMIN), xác thực JWT stateless, Token Revocation (Blacklist) qua Redis.
3. **Movie Service (8082)**: Quản lý danh mục phim, kiểm duyệt, tạo và quản lý lịch chiếu/suất chiếu (Showtimes), tích hợp gọi xác thực phòng chiếu sang Venue Service.
4. **Venue Service (8083)**: Quản lý chuỗi rạp (Cinemas), phòng chiếu (Rooms), tự động sinh sơ đồ ghế, khóa/bảo trì trạng thái ghế vật lý với Redis Cache 60 phút.
5. **Booking Service (8084)**:
   - Đặt nhiều ghế nguyên tử trong một đơn (**Batch Atomic Booking**) với Redis Lua script All-or-Nothing.
   - Sắp xếp ID ghế chống Deadlock, hỗ trợ Idempotency-Key.
   - Quản lý sơ đồ ghế Suất chiếu thời gian thực (**Showtime Seat Map**).
   - Chuẩn hóa tính toán tiền tệ chính xác bằng `BigDecimal` (`RoundingMode.HALF_UP`, 2 chữ số thập phân).
   - Cấu hình phụ thu động cho ghế VIP (+20.000 ₫) và Sweetbox (+50.000 ₫) qua API Admin / Redis / Docker.
6. **Notification Service (8085)**: Lắng nghe sự kiện bất đồng bộ qua RabbitMQ (`TICKET_HELD`, `TICKET_PAID`, `TICKET_CANCELLED`), phân loại log và xuất vé điện tử (E-Ticket).
7. **Frontend (3000)**: Web UI hiện đại nền sáng (Light Theme), hỗ trợ chọn đồng thời nhiều ghế trực quan, Bảng điều khiển Quản trị viên (Admin Dashboard) toàn màn hình.

---

## 🚀 Hướng Dẫn Khởi Chạy

### Yêu Cầu Tiên Quyết:
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- Java 17+ (nếu muốn build thủ công bằng Maven)

### Khởi Chạy Bằng Docker Compose (Khuyên dùng):
Chỉ với 1 câu lệnh duy nhất:
```bash
docker-compose up -d
```
Hệ thống sẽ tự động khởi tạo MySQL, Redis, RabbitMQ và các microservices.

### Truy Cập Ứng Dụng:
- **Trang Khách Hàng & Đặt Vé**: `http://localhost:3000`
- **Tài khoản Khách Hàng Demo**: Đăng ký mới trực tiếp trên web hoặc dùng tài khoản có sẵn
- **Tài khoản Quản Trị Viên (Admin)**:
  - Tên đăng nhập: `admin`
  - Mật khẩu: `Admin@123456`
- **RabbitMQ Management Portal**: `http://localhost:15672` (User: `cinema` / Pass: `cinema123`)

---

## 🛠 Công Nghệ Sử Dụng

- **Backend**: Java 17, Spring Boot 3.2.3, Spring Cloud Gateway, Spring Data JPA, Spring Security, JWT (jjwt 0.12.5).
- **Database & Cache**: MySQL 8.0, Redis 7 (Lua Scripting, StringRedisTemplate).
- **Message Broker**: RabbitMQ 3 Management (AMQP).
- **Frontend**: HTML5, TailwindCSS, Vanilla JavaScript (ES6+), Nginx Alpine.
- **DevOps**: Docker, Docker Compose, Multi-stage Containerization.
