@echo off
echo ========================================
echo    AutoForge AI - Starting All Services
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

echo [INFO] All prerequisites found!
echo.
echo Starting services in separate windows...
echo.

REM Start Backend (Node.js)
echo [1/3] Starting Backend API (Port 5000)...
start "AutoForge Backend" cmd /k "cd /d %~dp0backend && npm start"
timeout /t 3 /nobreak >nul

REM Start ML Engine (Python)
echo [2/3] Starting ML Engine (Port 5001)...
start "AutoForge ML Engine" cmd /k "cd /d %~dp0ml-engine && python app.py"
timeout /t 3 /nobreak >nul

REM Start Frontend (React)
echo [3/3] Starting Frontend (Port 3000)...
start "AutoForge Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo ========================================
echo    All services started successfully!
echo ========================================
echo.
echo Services running:
echo   - Frontend:  http://localhost:3000
echo   - Backend:   http://localhost:5000
echo   - ML Engine: http://localhost:5001
echo.
echo Press any key to close this window (services will continue running)...
pause >nul
