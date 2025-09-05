import json
from typing import List, Tuple
from .schemas import QuestionItem

class JSONRepairError(Exception):
    pass

def try_parse_items(text: str) -> List[QuestionItem]:
    """Parse JSON array -> list[QuestionItem]; raise on failure."""
    try:
        data = json.loads(text)
        if not isinstance(data, list):
            raise JSONRepairError("Model did not return a JSON array")
        items = [QuestionItem.model_validate(obj) for obj in data]
        return items
    except Exception as e:
        raise JSONRepairError(str(e))

def grounding_check(source: str, item: QuestionItem) -> Tuple[bool, str]:
    """Verify that citation.quote is a substring and offsets match."""
    cit = item.citation
    if not cit.quote:
        return False, "Missing citation.quote"
    qs = cit.quote
    if qs not in source:
        return False, "citation.quote not found in source"
    if cit.quote_start is not None and cit.quote_end is not None:
        if not (0 <= cit.quote_start < len(source) and 0 < cit.quote_end <= len(source) and cit.quote_start < cit.quote_end):
            return False, "Invalid citation offsets"
        if source[cit.quote_start:cit.quote_end] != qs:
            return False, "Offsets do not match quoted text"
    return True, "ok"
