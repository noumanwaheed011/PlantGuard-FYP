@echo off
echo ========================================
echo PlantGuard Frontend - Starting...
echo ========================================
echo.
cd /d "%~dp0"
echo Current directory: %CD%
echo.
echo Starting frontend server...
npm run dev
pause
