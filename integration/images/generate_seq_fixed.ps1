Add-Type -AssemblyName System.Drawing

function Draw-ActorHeader($g, $x, $y, $w, $h, $name, $sub, $color) {
    $rect = New-Object System.Drawing.Rectangle([int]$x, [int]$y, [int]$w, [int]$h)
    $b = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $p = New-Object System.Drawing.Pen($color, 2)
    $g.FillRectangle($b, $rect)
    $g.DrawRectangle($p, $rect)
    
    $fName = New-Object System.Drawing.Font("Arial", 9.0, [System.Drawing.FontStyle]::Bold)
    $fSub = New-Object System.Drawing.Font("Arial", 8.0)
    $bDark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))
    $bSub = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(100, 116, 139))
    
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    
    $rectText1 = New-Object System.Drawing.Rectangle([int]$x, [int]($y + 4), [int]$w, 20)
    $rectText2 = New-Object System.Drawing.Rectangle([int]$x, [int]($y + 24), [int]$w, 18)
    $g.DrawString($name, $fName, $bDark, $rectText1, $sf)
    $g.DrawString($sub, $fSub, $bSub, $rectText2, $sf)
}

function Draw-Message($g, $x1, $x2, $y, $text, $num, $isReturn, $color) {
    $pen = New-Object System.Drawing.Pen($color, 1.8)
    if ($isReturn) {
        $pen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
    }
    $pen.CustomEndCap = New-Object System.Drawing.Drawing2D.AdjustableArrowCap(4, 5)
    $g.DrawLine($pen, [int]$x1, [int]$y, [int]$x2, [int]$y)
    
    $fText = New-Object System.Drawing.Font("Arial", 8.5)
    $bText = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30, 41, 59))
    
    $midX = [Math]::Min($x1, $x2) + [Math]::Abs($x2 - $x1) / 2
    $str = if ($num) { "($num) $text" } else { $text }
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString($str, $fText, $bText, [float]$midX, [float]($y - 18), $sf)
}

# 1. Happy Path
$bmp = New-Object System.Drawing.Bitmap(1050, 720)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g.Clear([System.Drawing.Color]::FromArgb(250, 250, 252))

$fTitle = New-Object System.Drawing.Font("Arial", 13.5, [System.Drawing.FontStyle]::Bold)
$fSub = New-Object System.Drawing.Font("Arial", 9.5)
$g.DrawString("SƠ ĐỒ TUẦN TỰ 1: ĐẶT NHIỀU VÉ NGUYÊN TỬ THÀNH CÔNG (HAPPY PATH)", $fTitle, [System.Drawing.Brushes]::Navy, 25, 20)
$g.DrawString("Tích hợp Booking Service (Consumer) với Movie & Venue (Providers), Redis Lua Script và RabbitMQ", $fSub, [System.Drawing.Brushes]::DimGray, 27, 48)

$xClient = 70; $xGw = 220; $xBooking = 400; $xMovie = 570; $xVenue = 720; $xRedis = 850; $xMySQL = 970
$actors = @(
    @{ X = $xClient; Name = "Khách Hàng"; Sub = "SPA Frontend"; Color = [System.Drawing.Color]::SlateGray },
    @{ X = $xGw; Name = "API Gateway"; Sub = ":8080"; Color = [System.Drawing.Color]::Orange },
    @{ X = $xBooking; Name = "Booking Service"; Sub = "Consumer (:8084)"; Color = [System.Drawing.Color]::Crimson },
    @{ X = $xMovie; Name = "Movie Service"; Sub = "Provider (:8082)"; Color = [System.Drawing.Color]::SeaGreen },
    @{ X = $xVenue; Name = "Venue Service"; Sub = "Provider (:8083)"; Color = [System.Drawing.Color]::MediumPurple },
    @{ X = $xRedis; Name = "Redis Cache"; Sub = "Lua Lock (:6379)"; Color = [System.Drawing.Color]::Red },
    @{ X = $xMySQL; Name = "MySQL DB"; Sub = "Transaction (:3307)"; Color = [System.Drawing.Color]::RoyalBlue }
)
$penLife = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(226, 232, 240), 1.5)
$penLife.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash

