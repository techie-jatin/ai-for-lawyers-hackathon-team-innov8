"""
Tri-Perspective Chamber Battle-Room - REA Engine
Simulates senior legal debate across 3 adversarial chambers:
1. Petitioner Senior Counsel (Affirmative grounds & maximum relief)
2. Opposing Senior Counsel (Devil's Advocate, preliminary objections, fatal defects)
3. Judicial Bench (High Court / Supreme Court Judge balancing precedent & probabilities)
"""

from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any, Optional
from .decompiler import LegalAST
from .ingredient_matcher import IngredientEvaluationResult

@dataclass
class PerspectiveBrief:
    perspective: str  # "PETITIONER_COUNSEL", "OPPOSING_COUNSEL", "JUDICIAL_BENCH"
    counsel_title: str
    core_thesis: str
    primary_arguments: List[str]
    statutory_leverage: List[str]
    precedent_citations: List[str]
    procedural_tactics: List[str]
    vulnerabilities_acknowledged: List[str] = field(default_factory=list)

@dataclass
class ChamberVerdict:
    case_title: str
    applicable_pillar: str
    petitioner_brief: PerspectiveBrief
    opposing_brief: PerspectiveBrief
    judicial_bench_brief: PerspectiveBrief
    probability_of_success_score: int  # 0 to 100
    settlement_viability_score: int    # 0 to 100
    preliminary_objections_risk: str   # "LOW", "MEDIUM", "HIGH"
    courtroom_order_summary: str
    recommended_consent_terms: List[str]
    critical_evidentiary_defects: List[str]

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class TriPerspectiveChamber:
    """
    Simulates a courtroom chamber debate among Senior Advocates and the Judicial Bench.
    Provides bullet-proof defensive and offensive tactical analysis for advocates and citizens.
    """

    def __init__(self):
        pass

    def deliberate(self, ast: LegalAST, evaluation: IngredientEvaluationResult) -> ChamberVerdict:
        pillar = ast.applicable_pillar
        
        petitioner = self._build_petitioner_brief(ast, evaluation)
        opposing = self._build_opposing_brief(ast, evaluation)
        bench = self._build_judicial_bench_brief(ast, evaluation, petitioner, opposing)

        # Calculate scores
        prob_score = 85
        settlement_score = 75
        prelim_risk = "LOW"

        if pillar == "TENANCY_AND_DEPOSITS":
            prob_score = 92
            settlement_score = 88
            prelim_risk = "LOW"
            order_summary = (
                "INTERIM RELIEF / ADJUDICATION: The Respondent Hostel is prima facie in breach of Section 74 "
                "of the Indian Contract Act and Section 2(46) of the Consumer Protection Act, 2019. "
                "A blanket 10-month lock-in or refusal to adjust caution money during family exigencies operates in terrorem. "
                "The Commission / Court directs immediate refund of the security deposit after deducting verified damage, "
                "failing which interest at 12% p.a. and Rs 25,000 litigation costs shall be awarded."
            )
            consent_terms = [
                "Hostel administration to adjust or refund 100% of caution money within 7 working days via direct bank transfer.",
                "Student to clear current month pro-rata electricity and maintenance dues up to the date of physical handover.",
                "Both parties execute mutual full and final satisfaction discharge with no criminal or consumer proceedings."
            ]
        elif pillar == "CYBER_AND_FINANCIAL_FRAUD":
            prob_score = 78
            settlement_score = 65
            prelim_risk = "MEDIUM"
            order_summary = (
                "JUDICIAL DIRECTION / OMBUDSMAN ORDER: Having reported the unauthorized electronic debit within the Golden Hour "
                "to the 1930 portal and the Remitter Bank under RBI Circular DBR.No.Leg.BC.78/09.07.005/2017-18, the customer is "
                "entitled to Zero Customer Liability. The beneficiary bank is directed to keep the fraudulent credit frozen and "
                "reverse funds to complainant's account upon police clearance under Section 106 BNSS."
            )
            consent_terms = [
                "Remitter bank to credit shadow amount into customer's account pending police investigation resolution.",
                "Complainant to submit Section 63 BSA certificate for transaction screenshots and copy of Cyber Crime acknowledgment.",
                "State cyber cell to seize frozen funds under Section 106 BNSS and release to rightful owner via magistrate order."
            ]
        elif pillar == "CHEQUE_DISHONOUR_NI_ACT":
            prob_score = 88
            settlement_score = 80
            prelim_risk = "LOW"
            order_summary = (
                "TRIAL ORDER: Statutory presumption under Section 139 NI Act stands firmly in favour of the complainant. "
                "The drawer is directed to deposit 20% of the cheque face value as interim compensation under Section 143A NI Act "
                "within 60 days. Matter referred to National Lok Adalat for compounding under Section 147 NI Act."
            )
            consent_terms = [
                "Accused/Drawer pays 100% of cheque principal amount in 2 equal monthly installments.",
                "Complainant surrenders dishonoured cheque and withdraws complaint under Section 147 NI Act upon realization."
            ]
        else:
            prob_score = 70
            settlement_score = 60
            prelim_risk = "MEDIUM"
            order_summary = (
                "ORDER: Plaint discloses actionable cause of action. Application under Order VII Rule 11 CPC dismissed. "
                "Parties directed to undergo mediation under Section 89 CPC."
            )
            consent_terms = [
                "Parties agree to reference before mediator at High Court / District Mediation Centre.",
                "Status quo maintained regarding disputed subject matter pending conciliation."
            ]

        return ChamberVerdict(
            case_title=f"{ast.primary_cause_of_action} [{ast.jurisdiction.district or 'Jurisdictional Forum'}]",
            applicable_pillar=pillar,
            petitioner_brief=petitioner,
            opposing_brief=opposing,
            judicial_bench_brief=bench,
            probability_of_success_score=prob_score,
            settlement_viability_score=settlement_score,
            preliminary_objections_risk=prelim_risk,
            courtroom_order_summary=order_summary,
            recommended_consent_terms=consent_terms,
            critical_evidentiary_defects=evaluation.critical_evidentiary_gaps
        )

    def _build_petitioner_brief(self, ast: LegalAST, eval_res: IngredientEvaluationResult) -> PerspectiveBrief:
        pillar = ast.applicable_pillar
        if pillar == "TENANCY_AND_DEPOSITS":
            return PerspectiveBrief(
                perspective="PETITIONER_COUNSEL",
                counsel_title="Senior Counsel for Tenant / Aggrieved Student",
                core_thesis="Security deposit is a fiduciary trust, not liquidated damages or extortionate profit.",
                primary_arguments=[
                    "Under Section 74 of the Indian Contract Act, forfeiture of security deposit without proving actual loss is an unlawful penalty in terrorem (Kailash Nath Associates v. DDA (2015) 4 SCC 136).",
                    "A unilateral 10-month lock-in clause or non-adjustment condition in a standard-form student contract is void as an 'Unfair Contract' under Section 2(46) of the Consumer Protection Act, 2019 (Central Inland Water Transport Corp AIR 1986 SC 1571).",
                    "The Kota District Administration explicitly mandates that students facing family exigencies are entitled to pro-rata refunds without coercive deductions.",
                    "Withholding caution money constitutes criminal breach of trust under Section 316 BNS and actionable deficiency in service under Section 2(11) CPA 2019."
                ],
                statutory_leverage=[
                    "Section 74 Indian Contract Act, 1872 (Bar on illegal penalties)",
                    "Section 2(46) & Section 35 Consumer Protection Act, 2019 (Unfair contract redressal)",
                    "Article 21 Constitution of India (Right to dignified education & shelter free from harassment)",
                    "Kota District Collectorate Orders on Student Safety & Caution Money Protection"
                ],
                precedent_citations=[
                    "Kailash Nath Associates v. DDA (2015) 4 SCC 136",
                    "Central Inland Water Transport Corp. v. Brojo Nath Ganguly (1986) 3 SCC 156",
                    "Pioneer Urban Land & Infrastructure Ltd. v. Govindan Raghavan (2019) 5 SCC 725"
                ],
                procedural_tactics=[
                    "Serve immediate 7-day registered notice via WhatsApp and Speed Post.",
                    "Lodge simultaneous online consumer complaint on e-Daakhil praying for interim deposit release.",
                    "Dial Kota Student Helpline 0744-2325342 to trigger District Administration intervention."
                ]
            )
        elif pillar == "CYBER_AND_FINANCIAL_FRAUD":
            return PerspectiveBrief(
                perspective="PETITIONER_COUNSEL",
                counsel_title="Senior Counsel for Fraud Victim / Account Holder",
                core_thesis="Electronic fraud constitutes zero customer liability under binding RBI circulars and cognizable cyber fraud.",
                primary_arguments=[
                    "The victim was defrauded via deceptive QR code simulation without voluntary handover of consideration.",
                    "Under RBI Master Direction DBR.No.Leg.BC.78/09.07.005/2017-18, reporting within 3 days mandates 100% zero customer liability.",
                    "Beneficiary bank holds fraudulent proceeds as trustee and must freeze the account under Section 106 BNSS."
                ],
                statutory_leverage=[
                    "Section 318 Bharatiya Nyaya Sanhita, 2023 (Cheating)",
                    "Section 66D Information Technology Act, 2000 (Impersonation fraud)",
                    "RBI Circular on Limiting Customer Liability in Electronic Transactions"
                ],
                precedent_citations=[
                    "State of Punjab v. Baldev Singh (1999) 6 SCC 172",
                    "RBI Banking Ombudsman Landmark Awards on Cyber Phishing"
                ],
                procedural_tactics=[
                    "Dial 1930 within the Golden Hour to flag transaction on National Cybercrime Reporting Portal.",
                    "Serve formal notice on bank branch manager demanding shadow credit under RBI guidelines."
                ]
            )
        else:
            return PerspectiveBrief(
                perspective="PETITIONER_COUNSEL",
                counsel_title="Senior Counsel for Claimant",
                core_thesis="Actionable legal right infringed with entitlement to restitutionary relief.",
                primary_arguments=[
                    "Defendant is in breach of statutory covenants and non-gratuitous benefits under Section 70 & 73 Indian Contract Act.",
                    "Substantial equity and documentary balance of convenience lies firmly in petitioner's favour."
                ],
                statutory_leverage=[
                    "Section 73 & 74 Indian Contract Act, 1872",
                    "Order XXXIX Rules 1 & 2 CPC (Temporary Injunction)"
                ],
                precedent_citations=["Hadley v. Baxendale doctrine"],
                procedural_tactics=["Issue 15-day statutory notice prior to invoking civil court jurisdiction."]
            )

    def _build_opposing_brief(self, ast: LegalAST, eval_res: IngredientEvaluationResult) -> PerspectiveBrief:
        pillar = ast.applicable_pillar
        if pillar == "TENANCY_AND_DEPOSITS":
            return PerspectiveBrief(
                perspective="OPPOSING_COUNSEL",
                counsel_title="Senior Counsel for Hostel Administration / Landlord",
                core_thesis="Contractual sanctity: The occupant voluntarily agreed to 10-month lock-in and non-adjustment terms.",
                primary_arguments=[
                    "Pacta sunt servanda: The occupant signed the hostel registration form containing the explicit lock-in condition and cannot unilaterally renegotiate terms midway.",
                    "Security deposit is held to adjust unpaid room rent and damages upon physical vacation, not during active mid-term subsistence.",
                    "Hostel management incurs fixed annual operational costs (lease, mess staff, electricity sanctions) based on full academic year admissions; mid-session departure causes unmitigated commercial vacancy.",
                    "Criminal allegations under BNS 316/318 are completely baseless and constitute abuse of process to force commercial concession."
                ],
                statutory_leverage=[
                    "Section 10 Indian Contract Act, 1872 (All agreements are contracts if made by free consent)",
                    "Section 91 & 92 Bharatiya Sakshya Adhiniyam, 2023 (Exclusion of oral evidence to contradict written contract terms)",
                    "Rajasthan Rent Control Act, 2001 (Jurisdiction of Rent Tribunal over tenancy disputes)"
                ],
                precedent_citations=[
                    "Bharati Knitting Co. v. DHL Worldwide Express Courier (1996) 4 SCC 704 (Party bound by signed terms)",
                    "State of Haryana v. Bhajan Lal 1992 Supp (1) SCC 335 (Quashing of civil disputes camouflaged as crime)"
                ],
                procedural_tactics=[
                    "Raise preliminary objection on maintainability before Consumer Forum (Hostel is a licence/tenancy, not consumer service).",
                    "Demand inspection of room for physical damage before any deposit calculation is entertained.",
                    "File counter-claim for balance academic year maintenance charges."
                ],
                vulnerabilities_acknowledged=[
                    "Total forfeiture without proving actual room vacancy loss violates Kailash Nath Associates.",
                    "District Collectorate administrative orders carry penal weight under Section 223 BNS (Disobedience of public servant order)."
                ]
            )
        elif pillar == "CYBER_AND_FINANCIAL_FRAUD":
            return PerspectiveBrief(
                perspective="OPPOSING_COUNSEL",
                counsel_title="Counsel for Remitter Bank / Respondent",
                core_thesis="Customer negligence and authorization of transaction negate zero liability protections.",
                primary_arguments=[
                    "The customer actively entered their UPI PIN or scanned QR code, constituting authorized customer instruction.",
                    "Under RBI guidelines, if customer negligence (sharing OTP/PIN) is established, liability rests with the customer until reporting.",
                    "The bank acted merely as a payment intermediary and cannot be held liable for third-party social engineering scams."
                ],
                statutory_leverage=[
                    "Payment and Settlement Systems Act, 2007",
                    "RBI Circular Para 6 (Customer liability where loss is due to negligence by customer)"
                ],
                precedent_citations=["NCDRC orders upholding bank non-liability in customer-authorized OTP sharing cases"],
                procedural_tactics=["Demand digital audit logs and IP verification from NPCI."]
            )
        else:
            return PerspectiveBrief(
                perspective="OPPOSING_COUNSEL",
                counsel_title="Opposing Senior Counsel",
                core_thesis="Plaint suffers from fatal threshold bars under Order VII Rule 11 CPC and Limitation Act.",
                primary_arguments=[
                    "Cause of action is speculative and barred by statutory limitation.",
                    "Plaintiff has suppressed material facts and approached court with unclean hands."
                ],
                statutory_leverage=["Order VII Rule 11 CPC", "Limitation Act, 1963"],
                precedent_citations=["State of Haryana v. Bhajan Lal"],
                procedural_tactics=["File preliminary objection under Order VII Rule 11 before filing written statement."]
            )

    def _build_judicial_bench_brief(
        self, ast: LegalAST, eval_res: IngredientEvaluationResult,
        petitioner: PerspectiveBrief, opposing: PerspectiveBrief
    ) -> PerspectiveBrief:
        pillar = ast.applicable_pillar
        if pillar == "TENANCY_AND_DEPOSITS":
            return PerspectiveBrief(
                perspective="JUDICIAL_BENCH",
                counsel_title="Judicial Bench (District Commission / High Court Single Bench)",
                core_thesis="Equitable balance: Security deposit cannot be confiscated in terrorem; reasonable pro-rata settlement mandatory.",
                primary_arguments=[
                    "The Supreme Court in Kailash Nath Associates (2015) 4 SCC 136 authoritatively settled that Section 74 Contract Act requires proof of actual damage. A landlord or hostel cannot forfeit caution money without proving loss.",
                    "Standard form contracts signed by students/parents possess unequal bargaining power. Central Inland Water Transport Corp (1986) renders unconscionable standard terms void.",
                    "However, the hostel is entitled to legitimate pro-rata deductions for days actually occupied and verifiable utility dues.",
                    "Criminal prosecution under Section 318 BNS is discouraged; appropriate remedy lies before Consumer Commission or District Collectorate Student Cell."
                ],
                statutory_leverage=[
                    "Section 74 Indian Contract Act, 1872",
                    "Section 2(46) Consumer Protection Act, 2019",
                    "Order 39 Rules 1-2 CPC (Interim equitable relief)",
                    "Article 14 & 21 Constitution of India"
                ],
                precedent_citations=[
                    "Kailash Nath Associates v. DDA (2015) 4 SCC 136",
                    "Central Inland Water Transport Corp. AIR 1986 SC 1571",
                    "Pioneer Urban Land v. Govindan Raghavan (2019) 5 SCC 725"
                ],
                procedural_tactics=[
                    "Advise pre-litigation settlement via Kota Student Helpline (0744-2325342).",
                    "If unyielding, file e-Daakhil consumer complaint with copy of demand notice and rent receipt."
                ]
            )
        elif pillar == "CYBER_AND_FINANCIAL_FRAUD":
            return PerspectiveBrief(
                perspective="JUDICIAL_BENCH",
                counsel_title="Judicial Bench / Cyber Appellate Authority",
                core_thesis="Swift reporting triggers zero liability; beneficiary funds must be frozen and restored.",
                primary_arguments=[
                    "If complaint was lodged within 72 hours, RBI zero customer liability protection is triggered.",
                    "Cyber police must utilize Section 106 BNSS to seize and remit frozen funds to complainant.",
                    "Bank cannot wash hands when beneficiary account exhibits mule account patterns."
                ],
                statutory_leverage=["Section 318 BNS", "Section 66D IT Act", "RBI Circular 2017"],
                precedent_citations=["Supreme Court directives on cyber fraud expeditious restitution"],
                procedural_tactics=["Expedite magistrate de-freezing order once 1930 portal freezes money in mule account."]
            )
        else:
            return PerspectiveBrief(
                perspective="JUDICIAL_BENCH",
                counsel_title="Judicial Bench",
                core_thesis="Adjudicate preliminary objections while safeguarding fundamental fair hearing.",
                primary_arguments=[
                    "Plaint must be scrutinized strictly under Order VII Rule 11 CPC.",
                    "Opportunity to cure evidentiary deficiencies granted prior to peremptory dismissal."
                ],
                statutory_leverage=["Section 9 & 151 CPC"],
                precedent_citations=["Salem Advocate Bar Association v. UOI (2005) 6 SCC 344"],
                procedural_tactics=["Order court-annexed mediation under Section 89 CPC."]
            )
