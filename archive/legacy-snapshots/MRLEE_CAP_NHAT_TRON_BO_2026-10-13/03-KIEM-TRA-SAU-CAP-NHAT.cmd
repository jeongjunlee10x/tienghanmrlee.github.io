@echo off
chcp 65001 >nul
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp003-KIEM-TRA-SAU-CAP-NHAT.ps1"
pause
