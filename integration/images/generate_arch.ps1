Add-Type -AssemblyName System.Drawing

function Create-RoundedRectanglePath {
    param($rect, $radius)
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $diameter = $radius * 2
    $arc = New-Object System.Drawing.RectangleF($rect.X, $rect.Y, $diameter, $diameter)
    $path.AddArc($arc, 180, 90)
    $arc.X = $rect.Right - $diameter
    $path.AddArc($arc, 270, 90)
    $arc.Y = $rect.Bottom - $diameter
    $path.AddArc($arc, 0, 90)
    $arc.X = $rect.Left
    $path.AddArc($arc, 90, 90)
    $path.CloseFigure()
    return $path
}

# 1. Architecture Diagram
$bmp = New-Object System.Drawing.Bitmap(1100, 680)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g.Clear([System.Drawing.Color]::FromArgb(248, 250, 252))

$fontTitle = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Bold)
$fontSub = New-Object System.Drawing.Font("Arial", 10, [System.Drawing.FontStyle]::Regular)
$fontBoxHeader = New-Object System.Drawing.Font("Arial", 11, [System.Drawing.FontStyle]::Bold)
$fontBoxText = New-Object System.Drawing.Font("Arial", 9, [System.Drawing.FontStyle]::Regular)
$fontCode = New-Object System.Drawing.Font("Consolas", 8.5)

# Header
$brushDark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))
$g.DrawString("KIẾN TRÚC TÍCH HỢP LIÊN DỊCH VỤ - CINEMA MICROSERVICES", $fontTitle, $brushDark, 30, 25)
$brushMuted = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(100, 116, 139))
$g.DrawString("Mô hình Consumer - Provider, Đồng bộ REST Client & Bất đồng bộ RabbitMQ", $fontSub, $brushMuted, 32, 58)

# Client SPA Box
$rectClient = New-Object System.Drawing.Rectangle(400, 95, 300, 50)
$brushClient = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(238, 242, 255))
$penClient = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(99, 102, 241), 2)
$g.FillRectangle($brushClient, $rectClient)
$g.DrawRectangle($penClient, $rectClient)
$g.DrawString("CLIENT / SPA FRONTEND (Nginx :3000)", $fontBoxHeader, $brushDark, 415, 110)

# API Gateway Box
$rectGw = New-Object System.Drawing.Rectangle(250, 180, 600, 55)
$brushGw = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(254, 243, 199))
$penGw = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(245, 158, 11), 2)
$g.FillRectangle($brushGw, $rectGw)
$g.DrawRectangle($penGw, $rectGw)
$g.DrawString("SPRING CLOUD API GATEWAY (Port :8080)", $fontBoxHeader, $brushDark, 370, 190)
$g.DrawString("Reverse Proxy, JWT Authentication, Global Routing, CorsFilter", $fontBoxText, $brushMuted, 345, 210)

# Services Row
function DrawServiceBox($g, $x, $y, $w, $h, $title, $role, $port, $bg, $border) {
    $rect = New-Object System.Drawing.Rectangle($x, $y, $w, $h)
    $b = New-Object System.Drawing.SolidBrush($bg)
    $p = New-Object System.Drawing.Pen($border, 2)
    $g.FillRectangle($b, $rect)
    $g.DrawRectangle($p, $rect)
    
    $bDark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))
    $bRole = New-Object System.Drawing.SolidBrush($border)
    $bMuted = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(100, 116, 139))
    $fTitle = New-Object System.Drawing.Font("Arial", 10.5, [System.Drawing.FontStyle]::Bold)
    $fRole = New-Object System.Drawing.Font("Arial", 8.5, [System.Drawing.FontStyle]::Bold)
    $fText = New-Object System.Drawing.Font("Arial", 8.5)

    $g.DrawString($title, $fTitle, $bDark, ($x + 10), ($y + 10))
    $g.DrawString($role, $fRole, $bRole, ($x + 10), ($y + 30))
    $g.DrawString("Port: $port", $fText, $bMuted, ($x + 10), ($y + 48))
}

# user-service
DrawServiceBox $g 50 280 220 75 "USER SERVICE" "[Identity Provider]" "8081" ([System.Drawing.Color]::White) ([System.Drawing.Color]::FromArgb(59, 130, 246))

# movie-service
DrawServiceBox $g 310 280 220 75 "MOVIE SERVICE" "[Provider / Consumer]" "8082" ([System.Drawing.Color]::White) ([System.Drawing.Color]::FromArgb(16, 185, 129))