foreach ($a in $actors) {
    Draw-ActorHeader $g ($a.X - 55) 75 110 46 $a.Name $a.Sub $a.Color
    $g.DrawLine($penLife, [int]$a.X, 125, [int]$a.X, 690)
}

Draw-Message $g $xClient $xGw 160 "POST /api/v1/tickets/batch (showtimeId=260, seatIds=[1,21])" 1 $false ([System.Drawing.Color]::Black)
Draw-Message $g $xGw $xBooking 195 "Forward request with validated JWT & Idempotency-Key" 2 $false ([System.Drawing.Color]::DarkSlateGray)
Draw-Message $g $xBooking $xMovie 235 "GET /api/v1/showtimes/260 (ShowtimeClient)" 3 $false ([System.Drawing.Color]::SeaGreen)
Draw-Message $g $xMovie $xBooking 265 "200 OK {price: 100.000đ, status: OPEN}" "" $true ([System.Drawing.Color]::SeaGreen)
Draw-Message $g $xBooking $xVenue 310 "GET /api/v1/seats/1 & /seats/21 (SeatClient)" 4 $false ([System.Drawing.Color]::MediumPurple)
Draw-Message $g $xVenue $xBooking 340 "200 OK [Seat 1: NORMAL, Seat 21: VIP]" "" $true ([System.Drawing.Color]::MediumPurple)

$rectNote1 = New-Object System.Drawing.Rectangle(290, 375, 230, 34)
$g.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(254, 249, 195))), $rectNote1)
$g.DrawRectangle([System.Drawing.Pens]::Goldenrod, $rectNote1)
$g.DrawString("BigDecimal: 100k + (100k+20k) = 220.000đ", (New-Object System.Drawing.Font("Arial", 8)), [System.Drawing.Brushes]::Black, 295, 385)

Draw-Message $g $xBooking $xRedis 435 "EVALSHA LOCK_MULTI_SCRIPT (seatIds: [1, 21])" 5 $false ([System.Drawing.Color]::Red)
Draw-Message $g $xRedis $xBooking 465 "Return 1 (All-or-Nothing Locked, TTL 900s)" "" $true ([System.Drawing.Color]::Red)
Draw-Message $g $xBooking $xMySQL 510 "INSERT INTO tickets & seat_claims (COMMIT)" 6 $false ([System.Drawing.Color]::RoyalBlue)
Draw-Message $g $xMySQL $xBooking 540 "Transaction Committed Successfully" "" $true ([System.Drawing.Color]::RoyalBlue)

$rectNote2 = New-Object System.Drawing.Rectangle(320, 565, 290, 32)
$g.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(254, 237, 213))), $rectNote2)
$g.DrawRectangle([System.Drawing.Pens]::DarkOrange, $rectNote2)
$g.DrawString("afterCommit(): Publish 'TICKET_HELD' to RabbitMQ", (New-Object System.Drawing.Font("Arial", 8, [System.Drawing.FontStyle]::Bold)), [System.Drawing.Brushes]::DarkOrange, 325, 574)

Draw-Message $g $xBooking $xGw 625 "201 Created (List of 2 booked tickets)" 7 $true ([System.Drawing.Color]::ForestGreen)
Draw-Message $g $xGw $xClient 660 "201 Created -> Render Payment Countdown (15:00)" 8 $true ([System.Drawing.Color]::ForestGreen)

