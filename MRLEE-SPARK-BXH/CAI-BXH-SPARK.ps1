# MRLEE - Spark leaderboard V4 (local files only). No cloud deployment, no wallet changes.
param([string]$WebsitePath="C:\Users\Surface\Documents\tienghanmrlee.github.io")
$ErrorActionPreference='Stop'
$root=[IO.Path]::GetFullPath($WebsitePath).TrimEnd('\')
if(-not (Test-Path -LiteralPath (Join-Path $root 'index.html') -PathType Leaf)) { throw "Sai thu muc website: $root" }
if(-not (Test-Path -LiteralPath (Join-Path $root 'firestore.rules') -PathType Leaf)) { throw "Khong tim thay firestore.rules" }
$rules=[IO.File]::ReadAllText((Join-Path $root 'firestore.rules'))
if($rules -notmatch 'match\s+/mrleePublicLeaderboard/\{uid\}' -or $rules -notmatch 'publicRankingValid\(uid\)') {
 throw 'Rules hien tai chua co quyen ghi Spark cho mrleePublicLeaderboard. DUNG LAI va kiem tra rules.'
}
$src=Join-Path $PSScriptRoot 'mrlee-leaderboard.js'
$lib=Join-Path $PSScriptRoot 'mrlee-ranking-utils.mjs'
if(-not (Test-Path -LiteralPath $src) -or -not (Test-Path -LiteralPath $lib)) {throw 'Giai nen day du ZIP, khong chay truc tiep trong ZIP.'}
$target=Join-Path $root 'mrlee-leaderboard.js'
if(-not (Test-Path -LiteralPath $target)) {throw 'Khong tim thay mrlee-leaderboard.js dang chay.'}
$oldJs=[IO.File]::ReadAllText($target)
if($oldJs -notmatch "mrleePublicLeaderboard" -or $oldJs -notmatch 'rankEntries') {throw 'Ma BXH hien tai khong giong V3. Dung lai de tranh ghi de sai phien ban.'}
$stamp=Get-Date -Format 'yyyyMMdd-HHmmss'
$backup=Join-Path (Split-Path -Parent $root) ('MRLEE-SPARK-BACKUP-'+$stamp)
New-Item -ItemType Directory -Path $backup -Force | Out-Null
# Back up source JS and EVERY changed page before modifying anything.
$changes=New-Object 'System.Collections.Generic.List[object]'
$changes.Add([pscustomobject]@{Relative='mrlee-leaderboard.js'; Source=$src; Text=$null})
$changes.Add([pscustomobject]@{Relative='mrlee-ranking-utils.mjs'; Source=$lib; Text=$null})
$changes.Add([pscustomobject]@{Relative='leaderboard-functions\spark-backfill.cjs'; Source=(Join-Path $PSScriptRoot 'spark-backfill.cjs'); Text=$null})
$enc=New-Object System.Text.UTF8Encoding($false)
foreach($page in Get-ChildItem -LiteralPath $root -Filter '*.html' -File){
  $orig=[IO.File]::ReadAllText($page.FullName)
  if($orig -notmatch 'mrlee-leaderboard.js') {continue}
  $new=[regex]::Replace($orig,'mrlee-leaderboard\.js(?:\?[^"''\s<>]*)?','mrlee-leaderboard.js?v=spark-v4')
  if($page.Name -eq 'bang-xep-hang.html'){
    $new=$new.Replace('Khi điểm thay đổi, bảng tự cập nhật sau khi server xử lý.', 'Điểm được đồng bộ khi học viên đăng nhập và mở trang có bảng xếp hạng.')
  }
  if($orig -ne $new){$changes.Add([pscustomobject]@{Relative=$page.Name;Source=$null;Text=$new})}
}
foreach($change in $changes){
 $from=Join-Path $root $change.Relative
 if(Test-Path -LiteralPath $from -PathType Leaf){
  $dest=Join-Path $backup $change.Relative
  Copy-Item -LiteralPath $from -Destination $dest -Force -ErrorAction Stop
 }
}
try{
 foreach($change in $changes){
  $dest=Join-Path $root $change.Relative
  if($null -ne $change.Source){Copy-Item -LiteralPath $change.Source -Destination $dest -Force -ErrorAction Stop}
  else {[IO.File]::WriteAllText($dest,[string]$change.Text,$enc)}
 }
} catch {
 foreach($change in $changes){
  $dest=Join-Path $root $change.Relative;$saved=Join-Path $backup $change.Relative
  if(Test-Path -LiteralPath $saved){Copy-Item -LiteralPath $saved -Destination $dest -Force}
  elseif(Test-Path -LiteralPath $dest){Remove-Item -LiteralPath $dest -Force}
 }
 throw
}
Write-Host "THANH CONG: DA CAI BXH SPARK (CHUA DAY LEN GITHUB)." -ForegroundColor Green
Write-Host "Backup: $backup"
Write-Host "Files changed: $($changes.Count)"
Write-Host 'Can mo website va kiem tra tren trinh duyet. KHONG DEPLOY FUNCTIONS.' -ForegroundColor Yellow
