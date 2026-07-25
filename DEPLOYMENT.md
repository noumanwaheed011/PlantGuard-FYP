# PlantGuard Deployment

## Live URLs

| Layer | URL |
|-------|-----|
| Frontend (Vercel) | https://plantguard-dusky.vercel.app |
| Backend API (Railway) | https://plantguard-api-production-8410.up.railway.app |
| Health check | https://plantguard-api-production-8410.up.railway.app/api/health |

Frontend env: `VITE_API_BASE_URL=https://plantguard-api-production-8410.up.railway.app/api`

## Why Railway instead of Render?

Render account creation returned **HTTP 402** (`Payment information is required`) even for the free plan. Backend + MongoDB were deployed on **Railway** instead so the app works end-to-end.

Render config remains in the repo for later use:

- [`render.yaml`](render.yaml)
- [`FYP Project Backend/Procfile`](FYP%20Project%20Backend/Procfile)
- [`FYP Project Backend/runtime.txt`](FYP%20Project%20Backend/runtime.txt)

To switch to Render later: add a card at https://dashboard.render.com/billing, create the Blueprint from `render.yaml`, set `MONGODB_URI` (Atlas), then update Vercel `VITE_API_BASE_URL`.

## Local development

```bash
# Backend
cd "FYP Project Backend"
# .env with local MongoDB
python app.py

# Frontend
cd "FYP Project Frontend"
# .env: VITE_API_BASE_URL=http://localhost:5000/api
npm run dev
```

## Redeploy commands

```bash
# Frontend
cd "FYP Project Frontend"
vercel --prod

# Backend (upload current Backend folder)
cd "FYP Project Backend"
railway up -d -y -s plantguard-api
```

## Notes

- Repo is **public** (needed so cloud hosts can clone without extra GitHub App setup).
- `.env` secrets are **not** in git.
- First disease analysis may be slow (TensorFlow model loads on first request).
