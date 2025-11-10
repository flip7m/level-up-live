@echo off
REM Stop the Level Up Live system
echo Stopping Level Up Live...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak
echo System stopped.
pause
