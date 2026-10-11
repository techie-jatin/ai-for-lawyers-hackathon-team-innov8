from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from app.api import deps
from app.models.legal import GazetteNotification, LegalHelpline

router = APIRouter()

class GazetteItem(BaseModel):
    id: int
    ministry: str
    notification_ref: str
    title: str
    effective_date: Optional[str] = None
    category: Optional[str] = None
    summary: str
    official_url: Optional[str] = None

    class Config:
        from_attributes = True

class HelplineItem(BaseModel):
    id: int
    category: str
    service_name: str
    short_code: str
    hours: str
    description: str
    jurisdiction: str

    class Config:
        from_attributes = True

@router.get("/gazettes", response_model=List[GazetteItem])
def get_gazette_notifications(db: Session = Depends(deps.get_db)):
    """
    List all indexed central gazette notifications and statutory circulars.
    """
    return db.query(GazetteNotification).order_by(GazetteNotification.id.desc()).all()

@router.get("/helplines", response_model=List[HelplineItem])
def get_legal_helplines(
    category: Optional[str] = Query(None),
    db: Session = Depends(deps.get_db)
):
    """
    List statutory helplines and legal aid contacts.
    """
    query = db.query(LegalHelpline)
    if category:
        query = query.filter(LegalHelpline.category == category)
    return query.order_by(LegalHelpline.id).all()
