param(
    [string]$Website = 'C:\Users\Surface\Documents\tienghanmrlee.github.io'
)
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$scriptFile = Join-Path $here '03-KIEM_TRA_V6.ps1'
$candidates = @(
    (Join-Path $Website 'MRLEE_V6_NANG_CAP_68_TU_CAP_3_DEN_6_2026-10-13\MRLEE_V6_60PLUS'),
    (Join-Path $Website 'MRLEE_V6_60PLUS'),
    (Join-Path $Website 'MRLEE_V6_NANG_CAP_68_TU_CAP_3_DEN_6_2026-10-13')
)
$dest = $null
foreach ($folder in $candidates) {
    if (Test-Path -LiteralPath (Join-Path $folder '03-KIEM_TRA_V6.ps1') -PathType Leaf) { $dest = $folder; break }
}
if ($null -eq $dest) {
    throw 'Could not find the old V6 checker. Place this hotfix in the folder containing 03-KIEM_TRA_V6.ps1 and run the FIX file again.'
}
$old = Join-Path $dest '03-KIEM_TRA_V6.ps1'
$backup = Join-Path (Split-Path $Website -Parent) ('MRLEE_BACKUP_CHECKER_V6_' + (Get-Date -Format 'yyyyMMdd_HHmmss') + '.ps1')
Copy-Item -LiteralPath $old -Destination $backup -Force
Copy-Item -LiteralPath $scriptFile -Destination $old -Force
Write-Host "UPDATED: $old" -ForegroundColor Green
Write-Host "OLD SCRIPT BACKUP: $backup" -ForegroundColor Yellow
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $old -Website $Website
if ($LASTEXITCODE -ne 0) { throw 'Checker still failed: see the FAILED line above. Do not push yet.' }
