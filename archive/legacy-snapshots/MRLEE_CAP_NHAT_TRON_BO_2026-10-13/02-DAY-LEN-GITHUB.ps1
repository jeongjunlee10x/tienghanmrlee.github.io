#requires -Version 5.1
$ErrorActionPreference='Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$site = Join-Path $env:USERPROFILE 'Documents\tienghanmrlee.github.io'
if (!(Test-Path -LiteralPath (Join-Path $site '.git'))) { throw 'Khong tim thay .git. Vui long mo thu muc repo dung tren may.' }
if (!(Get-Command git -ErrorAction SilentlyContinue)) { throw 'Chua tim thay Git trong PATH. Cai Git for Windows truoc.' }
Push-Location $site
try {
  $branch = (git branch --show-current).Trim()
  if ($branch -ne 'main') { throw "Nhanh hien tai la $branch, khong phai main. Dung de tranh day sai nhanh." }
  Write-Host "`nTHU MUC: $site" -ForegroundColor Cyan
  Write-Host 'Remote GitHub:'
  git remote -v
  Write-Host "`nCAC FILE SAP CAP NHAT:" -ForegroundColor Yellow
  git status --short
  if ($LASTEXITCODE -ne 0) { throw 'git status loi.' }
  $answer = Read-Host 'Nhap DAY de XAC NHAN git add, commit va push (nhap khac = thoat)'
  if ($answer -cne 'DAY') { Write-Host 'Da huy. Khong thay doi git.'; return }
  git add -A
  if ($LASTEXITCODE -ne 0) { throw 'git add loi' }
  git diff --cached --stat
  $staged=git diff --cached --name-only
  if (!$staged) { Write-Host 'Khong co thay doi can day len GitHub.'; return }
  git commit -m 'Nang cap menu, van hoa Han Quoc va don file rac'
  if ($LASTEXITCODE -ne 0) { throw 'git commit loi. Kiem tra Git user.name va user.email.' }
  git push -u origin main
  if ($LASTEXITCODE -ne 0) { throw 'git push loi. Khong dung force push; kiem tra xac thuc va cap nhat tu xa.' }
  Write-Host "`nPUSH THANH CONG. Mo GitHub Pages de xac minh trang moi." -ForegroundColor Green
} finally { Pop-Location }
Read-Host 'Nhan Enter de dong'
