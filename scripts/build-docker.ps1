# build-docker.ps1
Write-Host "🐳 Building Docker Image..." -ForegroundColor Cyan
docker build -t curl-studio .

Write-Host "📦 Exporting Image to curl-studio.tar..." -ForegroundColor Cyan
docker save -o curl-studio.tar curl-studio

Write-Host "✅ Done! Share 'curl-studio.tar' with others." -ForegroundColor Green
Write-Host "To run on another machine: docker load -i curl-studio.tar; docker run -p 3000:3000 curl-studio"
