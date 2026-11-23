@echo off
title CafeEase Cafeteria System
echo ===================================================
echo       Launching CafeEase Cafeteria Web App
echo ===================================================
echo.
cd /d "%~dp0"

echo [1/3] Checking MongoDB service...
net start MongoDB >nul 2>&1

echo [2/3] Starting backend server on http://localhost:5000...
echo [3/3] Opening browser...
start http://localhost:5000

node server.js
pause
