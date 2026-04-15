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
    # Common words to ignore for better filtering
    STOP_WORDS = {"is", "the", "a", "an", "what", "how", "how", "to", "in", "on", "at", "for", "with", "and", "or", "of", "about"}
    keywords = [kw for kw in question.lower().split() if kw not in STOP_WORDS and len(kw) > 2]
    
    if not keywords:
        return []

    results = []
    for doc in CORPUS:
        doc_lower = doc.lower()
        # Score based on how many keywords match and their frequency
        score = 0
        for kw in keywords:
            count = doc_lower.count(kw)
            if count > 0:
                score += count + 5  # Give bonus for presence
        
        if score > 5:  # Minimum threshold to avoid weak matches
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
        return {
            "answer": "### Research Status: Incomplete\n\nThe system could not find specific technical documentation or data matching your query in the current knowledge base.\n\n**Recommendation:** \n- Try asking about 'Architecture', 'ROI', 'Tech Stack', or 'Roadmap'.\n- Ensure technical terms are correctly spelled.", 
            "sources_found": 0
        }
    
    # Simulating a more advanced "Report Synthesis"
    primary_match = matches[0]
    
    answer = f"### [SYSTEM ANALYSIS REPORT]\n\n"
    answer += f"**Executive Summary:** Based on the current dataset, I have analyzed the relevant documentation regarding your query. The analysis focuses on technical feasibility and core architectural principles.\n\n"
    
    answer += f"**Key Insights and Detailed Findings:**\n"
    for i, match in enumerate(matches, 1):
        # Format the match nicely
        lines = match.split('\n')
        title = lines[0] if lines else "Information Block"
        content = "\n".join(lines[1:6]) # Take top few lines of content
        answer += f"#### {i}. {title}\n{content}...\n\n"
    
    answer += f"---\n"
    answer += f"**[Demo Logic Notice]:** This response was synthesized using a keyword-weighted retrieval algorithm optimized for CPU environments. Full LLM logic (llama3) is available in the production GPU environment.\n\n"
    answer += f"**Data Confidence:** {'High' if len(matches) > 1 else 'Medium'}"
    
    return {"answer": answer, "sources_found": len(matches)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
