@echo off
chcp 65001 >nul
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp003-KIEM_TRA.ps1"
if errorlevel 1 (echo KIEM TRA KHONG DAT) else (echo KIEM TRA DAT)
pause
