@echo off
chcp 65001 > nul
echo ========================================================
echo   KHOI CHAY HE THONG AURA CINEMA (DOCKER FULL-STACK)
echo ========================================================
echo.
cd /d "%~dp0"
echo [1/3] Dang khoi chay cac container Docker...
docker compose up -d
echo.
echo [2/3] Danh sach cac container dang hoat dong:
docker compose ps
echo.
echo [3/3] He thong da khoi dong thanh cong!
echo --------------------------------------------------------
echo Frontend Web UI : http://localhost:3000 hoac http://127.0.0.1:3000
echo API Gateway     : http://localhost:8080
echo RabbitMQ UI     : http://localhost:15672 (user: cinema, pass: cinema123)
echo MySQL Port      : 3307 (user: cinema, pass: cinema123, root: root123)
echo --------------------------------------------------------
echo.
start http://localhost:3000
pause
