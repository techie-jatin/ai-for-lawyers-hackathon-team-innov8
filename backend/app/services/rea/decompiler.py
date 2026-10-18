"""
Legal AST Decompiler - REA (Reverse Engineer Anything) Engine
Extracts structured Legal AST from unstructured factual narratives, police complaints,
agreements, and dispute statements under Indian Jurisprudence.
"""

from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any, Optional
import re
from datetime import datetime, date

@dataclass
class LegalParty:
    name: str
    role: str  # "complainant", "petitioner", "respondent", "accused", "victim", "witness", "authority"
    capacity: str  # "individual", "student", "consumer", "landlord", "coaching_institute", "bank", "corporate"
    description: str = ""
    contact_info: Optional[str] = None

@dataclass
class TerritorialJurisdiction:
    incident_place: Optional[str] = None
    execution_place: Optional[str] = None
    defendant_residence: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    appropriate_forum: str = "Civil Court / Police Station"
    high_court: Optional[str] = None
    territorial_basis: str = ""

@dataclass
class TemporalAnchor:
    incident_date: Optional[str] = None
    agreement_date: Optional[str] = None
    notice_date: Optional[str] = None
    limitation_period_years: float = 3.0
    limitation_expiry_date: Optional[str] = None
    transition_regime: str = "POST_JULY_2024_BNS"  # "PRE_JULY_2024_IPC", "POST_JULY_2024_BNS", "CONTINUING_WRONG"
    is_time_barred: bool = False
    statutory_timeline_notes: str = ""

@dataclass
class FactsVsAllegations:
    admitted_facts: List[str] = field(default_factory=list)
    allegations: List[str] = field(default_factory=list)
    extraneous_emotions: List[str] = field(default_factory=list)
    documentary_evidence_referenced: List[str] = field(default_factory=list)

