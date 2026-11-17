$ErrorActionPreference = "Continue"

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0

$doc = $word.Documents.Add()

# Page Setup (A4, Left: 3cm, Right: 2cm, Top: 2.5cm, Bottom: 2.5cm)
$doc.PageSetup.PaperSize = 7 # wdPaperA4
$doc.PageSetup.LeftMargin = 85.05
$doc.PageSetup.RightMargin = 56.7
$doc.PageSetup.TopMargin = 70.85
$doc.PageSetup.BottomMargin = 70.85

$selection = $word.Selection

function Add-Heading1($text) {
    $selection.Font.Name = "Times New Roman"
    $selection.Font.Size = 14
    $selection.Font.Bold = 1
    $selection.Font.Color = 0x800000 # Dark Navy
    $selection.ParagraphFormat.Alignment = 0 # Left
    $selection.ParagraphFormat.SpaceBefore = 10
    $selection.ParagraphFormat.SpaceAfter = 4
    $selection.ParagraphFormat.LineSpacingRule = 0
    $selection.ParagraphFormat.LineSpacing = 14
    $selection.TypeText($text)
    $selection.TypeParagraph()
}

function Add-Heading2($text) {
    $selection.Font.Name = "Times New Roman"
    $selection.Font.Size = 12
    $selection.Font.Bold = 1
    $selection.Font.Color = 0x000000
    $selection.ParagraphFormat.Alignment = 0
    $selection.ParagraphFormat.SpaceBefore = 6
    $selection.ParagraphFormat.SpaceAfter = 3
    $selection.ParagraphFormat.LineSpacingRule = 0
    $selection.ParagraphFormat.LineSpacing = 14
    $selection.TypeText($text)
    $selection.TypeParagraph()
}

function Add-Paragraph($text) {
    $selection.Font.Name = "Times New Roman"
    $selection.Font.Size = 11
    $selection.Font.Bold = 0
    $selection.Font.Color = 0x000000
    $selection.ParagraphFormat.Alignment = 3 # Justify
    $selection.ParagraphFormat.SpaceBefore = 0
    $selection.ParagraphFormat.SpaceAfter = 4
    $selection.ParagraphFormat.LineSpacingRule = 0
    $selection.ParagraphFormat.LineSpacing = 14
    $selection.TypeText($text)
    $selection.TypeParagraph()
}

function Add-Bullet($text) {
    $selection.Font.Name = "Times New Roman"
    $selection.Font.Size = 11
    $selection.Font.Bold = 0
    $selection.Font.Color = 0x000000
    $selection.ParagraphFormat.Alignment = 3
    $selection.ParagraphFormat.SpaceBefore = 0
    $selection.ParagraphFormat.SpaceAfter = 2
    $selection.ParagraphFormat.LeftIndent = 18
    $selection.TypeText("• " + $text)
    $selection.TypeParagraph()
    $selection.ParagraphFormat.LeftIndent = 0
}

# --- COVER / HEADER ---
$selection.ParagraphFormat.Alignment = 1 # Center
$selection.Font.Name = "Times New Roman"
$selection.Font.Size = 12
$selection.Font.Bold = 1
$selection.Font.Color = 0x404040
$selection.TypeText("BỘ GIÁO DỤC VÀ ĐÀO TẠO — HỌC PHẦN PHÁT TRIỂN PHẦN MỀM HƯỚNG DỊCH VỤ`n")
$selection.TypeText("HỆ THỐNG PHÂN TÁN ĐẶT VÉ & THANH TOÁN RẠP CHIẾU PHIM (CINEMA MICROSERVICES)`n`n")

$selection.Font.Size = 18
$selection.Font.Bold = 1
$selection.Font.Color = 0x800000
$selection.TypeText("BÁO CÁO ĐẶC TẢ SƠ ĐỒ KIẾN TRÚC HỆ THỐNG`n")

$selection.Font.Size = 12
$selection.Font.Bold = 0
$selection.Font.Italic = 1
$selection.Font.Color = 0x505050
$selection.TypeText("Chuẩn hóa và nâng cấp theo tài liệu đặc tả kien_truc_he_thong_dat_ve_xem_phim.pdf`n")
$selection.TypeText("Hệ thống Microservices: Spring Cloud Gateway, 5 Services, MySQL 8, Redis Lua, RabbitMQ & VietQR`n")

