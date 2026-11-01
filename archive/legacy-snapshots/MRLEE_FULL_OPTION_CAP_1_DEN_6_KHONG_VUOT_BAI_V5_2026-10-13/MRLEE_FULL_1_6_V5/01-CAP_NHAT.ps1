param([string]$Website='C:\Users\Surface\Documents\tienghanmrlee.github.io')
$ErrorActionPreference='Stop'
$root=Split-Path -Parent $MyInvocation.MyCommand.Path
$src=Join-Path $root 'FILES'
$targets=@('hoc-theo-bai.html','mrlee-lesson-page.js','mrlee-sc-lesson-data.js','mrlee-advanced-lesson-data.js','mrlee-sc-lesson.css')
if(-not (Test-Path -LiteralPath $Website -PathType Container)){ throw "Khong tim thay website: $Website" }
if(-not (Test-Path -LiteralPath (Join-Path $Website '.git'))){ throw 'Thieu .git. Vui long chon dung thu muc repo GitHub.' }
foreach($item in $targets){if(-not (Test-Path -LiteralPath (Join-Path $src $item))){throw "Goi cap nhat thieu: $item"}}
$html=Join-Path $Website 'hoc-theo-bai.html'
$script=Join-Path $Website 'mrlee-lesson-page.js'
if(-not (Test-Path -LiteralPath $html)){throw 'Khong co hoc-theo-bai.html tai website, dung cap nhat.'}
if(-not (Test-Path -LiteralPath $script)){throw 'Khong co mrlee-lesson-page.js tai website, dung cap nhat.'}
$oldHtml=Get-Content -Raw -Encoding UTF8 -LiteralPath $html
$oldJs=Get-Content -Raw -Encoding UTF8 -LiteralPath $script
if($oldHtml -notmatch 'id="lessonVocab"' -or $oldHtml -notmatch 'id="lessonSpeak"' -or $oldHtml -notmatch 'mrlee-lesson-page.js'){
  throw 'Trang hoc-theo-bai da doi cau truc. KHONG ghi de de tranh mat tinh nang.'
}
if($oldJs -notmatch 'mrlee-roadmap-bank.js'){
  throw 'JS hien tai khong trung khop bo khung. KHONG ghi de.'
}
$backup=Join-Path (Split-Path $Website -Parent) ('MRLEE_BACKUP_FULL_1_6_'+(Get-Date -Format 'yyyyMMdd_HHmmss'))
New-Item -ItemType Directory -Force -Path $backup | Out-Null
foreach($item in $targets){$dest=Join-Path $Website $item;if(Test-Path -LiteralPath $dest){Copy-Item -LiteralPath $dest -Destination (Join-Path $backup $item) -Force}}
try{
 foreach($item in $targets){Copy-Item -LiteralPath (Join-Path $src $item) -Destination (Join-Path $Website $item) -Force}
 Write-Host 'DA CAP NHAT 5 FILE - FULL 6 CAP / 90 BAI.' -ForegroundColor Green
 Write-Host "SAO LUU: $backup" -ForegroundColor Cyan
 Write-Host 'Khong thay doi index.html, logo, 9 anh bia, Firebase, bang xep hang.' -ForegroundColor Yellow
 Write-Host 'Chay 03-KIEM_TRA.cmd, xem noi dung tren web local, sau do chay 02-DAY_GITHUB.cmd.' -ForegroundColor Yellow
}catch{
 foreach($item in $targets){$restore=Join-Path $backup $item;if(Test-Path -LiteralPath $restore){Copy-Item -LiteralPath $restore -Destination (Join-Path $Website $item) -Force}else{$new=Join-Path $Website $item;if(Test-Path $new){Remove-Item $new -Force}}}
 throw
}
