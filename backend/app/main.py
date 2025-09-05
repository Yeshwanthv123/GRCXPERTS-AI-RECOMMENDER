import os
from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline

from .schemas import GenerateRequest, GenerateResponse, QuestionItem
from .prompts import build_prompt
from .utils import try_parse_items, grounding_check
from .dedupe import DedupeEngine

MODEL_ID = os.getenv("MODEL_ID", "openai/gpt-oss-20b")
MAX_NEW_TOKENS = int(os.getenv("MAX_NEW_TOKENS", "1200"))
DEVICE = 0 if os.getenv("CUDA_VISIBLE_DEVICES", "") else -1

app = FastAPI(title="HF Q&A Generator", version="0.3.0")

# CORS for local React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _load_generator():
    tok = AutoTokenizer.from_pretrained(MODEL_ID)
    model = AutoModelForCausalLM.from_pretrained(MODEL_ID, device_map="auto")
    gen = pipeline(
        "text-generation",
        model=model,
        tokenizer=tok,
        device=DEVICE,
        do_sample=True,
    )
    return gen

_generator = None
_dedupe = DedupeEngine()

@app.on_event("startup")
async def _startup():
    global _generator
    _generator = _load_generator()

@app.get("/health")
def health():
    return {"ok": True, "model": MODEL_ID}

@app.post("/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest):
    if _generator is None:
        raise HTTPException(503, "Model not loaded")

    prompt = build_prompt(
        source_text=req.source_text,
        n_questions=req.n_questions,
        enforce_mcq=req.enforce_mcq,
        few_shots=req.few_shots,
    )

    out = _generator(
        prompt,
        max_new_tokens=MAX_NEW_TOKENS,
        temperature=req.temperature,
        top_p=req.top_p,
        repetition_penalty=1.05,
        eos_token_id=_generator.tokenizer.eos_token_id,
        pad_token_id=_generator.tokenizer.eos_token_id,
        return_full_text=False,
    )[0]["generated_text"].strip()

    rejected: List[str] = []

    try:
        items = try_parse_items(out)
    except Exception as e:
        raise HTTPException(400, f"Invalid JSON from model: {e}")

    kept_items: List[QuestionItem] = []
    for it in items:
        if not it.citation.file:
            it.citation.file = req.file
        if it.citation.page is None:
            it.citation.page = req.page
        ok, reason = grounding_check(req.source_text, it)
        if not ok:
            rejected.append(f"Rejected: {reason} | stem={it.stem[:80]}")
            continue
        if req.enforce_mcq and (it.type != "mcq_single" or not it.options or it.correct_option not in ["A","B","C","D"]):
            rejected.append(f"Rejected: not a valid MCQ | stem={it.stem[:80]}")
            continue
        kept_items.append(it)

    keys = []
    for it in kept_items:
        key = it.stem
        if it.options and it.correct_option in it.options:
            key += "\nANS:" + it.options[it.correct_option]
        keys.append(key)

    keep_idx, pairs = _dedupe.dedupe(keys)
    if pairs:
        for (i, j, sim) in pairs:
            rejected.append(f"Dedup drop: {j} ~ {i} (sim={sim:.3f})")
    final_items = [kept_items[i] for i in keep_idx]

    return GenerateResponse(kept=final_items, rejected=rejected)
