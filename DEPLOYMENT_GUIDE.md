# AutoResearch AI - Demo Deployment Guide

This guide explains how to connect your Vercel frontend to your Render backend.

## 1. Backend Deployment (Render)

1. Go to [Render.com](https://render.com/) and create a new **Web Service**.
2. Connect your GitHub repository.
3. Set the following configurations:
   - **Root Directory**: `demo_backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn -w 4 -k uvicorn.workers.UvicornWorker app:app --bind 0.0.0.0:$PORT`
4. Once deployed, Render will give you a URL like `https://your-app-name.onrender.com`. **Copy this URL.**

## 2. Frontend Configuration (Vercel)

1. Go to your project dashboard on [Vercel](https://vercel.com/).
2. Navigate to **Settings > Environment Variables**.
3. Add a new variable:
   - **Key**: `NEXT_PUBLIC_BACKEND_URL`
   - **Value**: `https://your-app-name.onrender.com` (The URL from Render)
4. Redeploy your Vercel project (Settings > Deployments > Redeploy) to apply the changes.

## 3. Local Testing

To test the demo locally:

1. Open a terminal in the `demo_backend` directory:
   ```bash
   cd demo_backend
   python -m uvicorn app:app --reload
   ```
2. In another terminal, run the frontend:
   ```bash
   npm run dev
   ```
3. Visit `http://localhost:3000`. The frontend will automatically connect to `http://localhost:8000` because of the fallback in `next.config.mjs`.

## How the Demo Works
- The backend is a lightweight FastAPI server.
- It scans the `demo_backend/dataset/` folder for text files.
- When you ask a question, it performs a fast keyword-based search across these files.
- It doesn't require a GPU or LLM, making it perfect for free-tier hosting.
