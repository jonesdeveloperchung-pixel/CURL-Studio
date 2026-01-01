# 📖 CURL 工作室 使用手冊

歡迎使用 CURL 工作室！本手冊將引導您掌握這款強大的 API 測試工具。

## 1. 介面概覽
![Main Interface](screenshots/History.png)

- **左側側邊欄**: 切換集合、歷史紀錄、環境變數、AI 助手與設定。
- **頂部工具列**: 選擇 HTTP 方法 (GET/POST...)、輸入網址與發送請求。
- **中間編輯區**: 設定請求參數 (Params)、標頭 (Headers) 與主體 (Body)。
- **底部預覽區**: 查看即時生成的 `curl` 指令碼。
- **右側/底部回應區**: 查看回應狀態碼、耗時、大小及 JSON/HTML 內容。

## 2. 基礎操作
### 發送您的第一個請求
1. 選擇 `GET` 方法。
2. 在網址欄輸入 `https://jsonplaceholder.typicode.com/posts/1`。
3. 點擊 **發送 (Send)** 或按下 `Ctrl + Enter`。

### 儲存至集合
1. 點擊網址欄右側的 **+** 按鈕。
2. 輸入請求名稱並選擇目標集合。
3. 點擊 **儲存 (Save)**。

## 3. 環境變數使用
您可以使用全域變數來簡化網址與標頭。

![Environments](screenshots/Environments.png)

1. 前往 **環境變數 (Environments)** 分頁。
2. 新增一個變數，例如 `baseUrl` 值為 `https://api.example.com`。
3. 在網址欄中使用 `{{baseUrl}}/users`。系統將在發送時自動替換。

## 4. AI 助手 (AI Assistant)
讓 AI 幫您撰寫請求：

![AI Assistant](screenshots/AI_Assistant.png)

1. 前往 **AI 助手** 分頁。
2. 輸入您的需求，例如：「建立一個發送 JSON 數據到 /login 的 POST 請求，包含 email 和 password」。
3. 點擊 **生成 (Generate)**。
4. 系統將自動填寫方法、網址、標頭與 Body。

## 5. 設定 (Settings)
![Settings](screenshots/Settings.png)

- **語言切換**: 支援繁體中文 (zh-TW) 與英文 (en)。
- **Ollama 設定**: 
  - 輸入您的 Ollama 伺服器 IP。
  - 系統會自動抓取該伺服器上可用的模型（如 `llama3`, `qwen2.5-coder`）。
  - 選定模型後即可開始使用 AI 功能。

## 6. 系統狀態與診斷
側邊欄底部顯示當前系統健康度：
- **引擎就緒 (Engine Ready)**: 使用系統 `curl` 二進位檔。
- **程式化模式 (PROG-MODE)**: 系統無 `curl`，使用原生 fetch 執行。
- **AI 伺服器狀態**: 顯示 AI 節點是否連線。

---

## 💡 小技巧
- **快速搜尋**: 在歷史或集合分頁頂部的搜尋框中輸入關鍵字，可快速過濾目標。
- **回應下載**: 回應區右上角設有下載按鈕，可將結果儲存為 `.json` 檔案。
- **預覽切換**: 在指令預覽區可切換 cURL 或 PowerShell 語法，方便將指令複製到終端機使用。
