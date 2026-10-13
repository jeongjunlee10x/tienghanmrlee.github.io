# MR LEE V2 — cập nhật đầy đủ tên menu và dữ liệu V2, sao lưu + push GitHub.
# Chạy từ thư mục ZIP đã giải nén. Không xóa dữ liệu và không dùng force push.
$ErrorActionPreference = 'Stop'
$Target = 'C:\Users\Surface\Documents\tienghanmrlee.github.io'
$Source = Join-Path $PSScriptRoot 'FILES'
$Manifest = Join-Path $PSScriptRoot 'DANH_SACH_FILE.txt'

function Check-Git([string[]]$Parameters, [string]$Message) {
    & git -C $Target @Parameters
    if ($LASTEXITCODE -ne 0) { throw $Message }
}

try {
    Write-Host ''
    Write-Host 'MR LEE - CAP NHAT MENU V2 + DAY GITHUB' -ForegroundColor Cyan
    if (-not (Test-Path -LiteralPath $Target -PathType Container)) { throw "Khong tim thay thu muc website: $Target" }
    if (-not (Test-Path -LiteralPath $Source -PathType Container) -or -not (Test-Path -LiteralPath $Manifest -PathType Leaf)) {
        throw 'Giai nen toan bo ZIP truoc khi chay (thieu FILES/ hoac DANH_SACH_FILE.txt).'
    }
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'Khong tim thay Git. Vui long mo terminal VS Code co Git.' }
    & git -C $Target rev-parse --is-inside-work-tree | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Thu muc website chua la Git repository.' }
    $branch = (& git -C $Target branch --show-current).Trim()
    if ($branch -ne 'main') { throw "Ban dang o nhanh '$branch', can kiem tra truoc khi day len GitHub." }
    $remote = (& git -C $Target remote get-url origin)
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($remote)) { throw 'Chua co Git remote origin.' }
    Write-Host "Remote: $remote" -ForegroundColor Yellow
    if ($remote -notmatch '(?i)jeongjunlee10x[/:]tienghanmrlee\.github\.io(?:\.git)?/?$') {
        Write-Host 'CHU Y: Git origin khac dia chi jeongjunlee10x/tienghanmrlee.github.io.' -ForegroundColor Red
        throw 'Dung cap nhat de kiem tra git remote -v truoc, tranh push nham repository.'
    }
    $staged = @(& git -C $Target diff --cached --name-only)
    if ($staged.Count -gt 0) { throw 'Git da co file cho commit. Hay commit/bo stage truoc de khong tron cac thay doi.' }

    $paths = @(Get-Content -LiteralPath $Manifest -Encoding UTF8 | Where-Object { $_.Trim() -ne '' })
    if ($paths.Count -ne 17) { throw "Danh sach khong dung 17 file (tim thay $($paths.Count))." }
    foreach ($rel in $paths) {
        if ($rel -match '^\.' -or $rel -match '(^|[\\/])\.\.' -or [IO.Path]::IsPathRooted($rel) -or $rel -match '[\\/]') {
            throw "Duong dan khong hop le: $rel"
        }
        if (-not (Test-Path -LiteralPath (Join-Path $Source $rel) -PathType Leaf)) { throw "Thieu file nguon: $rel" }
    }
    $index = Get-Content -LiteralPath (Join-Path $Source 'index.html') -Raw -Encoding UTF8
    if ($index -notmatch '<h3>Luyện giao tiếp</h3>' -or $index -notmatch '<summary>Luyện giao tiếp</summary>') {
        throw 'index.html trong goi khong chua ten nut Luyen giao tiep theo yeu cau.'
    }
    $backup = Join-Path (Split-Path $Target -Parent) ('MRLEE_BACKUP_TRUOC_V2_' + (Get-Date -Format 'yyyyMMdd_HHmmss'))
    New-Item -ItemType Directory -Path $backup -Force | Out-Null
    $log = @()
    foreach ($rel in $paths) {
        $old = Join-Path $Target $rel
        if (Test-Path -LiteralPath $old -PathType Leaf) {
            Copy-Item -LiteralPath $old -Destination (Join-Path $backup $rel) -Force
            $log += "SAO LUU: $rel"
        } else { $log += "TAO MOI: $rel" }
    }
    $log | Set-Content -LiteralPath (Join-Path $backup 'DANH_SACH_BACKUP.txt') -Encoding UTF8
    Write-Host "Da sao luu ban cu tai: $backup" -ForegroundColor Yellow

    foreach ($rel in $paths) {
        Copy-Item -LiteralPath (Join-Path $Source $rel) -Destination (Join-Path $Target $rel) -Force
        Write-Host "CAP NHAT: $rel" -ForegroundColor DarkCyan
    }

    $updated = Get-Content -LiteralPath (Join-Path $Target 'index.html') -Raw -Encoding UTF8
    if ($updated -notmatch '<h3>Luyện giao tiếp</h3>' -or $updated -notmatch '<summary>Luyện giao tiếp</summary>' -or $updated -notmatch '<h3>Học tiếng Hàn</h3>') {
        throw 'Kiem tra ten menu sau khi chep that bai. Ban sao luu da duoc luu.'
    }
    Write-Host ''
    Write-Host 'DA DOI TEN MENU: Hoc tieng Han | Luyen giao tiep | Kiem tra & TOPIK | Van hoa Han Quoc' -ForegroundColor Green
    Write-Host 'Dang kiem tra cac thay doi de commit...' -ForegroundColor Cyan
    & git -C $Target add -- $paths
    if ($LASTEXITCODE -ne 0) { throw 'git add that bai.' }
    & git -C $Target diff --cached --stat
    & git -C $Target diff --cached --quiet
    if ($LASTEXITCODE -eq 0) {
        Write-Host 'Khong co file moi can day. Co the website da cap nhat V2 tu truoc.' -ForegroundColor Green
        exit 0
    }
    Write-Host ''
    $go = Read-Host 'Nhap DAY de commit va day 17 file len GitHub (Enter = huy)'
    if ($go -cne 'DAY') {
        Write-Host 'Da cap nhat file tren may, CHUA day len GitHub. Co the day sau bang git add/commit/push.' -ForegroundColor Yellow
        exit 0
    }
    & git -C $Target commit -m 'Dong bo 4 menu Mr Lee V2 va noi dung hoc tap'
    if ($LASTEXITCODE -ne 0) { throw 'git commit that bai. Kiem tra ten/email Git.' }
    & git -C $Target push origin main
    if ($LASTEXITCODE -ne 0) { throw 'git push that bai. Xem loi ben tren; KHONG dung force push.' }
    Write-Host ''
    Write-Host 'THANH CONG: Da day V2 len GitHub (nhanh main).' -ForegroundColor Green
    Write-Host 'Mo trang sau va nhan Ctrl+Shift+R:'
    Write-Host 'https://jeongjunlee10x.github.io/tienghanmrlee.github.io/index.html?v=menu-v2' -ForegroundColor Cyan
} catch {
    Write-Host "LOI: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
