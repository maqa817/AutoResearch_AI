# AutoResearch AI — Studio v5

AutoResearch AI is a state-of-the-art, open-source multi-agent research orchestration platform. Version 5 introduces a decoupled FastAPI backend, rigorous document context isolation using local FAISS embeddings, and a completely re-engineered standard for the frontend inspired by Swiss minimalist luxury design.

## 🚀 Key Features

* **Multi-Agent Orchestration**: A specialized pipeline of independent agents (Strategic Planner, Deep Researcher, Data Analyst, Report Writer, and Rigorous Critic).
* **Strict Document Isolation (RAG)**: Precise vector search via FAISS. The system parses uploaded PDFs/TXT files and ensures the LLM's context window only views the absolute most relevant chunks.
* **100% Local Intelligence**: Utterly private. Uses Ollama for local LLM inference, ensuring complete data sovereignty. Your files never leave your device.
* **Swiss Luxury UI/UX**: The entire front end is architected with Framer Motion, strict 8px layout scaling, absolute Lucide iconography, and responsive Bento grids. 
* **Dynamic Theme Switcher**: Fluid transitions between a "Modern Art Gallery" light mode and a "Midnight Studio" dark mode.

## 🏗️ Architecture

The system is decoupled into two primary services:

1. **Frontend (Next.js 14 / React Server Components)**
   * Located at the project root (`./app`, `./components`).
   * Handles user interfaces, theme token states, document file uploads, and stream-like presentation of agent orchestration logs.
   * `app/api/research/` acts as an edge proxy to the local Python backend.

2. **Backend (Python / FastAPI)**
   * Located in `./backend/`.
   * Integrates tightly with *sentence-transformers* for document embeddings.
   * Runs FAISS vector space.
   * Executes the `LangChain`/Agent logic loops natively.

---

## 🛠️ Quick Start Guide

### 1. Prerequisites
- **Ollama**: Must be installed and running on your system. 
  - Install standard models: `ollama run mistral` or `ollama run llama3`.
- **Node.js**: (v18+) For the Next.js frontend.
- **Python**: (3.10+) For the FastAPI backend.

### 2. Booting the Python Core (Backend)
Open a terminal in the root directory:
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate   # On Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
*The core inference API is now listening privately on `localhost:8000`.*

### 3. Booting the Studio UI (Frontend)
Open a separate terminal in the root directory:
```bash
# In the root folder
npm install
npm run dev
```
*Navigate your browser to [http://localhost:3000](http://localhost:3000) to access the professional workspace.*

---

## 📂 Project Structure

```text
AutoResearch_AI/
├── app/                  # Next.js 14 App Router (Frontend)
│   ├── dashboard/        # SaaS Workspace layout
│   └── globals.css       # Tokenized CSS strictly managing the Luxury Theme
├── backend/              # Python FastAPI Core
│   ├── data/             # Persistent FAISS Indices and uploaded files
│   ├── _main.py_         # Core HTTP API (Upload, Clear, Prompt)
│   ├── _rag.py_          # Multi-Agent orchestrator pipeline
│   └── _embed.py_        # Vector embedding manager
├── components/           # Reusable React UI primitives (Radix/Framer Motion)
├── package.json          # Frontend dependency matrix
└── requirements.txt      # Backend Python dependencies
```

## 🧠 The Agent Swarm Workflow
1. **Planner**: Deconstructs the user prompt into actionable sub-queries.
2. **Researcher**: Communicates via `embed.py` to retrieve chunks from FAISS matching the sub-queries.
3. **Analyst**: Looks at the raw textual chunks and extracts semantic meaning and logic data.
4. **Writer**: Structures an executive response mapping directly back to the original prompt.
5. **Critic**: Scores for hallucinations and readability, forcing a retry if the output is poorly formulated.

---

*Open Source. Private. Built for the modern professional.*
