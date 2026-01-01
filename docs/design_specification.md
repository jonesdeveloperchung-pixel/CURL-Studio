# 🎨 Design Specification: CURL Studio Architecture

## 1. System Architecture
CURL Studio is a full-stack Next.js application that prioritizes system-level consistency while maintaining high availability through programmatic fallbacks.

- **Frontend (React)**: State management via Hooks, persistence via SQLite/Prisma, and real-time command generation.
- **Backend (API Routes)**: Orchestrates shell execution, AI proxying, and database operations.

---

## 2. Core Modules

### 2.1 Dual-Engine Executor
The execution logic resides in `/api/execute` and follows a tiered approach:
1. **Tier 1 (Binary)**: Attempts to spawn a `curl` child process. Captures headers and body using the `-i` flag.
2. **Tier 2 (Programmatic)**: If `curl` is missing, falls back to the native Node.js `fetch` API.
- **Sanitization**: All URL and Body parameters are shell-escaped to prevent command injection.

### 2.2 AI Assistant Architecture
- **Model Fetcher**: Polls the Ollama `/api/tags` endpoint via a backend proxy to bypass CORS.
- **Request Generator**: Forwards natural language prompts to the selected model. 
- **JSON Extractor**: Uses regex patterns to safely extract the structured JSON response from AI-generated text.

### 2.3 Persistence (Prisma 7 + SQLite)
- **Adapter**: Uses `@prisma/adapter-better-sqlite3` for local performance.
- **Schema**: Supports tiered relationships (Collections -> Requests) and flat logs (History).

---

## 3. Reliability & Fail-Safe Design

### 3.1 Health Monitoring
A background heartbeat in the frontend polls `/api/system/status` and `/api/ai/models`.
- **System Check**: Verifies `curl` availability.
- **AI Check**: Verifies Ollama node accessibility.

### 3.2 UI Adaptation
- The UI dynamically toggles between `curl-binary` and `native-fetch` (PROG-MODE).
- Sidebars and buttons are automatically disabled if their underlying dependencies are unavailable.

---

## 4. Security Design
- **Command Sanitization**: Strict escaping of single quotes and shell special characters.
- **API Proxying**: All sensitive outbound calls (like Ollama) are proxied through the server to hide internal network IPs and handle timeouts centrally.

---

## 5. UI/UX Principles
- **Glassmorphism**: Modern, semi-transparent overlays with consistent blurs.
- **Feedback Loops**: Instant visual feedback for variable detection, command copying, and response status.
- **Shortcuts**: First-class support for keyboard-driven workflows.
