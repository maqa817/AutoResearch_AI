# 🚀 AutoResearch AI v4 - Start Here

## What You Have

A **complete, production-ready multi-agent research system** with:

```
┌─────────────────────────────────────────────────┐
│         AutoResearch AI v4                       │
├─────────────────────────────────────────────────┤
│                                                 │
│  4 AI Agents Working Together:                  │
│  1. Planner      → Breaks down queries          │
│  2. Researcher   → Gathers findings             │
│  3. Writer       → Synthesizes answers          │
│  4. Critic       → Reviews quality (NEW)        │
│                                                 │
│  Local LLM: Ollama (no API keys needed)         │
│  Memory: Automatic query history                │
│  Config: Adjustable parameters                  │
│  UI: Beautiful modern dashboard                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Get Started in 5 Minutes

### Step 1: Install Ollama
Visit **https://ollama.ai** and download Ollama for your OS.

### Step 2: Pull a Model
```bash
ollama pull llama2
```

### Step 3: Start Ollama
```bash
ollama serve
# Stays running in background
```

### Step 4: Start AutoResearch
In a new terminal:
```bash
npm run dev
```

### Step 5: Open Dashboard
Visit: **http://localhost:3000/dashboard**

---

## How to Use

### Simple Mode (Fast Answers)
```
1. Uncheck "Multi-Agent Analysis"
2. Type your question
3. Hit Submit
4. Get instant answer (~3-5 seconds)
```

Example:
```
Q: "What is machine learning?"
A: Direct answer from Ollama
```

### Multi-Agent Mode (Deep Research)
```
1. Check "Multi-Agent Analysis"
2. Type your question
3. Hit Submit
4. Watch 4 agents work (15-30 seconds)
```

Example:
```
Q: "Compare AI frameworks"

Planner:
├─ Analyze major AI frameworks
├─ Compare features and performance
└─ Identify use cases

Researcher:
├─ PyTorch strengths: fast, flexible
├─ TensorFlow strengths: production-ready
└─ JAX strengths: functional programming

Writer:
"PyTorch excels for research...
TensorFlow dominates production...
JAX offers functional benefits..."

Critic:
Quality: good ✓
Hallucinations: none
Suggestions: [specific improvements]
```

### With Documents
```
1. Click "Choose Files"
2. Upload research papers, notes, etc.
3. Ask questions about them
4. Files tracked in memory
```

---

## Key Features Explained

### Critic Agent (What's New)

The Critic Agent reviews every answer:

```
Answer Quality Assessment
├─ Good ✓    → Accept as-is
├─ Fair ⚠    → Show warnings
└─ Poor ✗    → Auto-regenerate

Detects:
- False claims (hallucinations)
- Missing context
- Inconsistencies
- Unverified statements

Suggests:
- Add more detail
- Cite sources
- Clarify ambiguous points
- Remove unsupported claims
```

### Memory System

Every query is saved automatically:

```
data/research.json
├─ Query text
├─ Full answer
├─ All agent steps (JSON)
├─ Quality score
├─ Timestamp
└─ Model config used

Capabilities:
- View history
- Search past queries
- Track usage patterns
- Analyze improvements
```

### Configuration Panel

Adjust model behavior in real-time:

```
Settings
├─ Temperature (0-2)
│  └─ Lower = focused, Higher = creative
├─ Max Tokens (256-4096)
│  └─ Controls response length
└─ Top-K (10-100)
   └─ Controls word diversity

Changes apply immediately
Persists for session
```

---

## Architecture Overview

### File Structure
```
lib/
├── agents.ts          ← Main orchestrator
├── agents/
│   ├── planner.ts    ← Plan agent
│   ├── researcher.ts ← Research agent
│   ├── writer.ts     ← Writer agent
│   └── critic.ts     ← Critic agent
├── ollama.ts         ← Ollama connection
└── memory.ts         ← Query storage

app/
├── api/research/     ← Main API
├── dashboard/        ← Dashboard UI
└── page.tsx         ← Home page

data/
└── research.json    ← Auto-created database
```

### Agent Workflow
```
Your Question
     ↓
┌────────────────────────────────────────┐
│ PLANNER AGENT                          │
│ "Let me break this into 3 steps..."    │
└────────────────────────────────────────┘
     ↓
┌────────────────────────────────────────┐
│ RESEARCHER AGENT                       │
│ "Here are detailed findings..."        │
└────────────────────────────────────────┘
     ↓
