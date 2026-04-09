# AutoResearch AI Backend v2.0

Production-ready RAG (Retrieval Augmented Generation) powered multi-agent research system.

## What's New in v2

✓ **Semantic Retrieval**: FAISS vector database for intelligent chunking & search  
✓ **Smart Chunking**: 200-300 word chunks with overlap preservation  
✓ **Fast Embeddings**: SentenceTransformers (all-MiniLM-L6-v2) for lightweight encoding  
✓ **Persistent Index**: Save/load FAISS index from disk  
✓ **Dual Modes**: Simple RAG or full 5-agent orchestration  
✓ **Batch Processing**: Handle multiple queries efficiently  
✓ **PDF Support**: Parse and index PDF documents  

## Architecture

```
FastAPI Server (8000)
  ├── Upload Endpoint → Document Processing
  │   └── Text Extraction → Chunking → Embedding → FAISS Index
  ├── Research Endpoint (RAG Mode)
  │   └── Query → Embed → Retrieve → Prompt → LLM
  ├── Research Endpoint (Full Mode)
  │   └── Planner → Researcher → Analyst → Writer → Critic
  └── Management Endpoints (Stats, Documents, Clear)
```

## Installation

### Prerequisites

- Python 3.10+
- Ollama (for LLM inference)
- pip or uv package manager

### Step 1: Install Dependencies

```bash
cd backend/
pip install -r requirements.txt
```

Or using uv:
```bash
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install -r requirements.txt
```

### Step 2: Start Ollama (Separate Terminal)

```bash
# Install from https://ollama.ai
ollama serve

# In another terminal, pull a model
ollama pull mistral
# or
ollama pull llama2
```

### Step 3: Start Backend

```bash
python main.py
```

Server runs at `http://localhost:8000`  
API docs at `http://localhost:8000/docs` (Swagger UI)

## Quick Start

### 1. Upload a Document

```bash
curl -X POST "http://localhost:8000/api/upload" \
  -H "accept: application/json" \
  -F "file=@myresearch.txt"
```

### 2. Ask a Question (Simple RAG)

```bash
curl -X POST "http://localhost:8000/api/research" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the main conclusion?",
    "use_full_orchestration": false
  }'
```

### 3. Full Research (All 5 Agents)

```bash
curl -X POST "http://localhost:8000/api/research" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Analyze the research findings",
    "use_full_orchestration": true
  }'
```

## API Endpoints

### Health & Status

```
GET  /health           - Health check + document count
GET  /api/stats        - Detailed index statistics
GET  /api/documents    - List all indexed documents
```

### Document Management

```
POST /api/upload       - Upload & index document (.txt or .pdf)
POST /api/clear-index  - Clear all indexed documents
```

### Research & Queries

```
POST /api/research           - Single query (RAG or full orchestration)
POST /api/batch-research     - Multiple queries
```

## Core Modules

### embed.py - Document Embedding & Indexing

**Purpose**: Manages document chunking, embedding, and FAISS index

**Key Class**: `EmbeddingManager`
- Chunks documents intelligently (200-300 words with overlap)
- Embeds using SentenceTransformers
- Stores embeddings in FAISS index
- Persists to disk

**Key Functions**:
```python
embed_and_add_document(text, doc_id, metadata)    # Index document
retrieve_relevant_chunks(query, top_k=3)          # Search index
get_embedding_stats()                             # Get index info
```

### rag.py - RAG Pipeline & Agent Orchestration

**Purpose**: Implements semantic retrieval, prompt building, and agent coordination

**Key Classes**:
- `RAGPipeline`: Retrieve context + generate answers
- `ResearchOrchestrator`: Run full 5-agent workflow

**Key Methods**:
```python
rag_pipeline.generate(query)                              # Simple RAG
research_orchestrator.orchestrate_full_research(query)    # Full workflow
```

### main.py - FastAPI Application

**Purpose**: REST API server with document management and research endpoints

**Features**:
- CORS support for frontend integration
- Comprehensive error handling
- Logging and monitoring
- Async/await for performance

## Testing

Run the test suite:

```bash
python backend/test_rag.py
```

Tests include:
1. Document ingestion & chunking
2. Index statistics
3. Semantic retrieval
4. RAG generation (requires Ollama)
5. Full agent orchestration (requires Ollama)

## Configuration

### Model Selection

Edit `embed.py`:
```python
MODEL_NAME = "all-MiniLM-L6-v2"  # Fast & lightweight (default)
# Other options: "all-mpnet-base-v2", "distiluse-base-multilingual-cased-v2"
```

### Chunk Settings

