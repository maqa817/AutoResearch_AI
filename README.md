# AutoResearch AI - Multi-Agent Research System

## Overview

**AutoResearch AI** is an intelligent multi-agent system designed to automate research and report generation. It uses a team of specialized AI agents that work together to analyze documents, conduct research, synthesize findings, and generate comprehensive reports.

## Architecture

### System Components

```
Frontend (Next.js)
    ↓
API Routes
    ↓
Backend Services (FastAPI)
    ↓
AI Agents (5 specialized agents)
    ↓
Vector Database (FAISS)
    ↓
Document Storage
```

### Five Specialized Agents

1. **Planner Agent** - Breaks down complex research questions into actionable steps
2. **Researcher Agent** - Searches and analyzes documents to find relevant information
3. **Analyst Agent** - Synthesizes findings and identifies key insights and patterns
4. **Writer Agent** - Composes comprehensive, well-structured research reports
5. **Critic Agent** - Reviews and refines outputs for accuracy and quality assurance

## Version 1 Features

### Current Capabilities (v1.0)

- **Multi-Document Upload**: Support for text files and PDFs
- **Query Interface**: Simple yet powerful question-asking interface
- **AI-Powered Analysis**: Leverages open-source language models
- **Result Display**: Real-time analysis results and findings
- **Export Options**: Generate and export research reports

### Tech Stack (v1.0)

**Frontend:**
- Next.js 16+ (React 19)
- TypeScript
- Tailwind CSS
- Shadcn UI Components

**Backend:**
- FastAPI (Python)
- Ollama for local LLM inference
- FAISS for vector search
- Document processing pipeline

**Infrastructure:**
- Local inference (CPU/GPU optimized)
- No external API dependencies
- Fully self-contained deployment

## Installation & Setup

### Prerequisites

- Node.js 18+ (for frontend)
- Python 3.10+ (for backend)
- Ollama installed ([download](https://ollama.ai))

### Frontend Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Backend Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Pull Ollama model
ollama pull mistral  # or llama2

# Start Ollama service (separate terminal)
ollama serve

# Run FastAPI backend
python backend/main.py
# API available at http://localhost:8000
```

## Project Structure

```
MultiAgentsSystem/
├── app/
│   ├── dashboard/
│   │   └── page.tsx          # Main research interface
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   └── ui/                   # Shadcn UI components
├── backend/
│   ├── main.py              # FastAPI application
│   ├── agents/              # Agent implementations
│   │   ├── planner.py
│   │   ├── researcher.py
│   │   ├── analyst.py
│   │   ├── writer.py
│   │   └── critic.py
│   ├── vectordb.py          # FAISS vector database
│   ├── rag.py               # RAG pipeline
│   └── requirements.txt      # Python dependencies
├── public/                  # Static files
├── next.config.mjs          # Next.js configuration
├── package.json             # Node dependencies
└── README.md               # This file
```

## API Endpoints

### Health Check
```
GET /health
```

### Research Query
```
POST /api/research
Content-Type: application/json

{
  "query": "What are the key findings about AI in healthcare?",
  "documents": ["doc1.txt", "doc2.txt"]
}

Response:
{
  "status": "success",
  "analysis": "Comprehensive research findings...",
  "agents_involved": ["Planner", "Researcher", "Analyst", "Writer", "Critic"]
}
```

### Upload Document
```
POST /api/upload
Content-Type: multipart/form-data

file: <binary_file>

Response:
{
  "filename": "document.txt",
  "size": 1024,
  "status": "uploaded"
}
```

## Usage Examples

### Basic Query
1. Open http://localhost:3000/dashboard
2. Upload documents (TXT, PDF, MD files)
3. Enter your research question
4. Click "Analyze"
5. View results and export report

### Batch Processing
```python
# Example: Process multiple documents
import requests

documents = ["research.txt", "study.pdf", "paper.md"]
query = "Summarize the main findings across all documents"

response = requests.post("http://localhost:8000/api/research", json={
    "query": query,
    "documents": documents
})

print(response.json())
```

## Configuration

### Environment Variables

Create `.env.local` for frontend configuration:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Model Configuration

Edit `backend/main.py` to change LLM:
```python
# Default: Mistral 7B
# Options: llama2, neural-chat, orca2, openchat, etc.
MODEL_NAME = "mistral"
```

## Performance Notes

- **Cold Start**: ~5 seconds (model loading)
- **Query Processing**: ~10-30 seconds (depending on document size)
- **GPU Support**: Automatic detection via Ollama
- **Memory Usage**: ~4-8GB (varies by model size)

## Roadmap

### Version 2 (Coming Soon)
- [x] Foundation architecture
- [ ] WebSocket support for real-time streaming
- [ ] Database persistence (PostgreSQL)
- [ ] User authentication
- [ ] Multi-model support
- [ ] Advanced RAG with reranking

### Version 3
- [ ] Web scraping agent
- [ ] Fact-checking agent
- [ ] Citation management
- [ ] Collaborative research
- [ ] API rate limiting & quotas

## Troubleshooting

### "Connection refused" (Backend)
```bash
# Ensure Ollama is running
ollama serve

# In another terminal, start FastAPI
python backend/main.py
```

### Model not found
```bash
# Pull model explicitly
ollama pull mistral

# Or use another model
ollama pull llama2
```

### Frontend can't reach backend
- Check NEXT_PUBLIC_API_URL is correct
- Ensure backend runs on port 8000
- Check CORS settings in FastAPI

### Out of memory errors
- Use smaller model: `ollama pull orca2` (3B parameters)
- Or increase system memory
- Enable GPU acceleration via Ollama

## Contributing

Contributions are welcome! Areas to help with:

- [ ] Additional agent implementations
- [ ] Better document parsing (tables, images)
- [ ] Performance optimizations
- [ ] Test coverage
- [ ] Documentation improvements

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: https://github.com/maqa817/MultiAgentsSystem/issues
- Documentation: See `/docs` folder

## Version Info

- **Current Version**: 1.0.0
- **Release Date**: 2026-04-08
- **Status**: Active Development

---

Built with ❤️ for the research community
