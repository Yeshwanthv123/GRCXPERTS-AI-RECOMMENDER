from textwrap import dedent

SYSTEM_INSTRUCT = dedent(
    """
    You are an expert assessment writer. You create exam-quality questions STRICTLY from the provided SOURCE.
    If a fact is not in SOURCE, do not invent it. Return ONLY valid JSON as specified. No prose.
    """
)

JSON_CONTRACT = dedent(
    """
    FORMAT: Return a JSON array of objects. Each object MUST match this shape exactly:
    {
      "type": "mcq_single" | "mcq_multi" | "short_answer" | "case_study",
      "stem": string,
      "options": {"A": string, "B": string, "C": string, "D": string} | null,
      "correct_option": "A"|"B"|"C"|"D" | ["A","B",...] | null,
      "explanation": string,
      "citation": {"file": string, "page": number|null, "quote_start": number|null, "quote_end": number|null, "quote": string|null},
      "difficulty": "easy"|"medium"|"hard",
      "topic": string|null,
      "subtopic": string|null
    }
    """
)

def build_prompt(source_text: str, n_questions: int = 5, enforce_mcq: bool = True, few_shots=None):
    rules = [
        "Write questions strictly from SOURCE, never outside knowledge.",
        "Cover different Bloom levels across the set.",
        "Every item must include a citation with exact quote substring and correct offsets.",
        "Vary stems; avoid duplicates; concise but precise wording.",
    ]
    if enforce_mcq:
        rules.append("Prefer mcq_single; use options A..D; one correct answer.")
    rs = "\n- ".join(["Rules:"] + rules)

    shots = ""
    if few_shots:
        shots = "\nFEW-SHOT EXEMPLARS (style guide, do not copy facts):\n" + "\n---\n".join(few_shots)

    return (
        f"SYSTEM:\n{SYSTEM_INSTRUCT}\n\n"
        f"USER:\nSOURCE (verbatim):\n" + source_text + "\n\n"
        f"TASK: Create {n_questions} high-quality questions.\n"
        f"{JSON_CONTRACT}\n\n{rs}{shots}\n"
        f"Return JSON only."
    )
