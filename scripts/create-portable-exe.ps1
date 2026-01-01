# CURL Studio 7-Zip SFX 封裝腳本
$ErrorActionPreference = "Stop"

$sourceDir = "dist_standalone/CURL-Studio-win-x64"
$outputDir = "dist_final"
$configPath = "$outputDir/config.txt"
$sfxPath = "C:\Program Files\7-Zip\7z.sfx" # 預設 7z SFX 模組路徑
$sevenZip = "C:\Program Files\7-Zip\7z.exe"
$finalExe = "$outputDir/CURL-Studio-Portable.exe"

if (-not (Test-Path $outputDir)) { New-Item -ItemType Directory -Path $outputDir }

Write-Host "--- 準備環境 ---" -ForegroundColor Cyan

# 1. 將 node.exe 複製進去，確保真正的隨身化
$nodePath = (Get-Command node).Source
Write-Host "複製 Node 執行檔: $nodePath"
Copy-Item $nodePath "$sourceDir/node.exe" -Force

# 2. 建立 7-Zip SFX 配置文件
# ExecuteFile 設定為啟動批次檔，且在解壓後自動執行
$configContent = @'
;!@Install@!UTF-8!
Title="CURL Studio Portable"
ExecuteFile="start.bat"
;!@InstallEnd@!
'@
$configContent | Out-File -FilePath $configPath -Encoding utf8

# 3. 檢查 7-Zip 是否存在
if (-not (Test-Path $sevenZip)) {
    Write-Error "找不到 7-Zip (7z.exe)，請確認安裝路徑是否為 $sevenZip"
}

# 4. 建立 7z 壓縮包 (暫存)
Write-Host "正在進行高強度壓縮..." -ForegroundColor Yellow
$temp7z = "$outputDir/temp.7z"
if (Test-Path $temp7z) { Remove-Item $temp7z }
& $sevenZip a $temp7z "$sourceDir/*" -mx9

# 5. 合成 SFX EXE (Binary Join)
# 結構：7z.sfx + config.txt + temp.7z = final.exe
Write-Host "正在合成最終 EXE..." -ForegroundColor Cyan
Get-Content -Path $sfxPath -Encoding Byte -Raw > $finalExe
Get-Content -Path $configPath -Encoding Byte -Raw >> $finalExe
Get-Content -Path $temp7z -Encoding Byte -Raw >> $finalExe

# 6. 清理暫存檔
Remove-Item $temp7z
Remove-Item $configPath

Write-Host "--- 打包完成！ ---" -ForegroundColor Green
Write-Host "檔案位置: $finalExe"