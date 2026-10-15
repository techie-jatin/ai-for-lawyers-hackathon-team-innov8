from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Dict, Any, Optional

from app.api import deps
from app.models.legal import RealCasePrecedent

router = APIRouter()

def serialize_precedent(p: RealCasePrecedent, full: bool = True) -> Dict[str, Any]:
    data = {
        "id": p.id,
        "title": p.title,
        "citation": p.citation,
        "court": p.court,
        "bench": p.bench,
        "decision_year": p.decision_year,
        "category": p.category,
        "governing_provisions": p.governing_provisions or [],
        "sanhita_mapping_2024": p.sanhita_mapping_2024,
        "key_takeaways": p.key_takeaways or [],
    }
    if full:
        data.update({
            "factual_matrix": p.factual_matrix,
            "legal_controversy": p.legal_controversy,
            "court_holding": p.court_holding,
            "advocate_strategy": p.advocate_strategy,
        })
    else:
        # Short snippet for preview
        data.update({
            "factual_matrix": (p.factual_matrix[:220] + "...") if len(p.factual_matrix) > 220 else p.factual_matrix,
            "court_holding": (p.court_holding[:220] + "...") if len(p.court_holding) > 220 else p.court_holding,
        })
    return data

@router.get("")
@router.get("/all")
def get_all_precedents(
    category: Optional[str] = Query(None, description="Optional category filter"),
    db: Session = Depends(deps.get_db)
) -> List[Dict[str, Any]]:
    """
    List all cataloged real-world case precedents with full courtroom dossier data.
    """
    query = db.query(RealCasePrecedent)
    if category:
        query = query.filter(RealCasePrecedent.category.ilike(f"%{category}%"))
    cases = query.order_by(RealCasePrecedent.decision_year.desc()).all()
    return [serialize_precedent(c, full=True) for c in cases]

@router.get("/similar")
def find_similar_precedents(
    query: Optional[str] = Query(None, description="Legal query or facts to match"),
    category: Optional[str] = Query(None, description="Statutory domain/pillar"),
    limit: int = Query(4, ge=1, le=12),
    db: Session = Depends(deps.get_db)
) -> List[Dict[str, Any]]:
    """
    Find matching real-world precedents based on keywords in factual matrix, legal controversy,
    governing provisions, or category.
    """
    base_query = db.query(RealCasePrecedent)
    
    if not query and not category:
        cases = base_query.order_by(RealCasePrecedent.decision_year.desc()).limit(limit).all()
        return [serialize_precedent(c, full=True) for c in cases]

    filters = []
    if category:
        # Match category or keywords within category
        filters.append(RealCasePrecedent.category.ilike(f"%{category}%"))

    if query:
        # Extract meaningful terms
        terms = [t.strip() for t in query.split() if len(t.strip()) > 3]
        term_filters = []
        for term in terms[:6]:  # Limit term search to top 6 keywords
            term_filters.append(RealCasePrecedent.title.ilike(f"%{term}%"))
            term_filters.append(RealCasePrecedent.factual_matrix.ilike(f"%{term}%"))
            term_filters.append(RealCasePrecedent.legal_controversy.ilike(f"%{term}%"))
            term_filters.append(RealCasePrecedent.court_holding.ilike(f"%{term}%"))
            term_filters.append(RealCasePrecedent.advocate_strategy.ilike(f"%{term}%"))
            term_filters.append(RealCasePrecedent.sanhita_mapping_2024.ilike(f"%{term}%"))
        
        if term_filters:
            filters.append(or_(*term_filters))

    if filters:
        matched = base_query.filter(or_(*filters)).limit(limit).all()
    else:
        matched = base_query.limit(limit).all()

    # If specific query/category was provided and no precedents matched, return empty list (never hallucinate unrelated cases)
    if not matched:
        return []

    return [serialize_precedent(c, full=True) for c in matched]

@router.get("/{precedent_id}")
def get_precedent_detail(
    precedent_id: int,
    db: Session = Depends(deps.get_db)
) -> Dict[str, Any]:
    """
    Retrieve full 6-point Courtroom Dossier for a specific precedent ID.
    """
    case = db.query(RealCasePrecedent).filter(RealCasePrecedent.id == precedent_id).first()
    if not case:
        raise HTTPException(status_code=404, detail=f"Precedent with ID {precedent_id} not found")
    return serialize_precedent(case, full=True)
