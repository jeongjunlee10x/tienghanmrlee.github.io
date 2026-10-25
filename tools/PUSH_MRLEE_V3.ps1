# MR LEE V3: safe bulk uploader for exactly 170 new, independent AI images.
# Requires Git, Python 3.12, and original ZIP of 170 prompts.
# Does NOT force-push, overwrite official logo, or modify production main.
[CmdletBinding()]
param(
 [Parameter(Mandatory=$true)][string]$ImageSource,
 [string]$Root = (Join-Path $env:USERPROFILE 'Documents\tienghanmrlee.github.io'),
 [string]$PromptZip = (Join-Path $env:USERPROFILE 'Downloads\MRLEE_V3_170_PROMPT_ANH_RIENG_THEO_THU_MUC.zip')
)
$ErrorActionPreference='Stop'
function RunGit([string[]]$ArgsList) {
 $output=& git -C $Root @ArgsList 2>&1
 if($LASTEXITCODE -ne 0){
   throw ('Git failed: '+($ArgsList -join ' ')+[Environment]::NewLine+($output | Out-String))
 }
 return $output
}
if(!(Get-Command git -ErrorAction SilentlyContinue)){throw 'Can cai Git'}
if(!(Get-Command py -ErrorAction SilentlyContinue)){throw 'Can Python 3.12 (py -3.12)'}
if(!(Test-Path -LiteralPath $Root -PathType Container)){throw ('Khong tim thay repo: '+$Root)}
if(!(Test-Path -LiteralPath $ImageSource -PathType Container)){throw ('Khong tim thay anh moi: '+$ImageSource)}
if(!(Test-Path -LiteralPath $PromptZip -PathType Leaf)){throw ('Thieu ZIP 170 prompt: '+$PromptZip)}
$origin=((RunGit @('remote','get-url','origin')) | Out-String).Trim()
if($origin -notmatch 'jeongjunlee10x/tienghanmrlee\.github\.io(\.git)?$'){
 throw ('Khong dung repository MR LEE: '+$origin)
}
$dirty=@(RunGit @('status','--porcelain') | Where-Object { "$_".Trim() })
if($dirty.Count -gt 0){
 $dirty | Select-Object -First 15 | ForEach-Object { Write-Host $_ }
 throw 'Repo co thay doi chua luu. Script khong reset, stash hoac xoa.'
}
RunGit @('fetch','--no-tags','origin','main') | Out-Null
$branch='mrlee-v3-real-assets-'+(Get-Date -Format 'yyyyMMdd-HHmmss')
RunGit @('switch','-c',$branch,'origin/main') | Out-Host
$rootV3=Join-Path $Root 'assets\mrlee-ai\v3'
$manifest=Join-Path $rootV3 '14_manifest_va_QA\manifest.json'
if(!(Test-Path -LiteralPath $manifest)){throw 'Thieu manifest V3. Kiem tra git origin/main.'}
$unpack=Join-Path $env:TEMP ('MRLEE_V3_PROMPTS_'+(Get-Date -Format 'yyyyMMddHHmmss'))
New-Item -ItemType Directory -Force -Path $unpack | Out-Null
try{
 Expand-Archive -LiteralPath $PromptZip -DestinationPath $unpack -Force
 $promptRoot=Join-Path $unpack 'assets\mrlee-ai\v3'
 $files=@(Get-ChildItem -LiteralPath $promptRoot -Recurse -File -Filter '*.prompt.txt')
 if($files.Count -ne 170){throw ('ZIP can 170 prompt goc. Hien co '+$files.Count)}
 foreach($file in $files){
  $rel=$file.FullName.Substring($promptRoot.Length).TrimStart('\')
  $dest=Join-Path $rootV3 $rel
  New-Item -ItemType Directory -Force -Path (Split-Path $dest -Parent) | Out-Null
  Copy-Item -LiteralPath $file.FullName -Destination $dest -Force
 }
}finally{
 if(Test-Path -LiteralPath $unpack){Remove-Item -LiteralPath $unpack -Recurse -Force}
}
& py -3.12 -c 'from PIL import Image; print("Pillow ready")'
if($LASTEXITCODE -ne 0){
 & py -3.12 -m pip install --user Pillow
 if($LASTEXITCODE -ne 0){throw 'Cai Pillow that bai'}
}
$importer=Join-Path $Root 'tools\mrlee-v3-assets.py'
& py -3.12 $importer --root $Root --source $ImageSource --strict
if($LASTEXITCODE -ne 0){
 throw 'Anh V3 chua du hoac chua qua QA. KHONG git push. Xem bao cao qa-result.json.'
}
RunGit @('add','--','assets/mrlee-ai/v3') | Out-Host
$staged=@(RunGit @('diff','--cached','--name-only') | Where-Object { "$_".Trim() })
if($staged.Count -lt 170){throw ('So tep staged qua it: '+$staged.Count)}
foreach($name in $staged){
 if($name -notmatch '^assets/mrlee-ai/v3/' -or $name -match '\.(?:mp3|env|pem|p12|pfx)$'){
  throw ('Tep staged khong hop le: '+$name)
 }
}
RunGit @('commit','-m','MR LEE V3: Add 170 original new approved AI images and prompt files') | Out-Host
RunGit @('push','-u','origin',$branch) | Out-Host
Write-Host ('DA PUSH ANH VA PROMPT LEN NHANH GITHUB: '+$branch) -ForegroundColor Green
Write-Host 'Chua hop nhat vao main: phai duyet anh/giao dien, chay CI va browser QA truoc.'
