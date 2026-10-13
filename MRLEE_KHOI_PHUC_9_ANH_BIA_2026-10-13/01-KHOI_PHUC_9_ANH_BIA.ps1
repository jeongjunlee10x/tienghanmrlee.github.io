param(
  [string]$Website = 'C:\Users\Surface\Documents\tienghanmrlee.github.io'
)
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$base = Split-Path -Parent $MyInvocation.MyCommand.Path
$files = Join-Path $base 'FILES'
$bannerFile = Join-Path $base 'BANNER_9_ANH_GOC.html'
$index = Join-Path $Website 'index.html'
if (-not (Test-Path -LiteralPath $index -PathType Leaf)) {
  throw "Khong tim thay index.html: $index"
}
foreach($f in @('mrlee-slide.css','mrlee-slide.js') + @(1..9 | ForEach-Object {"images/$_.png"})) {
  if(-not (Test-Path -LiteralPath (Join-Path $files $f) -PathType Leaf)) {throw "Thieu file goc: $f"}
}
$html = [System.IO.File]::ReadAllText($index, [System.Text.Encoding]::UTF8)
$startMarker = '<div class="hero-banner">'
$endMarker = '<div class="hero-overview">'
$start = $html.IndexOf($startMarker, [StringComparison]::Ordinal)
$end = $html.IndexOf($endMarker, [StringComparison]::Ordinal)
if ($start -lt 0 -or $end -le $start) {
  throw 'Khong nhan dien duoc khu vuc banner. Chua sua gi ca.'
}
$priorArea = $html.Substring($start, $end - $start)
if ($priorArea -notmatch 'mrleeGroupCarousel|mrleeBanner9|home-slide') {
  throw 'Banner hien tai khong khop phien ban da biet. Chua sua gi ca.'
}
$orig = [System.IO.File]::ReadAllText($bannerFile, [System.Text.Encoding]::UTF8).TrimEnd()
if (([regex]::Matches($orig, 'class="mrlee-banner9-slide')).Count -ne 9) {
  throw 'Mau banner khong du 9 anh; chua sua gi ca.'
}
# Backup outside project (do not pollute Git repository)
$parent = Split-Path -Parent $Website
$stamp = (Get-Date).ToString('yyyyMMdd-HHmmss-fff')
$backup = Join-Path $parent ("MRLEE-SAO-LUU-KHOI-PHUC-9-ANH\\" + $stamp)
[System.IO.Directory]::CreateDirectory($backup) | Out-Null
$relative = @('index.html','mrlee-slide.css','mrlee-slide.js') + @(1..9 | ForEach-Object {"images/$_.png"})
$state = New-Object System.Collections.Generic.List[string]
foreach ($name in $relative) {
  $old = Join-Path $Website $name
  $target = Join-Path $backup $name
  if (Test-Path -LiteralPath $old -PathType Leaf) {
    [System.IO.Directory]::CreateDirectory((Split-Path -Parent $target)) | Out-Null
    Copy-Item -LiteralPath $old -Destination $target -Force
    $state.Add("EXISTED`t$name")
  } else {
    $state.Add("MISSING`t$name")
  }
}
[System.IO.File]::WriteAllLines((Join-Path $backup 'TRANG_THAI_FILE_TRUOC_KHI_SUA.txt'),$state,[System.Text.Encoding]::UTF8)
# Replace only hero banner, preserve all menus / lessons / logo / unrelated code.
$patched = $html.Substring(0, $start) + $orig + "`r`n      " + $html.Substring($end)
# Remove obsolete V2 four-slide init; its element no longer exists.
$oldScript = '(?s)<script>\s*\(\(\)\s*=>\s*\{\s*const root = document\.getElementById\(''mrleeGroupCarousel''\);.*?\}\)\(\);\s*</script>'
$patched = [regex]::Replace($patched,$oldScript,'',1)
# Keep any prior slider references; otherwise insert CSS/JS with cache-busting version.
if ($patched -notmatch 'mrlee-slide\.css') {
  if ($patched -notmatch '</head>') {throw 'Thieu </head>; chua ghi file.'}
  $patched = $patched.Replace('</head>', '  <link rel="stylesheet" href="mrlee-slide.css?v=restore9-20261013" data-mrlee-slide="css">' + "`r`n" + '</head>')
}
if ($patched -notmatch 'mrlee-slide\.js') {
  if ($patched -notmatch '</body>') {throw 'Thieu </body>; chua ghi file.'}
  $patched = $patched.Replace('</body>', '  <script defer src="mrlee-slide.js?v=restore9-20261013" data-mrlee-slide="js"></script>' + "`r`n" + '</body>')
}
if (([regex]::Matches($patched,'class="mrlee-banner9-slide')).Count -ne 9) {throw 'Banner sau sua khong du 9 anh; chua ghi file.'}
[System.IO.File]::WriteAllText($index, $patched, (New-Object System.Text.UTF8Encoding($false)))
foreach($name in @('mrlee-slide.css','mrlee-slide.js') + @(1..9 | ForEach-Object {"images/$_.png"})) {
  $src = Join-Path $files $name
  $dest = Join-Path $Website $name
  [System.IO.Directory]::CreateDirectory((Split-Path -Parent $dest)) | Out-Null
  Copy-Item -LiteralPath $src -Destination $dest -Force
}
Write-Host ''
Write-Host 'HOAN TAT: DA KHOI PHUC DAY DU 9 ANH BIA + CHUYEN ANH TU DONG 2 GIAY.' -ForegroundColor Green
Write-Host "WEBSITE: $Website"
Write-Host "SAO LUU: $backup"
Write-Host 'BAN NANG CAP KHONG SUA 4 NUT CHINH, BAI HOC, LOGO HAY FIREBASE.'
Write-Host 'BUOC TIEP: CHAY 02-DAY_GITHUB.cmd DE DUA ANH LEN WEBSITE.'
