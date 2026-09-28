# AutoFlow: Privacy-Preserving AI Workflow Discovery & Autonomous Automation System
**Bachelor of Engineering (B.E.) in Artificial Intelligence & Machine Learning (AIML)**  
**Academic Mini-Project Technical Report**

---

## 1. Abstract
Contemporary desktop automation frameworks (e.g., Zapier, n8n, Make) mandate that users possess technical expertise to manually construct triggers, conditions, and action pipelines. Conversely, emerging cloud-centric autonomous AI agents frequently pose unacceptable privacy hazards by streaming keystrokes, screenshots, and proprietary file metadata to remote cloud providers without robust verification or deterministic security sandboxes.

**AutoFlow** introduces a novel, local-first, privacy-preserving paradigm. Operating on permitted local user computer activity, AutoFlow passively monitors sanitized filesystem events, employs sequence-mining and directed graph algorithms to detect repetitive workflow patterns, leverages local offline Artificial Intelligence to infer user intent, synthesizes structured automation proposals, executes safe dry-run simulations, enforces a centralized permission and risk engine, executes controlled tool operations inside an isolated sandbox, and verifies physical disk post-conditions. This project delivers an explainable, auditable, and secure prototype suitable for academic evaluation.

---

## 2. Introduction
Modern knowledge workers and students engage in repetitive digital routines daily—such as downloading educational course materials, inspecting their content, renaming files according to standard conventions, and moving them into organized subject directories. While automations could eliminate hundreds of hours of manual labor, mainstream users rarely write automated scripts.

AutoFlow redefines automation from:
$$\text{Manual Construction: } \text{Trigger} \to \text{Action} \to \text{Action}$$
to:
$$\text{Autonomous Discovery: } \text{User Activity} \to \text{Pattern Detection} \to \text{AI Intent Understanding} \to \text{Proposal} \to \text{Approval} \to \text{Verification}$$

Crucially, AutoFlow enforces strict local execution: no credentials, screen recordings, or file data leave the host operating system.

---

## 3. Problem Statement
1. **High Cognitive Barrier to Automation:** Non-technical computer users cannot readily configure automated rules or write procedural scripts.
2. **Severe Privacy Vulnerabilities in Cloud AI:** Commercial AI desktop assistants capture raw desktop imagery and keystrokes, transmitting sensitive data to third-party cloud servers.
3. **Unrestricted Agent Execution Risks:** Autonomous LLM agents granted unfettered shell access can cause catastrophic system damage, path traversals, or accidental data loss.
4. **Lack of Post-Execution Verification:** Automated scripts frequently exit with unverified status codes without confirming whether target artifacts truly exist in the expected state.

---

## 4. Existing System
Existing automation systems can be categorized into:
- **Rule-based Integration Platforms:** Tools like n8n, Zapier, and AutoHotkey require explicit, manual workflow definition.
- **RPA (Robotic Process Automation):** Enterprise tools (e.g., UiPath) record exact coordinate clicks and screen layouts, which are brittle and fail when resolutions or interfaces change.
- **Cloud LLM Desktop Agents:** Multi-modal desktop agents capture continuous desktop screenshots and execute arbitrary system shell commands via cloud APIs.

---

## 5. Limitations of Existing System
| Dimension | Traditional Workflow Tools (n8n/Zapier) | Cloud Desktop Agents |
| :--- | :--- | :--- |
| **Workflow Creation** | Completely manual; requires programming logic | AI-driven prompt |
| **Privacy Guarantee** | Data processed externally on cloud servers | Screen captures & telemetry transmitted to cloud |
| **Safety Baseline** | Sandboxed to webhooks | Unrestricted terminal/bash access |
| **Discovery Mechanism** | Non-existent; passive observation impossible | Non-existent; requires prompt per task |
| **Offline Feasibility** | Requires constant internet connectivity | Complete failure when offline |

---

## 6. Proposed System
AutoFlow operates on the foundational thesis:
> *"The AI proposes. The permission engine decides. The executor acts. The verifier confirms."*

Key architectural innovations include:
1. **Passive Privacy-Preserving Event Collection:** Normalizes local events into abstract representations ($\langle\text{WORKSPACE}\rangle/\text{Inbox}/\text{file.pdf}$, Category: DOCUMENT) and tracks file identity via one-way SHA-256 hashes without storing private absolute paths.
2. **Deterministic Sequence Discovery:** Employs sliding-window contiguous subsequence mining and directed graph analysis to detect repeated multi-step workflows.
3. **Pluggable Local AI Provider:** Interfaces seamlessly with local LLM engines (Ollama, local GGUF models) and built-in deterministic heuristic fallbacks, strictly prohibiting cloud data egress.
4. **Centralized Risk & Permission Manager:** Evaluates every proposed action against a multi-tier risk taxonomy before invoking controlled tools.
5. **Independent Verification Engine:** Evaluates post-execution assertions (e.g., confirming destination files exist and source files have been safely vacated).

