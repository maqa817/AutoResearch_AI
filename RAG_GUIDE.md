# RAG Pipeline Implementation Guide

## Overview

AutoResearch AI v2 now features a production-ready **Retrieval Augmented Generation (RAG)** pipeline with:

- **Semantic Chunking**: 200-300 word chunks with overlap preservation
- **FAISS Vector DB**: Fast, local semantic search
- **SentenceTransformers**: Lightweight embeddings (all-MiniLM-L6-v2)
- **Smart Retrieval**: Top-3 most relevant chunks per query
- **Caching**: Efficient embedding reuse

## Architecture

```
Document Upload
    ↓
Text Extraction (.txt, .pdf)
    ↓
Semantic Chunking (200-300 words)
    ↓
SentenceTransformers Embedding
    ↓
FAISS Vector Index
    ↓
Persistent Storage (./data/faiss_index/)
    ↓
Query → Embedding → Semantic Search
    ↓
Retrieved Chunks → LLM Prompt Injection
    ↓
Generated Response (Context-Aware)
```

## Module Descriptions

### 1. embed.py - Embedding & Indexing

**Key Class: `EmbeddingManager`**

- Handles document chunking with overlap
- Manages FAISS vector index
- Stores metadata for retrieval
- Persists to disk

**Key Functions:**
```python
embed_and_add_document(text, doc_id, metadata)  # Add document
retrieve_relevant_chunks(query, top_k=3)        # Search index
get_embedding_stats()                            # Get stats
```

**Features:**
- Automatic paragraph-aware chunking
- Overlap preservation (50-word overlap)
- Content hash-based deduplication
- Metadata preservation

### 2. rag.py - RAG & Orchestration

**Key Classes:**

1. **`RAGPipeline`** - Simple RAG retrieval + generation
   - Retrieves relevant chunks
   - Builds context-aware prompts
   - Calls Ollama for generation

2. **`ResearchOrchestrator`** - Full 5-agent workflow
   - Planner: Breaks down query
   - Researcher: Finds information
   - Analyst: Synthesizes findings
   - Writer: Generates report
   - Critic: Reviews quality

**Key Methods:**
```python
rag_pipeline.generate(query)                     # Simple RAG
research_orchestrator.orchestrate_full_research() # All 5 agents
```

### 3. main.py - FastAPI Backend

**New Endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check with stats |
| `/api/stats` | GET | Detailed index statistics |
| `/api/upload` | POST | Upload & index documents |
| `/api/research` | POST | Research query (RAG or full) |
| `/api/batch-research` | POST | Multiple queries |
| `/api/documents` | GET | List indexed documents |
| `/api/clear-index` | POST | Reset index |

## Setup & Installation

### Prerequisites

```bash
# Python 3.10+
python --version

# Ollama installed and running
ollama serve  # In separate terminal

# Pull a model
ollama pull mistral
```

### Install Backend Dependencies

```bash
cd backend/
pip install -r requirements.txt
```

### Start Backend

```bash
python main.py
```

Server runs at `http://localhost:8000`
Docs available at `http://localhost:8000/docs`

## Usage Examples

### 1. Upload Document

```bash
curl -X POST "http://localhost:8000/api/upload" \
  -H "accept: application/json" \
  -F "file=@research_paper.txt"
```

**Response:**
```json
{
  "filename": "research_paper.txt",
  "size": 45287,
  "chunks_added": 18,
  "status": "indexed"
}
```

### 2. Simple RAG Query

```bash
curl -X POST "http://localhost:8000/api/research" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the main findings?",
    "use_full_orchestration": false
  }'
```

**Response:**
```json
{
  "query": "What are the main findings?",
  "answer": "Based on the provided documents, the main findings are...",
  "chunks_retrieved": 3,
  "model": "mistral",
  "mode": "simple_rag"
}
```

### 3. Full Multi-Agent Research

```bash
curl -X POST "http://localhost:8000/api/research" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Summarize the research findings",
    "use_full_orchestration": true
  }'
```

**Response:**
```json
{
  "query": "Summarize the research findings",
  "status": "completed",
  "agents_involved": ["Planner", "Researcher", "Analyst", "Writer", "Critic"],
  "final_report": "Professional research report with all sections...",
  "mode": "full_orchestration"
}
```

### 4. Batch Processing

```bash
curl -X POST "http://localhost:8000/api/batch-research" \
  -H "Content-Type: application/json" \
  -d '[
    "What is the main topic?",
    "Who are the key authors?",
    "What are the conclusions?"
  ]'
```

### 5. Check Statistics

```bash
curl "http://localhost:8000/api/stats"
```

**Response:**
```json
{
  "status": "ok",
  "stats": {
    "total_documents": 3,
    "total_chunks": 45,
    "index_size": 45,
    "embedding_model": "all-MiniLM-L6-v2",
    "embedding_dimension": 384
  }
}
```

