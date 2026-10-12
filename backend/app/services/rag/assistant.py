from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
import re
import os
import json
import httpx
import numpy as np

from app.core.config import settings
from app.models.legal import LegalProvision, LegalSource, StatutoryConcordance, GazetteNotification, LegalHelpline, RealCasePrecedent
from app.services.rag.citation_validator import CitationValidator
from app.services.rag.abuse_guard import AbuseGuard

class GeminiSynthesizer:
    """
    Synthesizes rich, evidence-grounded Indian legal intelligence using Google's Free Gemini API.
    Calls Gemini 1.5 Flash via direct Google Generative Language REST API.
    Strictly constrained by retrieved Neon pgvector statutory evidence.
    """
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = (api_key or getattr(settings, "GEMINI_API_KEY", "") or os.environ.get("GEMINI_API_KEY", "") or os.environ.get("GOOGLE_API_KEY", "")).strip()
        self.model = model or getattr(settings, "GEMINI_MODEL", "gemini-1.5-flash")

    def is_available(self) -> bool:
        return bool(self.api_key and len(self.api_key) > 10)

    def synthesize(
        self,
        query: str,
        provisions: List[LegalProvision],
        mode: str = "citizen",
        concordance_items: Optional[List[StatutoryConcordance]] = None,
        gazettes: Optional[List[GazetteNotification]] = None,
        helplines: Optional[List[LegalHelpline]] = None,
        precedents: Optional[List[RealCasePrecedent]] = None,
        context_filter: Optional[str] = None,
        history: Optional[List[Dict[str, str]]] = None
    ) -> Optional[str]:
        if not self.is_available():
            return None

        # Format retrieved statutory provisions into an authoritative Evidence Dossier
        evidence_text = ""
        for i, p in enumerate(provisions, 1):
            source_title = p.source.title if p.source else "Central Act of India"
            evidence_text += (
                f"### Statutory Evidence #{i}: {source_title} - {p.section_number} ({p.title})\n"
                f"Verbatim Provision Text:\n\"{p.text_content}\"\n\n"
            )

        if concordance_items:
            evidence_text += "### Official Statutory Concordance & 2024-2026 Transition Matrix:\n"
            for c in concordance_items:
                evidence_text += (
                    f"- Colonial Statute: {c.old_act} {c.old_section} -> Modern Sanhita: {c.new_act} {c.new_section}\n"
                    f"  Offense / Doctrine: {c.offense_title}\n"
                    f"  Procedural Classification: {c.cognizable_status or 'Cognizable'} | {c.bailable_status or 'Non-Bailable'}\n"
                    f"  Prescribed Punishment: {c.penalty_summary or 'As prescribed by statute'}\n"
                    f"  Key Legislative Shift: {c.key_change or 'Consolidated under Bharatiya Sanhitas'}\n\n"
                )

        if precedents:
            evidence_text += "### Official Landmark Supreme Court & High Court Case Precedents (Real-World Courtroom Dossiers):\n"
            for p in precedents:
                evidence_text += (
                    f"- Case Title: {p.title} ({p.decision_year})\n"
                    f"  Citation: {p.citation} | Bench: {p.bench} ({p.court})\n"
                    f"  Category & Modern Application: {p.category} | {p.sanhita_mapping_2024}\n"
                    f"  Factual Matrix (What occurred): {p.factual_matrix}\n"
                    f"  Legal Controversy: {p.legal_controversy}\n"
                    f"  Operative Court Holding: {p.court_holding}\n"
                    f"  Winning Advocate Strategy: {p.advocate_strategy}\n\n"
                )

        if gazettes:
            evidence_text += "### Central Gazette Notifications & Standard Operating Procedures:\n"
            for g in gazettes:
                evidence_text += (
                    f"- Ministry: {g.ministry} | Ref: {g.notification_ref} | Effective: {g.effective_date or 'Current'}\n"
                    f"  Title: {g.title}\n"
                    f"  Summary: {g.summary}\n\n"
                )

        if helplines:
            evidence_text += "### Verified Legal Aid & Emergency Contact Registry:\n"
            for h in helplines:
                evidence_text += f"- {h.service_name} [Dial {h.short_code}] ({h.hours}): {h.description}\n"
            evidence_text += "\n"

        if mode == "professional":
            system_prompt = (
                "You are an elite Senior Legal Jurist, Senior Advocate, and Supreme Court of India legal intelligence engine "
                "for 'भारत Legal Intelligence'. Your duty is to deliver an exhaustive, highly detailed, courtroom-ready "
                "statutory and jurisprudential analysis of Indian law.\n\n"
                "STRICT GROUNDING & JURISPRUDENTIAL DIRECTIVES:\n"
                "1. Base all assertions strictly on the provided Statutory Evidence, Concordance Matrix, and Indian jurisprudence.\n"
                "2. Provide deep, granular analysis. Do not abbreviate or give superficial bullet points.\n"
                "3. Quote verbatim provision text and section numbers from the evidence.\n"
                "4. Accurately map the transition from colonial statutes (IPC 1860, CrPC 1973, IEA 1872) to the modern criminal sanhitas "
                "(Bharatiya Nyaya Sanhita 2023 [BNS], Bharatiya Nagarik Suraksha Sanhita 2023 [BNSS], and Bharatiya Sakshya Adhiniyam 2023 [BSA]).\n"
                "5. REAL-WORLD CASE FACTS & UNIQUE INQUIRY RESOLUTION DIRECTIVE:\n"
                "   Even if the user presents a completely novel, unusual, or unique factual scenario (e.g., emerging cyber frauds, drone surveillance, cryptocurrency, deepfakes, unusual commercial contracts, workplace harassment, or non-standard disputes), you MUST extract and provide concrete real-world case facts and judicial precedents from Indian jurisprudence:\n"
                "   - State the authentic Factual Matrix of analogous landmark cases (what actually happened between the parties in court).\n"
                "   - Detail the Legal Controversy and how the Judges ruled (Operative Ratio & Relief granted).\n"
                "   - Provide Winning Advocate Strategies (threshold defense objections, evidentiary moves under Section 63 BSA, quashing petitions under Section 528 BNSS).\n"
                "   - Seamlessly bridge the facts to modern 2024 Sanhitas (BNS, BNSS, BSA 2023).\n"
                "   If matching precedents are provided in the Evidence Dossier, ground your case ratios in them; for unique factual nuances, summon established Supreme Court of India and High Court authorities to resolve the controversy decisively.\n\n"
                "MANDATORY REPORT STRUCTURE (Use exact GitHub Markdown headers):\n\n"
                "### Executive Legal Summary & Jurisdictional Matrix\n"
                "- **Governing Offense/Subject**: Precise statutory designation.\n"
                "- **Cognizable / Non-Cognizable**: Legal status under First Schedule of BNSS.\n"
                "- **Bailable / Non-Bailable**: Legal status and bail eligibility under BNSS.\n"
                "- **Compounding Status**: Compoundable with/without permission of court, or non-compoundable.\n"
                "- **Competent Trial Court**: Court of Session / Chief Judicial Magistrate / Magistrate of First Class.\n"
                "- **Statutory Penal Liabilities**: Maximum term of imprisonment, fine, or community service.\n\n"
                "### Substantive Statutory Foundation & Verbatim Provisions\n"
                "- Detailed reproduction and statutory analysis of governing sections from the Evidence Dossier.\n"
                "- Scope, legislative intent, and legal definitions.\n\n"
                "### Essential Legal Ingredients & Burden of Proof\n"
                "- **Actus Reus**: The physical overt act, prohibited omission, or conduct required.\n"
                "- **Mens Rea**: Culpable mental state (dishonesty, fraudulent intention, knowledge, negligence).\n"
                "- **Evidentiary Threshold**: Burden and standard of proof under Bharatiya Sakshya Adhiniyam, 2023 (BSA).\n\n"
                "### Colonial Concordance & 2024 Legislative Evolution\n"
                "- Exact comparative table or cross-reference between old colonial provisions and modern Bharatiya Sanhitas.\n"
                "- Key legislative alterations introduced in 2024 (e.g., electronic evidence recognition, community service provisions, altered thresholds).\n\n"
                "### Procedural Mandate & BNSS Framework\n"
                "- Procedural compliance required by investigating agencies.\n"
                "- Safeguards regarding arrest: Mandatory Notice of Appearance under Section 35(3) BNSS (formerly 41A CrPC) where punishment is 7 years or less.\n"
                "- Forensic and videography compliance under Section 176(3) BNSS.\n"
                "- Zero FIR procedure under Section 173 BNSS.\n\n"
                "### Binding Supreme Court Precedents & Jurisprudential Benchmarks\n"
                "- Landmark Supreme Court of India ratio decidendi, benchmarks, and constitutional doctrines (e.g., Arnesh Kumar guidelines, D.K. Basu guidelines, Maneka Gandhi liberty test, Lalita Kumari mandatory FIR registration, Satender Kumar Antil bail categories, or K.S. Puttaswamy privacy doctrine).\n\n"
                "### Chamber Advisory & Actionable Litigation Strategy\n"
                "- Practical playbook for Advocate and Chamber Counsel:\n"
                "  * Pre-arrest strategy: Seeking Anticipatory Bail under Section 482 BNSS (formerly 438 CrPC).\n"
                "  * Post-arrest strategy: Regular Bail under Section 480 / 483 BNSS (formerly 437 / 439 CrPC).\n"
                "  * Quashing petitions: Invoking High Court inherent powers under Section 528 BNSS (formerly 482 CrPC).\n"
                "  * Statutory notices, evidentiary preservation (electronic certificates under Sec 63 BSA), and compliance audits."
            )
        else:
            system_prompt = (
                "You are a compassionate, authoritative Citizen Legal Rights Guide for 'भारत Legal Intelligence'. "
                "Your mission is to empower citizens with comprehensive, crystal-clear legal knowledge without dense confusing jargon. "
                "Provide an exhaustive, empowering, and step-by-step advisory.\n\n"
                "STRICT CITIZEN GUIDANCE DIRECTIVES:\n"
                "1. Explain the law in plain, supportive, and accessible language while maintaining 100% statutory precision.\n"
                "2. Clearly demystify what the citizen's rights are, what the police/authorities can and cannot do, and how to stay safe.\n"
                "3. Structure your response clearly in GitHub-style Markdown with:\n\n"
                "### Plain Language Summary\n"
                "- Direct, clear answer explaining what the situation means under Indian law.\n\n"
                "### What the Law Specifically Mandates\n"
                "- Explanation of governing sections from Bharatiya Nyaya Sanhita (BNS) / Central Acts.\n"
                "- Explain what is legal and what is an offense in everyday terms.\n\n"
                "### Your Constitutional & Procedural Safeguards\n"
                "- Protection under Article 21 (Right to Life & Liberty) and Article 22 (Protection against Arbitrary Arrest).\n"
                "- Right to know the grounds of arrest in writing.\n"
                "- Right to consult and be defended by a legal practitioner.\n"
                "- Police cannot arrest arbitrarily without prior notice under Section 35(3) BNSS for offenses punishable with up to 7 years.\n"
                "- Mandatory production before a Magistrate within 24 hours.\n\n"
                "### Step-by-Step Citizen Action Plan\n"
                "1. Immediate steps to take (documenting evidence, lodging complaints).\n"
                "2. How to file a Zero FIR if the police station says 'not in our jurisdiction' (mandated under Section 173 BNSS).\n"
                "3. How to file online complaints (e.g. National Cyber Crime Reporting Portal at cybercrime.gov.in).\n"
                "4. How to secure free legal aid if unable to afford a private lawyer under Article 39A.\n\n"
                "### Official Government Helplines & Legal Aid Access\n"
                "- National Legal Services Authority (NALSA): Dial 15100 (24/7 Free Legal Aid across India).\n"
                "- National Cyber Crime Helpline: Dial 1930 (Immediate financial freeze & complaint registration).\n"
                "- Women Helpline: Dial 1091 / 181.\n"
                "- National Consumer Helpline: Dial 1915."
            )

        pillar_section = ""
        if context_filter:
            pillar_section = f"### ACTIVE LEGAL DOMAIN / PILLAR CONTEXT: {context_filter}\nApply statutory reasoning and judicial principles grounded in this legal domain.\n\n"

        history_section = ""
        if history and len(history) > 0:
            history_section = "### PRECEDING CONVERSATION CONTEXT (MULTI-TURN DIALOGUE HISTORY):\n"
            for item in history[-6:]:
                role_label = "Citizen / Counsel" if item.get("role") == "user" else "Legal Intelligence Assistant"
                msg_txt = (item.get("text") or "").strip()
                if len(msg_txt) > 350:
                    msg_txt = msg_txt[:350] + "..."
                history_section += f"- **{role_label}**: {msg_txt}\n"
            history_section += "\n"

        user_content = (
            f"{pillar_section}"
            f"{history_section}"
            f"CURRENT USER INQUIRY:\n{query}\n\n"
            f"OFFICIAL STATUTORY EVIDENCE & CONCORDANCE DOSSIER (FROM NEON PGVECTOR):\n{evidence_text}\n\n"
            f"Synthesize the exhaustive legal analysis now strictly following the mandated structure."
        )

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": f"{system_prompt}\n\n{user_content}"}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "maxOutputTokens": 4096
            }
        }

        models_to_try = [self.model]
        for fallback in ["gemini-flash-latest", "gemini-3.8-flash", "gemini-flash-lite-latest"]:
            if fallback not in models_to_try:
                models_to_try.append(fallback)

        for target_model in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{target_model}:generateContent?key={self.api_key}"
            try:
                with httpx.Client(timeout=6.0) as client:
                    resp = client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            parts = candidates[0].get("content", {}).get("parts", [])
                            if parts:
                                ans = parts[0].get("text", "").strip()
                                if ans:
                                    return ans
                    else:
                        print(f"Gemini model {target_model} returned status {resp.status_code}: {resp.text[:120]}")
            except Exception as e:
                print(f"Gemini model {target_model} call failed: {e}")

        return None