$bmp.Save("E:\PTPMHDV\integration\images\seq_happy_path.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

# 2. Seat Conflict
$bmp2 = New-Object System.Drawing.Bitmap(950, 550)
$g2 = [System.Drawing.Graphics]::FromImage($bmp2)
$g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g2.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g2.Clear([System.Drawing.Color]::FromArgb(250, 250, 252))

$g2.DrawString("SƠ ĐỒ TUẦN TỰ 2: XỬ LÝ XUNG ĐỘT GHẾ (409 CONFLICT)", $fTitle, [System.Drawing.Brushes]::Crimson, 25, 20)
$g2.DrawString("Hai khách hàng cùng đặt ghế #173 (SWEETBOX) cùng lúc - Cơ chế All-or-Nothing", $fSub, [System.Drawing.Brushes]::DimGray, 27, 48)

$xA = 80; $xB = 250; $xBook = 500; $xRed = 720; $xSQL = 880
$actors2 = @(
    @{ X = $xA; Name = "Khách Hàng A"; Sub = "Đến trước 1ms"; Color = [System.Drawing.Color]::DarkGreen },
    @{ X = $xB; Name = "Khách Hàng B"; Sub = "Đến sau 1ms"; Color = [System.Drawing.Color]::DarkRed },
    @{ X = $xBook; Name = "Booking Service"; Sub = ":8084"; Color = [System.Drawing.Color]::Crimson },
    @{ X = $xRed; Name = "Redis Server"; Sub = "Lua Script"; Color = [System.Drawing.Color]::Red },
    @{ X = $xSQL; Name = "MySQL DB"; Sub = "Storage"; Color = [System.Drawing.Color]::RoyalBlue }
)
foreach ($a in $actors2) {
    Draw-ActorHeader $g2 ($a.X - 55) 75 110 46 $a.Name $a.Sub $a.Color
    $g2.DrawLine($penLife, [int]$a.X, 125, [int]$a.X, 520)
}

Draw-Message $g2 $xA $xBook 160 "POST /api/v1/tickets/batch (seatId: 173)" 1 $false ([System.Drawing.Color]::DarkGreen)
Draw-Message $g2 $xBook $xRed 190 "LOCK_MULTI_SCRIPT (Ghế 173 - Khách A)" 2 $false ([System.Drawing.Color]::Red)
Draw-Message $g2 $xRed $xBook 215 "1 (Khóa thành công)" "" $true ([System.Drawing.Color]::Red)
Draw-Message $g2 $xBook $xSQL 245 "INSERT INTO tickets & claims" 3 $false ([System.Drawing.Color]::RoyalBlue)
Draw-Message $g2 $xBook $xA 280 "201 Created (Khách A giữ ghế thành công)" 4 $true ([System.Drawing.Color]::DarkGreen)

Draw-Message $g2 $xB $xBook 330 "POST /api/v1/tickets/batch (seatId: 173)" 5 $false ([System.Drawing.Color]::DarkRed)
Draw-Message $g2 $xBook $xRed 365 "LOCK_MULTI_SCRIPT (Ghế 173 - Khách B)" 6 $false ([System.Drawing.Color]::Red)
Draw-Message $g2 $xRed $xBook 395 "0 (Ghế 173 ĐÃ BỊ KHÓA)" "" $true ([System.Drawing.Color]::Red)

$rectNote3 = New-Object System.Drawing.Rectangle(360, 420, 280, 30)
$g2.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(254, 226, 226))), $rectNote3)
$g2.DrawRectangle([System.Drawing.Pens]::Crimson, $rectNote3)
$g2.DrawString("Rollback: Không khóa ghế nào, không ghi DB", (New-Object System.Drawing.Font("Arial", 8)), [System.Drawing.Brushes]::Crimson, 365, 428)

Draw-Message $g2 $xBook $xB 480 "409 Conflict: 'Ghế vừa được người khác giữ hoặc đã bán!'" 7 $true ([System.Drawing.Color]::Crimson)

