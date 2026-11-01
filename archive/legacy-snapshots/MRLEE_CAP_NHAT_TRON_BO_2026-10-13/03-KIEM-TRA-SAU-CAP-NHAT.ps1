$root = Join-Path $env:USERPROFILE 'Documents\tienghanmrlee.github.io'
$pages = @('index.html','hoc-tieng-han.html','giao-tiep-phong-van.html','kiem-tra-topik.html','van-hoa-han-quoc.html','van-hoa-bai-hoc.html')
foreach($p in $pages) { $path = Join-Path $root $p; if (Test-Path $path) { Write-Host "OK  $p" -ForegroundColor Green } else { Write-Host "THIEU $p" -ForegroundColor Red } }
Start-Process (Join-Path $root 'index.html')
Start-Process (Join-Path $root 'van-hoa-han-quoc.html')
Write-Host 'Luu y: Doi voi cac tinh nang Firebase, nen kiem tra tren website HTTPS sau khi push.'
