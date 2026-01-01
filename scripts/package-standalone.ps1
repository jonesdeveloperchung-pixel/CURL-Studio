# package-standalone.ps1
Write-Host "🏗️ Building Next.js Standalone..." -ForegroundColor Cyan
$env:NEXT_PRIVATE_STANDALONE='true'
npm run build

Write-Host "🗄️ Initializing Clean Database..." -ForegroundColor Cyan
# Ensure a clean dev.db exists with the current schema
if (Test-Path "dev.db") { Remove-Item "dev.db" }
npx prisma db push --accept-data-loss

Write-Host "📂 Organizing files..." -ForegroundColor Cyan
$distDir = "dist-standalone"
if (Test-Path $distDir) { Remove-Item -Recurse -Force $distDir }
New-Item -ItemType Directory -Path $distDir

# Copy standalone output
Copy-Item -Recurse ".next/standalone/*" $distDir
# Copy static and public assets
if (Test-Path ".next/static") {
    New-Item -ItemType Directory -Path "$distDir/.next/static" -Force
    Copy-Item -Recurse ".next/static/*" "$distDir/.next/static"
}
if (Test-Path "public") {
    Copy-Item -Recurse "public" $distDir
}
# Copy Prisma and DB
Copy-Item -Recurse "prisma" $distDir
if (Test-Path "dev.db") {
    Copy-Item "dev.db" $distDir
}
if (Test-Path ".env") {
    Copy-Item ".env" $distDir
} else {
    "DATABASE_URL=\"file:./dev.db\"" | Out-File -FilePath "$distDir/.env" -Encoding UTF8
}

# Create a simple launcher
"@echo off`nnode server.js" | Out-File -FilePath "$distDir/start-studio.bat" -Encoding ASCII

Write-Host "✅ Done! Share the '$distDir' folder." -ForegroundColor Green
Write-Host "Users just need Node.js installed and run 'start-studio.bat'."
