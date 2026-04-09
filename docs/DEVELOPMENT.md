# Development Guide - AutoResearch AI v2

This guide covers extending and customizing the AutoResearch AI system.

## Codebase Overview

### Directory Structure

```
MultiAgentsSystem/
├── app/                          # Next.js frontend
│   ├── dashboard/page.tsx       # Research dashboard
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── backend/                      # FastAPI backend
│   ├── main.py                  # API server
│   ├── embed.py                 # Embedding & indexing
│   ├── rag.py                   # RAG & agents
│   ├── test_rag.py              # Test suite
│   ├── requirements.txt          # Dependencies
│   └── data/                    # Generated data
│       └── faiss_index/         # Vector DB (auto-created)
├── package.json                 # Node.js dependencies
└── README.md                    # Project documentation
```

## Adding Custom Agents

### Creating a New Agent

Example: Add a "Sources" agent that tracks document sources

```python
# In backend/rag.py, add:

class SourceTrackerAgent:
    """Tracks and reports document sources"""
    
    def __init__(self):
        from embed import embedding_manager
        self.manager = embedding_manager
    
    def get_sources(self, query: str) -> List[Dict]:
        """Get all documents related to query"""
        from embed import retrieve_relevant_chunks
        
        chunks = retrieve_relevant_chunks(query, top_k=10)
        
        sources = {}
        for chunk in chunks:
            doc_id = chunk["doc_id"]
            if doc_id not in sources:
                # Find document metadata
                for doc in self.manager.metadata.get("documents", []):
                    if doc["id"] == doc_id:
                        sources[doc_id] = {
                            "name": doc["id"],
                            "chunks": 0,
                            "metadata": doc.get("metadata", {})
                        }
                        break
            
            if doc_id in sources:
                sources[doc_id]["chunks"] += 1
        
        return list(sources.values())
```

### Integrating into Orchestrator

```python
# Add to ResearchOrchestrator class

class ResearchOrchestrator:
    def __init__(self, ...):
        # ... existing code ...
        self.source_tracker = SourceTrackerAgent()
    
    def orchestrate_with_sources(self, query: str) -> Dict:
        # ... existing workflow ...
        
        # After writing report, get sources
        print("6. SOURCE TRACKER AGENT: Identifying sources...")
        sources = self.source_tracker.get_sources(query)
        
        return {
            # ... existing fields ...
            "sources": sources
        }
```

## Extending Embeddings

### Custom Chunking Strategy

```python
# In backend/embed.py, add:

def chunk_by_sentences(text: str, sentences_per_chunk: int = 5) -> List[str]:
    """Alternative chunking by sentences instead of words"""
    import re
    
    # Split sentences
    sentences = re.split(r'(?<=[.!?])\s+', text)
    
    chunks = []
    for i in range(0, len(sentences), sentences_per_chunk):
        chunk = ' '.join(sentences[i:i+sentences_per_chunk])
        if chunk.strip():
            chunks.append(chunk)
    
    return chunks

# Use in EmbeddingManager:
class EmbeddingManager:
    def chunk_text_by_sentences(self, text: str, doc_id: str):
        # Implementation using chunk_by_sentences
        pass
```

### Custom Embedding Model

```python
# In backend/embed.py, make MODEL_NAME configurable:

class EmbeddingManager:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)
        self.embedding_dim = self.model.get_sentence_embedding_dimension()
        self.index = faiss.IndexFlatL2(self.embedding_dim)
```

## Advanced RAG Features

### Re-ranking Results

```python
# In backend/rag.py, add:

from sentence_transformers import CrossEncoder

class AdvancedRAGPipeline(RAGPipeline):
    def __init__(self, ...):
        super().__init__(...)
        self.reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-12-v2')
    
    def _retrieve_context(self, query: str) -> str:
        """Retrieve with re-ranking"""
        chunks = retrieve_relevant_chunks(query, top_k=10)  # Get more initially
        
        # Re-rank
        texts = [c["text"] for c in chunks]
        scores = self.reranker.predict([[query, text] for text in texts])
        
        # Sort and take top-3
        ranked = sorted(zip(chunks, scores), key=lambda x: x[1], reverse=True)
        top_chunks = [c for c, s in ranked[:3]]
        
        # Format as before...
        return context
```

### Conversation History

```python
# Add to rag.py:

class ConversationalRAG(RAGPipeline):
    def __init__(self, ...):
        super().__init__(...)
        self.conversation_history = []
    
    def generate_with_history(self, query: str) -> Dict:
        """Generate response considering conversation history"""
        # Build context from conversation
        history_context = "\n".join([
            f"Q: {msg['query']}\nA: {msg['answer'][:200]}"
            for msg in self.conversation_history[-3:]  # Last 3 messages
        ])
        
        # Modify prompt to include history
        context = self._retrieve_context(query)
        prompt = f"""Previous conversation:
{history_context}

New question: {query}

{context}

Please provide answer considering the conversation history..."""
        
        # Generate and store
        answer = self._call_ollama(prompt)
        
        self.conversation_history.append({
            "query": query,
            "answer": answer
        })
        
        return {
            "query": query,
            "answer": answer,
            "history_length": len(self.conversation_history)
        }
```

