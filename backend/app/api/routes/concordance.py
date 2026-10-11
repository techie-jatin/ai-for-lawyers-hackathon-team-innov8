from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from pydantic import BaseModel
from typing import List, Optional

from app.api import deps
from app.models.legal import StatutoryConcordance

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

    class Config:
        from_attributes = True

@router.get("/search", response_model=List[ConcordanceItem])
def search_concordance(
    q: Optional[str] = Query(None, description="Section number (e.g. '420', '302', '318') or crime keyword"),
    limit: int = 50,
    db: Session = Depends(deps.get_db)
):
    """
    Search colonial-to-Bharatiya criminal law concordance mappings bidirectionally.
    Matches old section (IPC 420), new section (BNS 318), or offense title.
    """
    query = db.query(StatutoryConcordance)
    if q and q.strip():
        term = q.strip()
        query = query.filter(
            or_(
                StatutoryConcordance.old_section.ilike(f"%{term}%"),
                StatutoryConcordance.new_section.ilike(f"%{term}%"),
                StatutoryConcordance.offense_title.ilike(f"%{term}%"),
                StatutoryConcordance.key_change.ilike(f"%{term}%")
            )
        )
    return query.limit(limit).all()

@router.get("/all", response_model=List[ConcordanceItem])
def get_all_concordance(
    limit: int = 100,
    db: Session = Depends(deps.get_db)
):
    """
    Get all statutory transitions for the criminal law concordance table.
    """
    return db.query(StatutoryConcordance).order_by(StatutoryConcordance.id).limit(limit).all()
