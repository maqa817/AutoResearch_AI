# Version 3 Setup Guide

## Quick Start (5 minutes)

### 1. Get Anthropic API Key
- Go to https://console.anthropic.com
- Create account if needed
- Get your API key from the dashboard

### 2. Set Environment Variable
Create `.env.local` in project root:
```
ANTHROPIC_API_KEY=sk-ant-xxx...
```

### 3. Install & Run
```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

### 4. Try It Out
- Open http://localhost:3000 (home page)
- Click "Launch Dashboard"
- In dashboard:
  - **Simple Mode:** Just ask a question
  - **Multi-Agent Mode:** Enable toggle, then ask a question to see agent workflow

---

## Deploy to Vercel

### Option A: One-Click Deploy
1. Push code to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Select your repository
5. Set `ANTHROPIC_API_KEY` in Environment Variables
6. Click "Deploy"

### Option B: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts and set environment variable when asked
```

---

## Testing Different Modes

### Simple Query (Fast)
- Checkbox OFF
- Ask: "What is artificial intelligence?"
- Result: Direct answer in seconds

### Multi-Agent Query (See Workflow)
- Checkbox ON
- Ask: "What is artificial intelligence?"
- Result: See Planner → Researcher → Writer steps + final answer

---

## Troubleshooting

### "ANTHROPIC_API_KEY not found"
**Fix:** Add environment variable to `.env.local`

### "Cannot connect to API"
**Fix:** 
1. Restart dev server: `npm run dev`
2. Check `.env.local` is in project root
3. Check API key is valid

### "Response is empty"
**Fix:** 
1. Check API key has usage quota
2. Check internet connection
3. Check query is entered

### "Dashboard page is blank"
**Fix:**
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Check browser console for errors
3. Restart dev server

---

## File Locations (Important)

```
✅ .env.local              (CREATE THIS - root directory)
✅ lib/agents.ts           (Multi-agent logic)
✅ app/api/research/route.ts (API endpoint)
✅ app/dashboard/page.tsx  (Main UI)
```

---

## Project Structure

```
Version 3 Architecture:

User Interface (React/Next.js)
        ↓
    /api/research endpoint
        ↓
    agents.ts (Multi-agent orchestration)
    ├── plannerAgent()
    ├── researcherAgent()
    └── writerAgent()
        ↓
    Anthropic API (Claude)
        ↓
    Response back to UI
```

---

## Key Differences from v1-v2

| Aspect | v1-v2 | v3 |
|--------|-------|-----|
| Backend Language | Python | JavaScript/TypeScript |
| Where to Deploy | Docker/Manual | Vercel (1-click) |
| How to Set Config | requirements.txt | .env.local |
| Agent Count | 5 | 3 (simpler) |
| Setup Time | 30 mins | 5 mins |

---

## Next: Enhance Version 3

Once basic version works, try adding:
1. **Conversation history** - Remember previous questions
2. **Document upload** - Upload files for analysis
3. **Streaming responses** - See agent output in real-time
4. **More agents** - Add Critic, Fact-Checker, etc.

---

## Need Help?

1. Check VERSION_3_SUMMARY.md for detailed docs
2. Check this file for troubleshooting
3. Visit Anthropic docs: https://docs.anthropic.com
4. Check Next.js docs: https://nextjs.org/docs
