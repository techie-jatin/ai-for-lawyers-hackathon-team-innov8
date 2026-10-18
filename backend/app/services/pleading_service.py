"""
Bharat Legal Intelligence 2.0 - Court-Ready Pleading & Notice Studio Service
Generates authentic, verified Indian High Court, District Court, and Tribunal Pleadings
and Statutory Legal Notices adhering to High Court Rules and District Court Practice.
"""

from typing import Dict, Any, List, Optional
import os
import json
import urllib.request
from app.core.config import settings

def _val(data: Dict[str, Any], key: str, default: str) -> str:
    v = data.get(key)
    if v is not None and str(v).strip():
        return str(v).strip()
    return default

def generate_quashing_528_bnss(data: Dict[str, Any]) -> str:
    court_name = _val(data, "court_name", "THE HIGH COURT OF JUDICATURE AT DELHI")
    petitioner_name = _val(data, "petitioner_name", "Sunil Sharma")
    petitioner_details = _val(data, "petitioner_details", "S/o Sh. Ramesh Sharma, R/o Flat No. 402, Green Avenue, New Delhi - 110025")
    respondent_name = _val(data, "respondent_name", "Vikram Patel")
    respondent_details = _val(data, "respondent_details", "R/o 12, Civil Lines, Kota, Rajasthan")
    state_name = _val(data, "state_name", "STATE (NCT OF DELHI)")
    fir_no = _val(data, "case_number", "FIR No. 248/2026")
    ps = _val(data, "police_station", "P.S. Connaught Place")
    incident_date = _val(data, "incident_date", "14th March, 2026")
    facts_summary = _val(data, "facts_summary", "The dispute between the parties arises out of a commercial and tenancy agreement wherein the complainant is attempting to convert a purely civil contractual dispute regarding security deposit adjustment into criminal offences of cheating and criminal intimidation.")
    advocate_name = _val(data, "advocate_name", "Advocate A. K. Verma & Associates")
    advocate_enrol = _val(data, "advocate_enrolment", "D/1452/2018")

    return f"""IN {court_name.upper()}
CRIMINAL MISCELLANEOUS PETITION NO. _____ OF 2026
(UNDER SECTION 528 OF THE BHARATIYA NAGARIK SURAKSHA SANHITA, 2023)

IN THE MATTER OF:
{petitioner_name.upper()},
{petitioner_details}
                                                        ...PETITIONER

                                VERSUS

1. {state_name.upper()}
   THROUGH SHO, {ps.upper()}
                                                        ...RESPONDENT NO. 1

2. {respondent_name.upper()},
   {respondent_details}
                                                        ...RESPONDENT NO. 2 / COMPLAINANT

MEMORANDUM OF CRIMINAL MISCELLANEOUS PETITION UNDER SECTION 528 OF THE 
BHARATIYA NAGARIK SURAKSHA SANHITA, 2023 (BNSS) FOR QUASHING OF {fir_no.upper()} 
DATED {incident_date.upper()} REGISTERED AT {ps.upper()} UNDER SECTIONS 318(4) / 
351(2) OF BHARATIYA NYAYA SANHITA, 2023 AND ALL PROCEEDINGS ARISING THEREFROM.

TO,
THE HON'BLE THE CHIEF JUSTICE AND HIS COMPANION JUSTICES OF THE HON'BLE HIGH COURT.

THE HUMBLE PETITION OF THE PETITIONER ABOVENAMED:

MOST RESPECTFULLY SHOWETH:

1. SYNOPSIS & CHRONOLOGICAL LIST OF DATES:
   (a) {incident_date}: Parties entered into mutual commercial/tenancy arrangement.
   (b) Subsequent Date: Dispute arose strictly regarding contractual interpretation and deposit adjustment.
   (c) Registration Date: Respondent No. 2 lodged impugned {fir_no} falsely attributing criminal cheating and intimidation.
   (d) Present Date: Petitioner files this petition under Section 528 BNSS (formerly Section 482 CrPC) as continuation of proceedings constitutes gross abuse of the process of law.

2. STATEMENT OF MATERIAL FACTS:
   {facts_summary}
   That a bare perusal of the impugned FIR reveals that no prima facie offence under Section 318(4) BNS (formerly Section 420 IPC) or Section 351(2) BNS (formerly Section 506 IPC) is disclosed against the Petitioner.

3. GROUNDS FOR QUASHING:
   A. CIVIL DISPUTE CRIMINALIZED (HIT BY BHAJAN LAL RATIO):
      The Hon'ble Supreme Court in 'State of Haryana v. Bhajan Lal', [1992] Supp (1) SCC 335, and recently reaffirmed in 'Prof. R.K. Vijayasarathy v. Sudha Seetharam', [2019] 16 SCC 739, categorically held that criminal proceedings instituted with an ulterior motive for wreaking vengeance on the private dispute of civil nature must be quashed under the inherent powers of the High Court.

   B. ABSENCE OF FRAUDULENT INTENTION AB INITIO:
      To sustain a prosecution for cheating under Section 318(4) of the Bharatiya Nyaya Sanhita, 2023, the prosecution must establish dishonest and fraudulent intention at the very inception of the transaction. A subsequent breach of contract or financial disagreement does not give rise to criminal liability ('Hridaya Ranjan Prasad Verma v. State of Bihar', (2000) 4 SCC 168).

   C. VIOLATION OF SECTION 74 INDIAN CONTRACT ACT & STATUTORY SAFEKEEPS:
      The allegations of Respondent No. 2 rest upon arbitrary penal clauses which are void ab initio pursuant to Section 74 of the Indian Contract Act, 1872 as held by the Constitution Bench in 'Fateh Chand v. Balkishan Das' and 'Kailash Nath Associates v. DDA', (2015) 4 SCC 136.

   D. FLAGRANT VIOLATION OF SECTION 35(3) BNSS ARREST SAFEGUARDS:
      The investigating authority has initiated coercive pressure in total defiance of mandatory statutory Notice of Appearance under Section 35(3) of the Bharatiya Nagarik Suraksha Sanhita, 2023 and the binding directions of the Hon'ble Supreme Court in 'Arnesh Kumar v. State of Bihar', (2014) 8 SCC 273 and 'Satender Kumar Antil v. CBI', (2022) 10 SCC 51.

4. SPECIFIC STATUTORY AVERMENTS:
   (a) The Petitioner has not filed any other or similar petition challenging the impugned FIR before this Hon'ble Court or before the Hon'ble Supreme Court of India.
   (b) The Petitioner has clean antecedents, is a respectable citizen with deep roots in society, and has no criminal convictions.
   (c) The cause of action arose within the territorial supervisory jurisdiction of this Hon'ble High Court.

PRAYER:
In the premises aforesaid, it is most respectfully prayed that this Hon'ble Court may graciously be pleased to:
(i) Quash and set aside the impugned {fir_no} registered at {ps} under Sections 318(4)/351(2) of the Bharatiya Nyaya Sanhita, 2023 and all consequential proceedings emanating therefrom;
(ii) Grant ad-interim ex-parte stay of all coercive proceedings and investigation against the Petitioner during the pendency of the present petition; and
(iii) Pass such other or further order(s) as this Hon'ble Court may deem fit and proper in the interest of justice.

AND FOR THIS ACT OF KINDNESS, THE PETITIONER AS IN DUTY BOUND SHALL EVER PRAY.

FILED BY:
{advocate_name.upper()}
COUNSEL FOR THE PETITIONER
ENROLMENT NO.: {advocate_enrol}
CHAMBER: HIGH COURT BAR ASSOCIATION
PLACE: {court_name}
DATE: 2026-10-18

================================================================================
                              VERIFICATION AFFIDAVIT
================================================================================
I, {petitioner_name}, age adult, {petitioner_details}, do hereby solemnly affirm and declare on oath as under:
1. That I am the Petitioner in the above petition and am fully conversant with the facts of the case and competent to swear this affidavit.
2. That the contents of paragraphs 1 to 4 of the petition are true and correct to my knowledge derived from official records and legal advice, and nothing material has been concealed therefrom.

DEPONENT

VERIFICATION:
Verified at on this 18th day of October, 2026 that the contents of the above affidavit are true and correct.
DEPONENT
"""

