# Kịch bản khởi chạy Frontend AURA CINEMA trên cổng 3000 bằng Java Web Server có sẵn
$ErrorActionPreference = "Stop"
$dir = $PSScriptRoot

Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host "   AURA CINEMAS - KHỞI CHẠY GIAO DIỆN FRONTEND" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host ">> Địa chỉ truy cập: http://localhost:3000" -ForegroundColor Cyan
Write-Host ">> Kết nối Backend Gateway: http://localhost:8080" -ForegroundColor Cyan
Write-Host ">> Đang mở trình duyệt..."

# Mở trình duyệt
Start-Process "http://localhost:3000"

# Chạy Web Server bằng Java 25 có sẵn trong máy
jwebserver -d "$dir" -p 3000 -b 0.0.0.0
