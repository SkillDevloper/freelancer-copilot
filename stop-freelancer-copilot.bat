@echo off
chcp 65001 >nul
title Stop Freelancer Copilot
color 0C

echo ========================================================
echo    🛑 STOPPING FREELANCER COPILOT
echo ========================================================
echo.

echo Looking for running processes...

REM Find and kill Node.js processes on ports 3000 and 8080
echo Killing processes on port 3000 (backend)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /F /PID %%a >nul 2>nul && echo Killed PID: %%a
)

echo Killing processes on port 8080 (frontend)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do (
    taskkill /F /PID %%a >nul 2>nul && echo Killed PID: %%a
)

REM Also look for specific title windows
echo Closing Freelancer Copilot windows...
taskkill /FI "WINDOWTITLE eq Freelancer Copilot*" /F >nul 2>nul

echo.
echo ✅ All Freelancer Copilot services stopped.
echo.
echo If you encounter issues, you can also:
echo 1. Manually close any command windows
echo 2. Use Task Manager to end Node.js processes
echo.
timeout /t 5