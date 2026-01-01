# 📦 CURL 工作室 分發與部署指南 (Distribution Guide)

本指南介紹如何將專案打包並分享給其他電腦使用。

---

## 🟢 方法 1: Docker 映像檔 (最穩定)
**適用場景**: 需要完全一致的環境，且目標電腦已安裝 Docker。

### 1. 製作 (在您的電腦)
執行以下指令生成 `.tar` 檔案：
```powershell
./scripts/build-docker.ps1
```
### 2. 分享
將生成的 `curl-studio.tar` 發送給他人。

### 3. 執行 (在目標電腦)
```bash
docker load -i curl-studio.tar
docker run -p 3000:3000 curl-studio
```

---

## 🔵 方法 2: Standalone 獨立資料夾
**適用場景**: 目標電腦已有安裝 Node.js，不希望使用 Docker。

### 1. 製作 (在您的電腦)
執行以下指令生成 `dist-standalone` 資料夾：
```powershell
./scripts/package-standalone.ps1
```
### 2. 分享
將整個 `dist-standalone` 資料夾壓縮後發送。

### 3. 執行 (在目標電腦)
解壓縮後，雙擊執行 `start-studio.bat`。

---

## 🟡 方法 3: 免安裝行動版 (One-Click Portable)
**適用場景**: 目標電腦什麼都沒裝（沒 Node.js, 沒 Docker），真正的一鍵執行。

### 1. 製作 (在您的電腦)
執行以下指令生成 `dist-portable` 資料夾：
```powershell
./scripts/package-portable.ps1
```
此腳本會自動下載 `node.exe` 並放入資料夾中。

### 2. 分享
將整個 `dist-portable` 資料夾壓縮後發送。

### 3. 執行 (在目標電腦)
解壓縮後，雙擊執行 `CURL-Studio-Portable.bat`。

---

## 📋 比較表

| 特性 | Docker | Standalone | Portable (推薦) |
| :--- | :--- | :--- | :--- |
| **目標電腦需求** | Docker | Node.js | 無 (什麼都不用裝) |
| **檔案大小** | 較大 (約 300MB) | 小 (約 50MB) | 中 (約 120MB) |
| **環境隔離** | 極佳 (內含 curl) | 依賴宿主機 | 良好 |
| **啟動速度** | 中 | 快 | 快 |

---

## English Summary

- **Docker**: Run `./scripts/build-docker.ps1`, share `curl-studio.tar`. Best for environment isolation.
- **Standalone**: Run `./scripts/package-standalone.ps1`, share `dist-standalone` folder. Requires Node.js on target.
- **Portable**: Run `./scripts/package-portable.ps1`, share `dist-portable` folder. **Best for users with no dependencies installed.** Includes its own `node.exe`.
