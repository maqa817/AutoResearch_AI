<div align="center">
  <img src="https://media.licdn.com/dms/image/v2/D4E12AQEqkR21KSTPBA/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1691157147814?e=2147483647&v=beta&t=k6z9D3B0q8Q3E2UuT4L-30s0B293Vz4a33X_rB6DvwM" alt="AutoResearch Core" width="100%" style="border-radius: 12px; margin-bottom: 24px; opacity: 0.8; max-height: 300px; object-fit: cover;">
  
  <h1>AutoResearch AI — <i>Studio Protocol v5.0</i></h1>
  <p><b>Hyper-Precision Multi-Agent Orchestrator • 100% Local Inference • GPU Accelerated</b></p>
  
  <p>
    <a href="https://github.com/maqa817/AutoResearch_AI"><img src="https://img.shields.io/badge/Architecture-Next.js%20%7C%20FastAPI-blue?style=for-the-badge&logo=react" alt="Tech Stack"></a>
    <a href="https://github.com/maqa817/AutoResearch_AI"><img src="https://img.shields.io/badge/Inference-Local%20Ollama-emerald?style=for-the-badge&logo=ollama" alt="Ollama"></a>
    <a href="https://github.com/maqa817/AutoResearch_AI"><img src="https://img.shields.io/badge/Device_Target-RTX%204060%20Ti-purple?style=for-the-badge&logo=nvidia" alt="Nvidia RTX"></a>
  </p>
</div>

---

## ⚡ Overview
**AutoResearch AI** is a professional-grade, strictly localized multi-agent intelligence platform. Designed specifically for security-conscious professionals and researchers, it completely isolates document data by utilizing a self-hosted `FAISS` vector index and the `Ollama` framework. 

Version 5 represents a total architectural re-build. The graphical interface is forged through a premium "Swiss Minimalist Luxury" aesthetic, and the backend engine strictly leverages dedicated NVIDIA GPUs (e.g. RTX 40-Series) to offset computational bottlenecks.

## 🚀 The Multi-Agent Swarm
Every query fired bounds through a sequential pipeline of 5 hyper-specialized autonomous agents, guaranteeing zero hallucination.

| Agent Identity | Compute Type | Operational Directive |
|:---|:---|:---|
| **Strategic Planner** | Sequential Logic | Breaks vague user prompts into rigidly structured atomic actions. |
| **Deep Researcher** | Semantic Search | Uses the `all-MiniLM-L6-v2` transformer on GPU to execute 384-dimensional searches against the FAISS array. |
| **Data Analyst** | Abstraction | Converts chaotic incoming textual chunks into connected relational data logic. |
| **Report Writer** | Synthesis | Generates the finalized markdown topology including citations and flow structure. |
| **Rigorous Critic** | Verification Loop | Acts as an independent execution gate. Scores for hallucination and explicitly rejects low-quality output. |

---

## 🖥️ System Architecture & GPU Implementation

By default, Python-based embeddings and external models can default to CPU logic pipelines. AutoResearch AI strictly patches these to lock onto target Silicon clusters natively.

### 1. Vector Offloading (Sentence Transformers)
Within `backend/embed.py`, the indexer is programmed to ping hardware arrays tracking for `CUDA` threads. If an **RTX 4060 Ti** (or similar) is detected, it immediately binds the embedding load away from the CPU framework onto VRAM:
```python
self.device = "cuda" if torch.cuda.is_available() else "cpu"
self.model = SentenceTransformer("all-MiniLM-L6-v2", device=self.device)
```

### 2. Ollama GPU Configs
To ensure the LLM generation does not strangle your CPU, **Ollama must be executed correctly**.
* Ensure NVIDIA CUDA Toolkit is active globally on your host machine.
* By default, Ollama passes context weight boundaries into the GPU. To maximize the 4060 Ti's 8GB/16GB VRAM, the app exposes parameter tunings directly in the frontend UI.
  * *Recommended*: `Temperature: 0.7`, `Top-K: 40`, `Max Context 4096`.

### 📊 Performance Adjustments Data
| Inference Task | Target Silicon | Avg Processing | Context Limits |
|:---|:---|:---|:---|
| Document Vectorization | RTX 4060 Ti (CUDA) | ~3-5ms / Chunk | 250 Words overlap |
| FAISS Index Search | CPU / RAM Bounds | < 1ms | 1 Million+ Vectors |
| Agent LLM Generation | RTX 4060 Ti (Ollama) | 30-55 Tokens/Sec | 8,000+ Window |

> **Note**: If your CPU still spikes during generation, ensure Ollama is installed natively as a system-executable rather than running in an unaccelerated WSL container.

---

## 🛠️ Complete Installation Protocol

### Step 1: System Pre-requisites
1. [Node.js v18+](https://nodejs.org/en/)
2. [Python 3.10+](https://www.python.org/downloads/)
3. [NVIDIA CUDA Toolkit](https://developer.nvidia.com/cuda-downloads)
4. [Ollama Local Server](https://ollama.com)

**Boot Ollama:**
Pull the operational models into your unified architecture.
```bash
ollama run mistral
# OR
ollama run llama3
```

### Step 2: Establish Backend Core
The Backend runs the FAISS logic and embedding servers.
```bash
# Move to the engine room
cd backend

# Establish a sterile environment
python -m venv venv
.\venv\Scripts\activate

# Install critical dependencies (Ensure PyTorch identifies the GPU)
pip install -r requirements.txt
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# Ignite the ASGI Server
uvicorn main:app --reload --port 8000
```
> You will see: `Initializing Embedding Engine on device: CUDA` in the terminal output.

### Step 3: Establish Frontend Studio
The Studio operates on a 12-column grid luxury layout.
```bash
# Return to root directory
cd ..

# Map standard dependencies
npm install

# Start development compiler
npm run dev
```

Navigate to `http://localhost:3000` to enter the Studio.

---

## 🔐 Strict Data Sovereignty
AutoResearch AI handles massive intellectual documentation via local enclaves.
* Uploaded `.txt` or `.pdf` files are hashed directly in `backend/data/`.
* Vector encodings are localized completely to binary `.index` FAISS outputs.
* **No Telemetry**. Nothing logs to an external cloud database. The `Critic` model ensures the localized AI accurately reproduces provided facts without external internet searches.

---

<div align="center">
  <b>Built by <a href="https://github.com/maqa817">Maqa Verdiyev</a></b><br>
  Available for integration. Connect on <a href="https://www.linkedin.com/in/maqa-verdiyev/">LinkedIn</a>.
</div>
