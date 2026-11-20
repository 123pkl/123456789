@echo off
chcp 65001 >nul
title Demon Frontend - START
cd /d "%~dp0"

echo ============================================================
echo   Demon Slayer FRONTEND startup   (Vue 3 + Vite)
echo ============================================================
echo.

echo [1/4] Checking Node / npm...
where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm not found. Install Node.js and add it to PATH.
    pause
    exit /b 1
)
echo       npm OK.

echo [2/4] Killing any old frontend on port 5173 (avoid port conflict)...
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do (
    echo       Killing old PID=%%P
    taskkill /F /PID %%P >nul 2>&1
)

echo [3/4] Rebuilding node_modules with npm install (wiped on reset)...
call npm install
if errorlevel 1 (
    echo [ERROR] npm install failed. Check your network.
    pause
    exit /b 1
)
echo       Dependencies OK.

echo [4/4] Starting frontend dev server on port 5173...
start "Frontend-5173" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo Starting frontend...
timeout /t 8 /nobreak >nul
echo.
echo ============================================================
echo  Open:     http://localhost:5173/
echo  Login:    http://localhost:5173/#/login
echo  Register: http://localhost:5173/#/register
echo.
echo  NOTE: frontend depends on backend (8081). Start backend first.
echo  Frontend logs are in the separate window "Frontend-5173".
echo ============================================================
if "%~1"=="/silent" exit /b 0
pause
