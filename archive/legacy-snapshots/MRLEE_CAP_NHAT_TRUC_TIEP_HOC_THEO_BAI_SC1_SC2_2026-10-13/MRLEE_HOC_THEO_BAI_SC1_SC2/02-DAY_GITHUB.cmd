@echo off
setlocal
set "WEB=C:\Users\Surface\Documents\tienghanmrlee.github.io"
cd /d "%WEB%" || (echo Khong tim thay website & pause & exit /b 1)
git rev-parse --is-inside-work-tree >nul 2>nul || (echo Khong phai Git repository & pause & exit /b 1)
git diff --name-only --cached
for /f %%A in ('git diff --cached --name-only ^| find /c /v ""') do set COUNT=%%A
if not "%COUNT%"=="0" (echo Co file da staged tu truoc. Hay kiem tra va commit rieng & pause & exit /b 1)
git add -- hoc-theo-bai.html mrlee-lesson-page.js mrlee-sc-lesson-data.js mrlee-sc-lesson.css
git diff --cached --stat
echo.
set /p OK="Nhap DAY de commit va push 4 file tren: "
if /I not "%OK%"=="DAY" (echo Da huy & pause & exit /b 1)
git diff --cached --quiet && (echo Khong co thay doi & pause & exit /b 0)
git commit -m "Cap nhat tu vung ngu phap SC1 SC2 vao hoc-theo-bai" || (echo Loi git commit & pause & exit /b 1)
git push origin main || (echo Loi git push. Kiem tra remote va nhanh & pause & exit /b 1)
echo DAY LEN GITHUB THANH CONG
pause