# venue-service
DrawServiceBox $g 570 280 220 75 "VENUE SERVICE" "[Provider / Cache]" "8083" ([System.Drawing.Color]::White) ([System.Drawing.Color]::FromArgb(139, 92, 246))

# booking-service
DrawServiceBox $g 830 280 220 75 "BOOKING SERVICE" "[Core Consumer]" "8084" ([System.Drawing.Color]::White) ([System.Drawing.Color]::FromArgb(239, 68, 68))

# Redis, MySQL, RabbitMQ Infrastructure
$rectInfra = New-Object System.Drawing.Rectangle(50, 420, 1000, 220)
$brushInfra = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(241, 245, 249))
$penInfra = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(203, 213, 225), 2)
$g.FillRectangle($brushInfra, $rectInfra)
$g.DrawRectangle($penInfra, $rectInfra)
$g.DrawString("TẦNG DỮ LIỆU, ĐỒNG BỘ VÀ THÔNG ĐIỆP (DATA & BROKER LAYER)", $fontBoxHeader, $brushDark, 70, 435)

# Redis
$rectRedis = New-Object System.Drawing.Rectangle(80, 475, 280, 140)
$g.FillRectangle([System.Drawing.Brushes]::White, $rectRedis)
$g.DrawRectangle((New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(220, 38, 38), 1.5)), $rectRedis)
$g.DrawString("REDIS (Port 6379)", $fontBoxHeader, [System.Drawing.Brushes]::Crimson, 95, 490)
$g.DrawString("• Lua Script: LOCK_MULTI_SCRIPT`n• Khóa nguyên tử All-or-Nothing`n• Token Blacklist & Room Caching", $fontBoxText, $brushDark, 95, 520)

# RabbitMQ
$rectRabbit = New-Object System.Drawing.Rectangle(410, 475, 280, 140)
$g.FillRectangle([System.Drawing.Brushes]::White, $rectRabbit)
$g.DrawRectangle((New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(234, 88, 12), 1.5)), $rectRabbit)
$g.DrawString("RABBITMQ (Port 5672/15672)", $fontBoxHeader, [System.Drawing.Brushes]::DarkOrange, 425, 490)
$g.DrawString("• Exchange: booking.events (Topic)`n• TICKET_HELD / PAID / CANCELLED`n• Notification Service (:8085)", $fontBoxText, $brushDark, 425, 520)

# MySQL
$rectMySQL = New-Object System.Drawing.Rectangle(740, 475, 280, 140)
$g.FillRectangle([System.Drawing.Brushes]::White, $rectMySQL)
$g.DrawRectangle((New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(37, 99, 235), 1.5)), $rectMySQL)
$g.DrawString("MYSQL 8.0 (Port 3307)", $fontBoxHeader, [System.Drawing.Brushes]::DarkBlue, 755, 490)
$g.DrawString("• Database per Service`n• InnoDB Transaction & ACID`n• Idempotency-Key & Unique Claims", $fontBoxText, $brushDark, 755, 520)

# Connectors
$penArrow = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(71, 85, 105), 2)
$penArrow.CustomEndCap = New-Object System.Drawing.Drawing2D.AdjustableArrowCap(4, 5)

# Client to Gateway
$g.DrawLine($penArrow, 550, 145, 550, 180)

# Gateway to services
$g.DrawLine($penArrow, 350, 235, 160, 280)
$g.DrawLine($penArrow, 480, 235, 420, 280)
$g.DrawLine($penArrow, 620, 235, 680, 280)
$g.DrawLine($penArrow, 750, 235, 940, 280)

# Inter-service calls
$penRest = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(220, 38, 38), 2)
$penRest.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
$penRest.CustomEndCap = New-Object System.Drawing.Drawing2D.AdjustableArrowCap(5, 6)

# Booking to Movie
$g.DrawLine($penRest, 830, 305, 530, 305)
$g.DrawString("HTTP REST: ShowtimeClient", $fontCode, [System.Drawing.Brushes]::Crimson, 600, 360)

# Booking to Venue
$g.DrawLine($penRest, 830, 335, 790, 335)

# Movie to Venue
$g.DrawLine($penRest, 530, 320, 570, 320)

$bmp.Save("E:\PTPMHDV\integration\images\arch_diagram.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
"Arch diagram generated successfully."
