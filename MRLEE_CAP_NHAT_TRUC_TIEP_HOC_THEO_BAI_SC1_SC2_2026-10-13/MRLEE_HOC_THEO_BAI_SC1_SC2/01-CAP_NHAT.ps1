param([string]$Website='C:\Users\Surface\Documents\tienghanmrlee.github.io')
$ErrorActionPreference='Stop'
$root=(Resolve-Path $PSScriptRoot).Path
$src=Join-Path $root 'FILES'
$targets=@('hoc-theo-bai.html','mrlee-lesson-page.js','mrlee-sc-lesson-data.js','mrlee-sc-lesson.css')
if(-not (Test-Path $Website -PathType Container)){throw "Khong tim thay thu muc website: $Website"}
if(-not (Test-Path (Join-Path $Website '.git') -PathType Container)){throw 'Chua tim thay .git - can kiem tra duong dan.'}
foreach($file in $targets){if(-not (Test-Path (Join-Path $src $file))){throw "Thieu file trong ban va: $file"}}
$oldJs=Join-Path $Website 'mrlee-lesson-page.js'
if(-not (Test-Path $oldJs)){throw 'Khong tim thay JS hien tai. Huy cap nhat de tranh mat chuc nang.'}
$oldCode=Get-Content -LiteralPath $oldJs -Raw -Encoding UTF8
if($oldCode -notmatch 'function uniqueSamples' -or $oldCode -notmatch 'function renderLesson'){throw 'JS hien tai khac bo khung du kien. Khong ghi de de tranh mat tinh nang.'}
$backup=Join-Path (Split-Path $Website -Parent) ('MRLEE_BACKUP_HOC_THEO_BAI_'+(Get-Date -Format yyyyMMdd_HHmmss))
New-Item -ItemType Directory -Force -Path $backup | Out-Null
foreach($file in $targets){
 $dest=Join-Path $Website $file
 if(Test-Path $dest){Copy-Item -LiteralPath $dest -Destination (Join-Path $backup $file) -Force}
}
try{
 foreach($file in $targets){Copy-Item -LiteralPath (Join-Path $src $file) -Destination (Join-Path $Website $file) -Force}
 Write-Host "DA CAP NHAT: $($targets -join ', ')" -ForegroundColor Green
 Write-Host "Ban sao luu: $backup" -ForegroundColor Cyan
 Write-Host 'CHUA DAY LEN GITHUB. Chay 02-DAY_GITHUB.cmd sau khi kiem tra.' -ForegroundColor Yellow
}catch{
 foreach($file in $targets){$old=Join-Path $backup $file;if(Test-Path $old){Copy-Item -LiteralPath $old -Destination (Join-Path $Website $file) -Force}}
 throw
}