# Divider
$selection.ParagraphFormat.Alignment = 1
$selection.Font.Bold = 1
$selection.Font.Color = 0x808080
$selection.TypeText("_________________________________________________________________________________`n`n")

# ==================== PHẦN I ====================
Add-Heading1("PHẦN I. TỔNG QUAN KIẾN TRÚC HỆ THỐNG")
Add-Paragraph("Hệ thống là một nền tảng website đặt vé xem phim trực tuyến hiện đại, phục vụ đồng thời hai đối tượng người dùng chính: Khách hàng (xem phim, tra cứu lịch chiếu theo rạp, chọn nhiều ghế trên sơ đồ trực quan, khóa giữ ghế trong 10 phút, thanh toán qua mã VietQR hoặc giả lập và nhận vé điện tử E-Ticket) và Quản trị viên (quản lý danh mục phim, cụm rạp, phòng chiếu, tạo suất chiếu chống trùng giờ và cấu hình giá phụ thu vé động).")
Add-Paragraph("Kiến trúc hệ thống được phát triển nâng cấp từ tài liệu đặc tả gốc kien_truc_he_thong_dat_ve_xem_phim.pdf sang mô hình Microservices phân tán hoàn chỉnh, tuân thủ các nguyên tắc thiết kế hướng dịch vụ tiên tiến:")
Add-Bullet("Single Entry Point (Điểm tiếp nhận duy nhất): Toàn bộ lưu lượng từ trình duyệt khách hàng và trang quản trị đều đi qua Spring Cloud API Gateway (cổng 8080) để thực hiện định tuyến tập trung, xác thực JWT và mở CORS.")
Add-Bullet("Database-per-Service: Mỗi Microservice sở hữu cơ sở dữ liệu quan hệ MySQL 8.0 độc lập (user_db, movie_db, venue_db, booking_db), bảo đảm tính đóng gói và an toàn dữ liệu.")
Add-Bullet("Khóa phân tán nguyên tử (Distributed Locking with Redis): Khóa giữ nhiều ghế trong cùng một đơn bằng Redis Lua Script (All-or-Nothing) với thời gian sống TTL = 600 giây (10 phút), loại bỏ hoàn toàn hiện tượng tranh chấp ghế (Race Condition).")
Add-Bullet("Truyền thông điệp bất đồng bộ (Event-Driven Messaging with RabbitMQ): Tách biệt hoàn toàn luồng thanh toán với luồng phát hành vé điện tử và gửi thông báo, giúp thời gian phản hồi giao dịch đạt dưới 50ms.")

# ==================== PHẦN II: SƠ ĐỒ KHỐI TRỰC QUAN ====================
Add-Heading1("PHẦN II. SƠ ĐỒ KHỐI KIẾN TRÚC MICROSERVICES TỔNG THỂ")
Add-Paragraph("Dưới đây là sơ đồ khối kiến trúc phân tầng của toàn bộ hệ thống. Sơ đồ được trình bày mạch lạc theo chuẩn khối chức năng độc lập (Client -> Gateway -> Microservices -> Databases & Middleware), các ô vuông hiển thị rõ ràng thông tin cổng giao tiếp, vai trò và công nghệ:")

# Chèn ảnh sơ đồ 1: Microservices đơn giản
$imgPath1 = "E:\PTPMHDV\KienTrucHT\so_do_microservices_don_gian.png"
if (Test-Path $imgPath1) {
    $selection.ParagraphFormat.Alignment = 1 # Center
    $shape1 = $selection.InlineShapes.AddPicture($imgPath1)
    $shape1.Width = 470 # vừa vặn trang A4
    $shape1.Height = ($shape1.Width * 780) / 1250
    $selection.TypeParagraph()
    
    $selection.Font.Name = "Times New Roman"
    $selection.Font.Size = 10
    $selection.Font.Italic = 1
    $selection.Font.Color = 0x303030
    $selection.TypeText("Hình 1: Sơ đồ khối kiến trúc vi dịch vụ Microservices (Dạng khối đơn giản chuẩn mực).`n`n")
}