┌────────────────────────────────────────┐
│ WRITER AGENT                           │
│ "Based on all that, here's the answer" │
└────────────────────────────────────────┘
     ↓
┌────────────────────────────────────────┐
│ CRITIC AGENT                           │
│ "Quality: GOOD, No issues found"       │
└────────────────────────────────────────┘
     ↓
    Final Answer
```

---

## Common Tasks

### Change the Model
1. Visit https://ollama.ai/library
2. Pick a model (e.g., `mistral`, `zephyr`)
3. Install: `ollama pull mistral`
4. Edit `/lib/ollama.ts` line 16:
   ```typescript
   model: "mistral"  // Change this
   ```
5. Restart app

### Adjust Default Parameters
Edit `/lib/ollama.ts`:
```typescript
export const defaultConfig: OllamaConfig = {
  temperature: 0.7,   // ← change this
  max_tokens: 1024,   // ← or this
  top_k: 40,          // ← or this
  model: "llama2",
};
```

### View Query History
All saved automatically in `data/research.json`

Can also use API:
```javascript
fetch('/api/research', {
  method: 'POST',
  body: JSON.stringify({
    action: 'getHistory'
  })
})
```

### Search Past Queries
```javascript
fetch('/api/research', {
  method: 'POST',
  body: JSON.stringify({
    action: 'search',
    query: 'machine learning'  // Search term
  })
})
```

---

## Troubleshooting

### "Can't connect to Ollama"
```bash
# Make sure Ollama is running
ollama serve

# Check it's accessible
curl http://localhost:11434/api/tags
```

### "Model not found"
```bash
# List available models
ollama list

# Download if missing
ollama pull llama2
```

### Slow responses
```
Options:
1. Try smaller model: ollama pull mistral
2. Reduce max_tokens in settings
3. Lower temperature for faster responses
```

### Memory not saving
```
Check:
1. data/ folder exists (auto-created)
2. Write permissions on directory
3. Check browser console for errors
```

---

## Documentation

| Document | Purpose |
|----------|---------|
| `QUICK_START_V4.md` | 5-minute setup |
| `VERSION_4_GUIDE.md` | Complete technical guide |
| `CHANGES_SUMMARY.md` | What changed from v3 |
| `V4_IMPLEMENTATION_COMPLETE.md` | Implementation details |

---

## API Reference

### POST /api/research

**Simple Query**
```json
{
  "query": "What is AI?",
  "useFullOrchestration": false
}
```

**Multi-Agent Query**
```json
{
  "query": "Analyze AI trends",
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
  "query": "keyword"
}
```

---

## Model Recommendations

| Model | Speed | Quality | Best For |
|-------|-------|---------|----------|
| llama2 | Fast | Good | Quick questions |
| mistral | Fast | Better | Balanced tasks |
| zephyr | Med | Best | Complex reasoning |
| neural-chat | Fast | Good | Conversation |

For local setup: **Start with `llama2`** (most reliable)

---

## Performance Tips

✅ **Do:**
- Use Simple mode for quick questions
- Use Multi-Agent for complex queries
- Adjust temperature for your needs
- Monitor response times

❌ **Avoid:**
- Running multiple queries at once
- Setting max_tokens too high
- Using very large models on low-end hardware

---

## What's Next

### Version 5 Coming Soon
- SQLite database
- User authentication
- PDF/Markdown export
- Advanced search
- Usage analytics

### You Can:
1. Deploy locally with Ollama
2. Integrate with your apps
3. Fine-tune models
4. Add custom agents
5. Extend memory system

---

## Questions?

1. **Setup issues?** → Check `QUICK_START_V4.md`
2. **Feature questions?** → See `VERSION_4_GUIDE.md`
3. **What changed?** → Read `CHANGES_SUMMARY.md`
4. **Technical details?** → Read `V4_IMPLEMENTATION_COMPLETE.md`

---

## Ready? Let's Go! 🎉

```bash
# 1. Ollama running?
ollama serve

# 2. App running?
npm run dev

# 3. Open dashboard
http://localhost:3000/dashboard

# 4. Ask a question!
```

**Welcome to AutoResearch AI v4!** 🚀

Your AI-powered research assistant is ready to help.

---

*Made with ❤️ for AI Engineers*  
*v4.0 - Production Ready*
