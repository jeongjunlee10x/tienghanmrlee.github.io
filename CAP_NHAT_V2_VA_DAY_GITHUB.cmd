@echo off
chcp 65001 >nul
echo MR LEE - CAP NHAT V2 VA DAY LEN GITHUB
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0CAP_NHAT_V2_VA_DAY_GITHUB.ps1"
set "RESULT=%ERRORLEVEL%"
echo.
if not "%RESULT%"=="0" echo Cap nhat chua hoan thanh. Gui anh loi trong cua so nay de duoc ho tro.
pause
exit /b %RESULT%
