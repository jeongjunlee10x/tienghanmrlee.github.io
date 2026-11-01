@echo off
chcp 65001 >nul
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp002-DAY_GITHUB_V6.ps1"
if errorlevel 1 (echo CO LOI KHI DAY GITHUB.& pause & exit /b 1)
pause
