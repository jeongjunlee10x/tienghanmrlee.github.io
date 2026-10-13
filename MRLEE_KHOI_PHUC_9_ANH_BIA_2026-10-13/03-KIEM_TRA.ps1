param([string]$Website = 'C:\Users\Surface\Documents\tienghanmrlee.github.io')
$ErrorActionPreference = 'Stop'
$index = Join-Path $Website 'index.html'
if(-not (Test-Path -LiteralPath $index)) {throw "Khong tim thay index: $index"}
$html = [System.IO.File]::ReadAllText($index,[System.Text.Encoding]::UTF8)
$count = ([regex]::Matches($html,'class="mrlee-banner9-slide')).Count
if ($count -ne 9) {throw "Loi: Co $count banner, can 9."}
foreach($name in @('mrlee-slide.css','mrlee-slide.js') + @(1..9 | ForEach-Object {"images/$_.png"})) {
 if(-not (Test-Path -LiteralPath (Join-Path $Website $name))) {throw "Thieu file: $name"}
}
if ($html -notmatch 'mrlee-slide\.css' -or $html -notmatch 'mrlee-slide\.js') {throw 'HTML thieu lien ket CSS/JS.'}
Write-Host 'OK: Du 9 anh + CSS/JS. Da giu cac muc hien co.' -ForegroundColor Green