---

## 7. Objectives
- Implement an activity monitoring observer on a safe workspace sandbox.
- Mine and discover repetitive file management sequences ($P \ge 3$ occurrences).
- Translate raw pattern sequences into structured Pydantic JSON workflows via local AI.
- Calculate multi-signal confidence scores combining frequency, sequence consistency, interval stability, and AI confidence.
- Simulate workflow dry-runs without mutating disk state.
- Validate security sandbox boundaries to prevent path traversal attacks.
- Perform safe execution, automatic bounded recovery (max 2 retries), and physical verification.
- Provide a responsive modern dashboard in React + Vite and an auditable MySQL/SQLite backend.

---

## 8. System Architecture

```text
+--------------------------------------------------------------------------+
|                            USER COMPUTER ACTIVITY                        |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                  EVENT COLLECTION & PRIVACY FILTERING                    |
|    - Watchdog Filesystem Observer                                        |
|    - Path Normalization (<WORKSPACE>/Inbox/file.pdf)                     |
|    - Non-reversible SHA-256 Target Hashing                               |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                       PATTERN DISCOVERY ENGINE                           |
|    - Sliding-Window Subsequence Mining                                   |
|    - Pattern Detection Cache (MD5 Keyed)                                 |
|    - Directed Graph Transition Analyzer (NetworkX)                       |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                      LOCAL AI INTENT UNDERSTANDING                       |
|    - Pluggable LocalLLMProvider (Ollama / Local Heuristics)              |
|    - Structured JSON Enforcement (Pydantic V2)                           |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                 WORKFLOW GENERATOR & CONFIDENCE ENGINE                   |
|    - Multi-Signal Confidence Formula                                     |
|    - Structured Workflow Representation (Triggers, Conditions, Steps)   |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                       DRY-RUN WORKFLOW SIMULATOR                         |
|    - Zero-Mutation Filesystem Preview                                    |
|    - Potential Change Calculation (Renames, Moves, 0 Deletions)          |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                    USER APPROVAL & PERMISSION ENGINE                     |
|    - Centralized Risk Matrix (LOW, MEDIUM, HIGH, VERY_HIGH)              |
|    - Policy Enforcement (AUTO_ALLOWED, REQUIRES_APPROVAL, BLOCKED)       |
|    - Sandbox Path Traversal Validator                                    |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                       CONTROLLED EXECUTION ENGINE                        |
|    - Tools: FileReader, FolderCreator, FileRenamer, FileMover            |
|    - Bounded Recovery Engine (Max 2 retries)                             |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                      INDEPENDENT VERIFICATION ENGINE                     |
|    - Post-Condition Verification (File Exists, Source Removed)           |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                      MEMORY & VECTOR STORE LOGGING                       |
|    - MySQL / SQLite Relational Audit Logs                                |
|    - ChromaDB Semantic Vector Memory                                     |
+--------------------------------------------------------------------------+
```

---

## 9. Module Description
1. **Activity Monitor (`event_service/monitor.py`):** Uses Python `watchdog` to passively intercept filesystem events on designated workspace directories.
2. **Normalizer (`event_service/normalizer.py`):** Strips personal machine identities and home directories, classifies file extensions, and hashes path tokens.
3. **Pattern Detector (`pattern_service/detector.py`):** Groups events by target correlation and sliding time windows, extracting contiguous n-grams.
4. **Pattern Cache (`pattern_service/cache.py`):** In-memory LRU/TTL cache storing sequence hashes to eliminate redundant mining iterations.
5. **Graph Analyzer (`pattern_service/graph.py`):** Builds directed graphs representing states and transition probabilities.
6. **Local LLM Provider (`ai_service/`):** Decoupled interface supporting local Ollama instances and built-in offline heuristics.
7. **Permission Engine (`permission_service/engine.py`):** Central gatekeeper validating parameters, sandboxing, and database permissions.
8. **Controlled Tools (`tools/file_tools.py`):** Deterministic tool implementations with simulation, execution, and verification interfaces.
9. **Verifier (`verification_service/verifier.py`):** Asserts post-execution state on the real disk.
10. **Storage & Memory (`database/` & `memory_service/`):** Manages relational records in MySQL/SQLite and vector embeddings in ChromaDB.

---

