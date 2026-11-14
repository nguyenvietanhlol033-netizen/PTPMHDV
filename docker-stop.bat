@echo off
chcp 65001 > nul
echo ========================================================
echo   DUNG HE THONG AURA CINEMA (DOCKER FULL-STACK)
echo ========================================================
echo.
cd /d "%~dp0"
echo Dang dung cac container Docker...
docker compose down
echo.
echo Da dung thanh cong toan bo he thong!
pause
