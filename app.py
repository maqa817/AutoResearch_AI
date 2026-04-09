"""
FastAPI backend for local AI question answering system.
"""
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List
import os
import shutil
from llm import get_answer

app = FastAPI(title="Local AI Q&A System")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure dataset directory exists
os.makedirs("dataset", exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")


class QuestionRequest(BaseModel):
    question: str


class AnswerResponse(BaseModel):
    question: str
    answer: str


@app.get("/")
async def root():
    """Serve index.html"""
    return FileResponse("static/index.html")


@app.post("/ask")
async def ask(request: QuestionRequest) -> AnswerResponse:
    """
    Main endpoint: takes a question, retrieves context from dataset,
    and returns an answer from the local LLM.
    """
    question = request.question.strip()
    
    if not question:
        return AnswerResponse(
            question=question,
            answer="Please provide a valid question."
        )
    
    # Get context from dataset files
    context = load_dataset_context()
    
    # Get answer from LLM
    answer = get_answer(question, context)
    
    return AnswerResponse(
        question=question,
        answer=answer
    )


@app.post("/research")
async def research(
    query: str = Form(...),
    documents: List[UploadFile] = File(None)
) -> AnswerResponse:
    """
    Research endpoint: handles file uploads and a query.
    """
    # Save uploaded documents to dataset folder
    if documents:
        for doc in documents:
            file_path = os.path.join("dataset", doc.filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(doc.file, buffer)
    
    # Get context from dataset files (including newly uploaded ones)
    context = load_dataset_context()
    
    # Get answer from LLM
    answer = get_answer(query, context)
    
    return AnswerResponse(
        question=query,
        answer=answer
    )


def load_dataset_context() -> str:
    """
    Load all .txt files from /dataset folder and concatenate them.
    """
    dataset_dir = "dataset"
    context = ""
    
    if not os.path.exists(dataset_dir):
        return "No dataset found. Please add .txt files to the dataset/ folder."
    
    txt_files = [f for f in os.listdir(dataset_dir) if f.endswith(".txt")]
    
    if not txt_files:
        return "No .txt files found in dataset/ folder."
    
    for filename in sorted(txt_files):
        filepath = os.path.join(dataset_dir, filename)
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
                context += f"\n--- {filename} ---\n{content}\n"
        except Exception as e:
            print(f"Error reading {filename}: {e}")
    
    return context


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
