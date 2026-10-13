param([string]$Website='C:\Users\Surface\Documents\tienghanmrlee.github.io')
$ErrorActionPreference='Stop'
Set-Location -LiteralPath $Website
$files=@('hoc-theo-bai.html','mrlee-lesson-page.js','mrlee-sc-lesson-data.js','mrlee-advanced-lesson-data.js','mrlee-sc-lesson.css')
foreach($file in $files){if(-not (Test-Path -LiteralPath $file)){throw "Thieu file: $file. Hay chay 01-CAP_NHAT.cmd truoc."}}
if(-not (Get-Command git -ErrorAction SilentlyContinue)){throw 'Chua cai Git hoac Git chua co trong PATH.'}
$branch=(git branch --show-current).Trim();if($LASTEXITCODE -ne 0){throw 'Khong doc duoc nhanh Git.'}
if($branch -ne 'main'){throw "Ban dang o nhanh '$branch' (khong phai main). Dung push de kiem tra."}
& git remote get-url origin | Out-Null;if($LASTEXITCODE -ne 0){throw 'Chua cau hinh remote origin.'}
$staged=@(git diff --cached --name-only)
if($LASTEXITCODE -ne 0){throw 'Khong doc duoc file staged.'}
if($staged.Count -gt 0){throw 'Da co file staged tu truoc. Hay kiem tra git status truoc khi chay script.'}
Write-Host 'CHI CAC FILE SAU SE DUOC COMMIT:' -ForegroundColor Yellow
$files|ForEach-Object{Write-Host (' - '+$_)}
Write-Host 'Vi tri Git:' -ForegroundColor Cyan
& git status --short
$confirm=Read-Host 'Nhap DAY de xac nhan commit + push (hoac phim khac de huy)'
if($confirm -cne 'DAY'){Write-Host 'Da huy, chua push.';exit 0}
& git add -- $files
if($LASTEXITCODE -ne 0){throw 'git add that bai'}
& git diff --cached --stat
& git diff --cached --quiet
if($LASTEXITCODE -eq 0){Write-Host 'Khong co thay doi moi can push.';exit 0}
& git commit -m 'MR LEE full 6 cap: noi dung 90 bai khong vuot bai'
if($LASTEXITCODE -ne 0){throw 'git commit that bai'}
& git push origin main
if($LASTEXITCODE -ne 0){throw 'git push that bai'}
Write-Host 'DAY THANH CONG LEN origin/main.' -ForegroundColor Green