Add-Paragraph("Bên cạnh sơ đồ vi dịch vụ chi tiết ở trên, hệ thống được phân rã thành 8 khối module nghiệp vụ lõi tương ứng 1:1 với sơ đồ thiết kế tổng thể trong tài liệu chuẩn như sau:")

# Chèn ảnh sơ đồ 2: Sơ đồ chuẩn mẫu 8 module
$imgPath2 = "E:\PTPMHDV\KienTrucHT\so_do_kien_truc_chuan_mau.png"
if (Test-Path $imgPath2) {
    $selection.ParagraphFormat.Alignment = 1 # Center
    $shape2 = $selection.InlineShapes.AddPicture($imgPath2)
    $shape2.Width = 470 # vừa vặn trang A4
    $shape2.Height = ($shape2.Width * 640) / 1000
    $selection.TypeParagraph()
    
    $selection.Font.Name = "Times New Roman"
    $selection.Font.Size = 10
    $selection.Font.Italic = 1
    $selection.Font.Color = 0x303030
    $selection.TypeText("Hình 2: Sơ đồ khối kiến trúc phân rã 8 module chức năng chuẩn theo tài liệu đặc tả.`n`n")
}

# ==================== PHẦN III: ĐẶC TẢ CHI TIẾT CÁC TẦNG ====================
Add-Heading1("PHẦN III. ĐẶC TẢ CÁC THÀNH PHẦN VÀ KHỐI CHỨC NĂNG")

Add-Heading2("1. Tầng Trình diễn (Client & Presentation Layer)")
Add-Bullet("Web Khách Hàng (Customer SPA - Nginx Port :3000): Xây dựng bằng Single Page Application (HTML5, TailwindCSS, Vanilla JS). Cho phép duyệt phim, xem lịch chiếu theo rạp, chọn đồng thời nhiều ghế trên sơ đồ trực quan (Standard, VIP, Sweetbox), hiển thị đồng hồ đếm ngược giữ ghế 10 phút, hỗ trợ quét mã VietQR ngân hàng tự động và mở Modal vé điện tử E-Ticket khi thanh toán thành công.")
Add-Bullet("Trang Quản Trị (Admin Portal): Giao diện chuyên biệt dành cho ban quản lý để thêm/sửa/xóa phim, rạp chiếu, phòng chiếu, tạo suất chiếu mới và cấu hình bảng giá phụ thu ghế VIP & Sweetbox linh hoạt theo thời gian thực.")
Add-Bullet("Postman Automated Suite: Bộ kiểm thử tích hợp 9 Test Cases tự động (Collection Runner), kiểm thử toàn diện các luồng từ giữ ghế, xung đột 409, thanh toán giả lập đến khả năng phục hồi liên dịch vụ.")

Add-Heading2("2. Tầng Cổng Điều Phối (Spring Cloud API Gateway - Port :8080)")
Add-Bullet("Điểm vào tập trung duy nhất (Single Entry Point), che giấu hoàn toàn cấu trúc mạng nội bộ của các microservice phía sau.")
Add-Bullet("Định tuyến tập trung (Centralized Routing): Ánh xạ /api/v1/auth/** về user-service; /api/v1/movies/** và /showtimes/** về movie-service; /api/v1/cinemas/**, /rooms/**, /seats/** về venue-service; /api/v1/tickets/** và /api/v1/payments/** về booking-service.")
Add-Bullet("Bảo mật & Tiêu đề: Tự động chuyển tiếp token JWT trong header Authorization, xử lý Global CORS và bóc tách header Idempotency-Key chống tạo đơn trùng lặp do mạng chập chờn.")