## Frontend Integration

### Connecting to Backend

In `app/dashboard/page.tsx`:

```typescript
'use client';

import { useState } from 'react';

export default function Dashboard() {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResearch = async (query: string, fullMode: boolean) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          use_full_orchestration: fullMode
        })
      });
      
      const data = await res.json();
      setResponse(data.answer || data.final_report);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Dashboard UI */}
    </div>
  );
}
```

### Upload Endpoint Integration

```typescript
async function uploadDocument(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('http://localhost:8000/api/upload', {
    method: 'POST',
    body: formData
  });
  
  const data = await response.json();
  console.log(`Added ${data.chunks_added} chunks from ${data.filename}`);
}
```

## Testing & Quality Assurance

### Unit Tests

Create `backend/test_embed.py`:

```python
import pytest
from embed import EmbeddingManager

class TestEmbeddingManager:
    @pytest.fixture
    def manager(self):
        return EmbeddingManager()
    
    def test_chunking(self, manager):
        text = "Word " * 100  # 100 words
        chunks = manager.chunk_text(text, "test_doc")
        assert len(chunks) > 0
        assert all(50 < len(c["text"].split()) < 500 for c in chunks)
    
    def test_embedding_dimension(self, manager):
        assert manager.model.get_sentence_embedding_dimension() == 384
```

### Integration Tests

```python
def test_full_pipeline():
    # Upload document
    text = "Test document content..."
    chunks_added = embed_and_add_document(text, "test", {})
    assert chunks_added > 0
    
    # Retrieve
    results = retrieve_relevant_chunks("test query", top_k=3)
    assert len(results) > 0
    
    # Generate (with mock if Ollama unavailable)
    # response = rag_pipeline.generate("test query")
    # assert "test" in response["answer"].lower()
```

## Performance Optimization

### Caching

```python
# Add to embed.py:

from functools import lru_cache

class CachedEmbeddingManager(EmbeddingManager):
    @lru_cache(maxsize=1000)
    def encode(self, text: str):
        """Cache embeddings to avoid recomputation"""
        return self.model.encode(text)
```

### Batch Processing

```python
# Optimize multiple uploads:

import asyncio

async def batch_upload_documents(files: List[UploadFile]):
    tasks = [process_single_document(f) for f in files]
    return await asyncio.gather(*tasks)
```

### Database Backend

```python
# Add persistence with PostgreSQL:

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://user:password@localhost/autoresearch"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

class DocumentRecord(Base):
    __tablename__ = "documents"
    id = Column(String, primary_key=True)
    content = Column(Text)
    chunks_count = Column(Integer)
    created_at = Column(DateTime)
```

## Monitoring & Logging

### Enhanced Logging

```python
# In main.py:

import logging
from pythonjsonlogger import jsonlogger

# JSON logging for production
logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)
logger.addHandler(logHandler)

@app.middleware("http")
async def log_requests(request, call_next):
    logger.info({
        "method": request.method,
        "path": request.url.path,
        "user_agent": request.headers.get("user-agent")
    })
    response = await call_next(request)
    return response
```

### Metrics

```python
# Track performance:

from prometheus_client import Counter, Histogram

research_requests = Counter('research_requests_total', 'Total research requests')
research_latency = Histogram('research_latency_seconds', 'Research latency')

@app.post("/api/research")
async def research_query(request):
    research_requests.inc()
    
    with research_latency.time():
        # ... existing code ...
```

## Deployment Considerations

### Docker Setup

Create `Dockerfile`:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ .

CMD ["python", "main.py"]
```

### Environment Variables

Create `.env`:

```
OLLAMA_BASE_URL=http://ollama:11434
MODEL=mistral
CHUNK_SIZE=250
CHUNK_OVERLAP=50
```

Load in `main.py`:

```python
from dotenv import load_dotenv
import os

load_dotenv()

OLLAMA_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
```

## Contributing Guidelines

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Write tests for new functionality
4. Ensure all tests pass: `pytest backend/`
5. Update documentation
6. Submit pull request

## Resources

- **SentenceTransformers Docs**: https://www.sbert.net/
- **FAISS Guide**: https://github.com/facebookresearch/faiss/wiki
- **FastAPI**: https://fastapi.tiangolo.com/
- **Ollama**: https://ollama.ai/

---

Happy developing! 🚀
