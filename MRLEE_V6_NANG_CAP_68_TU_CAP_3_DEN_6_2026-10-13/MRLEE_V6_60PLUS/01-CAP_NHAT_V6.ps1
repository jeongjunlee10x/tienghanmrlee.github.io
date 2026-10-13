param([string]$Website='C:\Users\Surface\Documents\tienghanmrlee.github.io')
$ErrorActionPreference='Stop'
$root=Split-Path -Parent $MyInvocation.MyCommand.Path
$source=Join-Path $root 'FILES'
$update=@('mrlee-advanced-lesson-data.js','mrlee-lesson-page.js','mrlee-v6-vocab.css')
$dependencies=@('mrlee-sc-lesson-data.js','mrlee-sc-lesson.css')
if(-not (Test-Path -LiteralPath $Website -PathType Container)){throw "Khong tim thay folder web: $Website"}
if(-not (Test-Path -LiteralPath (Join-Path $Website '.git'))){throw 'Khong tim thay .git trong folder web - da dung an toan.'}
$main=Join-Path $Website 'hoc-theo-bai.html'
if(-not (Test-Path -LiteralPath $main)){throw 'Khong tim thay hoc-theo-bai.html.'}
$html=[IO.File]::ReadAllText($main)
if(-not ($html.Contains('id="lessonVocab"') -and $html.Contains('id="lessonSpeak"') -and $html.Contains('mrlee-lesson-page.js'))){throw 'Cau truc hoc-theo-bai.html khac ban V5; KHONG ghi de.'}
foreach($name in $update+$dependencies){if(-not (Test-Path -LiteralPath (Join-Path $source $name))){throw "Thieu file cap nhat: $name"}}
$jsFile=Join-Path $Website 'mrlee-lesson-page.js'
if(Test-Path -LiteralPath $jsFile){
  $oldJS=[IO.File]::ReadAllText($jsFile)
  if(-not $oldJS.Contains('mrlee-roadmap-bank.js')){throw 'File JS khong khop he thong hoc theo bai, dung an toan.'}
}
$backup=Join-Path (Split-Path $Website -Parent) ('MRLEE_BACKUP_V6_'+(Get-Date -Format 'yyyyMMdd_HHmmss'))
New-Item -ItemType Directory -Path $backup -Force|Out-Null
$targets=@('hoc-theo-bai.html')+$update+$dependencies
$existing=@{}
foreach($name in $targets){
  $dest=Join-Path $Website $name
  $existing[$name]=Test-Path -LiteralPath $dest
  if($existing[$name]){Copy-Item -LiteralPath $dest -Destination (Join-Path $backup $name) -Force}
}
$written=New-Object System.Collections.Generic.List[string]
try{
  foreach($name in $update){Copy-Item -LiteralPath (Join-Path $source $name) -Destination (Join-Path $Website $name) -Force;$written.Add($name)}
  foreach($name in $dependencies){if(-not $existing[$name]){Copy-Item -LiteralPath (Join-Path $source $name) -Destination (Join-Path $Website $name) -Force;$written.Add($name)}}
  $newHtml=[IO.File]::ReadAllText($main)
  $newHtml=[regex]::Replace($newHtml,'mrlee-lesson-page\.js(?:\?v=[^"''\s>]+)?','mrlee-lesson-page.js?v=mrlee6-v6')
  if(-not $newHtml.Contains('mrlee-v6-vocab.css')){
    $newHtml=$newHtml.Replace('</head>','<link rel="stylesheet" href="mrlee-v6-vocab.css?v=mrlee6-v6">' + "`r`n" + '</head>')
  }
  [IO.File]::WriteAllText($main,$newHtml,(New-Object System.Text.UTF8Encoding($false)))
  $written.Add('hoc-theo-bai.html')
  Write-Host 'OK: CAP NHAT CAP 3-6, MOI BAI 68 TU VA 4 MUC NGU PHAP (3 HOC + 1 ON).' -ForegroundColor Green
  Write-Host "BACKUP: $backup" -ForegroundColor Cyan
  Write-Host 'KHONG SUA index.html, 9 ANH BIA, AUTH, FIREBASE, DIEM.' -ForegroundColor Yellow
  Write-Host 'Chay 03-KIEM_TRA_V6.cmd truoc khi day GitHub.'
}catch{
  foreach($name in $written){
    $dest=Join-Path $Website $name;$original=Join-Path $backup $name
    if($existing[$name]){Copy-Item -LiteralPath $original -Destination $dest -Force}
    elseif(Test-Path -LiteralPath $dest){Remove-Item -LiteralPath $dest -Force}
  }
  throw
}
