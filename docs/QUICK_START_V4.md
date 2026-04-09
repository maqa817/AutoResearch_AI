# AutoResearch AI v4 - Quick Start

## Installation & Setup (5 minutes)

### 1. Install Ollama
```bash
# Download from https://ollama.ai
# Or install via package manager
brew install ollama  # macOS
# Linux: curl https://ollama.ai/install.sh | sh
```

### 2. Pull a Model
```bash
ollama pull llama2
# Or try: mistral, zephyr, neural-chat
```

### 3. Start Ollama
```bash
ollama serve
# Runs at http://localhost:11434
```

### 4. Start AutoResearch AI (in another terminal)
```bash
cd your-project
npm install
npm run dev
```

### 5. Open Dashboard
Visit: http://localhost:3000/dashboard

---

## Usage Examples

### Example 1: Simple Question
```
Query: "What are the benefits of machine learning?"
Mode: Simple
Result: Direct answer from Ollama in ~3-5 seconds
```

### Example 2: Deep Research
```
Query: "Compare different cloud computing platforms"
Mode: Multi-Agent (checked)
Result: 
  - Planner breaks into steps
  - Researcher gathers info
  - Writer synthesizes
  - Critic reviews quality
  Total time: 15-30 seconds
```

### Example 3: With Documents
```
1. Upload: research_paper.pdf + notes.txt
2. Query: "What are the main findings?"
3. Files are tracked in memory
4. Results saved with document context
```

---

## Key Features

### Dashboard Features
- **Query Input**: Ask any question
- **File Upload**: Attach documents
- **Mode Toggle**: Simple vs Multi-Agent
- **Settings**: Configure temperature, tokens, top-k
- **Agent Steps**: Watch each agent work
- **Critic Review**: Quality assessment
- **Final Answer**: Polished response

### Agent Workflow
```
Your Query
    ↓
Planner (breaks into steps)
    ↓
Researcher (gathers findings)
    ↓
Writer (synthesizes answer)
    ↓
Critic (reviews quality)
    ↓
Auto-rewrite if needed
    ↓
Final Answer
```

### Memory System
- All queries saved automatically
- Search past queries
- Access via API or settings
- Stored in `data/research.json`

---

## Configuration

### Model Choice
Edit `lib/ollama.ts` line 16:
```typescript
model: "llama2",  // Change this
```

### Parameter Tuning
Dashboard Settings panel or `lib/ollama.ts`:
```typescript
temperature: 0.7,    // 0=focused, 2=creative
max_tokens: 1024,    // Response length
top_k: 40,          // Diversity
```

---

## Common Questions

**Q: How do I use a different model?**
A: Install with `ollama pull <model>`, then update `lib/ollama.ts` line 16

**Q: Can I run this on Vercel?**
A: Not with local Ollama (Ollama runs locally only). Deploy with cloud API instead.

**Q: How are responses stored?**
A: All in `data/research.json` - automatic, no setup needed

**Q: Can I export results?**
A: Currently JSON export. PDF export coming in v5.

**Q: Is there user authentication?**
A: Not yet - all queries in shared memory. Multi-user in v5.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Connection refused" | Start Ollama: `ollama serve` |
| "Model not found" | Pull model: `ollama pull llama2` |
| Slow responses | Try smaller model or reduce tokens |
| Files not saving | Check `data/` folder exists and is writable |
| Wrong model used | Check `lib/ollama.ts` for model name |

---

## Next: Explore Features

1. Ask a simple question → see instant answer
2. Toggle Multi-Agent → see full workflow
3. Click Settings → adjust parameters
4. Upload a document → see it tracked
5. View agent steps → understand the process

---

## Need Help?

- Check `VERSION_4_GUIDE.md` for complete documentation
- Review agent files in `lib/agents/`
- Check API responses for errors
- Verify Ollama is running and model is available

**Happy Researching!** 🚀
