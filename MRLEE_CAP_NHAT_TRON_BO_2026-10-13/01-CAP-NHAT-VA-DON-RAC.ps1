#requires -Version 5.1
# Website MR LEE | Cap nhat va don rac an toan. Sao luu o NGOAI website (ngoai Git).
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$site = Join-Path $env:USERPROFILE 'Documents\tienghanmrlee.github.io'
$src = Join-Path $PSScriptRoot 'WEBSITE'
$list = Join-Path $PSScriptRoot 'RAC_CAN_CHUYEN_RA_NGOAI.txt'
if (!(Test-Path -LiteralPath $site -PathType Container)) { throw "Khong tim thay thu muc website: $site" }
if (!(Test-Path -LiteralPath $src -PathType Container)) { throw 'Thieu thu muc WEBSITE trong bo cai.' }
if (!(Test-Path -LiteralPath (Join-Path $site '.git') -PathType Container)) {
  Write-Warning 'Thu muc website khong co .git. Co the copy, nhung khong the git push cho den khi repo duoc ket noi.'
}
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backup = Join-Path (Split-Path $site -Parent) ('MRLEE-SAO-LUU-CAP-NHAT-' + $stamp)
$changed = 0; $new = 0; $moved = 0; $failures = New-Object System.Collections.ArrayList
New-Item -ItemType Directory -Path $backup -Force | Out-Null
$changeLog = Join-Path $backup 'BAO-CAO-CAP-NHAT.txt'
"Nguon: $src`r`nDich: $site`r`nSao luu: $backup" | Set-Content -LiteralPath $changeLog -Encoding UTF8
# Sao luu file se bi ghi de va chi copy khi NOI DUNG khac, tranh gay thay doi khong can thiet.
Get-ChildItem -LiteralPath $src -Recurse -File -Force | ForEach-Object {
  $rel = $_.FullName.Substring($src.Length).TrimStart('\')
  $dest = Join-Path $site $rel
  $doCopy = $true
  if (Test-Path -LiteralPath $dest -PathType Leaf) {
    $hashA=(Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash
    $hashB=(Get-FileHash -LiteralPath $dest -Algorithm SHA256).Hash
    if ($hashA -eq $hashB) { $doCopy = $false }
    if ($doCopy) {
      $backupFile = Join-Path (Join-Path $backup 'GHI_DE') $rel
      New-Item -ItemType Directory -Path (Split-Path -Parent $backupFile) -Force | Out-Null
      Copy-Item -LiteralPath $dest -Destination $backupFile -Force
      $changed++
    }
  } else { $new++ }
  if ($doCopy) {
    New-Item -ItemType Directory -Path (Split-Path -Parent $dest) -Force | Out-Null
    Copy-Item -LiteralPath $_.FullName -Destination $dest -Force
    Add-Content -LiteralPath $changeLog -Value ('CAP NHAT: ' + $rel) -Encoding UTF8
  }
}
# Chuyen thu muc/tap tin cu khoi website ve ban sao luu NGOAI repo. Khong xoa vinh vien.
Get-Content -LiteralPath $list -Encoding UTF8 | ForEach-Object {
  $rel = $_.Trim()
  if (!$rel -or $rel.StartsWith('#') -or $rel -eq '.git' -or $rel.StartsWith('.git\') -or $rel.StartsWith('.git/')) { return }
  $sourcePath = Join-Path $site ($rel.Replace('/', '\'))
  if (!(Test-Path -LiteralPath $sourcePath)) { return }
  $destPath = Join-Path (Join-Path $backup 'RAC_DA_CHUYEN') ($rel.Replace('/', '\'))
  try {
    New-Item -ItemType Directory -Path (Split-Path -Parent $destPath) -Force | Out-Null
    Move-Item -LiteralPath $sourcePath -Destination $destPath -ErrorAction Stop
    $moved++
    Add-Content -LiteralPath $changeLog -Value ('CHUYEN RAC: ' + $rel) -Encoding UTF8
  } catch { [void]$failures.Add("$rel :: $($_.Exception.Message)") }
}
# Xoa thu muc rong o vung cache, khong dong vao .git.
if ($failures.Count -gt 0) { $failures | Add-Content -LiteralPath $changeLog -Encoding UTF8 }
Write-Host "`nDA CAP NHAT: $changed file thay doi, $new file moi." -ForegroundColor Green
Write-Host "DA CHUYEN: $moved muc cu vao thu muc sao luu (khong xoa vinh vien)." -ForegroundColor Green
Write-Host "SAO LUU NGOAI GIT: $backup" -ForegroundColor Cyan
if ($failures.Count -gt 0) { Write-Warning ("Khong chuyen duoc {0} muc. Xem bao cao de xu ly thu cong." -f $failures.Count) }
Write-Host 'BUOC TIEP THEO: chay 02-DAY-LEN-GITHUB.cmd de xem thay doi va day len website.'
Read-Host 'Nhan Enter de dong'
