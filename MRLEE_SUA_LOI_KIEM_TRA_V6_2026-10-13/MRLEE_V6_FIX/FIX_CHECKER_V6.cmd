@echo off
chcp 65001 >nul
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0FIX_CHECKER_V6.ps1"
if errorlevel 1 (echo LOI. GUI ANH MAN HINH DONG FAILED.& pause & exit /b 1)
pause
