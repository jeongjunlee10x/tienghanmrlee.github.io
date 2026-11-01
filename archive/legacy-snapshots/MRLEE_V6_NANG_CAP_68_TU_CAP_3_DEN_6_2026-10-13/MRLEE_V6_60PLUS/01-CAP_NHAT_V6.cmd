@echo off
chcp 65001 >nul
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp001-CAP_NHAT_V6.ps1"
if errorlevel 1 (echo CO LOI. CHUA NEN DAY GITHUB.& pause & exit /b 1)
pause
