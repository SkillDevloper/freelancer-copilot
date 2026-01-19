@echo off
chcp 65001 >nul
title Freelancer Copilot - AI Assistant for Freelancers
color 0A

echo ========================================================
echo    🤖 FREELANCER COPILOT - AUTOMATED LAUNCHER
echo ========================================================
echo.

REM Check for required tools
echo [1/4] Checking system requirements...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from: https://nodejs.org
    timeout /t 10
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ ERROR: npm is not installed
    timeout /t 10
    exit /b 1
)

REM Check for Python (optional, for alternative frontend server)
where python >nul 2>nul
if %errorlevel% equ 0 (
    set HAS_PYTHON=1
    echo ✓ Python found (for alternative frontend server)
) else (
    set HAS_PYTHON=0
    echo ! Python not found (will use Node.js serve instead)
)

REM Check if .env file exists
if not exist "backend\.env" (
    echo ⚠ WARNING: backend\.env file not found
    echo Creating default .env file...
    
    echo # AI Provider Configuration (choose one) > backend\.env
    echo #OPENAI_API_KEY=your_openai_api_key_here >> backend\.env
    echo #GEMINI_API_KEY=your_gemini_api_key_here >> backend\.env
    echo. >> backend\.env
    echo # Server Configuration >> backend\.env
    echo PORT=3000 >> backend\.env
    echo NODE_ENV=development >> backend\.env
    echo CORS_ORIGIN=http://localhost:8080 >> backend\.env
    echo. >> backend\.env
    echo # IMPORTANT: Uncomment ONE API key above and add your key >> backend\.env
    
    echo ⚠ Created backend\.env file. Please edit it and add your API key!
    echo Opening .env file for editing...
    timeout /t 3
    notepad backend\.env
    echo.
    echo ⚠ PAUSING: Please edit the .env file and save it, then press any key...
    pause >nul
)

REM Check if dependencies are installed
echo.
echo [2/4] Checking/installing backend dependencies...
cd backend
if not exist "node_modules" (
    echo Installing Node.js dependencies... This may take a minute.
    call npm install --silent
    if %errorlevel% neq 0 (
        echo ❌ Failed to install backend dependencies
        cd ..
        timeout /t 10
        exit /b 1
    )
    echo ✓ Backend dependencies installed
) else (
    echo ✓ Backend dependencies already installed
)
cd ..

echo.
echo [3/4] Starting backend server...
start "Freelancer Copilot - Backend" cmd /k "cd /d %cd%\backend && echo Starting backend on port 3000... && echo. && npm start"
echo ✓ Backend server starting (opens in new window)

echo Waiting for backend to initialize...
timeout /t 5 >nul

echo.
echo [4/4] Starting frontend...
echo Choose frontend server method:
echo 1. Python HTTP Server (Recommended - Simple)
echo 2. Node.js Serve (If Python not available)
echo 3. Direct file open (No server - limited functionality)

choice /c 123 /n /m "Enter your choice (1, 2, or 3): "
set FRONTEND_CHOICE=%errorlevel%

if %FRONTEND_CHOICE% equ 1 (
    if %HAS_PYTHON% equ 0 (
        echo ❌ Python not available. Switching to method 2.
        set FRONTEND_CHOICE=2
    ) else (
        start "Freelancer Copilot - Frontend" cmd /k "cd /d %cd%\frontend && echo Serving on http://localhost:8080 && echo. && python -m http.server 8080"
    )
)

if %FRONTEND_CHOICE% equ 2 (
    echo Checking for serve package...
    cd frontend
    npx serve --version >nul 2>nul
    if %errorlevel% neq 0 (
        echo Installing serve package...
        npm install -g serve
    )
    cd ..
    start "Freelancer Copilot - Frontend" cmd /k "cd /d %cd%\frontend && echo Serving on http://localhost:8080 && echo. && serve -p 8080"
)

if %FRONTEND_CHOICE% equ 3 (
    echo Opening HTML file directly...
    start frontend\index.html
)

echo.
echo ========================================================
echo    🎉 LAUNCH COMPLETE!
echo ========================================================
echo.
echo 🔧 BACKEND:   http://localhost:3000
echo 🎨 FRONTEND:  http://localhost:8080
echo 📊 HEALTH:    http://localhost:3000/health
echo.
echo 📝 IMPORTANT:
echo 1. Wait for both windows to fully load
echo 2. Check backend window for "Server running on port 3000"
echo 3. Open browser to http://localhost:8080
echo 4. If using for first time, edit backend\.env with API key
echo.
echo Press any key to open browser...
pause >nul

REM Open browser
start http://localhost:8080

echo.
echo 🚀 Opening Freelancer Copilot in your browser...
echo.
echo To stop the application:
echo 1. Close both command windows (Backend & Frontend)
echo 2. Or press Ctrl+C in each window
echo.
echo ========================================================
timeout /t 3 >nul