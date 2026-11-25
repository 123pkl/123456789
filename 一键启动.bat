@echo off
chcp 65001 >nul
title Kimetsu START
cd /d "%~dp0"

echo ============================================================
echo   Demon Slayer Login - ALL-IN-ONE START
echo   Backend : 8081   Frontend : 5173
echo ============================================================

set BACKEND_DIR=D:\workSpace\springBootTest
set FRONTEND_DIR=%~dp0demon-slayer-login-vue
set JAR=%BACKEND_DIR%\target\springBootTest-0.0.1-SNAPSHOT.jar

echo.
echo [1/6] Stopping any old service on 8081 / 5173 ...
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":8081" ^| findstr "LISTENING"') do taskkill /F /PID %%P >nul 2>&1
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do taskkill /F /PID %%P >nul 2>&1

echo [2/6] Checking backend source ...
if not exist "%BACKEND_DIR%\pom.xml" (
    echo [ERROR] Backend not found at %BACKEND_DIR%
    pause
    exit /b 1
)

echo [3/6] Building backend (rebuild after reset) ...
set MAVEN_OPTS=-Dfile.encoding=UTF-8
pushd "%BACKEND_DIR%"
call .\mvnw.cmd -q -DskipTests clean package
if errorlevel 1 (
    echo [ERROR] Backend build failed. Check Maven / network.
    popd
    pause
    exit /b 1
)
popd
echo       Backend jar ready.

echo [4/6] Starting backend on 8081 ...
start "Kimetsu-Backend-8081" cmd /k "cd /d %BACKEND_DIR% && java -Dfile.encoding=UTF-8 -jar target\springBootTest-0.0.1-SNAPSHOT.jar --server.port=8081"

echo [5/6] Checking frontend dependencies ...
pushd "%FRONTEND_DIR%"
if not exist "node_modules" (
    echo       node_modules missing, running npm install ...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed. Check network.
        popd
        pause
        exit /b 1
    )
)
popd

echo [6/6] Starting frontend on 5173 ...
start "Kimetsu-Frontend-5173" cmd /k "cd /d %FRONTEND_DIR% && npm run dev"

echo.
echo Waiting for services to warm up (12s) ...
timeout /t 12 /nobreak >nul

echo.
echo ============================================================
echo  Frontend : http://localhost:5173/
echo  Login    : http://localhost:5173/#/login
echo  Backend  : http://localhost:8081/api/auth/ping
echo  Logs     : windows "Kimetsu-Backend-8081" / "Kimetsu-Frontend-5173"
echo ============================================================
pause
