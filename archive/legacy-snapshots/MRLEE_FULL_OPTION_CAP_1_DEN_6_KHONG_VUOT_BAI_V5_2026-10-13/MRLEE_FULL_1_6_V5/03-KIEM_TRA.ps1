param([string]$Website='C:\Users\Surface\Documents\tienghanmrlee.github.io')
$ErrorActionPreference='Stop'
$names=@('hoc-theo-bai.html','mrlee-lesson-page.js','mrlee-sc-lesson-data.js','mrlee-advanced-lesson-data.js','mrlee-sc-lesson.css','mrlee-roadmap-bank.js','mrlee-vocab-bank.js')
foreach($name in $names){if(-not (Test-Path -LiteralPath (Join-Path $Website $name))){throw "Thieu file $name"}}
$js=Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $Website 'mrlee-lesson-page.js')
if($js -notmatch 'sourceOrdinal>d.ordinal' -or $js -notmatch 'mrlee-advanced-lesson-data.js'){throw 'Khong phai phien ban V5 khong vuot bai.'}
if(Get-Command node -ErrorAction SilentlyContinue){
 foreach($name in @('mrlee-lesson-page.js','mrlee-advanced-lesson-data.js','mrlee-sc-lesson-data.js')){
  & node --check (Join-Path $Website $name)
  if($LASTEXITCODE -ne 0){throw "JavaScript loi: $name"}
 }
}
Write-Host 'PASS: Du 7 file can cho hoc theo bai; JS va kiem tra nguon V5 hop le.' -ForegroundColor Green
Write-Host 'Thu mo cap=1&bai=1, cap=3&bai=1 va cap=6&bai=15 tren website.' -ForegroundColor Yellow
