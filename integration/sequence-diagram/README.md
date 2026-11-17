# THƯ MỤC SƠ ĐỒ TUẦN TỰ (SEQUENCE DIAGRAMS)
## BÀI THỰC HÀNH SỐ 6: TÍCH HỢP VÀ TIÊU THỤ DỊCH VỤ

Thư mục này chứa các sơ đồ tuần tự chi tiết mô phỏng các luồng tích hợp giữa các Microservices trong hệ thống Cinema Management System:

1. **[booking-success.md](./booking-success.md):** Luồng đặt vé hàng loạt nguyên tử thành công (Happy Path) - Tích hợp đầy đủ giữa Booking Service, Movie Service, Venue Service, Redis Distributed Lock, MySQL Transaction và RabbitMQ Event Broker.
2. **[booking-seat-conflict.md](./booking-seat-conflict.md):** Luồng xử lý xung đột ghế (409 Conflict) - Minh họa cơ chế chống Race Condition với Redis Lua Script theo nguyên tắc All-or-Nothing.
3. **[service-timeout-fallback.md](./service-timeout-fallback.md):** Luồng kiểm soát sự cố và phục hồi (Resilience) - Minh họa cơ chế Timeout (2s/3s), Retry 3 lần với Backoff 200ms, và kích hoạt Fallback 503 Service Unavailable khi Provider gặp sự cố.

> **Lưu ý:** Các sơ đồ được vẽ bằng chuẩn định dạng **Mermaid.js**, có thể render trực tiếp trên giao diện web của GitHub, GitLab, VS Code Markdown Preview hoặc [Mermaid Live Editor](https://mermaid.live).
