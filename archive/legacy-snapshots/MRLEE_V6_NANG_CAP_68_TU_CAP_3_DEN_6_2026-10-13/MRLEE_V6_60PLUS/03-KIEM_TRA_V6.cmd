@echo off
chcp 65001 >nul
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp003-KIEM_TRA_V6.ps1"
if errorlevel 1 (echo KIEM TRA KHONG DAT.& pause & exit /b 1)
pause
