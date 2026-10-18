"""
constitution_service.py - Complete Constitution of India REA Intelligence Service
Bharat Legal Intelligence 2.0 (Reverse Engineer Anything - REA Methodology)

Provides high-speed indexed search, article decompilation, Constitution Bench
precedent citation, and automated constitutional controversy analysis.
"""

import os
import json
import re
from typing import Dict, List, Optional, Any

SERVICE_DIR = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.dirname(SERVICE_DIR)
BACKEND_DIR = os.path.dirname(APP_DIR)
DATA_FILE = os.path.join(BACKEND_DIR, "data", "constitution_complete.json")

class ConstitutionService:
    _instance: Optional["ConstitutionService"] = None
    _corpus: Optional[Dict[str, Any]] = None
    _article_map: Dict[str, Dict[str, Any]] = {}

    @classmethod
    def get_instance(cls) -> "ConstitutionService":
        if cls._instance is None:
            cls._instance = cls()
            cls._instance._load_corpus()
        return cls._instance

    def _load_corpus(self):
        if not os.path.exists(DATA_FILE):
            # Fallback to local default if file not compiled yet
            self._corpus = {
                "preamble": {},
                "parts_metadata": [],
                "schedules": [],
                "articles": []
            }
            return

        with open(DATA_FILE, "r", encoding="utf-8") as f:
            self._corpus = json.load(f)

        self._article_map = {}
        for a in self._corpus.get("articles", []):
            num = a.get("article_number", "").strip().lower()
            clean_num = num.replace("article ", "").strip()
            self._article_map[clean_num] = a
            self._article_map[f"article {clean_num}"] = a
            self._article_map[a.get("article_id", "").strip().lower()] = a

    def get_preamble(self) -> Dict[str, Any]:
        return self._corpus.get("preamble", {}) if self._corpus else {}

    def get_schedules(self) -> List[Dict[str, Any]]:
        return self._corpus.get("schedules", []) if self._corpus else []

    def get_parts(self) -> List[Dict[str, Any]]:
        return self._corpus.get("parts_metadata", []) if self._corpus else []

    def get_article(self, query_id: str) -> Optional[Dict[str, Any]]:
        if not self._article_map:
            return None
        key = query_id.strip().lower()
        key_clean = key.replace("article ", "").replace("art-", "").replace("art.", "").strip()
        return self._article_map.get(key_clean) or self._article_map.get(f"article {key_clean}")

    def search(self, query: str, part: Optional[str] = None, classification: Optional[str] = None, limit: int = 25) -> List[Dict[str, Any]]:
        if not self._corpus:
            return []

        q_terms = [t for t in re.split(r"\s+", query.strip().lower()) if len(t) >= 2]
        if not q_terms:
            return self._corpus.get("articles", [])[:limit]

        scored: List[tuple] = []
        for a in self._corpus.get("articles", []):
            if part and part.lower() not in a.get("part_number", "").lower():
                continue
            if classification and classification.upper() != a.get("classification", "").upper():
                continue

            score = 0
            art_num = a.get("article_number", "").lower()
            heading = a.get("heading", "").lower()
            text = a.get("verbatim_text", "").lower()
            plain = a.get("plain_explanation", "").lower()
            doctrines = " ".join(a.get("applicable_doctrines", [])).lower()

            for term in q_terms:
                if term in art_num:
                    score += 50
                if term in heading:
                    score += 30
                if term in doctrines:
                    score += 20
                if term in plain:
                    score += 10
                if term in text:
                    score += 5

            if score > 0:
                scored.append((score, a))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored[:limit]]

    def analyze_controversy(self, facts: str) -> Dict[str, Any]:
        """
        Decompiles any arbitrary citizen or advocate factual controversy
        against constitutional provisions, standards of scrutiny, and writ remedies.
        """
        t_lower = facts.lower()
        invoked_articles: List[Dict[str, Any]] = []

        # Equality & Arbitrariness (Article 14)
        if any(w in t_lower for w in ["arbitrary", "discrimina", "equal", "unfairly treated", "bias", "favouritism", "tender cancelled", "blacklist"]):
            art = self.get_article("14")
            if art:
                invoked_articles.append(art)

        # Free Speech, Association, Business (Article 19)
        if any(w in t_lower for w in ["speech", "protest", "censorship", "shutdown", "internet", "licence cancelled", "sealed shop", "business closed", "union", "post deleted", "fir for tweet"]):
            art = self.get_article("19")
            if art:
                invoked_articles.append(art)

        # Life, Liberty, Privacy, Dignity (Article 21)
        if any(w in t_lower for w in ["arrest", "custod", "jail", "bail", "detain", "police", "torture", "phone tap", "privacy", "medical", "hospital refusal", "life", "clean water", "pollution"]):
            art = self.get_article("21")
            if art:
                invoked_articles.append(art)

        # Arrest Safeguards (Article 22)
        if any(w in t_lower for w in ["arrest", "without warrant", "not produced", "24 hours", "magistrate", "grounds of arrest", "custodial", "handcuff"]):
            art = self.get_article("22")
            if art:
                invoked_articles.append(art)

        # Property Deprivation & Demolition (Article 300A)
        if any(w in t_lower for w in ["demolition", "bulldozer", "land", "acquired", "possession", "evict", "seized", "compensation", "property"]):
            art = self.get_article("300A")
            if art:
                invoked_articles.append(art)

        # Civil Services Dismissal (Article 311)
        if any(w in t_lower for w in ["civil servant", "dismissed", "government employee", "inquiry", "charge sheet", "suspended", "demoted"]):
            art = self.get_article("311")
            if art:
                invoked_articles.append(art)

        # High Court Writ Remedy (Article 226)
        art_226 = self.get_article("226")
        if art_226 and art_226 not in invoked_articles:
            invoked_articles.append(art_226)

        # Default fallback to Art 14 & 21
        if not invoked_articles:
            a14 = self.get_article("14")
            a21 = self.get_article("21")
            if a14: invoked_articles.append(a14)
            if a21: invoked_articles.append(a21)

        # Identify Writ Nature
        writ_type = "WRIT OF MANDAMUS"
        if any(w in t_lower for w in ["arrest", "detain", "missing", "illegal custody", "police station"]):
            writ_type = "WRIT OF HABEAS CORPUS"
        elif any(w in t_lower for w in ["quash", "order passed", "cancelling", "impugned notification", "penalty order"]):
            writ_type = "WRIT OF CERTIORARI"
        elif any(w in t_lower for w in ["usurped", "not qualified", "appointed illegally", "eligibility"]):
            writ_type = "WRIT OF QUO WARRANTO"
        elif any(w in t_lower for w in ["tribunal", "without jurisdiction", "stay proceedings", "prohibit"]):
            writ_type = "WRIT OF PROHIBITION"

        # Standard of Scrutiny
        scrutiny_standard = (
            "Four-Pronged Proportionality Standard (K.S. Puttaswamy): "
            "1. Legitimate State Aim; 2. Rational Nexus; 3. Necessity (Least Restrictive Measure); 4. Balancing."
        )
        if "arbitrary" in t_lower or "tender" in t_lower:
            scrutiny_standard = (
                "Manifest Arbitrariness Doctrine (Shayara Bano): "
                "The State action is irrational, capricious, without adequate determining principle, and violative of Article 14."
            )

        return {
            "is_constitutional_matter": True,
            "recommended_forum": "Hon'ble High Court under Article 226 / Hon'ble Supreme Court under Article 32",
            "recommended_writ": writ_type,
            "scrutiny_standard": scrutiny_standard,
            "invoked_articles": invoked_articles,
            "constitutional_doctrines": list(set([doc for a in invoked_articles for doc in a.get("applicable_doctrines", [])])),
            "key_precedents": [p for a in invoked_articles for p in a.get("landmark_precedents", [])][:4],
            "advocate_pleading_summary": (
                f"Invoke {writ_type} before the High Court under Article 226. "
                f"Plead violation of fundamental rights guaranteed under "
                f"{', '.join([a['article_number'] for a in invoked_articles])}. "
                f"Subject the impugned State action to the {scrutiny_standard.split(':')[0]}."
            )
        }
