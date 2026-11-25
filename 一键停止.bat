@echo off
chcp 65001 >nul
title Kimetsu STOP
cd /d "%~dp0"

echo Stopping services on 8081 / 5173 ...
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":8081" ^| findstr "LISTENING"') do (
    echo   Killing backend PID=%%P
    taskkill /F /PID %%P >nul 2>&1
)
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do (
    echo   Killing frontend PID=%%P
    taskkill /F /PID %%P >nul 2>&1
)
echo Done.
timeout /t 2 /nobreak >nul