def generate_notice_138_ni_act(data: Dict[str, Any]) -> str:
    advocate_name = _val(data, "advocate_name", "Advocate Rajeshwar Singh & Partners")
    advocate_enrol = _val(data, "advocate_enrolment", "D/892/2014")
    advocate_office = _val(data, "advocate_office", "Chamber 418, Lawyers Chambers Block, High Court of Delhi")
    payee_name = _val(data, "petitioner_name", "M/s Apex Capital Solutions LLP")
    payee_address = _val(data, "petitioner_details", "through its Partner Sh. Alok Verma, Connaught Place, New Delhi")
    drawer_name = _val(data, "respondent_name", "Rohit Agarwal, Managing Director")
    drawer_address = _val(data, "respondent_details", "M/s Prime Mercantile India Pvt. Ltd., Industrial Area, Phase-I, Gurugram, Haryana")
    cheque_no = _val(data, "case_number", "Cheque No. 408192")
    cheque_date = _val(data, "incident_date", "28th August, 2026")
    cheque_amt = _val(data, "dispute_amount", "₹12,50,000/- (Rupees Twelve Lakhs Fifty Thousand Only)")
    drawee_bank = _val(data, "bank_name", "HDFC Bank Ltd., Connaught Place Branch")
    memo_date = _val(data, "return_memo_date", "10th September, 2026")
    memo_reason = _val(data, "dishonour_reason", "Funds Insufficient")
    facts_summary = _val(data, "facts_summary", "The cheque was issued in discharge of legally enforceable commercial debt for services rendered and invoice obligations acknowledged in writing.")

    return f"""LEGAL DEMAND NOTICE UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881
(DELIVERED VIA SPEED POST WITH A.D. & REGISTERED EMAIL / WHATSAPP)

FROM:
{advocate_name.upper()}
ADVOCATE, HIGH COURT & SUPREME COURT OF INDIA
{advocate_office}
BAR COUNCIL ENROLMENT NO.: {advocate_enrol}
CONTACT: office@bharatlegal.in

DATE: 2026-10-18

TO:
1. {drawer_name.upper()}
   {drawer_address}
2. M/s Prime Mercantile India Pvt. Ltd. (Corporate Drawer)
   Through its Board of Directors

SUBJECT: STATUTORY DEMAND NOTICE UNDER SECTION 138 READ WITH SECTION 141 & 142 
         OF THE NEGOTIABLE INSTRUMENTS ACT, 1881 FOR DISHONOUR OF {cheque_no.upper()} 
         FOR AMOUNT OF {cheque_amt.upper()}.

SIR / MADAM,

Under instructions from, and on behalf of, our Client, {payee_name.upper()}, {payee_address} (hereinafter referred to as "Our Client"), we hereby serve upon you this Statutory Legal Demand Notice:

1. LEGALLY ENFORCEABLE DEBT & LIABILITY:
   Our Client and you entered into commercial transactions wherein goods/services were supplied to you against verified invoices. Towards the lawful discharge of your admitted, legally enforceable liability, you issued and handed over to Our Client the following negotiable instrument:
   - Cheque Number: {cheque_no}
   - Cheque Date: {cheque_date}
   - Cheque Amount: {cheque_amt}
   - Drawn On: {drawee_bank}

2. BANK PRESENTATION & STATUTORY DISHONOUR:
   Our Client presented the said Cheque for encashment through their banker within the period of its validity. However, the said Cheque was returned dishonoured and unpaid by your banker vide Banker's Return Memo dated {memo_date} with the official endorsement:
   "{memo_reason.upper()}"

3. PRESUMPTIONS OF LAW UNDER SECTION 118 & 139 NI ACT:
   The dishonour of the said cheque conclusively establishes your failure to maintain sufficient funds in your bank account. Under Section 139 of the Negotiable Instruments Act, 1881, there is a mandatory statutory presumption in favour of Our Client that the cheque was received for the discharge of a debt or liability.

4. VICARIOUS CRIMINAL LIABILITY UNDER SECTION 141 NI ACT:
   Take notice that as Managing Director / Director actively in-charge of and responsible to the Company for the conduct of its business, you are personally, jointly, and severally liable for criminal prosecution along with the Company pursuant to Section 141 of the Negotiable Instruments Act, 1881 ('SMS Pharmaceuticals Ltd. v. Neeta Bhalla', (2005) 8 SCC 89).

5. STATUTORY 15-DAY MANDATORY PAYMENT DEMAND:
   Pursuant to Section 138, Clause (c) of the Negotiable Instruments Act, 1881, we hereby formally call upon you to pay the entire cheque amount of {cheque_amt} to Our Client within FIFTEEN (15) DAYS from the date of receipt of this notice, by way of Demand Draft, NEFT/RTGS, or verified bank transfer.

6. NOTICE OF CRIMINAL COMPLAINT & CIVIL REMEDIES:
   Take notice that in the event you fail to make payment of the said amount within the stipulated statutory period of 15 days, Our Client has issued strict instructions to initiate:
   (a) A Criminal Complaint under Section 138 & 141 of the Negotiable Instruments Act, 1881 before the competent Judicial Magistrate having territorial jurisdiction under Section 142(2) NI Act, wherein you shall be liable to be punished with imprisonment for a term up to TWO (2) YEARS, or with fine which may extend to TWICE THE AMOUNT OF THE CHEQUE, or with both;
   (b) Summary Commercial Suit under Order XXXVII of the Code of Civil Procedure, 1908 for recovery of principal sum along with interest @ 18% per annum and full litigation costs;
   (c) Proceedings under Section 318(4) of the Bharatiya Nyaya Sanhita, 2023 for criminal breach of trust and cheating if fraudulent inception is established.

Yours faithfully,

{advocate_name.upper()}
ADVOCATE FOR THE PAYEE / COMPLAINANT
"""

