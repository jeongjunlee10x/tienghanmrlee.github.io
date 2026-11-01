@echo off
chcp 65001 >nul
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp001-CAP_NHAT_SC.ps1"
if errorlevel 1 (echo CAP NHAT THAT BAI & pause & exit /b 1)
pause