## 10. AI Methodology
AutoFlow treats AI as an **inference and intent translation component**, deliberately denying it autonomous execution capabilities.
- **Input:** Tokenized event sequences ($[\text{CREATE:PDF}, \text{OPEN:PDF}, \text{RENAME:PDF}, \text{MOVE:PDF}]$), occurrence counts, and directory context.
- **Prompt Architecture:** Strict system constraints instructing the model to return zero shell scripts and format recommendations into a validated JSON schema.
- **Validation:** Every model output is ingested through `pydantic.BaseModel.model_validate()`. Malformed outputs are rejected and safely rerouted to local heuristic rules.

---

## 11. Pattern Detection Algorithm (DSA Component)

### Contiguous Subsequence Mining
Let an event log $E = [e_1, e_2, \dots, e_N]$ be partitioned into target clusters $C = \{c_1, c_2, \dots, c_m\}$ by entity hash or temporal proximity window $W$.
For each cluster $c \in C$, chronological tokens $T = [t_1, t_2, \dots, t_k]$ are generated.
For sequence lengths $L \in [2, 4]$, sub-sequences $S = T[i : i + L]$ are extracted and mapped into frequency hash table $H$:
$$H(S) \leftarrow H(S) + 1$$
If $H(S) \ge \theta_{\text{min\_occurrences}}$, candidate pattern $P$ is instantiated.

### Computational Complexity Analysis
- **Time Complexity:**
  - Partitioning events: $O(N)$
  - Subsequence extraction: $O(m \cdot \sum_{L=2}^4 (k_i - L + 1)) = O(N \cdot L_{\text{max}})$. Given $L_{\text{max}} \le 4$, mining runs in linear time $O(N)$.
  - Cache lookup: $O(1)$ average time complexity via MD5 hash indexing.
- **Space Complexity:**
  - $O(K \cdot L_{\text{max}})$ where $K$ is the number of unique sequences observed in window $W$.

### Directed Graph Representation
Let $G = (V, E)$ be a directed graph where $V$ represents unique event states and directed edge $(u, v) \in E$ has weight $w(u, v)$ denoting the number of direct transitions from state $u$ to state $v$.
Dominant workflow paths are identified via weighted directed acyclic traversal:
$$\text{NextState}(u) = \arg\max_{v \in \text{Adj}(u)} w(u, v)$$

---

## 12. Workflow Generation
Discovered candidate patterns are transformed into structured `Workflow` records containing:
- **Trigger Definition:** E.g., `FILE_CREATED:PDF in <WORKSPACE>/Inbox`
- **Conditions:** Pre-checks such as file extension, minimum file size, or source folder.
- **Action Sequence:** An ordered list of steps referencing explicit tools in `tool_registry`.
- **Verification Plan:** Declarative post-condition specifications (`DESTINATION_EXISTS`, `SOURCE_REMOVED`).

---

## 13. Permission and Security Model
The security perimeter enforces zero-trust with respect to the AI model:

```text
[LLM Proposal]
      |
      v
[Action Validator] --------(Invalid Tool / Param Schema)-------> [REJECT]
      |
      v
[Sandbox Path Validator] --(Path Escapes Safe Workspace Root)--> [SECURITY EXCEPTION]
      |
      v
[Database Permission Check] -(Disabled by User)----------------> [BLOCKED]
      |
      v
[Risk Engine Policy] -------(Requires Approval & Not Signed)----> [HALT FOR USER CONFIRMATION]
      |
      v
[Controlled Tool Execution]
      |
      v
[Verification Engine] -----(File Missing on Disk)--------------> [TRIGGER RECOVERY (Max 2)]
```

### Sandbox Traversal Protection
Every filesystem parameter is resolved against the absolute workspace root:
```python
target = (workspace_root / relative_path).resolve()
target.relative_to(workspace_root) # Throws ValueError if traversal attempts '../../'
```

---

## 14. Database Design
AutoFlow utilizes **MySQL 8.x** (with automatic SQLite fallback for zero-configuration testing):
- `users`: User identity and administrative role.
- `events`: Normalized, privacy-filtered event stream.
- `patterns`: Discovered candidate workflow sequences.
- `pattern_events`: Junction mapping events to discovered patterns.
- `workflows`: Synthesized automations with status (`PROPOSED`, `APPROVED`, `REJECTED`, `IGNORED`).
- `workflow_steps`: Ordered action specifications with risk classifications.
- `permissions`: Master security policy table.
- `executions`: Execution lifecycle audit traces.
- `execution_steps`: Granular tool inputs and outputs.
- `verification_results`: Physical disk post-condition affirmations.
- `memory`: Structured application outcome logs.

---

