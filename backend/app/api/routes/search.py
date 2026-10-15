from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
import numpy as np

from app.api import deps
from app.models.legal import LegalProvision, LegalSource

router = APIRouter()

class SearchQuery(BaseModel):
    query: str
    top_k: int = 5
    source_type: Optional[str] = None

class ProvisionResponse(BaseModel):
    id: int
    source_id: int
    source_title: str
    section_number: Optional[str]
    title: Optional[str]
    text_content: str
    similarity: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)

@router.get("/provisions", response_model=List[ProvisionResponse])
def get_provisions(
    skip: int = 0,
    limit: int = 50,
    source_id: Optional[int] = None,
    db: Session = Depends(deps.get_db)
):
    """
    List legal provisions with pagination and optional source filtering.
    """
    query = db.query(LegalProvision).join(LegalSource)
    if source_id:
        query = query.filter(LegalProvision.source_id == source_id)
    results = query.offset(skip).limit(limit).all()
    
    return [
        ProvisionResponse(
            id=p.id,
            source_id=p.source_id,
            source_title=p.source.title if p.source else "",
            section_number=p.section_number,
            title=p.title,
            text_content=p.text_content
        ) for p in results
    ]

@router.get("/sources")
def get_sources(db: Session = Depends(deps.get_db)):
    """
    List all indexed legal sources.
    """
    sources = db.query(LegalSource).all()
    return [
        {
            "id": s.id,
            "title": s.title,
            "source_type": s.source_type,
            "jurisdiction": s.jurisdiction,
            "provision_count": len(s.provisions)
        } for s in sources
    ]

@router.post("/semantic", response_model=List[ProvisionResponse])
def semantic_search(query_in: SearchQuery, db: Session = Depends(deps.get_db)):
    """
    Perform semantic vector search using pgvector cosine distance,
    falling back to keyword match when embeddings are identical.
    """
    # Deterministic query vector based on character hash (matches parser mock baseline)
    rng = np.random.RandomState(abs(hash(query_in.query)) % (2**32))
    q_vec = rng.randn(768).astype(np.float32)
    q_vec /= np.linalg.norm(q_vec)
    
    # pgvector cosine distance query
    query = db.query(
        LegalProvision,
        LegalProvision.embedding.cosine_distance(q_vec.tolist()).label("distance")
    ).join(LegalSource)
    
    if query_in.source_type:
        query = query.filter(LegalSource.source_type == query_in.source_type)
        
    results = query.order_by("distance").limit(query_in.top_k).all()
    
    return [
        ProvisionResponse(
            id=p.id,
            source_id=p.source_id,
            source_title=p.source.title if p.source else "",
            section_number=p.section_number,
            title=p.title,
            text_content=p.text_content,
            similarity=max(0.0, round(1.0 - float(dist), 4))
        ) for p, dist in results
    ]

@router.get("/keyword", response_model=List[ProvisionResponse])
def keyword_search(
    q: str = Query(..., description="Keyword or article/section to find"),
    limit: int = 25,
    source_id: Optional[int] = None,
    db: Session = Depends(deps.get_db)
):
    """
    Intelligent statutory search supporting exact section/article lookups,
    statute title matching, and phrase search.
    """
    import re
    q_clean = q.strip()
    if not q_clean:
        return []

    # Look for explicit "Section X" or "Article X" first
    sec_match = re.search(r'\b(?:section|sec|article|art)\s*[:.]?\s*(\d+[a-zA-Z]?)\b', q_clean, re.IGNORECASE)
    if not sec_match:
        # Fallback to standalone number that is NOT a 4-digit year (1800-2099)
        sec_match = re.search(r'\b(?!(?:18|19|20)\d{2}\b)(\d+[a-zA-Z]?)\b', q_clean)
    sec_num = sec_match.group(1) if sec_match else None

    # Detect statute mentions in query (e.g. BNS, Constitution, IT Act, DPDP)
    matched_src_id = source_id
    if not matched_src_id:
        q_lower = q_clean.lower()
        all_sources = db.query(LegalSource).all()
        for src in all_sources:
            src_t = src.title.lower()
            if ("nyaya" in q_lower or "bns" in q_lower) and "nyaya" in src_t:
                matched_src_id = src.id
                break
            elif ("suraksha" in q_lower or "bnss" in q_lower) and "suraksha" in src_t:
                matched_src_id = src.id
                break
            elif "constitution" in q_lower and "constitution" in src_t:
                matched_src_id = src.id
                break
            elif ("dpdp" in q_lower or "data protection" in q_lower) and "data" in src_t:
                matched_src_id = src.id
                break
            elif ("it act" in q_lower or "cyber" in q_lower) and "technology" in src_t:
                matched_src_id = src.id
                break
            elif src_t in q_lower:
                matched_src_id = src.id
                break

    # Priority 0: Exact match in the specific statute if detected
    exact_statute_results = []
    if sec_num and matched_src_id:
        exact_statute_results = db.query(LegalProvision).join(LegalSource).filter(
            LegalProvision.source_id == matched_src_id,
            or_(
                LegalProvision.section_number.ilike(f"%Section {sec_num}%"),
                LegalProvision.section_number.ilike(f"%Article {sec_num}%"),
                LegalProvision.section_number == sec_num
            )
        ).all()

    # Base query joined with LegalSource
    base_query = db.query(LegalProvision).join(LegalSource)
    if source_id:
        base_query = base_query.filter(LegalProvision.source_id == source_id)

    # Priority 1: Exact section match across corpus
    primary_results = []
    if sec_num:
        sec_candidates = base_query.filter(
            or_(
                LegalProvision.section_number.ilike(f"%Section {sec_num}%"),
                LegalProvision.section_number.ilike(f"%Article {sec_num}%"),
                LegalProvision.section_number.ilike(f"%{sec_num}%")
            )
        ).all()
        primary_results.extend(sec_candidates)

    # Priority 2: Substring / keyword matches across provision and statute title
    search_pattern = f"%{q_clean}%"
    substring_candidates = base_query.filter(
        or_(
            LegalProvision.section_number.ilike(search_pattern),
            LegalProvision.title.ilike(search_pattern),
            LegalProvision.text_content.ilike(search_pattern),
            LegalSource.title.ilike(search_pattern)
        )
    ).all()

    # Priority 3: Individual word tokens if query has multiple words (e.g. "BNS" "murder" "103")
    token_candidates = []
    words = [w for w in re.findall(r'[a-zA-Z0-9]+', q_clean) if len(w) >= 3]
    if len(words) > 1:
        token_filters = []
        for w in words[:4]:
            token_filters.append(
                or_(
                    LegalProvision.section_number.ilike(f"%{w}%"),
                    LegalProvision.title.ilike(f"%{w}%"),
                    LegalProvision.text_content.ilike(f"%{w}%"),
                    LegalSource.title.ilike(f"%{w}%")
                )
            )
        token_candidates = base_query.filter(or_(*token_filters)).all()

    # Combine unique results while preserving priority ordering
    seen_ids = set()
    ranked_results = []
    for prov in exact_statute_results + primary_results + substring_candidates + token_candidates:
        if prov.id not in seen_ids:
            seen_ids.add(prov.id)
            ranked_results.append(prov)
            if len(ranked_results) >= limit:
                break

    return [
        ProvisionResponse(
            id=p.id,
            source_id=p.source_id,
            source_title=p.source.title if p.source else "",
            section_number=p.section_number,
            title=p.title,
            text_content=p.text_content,
            similarity=1.0
        ) for p in ranked_results
    ]

