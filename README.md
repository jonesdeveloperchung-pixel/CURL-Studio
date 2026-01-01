# 🚀 CURL 工作室 (CURL Studio)

![Main Interface](screenshots/History.png)

CURL 工作室是一個為開發者與 QA 工程師打造的專業 Web 版 API 客戶端。它將 `curl` 的強大功能與 Postman 般的直觀介面完美結合，並內建 AI 助手與多重容錯機制。

## 核心特性 (Key Features)

- **AI 驅動**: 自然語言生成 API 請求，智慧建議 Header 與測試斷言。
- **全方位協議**: 支援 HTTP/HTTPS, WebSocket 以及 gRPC 測試。
- **自動化開發**: 內建 JavaScript 腳本引擎，支援 Pre-request 與 Post-response 斷言。
- **效能監控**: 毫秒級效能剖析，細分 DNS, TCP, TLS 與傳輸耗時。
- **生態兼容**: 支援 Postman 集合匯入與匯出。
- **隱私安全**: 所有資料存儲於本地 SQLite，不經過第三方伺服器（AI 請求除外）。
- **跨平台**: 提供 Windows, macOS 與 Linux 的獨立執行檔。

## 📸 介面截圖 (Screenshots)

| 歷史記錄與執行 (History & Execute) | AI 助手 (AI Assistant) |
| :---: | :---: |
| ![History](screenshots/History.png) | ![AI Assistant](screenshots/AI_Assistant.png) |
| **環境變數管理 (Environments)** | **系統設定 (Settings)** |
| ![Environments](screenshots/Environments.png) | ![Settings](screenshots/Settings.png) |

## 🛡️ 容錯機制 (Fail-Safe)

- **自動偵測**: 系統每 10 秒檢查一次核心引擎與 AI 伺服器狀態。
- **無縫降級**: 當 `curl` 遺失時，介面會顯示 `PROG-MODE` 並繼續運作。
- **AI 離線處理**: 若 Ollama 伺服器斷線，AI 功能將自動鎖定並顯示離線狀態。

## 🛠️ 技術棧

- **前端**: Next.js 16 (App Router), Tailwind CSS, Lucide React.
- **後端**: Node.js, Prisma 7, SQLite (`better-sqlite3`).
- **AI**: Ollama API (支援遠端節點)。
- **部署**: Docker (支援多階段構建)。

## 🚀 快速開始

### 環境要求
- Node.js 20+
- (選配) Ollama 伺服器（用於 AI 功能）
- (選配) 系統安裝 `curl` (若無則自動降級)

### 安裝步驟
1. 複製專案:
   ```bash
   git clone <repository-url>
   cd CURL-Studio
   ```
2. 安裝依賴:
   ```bash
   npm install
   ```
3. 設定資料庫:
   ```bash
   npx prisma generate
   ```
4. 啟動開發伺服器:
   ```bash
   npm run dev
   ```

## 🐳 Docker 部署

```bash
docker build -t curl-studio .
docker run -p 3000:3000 curl-studio
```

## 📦 版本發佈 (Releases)
您可以從 GitHub Releases 頁面下載預先構建好的版本：
- **Portable 版**: 內建 Node.js 環境，解壓縮後執行 `CURL-Studio-Portable.bat` 即可，無需安裝。
- **Standalone 版**: 需自行安裝 Node.js，執行 `start-studio.bat`。

## 📄 授權條款
本專案採用 Apache-2.0 授權。