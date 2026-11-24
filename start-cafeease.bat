@echo off
title CafeEase Cafeteria Server
echo =========================================================
echo             CafeEase Server & Database Manager
echo =========================================================
echo.
cd /d "%~dp0"

echo [1/3] Verifying MongoDB service...
net start MongoDB >nul 2>&1

echo [2/3] Starting Express Server with Auto-Reconnect...
echo [3/3] Opening browser at http://localhost:5000...
echo.
echo *********************************************************
echo *  IMPORTANT: Keep this window OPEN while using CafeEase!
echo *  If you close this window, the database will disconnect.
echo *********************************************************
echo.

start http://localhost:5000
node server.js

echo.
echo Server stopped. Press any key to exit...
pause >nul
