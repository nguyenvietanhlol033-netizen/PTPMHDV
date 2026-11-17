# SƠ ĐỒ TUẦN TỰ: XỬ LÝ XUNG ĐỘT GHẾ (SEAT CONFLICT - 409)
## BÀI THỰC HÀNH SỐ 6 - TÍCH HỢP VÀ TIÊU THỤ DỊCH VỤ

Sơ đồ thể hiện cách hệ thống xử lý tình huống hai khách hàng cùng chọn đặt trùng một ghế tại cùng một suất chiếu, minh họa cơ chế **All-or-Nothing** bằng Redis Lua Script và mã phản hồi chuẩn `409 Conflict`.

---

## 1. Sơ đồ Mermaid (Sequence Diagram)

```mermaid
sequenceDiagram
    autonumber
    actor UserA as Khách Hàng A
    actor UserB as Khách Hàng B
    participant Booking as Booking Service (:8084)<br/>[Consumer]
    participant Redis as Redis Server (:6379)<br/>[Distributed Lock]
    participant MySQL as MySQL Database (:3307)

    Note over UserA, UserB: Cả hai người dùng cùng bấm đặt ghế #173 (SWEETBOX) cùng lúc
    UserA->>Booking: POST /api/v1/tickets/batch {showtimeId: 260, seatIds: [173]}
    UserB->>Booking: POST /api/v1/tickets/batch {showtimeId: 260, seatIds: [173]}

    Note over Booking: Request của User A tới trước một phần nghìn giây
    Booking->>Redis: EVALSHA LOCK_MULTI_SCRIPT (Ghế 173 - User A)
    Redis-->>Booking: 1 (Khóa thành công - Gán TTL 900s)
    Booking->>MySQL: INSERT INTO tickets & seat_claims (User A)
    Booking-->>UserA: 201 Created (User A giữ ghế thành công)

    Note over Booking: Request của User B tới sau
    Booking->>Redis: EVALSHA LOCK_MULTI_SCRIPT (Ghế 173 - User B)
    Redis-->>Booking: 0 (Phát hiện ghế 173 ĐÃ BỊ KHÓA bởi User A)

    Note over Booking: Cơ chế All-or-Nothing:<br/>Hủy bỏ toàn bộ, không khóa nửa vời, không ghi DB
    Booking-->>UserB: 409 Conflict<br/>{"error": "Conflict", "message": "Ghế #173 vừa được người khác giữ hoặc đã bán!"}
```

---

## 2. Diễn giải cơ chế chống Race Condition

1. **Vấn đề thực tế:** Khi phim "hot" mở bán, hàng trăm người dùng có thể cùng chọn một vị trí ghế VIP hoặc SWEETBOX trong cùng một giây. Nếu kiểm tra ghế bằng câu lệnh `SELECT ... WHERE status = 'AVAILABLE'` thông thường trong SQL, hiện tượng **Race Condition** sẽ xảy ra (cả 2 người đều thấy ghế trống và cùng tạo vé).
2. **Giải pháp Redis Lua Script:**
   - Lệnh Lua chạy hoàn toàn nguyên tử (Single-threaded) trên Redis.
   - Script duyệt qua mảng danh sách ghế: nếu bất kỳ ghế nào đã tồn tại khóa `lock:showtime:{id}:seat:{seatId}`, script lập tức dừng lại và trả về mã lỗi kèm danh sách ghế bị trùng.
   - Không có bất kỳ ghế nào của User B bị giữ lại nửa vời (All-or-Nothing).
3. **Mã lỗi HTTP 409 Conflict:**
   - `Booking Service` bắt kết quả từ chối của Redis và ném ngoại lệ `ConflictException`.
   - `GlobalExceptionHandler` format thành cấu trúc JSON chuẩn `409 Conflict`.
   - Giao diện Client hiển thị Toast thông báo đỏ: *"Ghế này vừa được người khác giữ hoặc đã bán! Vui lòng chọn ghế khác."*
