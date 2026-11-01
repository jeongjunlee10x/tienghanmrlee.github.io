@echo off
chcp 65001 >nul
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp001-CAP-NHAT-VA-DON-RAC.ps1"
pause
