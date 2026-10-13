@echo off
chcp 65001 >nul
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp002-DAY_GITHUB.ps1"
set "CODE=%ERRORLEVEL%"
echo.
pause
exit /b %CODE%
