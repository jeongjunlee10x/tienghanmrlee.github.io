# TIENG HAN MR LEE - Chay tai thu muc co index.html va cac trang hoc.
# Dat file nay o cung thu muc index.html, sau do chay:
# powershell -ExecutionPolicy Bypass -File .\CAI-KHOA-DANG-NHAP.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$utf8 = New-Object System.Text.UTF8Encoding($false)
$guard = @'
<!-- MR LEE AUTH GUARD START -->
<style id="mrlee-auth-hide">body { visibility: hidden !important; }</style>
<noscript><style>html body { visibility: visible !important; } body > * { display: none !important; } body:before { content:"Hay bat JavaScript de su dung website."; display:block !important; padding:48px 20px; font:18px Arial,sans-serif; color:#142b4c; }</style></noscript>
<script type="module" src="auth-guard.js"></script>
<!-- MR LEE AUTH GUARD END -->
'@
$exclude = @('index.html', 'dang-nhap.html')
$count = 0
Get-ChildItem -LiteralPath $root -File -Filter '*.html' | ForEach-Object {
  $file = $_
  if ($exclude -contains $file.Name.ToLowerInvariant()) { return }
  $html = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
  if ($html.Contains('MR LEE AUTH GUARD START')) {
    Write-Host "Da bao ve: $($file.Name)"
    return
  }
  $match = [regex]::Match($html, '<head\b[^>]*>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
  if (-not $match.Success) { Write-Warning "Khong tim thay <head>: $($file.Name)"; return }
  $html = $html.Insert($match.Index + $match.Length, "`r`n" + $guard + "`r`n")
  [System.IO.File]::WriteAllText($file.FullName, $html, $utf8)
  $count += 1
  Write-Host "Khoa dang nhap: $($file.Name)"
}
Write-Host "Hoan tat. Da cap nhat $count trang HTML."
Write-Host 'Trang chu index.html va dang-nhap.html van duoc xem khong can dang nhap.'
