from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from difflib import SequenceMatcher
import re

from app.models.legal import LegalProvision, LegalSource

class CitationValidationResult:
    def __init__(
        self,
        citation_id: Optional[int],
        provision_id: Optional[int],
        source_title: str,
        section_number: str,
        is_valid: bool,
        quote_verified: bool,
        match_ratio: float,
        reason: str
    ):
        self.citation_id = citation_id
        self.provision_id = provision_id
        self.source_title = source_title
        self.section_number = section_number
        self.is_valid = is_valid
        self.quote_verified = quote_verified
        self.match_ratio = match_ratio
        self.reason = reason

    def to_dict(self) -> Dict[str, Any]:
        return {
            "provision_id": self.provision_id,
            "source_title": self.source_title,
            "section_number": self.section_number,
            "is_valid": self.is_valid,
            "quote_verified": self.quote_verified,
            "match_ratio": round(self.match_ratio, 3),
            "reason": self.reason
        }

class CitationValidator:
    def __init__(self, db: Session):
        self.db = db

    def validate_citation(
        self,
        provision_id: Optional[int],
        claimed_section: Optional[str],
        claimed_quote: Optional[str]
    ) -> CitationValidationResult:
        """
        Validates whether a cited legal provision exists and whether the quoted
        text is genuinely present in the authoritative statutory source.
        """
        # 1. Check provision by ID or claimed section
        provision = None
        if provision_id:
            provision = self.db.query(LegalProvision).filter(LegalProvision.id == provision_id).first()
        elif claimed_section:
            provision = self.db.query(LegalProvision).filter(
                LegalProvision.section_number.ilike(claimed_section.strip())
            ).first()

        if not provision:
            return CitationValidationResult(
                citation_id=None,
                provision_id=provision_id,
                source_title="Unknown",
                section_number=claimed_section or "Unknown",
                is_valid=False,
                quote_verified=False,
                match_ratio=0.0,
                reason="Citation refers to a non-existent provision or unverified source."
            )

        source_title = provision.source.title if provision.source else "Registered Law"

        # 2. Check quoted excerpt if provided
        if not claimed_quote or not claimed_quote.strip():
            return CitationValidationResult(
                citation_id=None,
                provision_id=provision.id,
                source_title=source_title,
                section_number=provision.section_number or "",
                is_valid=True,
                quote_verified=False,
                match_ratio=1.0,
                reason="Provision verified in official registry; no quotation provided."
            )

        cleaned_quote = re.sub(r'\s+', ' ', claimed_quote.strip().lower())
        cleaned_text = re.sub(r'\s+', ' ', provision.text_content.lower())

        # Exact substring match
        if cleaned_quote in cleaned_text:
            return CitationValidationResult(
                citation_id=None,
                provision_id=provision.id,
                source_title=source_title,
                section_number=provision.section_number or "",
                is_valid=True,
                quote_verified=True,
                match_ratio=1.0,
                reason="Exact statutory quotation verified against authoritative text."
            )

        # Fuzzy substring match
        # Check best match ratio across sliding windows
        quote_len = len(cleaned_quote)
        best_ratio = 0.0
        step = max(1, quote_len // 4)
        for i in range(0, max(1, len(cleaned_text) - quote_len + 1), step):
            window = cleaned_text[i : i + quote_len + 20]
            ratio = SequenceMatcher(None, cleaned_quote, window).ratio()
            if ratio > best_ratio:
                best_ratio = ratio

        if best_ratio >= 0.75:
            return CitationValidationResult(
                citation_id=None,
                provision_id=provision.id,
                source_title=source_title,
                section_number=provision.section_number or "",
                is_valid=True,
                quote_verified=True,
                match_ratio=best_ratio,
                reason=f"High-confidence paraphrase/quote verified ({round(best_ratio * 100)}% similarity)."
            )
        else:
            return CitationValidationResult(
                citation_id=None,
                provision_id=provision.id,
                source_title=source_title,
                section_number=provision.section_number or "",
                is_valid=False,
                quote_verified=False,
                match_ratio=best_ratio,
                reason="Claimed quotation cannot be substantiated from the authoritative provision text."
            )

    def validate_answer(self, answer_claims: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Validates multiple citations attached to an AI answer.
        Returns aggregate trust score and individual verification results.
        """
        results = []
        valid_count = 0

        for claim in answer_claims:
            res = self.validate_citation(
                provision_id=claim.get("provision_id"),
                claimed_section=claim.get("section_number"),
                claimed_quote=claim.get("quote")
            )
            if res.is_valid:
                valid_count += 1
            results.append(res.to_dict())

        total = len(answer_claims)
        trust_score = round(valid_count / total, 2) if total > 0 else 1.0

        return {
            "total_citations": total,
            "valid_citations": valid_count,
            "trust_score": trust_score,
            "all_verified": (valid_count == total),
            "citations": results
        }
