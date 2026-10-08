#requires -Version 5.1
# Kiem tra file HTML -> link tai nguyen noi bo de tranh 404 truoc push.
$projectRoot = $PSScriptRoot
$files = Get-ChildItem -LiteralPath $projectRoot -Filter '*.html' -File
$missing = New-Object System.Collections.ArrayList
$checked = 0
foreach ($file in $files) {
  $html = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
  $matchesFound = [regex]::Matches($html, '(?i)\b(?:href|src)\s*=\s*["'']([^"'']+)["'']')
  foreach ($match in $matchesFound) {
    $url = [System.Net.WebUtility]::HtmlDecode($match.Groups[1].Value)
    if ($url -match '^(?:https?:|mailto:|tel:|data:|blob:|#|//|javascript:)' -or $url -match '^\s*$') { continue }
    $clean = ($url -split '[?#]',2)[0]
    if ($clean -eq '' -or $clean.StartsWith('/')) { continue }
    $clean = [uri]::UnescapeDataString($clean)
    if ($clean -match '\.\.') {continue}
    $checked++
    $p = Join-Path $projectRoot $clean
    if (-not (Test-Path -LiteralPath $p)) {
      [void]$missing.Add("$($file.Name) -> $clean")
    }
  }
}
Write-Host "Da kiem tra $checked duong dan noi bo trong $($files.Count) file HTML."
if ($missing.Count -gt 0) {
  Write-Host "Can xem lai $($missing.Count) duong dan: " -ForegroundColor Yellow
  $missing | Sort-Object -Unique | ForEach-Object {Write-Host "- $_"}
} else {Write-Host 'Khong phat hien duong dan file noi bo bi thieu.' -ForegroundColor Green}
Write-Host 'GHI CHU: cong cu nay khong kiem tra Firebase, URL ngoai hay loi JavaScript tren trinh duyet.'
