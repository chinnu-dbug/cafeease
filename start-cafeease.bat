@echo off
title CafeEase Cafeteria System
echo ===================================================
echo       Launching CafeEase Cafeteria Web App
echo ===================================================
echo.
cd /d "%~dp0"
echo [1/2] Connecting to MongoDB: mongodb://127.0.0.1:27017/cafeease
echo [2/2] Starting server at http://localhost:5000
echo.
start http://localhost:5000
node server.js
pause
