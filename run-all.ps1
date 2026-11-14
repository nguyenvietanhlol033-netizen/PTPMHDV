# Kịch bản khởi chạy đồng thời Backend (5 Services + Gateway 8080) và Frontend (Port 3000)
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host "   CINEMA SYSTEM - KHỞI CHẠY TOÀN BỘ BACKEND & FRONTEND" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Yellow

# 1. Khởi động Frontend trên port 3000
Write-Host ">> Đang mở Frontend (http://localhost:3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit","-Command",
    "Set-Location '$root\frontend'; .\run-frontend.ps1"

# 2. Khởi động Backend (Docker + Gateway + 5 Services)
Write-Host ">> Đang khởi động Backend Microservices..." -ForegroundColor Cyan
Set-Location "$root\backend"
.\run-dev.ps1
