# CURL Studio Standalone Packaging Script
$ErrorActionPreference = "Stop"

$PLATFORMS = @("win-x64", "linux-x64", "macos-x64", "macos-arm64")
$BUILD_DIR = "dist_standalone"

# 1. Clean and Build
Write-Host "--- Building Next.js Standalone ---" -ForegroundColor Cyan
if (Test-Path $BUILD_DIR) { Remove-Item -Recurse -Force $BUILD_DIR }
New-Item -ItemType Directory -Path $BUILD_DIR

npm run build

# 2. Prepare Base Standalone Files
$STANDALONE_PATH = ".next/standalone"
$STATIC_PATH = ".next/static"
$PUBLIC_PATH = "public"

if (-not (Test-Path $STANDALONE_PATH)) {
    Write-Error "Standalone build failed. Ensure 'output: standalone' is in next.config.ts"
}

# 3. Create platform specific packages
foreach ($PLATFORM in $PLATFORMS) {
    Write-Host "--- Packaging for $PLATFORM ---" -ForegroundColor Cyan
    $DEST = "$BUILD_DIR/CURL-Studio-$PLATFORM"
    New-Item -ItemType Directory -Path $DEST
    
    # Copy standalone server
    Copy-Item -Recurse "$STANDALONE_PATH/*" $DEST
    
    # Copy static and public files (Next.js standalone needs these manually moved)
    New-Item -ItemType Directory -Path "$DEST/.next/static" -Force
    Copy-Item -Recurse "$STATIC_PATH/*" "$DEST/.next/static"
    Copy-Item -Recurse "$PUBLIC_PATH/*" "$DEST/public"
    
    # Copy Prisma query engine if exists for the platform
    # Note: In a real CI, you'd download the specific node binary here
    
    # Create an entry point script
    if ($PLATFORM -match "win") {
        "@echo off`nnode server.js" | Out-File -FilePath "$DEST/start.bat" -Encoding ascii
    } else {
        "#!/bin/bash`nnode server.js" | Out-File -FilePath "$DEST/start.sh" -Encoding ascii
        # Note: chmod +x would be needed on linux/mac
    }
}

Write-Host "--- Packaging Complete! Files are in $BUILD_DIR ---" -ForegroundColor Green
