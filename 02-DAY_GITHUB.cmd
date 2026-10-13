@echo off
chcp 65001 >nul
cd /d "C:\Users\Surface\Documents\tienghanmrlee.github.io"
if not exist .git (echo Git repository not found & pause & exit /b 1)
git diff --cached --quiet
if errorlevel 1 (echo There are existing staged changes. Review/commit separately first. & pause & exit /b 1)
git add -- so-cap-1.html so-cap-2.html mrlee-sc-review.js mrlee-sc-review.css
git diff --cached --stat
set /p CONFIRM=Type DAY to commit and push these 4 files: 
if /I not "%CONFIRM%"=="DAY" (echo Cancelled & pause & exit /b 0)
git commit -m "Bo sung cong cu tra cuu SC1 SC2 - chua sua noi dung Drive"
if errorlevel 1 (echo Commit failed or nothing to commit & pause & exit /b 1)
git push origin main
if errorlevel 1 (echo Push failed & pause & exit /b 1)
echo Push finished successfully.
pause
