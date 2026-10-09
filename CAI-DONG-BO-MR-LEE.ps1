#requires -Version 5.1
<#
  CAI DONG BO MR LEE (Firebase -> Supabase)
  - Khong can mat khau, khong sua Firebase Rules.
  - Backup admin.html, copy 4 file dung thu muc vao repo GitHub Pages.
  - Khong dua SQL migration/Service Account Key vao repo.
  Cach dung: powershell -ExecutionPolicy Bypass -File .\CAI-DONG-BO-MR-LEE.ps1
  Hoac: powershell -ExecutionPolicy Bypass -File .\CAI-DONG-BO-MR-LEE.ps1 -WebsitePath "C:\path\to\website"
#>
param(
  [string]$WebsitePath = "C:\Users\Surface\Documents\tienghanmrlee.github.io"
)
$ErrorActionPreference = 'Stop'
try {
  $sourceDir = Split-Path -Parent $MyInvocation.MyCommand.Path
  $website = [System.IO.Path]::GetFullPath($WebsitePath)
  if (-not (Test-Path -LiteralPath (Join-Path $website 'index.html') -PathType Leaf)) {
    throw "Khong tim thay index.html trong website: $website. Kiem tra -WebsitePath."
  }
  $targets = @(
    'admin.html',
    'scripts\mrlee_sync.py',
    'scripts\requirements-mrlee-sync.txt',
    '.github\workflows\mrlee-firebase-supabase-sync.yml'
  )
  foreach ($item in $targets) {
    if (-not (Test-Path -LiteralPath (Join-Path $sourceDir $item) -PathType Leaf)) {
      throw "Thieu file trong bo cai: $item. Hay giai nen ZIP day du."
    }
  }
  $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
  foreach ($item in $targets) {
    $src = Join-Path $sourceDir $item
    $dst = Join-Path $website $item
    $dstDir = Split-Path -Parent $dst
    if (-not (Test-Path -LiteralPath $dstDir -PathType Container)) {
      New-Item -ItemType Directory -Path $dstDir -Force | Out-Null
    }
    if ([System.IO.Path]::GetFullPath($src) -eq [System.IO.Path]::GetFullPath($dst)) {
      Write-Host "Da nam dung thu muc: $item" -ForegroundColor Yellow
      continue
    }
    if (Test-Path -LiteralPath $dst -PathType Leaf) {
      Copy-Item -LiteralPath $dst -Destination ($dst + '.backup-' + $stamp) -Force
    }
    Copy-Item -LiteralPath $src -Destination $dst -Force
    Write-Host "Da cai: $item" -ForegroundColor Green
  }
  Write-Host ''
  Write-Host 'Cai file thanh cong. CON CAC BUOC BAT BUOC:' -ForegroundColor Cyan
  Write-Host '1. Chay supabase-sync-migration.sql trong Supabase SQL Editor.'
  Write-Host '2. Tao GitHub Secrets: MRLEE_FIREBASE_SERVICE_ACCOUNT_JSON, MRLEE_SUPABASE_SECRET_KEY.'
  Write-Host '3. git add admin.html scripts/ .github/workflows/ && git commit && git push.'
  Write-Host '4. GitHub Actions > MR LEE - Firebase to Supabase Sync > Run workflow.'
  Write-Host '5. Vao admin.html, nhan Ctrl+F5 va xem dong "Dong bo Firebase lan cuoi".'
} catch {
  Write-Host ('LOI: ' + $_.Exception.Message) -ForegroundColor Red
  exit 1
}
