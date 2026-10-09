param([ValidateSet('win-x64', 'win-arm64')][string]$Architecture = 'win-x64')
$ErrorActionPreference = 'Stop'
$destination = Join-Path $PSScriptRoot "..\output\$Architecture"
dotnet publish "$PSScriptRoot\TiengHanMrLee.csproj" -c Release -r $Architecture --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true -p:DebugType=None -p:DebugSymbols=false -o $destination
if ($LASTEXITCODE -ne 0) { throw 'Đóng gói thất bại. Xem lỗi phía trên.' }
Write-Host "Ứng dụng được tạo tại: $destination\TiengHanMrLee.exe"
