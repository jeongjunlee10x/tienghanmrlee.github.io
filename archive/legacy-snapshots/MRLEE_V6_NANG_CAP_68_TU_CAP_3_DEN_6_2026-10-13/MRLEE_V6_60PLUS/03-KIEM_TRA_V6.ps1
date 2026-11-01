param(
    [string]$Website = 'C:\Users\Surface\Documents\tienghanmrlee.github.io'
)
$ErrorActionPreference = 'Stop'
try {
    if (-not (Test-Path -LiteralPath $Website -PathType Container)) { throw "Website folder not found: $Website" }
    $required = @(
        'hoc-theo-bai.html',
        'mrlee-advanced-lesson-data.js',
        'mrlee-lesson-page.js',
        'mrlee-v6-vocab.css',
        'mrlee-sc-lesson-data.js'
    )
    foreach ($name in $required) {
        $path = Join-Path $Website $name
        if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Missing website file: $name" }
    }
    $html = [System.IO.File]::ReadAllText((Join-Path $Website 'hoc-theo-bai.html'))
    if (-not ($html.Contains('mrlee6-v6') -and $html.Contains('mrlee-v6-vocab.css'))) {
        throw 'The website has not installed the V6 HTML references. Run 01-CAP_NHAT_V6.cmd first.'
    }
    $data = [System.IO.File]::ReadAllText((Join-Path $Website 'mrlee-advanced-lesson-data.js'))
    $prefix = 'export const ADVANCED_LESSONS = '
    $at = $data.IndexOf($prefix, [StringComparison]::Ordinal)
    if ($at -lt 0) { throw 'Missing ADVANCED_LESSONS data.' }
    $json = $data.Substring($at + $prefix.Length).Trim()
    if ($json.EndsWith(';')) { $json = $json.Substring(0, $json.Length - 1) }
    $lessons = ConvertFrom-Json -InputObject $json
    if ($lessons.Count -ne 60) { throw "Expected 60 advanced lessons; found $($lessons.Count)." }
    $checks = 0
    foreach ($lesson in $lessons) {
        if (@($lesson.vocab).Count -lt 61) { throw "Too few vocabulary items: cap=$($lesson.cap), bai=$($lesson.bai)." }
        if (@($lesson.grammar).Count -lt 3) { throw "Too few grammar items: cap=$($lesson.cap), bai=$($lesson.bai)." }
        $checks++
    }
    $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
    if ($null -ne $nodeCmd) {
        foreach ($name in @('mrlee-advanced-lesson-data.js', 'mrlee-lesson-page.js', 'mrlee-sc-lesson-data.js')) {
            & node --check (Join-Path $Website $name)
            if ($LASTEXITCODE -ne 0) { throw "JavaScript syntax check failed: $name" }
        }
        Write-Host 'JavaScript syntax check: OK' -ForegroundColor Green
    } else {
        Write-Host 'NOTE: Node.js not found; skipped optional JavaScript syntax check.' -ForegroundColor Yellow
    }
    Write-Host "OK: V6 installed. Verified $checks advanced lessons; vocabulary and grammar present." -ForegroundColor Green
    Write-Host 'This check does not upload anything to GitHub.' -ForegroundColor Yellow
    Write-Host 'When ready, run 02-DAY_GITHUB_V6.cmd to publish.' -ForegroundColor Cyan
    exit 0
} catch {
    Write-Host ("FAILED: " + $_.Exception.Message) -ForegroundColor Red
    exit 1
}
