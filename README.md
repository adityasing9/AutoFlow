# AutoFlow: AI-Powered Workflow Discovery & Privacy-Preserving Automation

[![Deploy on Vercel](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://autoflow-three-pearl.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/adityasing9/AutoFlow)

> **Live Dashboard Demo**: [https://autoflow-three-pearl.vercel.app](https://autoflow-three-pearl.vercel.app)  
> *"Instead of requiring users to manually create automation workflows, AutoFlow discovers repetitive workflows from permitted user activity and proposes useful automations."*

---

## 🌟 Core Philosophy

$$\textbf{The AI Proposes} \implies \textbf{The Permission Engine Decides} \implies \textbf{The Executor Acts} \implies \textbf{The Verifier Confirms}$$

The LLM **never** directly executes arbitrary computer or terminal operations. All actions are validated against an isolated sandbox workspace, passed through a centralized risk engine, executed via controlled deterministic tools, and physically verified on disk.

---

## 🚀 Key Features

- **Passive Privacy-Preserving Event Collection:** Observes permitted local user actions (e.g., in `AutoFlowWorkspace/`). Normalizes raw paths to abstract representations (`<WORKSPACE>/Inbox/file.pdf`) and computes non-reversible SHA-256 hashes to correlate workflows without storing sensitive personal paths.
- **Pattern Discovery Engine (DSA Component):** Employs sliding-window contiguous sequence mining and weighted directed graph analysis (`NetworkX`) to detect repetitive multi-step digital workflows.
- **Pattern Detection Cache (Optimization):** In-memory MD5-keyed LRU/TTL cache eliminating redundant sequence mining and AI re-evaluations.
- **Local-First AI Intent Understanding:** Pluggable `LocalLLMProvider` interface compatible with **Ollama** and local offline heuristic models. **Zero cloud transmission** (no OpenAI, Gemini, or remote API keys needed).
- **Workflow Simulation:** Previews dry-run changes (files renamed, moved, folders created, 0 deletions, 0 network requests) before requesting user approval.
- **Permission & Risk Governance:** Action risk classifications (`LOW`, `MEDIUM`, `HIGH`, `VERY_HIGH`). Shell commands and internet access are blocked by default.
- **Controlled Tool Execution & Bounded Recovery:** Strictly sandboxed tools (`FileReader`, `FolderCreator`, `FileRenamer`, `FileMover`, `FileCopier`). Automatically retries recoverable actions up to 2 times.
- **Independent Verification Engine:** Physical post-condition checks on disk (e.g., verifying destination file exists and source has been removed).
- **Relational + Vector Memory:** MySQL 8.x structured source of truth (with seamless local SQLite fallback) and ChromaDB vector store for workflow retrieval.
- **Modern Web Dashboard:** React + Vite + Tailwind CSS dashboard with live monitoring indicator, pattern inspection, simulation modal, and privacy audit metrics.

---

## 📂 System Architecture

```text
User Activity (Filesystem)
       │
       ▼
Event Normalizer & Privacy Filter (<WORKSPACE>/Inbox/doc.pdf)
       │
       ▼
Pattern Discovery Engine (Sliding-window Subsequence Mining + Directed Graph)
       │
       ▼
Local AI Intent Engine (Ollama / Heuristic Local Provider)
       │
       ▼
Multi-Signal Confidence & Risk Engine (Formula evaluation)
       │
       ▼
Workflow Dry-Run Simulator (Zero-mutation filesystem preview)
       │
       ▼
User Approval Gate (Simulation Modal / Dashboard review)
       │
       ▼
Centralized Permission Engine (Sandbox & Path traversal check)
       │
       ▼
Controlled Execution Engine (FileReader, FolderCreator, FileRenamer, FileMover)
       │
       ▼
Independent Verification Engine (Asserts physical disk state)
       │
       ▼
Relational Database (MySQL / SQLite) & ChromaDB Vector Memory
```

---

## 🛠️ Quickstart Guide (Windows / Linux / macOS)

### Prerequisites
- Python 3.10+
- Node.js v18+ and npm
- *(Optional)* MySQL Server 8.x (if not provided, AutoFlow automatically falls back to local SQLite with zero configuration)
- *(Optional)* [Ollama](https://ollama.ai) with `llama3` installed (if not running, AutoFlow automatically uses its built-in offline local heuristic provider)

---

### 1. Install Backend Dependencies
```pwsh
cd c:\Users\AADI\Desktop\My\CODE\Github\AutoFlow
python -m pip install -r backend/requirements.txt
```

---

### 2. Configure Database & Environment
By default, AutoFlow works out-of-the-box using local SQLite (`autoflow.db`).  
To connect to MySQL 8.x, set the environment variables in a `.env` file or export them:
```env
DATABASE_URL=mysql+pymysql://root:yourpassword@localhost:3306/autoflow
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=yourpassword
MYSQL_DATABASE=autoflow
OFFLINE_MODE=True
LOCAL_LLM_PROVIDER=auto
```
*(A complete DDL schema script is also available at `backend/app/database/schema.sql`)*

---

### 3. Run Backend Server
```pwsh
python backend/run_backend.py
```
*Backend runs at `http://127.0.0.1:8000`. Interactive API Docs are available at `http://127.0.0.1:8000/docs`.*

---

### 4. Run Frontend Dashboard
Open a second terminal window:
```pwsh
cd c:\Users\AADI\Desktop\My\CODE\Github\AutoFlow\frontend
npm run dev
```
*Dashboard opens at `http://localhost:5173`.*

---

### 5. Run Automated Test Suite
AutoFlow includes comprehensive unit and integration tests covering pattern detection, permissions, sandbox path traversal prevention, execution, and verification:
```pwsh
python -m pytest backend -v
```

---

## 🎓 Primary Academic Demo Scenario: Study Material Organizer

AutoFlow is pre-configured with the primary evaluation scenario:
1. Open the Dashboard at `http://localhost:5173`.
2. Click the button: **"Run Academic Demo Scenario"**.
3. **What happens behind the scenes:**
   - Simulates 11 repeated cycles of:  
     $$\text{Download PDF to Inbox} \to \text{Open PDF} \to \text{Rename to Subject Format} \to \text{Move to College Subject Folder}$$
   - The **Pattern Detector** extracts the sequence:  
     `FILE_CREATED:PDF -> FILE_OPENED:PDF -> FILE_RENAMED:PDF -> FILE_MOVED:PDF` (11 occurrences).
   - The **AI Intent Engine** analyzes the pattern:
     - Likely Intent: *Organize downloaded documents*
     - Proposed Automation: *Study Material Organizer*
     - Confidence: **94% - 96%**
     - Risk Level: **LOW**
   - Click **"Simulate"**: AutoFlow runs a dry-run without altering files and presents a preview:  
     `Files detected: 3`, `Renames: 3`, `Moves: 3`, `Folders: 1`, `Deletions: 0`, `Network Requests: 0`.
   - Click **"Approve Workflow"**: The workflow is marked approved.
   - Click **"Execute Now"**: Controlled tools execute each step inside `AutoFlowWorkspace/`, verify the results on disk, and write audit logs to MySQL/SQLite.

---

## 🔬 Academic Evaluation Points (Viva Guide)

| Aspect | Academic Implementation Details |
| :--- | :--- |
| **DSA Component** | Sliding-window contiguous subsequence mining with $O(N)$ time complexity + Directed State Transition Graph ($G = (V, E)$ via NetworkX) for dominant path traversal. |
| **Optimization** | In-memory MD5-keyed Sequence Hash Cache with $O(1)$ lookup and TTL eviction. |
| **Privacy Guarantee** | Zero remote network calls (`OFFLINE_MODE = True`). Paths abstracted to `<WORKSPACE>/...`; one-way SHA-256 entity hashes prevent leaking private directory names. |
| **Security Sandbox** | Strict boundary checking in `SandboxValidator`. Any path containing traversal tokens like `../../` triggers a `SandboxViolationError`. |
| **Verification Engine** | Post-condition disk checks (`DESTINATION_EXISTS`, `SOURCE_REMOVED`) with bounded recovery (max 2 retries). |

---

## 📄 License
MIT License. Designed for privacy-preserving, local-first workflow discovery and automation.
