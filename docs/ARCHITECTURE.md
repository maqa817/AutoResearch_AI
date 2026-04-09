# AutoResearch AI v2 - System Architecture

## High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  Next.js Dashboard  │  File Upload  │  Query Interface           │
│  (Frontend)         │  Component    │  (React Components)        │
└──────────────┬──────────────────────────────────────────────────┘
               │
               │ HTTP/REST
               │
┌──────────────┴──────────────────────────────────────────────────┐
│                    FASTAPI SERVER (PORT 8000)                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  /api/       │  │  /api/       │  │  /api/       │          │
│  │  upload      │  │  research    │  │  stats       │          │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘          │
│         │                  │                                     │
│         ▼                  ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           CORE RAG LOGIC                                 │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  rag.py & embed.py                                       │  │
│  │  - RAGPipeline class                                     │  │
│  │  - ResearchOrchestrator class                            │  │
│  │  - 5-Agent orchestration                                 │  │
│  └──────┬─────────────────────────┬──────────────────────┬─┘  │
│         │                         │                      │      │
└─────────┼─────────────────────────┼──────────────────────┼──────┘
          │                         │                      │
          ▼                         ▼                      ▼
    ┌──────────────┐      ┌──────────────┐     ┌────────────────┐
    │  EMBEDDING   │      │   FAISS      │     │   OLLAMA       │
    │  MANAGER     │      │   VECTOR     │     │   LLM SERVER   │
    │              │      │   DATABASE   │     │                │
    │ embed.py     │      │              │     │ (localhost:    │
    │ - Chunk text │      │ - L2 search  │     │  11434)        │
    │ - Embedding  │      │ - Index save │     │                │
    │ - Retrieval  │      │ - Metadata   │     │ mistral,       │
    │              │      │   storage    │     │ llama2, etc.   │
    └──────┬───────┘      └──────┬───────┘     └────────┬────────┘
           │                     │                      │
           └─────────────────────┼──────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
            ┌──────────────┐        ┌──────────────┐
            │  ./data/     │        │  INFERENCE   │
            │  faiss_index/│        │  ENGINE      │
            │              │        │              │
            │ faiss.index  │        │ (Token gen)  │
            │ metadata.json│        │              │
            └──────────────┘        └──────────────┘
```

## Data Flow Diagram

### Document Ingestion Flow

```
User Upload (File)
    │
    ├─→ [main.py] Extract Text
    │        │
    │        ├─→ .txt: Direct decode
    │        │
    │        └─→ .pdf: PyPDF2 extraction
    │
    ├─→ [embed.py] Chunk Text
    │        │
    │        ├─→ Split by paragraphs
    │        │
    │        ├─→ Count words
    │        │
    │        └─→ Create 200-300 word chunks with 50-word overlap
    │
    ├─→ [embed.py] Generate Embeddings
    │        │
    │        ├─→ SentenceTransformers.encode()
    │        │
    │        └─→ 384-dimensional vectors
    │
    ├─→ [FAISS] Index Storage
    │        │
    │        ├─→ Add to FAISS IndexFlatL2
    │        │
    │        └─→ Store metadata
    │
    └─→ [Disk] Persist
             │
             ├─→ ./data/faiss_index/faiss.index
             │
             └─→ ./data/faiss_index/metadata.json

Result: Document fully indexed & searchable ✓
```

### Query Resolution Flow

```
User Query: "What is machine learning?"
    │
    ├─→ [rag.py] RAGPipeline.generate()
    │        │
    │        ├─→ Retrieve Context:
    │        │        │
    │        │        ├─→ [embed.py] Embed query
    │        │        │   "What is machine learning?" → 384-dim vector
    │        │        │
    │        │        ├─→ [FAISS] Search
    │        │        │   L2 distance search → Top-3 similar chunks
    │        │        │
    │        │        └─→ [embed.py] Retrieve Chunks
    │        │            Fetch text + metadata + similarity scores
    │        │
    │        ├─→ Build Prompt:
    │        │        │
    │        │        ├─→ Format retrieved context
    │        │        │
    │        │        ├─→ Add system instructions
    │        │        │
    │        │        └─→ Append user query
    │        │
    │        └─→ Call LLM:
    │                │
    │                ├─→ [Ollama] HTTP request
    │                │   POST /api/generate
    │                │
    │                ├─→ [LLM] Generate response
    │                │   Using mistral/llama2/etc.
    │                │
    │                └─→ Return answer
    │
    └─→ Response to User
             │
             ├─→ Answer: "Machine learning is..."
             │
             ├─→ Chunks retrieved: 3
             │
             └─→ Model used: "mistral"