Edit `embed.py`:
```python
CHUNK_SIZE = 250        # Target words per chunk
CHUNK_OVERLAP = 50      # Overlapping words between chunks
```

### Retrieval Count

```python
# Default: retrieve top-3 chunks
rag_pipeline.set_chunk_count(5)  # Change to top-5
```

### LLM Model

```bash
# Use different Ollama model
ollama pull llama2
# Then update main.py or RAGPipeline initialization
```

## Performance

### Benchmarks

| Operation | Time | Notes |
|-----------|------|-------|
| Document embedding | 0.1-0.3s | Per document (not first run) |
| Query embedding | 0.05s | Fast single query |
| FAISS search | 0.01s | Vector similarity search |
| LLM generation | 10-30s | Depends on response length |
| **Total (simple RAG)** | **10-30s** | Dominated by LLM |

### Storage

- Model cache: ~80MB
- FAISS index: ~150 bytes per embedding
- Metadata: JSON in `./data/faiss_index/`

### Scaling

- Tested with 1000+ document chunks
- Supports millions of embeddings (hardware-dependent)
- Add GPU support via Ollama for faster inference

## Troubleshooting

### "Connection refused" (Ollama)

```bash
# Terminal 1: Start Ollama
ollama serve

# Terminal 2: Start backend
cd backend && python main.py
```

### "No documents indexed"

1. Check if documents uploaded: `curl http://localhost:8000/api/documents`
2. Upload test document: `curl -X POST ... -F "file=@test.txt"`
3. Verify chunks created: Check `/data/faiss_index/` directory

### Out of Memory

- Use smaller documents or shorter chunks
- Reduce `CHUNK_SIZE` in `embed.py`
- Clear index: `POST /api/clear-index`

### Slow First Run

- First embedding run loads the model (~2-3 seconds)
- Subsequent runs are fast
- Model cache is reused

## Directory Structure

```
backend/
├── main.py              # FastAPI application
├── embed.py             # Embedding & FAISS index management
├── rag.py              # RAG pipeline & agent orchestration
├── test_rag.py         # Test suite
├── requirements.txt    # Python dependencies
└── data/               # (Auto-created)
    └── faiss_index/
        ├── faiss.index      # Binary FAISS index
        └── metadata.json    # Document metadata
```

## Integration with Frontend

### Setup CORS

Already configured in `main.py` to accept requests from any origin.

### Example Frontend Request

```javascript
const response = await fetch('http://localhost:8000/api/research', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'What are the main findings?',
    use_full_orchestration: false
  })
});

const data = await response.json();
console.log(data.answer);
```

## Advanced Usage

### Custom Document Metadata

```python
from embed import embedding_manager

embedding_manager.add_document(
    text="...",
    doc_id="doc_2024_001",
    metadata={
        "source": "IEEE",
        "date": "2024-01-15",
        "author": "Jane Doe",
        "category": "ML"
    }
)
```

### Batch Processing

```python
from rag import rag_pipeline

queries = ["Q1?", "Q2?", "Q3?"]
results = rag_pipeline.batch_generate(queries)

for result in results:
    print(f"Q: {result['query']}")
    print(f"A: {result['answer']}\n")
```

### Programmatic Testing

```python
from embed import retrieve_relevant_chunks
from rag import rag_pipeline

# Upload documents
from embed import embed_and_add_document
embed_and_add_document(text, "doc1", {})

# Test retrieval
chunks = retrieve_relevant_chunks("my query", top_k=3)
for chunk in chunks:
    print(chunk["text"])

# Test RAG
result = rag_pipeline.generate("my query")
print(result["answer"])
```

## Next Steps

- [ ] Database persistence (PostgreSQL)
- [ ] User authentication & sessions
- [ ] Conversation history
- [ ] Multi-model support (GPT, Claude, etc.)
- [ ] Advanced retrieval (re-ranking, fusion)
- [ ] Document versioning
- [ ] Analytics & monitoring
- [ ] Rate limiting & quotas

## Performance Optimization

### For Faster Queries
- Use CPU FAISS: `faiss-cpu` (already installed)
- For GPU: Install `faiss-gpu`
- Reduce `CHUNK_SIZE` for faster embeddings

### For Better Accuracy
- Use larger model: `all-mpnet-base-v2`
- Increase `top_k` in retrieval (slower but more context)
- Fine-tune embeddings on domain data

## License

MIT

## Support

See `/docs` for API documentation or check GitHub issues.

---

**Version**: 2.0.0 (RAG Implementation)  
**Last Updated**: 2024-04-08  
**Status**: Production-Ready
