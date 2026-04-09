"""
Embeddings Module for AutoResearch AI
Handles document embedding, chunking, and FAISS index management
"""

import os
import json
import pickle
import hashlib
from typing import List, Tuple, Dict
from pathlib import Path
import numpy as np
import torch
from sentence_transformers import SentenceTransformer
import faiss

# Constants
MODEL_NAME = "all-MiniLM-L6-v2"  # Lightweight, fast embeddings
EMBEDDING_DIM = 384  # Dimension of all-MiniLM-L6-v2
CHUNK_SIZE = 250  # Words per chunk
CHUNK_OVERLAP = 50  # Overlapping words between chunks
INDEX_DIR = Path("./data/faiss_index")
METADATA_FILE = INDEX_DIR / "metadata.json"
CACHE_FILE = INDEX_DIR / "embeddings_cache.pkl"

class EmbeddingManager:
    """Manages document embeddings and FAISS index"""
    
    def __init__(self):
        """Initialize embedding model and load/create FAISS index"""
        # Explicitly detect and assign the GPU if available (specifically for RTX series)
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Initializing Embedding Engine on device: {self.device.upper()}")
        self.model = SentenceTransformer(MODEL_NAME, device=self.device)
        self.index = None
        self.metadata = {}
        self.embeddings_cache = {}
        
        # Create data directory if needed
        INDEX_DIR.mkdir(parents=True, exist_ok=True)
        
        # Load existing index or create new
        self._load_or_create_index()
    
    def _load_or_create_index(self):
        """Load existing FAISS index or create new one"""
        index_path = INDEX_DIR / "faiss.index"
        
        if index_path.exists() and METADATA_FILE.exists():
            print(f"Loading existing FAISS index from {index_path}")
            self.index = faiss.read_index(str(index_path))
            with open(METADATA_FILE, 'r') as f:
                self.metadata = json.load(f)
        else:
            print("Creating new FAISS index")
            self.index = faiss.IndexFlatL2(EMBEDDING_DIM)
            self.metadata = {"documents": [], "chunks": []}
    
    def chunk_text(self, text: str, doc_id: str) -> List[Dict]:
        """
        Split document into overlapping chunks of 200-300 words
        Preserves paragraph structure
        
        Returns: List of chunk dicts with text, doc_id, and position
        """
        # Split by paragraphs first
        paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
        
        chunks = []
        current_chunk = []
        word_count = 0
        chunk_num = 0
        
        for para in paragraphs:
            words = para.split()
            
            # Add paragraph to current chunk
            for word in words:
                current_chunk.append(word)
                word_count += 1
                
                # When chunk reaches ideal size, save it
                if word_count >= CHUNK_SIZE:
                    chunk_text = ' '.join(current_chunk)
                    chunks.append({
                        "text": chunk_text,
                        "doc_id": doc_id,
                        "chunk_id": f"{doc_id}_chunk_{chunk_num}",
                        "word_count": word_count
                    })
                    
                    # Create overlap: keep last CHUNK_OVERLAP words
                    overlap_words = CHUNK_OVERLAP
                    if len(current_chunk) > overlap_words:
                        current_chunk = current_chunk[-overlap_words:]
                        word_count = overlap_words
                    else:
                        current_chunk = []
                        word_count = 0
                    
                    chunk_num += 1
            
            # Add paragraph break for structure
            current_chunk.append("\n")
        
        # Save remaining chunk
        if len(current_chunk) > 10:  # Only if significant
            chunk_text = ' '.join(current_chunk)
            chunks.append({
                "text": chunk_text,
                "doc_id": doc_id,
                "chunk_id": f"{doc_id}_chunk_{chunk_num}",
                "word_count": len(chunk_text.split())
            })
        
        return chunks
    
    def _compute_file_hash(self, content: str) -> str:
        """Compute hash of document content for caching"""
        return hashlib.md5(content.encode()).hexdigest()
    
    def add_document(self, text: str, doc_id: str, metadata: Dict = None) -> int:
        """
        Add document to RAG system
        
        Args:
            text: Document content
            doc_id: Unique document identifier
            metadata: Optional metadata dict (filename, source, etc.)
        
        Returns:
            Number of chunks added
        """
        # Check if document already indexed
        if doc_id in [d.get("id") for d in self.metadata.get("documents", [])]:
            print(f"Document {doc_id} already indexed, skipping")
            return 0
        
        # Chunk the document
        chunks = self.chunk_text(text, doc_id)
        
        if not chunks:
            print(f"No chunks created for {doc_id}")
            return 0
        
        # Embed chunks
        chunk_texts = [c["text"] for c in chunks]
        embeddings = self.model.encode(chunk_texts, show_progress_bar=True)
        embeddings = np.array(embeddings).astype('float32')
        
        # Add to FAISS index
        self.index.add(embeddings)
        
        # Store metadata
        for i, chunk in enumerate(chunks):
            self.metadata.setdefault("chunks", []).append({
                "chunk_id": chunk["chunk_id"],
                "doc_id": doc_id,
                "text": chunk["text"],
                "word_count": chunk["word_count"],
                "index_position": len(self.metadata.get("chunks", []))
            })
        
        # Store document metadata
        self.metadata.setdefault("documents", []).append({
            "id": doc_id,
            "chunks_count": len(chunks),
            "metadata": metadata or {},
            "content_hash": self._compute_file_hash(text)
        })
        
        # Save updated index and metadata
        self._save_index()
        
        print(f"Added {len(chunks)} chunks from document {doc_id}")
        return len(chunks)
    
    def query(self, query_text: str, top_k: int = 3, doc_ids: List[str] = None) -> List[Dict]:
        """
        Retrieve top-k most relevant chunks for a query, optionally filtered by doc_ids
        """
        if len(self.metadata.get("chunks", [])) == 0:
            print("No documents indexed yet")
            return []
        
        # Embed query
        query_embedding = self.model.encode([query_text])[0].astype('float32').reshape(1, -1)
        
        # Search FAISS index (search more than top_k initially to allow for filtering)
        search_k = max(top_k * 5, 50) 
        distances, indices = self.index.search(query_embedding, min(search_k, len(self.metadata["chunks"])))
        
        # Retrieve and Filter chunks
        results = []
        for idx, distance in zip(indices[0], distances[0]):
            if idx < len(self.metadata["chunks"]):
                chunk_meta = self.metadata["chunks"][idx]
                
                # STRICT FILTER: Only include if doc_id matches selected documents
                if doc_ids and chunk_meta["doc_id"] not in doc_ids:
                    continue
                    
                results.append({
                    "text": chunk_meta["text"],
                    "doc_id": chunk_meta["doc_id"],
                    "chunk_id": chunk_meta["chunk_id"],
                    "similarity_score": 1 / (1 + float(distance)),
                    "word_count": chunk_meta["word_count"]
                })
                
                if len(results) >= top_k:
                    break
        
        return results
    
    def _save_index(self):
        """Save FAISS index and metadata to disk"""
        index_path = INDEX_DIR / "faiss.index"
        faiss.write_index(self.index, str(index_path))
        
        with open(METADATA_FILE, 'w') as f:
            json.dump(self.metadata, f, indent=2)
        
        print(f"Index saved to {index_path}")
    
    def get_stats(self) -> Dict:
        """Get index statistics"""
        return {
            "total_documents": len(self.metadata.get("documents", [])),
            "total_chunks": len(self.metadata.get("chunks", [])),
            "index_size": self.index.ntotal if self.index else 0,
            "embedding_model": MODEL_NAME,
            "embedding_dimension": EMBEDDING_DIM
        }
    
    def clear_index(self):
        """Clear all indexed data"""
        self.index = faiss.IndexFlatL2(EMBEDDING_DIM)
        self.metadata = {"documents": [], "chunks": []}
        self._save_index()
        print("Index cleared")


# Global instance
embedding_manager = EmbeddingManager()


def embed_and_add_document(text: str, doc_id: str, metadata: Dict = None) -> int:
    """Utility function to add document"""
    return embedding_manager.add_document(text, doc_id, metadata)


def retrieve_relevant_chunks(query: str, top_k: int = 3, doc_ids: List[str] = None) -> List[Dict]:
    """Utility function to retrieve chunks with doc filtering"""
    return embedding_manager.query(query, top_k, doc_ids)


def get_embedding_stats() -> Dict:
    """Utility function to get stats"""
    return embedding_manager.get_stats()
