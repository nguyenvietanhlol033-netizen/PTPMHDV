# ==============================================================================
# Script dừng toàn bộ hệ thống AURA CINEMA trên Docker
# ==============================================================================
Write-Host "========================================================" -ForegroundColor Yellow
Write-Host "  DỪNG HỆ THỐNG AURA CINEMA (DOCKER COMPOSE DOWN)        " -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Yellow

Set-Location -Path $PSScriptRoot

Write-Host "Đang dừng và dọn dẹp các container..." -ForegroundColor Cyan
docker compose down

Write-Host "`nĐã dừng thành công toàn bộ hệ thống!" -ForegroundColor Green
