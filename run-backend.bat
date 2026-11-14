@echo off
chcp 65001 > nul
echo ========================================================
echo   KHOI CHAY TOAN BO BACKEND AURA CINEMA (DOCKER)
echo ========================================================
echo.
cd /d "%~dp0"

echo [1/3] Dang khoi dong Database, Cache, RabbitMQ va cac Backend Microservices...
docker compose up -d mysql redis rabbitmq user-service movie-service venue-service booking-service notification-service api-gateway

echo.
echo [2/3] Danh sach cac dich vu Backend dang hoat dong:
docker compose ps mysql redis rabbitmq user-service movie-service venue-service booking-service notification-service api-gateway

echo.
echo [3/3] Toan bo Backend da san sang!
echo --------------------------------------------------------
echo API Gateway            : http://localhost:8080
echo User Service           : http://localhost:8081
echo Movie Service          : http://localhost:8082
echo Venue Service          : http://localhost:8083
echo Booking Service        : http://localhost:8084
echo Notification Service   : http://localhost:8085
echo RabbitMQ Dashboard     : http://localhost:15672 (cinema / cinema123)
echo MySQL Server           : localhost:3307 (cinema / cinema123)
echo Redis Cache            : localhost:6379
echo --------------------------------------------------------
pause
