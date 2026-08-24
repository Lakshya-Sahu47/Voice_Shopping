@echo off
title Voice Shopping Assistant - Dev Server
echo ====================================
echo  Voice Shopping Assistant
echo  Development Server
echo ====================================
echo.

:: Move to project root directory
cd /d "%~dp0"

echo Checking Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed! Please install Node.js from https://nodejs.org/ to run this app.
    pause
    exit /b 1
)

echo Checking dependencies...
if not exist "node_modules\" (
    echo Dependencies not found. Installing now...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed!
        pause
        exit /b 1
    )
)

echo Starting application...
call npm run dev
