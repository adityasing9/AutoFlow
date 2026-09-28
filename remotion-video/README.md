# AutoFlow Remotion Video Suite

This directory contains the programmatic video presentation for **AutoFlow**, built with [Remotion](https://remotion.dev) (React-based video framework).

---

## 🎬 Video Overview

- **Title:** AutoFlow — AI-Powered Workflow Discovery & Privacy-Preserving Automation
- **Format:** MP4 (H.264)
- **Resolution:** 1920x1080 (1080p Full HD, 16:9)
- **Framerate:** 30 FPS
- **Duration:** 38.00 seconds (1,140 frames)
- **Audio/Visual Style:** Dark cybernetic theme (`#0a0f1d`), emerald/cyan glowing ambient orbs, glassmorphism cards, floating window mockups with real dashboard screenshots, and stage-tracking navbar.

---

## 📽️ Scene Breakdown

| Scene | Time | Topic | Visual Focus |
|-------|------|-------|--------------|
| **01. Problem Hook & Discovery** | 0s – 6.3s (Frames 0–190) | Manual Burden vs Autonomous Discovery | Dynamic typography, contrast comparison cards, feature badges |
| **02. Privacy Guard Firewall** | 6.3s – 12.6s (Frames 190–380) | Zero Surveillance, Local-First Ingestion | Floating window with Privacy & Trust Dashboard, SHA-256 path hashing |
| **03. Graph Mining & Patterns** | 12.6s – 19.0s (Frames 380–570) | Sliding-Window Sequence Mining ($O(N)$) | Cycle detection flow (`CREATE` ➔ `OPEN` ➔ `RENAME` ➔ `MOVE`), Directed Graph Modal |
| **04. AI Intent & Safe Simulation** | 19.0s – 25.3s (Frames 570–760) | Local LLM Intent Inference | "Study Material Organizer" (94% confidence, LOW risk), dry-run simulation modal |
| **05. Controlled Execution & Disk Verification** | 25.3s – 31.6s (Frames 760–950) | Human Approval & Verification Check | Verification checklist (`DESTINATION_EXISTS`, `SOURCE_REMOVED`), immutable SQLite audit trail |
| **06. Architecture Philosophy & Outro** | 31.6s – 38.0s (Frames 950–1140) | The 4-Line Principle Creed & Live Links | *"The AI proposes. The permission engine decides. The executor acts. The verifier confirms."* + GitHub & Vercel badges |

---

## 🚀 How to Run & Preview

### 1. Launch Remotion Studio (Interactive UI)
To open the interactive browser timeline with live playback, scrubbing, and frame-by-frame inspection:
```bash
cd remotion-video
npm run dev
```
Studio will open at: `http://localhost:3000`

### 2. Render Full MP4 Video
```bash
cd remotion-video
npm run build
```
The rendered video will be saved at `remotion-video/out/autoflow-demo.mp4`.

### 3. Generate a Still Frame Preview
```bash
cd remotion-video
npm run still
```
Or specify any frame:
```bash
npx remotion still src/index.jsx AutoFlowVideo out/frame-300.png --frame=300
```
