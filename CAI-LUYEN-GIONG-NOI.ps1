# Tiếng Hàn Mr Lee - chỉ thêm 2 link CSS/JS vào 4 trang học; không thay file Firebase.
$ErrorActionPreference = 'Stop'
$rootPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backupDirectory = Join-Path (Split-Path -Parent $rootPath) ('MrLee-SaoLuu-LuyenGiong-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
New-Item -Path $backupDirectory -ItemType Directory -Force | Out-Null
$utf8 = New-Object System.Text.UTF8Encoding($false)
$files = @('so-cap-1.html','so-cap-2.html','giao-tiep-theo-chu-de.html','on-luyen-phong-van.html')
$modified = 0
foreach ($file in $files) {
  $fullPath = Join-Path $rootPath $file
  if (-not (Test-Path $fullPath)) { Write-Host "Bo qua: $file (khong tim thay)"; continue }
  $html = [System.IO.File]::ReadAllText($fullPath, [System.Text.Encoding]::UTF8)
  $original = $html
  if ($html -notmatch 'href\s*=\s*["'']mrlee-voice\.css["'']') {
    if ($html -notmatch '(?i)</head>') { Write-Warning "File khong co </head>: $file"; continue }
    $html = [regex]::Replace($html,'(?i)</head>',"  <link rel=`"stylesheet`" href=`"mrlee-voice.css`">`r`n</head>")
  }
  if ($html -notmatch 'src\s*=\s*["'']mrlee-voice\.js["'']') {
    if ($html -notmatch '(?i)</body>') { Write-Warning "File khong co </body>: $file"; continue }
    $html = [regex]::Replace($html,'(?i)</body>',"  <script src=`"mrlee-voice.js`" defer></script>`r`n</body>")
  }
  if ($html -ne $original) {
    Copy-Item $fullPath (Join-Path $backupDirectory $file)
    [System.IO.File]::WriteAllText($fullPath, $html, $utf8)
    Write-Host "Da them nut nghe/luyen noi: $file"
    $modified++
  } else { Write-Host "Da cai san, giu nguyen: $file" }
}
Write-Host "Hoan tat: $modified file thay doi. Ban sao luu: $backupDirectory"
Write-Host 'Luu y: Mic can HTTPS/localhost va trinh duyet ho tro SpeechRecognition.'
