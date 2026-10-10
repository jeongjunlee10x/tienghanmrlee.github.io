# TIENG HAN MR LEE - DESIGN 2026.10 - AN TOAN CHO WEBSITE CO FIREBASE
# Single-file installer; never changes auth scripts, Firestore rules, slideshow or student data.
param([string]$WebsitePath = "")
$ErrorActionPreference = "Stop"
$utf8 = [System.Text.UTF8Encoding]::new($false)

function Decode-Text([string]$payload) {
  $bytes = [Convert]::FromBase64String($payload)
  $memStream = [System.IO.MemoryStream]::new([byte[]]$bytes)
  $zipStream = [System.IO.Compression.GzipStream]::new($memStream, [System.IO.Compression.CompressionMode]::Decompress)
  $reader = [System.IO.StreamReader]::new($zipStream, [System.Text.Encoding]::UTF8)
  try { return $reader.ReadToEnd() } finally { $reader.Dispose(); $zipStream.Dispose(); $memStream.Dispose() }
}

$cssPayload = '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'
$jsPayload = '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'

function Resolve-Website([string]$websiteArg) {
  if ($websiteArg -ne "") {
    if (-not (Test-Path -LiteralPath (Join-Path $websiteArg 'index.html'))) { throw "Khong tim thay index.html trong: $websiteArg" }
    return (Resolve-Path -LiteralPath $websiteArg).Path
  }
  $candidates = @($PSScriptRoot, (Get-Location).Path, 'C:\Users\Surface\Documents\tienghanmrlee.github.io')
  foreach ($candidate in $candidates) {
    if ($candidate -and (Test-Path -LiteralPath (Join-Path $candidate 'index.html'))) {
      return (Resolve-Path -LiteralPath $candidate).Path
    }
  }
  throw 'Khong tim thay website. Chay lai voi -WebsitePath "C:\Users\Surface\Documents\tienghanmrlee.github.io"'
}

$websiteRoot = Resolve-Website $WebsitePath
Write-Host ('Website: ' + $websiteRoot) -ForegroundColor Cyan
$backupBase = Join-Path (Split-Path -Path $websiteRoot -Parent) 'MRLEE-SAO-LUU-GIAO-DIEN'
$backupRoot = Join-Path $backupBase ([DateTime]::Now.ToString('yyyyMMdd-HHmmss-fff'))
New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null

$cssFile = Join-Path $websiteRoot 'mrlee-redesign.css'
$jsFile = Join-Path $websiteRoot 'mrlee-redesign.js'
$assets = @(@{file=$cssFile; data=(Decode-Text $cssPayload)}, @{file=$jsFile; data=(Decode-Text $jsPayload)})
foreach ($asset in $assets) {
  if (Test-Path -LiteralPath $asset.file) { Copy-Item -LiteralPath $asset.file -Destination (Join-Path $backupRoot (Split-Path $asset.file -Leaf)) -Force }
  [System.IO.File]::WriteAllText($asset.file, $asset.data, $utf8)
  Write-Host ('UPDATED ASSET: ' + (Split-Path $asset.file -Leaf)) -ForegroundColor Green
}

$pages = @(
'index.html', 'bai-hoc.html', 'dang-nhap.html', 'so-cap-1.html', 'so-cap-2.html',
'giao-tiep-theo-chu-de.html', 'on-luyen-phong-van.html', 'kiem-tra-dau-vao.html',
'kiem-tra-online.html', 'de-thi-topik.html', 'thi-topik-online.html',
'bo-sach.html', 'lich-su-hoc-tap.html', 'lo-trinh-1-6.html',
'luyen-noi-tinh-diem.html', 'bang-chu-cai-tieng-han.html',
'kiem-tra-trinh-do.html','trung-tam-hoc-vien.html'
)
$styleTag = '<link rel="stylesheet" href="mrlee-redesign.css?v=20261010-v1">'
$scriptTag = '<script defer src="mrlee-redesign.js?v=20261010-v1"></script>'
$updatedCount=0
foreach ($fileName in $pages) {
  $fullPath = Join-Path $websiteRoot $fileName
  if (-not (Test-Path -LiteralPath $fullPath)) { continue }
  $htmlContent = [System.IO.File]::ReadAllText($fullPath, [System.Text.Encoding]::UTF8)
  if ($htmlContent -notmatch '(?i)</head\s*>' -or $htmlContent -notmatch '(?i)</body\s*>') {
    Write-Warning ("SKIPPED malformed HTML: " + $fileName)
    continue
  }
  $revisedHtml = $htmlContent
  if ($revisedHtml -notmatch 'mrlee-redesign\.css') {
    $revisedHtml = [regex]::Replace($revisedHtml, '(?i)</head\s*>', ($styleTag + "`r`n</head>"))
  }
  if ($revisedHtml -notmatch 'mrlee-redesign\.js') {
    $revisedHtml = [regex]::Replace($revisedHtml, '(?i)</body\s*>', ($scriptTag + "`r`n</body>"))
  }
  if ($revisedHtml -ne $htmlContent) {
    Copy-Item -LiteralPath $fullPath -Destination (Join-Path $backupRoot $fileName) -Force
    [System.IO.File]::WriteAllText($fullPath, $revisedHtml, $utf8)
    $updatedCount++
    Write-Host ('UPDATED HTML: ' + $fileName) -ForegroundColor Green
  } else { Write-Host ('ALREADY INSTALLED: ' + $fileName) }
}
Write-Host ''
Write-Host ('SUCCESS: Giao dien da nang cap; HTML moi sua: ' + $updatedCount) -ForegroundColor Green
Write-Host ('BACKUP: ' + $backupRoot) -ForegroundColor Yellow
Write-Host 'KHONG thay doi admin.html, Firebase, ma diem, hoac banner 9 anh.' -ForegroundColor Cyan
Write-Host 'Git: git add -u; git add mrlee-redesign.css mrlee-redesign.js; git commit; git push'
