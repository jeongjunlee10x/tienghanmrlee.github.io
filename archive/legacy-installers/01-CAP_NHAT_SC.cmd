@echo off
chcp 65001 >nul
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp001-CAP_NHAT_SC.ps1"
if errorlevel 1 (echo UPDATE FAILED & pause & exit /b 1)
echo Update finished. Check website before pushing GitHub.
pause
