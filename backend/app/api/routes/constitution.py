"""
constitution.py - Complete Constitution of India API Endpoints
Bharat Legal Intelligence 2.0 (Reverse Engineer Anything - REA Methodology)
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from app.services.constitution_service import ConstitutionService

router = APIRouter()

class ControversyAnalysisRequest(BaseModel):
    facts: str = Field(..., min_length=5, description="Factual narrative of the controversy to analyze against the Constitution")

@router.get("/preamble")
def get_preamble():
    """Retrieve the authentic Preamble and its Basic Structure doctrines."""
    service = ConstitutionService.get_instance()
    return service.get_preamble()

@router.get("/parts")
def get_parts():
    """Retrieve all 25 Parts metadata and article spans."""
    service = ConstitutionService.get_instance()
    return service.get_parts()

@router.get("/schedules")
def get_schedules():
    """Retrieve all 12 Schedules of the Constitution of India."""
    service = ConstitutionService.get_instance()
    return service.get_schedules()

@router.get("/article/{article_id}")
def get_article(article_id: str):
    """Retrieve full verbatim text, REA ingredients, and precedents for a specific Article."""
    service = ConstitutionService.get_instance()
    art = service.get_article(article_id)
    if not art:
        raise HTTPException(status_code=404, detail=f"Article '{article_id}' not found in the Constitution of India.")
    return art

@router.get("/search")
def search_constitution(
    q: str = Query("", description="Keywords to search in articles, headings, doctrines"),
    part: Optional[str] = Query(None, description="Filter by Part (e.g. 'Part III', 'Part IV')"),
    classification: Optional[str] = Query(None, description="Filter by classification (e.g. 'FUNDAMENTAL_RIGHT', 'DPSP', 'JUDICIAL_POWER')"),
    limit: int = Query(25, ge=1, le=100)
):
    """Search the complete Constitution with keyword relevance scoring and filters."""
    service = ConstitutionService.get_instance()
    return service.search(query=q, part=part, classification=classification, limit=limit)

@router.post("/analyze")
def analyze_constitutional_controversy(req: ControversyAnalysisRequest):
    """
    Decompile an arbitrary controversy into matching Fundamental Rights,
    scrutiny standards (Proportionality / Manifest Arbitrariness), and writ remedies.
    """
    service = ConstitutionService.get_instance()
    return service.analyze_controversy(req.facts)
