from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional, Dict, Any

from app.api import deps
from app.models.legal import StatutoryConcordance
from app.services.concordance_service import StatutoryConcordanceService, CONCORDANCE_MASTER_DATA

router = APIRouter()

class ConcordanceItem(BaseModel):
    id: int
    old_act: str
    old_section: str
    new_act: str
    new_section: str
    offense_title: str
    status: str
    penalty_summary: Optional[str] = None
    bailable_status: Optional[str] = None
    cognizable_status: Optional[str] = None
    key_change: Optional[str] = None
    category: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class TransitionAdvisorRequest(BaseModel):
    incident_date: str = Field(..., description="Date of alleged offence or dispute in YYYY-MM-DD or DD/MM/YYYY format")


def _ensure_concordance_seeded(db: Session):
    """Auto-seeds missing items from CONCORDANCE_MASTER_DATA if DB has fewer than 100 rows."""
    try:
        current_count = db.query(StatutoryConcordance).count()
        if current_count < len(CONCORDANCE_MASTER_DATA):
            existing_sections = {r.old_section for r in db.query(StatutoryConcordance.old_section).all()}
            new_objs = []
            for item in CONCORDANCE_MASTER_DATA:
                if item["old_section"] not in existing_sections:
                    new_objs.append(
                        StatutoryConcordance(
                            old_act=item["old_act"],
                            old_section=item["old_section"],
                            new_act=item["new_act"],
                            new_section=item["new_section"],
                            offense_title=item["offense_title"],
                            status=item.get("status", "Active"),
                            penalty_summary=item.get("penalty_summary"),
                            bailable_status=item.get("bailable_status"),
                            cognizable_status=item.get("cognizable_status"),
                            key_change=item.get("key_change")
                        )
                    )
            if new_objs:
                db.add_all(new_objs)
                db.commit()
    except Exception as e:
        db.rollback()


@router.get("/search", response_model=List[ConcordanceItem])
def search_concordance(
    q: Optional[str] = Query(None, description="Section number (e.g. '420', '302', '318', '438') or crime keyword"),
    category: Optional[str] = Query(None, description="Category filter: 'IPC_BNS', 'CrPC_BNSS', 'IEA_BSA', 'SAVINGS_TRANSITION'"),
    limit: int = 100,
    db: Session = Depends(deps.get_db)
):
    """
    Search colonial-to-Bharatiya criminal law concordance mappings bidirectionally across 100+ provisions.
    Matches old section (IPC 420), new section (BNS 318), or offense title.
    """
    _ensure_concordance_seeded(db)

    # Use service for fast in-memory search with fallback to DB
    items = StatutoryConcordanceService.search(query_str=q, category_filter=category, limit=limit)
    return items


@router.get("", response_model=List[ConcordanceItem])
@router.get("/all", response_model=List[ConcordanceItem])
def get_all_concordance(
    category: Optional[str] = Query(None, description="Category filter"),
    limit: int = 150,
    db: Session = Depends(deps.get_db)
):
    """
    Get all statutory transitions for the criminal law concordance table (100+ provisions).
    """
    _ensure_concordance_seeded(db)
    items = StatutoryConcordanceService.search(query_str=None, category_filter=category, limit=limit)
    return items


@router.post("/transition-advisor")
def evaluate_transition_date(req: TransitionAdvisorRequest):
    """
    Authoritative Transition Date & Savings Clause Advisor:
    Evaluates whether IPC 1860 / CrPC 1973 or BNS 2023 / BNSS 2023 applies based on the incident date.
    Cites Section 358 BNS, Section 531 BNSS, and Article 20(1) of the Constitution of India.
    """
    result = StatutoryConcordanceService.evaluate_transition_date(req.incident_date)
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("message"))
    return result
