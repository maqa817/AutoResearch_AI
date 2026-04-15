"""
AutoResearch AI - Ultra Minimal Demo Backend
DEPLOYMENT-STABLE MINIMAL VERSION
Only: FastAPI + CORS + Keyword Search
No LLM, No GPU, No Multi-Agent, No PDF
"""

import os
import glob
import logging
from typing import List
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AutoResearch AI Demo", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CORPUS = []

def load_dataset():
    global CORPUS
    dataset_dir = os.path.join(os.path.dirname(__file__), "dataset")
    CORPUS = []
    for filepath in glob.glob(os.path.join(dataset_dir, "*.txt")):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read().strip()
                if content:
                    CORPUS.append(content)
                    logger.info(f"Loaded: {os.path.basename(filepath)}")
        except Exception as e:
            logger.error(f"Failed to load {filepath}: {e}")
    logger.info(f"Total documents loaded: {len(CORPUS)}")

def search(question: str) -> List[str]:
    keywords = question.lower().split()
    results = []
    for doc in CORPUS:
        doc_lower = doc.lower()
        score = sum(1 for kw in keywords if kw in doc_lower)
        if score > 0:
            results.append((score, doc))
    results.sort(key=lambda x: x[0], reverse=True)
    return [doc for _, doc in results[:3]]

load_dataset()

class AskRequest(BaseModel):
    question: str

@app.get("/health")
async def health():
    return {"status": "ok", "mode": "demo-minimal"}

@app.post("/api/ask")
async def ask(request: AskRequest):
    matches = search(request.question)
    if not matches:
        return {"answer": "I could not find relevant information in the dataset.", "sources_found": 0}
    answer = "Based on the dataset, here is the relevant information:\n\n"
    for i, match in enumerate(matches, 1):
        excerpt = match[:300] + "..." if len(match) > 300 else match
        answer += f"{i}. {excerpt}\n\n"
    answer += "(Demo mode: keyword-based retrieval only)"
    return {"answer": answer, "sources_found": len(matches)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
