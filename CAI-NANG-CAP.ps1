#requires -Version 5.1
<#
  MR LEE UPGRADE 2026 - cai dat an toan cho GitHub Pages.
  Khong xoa / thay doi Firebase, Firestore Rules, kho cau hoi, du lieu hoc vien.
  Chay: powershell -ExecutionPolicy Bypass -File .\CAI-NANG-CAP.ps1
#>
$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot
$requiredFiles = @('index.html', 'mrlee-core.css', 'mrlee-core.js', 'trung-tam-hoc-vien.html', 'mrlee-student.js')
foreach ($filename in $requiredFiles) {
    if (-not (Test-Path -LiteralPath (Join-Path $projectRoot $filename))) {
        Write-Host "THIEU FILE: $filename" -ForegroundColor Red
        Write-Host "Hay copy cac file trong ZIP vao thu muc website truoc khi chay lenh."
        exit 1
    }
}
$backupName = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupFolder = Join-Path $projectRoot ('.mrlee-backups\' + $backupName)
New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null
$utf8 = New-Object System.Text.UTF8Encoding($false)
$changedCount = 0
$targets = @(
    'index.html', 'bai-hoc.html', 'so-cap-1.html', 'so-cap-2.html',
    'giao-tiep-theo-chu-de.html', 'on-luyen-phong-van.html',
    'kiem-tra-dau-vao.html', 'kiem-tra-online.html', 'bo-sach.html',
    'de-thi-topik.html', 'thi-topik-online.html', 'lich-su-hoc-tap.html',
    'noi-dung-bao-mat.html', 'so-tay-rieng.html'
)
foreach ($name in $targets) {
    $filePath = Join-Path $projectRoot $name
    if (-not (Test-Path -LiteralPath $filePath)) {
        Write-Host "Khong co file $name - bo qua."
        continue
    }
    $html = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
    if ($html -notmatch '(?i)</head>' -or $html -notmatch '(?i)</body>') {
        Write-Host "Khong tim thay head/body trong $name - bo qua." -ForegroundColor Yellow
        continue
    }
    $original = $html
    if ($html -notmatch '(?i)<link\b[^>]*href=["''][^"'']*mrlee-core[.]css') {
        $headTag = New-Object System.Text.RegularExpressions.Regex '(?i)</head>'
        $html = $headTag.Replace($html, "  <link rel=`"stylesheet`" href=`"mrlee-core.css`">`r`n</head>", 1)
    }
    if ($html -notmatch '(?i)<script\b[^>]*src=["''][^"'']*mrlee-core[.]js') {
        $bodyTag = New-Object System.Text.RegularExpressions.Regex '(?i)</body>'
        $html = $bodyTag.Replace($html, "  <script defer src=`"mrlee-core.js`"></script>`r`n</body>", 1)
    }
    # Tu chon thanh ngon ngu tren trang con, khong thay noi dung giang day.
    $i18nPath = Join-Path $projectRoot 'mrlee-i18n.js'
    if ((Test-Path -LiteralPath $i18nPath) -and $html -notmatch '(?i)<script\b[^>]*src=["''][^"'']*mrlee-i18n[.]js') {
        $bodyTag = New-Object System.Text.RegularExpressions.Regex '(?i)</body>'
        $html = $bodyTag.Replace($html, "  <script defer src=`"mrlee-i18n.js`"></script>`r`n</body>", 1)
    }
    if ($html -ne $original) {
        Copy-Item -LiteralPath $filePath -Destination (Join-Path $backupFolder $name) -Force
        [System.IO.File]::WriteAllText($filePath, $html, $utf8)
        $changedCount++
        Write-Host "Da nang cap: $name" -ForegroundColor Green
    } else {
        Write-Host "Da co nang cap: $name"
    }
}
$ignoreFile = Join-Path $projectRoot '.gitignore'
$ignoreLine = '.mrlee-backups/'
if (-not (Test-Path -LiteralPath $ignoreFile)) {
    [System.IO.File]::WriteAllText($ignoreFile, "$ignoreLine`r`n", $utf8)
} else {
    $ignoreText = [System.IO.File]::ReadAllText($ignoreFile)
    if ($ignoreText -notmatch '(?m)^\.mrlee-backups/\s*$') {
        [System.IO.File]::AppendAllText($ignoreFile, "`r`n$ignoreLine`r`n", $utf8)
    }
}
Write-Host "`nHOAN TAT! So trang duoc cap nhat: $changedCount" -ForegroundColor Green
Write-Host "Ban sao truoc khi thay doi tai: $backupFolder"
Write-Host 'Truoc khi git push: thu trang chu, bai hoc, dang nhap va xem lich su Firebase.'
Write-Host 'Khong thay doi Firestore Rules trong ban cai nay.'
