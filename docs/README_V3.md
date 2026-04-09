# AutoResearch AI - Version 3

**A production-ready multi-agent AI research system built with Next.js 16, Claude 3.5, and Vercel.**

> **Quick Navigation:**
> - 🚀 Quick Start: See [SETUP_V3.md](./SETUP_V3.md)
> - 📖 Full Docs: See [VERSION_3_SUMMARY.md](./VERSION_3_SUMMARY.md)
> - 💻 View Live: Will be at `https://your-vercel-domain.vercel.app`

---

## What is AutoResearch AI v3?

A **multi-agent AI system** that answers questions using a clean 3-agent architecture:

1. **Planner Agent** - Breaks down your question into research steps
2. **Researcher Agent** - Gathers comprehensive information
3. **Writer Agent** - Synthesizes findings into a polished answer

Try it in **two modes**:
- **Simple Mode**: Direct answer (fast)
- **Multi-Agent Mode**: See all agent steps (educational)

---

## Key Features

✅ **Vercel-Ready** - Deploy in 1 click, works on Vercel out-of-the-box
✅ **Multi-Agent Orchestration** - Clean 3-agent system (Planner → Researcher → Writer)
✅ **Real-Time UI Feedback** - See agent workflow in dashboard
✅ **Production Code** - TypeScript, error handling, logging
✅ **Modern Tech Stack** - Next.js 16, React 19, Tailwind CSS v4
✅ **Serverless** - No backend to manage, auto-scales on Vercel
✅ **Simple to Extend** - Add more agents with 20 lines of code

---

## Quick Start

