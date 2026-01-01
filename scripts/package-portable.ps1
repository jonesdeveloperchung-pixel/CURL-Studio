# package-portable.ps1
$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location $projectRoot

# This method bundles a portable Node.js binary with the standalone build
Write-Host "🚀 Creating Portable One-Click Bundle..." -ForegroundColor Cyan

# 1. Build standalone first
& "$PSScriptRoot/package-standalone.ps1"

$portableDir = "dist-portable"
if (Test-Path $portableDir) { Remove-Item -Recurse -Force $portableDir }
# We use New-Item to ensure the directory exists before we start copying/downloading into it
New-Item -ItemType Directory -Path $portableDir -Force
Copy-Item -Recurse "dist-standalone/*" $portableDir

# 2. Download portable Node.js (Windows x64)
Write-Host "📥 Downloading Portable Node.js..." -ForegroundColor Cyan
$nodeUrl = "https://nodejs.org/dist/v20.11.1/win-x64/node.exe"
Invoke-WebRequest -Uri $nodeUrl -OutFile "$portableDir/node.exe"

# 3. Create One-Click Launcher
$launcher = @"
@echo off
SET PATH=%~dp0;%PATH%
echo Starting CURL Studio Portable...
node.exe server.js
"@
$launcher | Out-File -FilePath "$portableDir/CURL-Studio-Portable.bat" -Encoding ASCII

Pop-Location
Write-Host "✅ Done! Share the '$portableDir' folder." -ForegroundColor Green
Write-Host "Users can just double-click 'CURL-Studio-Portable.bat' - NO INSTALL REQUIRED!"
