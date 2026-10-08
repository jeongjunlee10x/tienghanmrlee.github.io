# Mr Lee: cập nhật cổng đăng nhập trên từng file HTML, an toàn khi chạy lại.
# Chạy trong VS Code Terminal: powershell -ExecutionPolicy Bypass -File .\CAI-BAO-MAT.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$utf8 = New-Object System.Text.UTF8Encoding($false)
$backup = Join-Path $root '.mrlee-backup'
New-Item -ItemType Directory -Path $backup -Force | Out-Null
$ignore = Join-Path $root '.gitignore'
$ignoreText = if (Test-Path $ignore) { [System.IO.File]::ReadAllText($ignore) } else { '' }
if ($ignoreText -notmatch '(?m)^\.mrlee-backup/\s*$') {
    [System.IO.File]::AppendAllText($ignore, "`r`n.mrlee-backup/`r`n", $utf8)
}
$gate = @'
<!-- MR LEE AUTH GUARD START -->
<style id="mrlee-auth-hide">body { visibility: hidden !important; }</style>
<noscript><style>body { visibility: visible !important; } body > * { display: none !important; } body:before { content:"Can bat JavaScript de su dung trang hoc."; display:block!important; padding:45px; font:16px Arial,sans-serif; }</style></noscript>
<script type="module" src="auth-guard.js"></script>
<!-- MR LEE AUTH GUARD END -->
'@
$exclude = @('index.html', 'dang-nhap.html', '404.html')
$count = 0
foreach ($file in (Get-ChildItem -LiteralPath $root -File -Filter '*.html')) {
    if ($exclude -contains $file.Name.ToLowerInvariant()) { continue }
    $html = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    if ($html -notmatch '(?i)<head\b') { Write-Warning "Bo qua file khong co head: $($file.Name)"; continue }
    $original = $html
    # Thay thế đoạn cổng bảo vệ cũ, không tạo nhiều bản trùng nhau.
    $old = '(?is)<!--\s*MR LEE AUTH GUARD START\s*-->.*?<!--\s*MR LEE AUTH GUARD END\s*-->'
    if ([regex]::IsMatch($html, $old)) {
        $html = [regex]::Replace($html, $old, $gate)
    } else {
        $m = [regex]::Match($html, '(?i)<head\b[^>]*>')
        if (-not $m.Success) { continue }
        $html = $html.Insert($m.Index + $m.Length, "`r`n" + $gate + "`r`n")
    }
    # Mọi nút TOPIK trong website đi qua trang trung gian đã bảo vệ.
    if ($file.Name.ToLowerInvariant() -ne 'thi-topik-online.html') {
        $html = $html.Replace('href="https://www.topik.go.kr/TWSTDY/TWSTDY0080.do"', 'href="thi-topik-online.html"')
    }
    if ($html -cne $original) {
        $bak = Join-Path $backup $file.Name
        if (-not (Test-Path $bak)) { [System.IO.File]::WriteAllText($bak, $original, $utf8) }
        [System.IO.File]::WriteAllText($file.FullName, $html, $utf8)
        Write-Host "Da bao ve: $($file.Name)"
        $count++
    }
}
# Trang chu: giữ nguyên thiết kế, chỉ bảo đảm có script hiện trạng tài khoản.
$homePagePath = Join-Path $root 'index.html'
if (Test-Path $homePagePath) {
    $html = [System.IO.File]::ReadAllText($homePagePath, [System.Text.Encoding]::UTF8)
    $oldHtml = $html
    if ($html -notmatch 'auth-status\.js') {
        $html = $html -replace '(?i)</body>', "<script type=`"module`" src=`"auth-status.js`"></script>`r`n</body>"
    }
    $html = $html.Replace('href="https://www.topik.go.kr/TWSTDY/TWSTDY0080.do"', 'href="thi-topik-online.html"')
    if ($html -cne $oldHtml) {
        $bak = Join-Path $backup 'index.html'
        if (-not (Test-Path $bak)) { [System.IO.File]::WriteAllText($bak, $oldHtml, $utf8) }
        [System.IO.File]::WriteAllText($homePagePath, $html, $utf8)
        Write-Host 'Da cap nhat trang chu va TOPIK.'
    }
}
Write-Host "Hoan tat. So trang da cap nhat: $count"
Write-Host 'CHU Y: Firestore Rules phai duoc xuat ban trong Firebase Console de bao ve du lieu that.'
