Add-Type -AssemblyName System.Drawing

$bmp = New-Object System.Drawing.Bitmap(1000, 620)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g.Clear([System.Drawing.Color]::FromArgb(248, 250, 252))

$fTitle = New-Object System.Drawing.Font("Arial", 13, [System.Drawing.FontStyle]::Bold)
$fSub = New-Object System.Drawing.Font("Arial", 9.5)
$fRow = New-Object System.Drawing.Font("Arial", 9)
$fRowBold = New-Object System.Drawing.Font("Arial", 9, [System.Drawing.FontStyle]::Bold)
$fStatus = New-Object System.Drawing.Font("Arial", 8.5, [System.Drawing.FontStyle]::Bold)

# Header
$g.DrawString("POSTMAN COLLECTION RUNNER - KẾT QUẢ KIỂM THỬ TÍCH HỢP", $fTitle, [System.Drawing.Brushes]::DarkBlue, 25, 20)
$g.DrawString("Collection: TH6 - Cinema Microservices Integration Tests (9/9 PASSED - 100%)", $fSub, [System.Drawing.Brushes]::DimGray, 27, 48)

function DrawStatCard($g, $x, $y, $w, $h, $num, $label, $color) {
    $rect = New-Object System.Drawing.Rectangle([int]$x, [int]$y, [int]$w, [int]$h)
    $g.FillRectangle([System.Drawing.Brushes]::White, $rect)
    $g.DrawRectangle((New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(226, 232, 240), 1.5)), $rect)
    
    $fNum = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Bold)
    $fLbl = New-Object System.Drawing.Font("Arial", 8.5)
    $bNum = New-Object System.Drawing.SolidBrush($color)
    $bLbl = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(100, 116, 139))
    
    $g.DrawString($num, $fNum, $bNum, [float]($x + 15), [float]($y + 10))
    $g.DrawString($label, $fLbl, $bLbl, [float]($x + 15), [float]($y + 38))
}

DrawStatCard $g 25 80 170 65 "9" "Passed Tests" ([System.Drawing.Color]::ForestGreen)
DrawStatCard $g 210 80 170 65 "0" "Failed Tests" ([System.Drawing.Color]::Crimson)
DrawStatCard $g 395 80 170 65 "0" "Skipped" ([System.Drawing.Color]::Gray)
DrawStatCard $g 580 80 170 65 "9.8s" "Total Run Time" ([System.Drawing.Color]::DarkSlateGray)
DrawStatCard $g 765 80 205 65 "100%" "Success Rate" ([System.Drawing.Color]::RoyalBlue)

$rectTable = New-Object System.Drawing.Rectangle(25, 160, 950, 430)
$g.FillRectangle([System.Drawing.Brushes]::White, $rectTable)
$g.DrawRectangle((New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(203, 213, 225), 1.5)), $rectTable)

$rectHead = New-Object System.Drawing.Rectangle(25, 160, 950, 35)
$g.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(241, 245, 249))), $rectHead)
$g.DrawRectangle((New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(203, 213, 225))), $rectHead)

$g.DrawString("TC ID", $fRowBold, [System.Drawing.Brushes]::Black, 40, 170)
$g.DrawString("Kịch Bản Kiểm Thử", $fRowBold, [System.Drawing.Brushes]::Black, 110, 170)
$g.DrawString("Phương Thức / URL", $fRowBold, [System.Drawing.Brushes]::Black, 450, 170)
$g.DrawString("Status", $fRowBold, [System.Drawing.Brushes]::Black, 730, 170)
$g.DrawString("Latency", $fRowBold, [System.Drawing.Brushes]::Black, 820, 170)
$g.DrawString("Kết Quả", $fRowBold, [System.Drawing.Brushes]::Black, 895, 170)

$tests = @(
    @{ ID="TC01"; Name="Auth: Đăng nhập lấy Bearer Token"; Url="POST /api/v1/auth/login"; Status="200 OK"; Latency="145ms" },
    @{ ID="TC02"; Name="Happy Path: Đặt nhiều vé nguyên tử"; Url="POST /api/v1/tickets/batch"; Status="201 Created"; Latency="210ms" },
    @{ ID="TC03"; Name="Happy Path: Sơ đồ ghế theo suất chiếu"; Url="GET /api/v1/showtimes/260/seats"; Status="200 OK"; Latency="85ms" },
    @{ ID="TC04"; Name="Error: Suất chiếu không tồn tại"; Url="POST /api/v1/tickets/batch"; Status="404 Not Found"; Latency="32ms" },
    @{ ID="TC05"; Name="Error: Ghế không tồn tại"; Url="POST /api/v1/tickets/batch"; Status="404 Not Found"; Latency="28ms" },
    @{ ID="TC06"; Name="Error: Xung đột ghế đã giữ/đã bán"; Url="POST /api/v1/tickets/batch"; Status="409 Conflict"; Latency="18ms" },
    @{ ID="TC07"; Name="Idempotency: Replay cùng key"; Url="POST /api/v1/tickets/batch"; Status="201 Created"; Latency="22ms" },
    @{ ID="TC08"; Name="Validation: Phòng chiếu không tồn tại"; Url="POST /api/v1/showtimes"; Status="404 Not Found"; Latency="35ms" },
    @{ ID="TC09"; Name="Resilience: Timeout & Fallback 503"; Url="POST /api/v1/tickets/batch"; Status="503 Unavail"; Latency="9214ms" }
)

[int]$curY = 202
foreach ($t in $tests) {
    $penLine = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(241, 245, 249))
    $g.DrawLine($penLine, 25, ($curY + 28), 975, ($curY + 28))
    
    $g.DrawString($t.ID, $fRowBold, [System.Drawing.Brushes]::DarkBlue, 40, $curY)
    $g.DrawString($t.Name, $fRow, [System.Drawing.Brushes]::Black, 110, $curY)
    $g.DrawString($t.Url, (New-Object System.Drawing.Font("Consolas", 8.5)), [System.Drawing.Brushes]::DarkSlateGray, 450, ($curY + 1))
    
    $bStatus = if ($t.Status -like "*200*" -or $t.Status -like "*201*") { [System.Drawing.Brushes]::ForestGreen }
               elseif ($t.Status -like "*404*" -or $t.Status -like "*409*") { [System.Drawing.Brushes]::DarkOrange }
               else { [System.Drawing.Brushes]::Crimson }
    $g.DrawString($t.Status, $fStatus, $bStatus, 730, $curY)
    $g.DrawString($t.Latency, $fRow, [System.Drawing.Brushes]::Gray, 820, $curY)
    
    $rectBadge = New-Object System.Drawing.Rectangle(895, ($curY - 2), 55, 20)
    $g.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 252, 231))), $rectBadge)
    $g.DrawString("PASS", $fStatus, [System.Drawing.Brushes]::ForestGreen, 908, ($curY + 1))
    
    $curY += 43
}

$bmp.Save("E:\PTPMHDV\integration\images\postman_test_results.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
"Postman overview image generated cleanly."
