from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

from app.api import deps
from app.services.rag.assistant import LegalAssistantService

router = APIRouter()

class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=4000, description="User legal query (max 4000 chars)")
    mode: Optional[str] = Field("citizen", pattern=r"^(citizen|professional|advocate)$")
    context_filter: Optional[str] = Field(None, max_length=100)
    gemini_api_key: Optional[str] = Field(None, max_length=128)
    history: Optional[List[Dict[str, str]]] = None  # Multi-turn context: [{"role": "user", "text": "..."}, ...]

class ValidateCitationRequest(BaseModel):
    provision_id: Optional[int] = None
    claimed_section: Optional[str] = None
    claimed_quote: Optional[str] = None

class DocumentOcrRequest(BaseModel):
    file_base64: str = Field(..., description="Base64 encoded string of image or scanned document")
    mime_type: Optional[str] = Field("image/png", max_length=100)
    file_name: Optional[str] = Field("document.png", max_length=200)
    filename: Optional[str] = Field(None, max_length=200)
    gemini_api_key: Optional[str] = Field(None, max_length=128)

class DocumentExtractRequest(BaseModel):
    file_base64: str = Field(..., description="Base64 encoded string of document (PDF, DOCX, TXT, image)")
    file_name: Optional[str] = Field("document.pdf", max_length=200)
    filename: Optional[str] = Field(None, max_length=200)
    mime_type: Optional[str] = Field(None, max_length=100)
    gemini_api_key: Optional[str] = Field(None, max_length=128)

class AudioTranscribeRequest(BaseModel):
    audio_base64: str = Field(..., description="Base64 encoded string of recorded voice audio")
    mime_type: Optional[str] = Field("audio/webm", max_length=100)
    language: Optional[str] = Field("auto", max_length=20)

class SpokenBriefingRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Legal text to convert into phonetically clean spoken briefing")

from app.services.ocr_service import LegalOcrService
from app.services.voice_service import LegalVoiceService
from app.services.document_service import LegalDocumentService
from starlette.responses import StreamingResponse

@router.post("/stream")
def stream_assistant(req: ChatRequest, db: Session = Depends(deps.get_db)):
    """
    Real-time Server-Sent Events (SSE) streaming endpoint for conversational legal intelligence.
    Emits metadata, live token stream, and completion events with sub-second time-to-first-token (TTFT).
    """
    service = LegalAssistantService(db)
    generator = service.stream_response(
        query=req.query,
        mode=req.mode or "citizen",
        context_filter=req.context_filter,
        gemini_api_key=req.gemini_api_key,
        history=req.history
    )
    return StreamingResponse(
        generator,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

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

@router.post("/ocr")
def process_document_ocr(req: DocumentOcrRequest) -> Dict[str, Any]:
    """
    Scanned Legal Document & Image OCR endpoint.
    Performs bilingual (English + Hindi) text and FIR metadata extraction
    from scanned photocopies, notices, and WhatsApp transaction screenshots.
    """
    file_name = req.file_name or req.filename or "document.png"
    res = LegalOcrService.process_document_image(
        file_base64=req.file_base64,
        mime_type=req.mime_type or "image/png",
        file_name=file_name,
        gemini_api_key=req.gemini_api_key
    )
    # Ensure aliases for 100% frontend compatibility
    if "extracted_text" in res and "text" not in res:
        res["text"] = res["extracted_text"]
    if "metadata" in res and "fir_metadata" not in res:
        res["fir_metadata"] = res["metadata"]
    return res

@router.post("/extract-document")
def extract_document(req: DocumentExtractRequest) -> Dict[str, Any]:
    """
    Universal legal document parser.
    Extracts text and statutory/FIR metadata from digital and scanned PDFs, DOCX agreements, TXT, and images.
    """
    name = req.file_name or req.filename or "document.pdf"
    return LegalDocumentService.extract_document(
        file_base64=req.file_base64,
        file_name=name,
        mime_type=req.mime_type,
        gemini_api_key=req.gemini_api_key
    )

@router.post("/transcribe")
def transcribe_voice_audio(req: AudioTranscribeRequest) -> Dict[str, Any]:
    """
    Bilingual voice audio transcription endpoint.
    Transcribes spoken voice consultation into text via Groq Whisper Large v3 / Gemini Flash Audio.
    """
    return LegalVoiceService.transcribe_audio_base64(
        audio_base64=req.audio_base64,
        mime_type=req.mime_type or "audio/webm",
        language=req.language or "auto"
    )

@router.post("/spoken-briefing")
def generate_spoken_briefing(req: SpokenBriefingRequest) -> Dict[str, str]:
    """
    Audio optimization endpoint for Web Speech API text-to-speech.
    Strips raw markdown symbols and synthesizes bilingual English and Hindi spoken summaries.
    """
    return LegalVoiceService.generate_bilingual_briefing(req.text)
