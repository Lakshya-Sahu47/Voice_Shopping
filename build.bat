@echo off
title Voice Shopping Assistant - Production Build
echo ====================================
echo  Voice Shopping Assistant
echo  Production Build
echo ====================================
echo.

:: Move to project root directory
cd /d "%~dp0"

echo Checking Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed! Please install Node.js from https://nodejs.org/ to run this build.
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

echo Building...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ====================================
    echo [ERROR] Build failed! Check compiler logs above.
    echo ====================================
    pause
    exit /b 1
)

echo.
echo ====================================
echo Build completed successfully.
echo Output: dist\
echo ====================================
pause
