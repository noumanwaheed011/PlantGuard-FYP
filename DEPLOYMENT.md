# PlantGuard Deployment Guide

## Architecture

- **Frontend:** Vercel — https://plantguard-dusky.vercel.app
- **Backend:** Render (Flask + TensorFlow) — needs a free Render account with billing card on file
- **Database:** MongoDB Atlas (free M0 cluster) — local MongoDB will not work from the cloud

## Frontend (done)

Live URL: **https://plantguard-dusky.vercel.app**

Set env var in Vercel project settings (or CLI):

```bash
cd "FYP Project Frontend"
vercel env add VITE_API_BASE_URL production
# value: https://YOUR-RENDER-SERVICE.onrender.com/api
vercel --prod
```

## Backend on Render

### 1. Billing (required by Render)

Visit https://dashboard.render.com/billing and add a payment method (free tier still requires a card).

### 2. MongoDB Atlas

1. Create a free cluster at https://cloud.mongodb.com
2. Database Access → create user + password
3. Network Access → allow `0.0.0.0/0` (or Render IPs)
4. Connect → copy `mongodb+srv://...` URI

### 3. Create the web service

**Option A — Blueprint**

1. Dashboard → New → Blueprint
2. Connect GitHub repo `noumanwaheed011/PlantGuard-FYP`
3. Use root [`render.yaml`](render.yaml)

**Option B — CLI** (after `render login`)

```bash
render workspace set <your-workspace-id>
render services create \
  --name plantguard-api \
  --type web_service \
  --repo https://github.com/noumanwaheed011/PlantGuard-FYP \
  --branch main \
  --runtime python \
  --root-directory "FYP Project Backend" \
  --build-command "pip install -r requirements.txt" \
  --start-command "gunicorn -b 0.0.0.0:$PORT --timeout 120 --workers 1 --threads 2 app:app" \
  --plan free \
  --health-check-path /api/health \
  --env-var "FLASK_ENV=production" \
  --env-var "FLASK_DEBUG=0" \
  --env-var "MONGODB_URI=mongodb+srv://USER:PASS@CLUSTER/?retryWrites=true&w=majority" \
  --env-var "CORS_ORIGINS=https://plantguard-dusky.vercel.app,https://plantguard.vercel.app" \
  --env-var "JWT_SECRET_KEY=replace-with-long-random-string" \
  --confirm --output json
```

### 4. Wire frontend → backend

1. Copy the Render service URL (e.g. `https://plantguard-api.onrender.com`)
2. Set Vercel `VITE_API_BASE_URL` to `https://plantguard-api.onrender.com/api`
3. Redeploy frontend
4. Ensure Render `CORS_ORIGINS` includes `https://plantguard-dusky.vercel.app`

### Notes

- Free Render services **spin down** after idle; first request can take ~1 minute.
- TensorFlow needs enough RAM; if the free plan OOMs, upgrade the Render instance.
- Repo is **public** so Render can clone it without GitHub App access. You can set it private again after connecting GitHub in Render.
