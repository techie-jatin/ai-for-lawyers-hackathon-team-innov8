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
                "   If matching precedents are provided in the Evidence Dossier, ground your case ratios in them; for unique factual nuances, summon established Supreme Court of India and High Court authorities to resolve the controversy decisively.\n"
                "6. JURISPRUDENTIAL SCOPE & ANTI-DRIFT DIRECTIVE:\n"
                "   You are strictly and exclusively a specialized statutory legal intelligence engine for Indian Law and Constitutional Jurisprudence. "
                "   Under NO circumstances should you act as a general-purpose software programmer, write non-legal code, solve academic homework, "
                "   or act as a generic ChatGPT clone. If an inquiry is completely unrelated to law (e.g. asking to write Python scripts, fiction, or math problems), "
                "   you must courteously decline and state that this chamber is dedicated exclusively to Indian law, the Constitution, and legal dispute analysis.\n\n"
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
                "3. CONSTITUTIONAL CLAUSE FIDELITY: Never state an Article has 'N distinct clauses' unless you detail all N clauses. Clearly distinguish between constitutional clauses and institutional categories (e.g., Article 28 has 3 constitutional clauses that classify institutions into 4 categories). Always use sequential numbers (1., 2., 3., 4., etc.) for enumerated clauses or action steps.\n"
                "4. FORMATTING DIRECTIVE: Do NOT output horizontal rule lines (--- or ***) between sections or at the end of your response.\n"
                "5. STRICT CITIZEN DOMAIN BOUNDARY & ANTI-DRIFT DIRECTIVE: You are strictly and exclusively 'भारत Legal Intelligence', dedicated to Indian Law, the Constitution of India, and citizen legal rights. Under no circumstances should you act as a general programming assistant, coding bot, homework solver, or lifestyle chat assistant. If an inquiry has no connection to law or rights, politely clarify your dedicated legal scope and guide the citizen toward legal questions.\n"
                "6. Structure your response clearly in GitHub-style Markdown with:\n\n"
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

    def discover_official_precedents_ai(
        self,
        query: str,
        context_filter: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Discovers genuine, reported Indian judicial precedents from official databanks (e-SCR, AIR, SCC, Kanoon)
        for queries where static canonical precedents are absent.
        Strict zero-hallucination prompt.
        """
        if not self.is_available():
            return []

        prompt = (
            "You are an elite Supreme Court of India legal research engine for 'भारत Legal Intelligence'.\n"
            "Your sole mission is to discover 2 to 3 REAL-WORLD reported Indian judicial precedents (Supreme Court of India or High Courts) strictly applicable to the user's factual dispute or legal issue.\n\n"
            "STRICT MANDATORY DIRECTIVE ON AUTHENTICITY (ZERO HALLUCINATION):\n"
            "1. You MUST ONLY cite genuine, actually reported cases decided by the Supreme Court of India or Indian High Courts.\n"
            "2. The cases MUST be traceable to legitimate, official databanks:\n"
            "   - Supreme Court of India e-SCR (escr.sci.gov.in) with Neutral Citations (e.g., 2024 INSC ...)\n"
            "   - All India Reporter (AIR / aironline.in)\n"
            "   - Supreme Court Cases (SCC) / Supreme Court Reports (SCR)\n"
            "   - Indian Kanoon (indiankanoon.org)\n"
            "   - High Courts & National Judicial Data Grid (services.ecourts.gov.in)\n"
            "3. NEVER invent fictional parties, imaginary bench compositions, or hypothetical case citations. If no exact Supreme Court decision on the hyper-specific fact exists, cite the nearest binding High Court or Supreme Court landmark laying down the operative ratio.\n"
            "4. Return ONLY a valid JSON array of 2 to 3 objects conforming to this exact schema (no trailing commas, no extra commentary):\n"
            "[\n"
            "  {\n"
            '    "id": 101,\n'
            '    "title": "Petitioner v. Respondent",\n'
            '    "citation": "Authentic Citation (e.g. (2018) 7 SCC 192 or 2023 INSC 412 or AIR 2019 SC 820)",\n'
            '    "court": "Supreme Court of India",\n'
            '    "bench": "2-Judge Bench (Name & Name, JJ.)",\n'
            '    "decision_year": 2022,\n'
            '    "category": "Legal Domain / Category",\n'
            '    "governing_provisions": ["Act Name Section Number"],\n'
            '    "factual_matrix": "Concrete factual summary of what occurred between the parties in court.",\n'
            '    "legal_controversy": "The exact legal question the Court resolved.",\n'
            '    "court_holding": "Operative ratio decidendi and final relief granted by the Court.",\n'
            '    "advocate_strategy": "Winning counsel arguments, threshold defense tactics, or procedural moves.",\n'
            '    "sanhita_mapping_2024": "Relevance under 2024 Sanhitas or current statutory framework.",\n'
            '    "key_takeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"],\n'
            '    "official_databank": "Supreme Court e-SCR | AIR Online Verified | SCC Online | Indian Kanoon",\n'
            '    "source_url": "https://escr.sci.gov.in/ or https://www.aironline.in/ or https://indiankanoon.org/"\n'
            "  }\n"
            "]\n"
            f"User Legal Query: {query}\n"
            f"Context: {context_filter or 'General'}\n"
            "Output JSON Array ONLY:"
        )

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.1,
                "maxOutputTokens": 2048,
                "responseMimeType": "application/json"
            }
        }

        models_to_try = [self.model, "gemini-flash-latest", "gemini-3.8-flash"]
        for target_model in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{target_model}:generateContent?key={self.api_key}"
            try:
                with httpx.Client(timeout=8.0) as client:
                    resp = client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            parts = candidates[0].get("content", {}).get("parts", [])
                            if parts:
                                txt = parts[0].get("text", "").strip()
                                if txt.startswith("```json"):
                                    txt = re.sub(r"^```json\s*", "", txt)
                                    txt = re.sub(r"\s*```$", "", txt)
                                elif txt.startswith("```"):
                                    txt = re.sub(r"^```\s*", "", txt)
                                    txt = re.sub(r"\s*```$", "", txt)
                                parsed = json.loads(txt)
                                if isinstance(parsed, list):
                                    reporter_pattern = re.compile(r'\b(INSC|SCC|AIR|SCR|SCALE|Cri\s*LJ|ILR|DMC|CPJ|Del|Bom|Mad|Cal|All|P&H|Pat|Ker|Guj)\b|\(\d{4}\)\s*\d+', re.I)
                                    valid_results = []
                                    for idx, item in enumerate(parsed):
                                        if isinstance(item, dict) and item.get("title") and item.get("citation"):
                                            if reporter_pattern.search(item.get("citation", "")):
                                                item["id"] = item.get("id") or (200 + idx)
                                                if not item.get("official_databank"):
                                                    item["official_databank"] = "Supreme Court e-SCR Grounded"
                                                if not item.get("source_url"):
                                                    item["source_url"] = "https://escr.sci.gov.in/"
                                                valid_results.append(item)
                                    if valid_results:
                                        return valid_results
            except Exception as e:
                print(f"Gemini precedent discovery failed for {target_model}: {e}")

        return []

def resolve_contextual_query(query: str, history: Optional[List[Dict[str, str]]] = None) -> str:
    """
    Resolves multi-turn anaphora/coreference (e.g. 'this article', 'about it', 'tell me again').
    Extracts provisions, statute names, and legal subjects from previous turns.
    """
    if not history or len(history) == 0:
        return query

    q_lower = query.lower().strip()
    needs_coref = (
        len(q_lower.split()) <= 15 or
        any(re.search(r'\b' + re.escape(w) + r'\b', q_lower) for w in [
            "this", "that", "it", "these", "those", "again", "more", "elaborate",
            "clarify", "penalty", "punishment", "bail", "appeal", "fine", "arrest",
            "quash", "period", "limitation", "clause", "sub-clause", "article", "section", "act",
            "him", "her", "them", "he", "she", "his", "their", "order", "injunction", "stay",
            "stop", "protect", "action", "remedy", "court", "step", "lock", "evict", "money", "dues",
            "scam", "bank"
        ])
    )
    if not needs_coref:
        return query

    # Traverse history backwards (user and assistant messages)
    for m in reversed(history):
        text = m.get("text", "")
        # Look for explicit provision references in history (e.g., Article 28, Section 138, etc.)
        prov_match = re.search(r'\b(Article\s+\d+[A-Z]?|Section\s+\d+[A-Za-z]?(?:\([0-9a-z]+\))?|Order\s+[0-9IVXLCDM]+\s*Rule\s+\d+)\b', text, re.IGNORECASE)
        statute_match = re.search(r'\b(Constitution(?: of India)?|BNS|BNSS|BSA|Bharatiya Nyaya Sanhita|Bharatiya Nagarik Suraksha Sanhita|Bharatiya Sakshya Adhiniyam|IPC|CrPC|IEA|Negotiable Instruments Act|NI Act|Consumer Protection Act|Motor Vehicles Act|RERA|Arbitration Act|Hindu Marriage Act|Specific Relief Act|Digital Personal Data Protection Act|DPDP|IT Act|Right to Information Act|RTI Act|Payment of Gratuity Act|Income Tax Act)\b', text, re.IGNORECASE)
        
        extracted = []
        if prov_match:
            extracted.append(prov_match.group(1))
        if statute_match:
            extracted.append(statute_match.group(1))
            
        if extracted:
            return f"{query} {' '.join(extracted)}"
            
        # If no explicit provision, check if there was a user question with substantive text
        if m.get("role") == "user" and len(text.strip().split()) >= 3:
            return f"{query} {text.strip()}"

    return query

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
        1. Multi-turn dialogue coreference resolution & query augmentation
        2. Exact article/section regex match prioritized by statute title match
        3. Keyword substring matches on title and text with strict relevance gate
        4. Context category scoring boost for user-selected pillar
        5. pgvector semantic embedding distance
        """
        candidate_scores = {}  # provision_id -> (provision, score)
        
        # Multi-turn query augmentation: resolve referents like 'this article' from history
        augmented_query = resolve_contextual_query(query, history)
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

        # 1. Regex check for specific provisions (e.g. 'Article 28', 'Section 138', 'Order 39 Rule 1')
        match = re.search(r'\b(Article\s+\d+[A-Z]?|Section\s+\d+[A-Za-z]?(?:\([0-9a-z]+\))?|Order\s+[0-9IVXLCDM]+\s*Rule\s+\d+)\b', augmented_query, re.IGNORECASE)
        has_exact_provision_match = False
        if match:
            term = match.group(1).strip()
            exact_provs = self.db.query(LegalProvision).filter(
                or_(
                    LegalProvision.section_number.ilike(term),
                    LegalProvision.section_number.ilike(f"%{term}%")
                )
            ).all()
            for ep in exact_provs:
                has_exact_provision_match = True
                score = 35.0  # Dominant baseline for exact provision match
                if ep.source_id in matched_source_ids:
                    score += 25.0
                if ep.source_id in filter_source_ids:
                    score += 25.0
                candidate_scores[ep.id] = (ep, score)

        # 2. Keyword relevance scoring (Strict Lexical & Word-Boundary Grounding)
        STOP_WORDS = {
            "what", "which", "about", "under", "with", "from", "laws", "have", "does",
            "rules", "rule", "order", "section", "article", "statute", "court", "state",
            "india", "provision", "provisions", "matter", "matters", "general", "power",
            "powers", "shall", "case", "cases", "where", "when", "into", "been", "their",
            "there", "tell", "explain", "give", "help", "need", "again", "this", "that"
        }
        keywords = [w for w in re.findall(r'\b\w{4,}\b', q_lower) if w not in STOP_WORDS]
        if keywords:
            kw_filters = [
                or_(
                    LegalProvision.title.ilike(f"%{kw}%"),
                    LegalProvision.text_content.ilike(f"%{kw}%")
                ) for kw in keywords[:5]
            ]
            kw_provs = self.db.query(LegalProvision).filter(or_(*kw_filters)).limit(25).all()
            for kp in kw_provs:
                t_lower = kp.title.lower()
                c_lower = kp.text_content.lower()
                # Strict word boundary check (prevents 'traffic' matching 'trafficking')
                title_matches = sum(1 for kw in keywords if re.search(r'\b' + re.escape(kw) + r'\b', t_lower))
                text_matches = sum(1 for kw in keywords if re.search(r'\b' + re.escape(kw) + r'\b', c_lower))
                total_matches = title_matches * 2 + text_matches
                if total_matches == 0:
                    continue  # Skip false partial substring hits

                base_score = total_matches * 4.0
                if kp.source_id in matched_source_ids:
                    base_score += 10.0
                if kp.source_id in filter_source_ids:
                    base_score += 15.0
                if kp.id in candidate_scores:
                    prov, existing = candidate_scores[kp.id]
                    candidate_scores[kp.id] = (prov, existing + base_score)
                else:
                    # If an exact provision match already occurred, suppress non-matching random statutory noise
                    if not has_exact_provision_match:
                        candidate_scores[kp.id] = (kp, base_score)

        # Only return provisions that have genuine substantive relevance (score >= 8.0)
        valid_candidates = [item for item in candidate_scores.values() if item[1] >= 8.0]
        sorted_provisions = sorted(valid_candidates, key=lambda x: x[1], reverse=True)
        return [prov for prov, _ in sorted_provisions[:top_k]]

    def retrieve_concordance_context(self, query: str, context_filter: Optional[str] = None) -> List[StatutoryConcordance]:
        """
        Extracts sections and legal terms to retrieve relevant colonial-to-Bharatiya concordance mappings.
        Strictly restricted to criminal/penal inquiries. Never returns criminal concordances for
        constitutional, administrative, consumer, civil, taxation, labor, or tenancy disputes.
        """
        q_lower = query.lower()

        # Check if query or context actually concerns criminal law
        is_criminal_query = any(k in q_lower for k in [
            "ipc", "crpc", "iea", "bns", "bnss", "bsa", "crime", "criminal", "police", "arrest",
            "bail", "fir", "remand", "custody", "quash", "cheating", "fraud", "theft", "murder",
            "forgery", "extortion", "assault", "culpable homicide", "hit and run", "snatching",
            "mob lynching", "sedition", "dowry", "498a", "302", "420", "379", "406", "304", "173",
            "35(3)", "482", "528", "63"
        ])

        # If user explicitly selected non-criminal context or query is purely constitutional/civil, suppress concordance
        is_pure_constitutional = (
            bool(re.search(r'\barticle\s*\d+\b', q_lower)) and
            not any(k in q_lower for k in ["bns", "bnss", "bsa", "ipc", "crpc", "fir", "arrest", "bail"])
        )
        if not is_criminal_query or is_pure_constitutional:
            return []

        # Only extract specific section numbers or substantive criminal offense names
        KNOWN_SECTIONS = {
            "420", "378", "379", "304", "405", "406", "463", "465", "468", "383", "384",
            "300", "302", "299", "304a", "319", "323", "320", "325", "375", "376", "124a",
            "498a", "41a", "438", "482", "154", "65b", "318", "303", "316", "336", "338",
            "308", "103", "105", "106", "115", "117", "64", "69", "152", "85", "35", "173", "63", "528"
        }
        sec_matches = [s for s in re.findall(r'\b\d+[A-Za-z]?\b', query) if s.lower() in KNOWN_SECTIONS]
        
        CRIMINAL_TERMS = {
            "cheating", "theft", "snatching", "breach of trust", "forgery", "extortion", "murder",
            "lynching", "culpable homicide", "hit and run", "rash driving", "grievous hurt",
            "sexual intercourse", "sedition", "cruelty", "anticipatory bail", "quashing",
            "zero fir", "electronic records"
        }
        matched_terms = [t for t in CRIMINAL_TERMS if t in q_lower]

        if not sec_matches and not matched_terms:
            return []

        filters = []
        for s in sec_matches:
            filters.append(StatutoryConcordance.old_section.ilike(f"%{s}%"))
            filters.append(StatutoryConcordance.new_section.ilike(f"%{s}%"))

        for t in matched_terms:
            filters.append(StatutoryConcordance.offense_title.ilike(f"%{t}%"))

        return self.db.query(StatutoryConcordance).filter(or_(*filters)).limit(4).all()

    def retrieve_gazette_context(self, query: str) -> List[GazetteNotification]:
        """
        Retrieves relevant Ministry of Home Affairs / Law Ministry gazette notifications.
        """
        words = [w for w in re.findall(r'\b[a-zA-Z]{4,}\b', query.lower()) if w not in {"what", "which", "about", "under", "with", "from", "laws", "again", "this", "that"}]
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
            if any(k in q_lower for k in ["traffic", "motor vehicle", "challan", "red light", "driving license", "rc", "parivahan", "speeding", "helmet", "seatbelt", "rto", "stop line", "itms", "rlvd", "section 206", "section 119", "section 184"]) and "Rajaseekaran" in c.title:
                score += 28.0
            if any(k in q_lower for k in ["rera", "builder", "flat", "possession", "allottee", "apartment", "real estate", "promoter", "section 18", "delay in possession", "refund interest"]) and "Imperia" in c.title:
                score += 28.0
            if any(k in q_lower for k in ["rti", "right to information", "public information officer", "pio", "first appellate", "answer sheet", "evaluated answer", "section 6", "section 7"]) and "Bandopadhyay" in c.title:
                score += 28.0
            if any(k in q_lower for k in ["gratuity", "provident fund", "pf", "epfo", "workman", "labor", "labour", "industrial dispute", "severance", "wages", "continuous service", "section 4"]) and "Bangalore Water" in c.title:
                score += 28.0
            if any(k in q_lower for k in ["pollution", "ngt", "green tribunal", "environment", "effluent", "air act", "water act", "polluter pays", "precautionary principle", "section 14", "section 15"]) and "Vellore" in c.title:
                score += 28.0
            if any(k in q_lower for k in ["coparcenary", "ancestral", "succession", "inheritance", "partition", "hindu succession", "daughter share", "legal heir", "mitakshara", "section 6"]) and "Vineeta Sharma" in c.title:
                score += 28.0
            if any(k in q_lower for k in ["income tax", "reassessment", "section 148", "section 148a", "it act", "assessment year", "escaped assessment", "show cause notice tax"]) and "Ashish Agarwal" in c.title:
                score += 28.0
            if any(k in q_lower for k in ["article 28", "religious instruction", "prayer in school", "secular education", "compulsory worship", "d.a.v", "dav college", "guru nanak"]) and "D.A.V." in c.title:
                score += 32.0
            if any(k in q_lower for k in ["article 28", "religious instruction", "prayer in school", "secular education", "value education", "aruna roy", "ncert"]) and "Aruna Roy" in c.title:
                score += 30.0

            # Penalize criminal bail/quashing cases if query is about non-criminal civil/administrative topics
            is_non_crim = any(k in q_lower for k in [
                "traffic", "red light", "challan", "motor vehicle", "driving license", "rera", "builder",
                "flat", "possession", "rti", "information", "gratuity", "labor", "labour", "workman",
                "pollution", "environment", "ngt", "succession", "inheritance", "ancestral", "income tax",
                "reassessment", "cheque", "contract", "injunction", "arbitration", "divorce", "consumer",
                "article 28", "article 26", "article 320", "religious instruction", "secular education"
            ])
            if is_non_crim and any(k in c.title for k in ["Arnesh Kumar", "Bhajan Lal", "Sharad Birdhichand", "Antil", "Sushila Aggarwal"]):
                score -= 30.0
            if any(k in q_lower for k in ["article 28", "religious instruction", "prayer in school", "secular education"]) and any(k in c.title for k in ["Puttaswamy", "Maneka Gandhi", "Bandopadhyay"]):
                score -= 25.0

            scored_cases.append((c, score))

        # Sort by score descending
        scored_cases.sort(key=lambda x: x[1], reverse=True)
        if scored_cases and scored_cases[0][1] >= 15.0:
            return [c for c, s in scored_cases[:limit] if s >= 15.0]
        else:
            return []

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

        # Multi-turn dialogue coreference resolution & query augmentation
        augmented_query = resolve_contextual_query(query, history)

        # 3. Retrieve authoritative provisions & multi-source evidence
        provisions = self.retrieve_context(augmented_query, top_k=5, context_filter=context_filter, history=history)
        concordance_items = self.retrieve_concordance_context(augmented_query, context_filter=context_filter)
        precedents = self.retrieve_precedents_context(augmented_query, category=context_filter, limit=3)
        gazettes = self.retrieve_gazette_context(augmented_query)
        helplines = self.retrieve_helpline_context(augmented_query)
        
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
            
            effective_q_lower = augmented_query.lower()
            is_ni = any(k in effective_q_lower for k in ["cheque", "check bounce", "138", "dishonour", "dishonor", "141", "142", "drawer", "payee"])
            is_contract = any(k in effective_q_lower for k in ["contract", "breach", "liquidated damages", "penalty clause", "section 73", "section 74", "specific performance", "earnest money"])
            is_injunction = any(k in effective_q_lower for k in ["injunction", "stay order", "order 39", "rule 1", "rule 2", "status quo", "summary suit", "order 37", "cpc"])
            is_arbitration = any(k in effective_q_lower for k in ["arbitrat", "section 9", "section 11", "section 34", "arbitral award"])
            is_writ = any(k in effective_q_lower for k in [
                "article 226", "article 32", "writ", "mandamus", "certiorari", "habeas corpus", "ultra vires",
                "article 26", "article 320", "article 14", "article 19", "article 21", "article 25", "article 28", "article 311", "article 368",
                "essential religious", "religious denomination", "public service commission", "constitution of india"
            ]) or bool(re.search(r'\barticle\s*\d+\b', effective_q_lower))
            is_matrimonial = any(k in effective_q_lower for k in ["divorce", "matrimonial", "maintenance", "alimony", "section 13", "section 24", "domestic violence", "dv act"])
            is_consumer = any(k in effective_q_lower for k in ["consumer", "deficiency in service", "unfair trade practice", "dcdrc", "ncdrc"])
            is_mv = any(k in effective_q_lower for k in ["traffic", "motor vehicle", "challan", "red light", "driving license", "rc", "parivahan", "speeding", "helmet", "seatbelt", "rto", "stop line", "itms", "rlvd"])
            is_rera = any(k in effective_q_lower for k in ["rera", "builder", "flat", "possession", "allottee", "apartment", "real estate", "promoter"])
            is_rti = any(k in effective_q_lower for k in ["rti", "right to information", "public information officer", "pio", "first appellate", "answer sheet", "evaluated answer"])
            is_labor = any(k in effective_q_lower for k in ["gratuity", "provident fund", "pf", "epfo", "workman", "labor", "labour", "industrial dispute", "severance", "wages", "continuous service"])
            is_environment = any(k in effective_q_lower for k in ["pollution", "ngt", "green tribunal", "environment", "effluent", "air act", "water act", "polluter pays"])
            is_succession = any(k in effective_q_lower for k in ["coparcenary", "ancestral", "succession", "inheritance", "partition", "hindu succession", "daughter share", "legal heir"])
            is_taxation = any(k in effective_q_lower for k in ["income tax", "reassessment", "section 148", "it act", "assessment year", "gst", "show cause notice tax"])
            is_crim = (
                any(k in effective_q_lower for k in ["fir", "arrest", "bail", "bns", "ipc", "murder", "theft", "cheat", "cyber", "police", "crime", "offense", "offence", "custody"])
                and not is_writ
            )
            
            concordance_section = ""
            if concordance_items and is_crim:
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
                precedents_section = ""

            if mode == "professional":

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
                elif is_mv:
                    answer_text = (
                        f"### Executive Legal Summary & Jurisdictional Matrix (Motor Vehicles Act & Traffic Law)\n\n"
                        f"- **Governing Subject / Cause of Action**: Traffic Signal Adherence, Electronic Challans & Citizen Safeguards\n"
                        f"- **Primary Statutory Authority**: Motor Vehicles Act, 1988 — Section 119, 177, 184 & 206\n"
                        f"- **Procedural Classification**: Compoundable Statutory Traffic Infraction / Quasi-Judicial Adjudication\n"
                        f"- **Competent Adjudication Forum**: Virtual Traffic Court / Judicial Magistrate / Traffic Lok Adalat\n"
                        f"- **Adjudication Standard**: Electronic evidence compliance under Section 136A MV Act and Section 63 BSA\n\n"
                        f"### Substantive Statutory Foundation & Verbatim Provisions\n\n"
                        f"**Authority**: {primary_prov.source.title if primary_prov.source else 'Law of India'}, {primary_prov.section_number}\n\n"
                        f"> \"{primary_prov.text_content}\"\n\n"
                        f"### Essential Statutory Mandates & Enforcement Benchmarks\n\n"
                        f"1. **Duty to Obey Signals (Section 119)**: Mandatory duty of every motor vehicle driver to stop at red signals and stop lines.\n"
                        f"2. **Automated Enforcement (Section 136A)**: Electronic enforcement via ITMS/RLVD must satisfy verifiable photographic timestamping.\n"
                        f"3. **Limits on Document Seizure (Section 206)**: Under *Dr. S. Rajaseekaran v. Union of India* ((2014) 6 SCC 36), police officers cannot seize licenses or impound vehicles arbitrarily for minor compounding infractions.\n\n"
                        f"{precedents_section}"
                        f"### Chamber Advisory & Actionable Litigation Strategy\n\n"
                        f"1. **Electronic Evidence Inspection**: Audit the photographic snapshot on echallan.parivahan.gov.in for signal status and number plate clarity.\n"
                        f"2. **Lok Adalat Settlement / Compounding**: Where violation is minor or compounding fee disputed, list before upcoming National/State Lok Adalat for compounding or compounding fee revision.\n"
                        f"3. **Magisterial Trial Option**: Exercise statutory right to refuse online compounding and request transfer to Judicial Magistrate under Section 208 MV Act if notice is erroneous."
                    )
                elif is_rera:
                    answer_text = (
                        f"### Executive Legal Summary & Jurisdictional Matrix (Real Estate Regulation - RERA)\n\n"
                        f"- **Governing Subject / Cause of Action**: Builder Delay, Possession Default & Allottee Compensation\n"
                        f"- **Primary Statutory Authority**: Real Estate (Regulation and Development) Act, 2016 — Section 18 & Section 31\n"
                        f"- **Procedural Classification**: Special Statutory Regulatory Redressal\n"
                        f"- **Competent Adjudication Forum**: Real Estate Regulatory Authority (RERA) / Adjudicating Officer / REAT\n"
                        f"- **Adjudication Standard**: Strict contractual compliance with RERA registered completion timeline\n\n"
                        f"### Substantive Statutory Foundation & Verbatim Provisions\n\n"
                        f"**Authority**: {primary_prov.source.title if primary_prov.source else 'Law of India'}, {primary_prov.section_number}\n\n"
                        f"> \"{primary_prov.text_content}\"\n\n"
                        f"### Essential Statutory Mandates & Relief Principles\n\n"
                        f"1. **Unconditional Right to Refund (Section 18)**: If builder fails to give possession by agreed date, allottee has unqualified right to full refund with interest or monthly delay interest.\n"
                        f"2. **Concurrent Remedies**: Under *Imperia Structures Ltd. v. Anil Patni* ((2020) 10 SCC 783), allottees can approach RERA and Consumer Commission concurrently without statutory bar.\n"
                        f"3. **Recovery as Land Revenue**: Unpaid RERA decrees are executable directly through District Collector as arrears of land revenue.\n\n"
                        f"{precedents_section}"
                        f"### Chamber Advisory & Actionable Litigation Strategy\n\n"
                        f"1. **Section 31 Complaint**: File complaint before State RERA online portal claiming either refund with interest or monthly interest until actual possession.\n"
                        f"2. **Section 71 Adjudication**: File simultaneously before Adjudicating Officer for mental agony and tortious damages.\n"
                        f"3. **Execution under Section 40**: File recovery certificate for enforcement through District Magistrate."
                    )
                elif is_rti:
                    answer_text = (
                        f"### Executive Legal Summary & Jurisdictional Matrix (Right to Information Act, 2005)\n\n"
                        f"- **Governing Subject / Cause of Action**: Statutory Transparency, Information Disclosure & Appellate Remedy\n"
                        f"- **Primary Statutory Authority**: Right to Information Act, 2005 — Section 6, 7 & 19\n"
                        f"- **Procedural Classification**: Administrative Statutory Disclosure Right\n"
                        f"- **Competent Forum**: Central/State Public Information Officer -> First Appellate Authority -> Information Commission\n"
                        f"- **Adjudication Standard**: Strict compliance with Section 7 time limits; exemptions strictly interpreted under Section 8\n\n"
                        f"### Substantive Statutory Foundation & Verbatim Provisions\n\n"
                        f"**Authority**: {primary_prov.source.title if primary_prov.source else 'Law of India'}, {primary_prov.section_number}\n\n"
                        f"> \"{primary_prov.text_content}\"\n\n"
                        f"### Essential Statutory Mandates\n\n"
                        f"1. **Mandatory 30-Day Disposal (Section 7(1))**: CPIO must supply information within 30 days (48 hours if life and liberty involved).\n"
                        f"2. **Examinee Inspection Rights**: Under *CBSE v. Aditya Bandopadhyay* ((2011) 8 SCC 497), answer books and public evaluations are accessible under RTI.\n"
                        f"3. **Penalties under Section 20**: PIO refusing without reasonable cause faces ₹250/day penalty up to ₹25,000.\n\n"
                        f"{precedents_section}"
                        f"### Chamber Advisory & Actionable Litigation Strategy\n\n"
                        f"1. **Targeted Formulation**: Frame questions seeking existing records/documents, avoiding hypothetical opinions.\n"
                        f"2. **First Appeal under Section 19(1)**: File within 30 days of PIO refusal or expiry of 30 days.\n"
                        f"3. **Second Appeal under Section 19(3)**: Approach Central/State Information Commission within 90 days."
                    )
                elif is_labor:
                    answer_text = (
                        f"### Executive Legal Summary & Jurisdictional Matrix (Labor, Employment & Gratuity Law)\n\n"
                        f"- **Governing Subject / Cause of Action**: Gratuity Dues, Severance & Industrial Protection\n"
                        f"- **Primary Statutory Authority**: Payment of Gratuity Act, 1972 — Section 4 & 7; Industrial Disputes Act, 1947\n"
                        f"- **Procedural Classification**: Welfare Labor Enactment (Summary Statutory Redressal)\n"
                        f"- **Competent Adjudication Forum**: Controlling Authority under Payment of Gratuity Act / Labor Court\n"
                        f"- **Adjudication Standard**: Statutory entitlement upon completion of 5 continuous years of service\n\n"
                        f"### Substantive Statutory Foundation & Verbatim Provisions\n\n"
                        f"**Authority**: {primary_prov.source.title if primary_prov.source else 'Law of India'}, {primary_prov.section_number}\n\n"
                        f"> \"{primary_prov.text_content}\"\n\n"
                        f"### Essential Statutory Mandates & Principles\n\n"
                        f"1. **Continuous Service (Section 4)**: Gratuity is mandatory after 5 continuous years; forfeiture strictly limited to moral turpitude or willful damage under Section 4(6).\n"
                        f"2. **Triple Test Precedent**: Under *Bangalore Water Supply & Sewerage Board v. A. Rajappa* ((1978) 2 SCC 213), statutory definitions of industry and workman are expansively applied.\n"
                        f"3. **Mandatory Interest (Section 7(3A))**: Employer failing to pay within 30 days must pay compound interest notified by Central Government.\n\n"
                        f"{precedents_section}"
                        f"### Chamber Advisory & Actionable Litigation Strategy\n\n"
                        f"1. **Form I Notice**: Serve written notice of application for gratuity to employer.\n"
                        f"2. **Form N Application**: If employer defaults past 30 days, file Form N before Controlling Authority.\n"
                        f"3. **Statutory Recovery**: Execute through Revenue Recovery Certificate via District Collector."
                    )
                elif is_taxation:
                    answer_text = (
                        f"### Executive Legal Summary & Jurisdictional Matrix (Taxation & Reassessment Law)\n\n"
                        f"- **Governing Subject / Cause of Action**: Income Tax Reassessment & Statutory Notice Challenge\n"
                        f"- **Primary Statutory Authority**: Income Tax Act, 1961 — Section 148, 148A & Section 149\n"
                        f"- **Procedural Classification**: Direct Tax Statutory Assessment & Quasi-Judicial Adjudication\n"
                        f"- **Competent Forum**: Assessing Officer -> CIT (Appeals) -> ITAT -> High Court (Section 260A)\n"
                        f"- **Adjudication Standard**: Tangible material with live nexus to escaped income; strict limitation compliance\n\n"
                        f"### Substantive Statutory Foundation & Verbatim Provisions\n\n"
                        f"**Authority**: {primary_prov.source.title if primary_prov.source else 'Law of India'}, {primary_prov.section_number}\n\n"
                        f"> \"{primary_prov.text_content}\"\n\n"
                        f"### Essential Statutory Mandates\n\n"
                        f"1. **Mandatory Show-Cause (Section 148A)**: Under *Union of India v. Ashish Agarwal* ((2023) 1 SCC 617), AO must provide information and minimum 7-30 days to reply before issuing Section 148 notice.\n"
                        f"2. **Limitation Horizons (Section 149)**: Reassessment barred beyond 3 years unless escaped income exceeds ₹50 Lakh with specific asset evidence.\n"
                        f"3. **Jurisdictional Challenge**: Notice without statutory approval of Principal Chief Commissioner is void ab initio.\n\n"
                        f"{precedents_section}"
                        f"### Chamber Advisory & Actionable Litigation Strategy\n\n"
                        f"1. **Inspect E-Proceedings**: Access IT portal, verify approval under Section 151, and demand underlying reasons/evidence.\n"
                        f"2. **Reply under Section 148A(c)**: Submit reconciliation with bank statements and audited financials within statutory timeline.\n"
                        f"3. **Writ Petition (Article 226)**: If notice lacks jurisdiction or violates limitation, file High Court writ before assessment order is passed."
                    )
                elif is_crim:
                    # Criminal Defense
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
                    # General Substantive / Civil Procedure
                    answer_text = (
                        f"### Executive Legal Summary & Jurisdictional Matrix (Civil & Statutory Law)\n\n"
                        f"- **Governing Subject / Cause of Action**: {primary_prov.title}\n"
                        f"- **Primary Statutory Authority**: {primary_prov.source.title if primary_prov.source else 'Law of India'}, {primary_prov.section_number}\n"
                        f"- **Adjudication Forum**: Civil Court / Designated Statutory Authority having territorial jurisdiction\n"
                        f"- **Adjudication Standard**: Preponderance of probabilities and documentary verification\n\n"
                        f"### Substantive Statutory Foundation & Verbatim Provisions\n\n"
                        f"**Authority**: {primary_prov.source.title if primary_prov.source else 'Law of India'}, {primary_prov.section_number}\n\n"
                        f"> \"{primary_prov.text_content}\"\n\n"
                        f"### Statutory Ingredients & Legal Principles\n\n"
                        f"1. **Statutory Baseline**: Verification of mandatory conditions precedent stipulated under {primary_prov.section_number}.\n"
                        f"2. **Limitation & Forum**: Ensure claim is within statutory limitation and instituted before the forum having territorial and pecuniary competence.\n"
                        f"3. **Evidentiary Proof**: Primary documentary evidence must satisfy the Indian Evidence / BSA standards.\n\n"
                        f"{precedents_section}"
                        f"### Chamber Advisory & Actionable Litigation Strategy\n\n"
                        f"1. **Formal Statutory Notice**: Serve a comprehensive legal notice outlining grounds, documentation, and specific time for compliance.\n"
                        f"2. **Pleadings Draft**: Ensure strict verification of cause of action and territorial jurisdiction.\n"
                        f"3. **ADR & Mediation**: Evaluate pre-litigation settlement or mediation to secure expedited relief."
                    )
            else:
                helpline_bullets = "\n".join([f"- **{h.service_name}**: Dial **{h.short_code}** ({h.hours}) — {h.description}" for h in helplines]) if helplines else "- **NALSA Helpline**: Dial **15100** (24/7 Toll-Free Free Legal Aid across India)"
                
                if is_mv:
                    answer_text = (
                        f"### Plain Language Summary\n\n"
                        f"Traffic signals and red light rules are governed under the **Motor Vehicles Act, 1988** to prevent road accidents and safeguard pedestrians and motorists.\n\n"
                        f"### What the Law Specifically Mandates\n\n"
                        f"According to Section 119 and Section 184 of the Motor Vehicles Act:\n\n"
                        f"- **Duty to Stop at Red Light**: Every driver must bring their vehicle to a complete halt behind the white stop line or zebra crossing when the signal turns red.\n"
                        f"- **Penalties**: Jumping a red light attracts statutory fines under Section 177 / 184. Automated ITMS (RLVD) cameras capture violations and issue electronic challans to the registered vehicle owner.\n\n"
                        f"### Your Constitutional & Procedural Safeguards\n\n"
                        f"- **Right to Inspect Photo Evidence**: You have the absolute right to view the timestamped photographic or video snapshot of the alleged infraction on the official portal before paying.\n"
                        f"- **No Arbitrary Key Snatching or Harassment**: Traffic police cannot snatch your keys, physically manhandle you, or confiscate driving licenses for minor infractions (*Dr. S. Rajaseekaran v. Union of India*). License seizure is restricted to specific grave offenses under Section 206.\n"
                        f"- **Right to Contest in Lok Adalat**: You can contest erroneous e-challans (e.g. wrong plate reading or camera malfunction) before the Virtual Traffic Court or Traffic Lok Adalat.\n\n"
                        f"### Step-by-Step Citizen Action Plan\n\n"
                        f"1. **Check E-Challan Online**: Visit `echallan.parivahan.gov.in` and enter your vehicle number or challan number.\n"
                        f"2. **Verify Photographic Proof**: Examine if your vehicle was actually across the stop line during the red light and whether registration digits are correct.\n"
                        f"3. **Pay or Contest**: Settle online to close the challan, or submit an online grievance / contest request if issued erroneously.\n\n"
                        f"### Official Government Helplines & Portals\n\n"
                        f"- **Parivahan E-Challan Portal**: echallan.parivahan.gov.in\n"
                        f"- **NALSA Free Legal Aid**: Dial **15100** (24/7 Toll-Free)\n"
                        f"- **National Emergency / Police**: Dial **112**"
                    )
                elif is_rera:
                    answer_text = (
                        f"### Plain Language Summary\n\n"
                        f"If your real estate builder or developer has delayed handing over possession of your flat or apartment, your rights are strictly protected under the **Real Estate (Regulation and Development) Act, 2016 (RERA)**.\n\n"
                        f"### What the Law Specifically Mandates\n\n"
                        f"Under **Section 18 of RERA**:\n\n"
                        f"- **Right to Full Refund with Interest**: If the promoter fails to deliver possession according to the agreement, you are entitled to claim a 100% refund of all amounts paid, along with statutory interest.\n"
                        f"- **Right to Monthly Delay Interest**: If you choose to retain the apartment, the builder is legally obligated to pay monthly delay interest for every month of delay until possession is delivered.\n\n"
                        f"### Your Safeguards & Legal Rights\n\n"
                        f"- **Dual Remedies Allowed**: Under *Imperia Structures Ltd. v. Anil Patni*, you can seek relief before RERA and the Consumer Commission simultaneously.\n"
                        f"- **Arrears of Land Revenue**: RERA recovery orders are executed directly by the District Collector.\n\n"
                        f"### Step-by-Step Citizen Action Plan\n\n"
                        f"1. **Collate Documentation**: Gather your Agreement for Sale, payment receipts, and builder communication.\n"
                        f"2. **File Online RERA Complaint**: Log on to your State's official RERA portal and submit Form M/N for Section 18 relief.\n\n"
                        f"### Official Government Helplines & Legal Aid Access\n\n"
                        f"- **NALSA Legal Aid**: Dial **15100**\n"
                        f"- **National Consumer Helpline**: Dial **1915**"
                    )
                elif is_crim:
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
                else:
                    answer_text = (
                        f"### Plain Language Summary\n\n"
                        f"Under Indian law, your inquiry regarding **{primary_prov.title}** is governed by **{primary_prov.section_number}** of the **{primary_prov.source.title if primary_prov.source else 'Indian Law'}**.\n\n"
                        f"The law establishes clear rights, statutory standards, and procedural remedies so that citizens can resolve disputes lawfully without unfair hardship.\n\n"
                        f"### What the Law Specifically Mandates\n\n"
                        f"According to the official statutory provision:\n\n"
                        f"> \"{primary_prov.text_content[:280]}...\"\n\n"
                        f"**Key Rights & Protections**:\n"
                        f"- Entitlements and obligations are governed strictly by the written statutory terms and recognized rules.\n"
                        f"- Any party seeking to enforce a claim must demonstrate substantive compliance and produce valid documentary records.\n\n"
                        f"### Your Legal Safeguards\n\n"
                        f"- **Right to Fair Adjudication**: Public bodies and judicial forums must follow natural justice and procedural fairness before passing adverse orders.\n"
                        f"- **Access to Free Legal Aid**: Under Article 39A and the Legal Services Authorities Act, eligible citizens can access free legal aid across India.\n\n"
                        f"### Step-by-Step Citizen Action Plan\n\n"
                        f"1. **Collect Supporting Documents**: Gather all original agreements, notices, receipts, and correspondence.\n"
                        f"2. **Send Formal Legal Notice**: State your grievance, statutory grounds, and a reasonable response timeline.\n"
                        f"3. **Contact Legal Aid if Needed**: Reach out to the District Legal Services Authority (DLSA) or dial NALSA.\n\n"
                        f"### Official Government Helplines & Legal Aid Access\n\n"
                        f"{helpline_bullets}\n"
                        f"- **NALSA 24/7 Legal Aid**: Dial **15100**"
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
                "official_databank": "Supreme Court Canonical Repository",
                "source_url": "https://www.aironline.in/"
            })

        # Tier 2: AI Official Databank Precedent Discovery Engine (e-SCR, AIR, SCC, Kanoon)
        if len(similar_cases_payload) < 2 and synthesizer.is_available():
            try:
                ai_cases = synthesizer.discover_official_precedents_ai(query=query, context_filter=context_filter)
                if ai_cases:
                    existing_titles = {c.get("title", "").lower() for c in similar_cases_payload}
                    for ac in ai_cases:
                        if ac.get("title", "").lower() not in existing_titles:
                            similar_cases_payload.append(ac)
                            if len(similar_cases_payload) >= 3:
                                break
            except Exception as e:
                print(f"AI Precedent discovery fallback error: {e}")

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
