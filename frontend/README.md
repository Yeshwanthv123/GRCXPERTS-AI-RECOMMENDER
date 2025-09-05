# Frontend (React + Vite + Tailwind)

## Setup
```bash
cd frontend
npm install
# (Optional) point to a non-default backend URL:
#  echo VITE_API_BASE=http://localhost:8008 > .env.local
npm run dev
```
Open http://localhost:5173

- By default the app calls `http://localhost:8008` (FastAPI).
- To build static files: `npm run build` (outputs `dist/`). You can serve it with any static server.
