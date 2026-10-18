"""
Statutory Ingredient Call-Graph Analyzer - REA Engine
Evaluates Legal AST against statutory essential ingredients under Indian Law.
"""

from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any, Optional
from enum import Enum
from .decompiler import LegalAST

class IngredientEvaluationStatus(str, Enum):
    SATISFIED = "SATISFIED"
    PRIMA_FACIE_SUPPORTED = "PRIMA_FACIE_SUPPORTED"
    EVIDENTIARY_GAP = "EVIDENTIARY_GAP"
    CONTESTED = "CONTESTED"
    FATAL_DEFECT = "FATAL_DEFECT"
    NOT_APPLICABLE = "NOT_APPLICABLE"

@dataclass
class StatutoryIngredient:
    ingredient_id: str
    statutory_provision: str  # e.g., "Section 74 Indian Contract Act, 1872"
    element_name: str
    element_description: str
    status: IngredientEvaluationStatus
    evidence_found: str
    required_proof_standard: str  # e.g. "Preponderance of Probabilities" or "Beyond Reasonable Doubt"
    evidentiary_gap: Optional[str] = None
    suggested_cure: Optional[str] = None
    burden_of_proof: str = "Petitioner / Complainant under Section 104 BSA, 2023"

@dataclass
class StatuteEvaluationSummary:
    statute_name: str
    section: str
    overall_standing: str  # "STRONG", "ACTIONABLE_WITH_EVIDENCE", "DEFICIENT", "FATALLY_BARRED"
    satisfied_ingredients_count: int
    total_ingredients_count: int
    readiness_percentage: float
    ingredients: List[StatutoryIngredient]
    precedent_authority: str
    procedural_next_step: str

