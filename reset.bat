@echo off
REM PostgreSQL Reset Script - Stops system, resets database, and starts fresh

echo Stopping Node.js processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak

cd /d D:\level-up-live

echo.
echo ========================================
echo Level Up Live - PostgreSQL Reset
echo ========================================
echo.

echo Resetting PostgreSQL database...
echo Please make sure Docker Desktop is running!
echo.

call npm run docker:reset

echo.
echo Waiting for database to be ready...
timeout /t 5 /nobreak

echo.
echo Running migrations and seed...
call npm run db:migrate
call npm run db:seed

echo.
echo ========================================
echo Database reset complete!
echo Starting development server...
echo ========================================
echo.

call npm run dev
pause