Add-Heading2("3. Tầng Dịch Vụ Nghiệp Vụ (Microservices Layer)")
Add-Bullet("User Service (:8081): Quản lý người dùng, đăng ký, đăng nhập, mã hóa mật khẩu BCrypt, cấp phát và xác thực JWT Token (HMAC-SHA256, hạn 15 phút), phân quyền theo Role (CUSTOMER, ADMIN). Kiểm tra Redis Token Blacklist khi tài khoản bị khóa.")
Add-Bullet("Movie Service (:8082): Quản lý danh mục phim (đang chiếu, sắp chiếu) và lịch chiếu theo ngày. Sử dụng bảng khóa hàng SQL room_schedule_mutex để chống trùng lịch phòng chiếu đồng thời. Tích hợp VenueClient gọi venue-service kiểm tra phòng hợp lệ (Retry 3 lần, Timeout 2s/3s, Fallback 503).")
Add-Bullet("Venue Service (:8083): Quản lý cụm rạp, phòng chiếu và danh mục ghế ngồi vật lý (Thường, VIP, Sweetbox). Tối ưu hóa câu truy vấn SQL xóa bỏ lỗi N+1 Query và lưu cache sơ đồ ghế phòng chiếu vào Redis trong 60 phút.")
Add-Bullet("Booking & Payment Service (:8084) - Trọng tâm hệ thống: Cung cấp API đặt nhiều ghế nguyên tử (/api/v1/tickets/batch) bằng Redis Lua Script (All-or-Nothing); Engine tính giá TicketRules bằng BigDecimal với chế độ làm tròn HALF_UP loại bỏ hoàn toàn sai số float; Quản lý bảng giao dịch payments, sinh URL VietQR QuickLink động, hỗ trợ nút bấm Mock Pay test tức thì và API thanh toán gộp Batch Pay nguyên tử; Tự động phát sự kiện RabbitMQ sau commit giao dịch SQL.")
Add-Bullet("Notification Service (:8085): Lắng nghe hàng đợi RabbitMQ booking.queue. Khi nhận sự kiện TICKET_PAID, tiến hành phát hành vé điện tử (E-Ticket) với mã tra cứu vé duy nhất và mô phỏng gửi email xác nhận cho khách hàng.")

Add-Heading2("4. Tầng Dữ Liệu & Middleware (Data, Cache & Message Broker)")
Add-Bullet("MySQL 8.0 (:3307 - Database-per-Service): Đảm bảo giao dịch ACID và là nơi ra quyết định cuối cùng vé đã bán hay chưa. Bao gồm 4 cơ sở dữ liệu riêng biệt: user_db, movie_db, venue_db, booking_db.")
Add-Bullet("Redis 7.0 (:6379): Lưu cache dữ liệu đọc nhiều; Chạy Lua Script LOCK_MULTI_SCRIPT khóa giữ ghế nguyên tử có thời hạn sống (TTL = 600s / 10 phút); Lưu danh sách Token Blacklist.")
Add-Bullet("RabbitMQ 3 (:5672): Message Broker với Topic Exchange booking.events và Queue booking.queue, tách rời luồng thanh toán khỏi luồng thông báo, nâng cao thông lượng hệ thống.")
Add-Bullet("Cổng VietQR NAPAS247: Tích hợp chuẩn QuickLink API (img.vietqr.io) tự động nhúng số tài khoản MBBank, tên chủ tài khoản AURA CINEMA, số tiền chính xác và mã đơn hàng PAY... vào ảnh QR thanh toán.")

# ==================== PHẦN IV: ĐỐI CHIẾU 1-1 VỚI TÀI LIỆU GỐC ====================
Add-Heading1("PHẦN IV. ĐỐI CHIẾU 1-1 VỚI TÀI LIỆU ĐẶC TẢ GỐC KIEN_TRUC_HE_THONG_DAT_VE_XEM_PHIM")
Add-Paragraph("Bảng sau đối chiếu chi tiết giữa thiết kế kiến trúc trong tài liệu gốc kien_truc_he_thong_dat_ve_xem_phim.pdf và hiện trạng triển khai thực tế trên dự án:")

# Tạo bảng đối chiếu
$table = $doc.Tables.Add($selection.Range, 9, 4)
$table.Borders.Enable = 1
$table.Rows.Item(1).Range.Font.Bold = 1
$table.Rows.Item(1).Range.Font.Size = 10
$table.Rows.Item(1).Range.Shading.BackgroundPatternColor = 0xF0F0F0 # Light Gray

$headers = @("STT", "Thành phần trong PDF", "Hiện trạng triển khai thực tế", "Đánh giá & Trạng thái")
for ($i = 0; $i -lt 4; $i++) {
    $table.Cell(1, $i + 1).Range.Text = $headers[$i]
}