Time: ~0.15s retrieval + 10-30s generation
```

### Full Orchestration Flow (5-Agent)

```
User Query
    │
    ├─→ [1] PLANNER AGENT
    │        │
    │        └─→ Break down query into research steps
    │           "Query: Analyze ML findings"
    │           Plan: [Research basic concepts, Find applications, 
    │                  Identify limitations, Synthesize conclusions]
    │
    ├─→ [2] RESEARCHER AGENT
    │        │
    │        ├─→ [RAG] Retrieve relevant information
    │        │
    │        └─→ Find facts, data, evidence from documents
    │           "ML is a subset of AI with three main types..."
    │
    ├─→ [3] ANALYST AGENT
    │        │
    │        ├─→ Parse research findings
    │        │
    │        └─→ Identify patterns, insights, connections
    │           "Key findings: [1] ... [2] ... [3] ..."
    │
    ├─→ [4] WRITER AGENT
    │        │
    │        ├─→ Structure analysis into report
    │        │
    │        └─→ Generate professional document
    │           "RESEARCH REPORT
    │            Executive Summary: ...
    │            Key Findings: ...
    │            Conclusions: ..."
    │
    ├─→ [5] CRITIC AGENT
    │        │
    │        ├─→ Review report quality
    │        │
    │        ├─→ Check accuracy, completeness, clarity
    │        │
    │        └─→ Return quality feedback
    │           "Quality score: 8/10
    │            Strengths: ...
    │            Improvements: ..."
    │
    └─→ Final Report ✓
```

## Component Architecture

### embed.py - Embedding Module

```
EmbeddingManager
├── __init__()
│   ├── Load SentenceTransformers model
│   ├── Initialize/load FAISS index
│   └── Load metadata from disk
│
├── chunk_text()
│   ├── Split by paragraphs
│   ├── Count words
│   ├── Create overlapping chunks
│   └── Return chunk list
│
├── add_document()
│   ├── Chunk document
│   ├── Generate embeddings
│   ├── Add to FAISS index
│   ├── Store metadata
│   └── Save to disk
│
├── query()
│   ├── Embed query string
│   ├── FAISS L2 search
│   ├── Retrieve top-k chunks
│   └── Return results with scores
│
├── _save_index()
│   ├── Write FAISS index
│   └── Save metadata JSON
│
└── get_stats()
    ├── Count documents
    ├── Count chunks
    └── Return metrics
```

### rag.py - RAG & Agents

```
RAGPipeline
├── __init__()
│   └── Initialize Ollama connection
│
├── _retrieve_context()
│   ├── Call embedding_manager.query()
│   └── Format chunks as text
│
├── _build_prompt()
│   ├── Add context
│   ├── Add instructions
│   └── Append user query
│
├── _call_ollama()
│   ├── POST to /api/generate
│   ├── Error handling
│   └── Return response
│
└── generate()
    ├── Retrieve context
    ├── Build prompt
    ├── Call LLM
    └── Return structured result

ResearchOrchestrator
├── __init__()
│   ├── Create RAGPipeline
│   └── Initialize agents
│
├── plan_research()
│   └── Planner agent
│
├── conduct_research()
│   └── Researcher agent
│
├── analyze_findings()
│   └── Analyst agent
│
├── write_report()
│   └── Writer agent
│
├── critique_output()
│   └── Critic agent
│
└── orchestrate_full_research()
    └── Run all 5 agents sequentially
```

### main.py - FastAPI Server

```
FastAPI App
├── Health Endpoints
│   ├── GET /health
│   └── GET /api/stats
│
├── Document Management
│   ├── POST /api/upload
│   ├── GET /api/documents
│   └── POST /api/clear-index
│
├── Research Endpoints
│   ├── POST /api/research
│   │   ├── Simple RAG mode
│   │   └── Full orchestration mode
│   │
│   └── POST /api/batch-research
│       └── Process multiple queries
│
└── Middleware
    ├── CORS configuration
    ├── Request logging
    └── Error handling
```

## Storage Architecture

### Directory Structure

```
backend/
├── main.py                    # API server
├── embed.py                   # Embeddings
├── rag.py                     # RAG pipeline
├── test_rag.py               # Tests
├── requirements.txt          # Dependencies
│
└── data/                      # Persistent storage (auto-created)
    └── faiss_index/
        ├── faiss.index       # Binary FAISS index
        │   └── Stores: 384-dim vectors for all chunks
        │   └── Format: Binary optimized for search
        │   └── Size: ~150 bytes per embedding
        │
        └── metadata.json     # Document & chunk metadata
            ├── Documents: [id, chunk_count, metadata]
            └── Chunks: [chunk_id, doc_id, text, word_count]