$bmp2.Save("E:\PTPMHDV\integration\images\seq_seat_conflict.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp2.Dispose()

# 3. Timeout Fallback
$bmp3 = New-Object System.Drawing.Bitmap(950, 580)
$g3 = [System.Drawing.Graphics]::FromImage($bmp3)
$g3.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g3.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g3.Clear([System.Drawing.Color]::FromArgb(250, 250, 252))

$g3.DrawString("SƠ ĐỒ TUẦN TỰ 3: CHỊU LỖI TIMEOUT, RETRY 3 LẦN & FALLBACK 503", $fTitle, [System.Drawing.Brushes]::DarkSlateGray, 25, 20)
$g3.DrawString("Khi Venue Service bị dừng/quá tải: RemoteCaller tự động Retry 3 lần với Backoff 200ms", $fSub, [System.Drawing.Brushes]::DimGray, 27, 48)

$xC = 80; $xBk = 300; $xRem = 550; $xVen = 820
$actors3 = @(
    @{ X = $xC; Name = "Client / SPA"; Sub = "Khách Hàng"; Color = [System.Drawing.Color]::SlateGray },
    @{ X = $xBk; Name = "Booking Service"; Sub = "Controller"; Color = [System.Drawing.Color]::Navy },
    @{ X = $xRem; Name = "RemoteCaller"; Sub = "RetryExecutor"; Color = [System.Drawing.Color]::DarkOrange },
    @{ X = $xVen; Name = "Venue Service"; Sub = "DOWN / TREO"; Color = [System.Drawing.Color]::Red }
)
foreach ($a in $actors3) {
    Draw-ActorHeader $g3 ($a.X - 60) 75 120 46 $a.Name $a.Sub $a.Color
    $g3.DrawLine($penLife, [int]$a.X, 125, [int]$a.X, 550)
}

Draw-Message $g3 $xC $xBk 160 "POST /api/v1/tickets/batch (seatId: 10)" 1 $false ([System.Drawing.Color]::Black)
Draw-Message $g3 $xBk $xRem 190 "get('venue-service', () -> getSeat(10))" 2 $false ([System.Drawing.Color]::DarkOrange)

Draw-Message $g3 $xRem $xVen 225 "Lần 1: GET /api/v1/seats/10" 3 $false ([System.Drawing.Color]::Red)
$g3.DrawString("[Chờ 3000ms Timeout / Connection Refused] -> Backoff 200ms", (New-Object System.Drawing.Font("Arial", 8, [System.Drawing.FontStyle]::Italic)), [System.Drawing.Brushes]::DimGray, 560, 240)

Draw-Message $g3 $xRem $xVen 280 "Lần 2: Thử lại (Retry 1)" 4 $false ([System.Drawing.Color]::Red)
$g3.DrawString("[Chờ 3000ms Timeout / Connection Refused] -> Backoff 200ms", (New-Object System.Drawing.Font("Arial", 8, [System.Drawing.FontStyle]::Italic)), [System.Drawing.Brushes]::DimGray, 560, 295)

Draw-Message $g3 $xRem $xVen 335 "Lần 3: Thử lại lần cuối (Retry 2)" 5 $false ([System.Drawing.Color]::Red)
$g3.DrawString("[Chờ 3000ms Timeout / Connection Refused]", (New-Object System.Drawing.Font("Arial", 8, [System.Drawing.FontStyle]::Italic)), [System.Drawing.Brushes]::DimGray, 560, 350)

$rectNote4 = New-Object System.Drawing.Rectangle(410, 385, 340, 42)
$g3.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(254, 242, 242))), $rectNote4)
$g3.DrawRectangle([System.Drawing.Pens]::Red, $rectNote4)
$g3.DrawString("KÍCH HOẠT FALLBACK (Quá 3 lần thử):`nThrow ServiceUnavailableException (Fail-Closed)", (New-Object System.Drawing.Font("Arial", 8.5, [System.Drawing.FontStyle]::Bold)), [System.Drawing.Brushes]::Red, 415, 390)

Draw-Message $g3 $xRem $xBk 465 "Throw ServiceUnavailableException" "" $true ([System.Drawing.Color]::Red)
Draw-Message $g3 $xBk $xC 505 "503 Service Unavailable: 'venue-service tạm thời không khả dụng'" 6 $true ([System.Drawing.Color]::Red)

$bmp3.Save("E:\PTPMHDV\integration\images\seq_timeout_fallback.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp3.Dispose()
"All 3 sequence diagrams generated cleanly."
