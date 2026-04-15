<div align="center">
  <img src="https://media.licdn.com/dms/image/v2/D4E12AQEqkR21KSTPBA/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1691157147814?e=2147483647&v=beta&t=k6z9D3B0q8Q3E2UuT4L-30s0B293Vz4a33X_rB6DvwM" alt="AutoResearch Core" width="100%" style="border-radius: 12px; margin-bottom: 24px; opacity: 0.85; max-height: 300px; object-fit: cover;">

  <h1>AutoResearch AI — <i>Studio Protocol v5.0</i></h1>
  <p><b>Hyper-Precision Multi-Agent Orchestrator • 100% Local Inference • GPU Accelerated</b></p>

  <p>
    <a href="https://github.com/maqa817/AutoResearch_AI"><img src="https://img.shields.io/badge/Frontend-React%2018-blue?style=for-the-badge&logo=react" alt="Frontend Tech"></a>
    <a href="https://github.com/maqa817/AutoResearch_AI"><img src="https://img.shields.io/badge/Backend-FastAPI-lightgrey?style=for-the-badge&logo=fastapi" alt="Backend Tech"></a>
    <a href="https://github.com/maqa817/AutoResearch_AI"><img src="https://img.shields.io/badge/VectorDB-FAISS-red?style=for-the-badge&logo=faiss" alt="FAISS"></a>
    <a href="https://github.com/maqa817/AutoResearch_AI"><img src="https://img.shields.io/badge/LLM-Ollama-emerald?style=for-the-badge&logo=ollama" alt="LLM"></a>
    <a href="https://github.com/maqa817/AutoResearch_AI"><img src="https://img.shields.io/badge/GPU-RTX%204060%20Ti-purple?style=for-the-badge&logo=nvidia" alt="GPU"></a>
  </p>
</div>

---

## ⚡ Overview

**AutoResearch AI** is a professional-grade, fully local multi-agent system designed for researchers, security-conscious professionals, and enterprises. It handles **document ingestion, semantic indexing, query orchestration, report generation, and verification** while guaranteeing **zero data leakage**.You can review the frontend part (because Ollama is running locally and I don’t have any paid partnership with hosting websites) at https://autoresearchai.vercel.app/ .

> Built to combine the high-performance aspects of Mistral and Llama models with GPU acceleration and robust agent collaboration.

---

## 🚀 Multi-Agent Pipeline

Each query flows through **5 specialized autonomous agents**, ensuring high precision and minimal hallucination:

| Agent          | Compute Type        | Responsibility                                                             |
| :------------- | :------------------ | :------------------------------------------------------------------------- |
| **Planner**    | Sequential Logic    | Breaks prompts into atomic actionable steps                                |
| **Researcher** | Semantic GPU Search | Embeds queries & documents via `all-MiniLM-L6-v2`                          |
| **Analyst**    | Data Abstraction    | Converts raw textual chunks into structured insights                       |
| **Writer**     | Markdown Synthesis  | Generates human-readable reports with structure & citations                |
| **Critic**     | Verification        | Scores output quality, rejects hallucinations, ensures factual correctness |

---

## 🖥️ System Architecture

* **Backend**: FastAPI + Python 3.10+
* **Frontend**: React 18 + Vite (premium 12-column luxury grid)
* **Vector DB**: FAISS (local, memory-mapped, scalable to millions of chunks)
* **LLM**: Ollama running Mistral-7B / Llama 2-7B locally
* **Hardware**: GPU-aware (NVIDIA RTX 40xx series), fallback to CPU

```python
# Embedding device allocation
self.device = "cuda" if torch.cuda.is_available() else "cpu"
self.model = SentenceTransformer("all-MiniLM-L6-v2", device=self.device)
```

---

## 📊 Performance Benchmarks

| Model      | Target Device | Avg Response / Chunk | Use Case                               |
| :--------- | :------------ | :------------------- | :------------------------------------- |
| Mistral-7B | RTX 4060 Ti   | 1-2s                 | High-precision document analysis       |
| Llama 2-7B | RTX 4060 Ti   | 2-3s                 | Offline research, long-context queries |
| CPU-only   | CPU fallback  | 5-10s                | Prototyping, small datasets            |

> GPU acceleration reduces response time by 70–80%. CPU-only mode remains functional but slower.

---

## 🛠️ Installation

### 1. Prerequisites

* [Python 3.10+](https://www.python.org/downloads/)
* [Node.js v18+](https://nodejs.org/en/)
* [NVIDIA CUDA Toolkit](https://developer.nvidia.com/cuda-downloads)
* [Ollama Local](https://ollama.com)

```bash
# Launch Ollama LLM
ollama run mistral
# or
ollama run llama3
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd ..
npm install
npm run dev
```

Visit: `http://localhost:3000`

---

## 🔐 Data Sovereignty

* All files (`.txt`, `.pdf`) are hashed and vectorized **locally**
* No external cloud or telemetry
* Critic agent ensures factual correctness

---

## 🌟 Advanced Features

* **Real-Time Token Streaming**: Consume inference results as they happen via Server-Sent Events (SSE).
* **Agentic Research Trace**: Watch the Planner, Researcher, Analyst, and Writer collaborate in a live-updating backtrace timeline.
* **Strict Context Control**: Absolute document filtering ensures the AI only accesses files you explicitly select for each query.
* **Intelligent fallback**: Gracefully handles general queries vs. document-grounded research.
* **Dynamic semantic chunking**: Intelligent text splitting with overlap for context preservation.
* **Hardware acceleration**: Deep integration with NVIDIA RTX GPUs via Ollama and PyTorch.
* **Fully air-gapped**: Zero external data transmission for 100% privacy.

---

## 🔮 Future Enhancements

* PDF/OCR multi-modal ingestion (Vision models)
* Cross-document consistency re-ranking
* LoRA fine-tuning for domain-specific models
* Semantic query routing
* Persistence layer for research history

---

## 📌 Example Query

**Query:**
*"Summarize specifically from Document_1.txt and ignore the database."*

**AI Response:**
*"Synthesized report exclusively based on Doc_1: Insights found include X, Y, and Z. Reference vectors from other files were excluded as per strict selection protocol."*

---

## 📈 Diagrams & Workflow (Mermaid GitHub-friendly)

```mermaid
graph TD
    Q[User Query] --> P[Planner]
    P --> R[Researcher]
    R --> A[Analyst]
    A --> W[Writer]
    W --> C[Critic]
    C --> O[Output Report]
```
---

## 📊 Hardware vs Performance Table

| Task           | Device      | Avg Time         | Notes               |
| :------------- | :---------- | :--------------- | :------------------ |
| Vectorization  | RTX 4060 Ti | 3-5ms/chunk      | 250-word overlap    |
| FAISS Search   | CPU         | <1ms             | 1M+ vectors         |
| LLM Generation | RTX 4060 Ti | 30-55 tokens/sec | 8,000 token context |

---

<div align="center">
Built with ❤️ by <a href="https://github.com/maqa817">Maqa Verdiyev</a> — connect via <a href="https://www.linkedin.com/in/maqa-verdiyev/">LinkedIn</a>
</div>
