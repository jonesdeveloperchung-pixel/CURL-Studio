# 📑 Requirement Specification: CURL Studio

## 1. Functional Requirements

### 1.1 Request Builder (Completed)
- **HTTP Methods**: Support for GET, POST, PUT, DELETE, PATCH.
- **Variable Injection**: Support for `{{var}}` syntax in URL, Headers, and Body.
- **Command Preview**: Real-time cURL and PowerShell syntax generation.

### 1.2 Execution Engine (Completed)
- **Binary Support**: Native `curl` execution with status/header parsing.
- **Programmatic Fallback**: Native `fetch` fallback if binary is missing.
- **Response Utilities**: Pretty-printing, Copy Response, and Download JSON.

### 1.3 AI Intelligence (Completed)
- **Natural Language Input**: Generate requests from descriptive prompts.
- **Multi-Node Support**: Connect to remote Ollama servers.
- **Model Selection**: Dynamic fetching of available local LLMs.

### 1.4 Persistence & Management (Completed)
- **History**: Automated logging of all requests to SQLite.
- **Collections**: Folder-based storage for request templates.
- **Environments**: Profile-based variable management.

---

## 2. Non-Functional Requirements (Completed)

- **Reliability**: Fail-safe mechanisms for binary and server outages.
- **Performance**: Backend proxying for AI with 90s timeouts for heavy models.
- **Portability**: Dockerized environment with `curl` pre-installed.
- **Usability**: Keyboard shortcuts, global search, and multi-language support.

---

## 3. Traceability Matrix (Updated)

| Requirement | Implementation Detail | Status |
| :--- | :--- | :--- |
| FR-Builder | interactive UI + variable resolver | ✅ |
| FR-Executor | curl-binary + fetch fallback | ✅ |
| FR-AI | Ollama Proxy + Model Selector | ✅ |
| FR-Storage | Prisma 7 + SQLite | ✅ |
| FR-Safety | Heartbeat Monitoring + IO Sanitization | ✅ |

---

## 4. Acceptance Criteria
- [x] Users can send requests without having `curl` installed (Fallback).
- [x] AI can generate a usable request from a prompt like "fetch user 1".
- [x] Variables resolve correctly during execution.
- [x] History persists across sessions in a database.
