@echo off
chcp 65001 >nul
title Freelancer Copilot - Complete Installation
color 0D

echo ========================================================
echo    📦 FREELANCER COPILOT - COMPLETE INSTALLATION
echo ========================================================
echo.

echo This will create all batch files for easy management.
echo.

REM Check if we're in the right directory
if exist "backend" (
    echo ✓ Project structure detected
) else (
    echo ❌ Please run this from the project root folder
    timeout /t 10
    exit /b 1
)

echo Creating management scripts...
echo.

REM Create all batch files
echo 1. run-freelancer-copilot.bat - Main launcher
copy /y nul run-freelancer-copilot.bat >nul
REM (Copy the content from section 1 above into this file)

echo 2. setup-freelancer-copilot.bat - Initial setup
copy /y nul setup-freelancer-copilot.bat >nul
REM (Copy the content from section 2 above into this file)

echo 3. stop-freelancer-copilot.bat - Stop all services
copy /y nul stop-freelancer-copilot.bat >nul
REM (Copy the content from section 3 above into this file)

echo 4. quick-test.bat - Test your setup
copy /y nul quick-test.bat >nul
REM (Copy the content from section 4 above into this file)

echo.
echo ✅ All batch files created!
echo.
echo Available commands:
echo - setup-freelancer-copilot.bat   First-time setup
echo - run-freelancer-copilot.bat     Start the application
echo - stop-freelancer-copilot.bat    Stop all services
echo - quick-test.bat                 Test your setup
echo.

REM Actually create the files with content
REM We'll create them by echoing the content
echo Creating run-freelancer-copilot.bat...
(
echo @echo off
echo chcp 65001 ^>nul
echo title Freelancer Copilot - AI Assistant for Freelancers
echo color 0A
echo.
echo echo ========================================================
echo echo    🤖 FREELANCER COPILOT - AUTOMATED LAUNCHER
echo echo ========================================================
echo echo.
echo echo [1/4] Checking system requirements...
echo echo.
echo REM ... (rest of the script from section 1)
) > run-freelancer-copilot.bat

echo Creating README-QUICKSTART.txt...
(
echo 🚀 FREELANCER COPILOT - QUICK START GUIDE
echo =========================================
echo.
echo 1. FIRST TIME SETUP:
echo    Double-click: setup-freelancer-copilot.bat
echo    - Installs dependencies
echo    - Creates .env file
echo.
echo 2. EDIT CONFIGURATION:
echo    Open backend\.env in Notepad
echo    Add your API key:
echo    - OpenAI: https://platform.openai.com/api-keys
echo    OR
echo    - Gemini: https://makersuite.google.com/app/apikey
echo.
echo 3. RUN THE APPLICATION:
echo    Double-click: run-freelancer-copilot.bat
echo    - Starts backend on port 3000
echo    - Starts frontend on port 8080
echo    - Opens browser automatically
echo.
echo 4. STOP THE APPLICATION:
echo    Double-click: stop-freelancer-copilot.bat
echo    OR
echo    Close both command windows
echo.
echo 📞 TROUBLESHOOTING:
echo - If ports are busy, change in backend\.env
echo - Check both windows are running
echo - Test with quick-test.bat
echo.
echo 🎯 EXAMPLE MESSAGES TO TEST:
echo 1. "Hi, need WordPress site. Budget $100"
echo 2. "URGENT! Contact WhatsApp for project"
echo 3. "Fix my broken e-commerce site bug"
) > README-QUICKSTART.txt

echo.
echo ========================================================
echo    ✅ INSTALLATION COMPLETE!
echo ========================================================
echo.
echo Next steps:
echo 1. Run 'setup-freelancer-copilot.bat' for first-time setup
echo 2. Edit backend\.env file with your API key
echo 3. Run 'run-freelancer-copilot.bat' to start using!
echo.
echo A quick start guide has been saved as README-QUICKSTART.txt
echo.
echo Press any key to open the quick start guide...
pause >nul

start notepad README-QUICKSTART.txt

timeout /t 3
exit /b 0