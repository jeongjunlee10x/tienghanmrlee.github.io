# MR LEE: safely upload real WebPs to your connected GitHub repository.
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File ".\tools\PUSH_ASSETS_MRLEE_V3.ps1"
# By design this creates a separate review branch; never overwrites student data.
[CmdletBinding()]
param(
 [string]$Root=(Join-Path $env:USERPROFILE 'Documents\tienghanmrlee.github.io'),
 [string]$Archive=(Join-Path $env:USERPROFILE 'Downloads\MRLEE_V3_ANH_THAT_DONG_BO_INDEX_20261025.zip')
)
$ErrorActionPreference='Stop'
# PowerShell command resolution is case-insensitive: a function named Git would
# shadow git.exe and calling "& git" inside it recursively overflows call depth.
$gitExecutable = (Get-Command -Name git.exe -CommandType Application -ErrorAction Stop).Source
function Invoke-MrLeeGit([string[]]$GArgs) {
 & $gitExecutable -C $Root @GArgs
 if($LASTEXITCODE -ne 0){throw ('Git failed: '+($GArgs -join ' '))}
}
if(!(Test-Path -LiteralPath $Archive -PathType Leaf)){throw ('Missing image package: '+$Archive)}
if(!(Test-Path -LiteralPath $Root -PathType Container)){throw ('Missing source repository: '+$Root)}
$remote=(& $gitExecutable -C $Root remote get-url origin).Trim()
if($LASTEXITCODE -ne 0 -or $remote -notmatch 'jeongjunlee10x/tienghanmrlee\.github\.io(\.git)?$'){throw ('Wrong GitHub remote: '+$remote)}
$changed=@(& $gitExecutable -C $Root status --porcelain)
if($LASTEXITCODE -ne 0){throw 'Cannot check Git status'}
if($changed.Count -and @($changed|Where-Object { "$_".Trim() }).Count){throw 'Source has pending changes. Commit or back them up first; no automatic reset.'}
$temporary=Join-Path $env:TEMP ('MRLEE_IMG_'+(Get-Date -Format 'yyyyMMdd_HHmmss'))
New-Item -ItemType Directory -Force -Path $temporary|Out-Null
try{
 Expand-Archive -LiteralPath $Archive -DestinationPath $temporary -Force
 $reportFile=Join-Path $temporary 'CURATION_REPORT.json'
 $sourceFile=Join-Path $temporary 'SOURCE_PROVENANCE.json'
 if(!(Test-Path -LiteralPath $reportFile) -or !(Test-Path -LiteralPath $sourceFile)){throw 'ZIP missing audit manifests'}
 $report=Get-Content -LiteralPath $reportFile -Raw -Encoding UTF8|ConvertFrom-Json
 $sources=Get-Content -LiteralPath $sourceFile -Raw -Encoding UTF8|ConvertFrom-Json
 if($report.available_curated -lt 57){throw 'Too few curated real WebP files'}
 $properties=@($sources.PSObject.Properties)
 if($properties.Count -ne $report.available_curated){throw 'Image list/count mismatch'}
 foreach($entry in $properties){
   $rel=$entry.Name
   if($rel -notmatch '^assets/mrlee-ai/v3/[a-z0-9_/-]+\.webp$'){throw ('Invalid archive image path '+$rel)}
   $sourcePath=Join-Path $temporary ($rel -replace '/','\')
   if(!(Test-Path -LiteralPath $sourcePath -PathType Leaf)){throw ('Missing actual image '+$rel)}
   $digest=(Get-FileHash -LiteralPath $sourcePath -Algorithm SHA256).Hash.ToLowerInvariant()
   if($digest -ne [string]$entry.Value.sha256){throw ('Image hash mismatch '+$rel)}
 }
 # Pull only if clean, and write to a fresh review branch: never force-push.
 Invoke-MrLeeGit @('fetch','--no-tags','origin','main')
 $branch='mrlee-v3-curated-real-images-'+(Get-Date -Format 'yyyyMMdd-HHmmss')
 Invoke-MrLeeGit @('switch','-c',$branch,'origin/main')
 foreach($entry in $properties){
   $rel=$entry.Name
   $src=Join-Path $temporary ($rel -replace '/','\')
   $dst=Join-Path $Root ($rel -replace '/','\')
   New-Item -ItemType Directory -Force -Path (Split-Path $dst -Parent)|Out-Null
   if(Test-Path -LiteralPath $dst){
     $sha=(Get-FileHash -LiteralPath $dst -Algorithm SHA256).Hash.ToLowerInvariant()
     if($sha -ne [string]$entry.Value.sha256){throw ('Conflict in existing file: '+$rel)}
   }else{
     Copy-Item -LiteralPath $src -Destination $dst
   }
 }
 Invoke-MrLeeGit @('add','--','assets/mrlee-ai/v3')
 $files=@(& $gitExecutable -C $Root diff --cached --name-only)
 if($LASTEXITCODE -ne 0){throw 'Cannot list staged files'}
 if(@($files|Where-Object { "$_".Trim() }).Count -lt 57){throw 'No full image batch was staged'}
 foreach($file in $files){if($file -notmatch '^assets/mrlee-ai/v3/.+\.webp$'){throw ('Unexpected staged file '+$file)}}
 Invoke-MrLeeGit @('commit','-m','MR LEE V3: Upload verified real WebP image batch from user archive')
 Invoke-MrLeeGit @('push','-u','origin',$branch)
 Write-Host ('SUCCESS — '+$report.available_curated+' images uploaded to '+$branch) -ForegroundColor Green
 Write-Host 'This is a partial, genuine image upload (57/170); do not advertise V3 complete.'
 Write-Host ('Open PR: https://github.com/jeongjunlee10x/tienghanmrlee.github.io/compare/main...'+$branch)
}finally{
 if(Test-Path -LiteralPath $temporary){Remove-Item -LiteralPath $temporary -Recurse -Force}
}
