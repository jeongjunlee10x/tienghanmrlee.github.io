param([string]$Website='C:\Users\Surface\Documents\tienghanmrlee.github.io')
$ErrorActionPreference='Stop'
Set-Location -LiteralPath $Website
$files=@('hoc-theo-bai.html','mrlee-advanced-lesson-data.js','mrlee-lesson-page.js','mrlee-v6-vocab.css')
foreach($required in $files){if(-not (Test-Path -LiteralPath $required)){throw "Thieu $required. Chay cap nhat truoc."}}
if(-not (Get-Command git -ErrorAction SilentlyContinue)){throw 'Khong tim thay Git.'}
$branch=(git branch --show-current).Trim();if($LASTEXITCODE -ne 0 -or $branch -ne 'main'){throw "Dang o nhanh '$branch', khong phai main."}
& git remote get-url origin | Out-Null;if($LASTEXITCODE -ne 0){throw 'Chua co remote origin.'}
$staged=@(git diff --cached --name-only);if($LASTEXITCODE -ne 0 -or $staged.Count -gt 0){throw 'Da co file staged. Vui long kiem tra git status truoc.'}
foreach($d in @('mrlee-sc-lesson-data.js','mrlee-sc-lesson.css')){if((git ls-files -- $d).Count -eq 0 -and (Test-Path -LiteralPath $d)){$files+=$d}}
Write-Host 'FILES WILL PUSH:' -ForegroundColor Yellow
$files|ForEach-Object{Write-Host " - $_"}
git status --short
$confirm=Read-Host 'Nhap DAY de commit va push, hoac phim khac de huy'
if($confirm -cne 'DAY'){Write-Host 'Da huy.';exit 0}
& git add -- $files;if($LASTEXITCODE -ne 0){throw 'git add that bai.'}
& git diff --cached --stat
& git diff --cached --quiet
if($LASTEXITCODE -eq 0){Write-Host 'Khong co thay doi de push.';exit 0}
& git commit -m 'MR LEE V6: 68 tu moi bai cap 3-6, mo rong ngu phap va bai tap';if($LASTEXITCODE -ne 0){throw 'git commit that bai.'}
& git push origin main;if($LASTEXITCODE -ne 0){throw 'git push that bai.'}
Write-Host 'DA DAY GITHUB THANH CONG.' -ForegroundColor Green