def generate_consumer_complaint_35_cpa(data: Dict[str, Any]) -> str:
    court_name = _val(data, "court_name", "DISTRICT CONSUMER DISPUTES REDRESSAL COMMISSION (DCDRC) AT KOTA, RAJASTHAN")
    complainant_name = _val(data, "petitioner_name", "Rahul Meena")
    complainant_details = _val(data, "petitioner_details", "Age 20 years, Student, R/o Room 204, Landmark Residency, Vigyan Nagar, Kota, Rajasthan")
    op_name = _val(data, "respondent_name", "Landmark Residency & Hostel Management")
    op_details = _val(data, "respondent_details", "Through its Managing Partner / Warden, Vigyan Nagar, Kota, Rajasthan")
    deposit_amt = _val(data, "dispute_amount", "₹35,000/- (Rupees Thirty-Five Thousand Only)")
    incident_date = _val(data, "incident_date", "10th August, 2026")
    facts_summary = _val(data, "facts_summary", "The complainant was constrained to leave the hostel prematurely owing to unavoidable family medical and financial emergency. The Opposite Party arbitrarily refused to refund or adjust the security caution deposit relying on a predatory adhesion 10-month lock-in clause in violation of Kota Collectorate circulars and Section 2(46) of the Consumer Protection Act, 2019.")

    return f"""BEFORE THE HON'BLE {court_name.upper()}
CONSUMER COMPLAINT NO. _____ OF 2026
(UNDER SECTION 35 OF THE CONSUMER PROTECTION ACT, 2019)

IN THE MATTER OF:
{complainant_name.upper()},
{complainant_details}
                                                        ...COMPLAINANT

                                VERSUS

{op_name.upper()},
{op_details}
                                                        ...OPPOSITE PARTY

COMPLAINT UNDER SECTION 35 OF THE CONSUMER PROTECTION ACT, 2019 ON BEHALF OF THE 
COMPLAINANT AGAINST UNFAIR TRADE PRACTICE, UNFAIR CONTRACT PURSUANT TO SECTION 
2(46), AND DEFICIENCY IN SERVICE PURSUANT TO SECTION 2(11) IN ARBITRARY FORFEITURE 
OF SECURITY DEPOSIT AMOUNTING TO {deposit_amt.upper()}.

MOST RESPECTFULLY SHOWETH:

1. STATUS AS 'CONSUMER' UNDER SECTION 2(7) CPA 2019:
   The Complainant is a student and availed residential accommodation, amenities, and food services from the Opposite Party upon payment of consideration, and is therefore a bona fide 'Consumer' under Section 2(7) of the Consumer Protection Act, 2019.

2. STATEMENT OF MATERIAL FACTS:
   (a) The Complainant was admitted to Opposite Party's facility and deposited an advance caution security amount of {deposit_amt} against official receipt.
   (b) {facts_summary}
   (c) On {incident_date}, Complainant issued formal written notice seeking refund/adjustment of deposit. Opposite Party illegally rejected the request citing a one-sided boilerplate clause.

3. STATUTORY GROUNDS & LAWFUL VIOLATIONS:
   A. 'UNFAIR CONTRACT' UNDER SECTION 2(46) OF CPA 2019:
      Under Section 2(46) of the Consumer Protection Act, 2019, any contract term which causes significant change in rights, including imposing unreasonable charges or arbitrary forfeiture without actual loss, constitutes an 'Unfair Contract' and is null and void ('Central Inland Water Transport Corp v. Brojo Nath Ganguly', (1986) 3 SCC 156).

   B. PROHIBITION OF UNJUST ENRICHMENT UNDER SECTION 74 CONTRACT ACT:
      The Opposite Party suffered zero actual loss and immediately re-allotted the room to another student. Retention of the security deposit constitutes an unlawful penalty hit by Section 74 of the Indian Contract Act, 1872 and the Supreme Court ratio in 'Kailash Nath Associates v. DDA', (2015) 4 SCC 136.

   C. VIOLATION OF KOTA DISTRICT ADMINISTRATION MANDATES:
      The Opposite Party's conduct directly violates the Kota District Collectorate binding guidelines prohibiting coercive lock-in retention of student fees and caution deposits.

4. PECUNIARY & TERRITORIAL JURISDICTION:
   The total claim value is below ₹50 Lakhs, and the cause of action accrued within the territorial limits of this Commission, conferring jurisdiction under Section 34 & 35 of the Act.

PRAYER:
It is most respectfully prayed that this Hon'ble Commission may graciously be pleased to:
(i) Direct the Opposite Party to immediately refund the security deposit of {deposit_amt} along with interest @ 18% per annum from {incident_date} until full realization;
(ii) Direct the Opposite Party to pay compensation of ₹50,000/- for acute mental harassment, agony, and consumer exploitation;
(iii) Award litigation costs of ₹15,000/- in favour of the Complainant; and
(iv) Pass such further order(s) as deemed fit in the interest of justice.

COMPLAINANT THROUGH COUNSEL

================================================================================
                              VERIFICATION AFFIDAVIT
================================================================================
I, {complainant_name}, the Complainant, do hereby verify that paragraphs 1 to 4 of this complaint are true to my personal knowledge and belief. No part is false.
DEPONENT
"""

