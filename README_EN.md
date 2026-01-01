# 🚀 CURL Studio

![Main Interface](screenshots/History.png)

CURL Studio is a professional web-based API client built for developers and QA engineers. it combines the power of `curl` with an intuitive Postman-like interface, featuring a built-in AI assistant and multiple fail-safe mechanisms.

## ✨ Core Features

- **Visual Request Builder**: Supports all major HTTP methods including GET, POST, PUT, DELETE, etc.
- **Dual Execution Engine**:
  - **Binary Mode**: Prioritizes the system's native `curl` command for consistency with the CLI.
  - **Programmatic Mode**: Automatically falls back to a native `fetch` engine if `curl` is missing.
- **AI Assistant (Ollama Driven)**: Generate complete requests, headers, and bodies from natural language descriptions.
- **Smart Collections & History**:
  - **Collections**: Organize and save your most-used requests.
  - **History**: Automatically logs every execution detail and response.
  - **SQLite Storage**: Powered by Prisma 7 for robust and persistent local data management.
- **Environment & Variable Management**: Support for `{{variable}}` syntax with easy switching between profiles (Dev, Staging, Prod).
- **Live Preview**: Real-time generation of standard cURL and PowerShell (`Invoke-WebRequest`) snippets.
- **Advanced UX**: `Ctrl + Enter` to send, global search, and response downloading.

## 📸 Screenshots

| History & Execution | AI Assistant |
| :---: | :---: |
| ![History](screenshots/History.png) | ![AI Assistant](screenshots/AI_Assistant.png) |
| **Environments Management** | **System Settings** |
| ![Environments](screenshots/Environments.png) | ![Settings](screenshots/Settings.png) |

## 🛡️ Fail-Safe Mechanisms

- **Auto-Detection**: The system heartbeats every 10 seconds to check core engine and AI server status.
- **Seamless Downgrade**: If `curl` is missing, the UI enters `PROG-MODE` and continues to function via fetch.
- **AI Offline Handling**: If the Ollama server disconnects, AI features are locked and marked as "Offline".

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), Tailwind CSS, Lucide React.
- **Backend**: Node.js, Prisma 7, SQLite (`better-sqlite3`).
- **AI**: Ollama API (Remote node support).
- **Deployment**: Docker (Multi-stage build).

## 🚀 Quick Start

### Requirements
- Node.js 20+
- (Optional) Ollama Server for AI features.
- (Optional) System `curl` (will fallback if not present).

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd CURL-Studio
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup database:
   ```bash
   npx prisma generate
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

## 🐳 Docker Deployment

```bash
docker build -t curl-studio .
docker run -p 3000:3000 curl-studio
```

## 📦 Releases
You can download pre-built binaries from the GitHub Releases page:
- **Portable Version**: Bundled with Node.js. Extract and run `CURL-Studio-Portable.bat`. No installation required.
- **Standalone Version**: Requires Node.js installed on your system. Run `start-studio.bat`.

## 📄 License
This project is licensed under the Apache-2.0 License.
