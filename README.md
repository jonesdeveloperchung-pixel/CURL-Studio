# 🚀 CURL 工作室 (CURL Studio)

![Main Interface](screenshots/History.png)

CURL 工作室是一個為開發者與 QA 工程師打造的專業 Web 版 API 客戶端。它將 `curl` 的強大功能與 Postman 般的直觀介面完美結合，並內建 AI 助手與多重容錯機制。

## ✨ 核心特性

- **視覺化請求建構器**: 支援 GET, POST, PUT, DELETE 等所有主流 HTTP 方法。
- **雙重執行引擎**:
  - **二進位模式**: 優先使用系統內建的 `curl` 指令執行，確保與命令列行為一致。
  - **程式化模式**: 若系統缺乏 `curl`，自動切換至原生 `fetch` 引擎。
- **AI 助手 (Ollama 驅動)**: 透過自然語言描述 API 需求，自動生成完整的請求參數、標頭與主體。
- **智慧集合與歷史**:
  - **集合 (Collections)**: 將常用請求分類儲存。
  - **歷史 (History)**: 自動記錄每次發送的細節與回應。
  - **SQLite 儲存**: 使用 Prisma 7 進行高效且持久的本地數據管理。
- **變數與環境管理**: 支援 `{{variable}}` 語法，可在不同環境（如開發、測試、正式）間輕鬆切換。
- **即時預覽**: 實時生成標準 cURL 與 PowerShell (`Invoke-WebRequest`) 指令碼。
- **進階 UX**: 支援 `Ctrl + Enter` 快捷發送、全域搜尋以及回應下載。

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