def generate_deposit_refund_notice(data: Dict[str, Any]) -> str:
    sender_name = _val(data, "petitioner_name", "Student / Tenant Inquirer")
    sender_details = _val(data, "petitioner_details", "Resident / Ex-Occupant")
    recipient_name = _val(data, "respondent_name", "The Hostel Manager / Warden")
    recipient_details = _val(data, "respondent_details", "Kota, Rajasthan")
    deposit_amt = _val(data, "dispute_amount", "₹30,000/-")
    incident_date = _val(data, "incident_date", "recent date")
    facts_summary = _val(data, "facts_summary", "Unreturned caution security money under arbitrary lock-in clauses despite genuine emergency.")

    return f"""LEGAL DEMAND NOTICE (DELIVERED VIA SPEED POST / REGISTERED EMAIL & WHATSAPP)

DATE: 2026-10-18

TO:
{recipient_name.upper()}
{recipient_details}

SUBJECT: FINAL STATUTORY DEMAND NOTICE FOR IMMEDIATE REFUND OF UNRETURNED SECURITY 
         DEPOSIT OF {deposit_amt} UNDER SECTION 74 OF THE INDIAN CONTRACT ACT, 1872, 
         SECTION 2(46) OF CONSUMER PROTECTION ACT, 2019, AND DISTRICT GUIDELINES.

SIR / MADAM,

I, {sender_name}, {sender_details}, hereby serve upon you this Final Statutory Demand Notice:

1. SUMMARY OF ADMITTED OCCUPANCY & TRANSACTION:
   I occupied room accommodation at your premises after depositing an advance caution deposit of {deposit_amt}. {facts_summary}

2. UNLAWFUL CHARACTER OF "LOCK-IN / NON-REFUNDABLE" RETENTION:
   Your refusal to adjust or refund the caution deposit relying on a clause asserting that "security deposit will only be adjusted on completion of 10 months" is VOID and UNLAWFUL in the Republic of India:
   - Section 74 of the Indian Contract Act, 1872 strictly invalidates arbitrary penal forfeiture where no actual financial loss is established ('Kailash Nath Associates v. DDA', (2015) 4 SCC 136).
   - Section 2(46) & 2(47) of the Consumer Protection Act, 2019 classifies one-sided forfeiture clauses as an 'Unfair Contract' and 'Unfair Trade Practice'.
   - District Collectorate Directives strictly forbid hostel managements from withholding caution money when a student is compelled to leave due to circumstances beyond their control.

3. FINAL 7-DAY RECTIFICATION DEMAND:
   I hereby formally demand that you refund the entire sum of {deposit_amt} to my bank account within SEVEN (7) DAYS of receipt of this notice.

4. NOTICE OF REDRESSAL ACTION:
   Should you fail to comply within 7 days, please take notice that I shall immediately initiate:
   (a) Formal complaint before the District Collector / Student Welfare Cell (Helpline: 0744-2325342);
   (b) Online Consumer Complaint on the National Consumer Portal e-Daakhil seeking refund with 18% p.a. interest, ₹50,000/- compensation for harassment, and costs;
   (c) Formal police representation under Section 318(4) & Section 351(2) of the Bharatiya Nyaya Sanhita, 2023 if unreturned funds are misappropriated.

Yours sincerely,

{sender_name.upper()}
"""

