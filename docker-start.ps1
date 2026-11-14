# ==============================================================================
# Script khởi chạy toàn bộ hệ thống AURA CINEMA trên Docker
# ==============================================================================
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  KHỞI CHẠY HỆ THỐNG AURA CINEMA (DOCKER FULL-STACK)    " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# Di chuyển về thư mục gốc dự án
Set-Location -Path $PSScriptRoot

# Chạy Docker Compose
Write-Host "[1/3] Đang khởi chạy các container (Database, Redis, RabbitMQ, Microservices, Nginx)..." -ForegroundColor Yellow
docker compose up -d

Write-Host "`n[2/3] Kiểm tra trạng thái các container..." -ForegroundColor Yellow
docker compose ps

Write-Host "`n[3/3] Hệ thống đã sẵn sàng!" -ForegroundColor Green
Write-Host "--------------------------------------------------------" -ForegroundColor White
Write-Host "🌐 Frontend Web UI:    http://localhost:3000" -ForegroundColor Green
Write-Host "🚀 API Gateway:        http://localhost:8080" -ForegroundColor Green
Write-Host "🐰 RabbitMQ UI:        http://localhost:15672 (user: cinema, pass: cinema123)" -ForegroundColor Green
Write-Host "🗄️ MySQL Database:    localhost:3307 (user: cinema, pass: cinema123)" -ForegroundColor Green
Write-Host "--------------------------------------------------------" -ForegroundColor White

# Mở trình duyệt vào trang web
Start-Process "http://localhost:3000"
