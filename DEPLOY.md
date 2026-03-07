# Deployment Guide — Vercel + Render (Both Free)

## Step 1 — Push to GitHub

```bash
cd ~/Desktop/quantlab_v2
git init
git add .
git commit -m "QuantLab v2"
# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/quantlab.git
git push -u origin main
```

## Step 2 — Deploy Backend on Render (free)

1. Go to https://render.com → Sign up free
2. Click **New → Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `alembic upgrade head && python -m data.seeds.seed_datasets && python -m data.seeds.seed_problems && python -m data.seeds.seed_research && uvicorn api.main:app --host 0.0.0.0 --port $PORT`
   - **Environment**: Python 3
5. Add Environment Variables:
   - `DATABASE_URL` → click "Add from group" → create a PostgreSQL database in Render first
   - `SECRET_KEY` → click "Generate" 
   - `SANDBOX_URL` → `http://localhost:9000` (sandbox runs in browser via Pyodide now, so this is fine)
   - `DATA_DIR` → `./data/datasets`
6. Click **Deploy**
7. Copy your Render URL e.g. `https://quantlab-api-xxxx.onrender.com`

## Step 3 — Deploy Frontend on Vercel (free)

1. Go to https://vercel.com → Sign up free (use GitHub)
2. Click **Add New Project** → Import your GitHub repo
3. Settings:
   - **Framework**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
4. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL` = `https://quantlab-api-xxxx.onrender.com` (your Render URL)
5. Click **Deploy**
6. Your site is live at `https://quantlab-xxxx.vercel.app`

## Notes
- Render free tier sleeps after 15min inactivity — first request takes ~30s to wake up
- Upgrade to Render Starter ($7/mo) to avoid sleep
- All code execution runs in the browser (Pyodide) — no sandbox server needed in production
- Datasets are generated synthetically on first run if Stooq download fails