```

### Persistence Schema

```
metadata.json structure:
{
  "documents": [
    {
      "id": "document_name",
      "chunks_count": 15,
      "metadata": {
        "source": "IEEE",
        "date": "2024-01-15",
        "author": "Jane Doe"
      },
      "content_hash": "abc123..."
    }
  ],
  "chunks": [
    {
      "chunk_id": "doc_chunk_0",
      "doc_id": "document_name",
      "text": "First 200-300 word chunk...",
      "word_count": 250,
      "index_position": 0
    },
    ...
  ]
}
```

## Performance Characteristics

### Latency Breakdown (Query)

```
User Query: "What is machine learning?"
└── Embedding Query
    ├── Load model (first run): 2-3s
    └── Encode query: 50ms
└── FAISS Search
    ├── L2 distance computation: 10ms
    └── Retrieve results: 5ms
└── Prompt Building
    ├── Format chunks: 10ms
    └── Build prompt: 5ms
└── LLM Generation
    ├── Send to Ollama: 5ms
    ├── Model inference: 10-30s (DOMINANT)
    └── Return response: 5ms
├── Total (with cached model): ~10-30s
└── Bottleneck: LLM generation (95%+ of time)
```

### Storage Requirements

```
Per Document (100 chunks):
├── FAISS index: 100 × 384 × 4 bytes = 150 KB
├── Metadata: ~5 KB
└── Total: ~155 KB

Typical Deployment (1000 documents, 5000 chunks):
├── FAISS index: 5000 × 150 bytes = 750 KB
├── Models cached: ~80 MB (SentenceTransformers)
├── Metadata: ~50 KB
└── Total: ~80 MB

Scalable to millions of chunks (gigabytes with appropriate hardware)
```

## Integration Points

### With Frontend (Next.js)

```
HTTP/REST API
┌─────────────────────────────────────────┐
│ Frontend (React)                         │
│ ├── Upload component                    │
│ │   └── POST /api/upload                │
│ │       ├── File object                 │
│ │       └── Returns: chunks_added       │
│ │                                       │
│ └── Query component                     │
│     └── POST /api/research              │
│         ├── { query, use_full_orchestr. }
│         └── Returns: answer/report      │
└─────────────────────────────────────────┘
         ↓ (Fetch API)
┌─────────────────────────────────────────┐
│ Backend (FastAPI)                        │
│ ├── /api/upload endpoint                │
│ └── /api/research endpoint              │
└─────────────────────────────────────────┘
```

### With Ollama (LLM)

```
HTTP/REST API
┌─────────────────────────────────────────┐
│ Backend (FastAPI)                        │
│ └── rag.py._call_ollama()               │
└─────────────────────────────────────────┘
         ↓ (Requests library)
┌─────────────────────────────────────────┐
│ Ollama Server (localhost:11434)          │
│ └── POST /api/generate                  │
│     ├── model: "mistral"                │
│     ├── prompt: "..."                   │
│     └── Returns: generated text         │
└─────────────────────────────────────────┘
```

### With Database (Future)

```
Planned v2.2 Integration:
┌─────────────────────────────────────────┐
│ Backend (FastAPI)                        │
│ └── SQLAlchemy ORM                      │
└─────────────────────────────────────────┘
         ↓ (psycopg2)
┌─────────────────────────────────────────┐
│ PostgreSQL Database                      │
│ ├── users table                         │
│ ├── documents table                     │
│ ├── queries table                       │
│ └── results table                       │
└─────────────────────────────────────────┘
```

## Scalability Strategy

### Horizontal Scaling

```
Load Balancer (Nginx)
├── Backend Instance 1 (port 8001)
├── Backend Instance 2 (port 8002)
└── Backend Instance 3 (port 8003)
    └── All connect to shared:
        ├── Shared FAISS index (NFS)
        └── Shared Ollama service (internal)
```

### Vertical Scaling

```
Performance improvements:
├── Add GPU support
│   └── faiss-gpu (10-50x faster)
│
├── Larger embedding model
│   └── all-mpnet-base-v2 (better accuracy)
│
├── Optimize chunking
│   └── Adjust CHUNK_SIZE based on use case
│
└── Cache management
    └── Redis for embedding cache
```

---

This architecture is **production-ready**, **scalable**, and **extensible**.
