@echo off
chcp 65001 >nul
title Freelancer Copilot - Initial Setup
color 0B

echo ========================================================
echo    🛠️ FREELANCER COPILOT - INITIAL SETUP
echo ========================================================
echo.

echo This script will help you set up Freelancer Copilot.
echo.

REM Check Node.js
echo Checking Node.js installation...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    echo.
    echo Please install Node.js from https://nodejs.org
    echo Choose LTS version (Recommended for Most Users)
    echo.
    echo After installation, restart this script.
    timeout /t 30
    exit /b 1
)

echo ✓ Node.js version:
node --version

echo.
echo Checking npm...
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm not found!
    echo Trying to continue anyway...
) else (
    echo ✓ npm version:
    npm --version
)

echo.
echo Checking project structure...
if not exist "backend" (
    echo ❌ Backend folder not found!
    echo Please make sure you're in the correct directory.
    timeout /t 10
    exit /b 1
)

if not exist "frontend" (
    echo ❌ Frontend folder not found!
    timeout /t 10
    exit /b 1
)

echo ✓ Project structure looks good.
echo.

echo Installing backend dependencies...
cd backend
echo Installing packages (may take a few minutes)...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    cd ..
    timeout /t 10
    exit /b 1
)
cd ..
echo ✓ Backend dependencies installed.
echo.

echo Setting up environment file...
if not exist "backend\.env" (
    echo Creating .env file from template...
    copy "backend\.env.example" "backend\.env" >nul 2>nul
    if exist "backend\.env.example" (
        echo ✓ Created backend\.env from example
    ) else (
        echo Creating basic .env file...
        echo # Add your API key here > backend\.env
        echo OPENAI_API_KEY=your_key_here >> backend\.env
        echo PORT=3000 >> backend\.env
        echo ✓ Created basic .env file
    )
) else (
    echo ✓ .env file already exists
)

echo.
echo ========================================================
echo    ✅ SETUP COMPLETE!
echo ========================================================
echo.
echo Next steps:
echo 1. Edit backend\.env and add your API key
echo    - Get OpenAI key: https://platform.openai.com/api-keys
echo    - Or Gemini key: https://makersuite.google.com/app/apikey
echo.
echo 2. Run 'run-freelancer-copilot.bat' to start the application
echo.
echo 3. Open http://localhost:8080 in your browser
echo.

choice /c yn /n /m "Do you want to edit the .env file now? (y/n): "
if %errorlevel% equ 1 (
    notepad backend\.env
    echo.
    echo ⚠ Remember to save the file after editing!
)

echo.
echo Press any key to finish setup...
pause >nul

REM Offer to run the main script
echo.
choice /c yn /n /m "Do you want to run Freelancer Copilot now? (y/n): "
if %errorlevel% equ 1 (
    echo Starting Freelancer Copilot...
    timeout /t 2
    call run-freelancer-copilot.bat
)

exit /b 0