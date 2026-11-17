@echo off
title Push CafeEase to GitHub
echo ===================================================
echo             Pushing CafeEase to GitHub
echo ===================================================
echo.
cd /d "%~dp0"

echo [1/3] Adding changes...
git add .

echo [2/3] Checking commit...
git commit -m "Update: Professional UI and MongoDB table ordering system" >nul 2>&1

echo [3/3] Pushing to GitHub (origin/main)...
echo.
git branch -M main
git push -u origin main

echo.
if %ERRORLEVEL% equ 0 (
    echo ===================================================
    echo [SUCCESS] Successfully pushed to GitHub!
    echo ===================================================
) else (
    echo ===================================================
    echo If push failed, make sure:
    echo 1. You created the repository on GitHub:
    echo    https://github.com/new (Name: cafeease)
    echo 2. You signed in when the GitHub browser prompt appeared.
    echo ===================================================
)

echo.
pause
