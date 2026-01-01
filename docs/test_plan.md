# 🧪 Comprehensive Test Plan: CURL Studio

## 1. Feature Verification Matrix

| Feature Category | Test Case ID | Test Scenario | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Execution Engine** | TC-EX-01 | Execute request with `curl` binary present | Response returned with `engine: "curl-binary"` | 🟢 Passed |
| | TC-EX-02 | Execute request with `curl` binary missing | Response returned via `native-fetch` fallback | 🟢 Passed |
| | TC-EX-03 | Large payload (>1MB) execution | Response handles size and pretty-printing correctly | 🟢 Passed |
| **Collections** | TC-COL-01 | Create new collection | Collection appears in sidebar, persisted in SQLite | 🟢 Passed |
| | TC-COL-02 | Save current request to collection | Request appears under collection with correct metadata | 🟢 Passed |
| | TC-COL-03 | Load request from collection | UI fields (Method, URL, Headers, Body) update correctly | 🟢 Passed |
| **History** | TC-HIS-01 | Auto-save after execution | Item appears at top of history sidebar | 🟢 Passed |
| | TC-HIS-02 | Load request from history | UI state restores from history item | 🟢 Passed |
| **AI Assistant** | TC-AI-01 | Ollama Server Heartbeat | Sidebar shows "Offline" if IP is unreachable; "Ready" if active | 🟢 Passed |
| | TC-AI-02 | Dynamic Model Selection | Models list fetches from Ollama `/api/tags` | 🟢 Passed |
| | TC-AI-03 | Prompt Generation | AI generates valid JSON; UI resolves it into fields | 🟢 Passed |
| | TC-AI-04 | Model Missing Fail-safe | Alert triggers if selected model is no longer on server | 🟢 Passed |
| **Environments** | TC-ENV-01 | Variable Resolution | `{{key}}` in URL/Headers resolves during execution | 🟢 Passed |
| | TC-ENV-02 | Multi-variable Resolution | Multiple variables in one string resolve correctly | 🟢 Passed |
| **Fail-Safes** | TC-FS-01 | System Binary Check | UI detects missing `curl` and updates status to "PROG-MODE" | 🟢 Passed |
| | TC-FS-02 | Execution Timeout | Requests kill after 30s; UI shows timeout error | 🟢 Passed |
| | TC-FS-03 | AI Timeout | AI requests kill after 90s; UI shows timeout error | 🟢 Passed |
| **UI/UX** | TC-UI-01 | Theme Persistence | Dark/Light mode state persists across reloads | 🟢 Passed |
| | TC-UI-02 | i18n Switching | Instant language toggle (zh-TW <-> EN) | 🟢 Passed |

## 2. Integration & Stress Tests

### 2.1 Backend Connectivity
- [x] **Prisma/SQLite**: Verify `src/lib/prisma.ts` uses `better-sqlite3` adapter for Prisma 7 compatibility.
- [x] **API Proxy**: Verify `/api/ai/generate` correctly forwards to remote Ollama nodes and bypasses CORS.

### 2.2 Shell & OS Compatibility
- [x] **Windows Paths**: Verify SQLite `file:./dev.db` pathing works on Win32.
- [x] **Command Injection**: Verify that malicious URL/Body inputs (e.g., `; rm -rf`) are properly escaped in the `curl` executor.

### 2.3 Deployment
- [x] **Docker Build**: Verify `Dockerfile` compiles Next.js standalone and includes `apk add curl`.

## 3. Maintenance Protocols

### 3.1 Health Check Interval
- System health (curl check) and AI connection (Ollama check) are performed every **10 seconds**.

### 3.2 Error Logging
- All backend execution errors are logged to the console and returned as standardized JSON `{ error: string }`.