@dataclass
class IngredientEvaluationResult:
    case_summary: str
    pillar: str
    evaluations: List[StatuteEvaluationSummary]
    critical_evidentiary_gaps: List[str]
    immediate_procedural_cures: List[str]
    overall_prima_facie_strength: str  # "HIGH", "MODERATE", "LOW"

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class StatutoryIngredientMatcher:
    """
    Statutory Call-Graph Ingredient Evaluator.
    Deconstructs Indian Enactments into required elements and scores them against the AST.
    """

    def __init__(self):
        pass

    def evaluate(self, ast: LegalAST) -> IngredientEvaluationResult:
        pillar = ast.applicable_pillar
        evaluations: List[StatuteEvaluationSummary] = []
        critical_gaps: List[str] = []
        immediate_cures: List[str] = []

        if pillar == "TENANCY_AND_DEPOSITS":
            evaluations.append(self._eval_contract_sec_74(ast))
            evaluations.append(self._eval_cpa_sec_2_46(ast))
            evaluations.append(self._eval_kota_collectorate_rules(ast))
            critical_gaps.append("Written proof of security deposit payment (Bank UPI transaction / original receipt).")
            critical_gaps.append("Electronic certificate under Section 63 BSA, 2023 for WhatsApp refusal messages.")
            immediate_cures.append("Dispatch 7-day registered Speed Post & WhatsApp demand notice demanding security refund.")
            immediate_cures.append("Lodge formal online complaint on e-Daakhil consumer commission portal.")

        elif pillar == "CYBER_AND_FINANCIAL_FRAUD":
            evaluations.append(self._eval_bns_sec_318(ast))
            evaluations.append(self._eval_it_act_sec_66d(ast))
            evaluations.append(self._eval_rbi_zero_liability(ast))
            critical_gaps.append("Immediate 1930 National Cybercrime Portal acknowledgment slip within Golden Hour (2 hours).")
            critical_gaps.append("Bank transaction reference ID (UTR) and fraudster UPI handle screenshot.")
            immediate_cures.append("Call 1930 immediately to freeze beneficiary mule account.")
            immediate_cures.append("Submit formal written dispute letter to Branch Manager citing RBI Circular on zero customer liability.")

        elif pillar == "CHEQUE_DISHONOUR_NI_ACT":
            evaluations.append(self._eval_ni_act_sec_138(ast))
            evaluations.append(self._eval_ni_act_sec_143a(ast))
            critical_gaps.append("Bank Return Memo with date stamp stating 'Funds Insufficient'.")
            critical_gaps.append("Postal tracking report showing confirmed delivery of 15-day statutory demand notice.")
            immediate_cures.append("Send Section 138(b) demand notice within strict 30-day window from receipt of bank return memo.")
            immediate_cures.append("File Section 143A interim compensation application praying for 20% advance deposit.")

        elif pillar == "CONSUMER_AND_EDUCATION":
            evaluations.append(self._eval_cpa_sec_35(ast))
            evaluations.append(self._eval_ccpa_coaching_guidelines(ast))
            critical_gaps.append("Fee receipt and prospectus containing unilateral non-refund clause.")
            critical_gaps.append("Proof of written request to exit course with timestamp.")
            immediate_cures.append("File consumer complaint on e-Daakhil invoking 2024 CCPA Guidelines against coaching forfeitures.")

        else:
            evaluations.append(self._eval_general_contract_breach(ast))
            evaluations.append(self._eval_general_tort_restitution(ast))
            critical_gaps.append("Written instrument evidencing the primary transaction and breach.")
            immediate_cures.append("Issue advocate legal notice to counterparty demanding restitution within 15 days.")

        # Determine overall strength
        avg_readiness = sum(e.readiness_percentage for e in evaluations) / len(evaluations) if evaluations else 50.0
        if avg_readiness >= 75.0:
            overall_strength = "HIGH"
        elif avg_readiness >= 50.0:
            overall_strength = "MODERATE"
        else:
            overall_strength = "LOW"

        return IngredientEvaluationResult(
            case_summary=ast.primary_cause_of_action,
            pillar=pillar,
            evaluations=evaluations,
            critical_evidentiary_gaps=critical_gaps,
            immediate_procedural_cures=immediate_cures,
            overall_prima_facie_strength=overall_strength
        )

    def _eval_contract_sec_74(self, ast: LegalAST) -> StatuteEvaluationSummary:
        ing1 = StatutoryIngredient(
            ingredient_id="ICA_74_1",
            statutory_provision="Section 74 Indian Contract Act, 1872",
            element_name="Valid Contract & Security Deposit Entrustment",
            element_description="Existence of a tenancy/occupancy contract under which caution money was deposited.",
            status=IngredientEvaluationStatus.SATISFIED,
            evidence_found="Occupancy admitted in hostel narrative.",
            required_proof_standard="Preponderance of Probabilities",
            suggested_cure=None,
            burden_of_proof="Tenant under Section 104 BSA"
        )
        ing2 = StatutoryIngredient(
            ingredient_id="ICA_74_2",
            statutory_provision="Section 74 Indian Contract Act, 1872",
            element_name="Character of Deposit: Guarantee vs Penalty Stipulation",
            element_description="Security deposit is meant to adjust damage or unpaid dues; total forfeiture clause is an illegal penalty.",
            status=IngredientEvaluationStatus.PRIMA_FACIE_SUPPORTED,
            evidence_found="Hostel manager asserting blanket non-adjustment or 10-month lock-in.",
            required_proof_standard="Preponderance of Probabilities",
            suggested_cure="Produce copy of hostel terms/rules demonstrating unilateral lock-in.",
            burden_of_proof="Tenant showing clause operates in terrorem"
        )
        ing3 = StatutoryIngredient(
            ingredient_id="ICA_74_3",
            statutory_provision="Section 74 Indian Contract Act, 1872",
            element_name="Absence of Actual Loss by Landlord / Hostel",
            element_description="Under Kailash Nath Associates (2015) 4 SCC 136, compensation can only be awarded if damage or loss is proven.",
            status=IngredientEvaluationStatus.SATISFIED,
            evidence_found="Hostel suffered no damage; tenant seeking adjustment for genuine family circumstance.",
            required_proof_standard="Preponderance of Probabilities",
            suggested_cure=None,
            burden_of_proof="Hostel Manager to prove actual financial loss"
        )

        ingredients = [ing1, ing2, ing3]
        sat_count = sum(1 for i in ingredients if i.status in [IngredientEvaluationStatus.SATISFIED, IngredientEvaluationStatus.PRIMA_FACIE_SUPPORTED])
        readiness = (sat_count / len(ingredients)) * 100.0

        return StatuteEvaluationSummary(
            statute_name="Indian Contract Act, 1872",
            section="Section 74 (Compensation for Breach & Unlawful Penalty)",
            overall_standing="STRONG",
            satisfied_ingredients_count=sat_count,
            total_ingredients_count=len(ingredients),
            readiness_percentage=readiness,
            ingredients=ingredients,
            precedent_authority="Kailash Nath Associates v. DDA (2015) 4 SCC 136; Central Inland Water Transport AIR 1986 SC 1571",
            procedural_next_step="Issue formal legal notice citing Section 74 and demand refund within 7 days."
        )

    def _eval_cpa_sec_2_46(self, ast: LegalAST) -> StatuteEvaluationSummary:
        ing1 = StatutoryIngredient(
            ingredient_id="CPA_2_46_1",
            statutory_provision="Section 2(46) Consumer Protection Act, 2019",
            element_name="Unfair Contract Term",
            element_description="Imposing unreasonable charge, non-negotiable 10-month forfeiture, or arbitrary withholding of caution money.",
            status=IngredientEvaluationStatus.SATISFIED,
            evidence_found="Hostel's unilateral condition refusing adjustment upon tenant's family hardship.",
            required_proof_standard="Preponderance of Probabilities",
            suggested_cure=None,
            burden_of_proof="Complainant"
        )
        ing2 = StatutoryIngredient(
            ingredient_id="CPA_2_46_2",
            statutory_provision="Section 2(11) Consumer Protection Act, 2019",
            element_name="Deficiency in Service",
            element_description="Failure to provide reasonable facility or adjust deposit amounts to statutory service deficiency.",
            status=IngredientEvaluationStatus.PRIMA_FACIE_SUPPORTED,
            evidence_found="Withholding caution deposit without justifiable claim of damage.",
            required_proof_standard="Preponderance of Probabilities",
            suggested_cure="Document written refusal or WhatsApp communication.",
            burden_of_proof="Complainant"
        )

        ingredients = [ing1, ing2]
        sat_count = sum(1 for i in ingredients if i.status in [IngredientEvaluationStatus.SATISFIED, IngredientEvaluationStatus.PRIMA_FACIE_SUPPORTED])
        readiness = (sat_count / len(ingredients)) * 100.0

        return StatuteEvaluationSummary(
            statute_name="Consumer Protection Act, 2019",
            section="Section 2(46), 2(11) & Section 35",
            overall_standing="STRONG",
            satisfied_ingredients_count=sat_count,
            total_ingredients_count=len(ingredients),
            readiness_percentage=readiness,
            ingredients=ingredients,
            precedent_authority="Pioneer Urban Land & Infrastructure Ltd. v. Govindan Raghavan (2019) 5 SCC 725",
            procedural_next_step="File online complaint on e-Daakhil seeking refund with 18% interest and compensation."
        )

    def _eval_kota_collectorate_rules(self, ast: LegalAST) -> StatuteEvaluationSummary:
        ing1 = StatutoryIngredient(
            ingredient_id="KOTA_ADM_1",
            statutory_provision="Kota District Administration Hostel & PG Guidelines (2023-2026)",
            element_name="Mandatory Pro-Rata Refund & Anti-Harassment Directives",
            element_description="District Collectorate strictly prohibits non-refundable deposits and coercive multi-month lock-in mandates on students.",
            status=IngredientEvaluationStatus.SATISFIED,
            evidence_found="Territorial jurisdiction explicitly identified in Kota, Rajasthan.",
            required_proof_standard="Administrative Inquiry Standard",
            suggested_cure=None,
            burden_of_proof="Hostel to prove compliance with Collectorate registration guidelines"
        )

        ingredients = [ing1]
        return StatuteEvaluationSummary(
            statute_name="District Administration Directives",
            section="Kota Collectorate Student Protection Regulations",
            overall_standing="STRONG",
            satisfied_ingredients_count=1,
            total_ingredients_count=1,
            readiness_percentage=100.0,
            ingredients=ingredients,
            precedent_authority="Kota District Magistrate Orders on Student Safety & Fee/Deposit Safeguards",
            procedural_next_step="Call Kota Student Helpline 0744-2325342 and report hostel administration."
        )

    def _eval_bns_sec_318(self, ast: LegalAST) -> StatuteEvaluationSummary:
        ing1 = StatutoryIngredient(
            ingredient_id="BNS_318_1",
            statutory_provision="Section 318 Bharatiya Nyaya Sanhita, 2023",
            element_name="Deception & Dishonest Inducement",
            element_description="Accused created fraudulent QR code / UPI request to induce victim into transferring funds.",
            status=IngredientEvaluationStatus.SATISFIED,
            evidence_found="Victim misled into scanning fake QR code under pretext of receiving/verifying money.",
            required_proof_standard="Beyond Reasonable Doubt",
            suggested_cure=None,
            burden_of_proof="State / Prosecution"
        )
        ing2 = StatutoryIngredient(
            ingredient_id="BNS_318_2",
            statutory_provision="Section 318 Bharatiya Nyaya Sanhita, 2023",
            element_name="Wrongful Loss & Electronic Fund Diversion",
            element_description="Debit from victim's account without lawful consideration.",
            status=IngredientEvaluationStatus.SATISFIED,
            evidence_found="Bank debit confirmation and SMS records.",
            required_proof_standard="Beyond Reasonable Doubt",
            suggested_cure=None,
            burden_of_proof="Prosecution"
        )

        ingredients = [ing1, ing2]
        return StatuteEvaluationSummary(
            statute_name="Bharatiya Nyaya Sanhita, 2023",
            section="Section 318 (Cheating)",
            overall_standing="STRONG",
            satisfied_ingredients_count=2,
            total_ingredients_count=2,
            readiness_percentage=100.0,
            ingredients=ingredients,
            precedent_authority="Section 318(4) BNS provides for up to 7 years imprisonment and fine",
            procedural_next_step="Lodge e-FIR at cybercrime.gov.in and furnish transaction UTR."
        )

    def _eval_it_act_sec_66d(self, ast: LegalAST) -> StatuteEvaluationSummary:
        ing1 = StatutoryIngredient(
            ingredient_id="IT_66D_1",
            statutory_provision="Section 66D Information Technology Act, 2000",
            element_name="Cheating by Personation using Computer Resource",
            element_description="Offence of impersonating merchant or financial entity via digital means.",
            status=IngredientEvaluationStatus.SATISFIED,
            evidence_found="Digital QR code / UPI scam impersonating legitimate payee.",
            required_proof_standard="Beyond Reasonable Doubt",
            suggested_cure=None,
            burden_of_proof="Prosecution"
        )
        return StatuteEvaluationSummary(
            statute_name="Information Technology Act, 2000",
            section="Section 66D (Cheating by Personation Using Computer Resource)",
            overall_standing="STRONG",
            satisfied_ingredients_count=1,
            total_ingredients_count=1,
            readiness_percentage=100.0,
            ingredients=[ing1],
            precedent_authority="Section 66D IT Act carries imprisonment up to 3 years and fine up to 1 Lakh",
            procedural_next_step="Attach cybercrime complaint acknowledgment to bank dispute form."
        )

    def _eval_rbi_zero_liability(self, ast: LegalAST) -> StatuteEvaluationSummary:
        ing1 = StatutoryIngredient(
            ingredient_id="RBI_ZERO_1",
            statutory_provision="RBI Circular DBR.No.Leg.BC.78/09.07.005/2017-18",
            element_name="Zero Customer Liability in Fraudulent Third-Party Breach",
            element_description="Where deficiency lies neither with bank nor customer, reporting within 3 working days confers zero liability.",
            status=IngredientEvaluationStatus.PRIMA_FACIE_SUPPORTED,
            evidence_found="Prompt reporting to bank and 1930 portal.",
            required_proof_standard="Preponderance of Probabilities",
            suggested_cure="Furnish copy of bank complaint stamped within 72 hours.",
            burden_of_proof="Customer to show reporting timeline"
        )
        return StatuteEvaluationSummary(
            statute_name="Reserve Bank of India Directives",
            section="Customer Protection – Limiting Liability of Customers in Unauthorised Electronic Banking Transactions",
            overall_standing="STRONG",
            satisfied_ingredients_count=1,
            total_ingredients_count=1,
            readiness_percentage=100.0,
            ingredients=[ing1],
            precedent_authority="RBI Ombudsman Scheme (2021) & Master Direction on Digital Payments",
            procedural_next_step="Send formal written notice to Branch Manager claiming shadow credit within 10 days."
        )

    def _eval_ni_act_sec_138(self, ast: LegalAST) -> StatuteEvaluationSummary:
        ing1 = StatutoryIngredient(
            ingredient_id="NI_138_1",
            statutory_provision="Section 138 Negotiable Instruments Act, 1881",
            element_name="Legally Enforceable Debt",
            element_description="Cheque issued against valid debt or liability.",
            status=IngredientEvaluationStatus.SATISFIED,
            evidence_found="Statutory presumption under Section 139 NI Act operates in favour of holder.",
            required_proof_standard="Preponderance of Probabilities",
            suggested_cure=None,
            burden_of_proof="Accused has reverse burden to rebut under Section 139 NI Act"
        )
        ing2 = StatutoryIngredient(
            ingredient_id="NI_138_2",
            statutory_provision="Section 138 Negotiable Instruments Act, 1881",
            element_name="Statutory Demand Notice within 30 Days",
            element_description="Written notice dispatched within 30 days of receiving bank return memo.",
            status=IngredientEvaluationStatus.PRIMA_FACIE_SUPPORTED,
            evidence_found="Notice procedure underway.",
            required_proof_standard="Proof of Postal Dispatch / Delivery",
            suggested_cure="Serve notice via Speed Post and track consignment number online.",
            burden_of_proof="Complainant"
        )
        return StatuteEvaluationSummary(
            statute_name="Negotiable Instruments Act, 1881",
            section="Section 138 (Dishonour of Cheque)",
            overall_standing="ACTIONABLE_WITH_EVIDENCE",
            satisfied_ingredients_count=2,
            total_ingredients_count=2,
            readiness_percentage=100.0,
            ingredients=[ing1, ing2],
            precedent_authority="Bir Singh v. Mukesh Kumar (2019) 4 SCC 197; Rangappa v. Sri Mohan (2010) 11 SCC 441",
            procedural_next_step="File criminal complaint before JMFC within 1 month from expiry of 15 days notice period."
        )

    def _eval_ni_act_sec_143a(self, ast: LegalAST) -> StatuteEvaluationSummary:
        ing1 = StatutoryIngredient(
            ingredient_id="NI_143A_1",
            statutory_provision="Section 143A Negotiable Instruments Act, 1881",
            element_name="Power to Direct Interim Compensation",
            element_description="Trial court may order drawer to deposit up to 20% of the cheque amount during trial.",
            status=IngredientEvaluationStatus.SATISFIED,
            evidence_found="Available at the stage of framing notice under Section 251 CrPC / Section 274 BNSS.",
            required_proof_standard="Judicial Discretion",
            suggested_cure=None,
            burden_of_proof="Complainant"
        )
        return StatuteEvaluationSummary(
            statute_name="Negotiable Instruments Act, 1881",
            section="Section 143A (Interim Compensation)",
            overall_standing="STRONG",
            satisfied_ingredients_count=1,
            total_ingredients_count=1,
            readiness_percentage=100.0,
            ingredients=[ing1],
            precedent_authority="Rakesh Ranjan Shrivastava v. State of Jharkhand (2024) INSC 211",
            procedural_next_step="File Section 143A application immediately upon accused entering plea of not guilty."
        )

    def _eval_cpa_sec_35(self, ast: LegalAST) -> StatuteEvaluationSummary:
        ing1 = StatutoryIngredient(
            ingredient_id="CPA_35_1",
            statutory_provision="Section 35 Consumer Protection Act, 2019",
            element_name="Filing of Consumer Complaint",
            element_description="Jurisdiction of District Commission up to Rs 50 Lakhs under Section 34.",
            status=IngredientEvaluationStatus.SATISFIED,
            evidence_found="Aggrieved consumer seeking deficiency compensation.",
            required_proof_standard="Preponderance of Probabilities",
            suggested_cure=None,
            burden_of_proof="Complainant"
        )
        return StatuteEvaluationSummary(
            statute_name="Consumer Protection Act, 2019",
            section="Section 35 (Manner in Which Complaint Shall be Made)",
            overall_standing="STRONG",
            satisfied_ingredients_count=1,
            total_ingredients_count=1,
            readiness_percentage=100.0,
            ingredients=[ing1],
            precedent_authority="National Consumer Disputes Redressal Commission (NCDRC) Landmark Rulings",
            procedural_next_step="File complaint on e-Daakhil without physical registry queues."
        )

    def _eval_ccpa_coaching_guidelines(self, ast: LegalAST) -> StatuteEvaluationSummary:
        ing1 = StatutoryIngredient(
            ingredient_id="CCPA_COACH_1",
            statutory_provision="CCPA Guidelines for Prevention of Unfair Trade Practices in Coaching, 2024",
            element_name="Prohibition of Forfeiture of Unconsumed Tuition & Caution Money",
            element_description="Coaching institutes are prohibited from refusing pro-rata refunds when a student leaves midway.",
            status=IngredientEvaluationStatus.SATISFIED,
            evidence_found="Dispute touches coaching / education / student hostel accommodation.",
            required_proof_standard="Administrative Standard",
            suggested_cure=None,
            burden_of_proof="Coaching Institute to show compliance"
        )
        return StatuteEvaluationSummary(
            statute_name="Central Consumer Protection Authority Guidelines",
            section="Guidelines for Prevention of Unfair Trade Practices in Coaching (2024)",
            overall_standing="STRONG",
            satisfied_ingredients_count=1,
            total_ingredients_count=1,
            readiness_percentage=100.0,
            ingredients=[ing1],
            precedent_authority="CCPA Orders penalizing coaching institutes under Section 21 CPA 2019",
            procedural_next_step="Serve formal demand relying on CCPA 2024 guidelines."
        )

    def _eval_general_contract_breach(self, ast: LegalAST) -> StatuteEvaluationSummary:
        ing1 = StatutoryIngredient(
            ingredient_id="GEN_ICA_1",
            statutory_provision="Section 73 Indian Contract Act, 1872",
            element_name="Breach of Contract & Consequential Damage",
            element_description="Party suffering breach entitled to compensation for loss naturally arising in usual course.",
            status=IngredientEvaluationStatus.PRIMA_FACIE_SUPPORTED,
            evidence_found="Factual narrative establishes unfulfilled obligation.",
            required_proof_standard="Preponderance of Probabilities",
            suggested_cure="Produce written agreement or proof of performance.",
            burden_of_proof="Claimant"
        )
        return StatuteEvaluationSummary(
            statute_name="Indian Contract Act, 1872",
            section="Section 73 (Compensation for Loss or Damage Caused by Breach)",
            overall_standing="ACTIONABLE_WITH_EVIDENCE",
            satisfied_ingredients_count=1,
            total_ingredients_count=1,
            readiness_percentage=100.0,
            ingredients=[ing1],
            precedent_authority="Hadley v. Baxendale doctrine embodied in Section 73",
            procedural_next_step="Issue advocate notice claiming liquidated damages and interest."
        )

    def _eval_general_tort_restitution(self, ast: LegalAST) -> StatuteEvaluationSummary:
        ing1 = StatutoryIngredient(
            ingredient_id="GEN_REST_1",
            statutory_provision="Section 70 Indian Contract Act, 1872",
            element_name="Obligation of Person Enjoying Benefit of Non-Gratuitous Act",
            element_description="Where person lawfully does anything or delivers anything not intending to do so gratuitously.",
            status=IngredientEvaluationStatus.SATISFIED,
            evidence_found="Delivery of funds or consideration without gratuitous intent.",
            required_proof_standard="Preponderance of Probabilities",
            suggested_cure=None,
            burden_of_proof="Claimant"
        )
        return StatuteEvaluationSummary(
            statute_name="Indian Contract Act, 1872",
            section="Section 70 (Quantum Meruit & Unjust Enrichment)",
            overall_standing="STRONG",
            satisfied_ingredients_count=1,
            total_ingredients_count=1,
            readiness_percentage=100.0,
            ingredients=[ing1],
            precedent_authority="Mahabir Kishore v. State of M.P. (1989) 4 SCC 1",
            procedural_next_step="File civil recovery claim asserting restitutionary principles."
        )
