@echo off
chcp 65001 >nul
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp002-DAY-LEN-GITHUB.ps1"
pause
