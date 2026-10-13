param([string]$Website="C:\Users\Surface\Documents\tienghanmrlee.github.io")
$ErrorActionPreference = 'Stop'
$src=Join-Path $PSScriptRoot 'FILES'
$assets=@('mrlee-sc-curriculum-data.js','mrlee-sc-curriculum.js','mrlee-sc-curriculum.css')
$pages=@('so-cap-1.html','so-cap-2.html')
if (!(Test-Path -LiteralPath $Website -PathType Container)) {throw "Khong tim thay website: $Website"}
foreach($f in ($assets+$pages)) {
  $p = if($assets -contains $f){Join-Path $src $f}else{Join-Path $Website $f}
  if(!(Test-Path -LiteralPath $p -PathType Leaf)){throw "Khong tim thay file: $p"}
}
$ts=Get-Date -Format 'yyyyMMdd_HHmmss'
$backup=Join-Path (Split-Path $Website -Parent) ('MRLEE_BACKUP_SC1_SC2_'+$ts)
New-Item -ItemType Directory -Path $backup -Force | Out-Null
foreach($f in ($assets+$pages)){
 $dest=Join-Path $Website $f
 if(Test-Path -LiteralPath $dest) {Copy-Item -LiteralPath $dest -Destination (Join-Path $backup $f) -Force}
}
Write-Host "Da sao luu file hien co vao: $backup" -ForegroundColor Cyan
# Doc / ghi UTF-8 khong BOM tu .NET; giu noi dung goc, chi chen tag script/css.
$utf8=New-Object System.Text.UTF8Encoding($false)
foreach($page in $pages){
 $file=Join-Path $Website $page
 $html=[System.IO.File]::ReadAllText($file,[System.Text.Encoding]::UTF8)
 if($html -notmatch '(?i)</head>' -or $html -notmatch '(?i)</body>'){throw "HTML khong co head/body: $page"}
 if($html -notmatch 'mrlee-sc-curriculum\.css'){
  $html=[regex]::Replace($html,'(?i)</head>',"<link rel=`"stylesheet`" href=`"mrlee-sc-curriculum.css?v=20261013`">`r`n</head>",1)
 }
 if($html -notmatch 'mrlee-sc-curriculum-data\.js'){
  $html=[regex]::Replace($html,'(?i)</body>',"<script src=`"mrlee-sc-curriculum-data.js?v=20261013`"></script>`r`n<script defer src=`"mrlee-sc-curriculum.js?v=20261013`"></script>`r`n</body>",1)
 }
 [System.IO.File]::WriteAllText($file,$html,$utf8)
 Write-Host "Da lien ket noi dung SC vao $page" -ForegroundColor Green
}
foreach($f in $assets){Copy-Item -LiteralPath (Join-Path $src $f) -Destination (Join-Path $Website $f) -Force}
Write-Host 'KHONG ghi de toan bo file so-cap-1/2; khong dong vao index.html, banner, Firebase, rules.' -ForegroundColor Yellow
Write-Host 'Kiem tra trinh duyet: so-cap-1.html va so-cap-2.html, sau do day GitHub.'
