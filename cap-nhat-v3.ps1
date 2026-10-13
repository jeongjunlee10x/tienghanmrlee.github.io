param(
  [switch]$NoPush,
  [switch]$PushOnly
)
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$site = 'C:\Users\Surface\Documents\tienghanmrlee.github.io'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$source = Join-Path $here 'FILES'
if (!(Test-Path $site)) { throw "Khong tim thay duong dan website: $site" }
if (!(Test-Path (Join-Path $site '.git'))) { throw "Thu muc website chua co .git: $site" }
if (!(Test-Path $source)) { throw "Khong tim thay thu muc FILES (ban va)" }
Set-Location $site
$staged = @(git diff --cached --name-only)
if ($LASTEXITCODE -ne 0) { throw 'Khong doc duoc danh sach file Git dang staged.' }
if ($staged.Count -gt 0) { throw ('Dang co file staged, huy cap nhat tu dong de khong commit nham: ' + ($staged -join ', ')) }
$manifest = @(Get-Content -LiteralPath (Join-Path $here 'DANH_SACH_FILE.txt') -Encoding UTF8 | Where-Object { $_.Trim() -ne '' })
if (!$PushOnly) {
  $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
  $backup = Join-Path ([Environment]::GetFolderPath('MyDocuments')) ('MRLEE_BACKUP_TRUOC_CAP_NHAT\V3-' + $stamp)
  foreach ($relative in $manifest) {
    $target = Join-Path $site $relative
    $origin = Join-Path $source $relative
    if (!(Test-Path $origin)) { throw "Thieu file ban va: $relative" }
    if (Test-Path $target) {
      $destBackup = Join-Path $backup $relative
      New-Item -ItemType Directory -Force -Path (Split-Path -Parent $destBackup) | Out-Null
      Copy-Item -LiteralPath $target -Destination $destBackup -Force
    }
  }
  foreach ($relative in $manifest) {
    $target = Join-Path $site $relative
    $origin = Join-Path $source $relative
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $target) | Out-Null
    Copy-Item -LiteralPath $origin -Destination $target -Force
  }
  Write-Host "DA SAO LUU O: $backup" -ForegroundColor Green
  Write-Host "DA CAP NHAT $($manifest.Count) FILE" -ForegroundColor Green
}
if ($NoPush) {
  Write-Host 'DA CAP NHAT. CHUA DAY GITHUB.' -ForegroundColor Yellow
  exit 0
}
$confirm = Read-Host 'Nhap DAY de commit va push cac file trong ban va len Github'
if ($confirm -cne 'DAY') { Write-Host 'CHUA PUSH. Cac file cap nhat tren may van duoc giu.'; exit 0 }
& git add -- $manifest
if ($LASTEXITCODE -ne 0) { throw 'git add that bai.' }
& git diff --cached --check
if ($LASTEXITCODE -ne 0) { throw 'Phat hien loi whitespace trong file da stage.' }
$changes = @(git diff --cached --name-only)
if ($changes.Count -eq 0) { Write-Host 'Khong co file thay doi de day.'; exit 0 }
Write-Host 'CAC FILE SE COMMIT:' -ForegroundColor Cyan
$changes | ForEach-Object { Write-Host $_ }
& git commit -m 'Fix homepage 4 cards i18n and unify Mr Lee logo V3'
if ($LASTEXITCODE -ne 0) { throw 'Git commit that bai.' }
$branch = (git branch --show-current).Trim()
if (!$branch) { throw 'Khong tim thay nhanh Git hien tai.' }
& git push origin $branch
if ($LASTEXITCODE -ne 0) { throw ('git push that bai. Kiem tra remote/credential/branch: '+$branch) }
Write-Host 'DA PUSH THANH CONG.' -ForegroundColor Green
Write-Host 'MO: https://jeongjunlee10x.github.io/tienghanmrlee.github.io/index.html?v=mrlee-v3-20261013'
