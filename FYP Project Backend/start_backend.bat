@echo off
echo ========================================
echo PlantGuard AI Backend Startup
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if .env exists
if not exist .env (
    echo Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit .env and configure:
    echo   - MONGODB_URI
    echo   - JWT_SECRET_KEY
    echo   - SMTP_USERNAME and SMTP_PASSWORD
    echo.
    pause
)

REM Check if virtual environment exists
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

echo.
echo ========================================
echo Starting Flask backend server...
echo ========================================
echo.

python app.py

pause
