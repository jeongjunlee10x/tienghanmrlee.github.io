# MR LEE - install local website files only. No deployment, no wallet changes.
param([string]$WebsitePath='')
$ErrorActionPreference='Stop'
if([string]::IsNullOrWhiteSpace($WebsitePath)) { $WebsitePath=(Get-Location).Path }
$root=[IO.Path]::GetFullPath($WebsitePath).TrimEnd('\')
if(-not (Test-Path -LiteralPath (Join-Path $root 'index.html') -PathType Leaf)) { throw 'Hay mo Terminal tai thu muc website co index.html hoac truyen -WebsitePath.' }
$payload=Join-Path $PSScriptRoot 'payload'
if(-not (Test-Path -LiteralPath $payload -PathType Container)) { throw 'Hay giai nen TOAN BO goi ZIP truoc khi chay.' }
$stamp=(Get-Date -Format 'yyyyMMdd-HHmmss')+'-'+[guid]::NewGuid().ToString('N').Substring(0,6)
$backup=Join-Path (Split-Path -Parent $root) ('MRLEE-BACKUP-BXH-'+$stamp)
$utf8=New-Object System.Text.UTF8Encoding($false)
$changes=New-Object 'System.Collections.Generic.List[object]'
foreach($source in (Get-ChildItem -LiteralPath $payload -Recurse -Force -File)) {
 $rel=$source.FullName.Substring($payload.Length).TrimStart('\','/')
 $changes.Add([pscustomobject]@{Relative=$rel;Bytes=[IO.File]::ReadAllBytes($source.FullName)})
}
# Update existing leaderboard asset URLs without overwriting whole HTML pages.
foreach($page in (Get-ChildItem -LiteralPath $root -Filter '*.html' -File)) {
 if($page.Name -match 'backup|THAM-KHAO|XEM-TRUOC|index-co-nen') {continue}
 $old=[IO.File]::ReadAllText($page.FullName)
 $updated=[regex]::Replace($old,'mrlee-leaderboard\.(js|css)(\?[^"''\s<>]*)?','mrlee-leaderboard.$1?v=server-v3')
 if($page.Name -eq 'index.html' -and $updated -notmatch 'mrlee-leaderboard.js') {
  if($updated -notmatch '</body>') {throw 'Khong tim thay the body trong index.html.'}
  $updated=$updated.Replace('</body>',"<link rel=`"stylesheet`" href=`"mrlee-leaderboard.css?v=server-v3`"><script type=`"module`" src=`"mrlee-leaderboard.js?v=server-v3`"></script></body>")
 }
 if($updated -ne $old) {$changes.Add([pscustomobject]@{Relative=$page.Name;Bytes=$utf8.GetBytes($updated)})}
}
New-Item -ItemType Directory -Path $backup -Force | Out-Null
$manifest=@()
# Back up every destination before writing any website file.
foreach($change in $changes) {
 $target=Join-Path $root $change.Relative
 $existed=Test-Path -LiteralPath $target -PathType Leaf
 if($existed){
  $saved=Join-Path $backup $change.Relative
  New-Item -ItemType Directory -Path (Split-Path -Parent $saved) -Force | Out-Null
  Copy-Item -LiteralPath $target -Destination $saved -Force
 }
 $manifest+= [pscustomobject]@{Relative=$change.Relative;Existed=$existed}
}
[IO.File]::WriteAllText((Join-Path $backup 'manifest.json'),(ConvertTo-Json -InputObject $manifest -Depth 4),$utf8)
try {
 foreach($change in $changes){
  $target=Join-Path $root $change.Relative
  New-Item -ItemType Directory -Path (Split-Path -Parent $target) -Force | Out-Null
  [IO.File]::WriteAllBytes($target,$change.Bytes)
 }
} catch {
 foreach($entry in $manifest){
  $target=Join-Path $root $entry.Relative
  if($entry.Existed){Copy-Item -LiteralPath (Join-Path $backup $entry.Relative) -Destination $target -Force}
  elseif(Test-Path -LiteralPath $target -PathType Leaf){Remove-Item -LiteralPath $target -Force}
 }
 throw
}
Write-Host 'SUCCESS: DA CAI TEP NANG CAP GIAO DIEN.' -ForegroundColor Green
Write-Host ('Backup: '+$backup)
Write-Host 'CHUA TRIEN KHAI SERVER. Doc HUONG-DAN-BXH-TOAN-SERVER.md trong goi ZIP.' -ForegroundColor Yellow
Write-Host 'Can: Publish Rules + deploy Functions + chay backfill + day tep website len GitHub.'
