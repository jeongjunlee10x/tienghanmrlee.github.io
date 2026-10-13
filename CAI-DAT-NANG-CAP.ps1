# TIENG HAN MR LEE - Install grouped navigation and Korean culture pages.
# This script backs up every overwritten file, then copies ONLY upgrade files.
$ErrorActionPreference = 'Stop'
$siteRoot = 'C:\Users\Surface\Documents\tienghanmrlee.github.io'
$sourceRoot = $PSScriptRoot

$files = @(
    'index.html',
    'hoc-tieng-han.html',
    'giao-tiep-phong-van.html',
    'kiem-tra-topik.html',
    'van-hoa-han-quoc.html',
    'van-hoa-bai-hoc.html',
    'mrlee-sections.css',
    'mrlee-culture.css',
    'mrlee-culture-data.js',
    'mrlee-culture.js'
)

if (-not (Test-Path -LiteralPath $siteRoot -PathType Container)) {
    throw "Website folder not found: $siteRoot"
}
foreach ($name in $files) {
    if (-not (Test-Path -LiteralPath (Join-Path $sourceRoot $name) -PathType Leaf)) {
        throw "Required upgrade file is missing: $name"
    }
}

$backupDir = Join-Path $siteRoot ('SAO-LUU_TRUOC_NANG_CAP_' + (Get-Date -Format 'yyyyMMdd_HHmmss'))
$existing = @($files | Where-Object { Test-Path -LiteralPath (Join-Path $siteRoot $_) -PathType Leaf })
if ($existing.Count -gt 0) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    foreach ($name in $existing) {
        Copy-Item -LiteralPath (Join-Path $siteRoot $name) -Destination (Join-Path $backupDir $name) -Force
    }
    Write-Host "Backup created: $backupDir"
}
foreach ($name in $files) {
    Copy-Item -LiteralPath (Join-Path $sourceRoot $name) -Destination (Join-Path $siteRoot $name) -Force
    Write-Host "Installed: $name"
}
Write-Host ""
Write-Host "SUCCESS. The website files have been updated." -ForegroundColor Green
Write-Host "Website: $siteRoot"
Write-Host "Review index.html and van-hoa-han-quoc.html before pushing to GitHub."
