## AutoResearch AI - Version 4 Complete Guide

### Overview

**Version 4** is the most advanced iteration of AutoResearch AI, featuring:
- **Multi-Agent Orchestration**: Planner → Researcher → Writer → Critic
- **Critic Agent**: Reviews answers for hallucinations and quality issues
- **Memory System**: Saves all queries and responses for context awareness
- **Configurable Parameters**: Adjust temperature, max_tokens, top_k on the fly
- **Comprehensive Logging**: Tracks all agent steps and decisions
- **File Upload Support**: Process documents as part of research
- **Ollama Integration**: Runs locally without external API dependencies

---

## Architecture

### Agents (Separate Files)

Each agent lives in its own module for maintainability:

1. **Planner Agent** (`/lib/agents/planner.ts`)
   - Breaks down complex queries into actionable research steps
   - Output: 3-step research plan

2. **Researcher Agent** (`/lib/agents/researcher.ts`)
   - Analyzes the plan and gathers detailed findings
   - Output: Comprehensive research findings

3. **Writer Agent** (`/lib/agents/writer.ts`)
   - Synthesizes findings into a polished final answer
   - Output: Professional research report

4. **Critic Agent** (`/lib/agents/critic.ts`)
   - Reviews the answer for quality and hallucinations
   - Detects false claims and suggests improvements
   - Triggers regeneration if needed
   - Output: CriticReview with quality score

### Core Systems

**Ollama Integration** (`/lib/ollama.ts`)
- Connects to local Ollama instance at `http://localhost:11434`
- Configurable model parameters (temperature, max_tokens, top_k)
- Graceful fallback for development mode

**Memory System** (`/lib/memory.ts`)
- Stores all queries and responses in `data/research.json`
- Query history retrieval
- Search functionality across past queries
- Automatic timestamping and logging

**API Route** (`/app/api/research/route.ts`)
- Main orchestration endpoint
- Handles simple and multi-agent modes
- Config updates
- History and search operations

---

## How to Use

### Local Setup with Ollama

1. **Install Ollama**: https://ollama.ai
2. **Pull a model**: 
   ```bash
   ollama pull llama2
   ```
3. **Start Ollama**:
   ```bash
   ollama serve
   ```
4. **Run AutoResearch AI**:
   ```bash
   npm run dev
   ```
5. Navigate to `http://localhost:3000/dashboard`

### Simple Mode (Single Query)
- Uncheck "Multi-Agent Analysis"
- Enter your question
- Get instant response from Ollama

### Multi-Agent Mode (Full Analysis)
- Check "Multi-Agent Analysis"
- Enter your question
- Watch all 4 agents work:
  1. Planner breaks down query
  2. Researcher gathers findings
  3. Writer synthesizes results
  4. Critic reviews quality

### Upload Documents
- Click "Choose Files" to upload research documents
- Supported: .txt, .pdf, .md, .doc
- Documents are tracked in the query log

### Configure Model
- Click "Settings" button
- Adjust temperature (0-2)
- Adjust max tokens (256-4096)
- Adjust top-k (10-100)
- Changes persist for the session

---

## Feature Details

### Critic Agent

The Critic Agent evaluates:
- **Quality**: good/fair/poor
- **Hallucinations**: Detects false claims
- **Suggestions**: Improvement recommendations
- **Regeneration**: Triggers rewrite if quality is poor

Example output:
```
Quality: fair
Hallucinations: 
- Claimed 95% accuracy without source
Suggestions:
- Add specific data sources
- Remove unsubstantiated claims
Regenerate: yes
```

### Memory & Context

All queries are automatically saved with:
- Query text
- Complete answer
- All agent steps (JSON)
- Quality assessment
- Timestamp
- Model configuration used

Access via: `GET /api/research?action=getHistory`

### Configuration System

Three key parameters:

1. **Temperature** (0-2)
   - Lower = more focused, deterministic
   - Higher = more creative, diverse
   - Default: 0.7

2. **Max Tokens** (256-4096)
   - Controls maximum response length
   - Default: 1024

3. **Top-K** (10-100)
   - Controls diversity of word selection
   - Default: 40

---

## File Structure

```
lib/
├── agents.ts              # Main orchestrator
├── agents/
│   ├── planner.ts        # Planner Agent
│   ├── researcher.ts     # Researcher Agent
│   ├── writer.ts         # Writer Agent
│   └── critic.ts         # Critic Agent (NEW)
├── ollama.ts             # Ollama integration
├── memory.ts             # Memory & logging system
└── utils.ts              # Utility functions

app/
├── api/research/route.ts # Main API endpoint
├── dashboard/page.tsx    # Dashboard UI (REDESIGNED)
└── page.tsx             # Home page

data/
└── research.json        # Query database (auto-created)
```

---

## Configuration

### Environment Variables

Optional:
```
OLLAMA_URL=http://localhost:11434  # Default Ollama address
```

### Model Selection

Edit `/lib/ollama.ts`:
```typescript
export const defaultConfig: OllamaConfig = {
  model: "llama2",  // Change to your preferred model
  temperature: 0.7,
  max_tokens: 1024,
  top_k: 40,
};
```

Available Ollama models:
- `llama2` - Fast, good for quick tasks
- `mistral` - Better reasoning
- `neural-chat` - Conversational
- `zephyr` - Balanced

---

## API Endpoints

### POST /api/research

**Simple Query**
```json
{
  "query": "What is machine learning?",
  "useFullOrchestration": false,
  "documents": ["file1.txt"]
}
```

**Multi-Agent Query**
```json
{
  "query": "Analyze AI adoption trends",
  "useFullOrchestration": true
}
```

**Update Config**
```json
{
  "action": "updateConfig",
  "config": {
    "temperature": 0.9,
    "max_tokens": 2048,
    "top_k": 50
  }
}
```

**Get History**
```json
{
  "action": "getHistory"
}
```

**Search**
```json
{
  "action": "search",
  "query": "machine learning"
}
```

---

## Performance Tips

1. **Use Simple Mode** for quick questions - faster response
2. **Multi-Agent Mode** for complex research - better results
3. **Adjust Temperature** - lower for factual, higher for creative
4. **Monitor Token Usage** - longer responses = more tokens
5. **Choose Right Model** - bigger models = better but slower

---

## Troubleshooting

**"Ollama Connection Issue"**
- Ensure Ollama is running: `ollama serve`
- Check URL matches `OLLAMA_URL` env var
- Verify model is pulled: `ollama list`

**Memory Not Saving**
- Check write permissions in project directory
- `data/` folder should exist
- Clear cache and retry

**Slow Responses**
- Model might be too large for your hardware
- Try smaller model: `ollama pull mistral`
- Reduce max_tokens

---

## What's New in Version 4

✅ Critic Agent with hallucination detection  
✅ Memory system with query history  
✅ Configurable model parameters  
✅ File upload functionality restored  
✅ Separated agents into individual files  
✅ Enhanced UI with settings panel  
✅ Quality scoring system  
✅ Suggestion generation for improvements  

---

## Next Steps (Version 5)

- Database persistence (SQLite proper integration)
- User authentication
- Multi-user memory separation
- Advanced search with semantic similarity
- Export reports to PDF/Markdown
- API rate limiting and usage analytics
- Model fine-tuning support
