param([string]$Website = 'C:\Users\Surface\Documents\tienghanmrlee.github.io')
$ErrorActionPreference = 'Stop'
if(-not (Test-Path -LiteralPath (Join-Path $Website 'index.html'))) {throw "Khong tim thay website: $Website"}
Push-Location $Website
try {
  if((git rev-parse --is-inside-work-tree 2>$null) -ne 'true') {throw 'Thu muc khong phai Git repository.'}
  $branch = (git branch --show-current).Trim()
  if($branch -ne 'main') {throw "Dang o nhanh $branch (khong phai main); khong tu dong doi nhanh."}
  $remote = (git remote get-url origin 2>$null)
  if(-not $remote) {throw 'Chua co remote origin.'}
  $index = [System.IO.File]::ReadAllText((Join-Path $Website 'index.html'),[System.Text.Encoding]::UTF8)
  if(([regex]::Matches($index,'class="mrlee-banner9-slide')).Count -ne 9) {throw 'Chua co du 9 banner. Hay chay 01 truoc.'}
  $already = @(git diff --cached --name-only)
  if($already.Count -gt 0) {
    Write-Host "Da co file dang staged trong Git: $($already -join ', ')"
    throw 'Hay xu ly cac thay doi dang staged truoc; khong tron commit.'
  }
  Write-Host 'Chi 12 file duoi day se duoc dua len GitHub:' -ForegroundColor Cyan
  Write-Host 'index.html; mrlee-slide.css; mrlee-slide.js; images/1.png ... images/9.png'
  $confirm = Read-Host 'Nhap DAY de commit va push (khac DAY la huy)'
  if($confirm -cne 'DAY') {Write-Host 'Da huy. Khong thay doi GitHub.';return}
  $targets = @('index.html','mrlee-slide.css','mrlee-slide.js') + @(1..9 | ForEach-Object {"images/$_.png"})
  & git add -- $targets
  if($LASTEXITCODE -ne 0) {throw 'Git add bi loi.'}
  & git diff --cached --stat
  & git diff --cached --quiet
  if($LASTEXITCODE -eq 0) {Write-Host 'Khong co thay doi moi de commit.';return}
  & git commit -m 'Restore original nine MR Lee cover banners'
  if($LASTEXITCODE -ne 0) {throw 'Git commit that bai.'}
  & git push origin main
  if($LASTEXITCODE -ne 0) {throw 'Git push that bai. Khong dung force push.'}
  Write-Host 'DA PUSH 9 ANH BIA LEN GITHUB THANH CONG.' -ForegroundColor Green
} finally {Pop-Location}
