# Backend (FastAPI) – Q&A Generator

## Run (dev)
```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt

# Default model is openai/gpt-oss-20b
# You can override:
# export MODEL_ID="openai/gpt-oss-20b"

uvicorn app.main:app --reload --port 8008
```

- API docs: http://127.0.0.1:8008/docs
- Health: http://127.0.0.1:8008/health
