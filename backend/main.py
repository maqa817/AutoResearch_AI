"""
AutoResearch AI Backend - Version 2
RAG-powered multi-agent research system with semantic retrieval
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import uvicorn
import logging
from pathlib import Path
import PyPDF2

# Import RAG and embedding modules
from embed import embed_and_add_document, get_embedding_stats, embedding_manager
from rag import generate_with_rag, run_full_research

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AutoResearch AI v2",
    description="RAG-powered Multi-Agent Research & Analysis System",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============== Request/Response Models ==============

class QueryRequest(BaseModel):
    """Request model for research queries"""
    query: str
    use_full_orchestration: bool = False  # Use all 5 agents vs simple RAG

class SimpleRAGResponse(BaseModel):
    """Response for simple RAG query"""
    query: str
    answer: str
    chunks_retrieved: int

class FullResearchResponse(BaseModel):
    """Response for full multi-agent research"""
    query: str
    status: str
    agents_involved: List[str]
    final_report: str

class IndexStatsResponse(BaseModel):
    """Response for index statistics"""
    total_documents: int
    total_chunks: int
    index_size: int
    embedding_model: str
    embedding_dimension: int

class UploadResponse(BaseModel):
    """Response for document upload"""
    filename: str
    size: int
    chunks_added: int
    status: str

# ============== Health & Stats Endpoints ==============

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    stats = get_embedding_stats()
    return {
        "status": "healthy",
        "service": "AutoResearch AI v2",
        "indexed_documents": stats["total_documents"],
        "indexed_chunks": stats["total_chunks"]
    }

@app.get("/api/stats")
async def get_stats():
    """Get RAG system statistics"""
    stats = get_embedding_stats()
    return {
        "status": "ok",
        "stats": {
            "total_documents": stats["total_documents"],
            "total_chunks": stats["total_chunks"],
            "index_size": stats["index_size"],
            "embedding_model": stats["embedding_model"],
            "embedding_dimension": stats["embedding_dimension"]
        }
    }

# ============== Document Upload ==============

@app.post("/api/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """
    Upload and index a document
    
    Supports: .txt, .pdf
    Automatically chunks and embeds content
    """
    try:
        contents = await file.read()
        
        if not contents:
            raise HTTPException(status_code=400, detail="File is empty")
        
        # Extract text based on file type
        text_content = ""
        if file.filename.endswith('.txt'):
            text_content = contents.decode('utf-8')
        elif file.filename.endswith('.pdf'):
            text_content = _extract_pdf_text(contents)
        else:
            raise HTTPException(status_code=400, detail="Only .txt and .pdf files supported")
        
        # Embed and add to index
        doc_id = file.filename.replace('.', '_').replace('/', '_')
        chunks_added = embed_and_add_document(
            text_content,
            doc_id,
            {"filename": file.filename, "size": len(contents)}
        )
        
        return UploadResponse(
            filename=file.filename,
            size=len(contents),
            chunks_added=chunks_added,
            status="indexed"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

# ============== Research Endpoints ==============

@app.post("/api/research")
async def research_query(request: QueryRequest):
    """
    Main research endpoint
    
    Two modes:
    1. simple_rag: Fast RAG-based answer
    2. full_orchestration: Multi-agent workflow
    """
    try:
        if request.use_full_orchestration:
            # Full multi-agent workflow
            logger.info(f"Starting full research orchestration for: {request.query}")
            result = run_full_research(request.query)
            return {
                "query": request.query,
                "status": result["status"],
                "agents_involved": result["agents_involved"],
                "final_report": result["final_report"],
                "mode": "full_orchestration"
            }
        else:
            # Simple RAG
            logger.info(f"Starting RAG query for: {request.query}")
            result = generate_with_rag(request.query)
            return {
                "query": request.query,
                "answer": result["answer"],
                "chunks_retrieved": result["chunks_retrieved"],
                "model": result["model"],
                "mode": "simple_rag"
            }
    
    except Exception as e:
        logger.error(f"Research error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Research failed: {str(e)}")

@app.post("/api/batch-research")
async def batch_research(queries: List[str]):
    """
    Process multiple queries at once
    """
    try:
        from rag import rag_pipeline
        results = rag_pipeline.batch_generate(queries)
        return {
            "status": "success",
            "total_queries": len(queries),
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============== Index Management ==============

@app.post("/api/clear-index")
async def clear_index():
    """Clear all indexed documents"""
    try:
        embedding_manager.clear_index()
        return {"status": "cleared", "message": "All indexed documents cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/documents")
async def list_documents():
    """List all indexed documents"""
    stats = get_embedding_stats()
    documents = embedding_manager.metadata.get("documents", [])
    return {
        "status": "ok",
        "count": len(documents),
        "documents": [
            {
                "id": doc["id"],
                "chunks": doc["chunks_count"],
                "metadata": doc.get("metadata", {})
            }
            for doc in documents
        ]
    }

# ============== Utility Functions ==============

def _extract_pdf_text(pdf_bytes: bytes) -> str:
    """Extract text from PDF file"""
    from io import BytesIO
    
    pdf_reader = PyPDF2.PdfReader(BytesIO(pdf_bytes))
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() + "\n"
    return text

# ============== Startup & Shutdown ==============

@app.on_event("startup")
async def startup_event():
    """Initialize on startup"""
    logger.info("AutoResearch AI v2 starting up")
    stats = get_embedding_stats()
    logger.info(f"Loaded {stats['total_documents']} documents with {stats['total_chunks']} chunks")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("AutoResearch AI v2 shutting down")

# ============== Root Endpoint ==============

@app.get("/")
async def root():
    """API documentation"""
    return {
        "service": "AutoResearch AI v2",
        "version": "2.0.0",
        "endpoints": {
            "health": "GET /health",
            "stats": "GET /api/stats",
            "upload": "POST /api/upload",
            "research": "POST /api/research",
            "batch_research": "POST /api/batch-research",
            "documents": "GET /api/documents",
            "clear_index": "POST /api/clear-index"
        },
        "documentation": "http://localhost:8000/docs"
    }

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
