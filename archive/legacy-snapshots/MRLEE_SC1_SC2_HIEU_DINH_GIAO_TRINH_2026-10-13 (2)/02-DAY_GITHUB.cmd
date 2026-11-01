@echo off
chcp 65001 >nul
cd /d "C:\Users\Surface\Documents\tienghanmrlee.github.io" || (echo Khong tim thay website & pause & exit /b 1)
echo Chi day 5 file: 2 HTML SC + 3 JS/CSS.
git status --short
if errorlevel 1 (pause & exit /b 1)
set /p c="Nhap DAY de xem cac file duoc chon: "
if /I not "%c%"=="DAY" exit /b 0
git add -- so-cap-1.html so-cap-2.html mrlee-sc-curriculum-data.js mrlee-sc-curriculum.js mrlee-sc-curriculum.css
if errorlevel 1 (echo Add error & pause & exit /b 1)
git diff --cached --stat
set /p c="Nhap DAY de commit va push: "
if /I not "%c%"=="DAY" exit /b 0
git commit --only -m "Hieu dinh tu vung ngu phap 30 bai so cap" -- so-cap-1.html so-cap-2.html mrlee-sc-curriculum-data.js mrlee-sc-curriculum.js mrlee-sc-curriculum.css
if errorlevel 1 (echo Commit error / no changes & pause & exit /b 1)
git push origin main
if errorlevel 1 (echo Push error & pause & exit /b 1)
echo DAY THANH CONG
pause
