# Tiếng Hàn Mr Lee — Lưu điểm LUYỆN TẬP và lịch sử học tập theo Firebase UID.
# Chạy tại thư mục website: powershell -ExecutionPolicy Bypass -File .\CAI-LICH-SU-HOC-TAP.ps1
# Có thể chạy lại; giữ nguyên giao diện, backup vào .mrlee-backup-history\.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$utf8 = New-Object System.Text.UTF8Encoding($false)
$backups = Join-Path $root '.mrlee-backup-history'
New-Item -Path $backups -ItemType Directory -Force | Out-Null

function Read-Html([string]$path) {
    return [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
}
function Write-IfChanged([string]$name, [string]$before, [string]$after) {
    if ($before -ceq $after) { return }
    $source = Join-Path $root $name
    $backupPath = Join-Path $backups $name
    if (-not (Test-Path -LiteralPath $backupPath)) {
        [System.IO.File]::WriteAllText($backupPath, $before, $utf8)
    }
    [System.IO.File]::WriteAllText($source, $after, $utf8)
    Write-Host "Da cap nhat: $name"
}
function Add-Tracker([string]$html) {
    if ($html.Contains('src="learning-tracker.js"')) { return $html }
    if ($html -notmatch '(?i)</body>') { return $html }
    return [regex]::Replace($html, '(?i)</body>', "<script type=`"module`" src=`"learning-tracker.js`"></script>`r`n</body>", 1)
}

# Các trang có hoạt động học cần ghi lại; TRỪ trang chủ, tài khoản và trang lịch sử.
$pages = @(
    'bai-hoc.html','so-cap-1.html','so-cap-2.html','bo-sach.html',
    'de-thi-topik.html','thi-topik-online.html','kiem-tra-dau-vao.html',
    'kiem-tra-online.html','on-luyen-phong-van.html','giao-tiep-theo-chu-de.html',
    'noi-dung-bao-mat.html','so-tay-rieng.html'
)
foreach ($pageName in $pages) {
    $path = Join-Path $root $pageName
    if (-not (Test-Path -LiteralPath $path)) { continue }
    $before = Read-Html $path
    $after = Add-Tracker $before

    # Ghi điểm 3 bộ đề đầu vào 50 câu. Không lưu họ tên và ngày sinh.
    if ($pageName -eq 'kiem-tra-dau-vao.html' -and $after -notmatch 'mrlee:practice-finished') {
        $needle = 'const meta = LEVEL_META[state.selectedLevel];'
        $insert = @'

  window.dispatchEvent(new CustomEvent('mrlee:practice-finished', {
    detail: {
      examId: 'placement-' + state.selectedLevel,
      examTitle: 'Kiểm tra đầu vào ' + meta.name,
      level: state.selectedLevel,
      score: points,
      total: QUESTIONS.length,
      durationSeconds: Math.max(0, Math.min(DURATION_SECONDS,
        Math.round((Date.now() - (state.deadline - DURATION_SECONDS * 1000)) / 1000)))
    }
  }));
'@
        if ($after.Contains($needle)) {
            $after = $after.Replace($needle, $needle + $insert)
        } else {
            Write-Warning 'Khong thay diem gan ket qua 50 cau trong kiem-tra-dau-vao.html. Can kiem tra file goc.'
        }
    }

    # Ghi điểm bài kiểm tra online mẫu 2 câu.
    if ($pageName -eq 'kiem-tra-online.html' -and $after -notmatch 'mrlee:practice-finished') {
        $needle = "document.getElementById('score').textContent = String(score);"
        $insert = @'

        window.dispatchEvent(new CustomEvent('mrlee:practice-finished', {
          detail: {
            examId: 'online-demo', examTitle: 'Kiểm tra Online (bài mẫu)',
            level: 'general', score: score, total: 2,
            durationSeconds: Math.max(0, 15 * 60 - remaining)
          }
        }));
'@
        if ($after.Contains($needle)) {
            $after = $after.Replace($needle, $needle + $insert)
        } else {
            Write-Warning 'Khong thay ham cham diem online. Khong chen ma ghi diem vao file nay.'
        }
    }

    # Bài tập mẫu Bài 1 — Sơ cấp 1.
    if ($pageName -eq 'so-cap-1.html' -and $after -notmatch 'mrlee:practice-finished') {
        $needle = "result.scrollIntoView({behavior:'smooth',block:'nearest'});"
        $insert = @'
window.dispatchEvent(new CustomEvent('mrlee:practice-finished', {
  detail: { examId: 'sc1-bai-1', examTitle: 'Bài tập Sơ cấp 1 · Bài 1',
    level: 'sc1', score: score, total: questions.length, durationSeconds: 0 }
}));
'@
        if ($after.Contains($needle)) {
            $after = $after.Replace($needle, $needle + $insert)
        }
    }
    Write-IfChanged $pageName $before $after
}

# Chỉ bổ sung cổng bảo vệ cho trang lịch sử mới, không ghi đè cổng ở trang khác.
$history = Join-Path $root 'lich-su-hoc-tap.html'
if (Test-Path -LiteralPath $history) {
    $before = Read-Html $history
    $after = $before
    if ($after -notmatch 'MR LEE AUTH GUARD START') {
        $gate = @'
<!-- MR LEE AUTH GUARD START -->
<style id="mrlee-auth-hide">body{visibility:hidden!important}</style>
<noscript><style>body{visibility:visible!important}body>*{display:none!important}body:before{content:'Cần bật JavaScript để xem lịch sử';display:block!important;padding:40px}</style></noscript>
<script type="module" src="auth-guard.js"></script>
<!-- MR LEE AUTH GUARD END -->
'@
        $after = [regex]::Replace($after, '(?i)</head>', "$gate`r`n</head>", 1)
    }
    Write-IfChanged 'lich-su-hoc-tap.html' $before $after
} else {
    Write-Warning 'Chua co lich-su-hoc-tap.html. Hay chep file trong ZIP vao thu muc website.'
}

# Thêm liên kết tới lịch sử ở menu trang chủ mới.
$homepage = Join-Path $root 'index.html'
if (Test-Path -LiteralPath $homepage) {
    $before = Read-Html $homepage
    $after = $before
    if ($after -notmatch 'href="lich-su-hoc-tap\.html"') {
        $navAccount = '<a href="dang-nhap.html" id="mrlee-auth-nav"'
        $link = '<a href="lich-su-hoc-tap.html">Lịch sử học tập</a>'
        if ($after.Contains($navAccount)) {
            $after = $after.Replace($navAccount, $link + "`r`n        " + $navAccount)
        } else {
            $after = [regex]::Replace($after, '(?i)</nav>', ($link + "`r`n      </nav>"), 1)
        }
    }
    Write-IfChanged 'index.html' $before $after
}

# Sao lưu không bao giờ đưa lên repo.
$gitignore = Join-Path $root '.gitignore'
$ignoreText = if (Test-Path -LiteralPath $gitignore) { Read-Html $gitignore } else { '' }
if ($ignoreText -notmatch '(?m)^\.mrlee-backup-history/\s*$') {
    [System.IO.File]::AppendAllText($gitignore, "`r`n.mrlee-backup-history/`r`n", $utf8)
}
Write-Host 'HOAN TAT: Da ket noi trang hoc va bai kiem tra voi lich su Firebase.'
Write-Host 'BAT BUOC: Mo Firebase Console > Firestore Database > Rules, dan firestore.rules MOI va bam Publish.'
Write-Host 'Luu y: diem chi la LUYEN TAP tu cham, khong phai diem thi chinh thuc.'
