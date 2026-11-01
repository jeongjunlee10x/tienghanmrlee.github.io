param([string]$Website = 'C:\Users\Surface\Documents\tienghanmrlee.github.io')
$ErrorActionPreference='Stop'
$here=Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not (Test-Path -LiteralPath $Website -PathType Container)) { throw "Không tìm thấy thư mục website: $Website" }
$paths=@('so-cap-1.html','so-cap-2.html')
foreach($name in $paths) {
  $path=Join-Path $Website $name
  if(-not (Test-Path -LiteralPath $path -PathType Leaf)){throw "Thiếu $name; dừng để tránh cập nhật sai"}
  $html=[IO.File]::ReadAllText($path,[Text.Encoding]::UTF8)
  if($html -notmatch 'article class="lesson"' -and $html -notmatch 'class="lesson"') {throw "$name không có cấu trúc bài học mong đợi"}
  if($html -notmatch '(?i)</head\s*>' -or $html -notmatch '(?i)</body\s*>') {throw "$name có HTML không hợp lệ"}
}
$backup=Join-Path (Split-Path $Website -Parent) ('MRLEE-SC-BACKUP-'+(Get-Date -Format 'yyyyMMdd-HHmmss'))
New-Item -ItemType Directory -Path $backup -Force | Out-Null
foreach($name in $paths) {Copy-Item -LiteralPath (Join-Path $Website $name) -Destination (Join-Path $backup $name)}
foreach($name in @('mrlee-sc-review.js','mrlee-sc-review.css')) {
  $old=Join-Path $Website $name
  if(Test-Path -LiteralPath $old) {Copy-Item -LiteralPath $old -Destination (Join-Path $backup $name)}
  Copy-Item -LiteralPath (Join-Path $here ('FILES\'+$name)) -Destination $old -Force
}
$enc=New-Object System.Text.UTF8Encoding($false)
foreach($name in $paths) {
  $path=Join-Path $Website $name
  $html=[IO.File]::ReadAllText($path,[Text.Encoding]::UTF8)
  if ($html -notmatch 'mrlee-sc-review\.css') {
    $html=[regex]::Replace($html,'(?i)</head\s*>','  <link rel="stylesheet" href="mrlee-sc-review.css?v=sc-p1-20261013">'+"`r`n"+'</head>',1)
  }
  if ($html -notmatch 'mrlee-sc-review\.js') {
    $html=[regex]::Replace($html,'(?i)</body\s*>','  <script defer src="mrlee-sc-review.js?v=sc-p1-20261013"></script>'+"`r`n"+'</body>',1)
  }
  [IO.File]::WriteAllText($path,$html,$enc)
}
Write-Host 'DA CAP NHAT XONG HAI TRANG SO CAP.' -ForegroundColor Green
Write-Host ('Ban sao luu: '+$backup)
Write-Host 'Chi bo sung cong cu tra cuu; tu vung va ngu phap goc KHONG thay doi.'