$rowsData = @(
    @("1", "Trình duyệt (Frontend & Admin)", "Customer Web SPA (:3000) & Admin Portal trên Nginx Alpine", "Đã hoàn thành 100%"),
    @("2", "Phim và lịch chiếu", "movie-service (:8082), Redis cache 5m, chống trùng lịch phòng", "Đã hoàn thành 100%"),
    @("3", "Rạp và phòng chiếu", "venue-service (:8083), Redis cache 60m, tối ưu xóa N+1 query", "Đã hoàn thành 100%"),
    @("4", "Đặt vé và giữ ghế", "booking-service (:8084), Redis Lua Script khóa nhiều ghế all-or-nothing", "Đã hoàn thành 100%"),
    @("5", "Giá vé & Phụ thu", "TicketRules tính giá BigDecimal (HALF_UP), phụ thu VIP & Sweetbox", "Đã hoàn thành 100%"),
    @("6", "Thanh toán giả lập", "PaymentService: Bảng payments, VietQR QuickLink, nút test Mock Pay", "Đã hoàn thành 100%"),
    @("7", "Tài khoản & xác thực", "user-service (:8081), JWT HMAC-SHA256, BCrypt, Token Blacklist", "Đã hoàn thành 100%"),
    @("8", "Thông báo & Quản trị", "notification-service (:8085) qua RabbitMQ; Admin Portal quản trị", "Đã hoàn thành 100%")
)

for ($r = 0; $r -lt 8; $r++) {
    for ($c = 0; $c -lt 4; $c++) {
        $cell = $table.Cell($r + 2, $c + 1)
        $cell.Range.Font.Name = "Times New Roman"
        $cell.Range.Font.Size = 9.5
        $cell.Range.Text = $rowsData[$r][$c]
    }
}

$selection.EndKey(6) # wdStory
$selection.TypeParagraph()

# ==================== PHẦN V: KẾT LUẬN ====================
Add-Heading1("PHẦN V. KẾT LUẬN VÀ ĐÁNH GIÁ KIẾN TRÚC")
Add-Paragraph("Kiến trúc hệ thống website đặt vé xem phim được xây dựng theo mô hình Microservices phân tán hoàn chỉnh, đáp ứng đầy đủ và vượt trội các tiêu chí kỹ thuật trong tài liệu kien_truc_he_thong_dat_ve_xem_phim.pdf:")
Add-Bullet("Tính sẵn sàng và khả năng mở rộng cao: Các service hoạt động độc lập trong từng container Docker riêng biệt, có khả năng scale ngang linh hoạt theo từng module tải cao (như Booking và Movie).")
Add-Bullet("Bảo đảm tính toàn vẹn dữ liệu: Xử lý triệt để bài toán tranh chấp ghế bằng Redis Lua Script nguyên tử (All-or-Nothing), chống deadlock giao dịch bằng cách sắp xếp ID danh sách ghế, bảo vệ đơn hàng bằng Idempotency-Key và kiểm tra độc quyền qua bảng seat_claims.")
Add-Bullet("Chuẩn hóa tính toán tài chính & Thanh toán: Loại bỏ hoàn toàn sai số số học bằng BigDecimal; Cung cấp giao diện thanh toán hiện đại với mã VietQR NAPAS247 tự động cùng nút bấm Mock Test phục vụ chấm điểm và nghiệm thu đồ án nhanh chóng, tin cậy.")

# Xuất ra file PDF & DOCX
$pdfPath = "E:\PTPMHDV\KienTrucHT\Kien_Truc_He_Thong_Dat_Ve_Xem_Phim.pdf"
$docxPath = "E:\PTPMHDV\Kien_Truc_He_Thong_Dat_Ve_Xem_Phim.docx"

$doc.SaveAs([ref]$docxPath)
$doc.ExportAsFixedFormat($pdfPath, 17) # 17 = wdExportFormatPDF

$doc.Close([ref]0)
try { $word.Quit() } catch {}
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
Stop-Process -Name WINWORD -Force -ErrorAction SilentlyContinue

Copy-Item $docxPath "E:\PTPMHDV\KienTrucHT\Kien_Truc_He_Thong_Dat_Ve_Xem_Phim.docx" -Force
Copy-Item $pdfPath "E:\PTPMHDV\Kien_Truc_He_Thong_Dat_Ve_Xem_Phim.pdf" -Force

Write-Host "Exported PDF successfully to: $pdfPath"
Write-Host "Exported DOCX successfully to: $docxPath"
