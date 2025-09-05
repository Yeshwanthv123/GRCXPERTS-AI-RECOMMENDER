from typing import List, Literal, Optional
from pydantic import BaseModel, Field

QuestionType = Literal["mcq_single", "mcq_multi", "short_answer", "case_study"]
Difficulty = Literal["easy", "medium", "hard"]

class Citation(BaseModel):
    file: str
    page: Optional[int] = None
    quote_start: Optional[int] = Field(None, description="Character offset in SOURCE")
    quote_end: Optional[int] = Field(None, description="Character offset in SOURCE (exclusive)")
    quote: Optional[str] = None

class QuestionItem(BaseModel):
    type: QuestionType
    stem: str
    options: Optional[dict] = Field(None, description="For MCQ: keys 'A','B','C','D'")
    correct_option: Optional[str] = Field(None, description="For MCQ: one of 'A','B','C','D' or list for multi")
    explanation: str
    citation: Citation
    difficulty: Difficulty
    topic: Optional[str] = None
    subtopic: Optional[str] = None

class GenerateRequest(BaseModel):
    source_text: str = Field(..., min_length=50, description="Raw SOURCE text")
    file: str = Field(..., description="Filename for citation")
    page: Optional[int] = None
    n_questions: int = Field(5, ge=1, le=20)
    enforce_mcq: bool = Field(True, description="Force MCQ with A..D")
    few_shots: Optional[List[str]] = Field(default=None, description="Optional few-shot exemplars")
    temperature: float = 0.5
    top_p: float = 0.9

class GenerateResponse(BaseModel):
    kept: List[QuestionItem]
    rejected: List[str]