PLEADING_PRESETS = {
    "quashing_528_bnss": {
        "title": "Criminal Quashing Petition (§528 BNSS / §482 CrPC)",
        "forum": "Hon'ble High Court",
        "governing_statute": "Bharatiya Nagarik Suraksha Sanhita, 2023 § 528",
        "icon": "gavel",
        "desc": "High Court petition for quashing malicious or civil-dispute FIRs under Bhajan Lal & Arnesh Kumar guidelines.",
        "generate": generate_quashing_528_bnss
    },
    "notice_138_ni_act": {
        "title": "Statutory Cheque Dishonour Notice (§138 NI Act)",
        "forum": "Advocate Legal Demand",
        "governing_statute": "Negotiable Instruments Act, 1881 § 138, 141 & 142",
        "icon": "receipt_long",
        "desc": "Mandatory 15-day statutory payment cure demand with criminal prosecution warning for drawer and directors.",
        "generate": generate_notice_138_ni_act
    },
    "consumer_complaint_35_cpa": {
        "title": "e-Daakhil Consumer Complaint Plaint (§35 CPA)",
        "forum": "District Consumer Disputes Redressal Commission (DCDRC)",
        "governing_statute": "Consumer Protection Act, 2019 § 35, 2(46) & 2(47)",
        "icon": "storefront",
        "desc": "Full plaint claiming refund with 18% interest, compensation for mental harassment, and declaring adhesion clauses void.",
        "generate": generate_consumer_complaint_35_cpa
    },
    "deposit_refund_notice": {
        "title": "Student / Tenant Caution Money Refund Notice",
        "forum": "Direct Citizen Legal Demand (Speed Post / WhatsApp)",
        "governing_statute": "Indian Contract Act § 74, CPA § 2(46), Kota Collectorate Guidelines",
        "icon": "mark_email_read",
        "desc": "Structured 7-day demand notice demolishing illegal lock-in clauses and warning of e-Daakhil and administrative reporting.",
        "generate": generate_deposit_refund_notice
    }
}

