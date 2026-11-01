@echo off
chcp 65001 >nul
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp001-KHOI_PHUC_9_ANH_BIA.ps1"
set "CODE=%ERRORLEVEL%"
echo.
if not "%CODE%"=="0" echo Co loi khi khoi phuc. Chua day len GitHub.
pause
exit /b %CODE%