### Prerequisites
- Node.js 18+
- Anthropic API key (free account at https://console.anthropic.com)

### 1. Clone & Install
```bash
git clone <your-repo>
cd AutoResearch_AI
npm install
```

### 2. Setup Environment
Create `.env.local`:
```
ANTHROPIC_API_KEY=your_api_key_here
```

### 3. Run Locally
```bash
npm run dev
```
Visit http://localhost:3000

### 4. Try Dashboard
- Go to `/dashboard`
- Ask a question
- Toggle "Use Multi-Agent Mode" to see agent workflow
- Get intelligent answers

---

## Architecture

### System Design
```
┌─────────────────────────────────────┐
│   Next.js Frontend (React 19)        │
│   - Home page                        │
│   - Dashboard with multi-agent UI    │
└──────────────┬──────────────────────┘
               │
        ┌──────▼──────┐
        │   Vercel    │  (Serverless)
        │ API Routes  │
        └──────┬──────┘
               │
     ┌─────────▼─────────┐
     │  Agent System      │
     │ (lib/agents.ts)    │
     │                    │
     │ 1. Planner Agent   │
     │ 2. Research Agent  │
     │ 3. Writer Agent    │
     └─────────┬──────────┘
               │
       ┌───────▼────────┐
       │  Anthropic AI  │
       │  (Claude 3.5)  │
       └────────────────┘
```

### File Structure
```
app/
├── page.tsx                 # Home/landing page
├── dashboard/
│   └── page.tsx             # Main dashboard
└── api/
    └── research/
        └── route.ts         # API endpoint for queries

lib/
└── agents.ts                # Multi-agent orchestration logic
                            # - plannerAgent()
                            # - researcherAgent()
                            # - writerAgent()
                            # - runMultiAgentResearch()

components/
├── ui/                      # shadcn/ui components
└── ...other components

SETUP_V3.md                 # Setup guide
VERSION_3_SUMMARY.md        # Detailed documentation
```

---

## API Reference

### POST /api/research

**Request:**
```json
{
  "query": "Your question here",
  "useFullOrchestration": true
}
```

**Response (Simple Mode - useFullOrchestration: false):**
```json
{
  "query": "What is AI?",
  "answer": "Artificial Intelligence is...",
  "mode": "simple"
}
```

**Response (Multi-Agent Mode - useFullOrchestration: true):**
```json
{
  "query": "What is AI?",
  "status": "success",
  "steps": [
    {
      "agent": "Planner",
      "output": "Research plan: 1. Define AI... 2. Explain benefits...",
      "timestamp": "2025-04-09T10:30:00.000Z"
    },
    {
      "agent": "Researcher",
      "output": "AI is machine intelligence that performs tasks...",
      "timestamp": "2025-04-09T10:30:02.000Z"
    },
    {
      "agent": "Writer",
      "output": "Final comprehensive answer about AI...",
      "timestamp": "2025-04-09T10:30:04.000Z"
    }
  ],
  "finalAnswer": "Artificial Intelligence..."
}
```

---

## How Agents Work

### Planner Agent
- **Input:** User question
- **Function:** Breaks down into research steps
- **Output:** Structured research plan
- **Example:**
  - Q: "What is machine learning?"
  - Output: "1. Define ML... 2. Explain algorithms... 3. Discuss applications..."

### Researcher Agent
- **Input:** Question + Planner's research plan
- **Function:** Gathers comprehensive information
- **Output:** Detailed findings
- **Example:**
  - Researches each point from the plan
  - Provides factual, detailed information

### Writer Agent
- **Input:** Question + Research findings
- **Function:** Synthesizes into polished response
- **Output:** Final answer
- **Example:**
  - Combines research into cohesive answer
  - Ensures clarity and completeness

---

## Deployment to Vercel

### Option 1: GitHub + Vercel (Easiest)
1. Push code to GitHub
2. Go to https://vercel.com
3. Click "Add New" → "Project"
4. Select your repository
5. In "Environment Variables", add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: Your Anthropic API key
6. Click "Deploy"

### Option 2: Vercel CLI
```bash
npm i -g vercel
vercel
# Follow prompts
# Add environment variable when asked
```

### Option 3: Docker (Advanced)
```bash
docker build -t autoresearch-ai .
docker run -e ANTHROPIC_API_KEY=xxx -p 3000:3000 autoresearch-ai
```

---

## Environment Variables

### Required
- `ANTHROPIC_API_KEY` - Your Anthropic API key

### Optional (for future extensions)
- `NEXT_PUBLIC_API_URL` - Custom API URL
- `LOG_LEVEL` - Debug logging level

---

## Development

### Scripts
```bash
npm run dev     # Start dev server with hot reload
npm run build   # Build for production
npm start       # Run production server
npm run lint    # Run linter
```

### Adding New Agents

Add a new agent function in `lib/agents.ts`:
```typescript
async function yourAgent(input: string): Promise<string> {
  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Your agent prompt: ${input}`,
      },
    ],
  });
  
  const content = response.content[0];
  return content.type === "text" ? content.text : "";
}
```

Then add to orchestration in `runMultiAgentResearch()`.

---

## Version History

### v1 - RAG Pipeline
- Simple retrieval-augmented generation
- Standalone Python backend

### v2 - 5-Agent System
- Complex enterprise architecture
- Still required Python backend

### v3 - **Current: 3-Agent Simplification**
- ✅ Clean, maintainable multi-agent system
- ✅ Vercel-ready Next.js full-stack
- ✅ Production-grade code quality
- ✅ Easy to understand and extend

---

## Performance Metrics

| Metric | Value |
|--------|-------|
| **Home Page Load** | < 1s |
| **Dashboard Load** | < 2s |
| **Simple Query Response** | 2-5s |
| **Multi-Agent Query** | 5-10s |
| **Deployment Time** | < 2 minutes |
| **Serverless Auto-Scale** | Automatic |

---

## Use Cases

- 📚 **Research Assistant** - Answer complex research questions
- 🎓 **Learning Tool** - Understand topics step-by-step
- 📝 **Content Creation** - Generate comprehensive articles
- 🔍 **Analysis** - Deep dive into topics with agent workflow
- 🤖 **AI Education** - See multi-agent system in action

---

## For Your CV

This project demonstrates:
- **AI Engineering:** Multi-agent orchestration, Claude API integration
- **Full-Stack:** Next.js (frontend + serverless backend), TypeScript
- **Production Mindset:** Error handling, logging, Vercel deployment
- **Modern Tech:** React 19, Next.js 16, Tailwind CSS v4
- **Problem Solving:** Simplified complex 5-agent system to clean 3-agent design

---

## Troubleshooting

### "ANTHROPIC_API_KEY not found"
Add to `.env.local` file in project root

### "Dashboard is blank"
1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Check console for errors (F12)
3. Restart dev server

### "API returns error"
1. Verify API key is valid
2. Check API key has quota/credits
3. Check internet connection
4. View server logs: `npm run dev` output

### "Very slow responses"
- Normal for first response (Claude model warming up)
- Subsequent queries are faster
- On Vercel, check regional latency

---

## Contributing

Want to enhance Version 3? Ideas:
- [ ] Add conversation memory
- [ ] Add document upload
- [ ] Add more agents (Critic, Fact-Checker)
- [ ] Add streaming responses
- [ ] Add authentication
- [ ] Add analytics

---

## License

MIT - Feel free to use for personal or commercial projects

---

## Support & Resources

- **Anthropic Docs:** https://docs.anthropic.com
- **Next.js Docs:** https://nextjs.org/docs
- **Vercel Docs:** https://vercel.com/docs
- **React Docs:** https://react.dev

---

## What's Next?

1. ✅ Get it running locally (5 mins)
2. ✅ Deploy to Vercel (2 mins)
3. 🎯 Add new features (agents, memory, streaming)
4. 📊 Monitor and optimize performance
5. 🚀 Scale with your users

---

**Made with ❤️ for AI engineers.**

Questions? Check [SETUP_V3.md](./SETUP_V3.md) or [VERSION_3_SUMMARY.md](./VERSION_3_SUMMARY.md)
