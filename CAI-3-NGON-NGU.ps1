# CAI-3-NGON-NGU.ps1
# Cai thanh chon ngon ngu giao dien cho cac trang con.
# Sao luu cac file truoc khi chinh sua; khong sua index.html hay Firebase Rules.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$utf8 = [System.Text.UTF8Encoding]::new($false)
$backup = Join-Path (Split-Path $root -Parent) ('MRLEE_BACKUP_NGON_NGU_' + (Get-Date -Format 'yyyyMMdd_HHmmss'))
# Neu dang chay trong thu muc website thi sao luu o thu muc cha.
New-Item -ItemType Directory -Force -Path $backup | Out-Null
$count = 0
Get-ChildItem -Path $root -File -Filter '*.html' | ForEach-Object {
  $file = $_
  if ($file.Name -eq 'index.html' -or $file.Name -eq 'admin.html') { return }
  $data = [System.IO.File]::ReadAllText($file.FullName, $utf8)
  if ($data -match 'mrlee-i18n\.js') { return }
  if ($data -notmatch '(?i)</head\s*>') { return }
  Copy-Item -LiteralPath $file.FullName -Destination (Join-Path $backup $file.Name)
  $insert = '<script defer src="mrlee-i18n.js?v=20261008"></script>' + "`r`n" + '</head>'
  $updated = [regex]::Replace($data, '(?i)</head\s*>', [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $insert })
  [System.IO.File]::WriteAllText($file.FullName, $updated, $utf8)
  $script:count++
  Write-Host ('Da them chon ngon ngu: ' + $file.Name)
}
Write-Host ('Hoan tat: ' + $count + ' trang con. Sao luu tai: ' + $backup)
Write-Host 'Luu y: Trang con hien chi dich menu va nhan dieu huong; noi dung hoc can duoc bien soan rieng.'
