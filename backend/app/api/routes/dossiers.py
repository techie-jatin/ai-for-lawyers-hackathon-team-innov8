from fastapi import APIRouter, Depends, HTTPException, Query, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

from app.api import deps
from app.models.legal import ChamberDossier

router = APIRouter()

class CreateDossierRequest(BaseModel):
    guest_id: Optional[str] = None
    docket_number: Optional[str] = None
    title: str
    category: Optional[str] = "Criminal Law (BNS)"
    mode: Optional[str] = "professional"
    initial_query: Optional[str] = None
    legal_summary: Optional[str] = None
    applicable_sections: Optional[List[Any]] = None
    notes: Optional[str] = None

class DossierResponse(BaseModel):
    id: int
    guest_id: Optional[str] = None
    docket_number: str
    title: str
    category: str
    mode: str
    initial_query: Optional[str] = None
    legal_summary: Optional[str] = None
    applicable_sections: Optional[List[Any]] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

@router.get("", response_model=List[DossierResponse])
def get_all_dossiers(
    guest_id: Optional[str] = Query(None, description="Optional guest session ID to filter dossiers"),
    x_guest_id: Optional[str] = Header(None, alias="X-Guest-ID"),
    db: Session = Depends(deps.get_db)
):
    """
    Get saved chamber research dossiers, scoped to the active guest user session.
    """
    effective_guest_id = guest_id or x_guest_id
    query = db.query(ChamberDossier)
    if effective_guest_id:
        query = query.filter(ChamberDossier.guest_id == effective_guest_id)
    return query.order_by(ChamberDossier.id.desc()).all()

@router.post("", response_model=DossierResponse)
def create_dossier(req: CreateDossierRequest, db: Session = Depends(deps.get_db)):
    """
    Save a research session / opinion to the advocate's chamber dossier.
    """
    docket_num = req.docket_number or f"#CR-2025-{100 + db.query(ChamberDossier).count() + 1}"
    dossier = ChamberDossier(
        guest_id=req.guest_id,
        docket_number=docket_num,
        title=req.title,
        category=req.category or "Criminal Law (BNS)",
        mode=req.mode or "professional",
        initial_query=req.initial_query,
        legal_summary=req.legal_summary,
        applicable_sections=req.applicable_sections or [],
        notes=req.notes
    )
    db.add(dossier)
    db.commit()
    db.refresh(dossier)
    return dossier

@router.delete("/{dossier_id}")
def delete_dossier(dossier_id: int, db: Session = Depends(deps.get_db)):
    """
    Delete a saved dossier.
    """
    dossier = db.query(ChamberDossier).filter(ChamberDossier.id == dossier_id).first()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier not found")
    db.delete(dossier)
    db.commit()
    return {"status": "success", "deleted_id": dossier_id}
