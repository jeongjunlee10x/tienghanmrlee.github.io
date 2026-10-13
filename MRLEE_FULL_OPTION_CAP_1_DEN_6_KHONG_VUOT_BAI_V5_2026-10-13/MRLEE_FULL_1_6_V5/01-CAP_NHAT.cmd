@echo off
chcp 65001 >nul
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp001-CAP_NHAT.ps1"
if errorlevel 1 (
 echo LOI: Khong cap nhat. Xem dong bao loi phia tren.
 pause
 exit /b 1
)
pause
