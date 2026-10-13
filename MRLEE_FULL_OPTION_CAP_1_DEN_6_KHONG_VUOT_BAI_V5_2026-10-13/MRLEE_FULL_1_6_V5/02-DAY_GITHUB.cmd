@echo off
chcp 65001 >nul
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp002-DAY_GITHUB.ps1"
if errorlevel 1 (
 echo DA CO LOI - CHUA THE XAC NHAN PUSH THANH CONG.
 pause
 exit /b 1
)
pause