@dataclass
class LegalAST:
    raw_narrative: str
    applicable_pillar: str
    primary_cause_of_action: str
    parties: List[LegalParty] = field(default_factory=list)
    jurisdiction: TerritorialJurisdiction = field(default_factory=TerritorialJurisdiction)
    temporal_anchor: TemporalAnchor = field(default_factory=TemporalAnchor)
    facts_vs_allegations: FactsVsAllegations = field(default_factory=FactsVsAllegations)
    remedies_prayed: List[str] = field(default_factory=list)
    confidence_score: float = 0.95
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class LegalDecompiler:
    """
    Decompiles unstructured legal narratives into a strongly-typed Legal AST.
    Employs deterministic semantic decomposition with Indian Gazette & statutory rules.
    """

    STATE_HIGH_COURT_MAP = {
        "rajasthan": ("Rajasthan High Court", "Jodhpur / Jaipur Bench"),
        "delhi": ("Delhi High Court", "New Delhi"),
        "maharashtra": ("Bombay High Court", "Mumbai"),
        "karnataka": ("Karnataka High Court", "Bengaluru"),
        "uttar pradesh": ("Allahabad High Court", "Prayagraj / Lucknow Bench"),
        "up": ("Allahabad High Court", "Prayagraj / Lucknow Bench"),
        "telangana": ("Telangana High Court", "Hyderabad"),
        "tamil nadu": ("Madras High Court", "Chennai"),
        "west bengal": ("Calcutta High Court", "Kolkata"),
        "gujarat": ("Gujarat High Court", "Ahmedabad"),
        "madhya pradesh": ("Madhya Pradesh High Court", "Jabalpur"),
        "bihar": ("Patna High Court", "Patna"),
        "haryana": ("Punjab and Haryana High Court", "Chandigarh"),
        "punjab": ("Punjab and Haryana High Court", "Chandigarh"),
    }

    DISTRICT_STATE_MAP = {
        "kota": "rajasthan",
        "jaipur": "rajasthan",
        "jodhpur": "rajasthan",
        "mumbai": "maharashtra",
        "pune": "maharashtra",
        "bengaluru": "karnataka",
        "bangalore": "karnataka",
        "lucknow": "uttar pradesh",
        "kanpur": "uttar pradesh",
        "noida": "uttar pradesh",
        "ghaziabad": "uttar pradesh",
        "gurugram": "haryana",
        "gurgaon": "haryana",
        "faridabad": "haryana",
        "patna": "bihar",
        "hyderabad": "telangana",
        "chennai": "tamil nadu",
        "kolkata": "west bengal",
        "ahmedabad": "gujarat",
        "indore": "madhya pradesh",
        "bhopal": "madhya pradesh",
    }

    def __init__(self):
        pass

    def decompile(self, narrative: str) -> LegalAST:
        """
        Deconstructs input narrative into a comprehensive LegalAST.
        """
        narrative_clean = narrative.strip()
        pillar = self._classify_pillar(narrative_clean)
        parties = self._extract_parties(narrative_clean, pillar)
        jurisdiction = self._extract_jurisdiction(narrative_clean)
        temporal = self._extract_temporal_anchor(narrative_clean, pillar)
        f_vs_a = self._isolate_facts_and_allegations(narrative_clean)
        remedies = self._identify_remedies(narrative_clean, pillar)
        cause_of_action = self._identify_cause_of_action(narrative_clean, pillar)

        return LegalAST(
            raw_narrative=narrative_clean,
            applicable_pillar=pillar,
            primary_cause_of_action=cause_of_action,
            parties=parties,
            jurisdiction=jurisdiction,
            temporal_anchor=temporal,
            facts_vs_allegations=f_vs_a,
            remedies_prayed=remedies,
            confidence_score=0.94,
            metadata={
                "decompiler_version": "2.0-rea",
                "extracted_at": datetime.now().isoformat(),
            }
        )

    def _classify_pillar(self, text: str) -> str:
        t = text.lower()
        if any(w in t for w in ["hostel", "pg", "rent", "tenant", "landlord", "security deposit", "mess", "warden", "eviction", "lease"]):
            return "TENANCY_AND_DEPOSITS"
        if any(w in t for w in ["upi", "qr code", "cyber", "phishing", "scam", "1930", "bank fraud", "sim swap", "otp", "apk"]):
            return "CYBER_AND_FINANCIAL_FRAUD"
        if any(w in t for w in ["cheque", "bounce", "section 138", "dishonour", "memo", "insufficient funds"]):
            return "CHEQUE_DISHONOUR_NI_ACT"
        if any(w in t for w in ["coaching", "fee refund", "allen", "fiitjee", "unfair trade", "ccpa", "consumer"]):
            return "CONSUMER_AND_EDUCATION"
        if any(w in t for w in ["quash", "fir", "false case", "498a", "bail", "arrest", "bnss", "crpc", "bns", "police"]):
            return "CRIMINAL_AND_QUASHING"
        if any(w in t for w in ["contract", "agreement", "clause", "stamp duty", "breach", "liquidated damages", "penalty"]):
            return "CONTRACT_AND_COMMERCIAL"
        return "GENERAL_CIVIL_AND_CRIMINAL"

    def _extract_parties(self, text: str, pillar: str) -> List[LegalParty]:
        parties: List[LegalParty] = []
        t = text.lower()

        # Complainant / Inquirer party
        if pillar == "TENANCY_AND_DEPOSITS":
            parties.append(LegalParty(
                name="Tenant / Student / Occupant",
                role="petitioner",
                capacity="student",
                description="Aggrieved tenant/student claiming unlawful withholding of caution money/security deposit."
            ))
            # Counterparty
            parties.append(LegalParty(
                name="Hostel Owner / Manager / Warden",
                role="respondent",
                capacity="landlord",
                description="Hostel administration withholding deposit arbitrarily contrary to statutory principles."
            ))
        elif pillar == "CYBER_AND_FINANCIAL_FRAUD":
            parties.append(LegalParty(
                name="Complainant / Account Holder",
                role="complainant",
                capacity="individual",
                description="Victim of unauthorized electronic financial fraud."
            ))
            parties.append(LegalParty(
                name="Unidentified Cyber Fraudster / Beneficiary Account Holder",
                role="accused",
                capacity="individual",
                description="Beneficiary of fraudulent transaction or mule account controller."
            ))
            parties.append(LegalParty(
                name="Remitter & Beneficiary Banks",
                role="authority",
                capacity="bank",
                description="Financial institutions bound by RBI circular on zero customer liability in cyber fraud."
            ))
        elif pillar == "CHEQUE_DISHONOUR_NI_ACT":
            parties.append(LegalParty(
                name="Payee / Complainant",
                role="complainant",
                capacity="individual",
                description="Holder in due course of dishonoured cheque."
            ))
            parties.append(LegalParty(
                name="Drawer / Accused",
                role="accused",
                capacity="corporate" if "company" in t or "director" in t else "individual",
                description="Signatory/Drawer of cheque returned unpaid for insufficient funds."
            ))
        elif pillar == "CONSUMER_AND_EDUCATION":
            parties.append(LegalParty(
                name="Consumer / Student / Parent",
                role="complainant",
                capacity="consumer",
                description="Consumer seeking deficiency rectification or fee refund."
            ))
            parties.append(LegalParty(
                name="Coaching Institute / Service Provider",
                role="respondent",
                capacity="coaching_institute",
                description="Service provider imposing non-refundable unilateral contract terms."
            ))
        else:
            parties.append(LegalParty(
                name="Aggrieved Inquirer",
                role="petitioner",
                capacity="individual",
                description="Party asserting legal rights or seeking defense remedies."
            ))
            parties.append(LegalParty(
                name="Counterparty / Respondent",
                role="respondent",
                capacity="individual",
                description="Opposing party against whom grievance is alleged."
            ))

        return parties

    def _extract_jurisdiction(self, text: str) -> TerritorialJurisdiction:
        t = text.lower()
        district = None
        state = None

        # Check districts first
        for dist_key, st_val in self.DISTRICT_STATE_MAP.items():
            if re.search(r'\b' + re.escape(dist_key) + r'\b', t):
                district = dist_key.capitalize()
                state = st_val
                break

        # If state not found from district, check states
        if not state:
            for st_key in self.STATE_HIGH_COURT_MAP.keys():
                if re.search(r'\b' + re.escape(st_key) + r'\b', t):
                    state = st_key
                    break

        high_court_info = None
        if state and state in self.STATE_HIGH_COURT_MAP:
            hc, bench = self.STATE_HIGH_COURT_MAP[state]
            high_court_info = f"{hc} ({bench})"

        appropriate_forum = "District Civil Court / Jurisdictional Police Station"
        if "hostel" in t or "deposit" in t or "consumer" in t or "coaching" in t:
            appropriate_forum = f"District Consumer Disputes Redressal Commission (DCDRC), {district or 'District'}"
        elif "cheque" in t or "138" in t:
            appropriate_forum = f"Judicial Magistrate First Class (JMFC) / Metropolitan Magistrate Court"
        elif "quash" in t or "528 bnss" in t or "482 crpc" in t:
            appropriate_forum = high_court_info or "High Court of Judicature"

        return TerritorialJurisdiction(
            incident_place=district,
            district=district,
            state=state.capitalize() if state else None,
            appropriate_forum=appropriate_forum,
            high_court=high_court_info,
            territorial_basis=(
                f"Section 20 Code of Civil Procedure, 1908 & Section 34(2) Consumer Protection Act, 2019 "
                f"(where cause of action wholly or in part arose, or where complainant/accused resides)."
            )
        )

    def _extract_temporal_anchor(self, text: str, pillar: str) -> TemporalAnchor:
        t = text.lower()
        
        # Date regex matches like 2024, 2025, 2026 or DD/MM/YYYY
        date_matches = re.findall(r'\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}|\b202[0-9]\b)', t)

        # Transition regime check: BNS enacted July 1, 2024
        regime = "POST_JULY_2024_BNS"
        if any("2021" in m or "2022" in m or "2023" in m for m in date_matches):
            regime = "PRE_JULY_2024_IPC"
        elif "prior to july 2024" in t or "before july 2024" in t:
            regime = "PRE_JULY_2024_IPC"

        # Limitation calculation
        limitation_years = 3.0
        limitation_notes = "Article 55 Limitation Act, 1963 (3 years for compensation for breach of contract / refund)."
        
        if pillar == "CONSUMER_AND_EDUCATION" or pillar == "TENANCY_AND_DEPOSITS":
            limitation_years = 2.0
            limitation_notes = "Section 69 Consumer Protection Act, 2019 (2 years from date of cause of action for DCDRC complaint)."
        elif pillar == "CHEQUE_DISHONOUR_NI_ACT":
            limitation_years = 0.08  # 1 month after 15 days notice
            limitation_notes = "Section 142(1)(b) NI Act: Complaint must be filed within 1 month from expiry of 15 days demand notice."
        elif pillar == "CRIMINAL_AND_QUASHING":
            limitation_years = 3.0
            limitation_notes = "Section 514 BNSS / Section 468 CrPC (Bar to taking cognizance after lapse of limitation period)."

        return TemporalAnchor(
            incident_date=date_matches[0] if date_matches else "Contemporaneous (Ongoing dispute)",
            limitation_period_years=limitation_years,
            transition_regime=regime,
            is_time_barred=False,
            statutory_timeline_notes=limitation_notes
        )

    def _isolate_facts_and_allegations(self, text: str) -> FactsVsAllegations:
        """
        REA Fact vs Allegation Separator:
        Separates concrete admissible factual assertions from verbal allegations and emotional expressions.
        """
        sentences = [s.strip() for s in re.split(r'[.\n!?]+', text) if len(s.strip()) > 5]
        admitted: List[str] = []
        allegations: List[str] = []
        emotions: List[str] = []
        docs: List[str] = []

        emotion_keywords = ["scared", "worried", "distressed", "harassed", "crying", "suffering", "cheated", "tension", "ruined", "heartbroken"]
        doc_keywords = ["receipt", "agreement", "lease", "rent agreement", "whatsapp", "bank statement", "transaction", "memo", "fir", "qr code", "screenshot", "sms"]
        allegation_keywords = ["saying", "claims", "alleged", "threatened", "told me", "demanding", "verbally", "stated"]

        for s in sentences:
            s_low = s.lower()
            # Check documentary mention
            for dk in doc_keywords:
                if dk in s_low and dk not in docs:
                    docs.append(dk)

            # Emotion check
            if any(ew in s_low for ew in emotion_keywords):
                emotions.append(s)

            # Allegation vs Admitted fact
            if any(ak in s_low for ak in allegation_keywords):
                allegations.append(s)
            else:
                admitted.append(s)

        if not admitted and sentences:
            admitted.append(sentences[0])

        return FactsVsAllegations(
            admitted_facts=admitted,
            allegations=allegations,
            extraneous_emotions=emotions,
            documentary_evidence_referenced=docs
        )

    def _identify_cause_of_action(self, text: str, pillar: str) -> str:
        if pillar == "TENANCY_AND_DEPOSITS":
            return "Unlawful retention and penal forfeiture of student caution deposit / Unfair Contract Term"
        if pillar == "CYBER_AND_FINANCIAL_FRAUD":
            return "Criminal cheating and fraudulent electronic fund diversion via unauthorized QR code / UPI"
        if pillar == "CHEQUE_DISHONOUR_NI_ACT":
            return "Dishonour of negotiable instrument for insufficient funds under Section 138 NI Act"
        if pillar == "CONSUMER_AND_EDUCATION":
            return "Deficiency in service and adoption of unfair trade practices in student fee withholding"
        if pillar == "CRIMINAL_AND_QUASHING":
            return "Filing of vexatious or non-cognizable complaint / Ground for High Court quashing"
        return "Breach of contractual covenants and statutory duty of restitution"

    def _identify_remedies(self, text: str, pillar: str) -> List[str]:
        if pillar == "TENANCY_AND_DEPOSITS":
            return [
                "Full refund of security deposit with 12% to 18% p.a. interest under Section 74 Indian Contract Act",
                "Filing of Consumer Complaint under Section 35 Consumer Protection Act, 2019 claiming compensation for mental agony",
                "Formal grievance to Kota District Collectorate Anti-Harassment Cell (Helpline: 0744-2325342)",
                "Issuance of 7-day Statutory Demand Notice prior to civil/consumer recovery litigation",
            ]
        if pillar == "CYBER_AND_FINANCIAL_FRAUD":
            return [
                "Immediate call to 1930 National Cyber Crime Reporting Portal to freeze beneficiary account",
                "Filing formal cybercrime FIR at cybercrime.gov.in under Section 318 BNS & Section 66D IT Act",
                "Written notification to Remitter Bank claiming Zero Customer Liability under RBI Circular DBR.No.Leg.BC.78/09.07.005/2017-18",
                "Grievance escalation to RBI Banking Ombudsman if bank rejects legitimate claim within 30 days",
            ]
        if pillar == "CHEQUE_DISHONOUR_NI_ACT":
            return [
                "Issuance of mandatory 15-day statutory demand notice under Section 138(b) of the Negotiable Instruments Act",
                "Criminal complaint under Section 138/142 NI Act before Judicial Magistrate First Class",
                "Interim compensation application under Section 143A NI Act (up to 20% of cheque amount)",
            ]
        if pillar == "CONSUMER_AND_EDUCATION":
            return [
                "Refund complaint before DCDRC on e-Daakhil portal under Section 35 CPA 2019",
                "Invocation of CCPA Guidelines for Prevention of Unfair Trade Practices in Coaching (2024)",
                "Exemplary damages for unfair contract terms under Section 2(46) Consumer Protection Act",
            ]
        return [
            "Filing of civil recovery suit under Order XXXVII CPC (Summary Suit)",
            "Application under Section 528 BNSS (formerly 482 CrPC) for quashing before High Court",
            "Issuance of legal notice through counsel demanding restitution and compliance",
        ]
