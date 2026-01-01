# clean-builds.ps1
$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location $projectRoot

Write-Host "🧹 Cleaning up build artifacts..." -ForegroundColor Cyan

$targets = @(
    "dist-standalone",
    "dist-portable",
    "curl-studio.tar",
    "CURL-Studio-Portable-Windows.zip",
    "CURL-Studio-Standalone.zip",
    "dev.db",
    "dev.db-journal"
)

foreach ($target in $targets) {
    if (Test-Path $target) {
        Write-Host "🗑️ Removing $target..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force $target -ErrorAction SilentlyContinue
    }
}

Pop-Location
Write-Host "✨ Cleanup complete! Your workspace is pristine." -ForegroundColor Green
