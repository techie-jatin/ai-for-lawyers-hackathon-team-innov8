from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

from app.api import deps
from app.services.rag.assistant import LegalAssistantService

router = APIRouter()

class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=4000, description="User legal query (max 4000 chars)")
    mode: Optional[str] = Field("citizen", pattern=r"^(citizen|professional)$")
    context_filter: Optional[str] = Field(None, max_length=100)
    gemini_api_key: Optional[str] = Field(None, max_length=128)
    history: Optional[List[Dict[str, str]]] = None  # Multi-turn context: [{"role": "user", "text": "..."}, ...]

class ValidateCitationRequest(BaseModel):
    provision_id: Optional[int] = None
    claimed_section: Optional[str] = None
    claimed_quote: Optional[str] = None

@router.post("/query")
def ask_assistant(req: ChatRequest, db: Session = Depends(deps.get_db)) -> Dict[str, Any]:
    """
    Primary RAG query endpoint for citizens and legal professionals with dynamic statutory context filtering,
    multi-turn conversational memory, and optional free Google Gemini synthesis.
    """
    service = LegalAssistantService(db)
    return service.generate_response(
        query=req.query,
        mode=req.mode or "citizen",
        context_filter=req.context_filter,
        gemini_api_key=req.gemini_api_key,
        history=req.history
    )

@router.post("/validate-citation")
def validate_citation(req: ValidateCitationRequest, db: Session = Depends(deps.get_db)) -> Dict[str, Any]:
    """
    Dedicated citation verification endpoint to audit legal citations and quotes against Neon database.
    """
    service = LegalAssistantService(db)
    result = service.validator.validate_citation(
        provision_id=req.provision_id,
        claimed_section=req.claimed_section,
        claimed_quote=req.claimed_quote
    )
    return result.to_dict()