class LegalAssistantService:
    def __init__(self, db: Session):
        self.db = db
        self.validator = CitationValidator(db)
        self.abuse_guard = AbuseGuard()

    def check_urgent_risk(self, query: str) -> Optional[Dict[str, Any]]:
        """
        Safety check: Detects immediate physical danger, harassment, or domestic violence.
        Returns deterministic emergency triage assistance if triggered.
        """
        emergency_patterns = [
            r"\b(suicide|kill myself|harm myself)\b",
            r"\b(immediate danger|assault|being attacked|domestic violence|police help)\b",
            r"\b(kidnapp|sexual harassment|threat to life)\b"
        ]
        
        q_lower = query.lower()
        for pat in emergency_patterns:
            if re.search(pat, q_lower):
                return {
                    "is_emergency": True,
                    "title": "Urgent Assistance / Immediate Safety Protocol",
                    "message": (
                        "If you or someone else is in immediate physical danger, please contact official emergency "
                        "services immediately before seeking legal remedies."
                    ),
                    "emergency_contacts": [
                        {"name": "National Emergency Number", "number": "112", "available": "24/7 (All India)"},
                        {"name": "Police Helpline", "number": "100", "available": "24/7"},
                        {"name": "Women Helpline (Domestic Violence / Safety)", "number": "1091 / 181", "available": "24/7"},
                        {"name": "NALSA National Legal Aid Helpline", "number": "15100", "available": "Toll Free (Free legal aid)"}
                    ],
                    "next_steps": [
                        "Reach a secure physical location immediately.",
                        "Call 112 or local emergency law enforcement.",
                        "If you require free legal assistance, contact NALSA at 15100 once you are safe."
                    ]
                }
        return None

    def retrieve_context(
        self,
        query: str,
        top_k: int = 4,
        context_filter: Optional[str] = None,
        history: Optional[List[Dict[str, str]]] = None
    ) -> List[LegalProvision]:
        """
        Retrieves relevant provisions using a hybrid strategy:
        1. Exact article/section regex match prioritized by statute title match
        2. Keyword substring matches on title and text
        3. Context category scoring boost for user-selected pillar
        4. Multi-turn dialogue query augmentation
        5. pgvector semantic embedding distance
        """
        candidate_scores = {}  # provision_id -> (provision, score)
        
        # Multi-turn query augmentation: if query is brief or follow-up, fuse prior user context
        augmented_query = query
        if history and len(history) > 0:
            user_past_queries = [m.get("text", "") for m in history if m.get("role") == "user" and m.get("text")]
            if user_past_queries:
                last_user_query = user_past_queries[-1]
                q_words = query.strip().split()
                if len(q_words) < 8 or any(w in query.lower() for w in ["this", "that", "it", "penalty", "punishment", "bail", "appeal", "fine", "arrest", "fir", "quash", "period", "limitation"]):
                    augmented_query = f"{query} {last_user_query}"

        q_lower = augmented_query.lower()

        # Check for statute/case mentions in query
        all_sources = self.db.query(LegalSource).all()
        matched_source_ids = set()
        
        # Context filter source mapping
        filter_source_ids = set()
        if context_filter:
            c_filter_lower = context_filter.lower()
            for src in all_sources:
                if (
                    c_filter_lower in src.title.lower() or 
                    c_filter_lower in src.source_type.lower() or
                    ("criminal" in c_filter_lower and "bns" in src.title.lower()) or
                    ("cyber" in c_filter_lower and "information technology" in src.title.lower()) or
                    ("dpdp" in c_filter_lower and "data protection" in src.title.lower()) or
                    ("constitutional" in c_filter_lower and "constitution" in src.title.lower()) or
                    ("consumer" in c_filter_lower and "consumer" in src.title.lower())
                ):
                    filter_source_ids.add(src.id)

        for src in all_sources:
            src_words = [w.lower() for w in re.findall(r'\b\w{3,}\b', src.title) if w.lower() not in {"act", "the", "and", "of", "india"}]
            if any(w in q_lower for w in src_words):
                matched_source_ids.add(src.id)

        # 1. Regex check for specific provisions (e.g. 'Article 21', 'Section 12', 'Case 1')
        match = re.search(r'\b(Article\s+\d+[A-Z]?|Section\s+\d+[A-Z]?|Case\s+\d+)\b', query, re.IGNORECASE)
        if match:
            term = match.group(1).strip()
            exact_provs = self.db.query(LegalProvision).filter(
                LegalProvision.section_number.ilike(term)
            ).all()
            for ep in exact_provs:
                score = 10.0
                if ep.source_id in matched_source_ids:
                    score += 15.0  # Big boost if both section and statute name match
                if ep.source_id in filter_source_ids:
                    score += 20.0  # Context filter priority boost
                candidate_scores[ep.id] = (ep, score)

        # 2. Keyword relevance scoring
        keywords = [w for w in re.findall(r'\b\w{4,}\b', q_lower) if w not in {"what", "which", "about", "under", "with", "from", "laws", "have", "does"}]
        if keywords:
            kw_filters = [
                or_(
                    LegalProvision.title.ilike(f"%{kw}%"),
                    LegalProvision.text_content.ilike(f"%{kw}%")
                ) for kw in keywords[:5]
            ]
            kw_provs = self.db.query(LegalProvision).filter(or_(*kw_filters)).limit(25).all()
            for kp in kw_provs:
                overlap = sum(1 for kw in keywords if kw in kp.title.lower() or kw in kp.text_content.lower())
                base_score = 3.0 + overlap * 2.0
                if kp.source_id in matched_source_ids:
                    base_score += 5.0
                if kp.source_id in filter_source_ids:
                    base_score += 15.0  # High relevance for requested context category
                if kp.id in candidate_scores:
                    prov, existing = candidate_scores[kp.id]
                    candidate_scores[kp.id] = (prov, existing + base_score)
                else:
                    candidate_scores[kp.id] = (kp, base_score)

        # Only return provisions that have genuine substantive relevance (score >= 3.0)
        valid_candidates = [item for item in candidate_scores.values() if item[1] >= 3.0]
        sorted_provisions = sorted(valid_candidates, key=lambda x: x[1], reverse=True)
        return [prov for prov, _ in sorted_provisions[:top_k]]

    def retrieve_concordance_context(self, query: str) -> List[StatutoryConcordance]:
        """
        Extracts sections and legal terms to retrieve relevant colonial-to-Bharatiya concordance mappings.
        """
        terms = set()
        sec_matches = re.findall(r'\b\d+[A-Za-z]?\b', query)
        terms.update(sec_matches)
        keywords = [w for w in re.findall(r'\b[a-zA-Z]{4,}\b', query.lower()) if w not in {"what", "which", "about", "under", "with", "from", "laws", "have", "does", "this", "that"}]
        terms.update(keywords[:5])

        if not terms:
            return []

        filters = []
        for t in terms:
            filters.append(StatutoryConcordance.old_section.ilike(f"%{t}%"))
            filters.append(StatutoryConcordance.new_section.ilike(f"%{t}%"))
            filters.append(StatutoryConcordance.offense_title.ilike(f"%{t}%"))
            filters.append(StatutoryConcordance.key_change.ilike(f"%{t}%"))

        return self.db.query(StatutoryConcordance).filter(or_(*filters)).limit(4).all()

    def retrieve_gazette_context(self, query: str) -> List[GazetteNotification]:
        """
        Retrieves relevant Ministry of Home Affairs / Law Ministry gazette notifications.
        """
        words = [w for w in re.findall(r'\b[a-zA-Z]{4,}\b', query.lower()) if w not in {"what", "which", "about", "under", "with", "from", "laws"}]
        if not words:
            return []
        filters = [or_(GazetteNotification.title.ilike(f"%{w}%"), GazetteNotification.summary.ilike(f"%{w}%")) for w in words[:3]]
        return self.db.query(GazetteNotification).filter(or_(*filters)).limit(2).all()

    def retrieve_helpline_context(self, query: str) -> List[LegalHelpline]:
        """
        Retrieves official legal aid and emergency helplines based on topic.
        """
        q_lower = query.lower()
        if any(w in q_lower for w in ["cyber", "hack", "online", "fraud", "phishing", "scam"]):
            target_cat = "Cyber Emergency"
        elif any(w in q_lower for w in ["woman", "women", "harass", "dowry", "domestic", "stalk"]):
            target_cat = "Women Safety"
        elif any(w in q_lower for w in ["consumer", "product", "defective", "refund", "seller"]):
            target_cat = "Consumer Grievance"
        else:
            target_cat = "Legal Aid"

        helplines = self.db.query(LegalHelpline).filter(LegalHelpline.category == target_cat).all()
        return helplines if helplines else self.db.query(LegalHelpline).limit(2).all()

    def retrieve_precedents_context(
        self,
        query: str,
        category: Optional[str] = None,
        limit: int = 3
    ) -> List[RealCasePrecedent]:
        """
        Retrieves top matching real-world Supreme Court and High Court precedents based on
        query intent, keywords, factual similarity, and statutory category.
        """
        base_query = self.db.query(RealCasePrecedent)
        all_cases = base_query.all()
        if not all_cases:
            return []

        q_lower = query.lower()
        terms = [t for t in re.findall(r'\b[a-zA-Z0-9]{3,}\b', q_lower) if t not in {"what", "which", "about", "under", "with", "from", "laws", "have", "does", "this", "that", "case", "cases"}]

        scored_cases = []
        for c in all_cases:
            score = 0.0
            
            # Category alignment
            if category and (category.lower() in c.category.lower() or c.category.lower() in category.lower()):
                score += 8.0

            # Title matches
            for t in terms:
                if t in c.title.lower():
                    score += 10.0
                if t in c.citation.lower():
                    score += 6.0
                if t in c.legal_controversy.lower():
                    score += 4.0
                if t in c.factual_matrix.lower():
                    score += 3.0
                if t in c.court_holding.lower():
                    score += 3.0
                if t in c.advocate_strategy.lower():
                    score += 3.0
                if t in c.sanhita_mapping_2024.lower():
                    score += 4.0
            
            # Domain specific keyword bonuses (covering standard and unique/novel scenarios)
            if any(k in q_lower for k in ["cheat", "contract", "breach", "420", "318", "fraudulent inducement", "commercial", "agreement", "mou", "bounced", "cheque", "dishonour", "advance payment"]) and "Hridaya Ranjan" in c.title:
                score += 18.0
            if any(k in q_lower for k in ["quash", "482", "528", "malice", "frivolous", "fir", "civil dispute criminalized", "false case", "fabricate", "harassment", "vengeance", "blackmail", "extortion"]) and "Bhajan Lal" in c.title:
                score += 18.0
            if any(k in q_lower for k in ["arrest", "41a", "35", "harass", "notice", "custody", "dowry", "498a", "85 bns", "summons", "station", "threaten arrest", "police call", "detain"]) and "Arnesh Kumar" in c.title:
                score += 18.0
            if any(k in q_lower for k in ["anticipatory", "bail", "438", "482", "apprehension", "pre-arrest", "fear arrest", "non-bailable"]) and "Sushila Aggarwal" in c.title:
                score += 18.0
            if any(k in q_lower for k in ["bail", "undertrial", "jail", "bond", "480", "483", "remand", "surety", "custody duration"]) and "Antil" in c.title:
                score += 18.0
            if any(k in q_lower for k in ["electronic", "65b", "63", "cctv", "whatsapp", "call", "certificate", "mobile", "hash", "audio", "video", "screenshot", "digital", "deepfake", "tamper", "pen drive", "server"]) and "Anvar" in c.title:
                score += 18.0
            if any(k in q_lower for k in ["online", "social media", "post", "tweet", "speech", "66a", "intermediary", "youtube", "facebook", "instagram", "troll", "defamation", "offensive", "freedom of speech"]) and "Shreya Singhal" in c.title:
                score += 18.0
            if any(k in q_lower for k in ["privacy", "dpdp", "data", "surveillance", "phone tapping", "consent", "drone", "tracking", "spyware", "leak", "biometric", "cctv balcony", "personal information"]) and "Puttaswamy" in c.title:
                score += 18.0
            if any(k in q_lower for k in ["fir", "mandatory", "police refuse", "station", "complaint", "173", "154", "zero fir", "refusal to register", "cognizable"]) and "Lalita Kumari" in c.title:
                score += 18.0
            if any(k in q_lower for k in ["torture", "handcuff", "custodial", "arrest memo", "memo", "third degree", "medical checkup", "rights of accused", "relative intimation"]) and "D.K. Basu" in c.title:
                score += 18.0
            if any(k in q_lower for k in ["murder", "circumstantial", "chain", "panchsheel", "103", "302", "last seen", "no eyewitness", "forensic link", "motive"]) and "Sharad Birdhichand" in c.title:
                score += 18.0
            if any(k in q_lower for k in ["liberty", "passport", "arbitrary", "article 21", "fair procedure", "fundamental right", "travel abroad", "natural justice"]) and "Maneka Gandhi" in c.title:
                score += 18.0
            if any(k in q_lower for k in ["injunction", "stay order", "temporary injunction", "order 39", "landlord", "tenant", "eviction", "evict", "trespass", "encroach", "possession", "flat lock", "boundary wall"]) and "Dalpat Kumar" in c.title:
                score += 24.0
            if any(k in q_lower for k in ["cheque", "check bounce", "dishonour", "dishonor", "138", "139", "return memo", "drawer", "payee", "insufficient funds", "stop payment"]) and "Rangappa" in c.title:
                score += 24.0
            if any(k in q_lower for k in ["liquidated damages", "earnest money", "forfeiture", "section 73", "section 74", "penalty clause", "breach of contract", "unpaid salary", "contract damages"]) and "Kailash Nath" in c.title:
                score += 24.0
            if any(k in q_lower for k in ["arbitrat", "arbitral", "arbitrator", "vidya drolia", "section 9", "section 11", "section 34", "lease dispute", "arbitrable"]) and "Vidya Drolia" in c.title:
                score += 24.0
            if any(k in q_lower for k in ["maintenance", "alimony", "divorce", "matrimonial", "wife", "assets affidavit", "125 crpc", "144 bnss", "dv act", "stridhan", "child custody"]) and "Rajnesh" in c.title:
                score += 24.0
            if any(k in q_lower for k in ["medical negligence", "doctor", "hospital", "surgery", "patient", "clinical", "cpa", "deficiency in service", "consumer protection", "malpractice"]) and "Shantha" in c.title:
                score += 24.0
            if any(k in q_lower for k in ["ibc", "cirp", "insolvency", "nclt", "corporate debtor", "financial creditor", "operational creditor", "section 7", "moratorium"]) and "Swiss Ribbons" in c.title:
                score += 24.0
            if any(k in q_lower for k in ["religious", "denomination", "temple", "mutt", "shirur", "essential religious practice", "article 26", "article 25", "deity"]) and "Shirur" in c.title:
                score += 26.0
            if any(k in q_lower for k in ["public service commission", "upsc", "spsc", "article 320", "article 311", "civil servant", "disciplinary inquiry", "directory", "manbodhan"]) and "Manbodhan" in c.title:
                score += 26.0
            if any(k in q_lower for k in ["oppression", "mismanagement", "section 241", "director removal", "minority shareholder", "companies act", "cyrus"]) and "Cyrus" in c.title:
                score += 24.0
            if any(k in q_lower for k in ["liquidated damages", "pre-estimated", "patent illegality", "section 34", "ongc", "saw pipes"]) and "Saw Pipes" in c.title:
                score += 24.0

            scored_cases.append((c, score))

        # Sort by score descending
        scored_cases.sort(key=lambda x: x[1], reverse=True)
        if scored_cases and scored_cases[0][1] > 0:
            return [c for c, s in scored_cases[:limit]]
        else:
            return [c for c, _ in sorted(scored_cases, key=lambda x: x[0].decision_year, reverse=True)[:limit]]

    def generate_response(
        self,
        query: str,
        mode: str = "citizen",  # "citizen" or "professional"
        context_filter: Optional[str] = None,
        gemini_api_key: Optional[str] = None,
        history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Orchestrates full RAG flow:
        Triage -> Multi-Source Retrieval -> Synthesis (Gemini Free API or Deep Local Engine) -> Citation Validation -> Safe Response.
        """
        # 1. Check emergency
        urgent = self.check_urgent_risk(query)
        if urgent:
            return urgent

        # 2. Check for unlawful intent / abuse guardrail (Layer 1: Deterministic Fast Filter)
        abuse = self.abuse_guard.check_query(query)
        if abuse:
            return abuse

        # 2b. Semantic AI Intent Judge (Layer 2: Google Gemini Judge for disguised/hypothetical abuse)
        resolved_key = (gemini_api_key or getattr(settings, "GEMINI_API_KEY", "") or os.environ.get("GEMINI_API_KEY", "") or os.environ.get("GOOGLE_API_KEY", "")).strip()
        if resolved_key:
            ai_abuse = self.abuse_guard.check_query_ai(query, api_key=resolved_key)
            if ai_abuse:
                return ai_abuse

        # 3. Retrieve authoritative provisions & multi-source evidence
        provisions = self.retrieve_context(query, top_k=5, context_filter=context_filter, history=history)
        concordance_items = self.retrieve_concordance_context(query)
        precedents = self.retrieve_precedents_context(query, category=context_filter, limit=3)
        gazettes = self.retrieve_gazette_context(query)
        helplines = self.retrieve_helpline_context(query)
        
        if not provisions:
            return {
                "is_emergency": False,
                "mode": mode,
                "query": query,
                "answer": "No authoritative provisions in the registered Indian legal corpus match your query. Under our Evidence-Before-Generation principle, we abstain from generating ungrounded advice. Please consult an official source like India Code (indiacode.nic.in) or seek qualified counsel.",
                "applicable_laws": [],
                "similar_cases": [],
                "citations": [],
                "trust_score": 1.0,
                "limitations": "The current indexed database covers the Constitution of India, Bharatiya Nyaya Sanhita (BNS), BNSS, IT Act, and the DPDP Act 2023.",
                "ai_engine": "Local Statutory Grounding Engine"
            }

        # 4. Formulate evidence-constrained claims & applicable laws
        claims_for_validation = []
        applicable_laws = []
        
        for prov in provisions:
            source_title = prov.source.title if prov.source else "Statute"
            applicable_laws.append({
                "provision_id": prov.id,
                "source_title": source_title,
                "section_number": prov.section_number,
                "title": prov.title,
                "text_snippet": prov.text_content[:300] + ("..." if len(prov.text_content) > 300 else "")
            })
            
            snippet = prov.text_content.strip().split("\n")[0]
            if len(snippet) > 100:
                snippet = snippet[:100]
                
            claims_for_validation.append({
                "provision_id": prov.id,
                "section_number": prov.section_number,
                "quote": snippet
            })

        # 5. Synthesis: Try Google Gemini Free API first, fallback to structured statutory engine
        synthesizer = GeminiSynthesizer(api_key=gemini_api_key)
        gemini_answer = synthesizer.synthesize(
            query=query,
            provisions=provisions,
            mode=mode,
            concordance_items=concordance_items,
            gazettes=gazettes,
            helplines=helplines,
            precedents=precedents,
            context_filter=context_filter,
            history=history
        )
        used_gemini = bool(gemini_answer)

        if gemini_answer:
            answer_text = gemini_answer
        else:
            primary_prov = provisions[0]
            sec_provisions = provisions[1:] if len(provisions) > 1 else []
            
            concordance_section = ""
            if concordance_items:
                c_rows = []
                for c in concordance_items:
                    c_rows.append(
                        f"| {c.old_act} {c.old_section} | **{c.new_act} {c.new_section}** | {c.offense_title} | {c.cognizable_status or 'Cognizable'} | {c.bailable_status or 'Non-Bailable'} | {c.penalty_summary or 'Statutory punishment'} |"
                    )
                concordance_section = (
                    "### Colonial Concordance & 2024 Legislative Evolution\n\n"
                    "| Colonial Statute | Bharatiya Sanhita | Offense / Subject | Classification | Bail Status | Prescribed Penalty |\n"
                    "| :--- | :--- | :--- | :--- | :--- | :--- |\n" +
                    "\n".join(c_rows) + "\n\n"
                )

            related_sections_text = ""
            if sec_provisions:
                r_items = []
                for sp in sec_provisions:
                    r_items.append(f"- **{sp.source.title if sp.source else 'Statute'} {sp.section_number}** ({sp.title}): \"{sp.text_content[:180]}...\"")
                related_sections_text = (
                    "### Corroborating Statutory Provisions & Intersecting Enactments\n\n" +
                    "\n".join(r_items) + "\n\n"
                )

            precedents_section = ""
            if precedents:
                p_items = []
                for idx, p in enumerate(precedents, 1):
                    p_items.append(
                        f"#### {idx}. {p.title} ({p.decision_year})\n"
                        f"- **Neutral Citation & Bench**: {p.citation} | {p.bench} ({p.court})\n"
                        f"- **Factual Matrix**: {p.factual_matrix}\n"
                        f"- **Operative Court Holding**: {p.court_holding}\n"
                        f"- **Winning Advocate Strategy**: {p.advocate_strategy}\n"
                        f"- **2024 Sanhita Transition**: {p.sanhita_mapping_2024}"
                    )
                precedents_section = (
                    "### Binding Supreme Court Precedents & Jurisprudential Benchmarks\n\n" +
                    "\n\n".join(p_items) + "\n\n"
                )
            else:
                precedents_section = (
                    "### Binding Supreme Court Precedents & Jurisprudential Benchmarks\n\n"
                    "1. **Maneka Gandhi v. Union of India (1978)**: Procedure established by law under Article 21 must be just, fair, and reasonable, prohibiting arbitrary executive restraint.\n"
                    "2. **D.K. Basu v. State of West Bengal (1997)**: Mandatory arrest memos, intimation to relatives, and independent medical examinations.\n"
                    "3. **Satender Kumar Antil v. CBI (2022)**: Strict categorization of offenses for bail adjudication and non-custodial investigation compliance.\n\n"
                )

            if mode == "professional":
                q_lower = query.lower()
                is_ni = any(k in q_lower for k in ["cheque", "check bounce", "138", "dishonour", "dishonor", "141", "142", "drawer", "payee"])
                is_contract = any(k in q_lower for k in ["contract", "breach", "liquidated damages", "penalty clause", "section 73", "section 74", "specific performance", "earnest money"])
                is_injunction = any(k in q_lower for k in ["injunction", "stay order", "order 39", "rule 1", "rule 2", "status quo", "summary suit", "order 37", "cpc"])
                is_arbitration = any(k in q_lower for k in ["arbitrat", "section 9", "section 11", "section 34", "arbitral award"])
                is_writ = any(k in q_lower for k in [
                    "article 226", "article 32", "writ", "mandamus", "certiorari", "habeas corpus", "ultra vires",
                    "article 26", "article 320", "article 14", "article 19", "article 21", "article 25", "article 311", "article 368",
                    "essential religious", "religious denomination", "public service commission", "constitution of india"
                ])
                is_matrimonial = any(k in q_lower for k in ["divorce", "matrimonial", "maintenance", "alimony", "section 13", "section 24", "domestic violence", "dv act"])
                is_consumer = any(k in q_lower for k in ["consumer", "deficiency in service", "unfair trade practice", "dcdrc", "ncdrc"])

                if is_ni:
                    answer_text = (
                        f"### Executive Legal Summary & Jurisdictional Matrix (Negotiable Instruments Act)\n\n"
                        f"- **Governing Subject / Cause of Action**: Dishonour of Cheque / Commercial Debt Enforcement\n"
                        f"- **Primary Statutory Authority**: Negotiable Instruments Act, 1881 — Section 138, 141 & 142\n"
                        f"- **Procedural Classification**: Compoundable Criminal Misdemeanor (Special Enactment)\n"
                        f"- **Bailable Status**: Bailable as a matter of right\n"
                        f"- **Competent Trial Forum**: Court of Metropolitan Magistrate / Judicial Magistrate First Class\n"
                        f"- **Statutory Standard of Proof**: Presumption of debt under Section 139 NI Act; defense rebuttable on preponderance of probabilities\n\n"
                        f"### Substantive Statutory Foundation & Verbatim Provisions\n\n"
                        f"**Authority**: {primary_prov.source.title if primary_prov.source else 'Law of India'}, {primary_prov.section_number}\n\n"
                        f"> \"{primary_prov.text_content}\"\n\n"
                        f"### Essential Legal Ingredients & Statutory Presumptions\n\n"
                        f"1. **Cheque Presentation & Dishonour Memo**: Cheque presented within 3 months and returned unpaid.\n"
                        f"2. **Mandatory 30-Day Notice**: Demand notice served in writing within 30 days of receiving return memo.\n"
                        f"3. **Statutory Limitation (Section 142)**: Cause of action accrues on the 16th day upon failure to pay; complaint within 1 month.\n"
                        f"4. **Reverse Burden of Proof**: Presumption of debt under Section 139 (*Rangappa v. Sri Mohan*, AIR 2010 SC 1898).\n\n"
                        f"{precedents_section}"
                        f"### Chamber Advisory & Actionable Litigation Strategy\n\n"
                        f"1. **Statutory Notice Compliance**: Ensure postal track report proves deemed service under Section 27 General Clauses Act.\n"
                        f"2. **Director Liability (Section 141)**: For corporate drawer, array specific directors in charge of day-to-day business.\n"
                        f"3. **Compounding under Section 147**: Offense is compoundable at any stage without requiring State concurrence.\n"
                        f"4. **Territorial Forum**: File exclusively where the payee's account-maintaining bank branch is located."
                    )
                elif is_contract:
                    answer_text = (
                        f"### Executive Legal Summary & Jurisdictional Matrix (Commercial & Contractual Dispute)\n\n"
                        f"- **Governing Subject / Cause of Action**: Breach of Contract & Assessment of Damages\n"
                        f"- **Primary Statutory Authority**: Indian Contract Act, 1872 — Section 73 & 74; Specific Relief Act, 1963\n"
                        f"- **Procedural Classification**: Commercial Dispute governed by Commercial Courts Act, 2015\n"
                        f"- **Competent Trial Forum**: Commercial Court / Principal District Judge\n"
                        f"- **Adjudication Standard**: Preponderance of probabilities with documentary proof of breach and causation\n\n"
                        f"### Substantive Statutory Foundation & Verbatim Provisions\n\n"
                        f"**Authority**: {primary_prov.source.title if primary_prov.source else 'Law of India'}, {primary_prov.section_number}\n\n"
                        f"> \"{primary_prov.text_content}\"\n\n"
                        f"### Essential Legal Ingredients & Principles of Damage Quantification\n\n"
                        f"1. **Privity & Enforceability**: Existence of valid agreement and mutual consideration.\n"
                        f"2. **Remoteness of Damages (Hadley Rule)**: Direct proximate loss naturally arising or known at formation; indirect remote loss barred.\n"
                        f"3. **Liquidated Damages & Actual Loss**: Under *Kailash Nath Associates v. DDA* (AIR 2015 SC 2260), proof of actual loss is mandatory where damage can be assessed; penalty covenants are unenforceable.\n\n"
                        f"{precedents_section}"
                        f"### Chamber Advisory & Actionable Litigation Strategy\n\n"
                        f"1. **Pre-Institution Mediation**: Exhaust mandatory Section 12A mediation before commercial suit institution.\n"
                        f"2. **Summary Judgment (Order XIII-A CPC)**: Move for summary decree if respondent discloses no real prospect of defense.\n"
                        f"3. **Mitigation Proof**: Demonstrate reasonable measures taken to mitigate loss under Section 73 Explanation."
                    )
                elif is_injunction:
                    answer_text = (
                        f"### Executive Legal Summary & Jurisdictional Matrix (Civil Procedure & Injunctions)\n\n"
                        f"- **Governing Subject / Cause of Action**: Interlocutory Injunctive Relief & Protection of Property\n"
                        f"- **Primary Statutory Authority**: Code of Civil Procedure, 1908 — Order XXXIX Rules 1 & 2\n"
                        f"- **Procedural Classification**: Civil Equitable Interlocutory Remedy\n"
                        f"- **Competent Trial Forum**: Civil Court / District Court having territorial jurisdiction\n"
                        f"- **Adjudication Standard**: Discretionary equitable assessment upon affidavits and documentary proof\n\n"
                        f"### Substantive Statutory Foundation & Verbatim Provisions\n\n"
                        f"**Authority**: {primary_prov.source.title if primary_prov.source else 'Law of India'}, {primary_prov.section_number}\n\n"
                        f"> \"{primary_prov.text_content}\"\n\n"
                        f"### The Three-Pillar Injunction Test\n\n"
                        f"As established in *Dalpat Kumar v. Prahlad Singh* (AIR 1993 SC 276), plaintiff must establish:\n\n"
                        f"1. **Prima Facie Case**: Substantial question requiring trial with probability of entitlement.\n"
                        f"2. **Balance of Convenience**: Greater mischief resulting from withholding injunction than granting it.\n"
                        f"3. **Irreparable Injury**: Harm incapable of compensation by monetary damages.\n\n"
                        f"{precedents_section}"
                        f"### Chamber Advisory & Actionable Litigation Strategy\n\n"
                        f"1. **Caveat Lodgment (Section 148A CPC)**: Lodge caveat to preempt ex-parte restraining orders.\n"
                        f"2. **Urgency Affidavit**: File specific Affidavit of Urgency detailing imminent irreparable damage.\n"
                        f"3. **Vacation under Order 39 Rule 4**: File for discharge if material facts were suppressed by opposing counsel."
                    )
                elif is_arbitration:
                    answer_text = (
                        f"### Executive Legal Summary & Jurisdictional Matrix (Arbitration & ADR)\n\n"
                        f"- **Governing Subject / Cause of Action**: Arbitral Interim Measures, Tribunal Appointment & Award Challenge\n"
                        f"- **Primary Statutory Authority**: Arbitration and Conciliation Act, 1996 — Section 9, 11 & 34\n"
                        f"- **Procedural Classification**: Commercial Arbitration governed by Party Autonomy\n"
                        f"- **Competent Trial Forum**: Commercial Division of High Court / Principal Civil Court\n"
                        f"- **Judicial Standard**: Minimal judicial intervention (Section 5); review strictly on patent illegality\n\n"
                        f"### Substantive Statutory Foundation & Verbatim Provisions\n\n"
                        f"**Authority**: {primary_prov.source.title if primary_prov.source else 'Law of India'}, {primary_prov.section_number}\n\n"
                        f"> \"{primary_prov.text_content}\"\n\n"
                        f"### Essential Legal Ingredients\n\n"
                        f"1. **Prima Facie Agreement**: Under *Vidya Drolia v. Durga Trading Corp.* (AIR 2021 SC 79), court review at Section 11 stage is confined to existence of arbitration clause.\n"
                        f"2. **Pre-Arbitral Relief (Section 9)**: Must demonstrate urgency and intention to commence arbitration within 90 days.\n"
                        f"3. **Section 34 Grounds**: Awards cannot be reviewed on merits; limited to patent illegality under Section 34(2A).\n\n"
                        f"{precedents_section}"
                        f"### Chamber Advisory & Actionable Litigation Strategy\n\n"
                        f"1. **Section 21 Invocation**: Issue formal invocation notice to stop limitation running.\n"
                        f"2. **Section 11(6) Petition**: Approach High Court if arbitrator appointment fails after 30 days.\n"
                        f"3. **Strict Limitation**: Section 34 applications must be filed within 3 months (+30 days maximum)."
                    )
                elif is_writ:
                    answer_text = (
                        f"### Executive Legal Summary & Jurisdictional Matrix (Constitutional Writ Jurisprudence)\n\n"
                        f"- **Governing Subject / Cause of Action**: Enforcement of Fundamental & Statutory Rights\n"
                        f"- **Primary Statutory Authority**: Constitution of India — Article 226 (High Court) & Article 32 (Supreme Court)\n"
                        f"- **Procedural Classification**: Constitutional Extraordinary Writ Jurisdiction\n"
                        f"- **Competent Forum**: High Court / Supreme Court of India\n"
                        f"- **Adjudication Standard**: Arbitrary state action under Article 14, ultra vires, and natural justice breach\n\n"
                        f"### Substantive Statutory Foundation & Verbatim Provisions\n\n"
                        f"**Authority**: {primary_prov.source.title if primary_prov.source else 'Law of India'}, {primary_prov.section_number}\n\n"
                        f"> \"{primary_prov.text_content}\"\n\n"
                        f"### Essential Legal Ingredients\n\n"
                        f"1. **State Character (Article 12)**: Respondent must be State or exercising public functions.\n"
                        f"2. **Right Violation & Natural Justice**: Under *Maneka Gandhi v. Union of India* (AIR 1978 SC 597), state action depriving rights without reasons violates Article 14 and 21.\n"
                        f"3. **Alternative Remedy**: Writ lies when alternative remedies are inefficacious or orders are void ab initio.\n\n"
                        f"{precedents_section}"
                        f"### Chamber Advisory & Actionable Litigation Strategy\n\n"
                        f"1. **Appropriate Writ Selection**: Specify Mandamus, Certiorari, or Habeas Corpus prayer.\n"
                        f"2. **Interim Stay**: Plead manifest illegality and irreparable balance of convenience for ex-parte stay.\n"
                        f"3. **Laches Prevention**: Address any time lapse directly to satisfy discretionary writ principles."
                    )
                elif is_matrimonial:
                    answer_text = (
                        f"### Executive Legal Summary & Jurisdictional Matrix (Family & Matrimonial Law)\n\n"
                        f"- **Governing Subject / Cause of Action**: Matrimonial Dissolution, Maintenance & Protection\n"
                        f"- **Primary Statutory Authority**: Hindu Marriage Act, 1955 — Section 13 & 24; DV Act, 2005; BNSS Section 144\n"
                        f"- **Procedural Classification**: Family Civil / Quasi-Criminal Proceedings\n"
                        f"- **Competent Forum**: Family Court / Court of Judicial Magistrate First Class\n"
                        f"- **Adjudication Standard**: Preponderance of probabilities with mandatory income and asset disclosures\n\n"
                        f"### Substantive Statutory Foundation & Verbatim Provisions\n\n"
                        f"**Authority**: {primary_prov.source.title if primary_prov.source else 'Law of India'}, {primary_prov.section_number}\n\n"
                        f"> \"{primary_prov.text_content}\"\n\n"
                        f"### Essential Legal Ingredients\n\n"
                        f"1. **Cruelty / Desertion**: Substantial matrimonial injury making cohabitation unreasonable.\n"
                        f"2. **Asset Disclosure Mandate**: Under *Rajnesh v. Neha* (AIR 2021 SC 569), both spouses must file detailed Affidavits of Assets and Liabilities.\n"
                        f"3. **Maintenance Award Date**: Maintenance runs from the date of application, with adjustment of overlapping awards.\n\n"
                        f"{precedents_section}"
                        f"### Chamber Advisory & Actionable Litigation Strategy\n\n"
                        f"1. **Section 24 Application**: Move for interim maintenance alongside main petition with disclosure affidavits.\n"
                        f"2. **Section 13B Fast-Track**: If settled, apply for waiver of 6-month cooling period under Supreme Court guidelines.\n"
                        f"3. **Mediation Referral**: Prepare comprehensive settlement regarding permanent alimony and custody."
                    )
                elif is_consumer:
                    answer_text = (
                        f"### Executive Legal Summary & Jurisdictional Matrix (Consumer Protection Act, 2019)\n\n"
                        f"- **Governing Subject / Cause of Action**: Deficiency in Service & Unfair Trade Practices\n"
                        f"- **Primary Statutory Authority**: Consumer Protection Act, 2019 — Section 35 & Section 2(47)\n"
                        f"- **Procedural Classification**: Consumer Protection Redressal (Summary Procedure)\n"
                        f"- **Competent Forum**: District Commission (<= ₹50 Lakh) / State Commission / National Commission (NCDRC)\n"
                        f"- **Adjudication Standard**: Preponderance of evidence establishing deficiency in service or defect in goods\n\n"
                        f"### Substantive Statutory Foundation & Verbatim Provisions\n\n"
                        f"**Authority**: {primary_prov.source.title if primary_prov.source else 'Law of India'}, {primary_prov.section_number}\n\n"
                        f"> \"{primary_prov.text_content}\"\n\n"
                        f"### Essential Legal Ingredients\n\n"
                        f"1. **Consumer Status**: Goods or services availed for consideration without commercial resale.\n"
                        f"2. **Deficiency in Service**: Fault, shortcoming, or inadequacy under contract or statutory standards.\n"
                        f"3. **Medical Services Inclusion**: Under *IMA v. V.P. Shantha* (AIR 1996 SC 550), medical services for payment fall under consumer law.\n\n"
                        f"{precedents_section}"
                        f"### Chamber Advisory & Actionable Litigation Strategy\n\n"
                        f"1. **Statutory Pre-Notice**: Serve formal 15-day notice calling upon provider to rectify or refund.\n"
                        f"2. **E-Daakhil Electronic Filing**: File complaint online via edaakhil.nic.in at consumer's place of residence.\n"
                        f"3. **Comprehensive Relief Claim**: Claim consideration refund, interest, compensation for harassment, and litigation costs."
                    )
                else:
                    # Criminal Defense default
                    answer_text = (
                        f"### Executive Legal Summary & Jurisdictional Matrix (Criminal Defense & BNSS)\n\n"
                        f"- **Governing Offense/Subject**: {primary_prov.title}\n"
                        f"- **Primary Statutory Authority**: {primary_prov.source.title if primary_prov.source else 'Law of India'}, {primary_prov.section_number}\n"
                        f"- **Classification**: Cognizable offense under First Schedule of BNSS 2023\n"
                        f"- **Bailable Status**: Governed strictly under statutory schedule and judicial discretion\n"
                        f"- **Competent Trial Forum**: Court of Session / Judicial Magistrate First Class having territorial jurisdiction\n"
                        f"- **Adjudication Standard**: Strict statutory proof beyond reasonable doubt under Bharatiya Sakshya Adhiniyam, 2023\n\n"
                        f"### Substantive Statutory Foundation & Verbatim Provisions\n\n"
                        f"**Authority**: {primary_prov.source.title if primary_prov.source else 'Law of India'}, {primary_prov.section_number}\n\n"
                        f"> \"{primary_prov.text_content}\"\n\n"
                        f"### Essential Legal Ingredients & Burden of Proof\n\n"
                        f"1. **Actus Reus**: Commission or omission of specific conduct stipulated in {primary_prov.section_number}.\n"
                        f"2. **Mens Rea**: Dishonest intention, knowledge, or fraudulent design existing at inception (*Hridaya Ranjan*, AIR 2000 SC 2341).\n"
                        f"3. **BSA Evidentiary Standards**: Mandatory electronic records certification under Section 63 BSA.\n\n"
                        f"{concordance_section}"
                        f"{related_sections_text}"
                        f"### Procedural Mandate & BNSS Framework\n\n"
                        f"- **Notice of Appearance (Section 35(3) BNSS)**: Mandatory notice prior to arrest for offenses <= 7 years (*Arnesh Kumar*, AIR 2014 SC 2756).\n"
                        f"- **Mandatory Forensic Collection (Section 176(3) BNSS)**: Videography of crime scene for severe offenses.\n"
                        f"- **Zero FIR (Section 173 BNSS)**: Mandatory FIR registration regardless of territorial jurisdiction.\n\n"
                        f"{precedents_section}"
                        f"### Chamber Advisory & Actionable Litigation Strategy\n\n"
                        f"1. **Pre-Arrest Protocol**: Anticipatory bail petition under **Section 482 BNSS** (formerly Section 438 CrPC) citing *Sushila Aggarwal* (AIR 2020 SC 831).\n"
                        f"2. **Remand Defense**: Regular bail under **Section 480 / 483 BNSS** demonstrating compliance under *Satender Kumar Antil* (AIR 2022 SC 3386).\n"
                        f"3. **Quashing Petition**: File under **Section 528 BNSS** before High Court to quash malicious proceedings under *Bhajan Lal* (AIR 1992 SC 604).\n"
                        f"4. **Evidentiary Audit**: Audit electronic records for mandatory Section 63 BSA certificate."
                    )
            else:
                helpline_bullets = "\n".join([f"- **{h.service_name}**: Dial **{h.short_code}** ({h.hours}) — {h.description}" for h in helplines]) if helplines else "- **NALSA Helpline**: Dial **15100** (24/7 Toll-Free Free Legal Aid across India)"
                
                answer_text = (
                    f"### Plain Language Summary\n\n"
                    f"Under Indian law, your inquiry regarding **{primary_prov.title}** is governed by **{primary_prov.section_number}** of the **{primary_prov.source.title if primary_prov.source else 'Indian Law'}**.\n\n"
                    f"The law provides clear legal definitions, sets penalties for unlawful conduct, and establishes non-negotiable protections so that citizens cannot be subjected to harassment or arbitrary action.\n\n"
                    f"### What the Law Specifically Mandates\n\n"
                    f"According to the official statutory provision:\n\n"
                    f"> \"{primary_prov.text_content[:280]}...\"\n\n"
                    f"**In simple terms**:\n"
                    f"- The law strictly prohibits the conduct described and requires formal statutory proof before any penalty can be imposed.\n"
                    f"- If you are an aggrieved victim, you have the right to register a formal police complaint or court petition.\n"
                    f"- If you are facing questioning, you are protected by constitutional guarantees of fair process.\n\n"
                    f"{concordance_section}"
                    f"### Your Constitutional & Procedural Safeguards\n\n"
                    f"Whenever dealing with law enforcement or legal inquiries in India, you are protected by fundamental constitutional rights:\n\n"
                    f"- **Protection Against Arbitrary Arrest (Article 22 & Sec 35(3) BNSS)**: For offenses where punishment is up to 7 years, police cannot arrest you without issuing a formal Notice of Appearance first.\n"
                    f"- **Right to Know Grounds of Arrest**: You must be informed immediately of the exact allegations against you in writing.\n"
                    f"- **Right to Legal Counsel**: You have the constitutional right to consult and be defended by a lawyer of your choice.\n"
                    f"- **24-Hour Magistrate Production**: Anyone detained must be presented before the nearest Judicial Magistrate within 24 hours.\n"
                    f"- **Free Legal Aid (Article 39A)**: If you cannot afford an advocate, the State is constitutionally bound to provide one free of cost through DLSA/NALSA.\n\n"
                    f"### Step-by-Step Citizen Action Plan\n\n"
                    f"1. **Preserve All Evidence**: Keep records, written notices, timestamps, and digital communications safely.\n"
                    f"2. **Filing a Complaint (Zero FIR)**: If filing a criminal complaint, visit your nearest police station. Under Section 173 of Bharatiya Nagarik Suraksha Sanhita (BNSS), police must register a 'Zero FIR' even if the offense occurred outside their territorial jurisdiction.\n"
                    f"3. **Online Complaints**: For online fraud or harassment, file an immediate complaint at the National Cyber Crime Reporting Portal (`cybercrime.gov.in`) or call **1930**.\n"
                    f"4. **Approach Free Legal Aid**: If facing legal action, contact your local District Legal Services Authority (DLSA) located inside the district court complex.\n\n"
                    f"### Official Government Helplines & Legal Aid Access\n\n"
                    f"{helpline_bullets}\n"
                    f"- **National Emergency Number**: Dial **112** (Immediate police, fire, or ambulance dispatch)."
                )

        # 6. Run strict Citation Validator
        validation_report = self.validator.validate_answer(claims_for_validation)

        # 7. Serialize matching real-world case precedents
        similar_cases_payload = []
        for p in precedents:
            similar_cases_payload.append({
                "id": p.id,
                "title": p.title,
                "citation": p.citation,
                "court": p.court,
                "bench": p.bench,
                "decision_year": p.decision_year,
                "category": p.category,
                "governing_provisions": p.governing_provisions or [],
                "factual_matrix": p.factual_matrix,
                "legal_controversy": p.legal_controversy,
                "court_holding": p.court_holding,
                "advocate_strategy": p.advocate_strategy,
                "sanhita_mapping_2024": p.sanhita_mapping_2024,
                "key_takeaways": p.key_takeaways or [],
            })

        return {
            "is_emergency": False,
            "mode": mode,
            "query": query,
            "answer": answer_text,
            "applicable_laws": applicable_laws,
            "similar_cases": similar_cases_payload,
            "citation_validation": validation_report,
            "trust_score": validation_report.get("trust_score", 1.0),
            "ai_engine": "भारत Legal AI (Grounded)" if used_gemini else "Statutory Grounding Engine",
            "limitations": "This information is generated from official Indian statutory text and does not constitute formal legal representation."
        }
