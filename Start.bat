@echo off
echo Starting Backend...
cd backend || (
    echo Backend directory not found
    pause
    exit /b
)
start "Backend" cmd /k npm start

echo Starting Frontend...
cd ..\frontend || (
    echo Frontend directory not found
    pause
    exit /b
)
start "Frontend" cmd /k python -m http.server 8080

echo Opening browser...
timeout /t 3 >nul
start http://localhost:8080/

echo ----------------------------------
echo Backend and Frontend are starting
echo Frontend available at http://localhost:8080/
echo ----------------------------------
