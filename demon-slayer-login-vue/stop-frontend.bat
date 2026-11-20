@echo off
chcp 65001 >nul
title Demon Frontend - STOP
echo Stopping frontend listening on port 5173...
setlocal enabledelayedexpansion
set FOUND=0
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do (
    echo   Killing PID=%%P
    taskkill /F /PID %%P >nul 2>&1
    set FOUND=1
)
if "!FOUND!"=="0" echo   No running frontend found.
endlocal
echo Done.
if "%~1"=="/silent" exit /b 0
pause