class PleadingService:
    @staticmethod
    def get_available_templates() -> List[Dict[str, Any]]:
        results = []
        for key, p in PLEADING_PRESETS.items():
            results.append({
                "key": key,
                "title": p["title"],
                "forum": p["forum"],
                "governing_statute": p["governing_statute"],
                "icon": p["icon"],
                "desc": p["desc"]
            })
        return results

    @staticmethod
    def draft_pleading(data: Dict[str, Any], gemini_api_key: Optional[str] = None) -> Dict[str, Any]:
        p_type = data.get("pleading_type", "quashing_528_bnss")
        preset = PLEADING_PRESETS.get(p_type, PLEADING_PRESETS["quashing_528_bnss"])
        base_draft = preset["generate"](data)

        # Optional LLM Enhancement via Gemini if available
        api_key = (gemini_api_key or getattr(settings, "GEMINI_API_KEY", "") or os.environ.get("GEMINI_API_KEY", "") or "").strip()
        if api_key and len(api_key) > 10:
            prompt = (
                f"You are a Senior Advocate and Senior Jurist in India. Review and enhance this Court-Ready Legal Pleading.\n"
                f"Strict Mandates:\n"
                f"1. Strictly maintain authentic Indian High Court / Tribunal formatting, Roman numerals, Synopsis, Grounds, Prayer, and Verification.\n"
                f"2. Cite landmark Supreme Court precedents with authentic Neutral Citations ([YYYY] INSC [No.] or SCC).\n"
                f"3. Do NOT output horizontal rule lines (--- or ***).\n\n"
                f"BASE PLEADING DRAFT:\n{base_draft}"
            )
            url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
            try:
                payload = json.dumps({"contents": [{"parts": [{"text": prompt}]}]}).encode("utf-8")
                req = urllib.request.Request(
                    url,
                    data=payload,
                    headers={
                        "Content-Type": "application/json",
                        "x-goog-api-key": api_key
                    }
                )
                with urllib.request.urlopen(req, timeout=8.0) as resp:
                    if resp.status == 200:
                        parsed = json.loads(resp.read().decode("utf-8"))
                        text = parsed["candidates"][0]["content"]["parts"][0]["text"]
                        return {
                            "title": preset["title"],
                            "forum": preset["forum"],
                            "governing_statute": preset["governing_statute"],
                            "pleading_text": text,
                            "engine": "Google Gemini 1.5 Flash (Senior Advocate Grounded)"
                        }
            except Exception as e:
                print(f"Pleading AI enhancement fallback: {e}")

        return {
            "title": preset["title"],
            "forum": preset["forum"],
            "governing_statute": preset["governing_statute"],
            "pleading_text": base_draft,
            "engine": "Bharat Court Pleading Engine (Deterministic High Court Compliance)"
        }