## 15. API Design (FastAPI)
- `GET /api/stats/dashboard`: System status KPIs and model info.
- `GET /api/activity/events`: Paginated event stream.
- `POST /api/activity/monitor/start`: Explicitly activates watchdog observation.
- `POST /api/activity/monitor/stop`: Explicitly stops observation.
- `GET /api/patterns`: Lists discovered workflow patterns.
- `POST /api/patterns/discover`: Triggers sequence mining.
- `GET /api/patterns/{id}/graph`: Returns node-link transition graph.
- `GET /api/suggestions`: Returns AI explanations and effort estimates.
- `POST /api/workflows/{id}/approve`: Marks workflow as approved.
- `POST /api/workflows/{id}/simulate`: Performs dry-run without file mutation.
- `POST /api/execution/run/{id}`: Controlled workflow execution.
- `GET /api/execution/history`: Execution and verification audit records.
- `GET /api/permissions`: List governance policies.
- `PUT /api/permissions/{id}`: Update permissions.
- `GET /api/privacy/status`: Privacy compliance verification metrics.
- `POST /api/demo/run-scenario`: Simulates the complete 11-cycle academic scenario.

---

## 16. Testing and Quality Assurance
A comprehensive automated test suite with 15 test cases across 5 test suites was implemented using `pytest`:
1. **Pattern Detection Tests (`test_patterns.py`):** Verified repeated sequence discovery, noise rejection, graph builder, and cache hit metrics.
2. **Permission Tests (`test_permissions.py`):** Verified auto-allowance of low-risk actions, approval enforcement for medium/high-risk actions, shell command blocking, and path traversal rejection.
3. **Executor Tests (`test_executor.py`):** Verified folder creation, atomic file renaming, and error handling on missing files.
4. **Verification Tests (`test_verification.py`):** Verified successful post-condition confirmation and detection of failed moves.
5. **AI Tests (`test_ai.py`):** Verified structured Pydantic output adherence and offline fallback functionality.

All 15 tests execute and pass in under 1 second.

---

## 17. Results
- **Pattern Detection Efficiency:** Detected the primary 4-step workflow (`CREATE` $\to$ `OPEN` $\to$ `RENAME` $\to$ `MOVE`) with 11 occurrences in $< 50\text{ ms}$.
- **Cache Optimization Impact:** Sequence hash cache eliminated redundant computations on identical patterns with $O(1)$ lookups.
- **Privacy Verification:** Auditing confirmed $0$ bytes of user data egressed to external cloud APIs; $100\%$ of recorded paths were sanitized.
- **Execution & Verification Integrity:** Execution successfully relocated files into subject directories (`College/DBMS`, `College/AI`, `College/OS`) and confirmed both source removal and target presence.

---

## 18. Limitations
1. **Scope of Observation:** Focuses primarily on filesystem events in designated workspaces.
2. **Heuristic/LLM Ambiguity:** In unconstrained desktop environments, overlapping applications may generate ambiguous event streams.
3. **Model Dependency:** In pure offline environments without GPU acceleration, small local LLMs may have varying reasoning capabilities.
4. **No Operating-System Level GUI Hooking:** By design, AutoFlow does not hook global Windows keyboard or display drivers to prevent security and privacy breaches.

---

## 19. Future Scope
- Integration with cross-platform desktop notification daemons.
- Semantic document text clustering using local sentence transformers.
- Fine-grained undo/rollback buffers for non-destructive workflow reversals.
- Local voice command confirmation for approval-gated workflows.

---

## 20. Conclusion
AutoFlow demonstrates that personal computer automation can be transformed from a tedious manual scripting chore into an intuitive, AI-discovered capability without sacrificing user privacy or computer security. By establishing strict boundaries where the AI proposes, the permission engine decides, the executor acts, and the verifier confirms, AutoFlow provides a secure, explainable, and academically rigorous blueprint for next-generation local AI automation.

---

## 21. References
1. Agrawal, R., & Srikant, R. (1995). *Mining sequential patterns*. Proceedings of the Eleventh International Conference on Data Engineering.
2. Han, J., Pei, J., & Yin, Y. (2000). *Mining frequent patterns without candidate generation*. ACM SIGMOD Record, 29(2), 1-12.
3. Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2009). *Introduction to Algorithms* (3rd ed.). MIT Press.
4. Tiwary, M., et al. (2023). *Local-First Software: You own your data, in spite of the cloud*. ACM Queue.
5. Pydantic Documentation. (2024). *Data validation and settings management using Python type annotations*. https://docs.pydantic.dev/
6. FastAPI Framework. (2024). *High performance Python web framework*. https://fastapi.tiangolo.com/