## Chunking Strategy

### How it Works

1. **Paragraph Splitting**: Splits by `\n\n` to preserve structure
2. **Word Counting**: Aims for 200-300 words per chunk
3. **Overlap**: Maintains 50-word overlap between chunks
4. **Boundaries**: Respects paragraph boundaries

### Example

**Input Document:**
```
Machine learning is a subset of AI.
It focuses on learning from data.

There are three main types:
Supervised, Unsupervised, Reinforcement.

Supervised learning uses labeled data...
```

**Output Chunks:**
```
Chunk 1 (200 words):
"Machine learning is a subset of AI. It focuses on learning from data.
There are three main types: Supervised, Unsupervised, Reinforcement.
Supervised learning uses labeled data..."

Chunk 2 (250 words):  
"Supervised learning uses labeled data... [continues with 50-word overlap]"
```

## Retrieval Process

### Query Embedding & Search

1. **User Query**: "What are the main types of learning?"

2. **Embedding**: Query converted to 384-dim vector via SentenceTransformers

3. **FAISS Search**: L2 distance search for top-3 similar chunks

4. **Distance → Similarity**: `similarity = 1 / (1 + distance)`

5. **Results**: Chunks ranked by relevance score

### Prompt Injection

Retrieved context is injected into LLM prompt:

```
You are an expert research assistant...

RELEVANT DOCUMENTS:

[Document 1 - Relevance: 0.92]
Machine learning has three main types...

[Document 2 - Relevance: 0.88]
Supervised learning uses labeled data...

[Document 3 - Relevance: 0.81]
Neural networks are commonly used...

INSTRUCTIONS:
- Answer ONLY based on documents
- If not found, say so
- Be concise and accurate

USER QUESTION: What are the main types of learning?

ANSWER:
```

## Performance Characteristics

### Embedding Time
- First document: ~2-3 seconds (model loading)
- Subsequent documents: ~0.1-0.3s per document

### Query Time
- Embedding query: ~0.05s
- FAISS search: ~0.01s
- LLM generation: ~10-30s (depending on response length)

### Storage
- Model cache: ~80MB (all-MiniLM-L6-v2)
- FAISS index: ~150 bytes per embedding (384-dim)
- Metadata: JSON storage in `./data/faiss_index/`

## Configuration

### Model Selection

Edit `embed.py`:
```python
MODEL_NAME = "all-MiniLM-L6-v2"  # Fast & accurate
# Other options:
# - "all-mpnet-base-v2" (larger, slower)
# - "distiluse-base-multilingual-cased-v2"
```

### Chunk Size

Edit `embed.py`:
```python
CHUNK_SIZE = 250      # Target words per chunk
CHUNK_OVERLAP = 50    # Overlap words
```

### Retrieval Count

Edit `rag.py`:
```python
self.chunk_count = 3  # Number of chunks to retrieve
```

Or via API:
```python
rag_pipeline.set_chunk_count(5)
```

## Troubleshooting

### "Cannot connect to Ollama"
```bash
# Terminal 1: Start Ollama
ollama serve

# Terminal 2: Start backend
cd backend/
python main.py
```

### "No relevant documents found"
- Upload documents first
- Check `/api/stats` to verify documents are indexed
- Query should match document content

### "FAISS index is empty"
```bash
# Reset and rebuild
curl -X POST "http://localhost:8000/api/clear-index"

# Then upload documents again
curl -X POST "http://localhost:8000/api/upload" \
  -F "file=@document.txt"
```

### Slow embeddings
- First run embeds the model (~2-3s) - this is normal
- Ensure sufficient disk space for FAISS index
- Consider using smaller documents

## Advanced Usage

### Custom Chunk Processing

```python
from embed import embedding_manager

# Add with custom metadata
embedding_manager.add_document(
    text="...",
    doc_id="research_2024_01",
    metadata={
        "source": "IEEE",
        "date": "2024-01-15",
        "author": "John Doe"
    }
)
```

### Fine-tuning Retrieval

```python
from rag import rag_pipeline

# Get top-5 chunks instead of 3
rag_pipeline.set_chunk_count(5)

# Generate response
result = rag_pipeline.generate("your query")
```

### Batch Processing

```python
from rag import rag_pipeline

queries = [
    "What is the main finding?",
    "Who conducted the research?",
    "What are the limitations?"
]

results = rag_pipeline.batch_generate(queries)
for result in results:
    print(f"Q: {result['query']}")
    print(f"A: {result['answer']}\n")
```

## Next Steps

- Integrate with frontend
- Add user authentication
- Implement conversation history
- Add database persistence
- Enable multi-model support
- Add re-ranking for better retrieval

---

**Version**: 2.0.0 RAG Implementation
**Last Updated**: 2024-04-08
