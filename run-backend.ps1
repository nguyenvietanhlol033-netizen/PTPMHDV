# ==============================================================================
# Script khởi chạy toàn bộ Backend AURA CINEMA
# ==============================================================================
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   KHỞI CHẠY TOÀN BỘ BACKEND AURA CINEMA (MICROSERVICES) " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

Set-Location $PSScriptRoot

Write-Host "[1/3] Đang khởi động MySQL, Redis, RabbitMQ & 6 Microservices..." -ForegroundColor Yellow
docker compose up -d mysql redis rabbitmq user-service movie-service venue-service booking-service notification-service api-gateway

Write-Host "`n[2/3] Kiểm tra trạng thái các service..." -ForegroundColor Yellow
docker compose ps mysql redis rabbitmq user-service movie-service venue-service booking-service notification-service api-gateway

Write-Host "`n[3/3] Toàn bộ Backend đã hoạt động ổn định!" -ForegroundColor Green
Write-Host "--------------------------------------------------------" -ForegroundColor White
Write-Host "🚀 API Gateway:            http://localhost:8080" -ForegroundColor Green
Write-Host "👤 User Service:           http://localhost:8081" -ForegroundColor Green
Write-Host "🎬 Movie Service:          http://localhost:8082" -ForegroundColor Green
Write-Host "🏛️ Venue Service:          http://localhost:8083" -ForegroundColor Green
Write-Host "🎟️ Booking Service:        http://localhost:8084" -ForegroundColor Green
Write-Host "🔔 Notification Service:   http://localhost:8085" -ForegroundColor Green
Write-Host "🐰 RabbitMQ Dashboard:     http://localhost:15672 (cinema / cinema123)" -ForegroundColor Green
Write-Host "🗄️ MySQL Server:          localhost:3307 (cinema / cinema123)" -ForegroundColor Green
Write-Host "⚡ Redis Cache:            localhost:6379" -ForegroundColor Green
Write-Host "--------------------------------------------------------" -ForegroundColor White
