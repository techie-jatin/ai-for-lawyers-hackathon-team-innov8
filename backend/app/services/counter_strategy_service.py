"""
counter_strategy_service.py - Defensive Counter-Strategy & Anti-Vexatious Litigation Engine
Bharat Legal Intelligence 2.0 (Reverse Engineer Anything - REA Methodology)

Statutory grounding:
- Section 248 Bharatiya Nyaya Sanhita, 2023 (False charge of offence made with intent to injure; formerly §211 IPC)
- Section 217 Bharatiya Nyaya Sanhita, 2023 (False information with intent to cause public servant to use power; formerly §182 IPC)
- Section 215 Bharatiya Nyaya Sanhita, 2023 (Fabricating false electronic evidence; formerly §193 IPC)
- Section 379 Bharatiya Nagarik Suraksha Sanhita, 2023 (Procedure in cases mentioned in Section 215; formerly §340 CrPC)
- Section 273 Bharatiya Nagarik Suraksha Sanhita, 2023 (Compensation for accusation without reasonable cause; formerly §250 CrPC)
- Section 148A Code of Civil Procedure, 1908 (Right to lodge a caveat against ex-parte injunctions)
- Civil Tort Action for Malicious Prosecution (West Bengal State Electricity Board v. Dilip Kumar Ray [2007] 14 SCC 568)
- Contempt of Court under Article 215 Constitution of India & Contempt of Courts Act, 1971 (Arnesh Kumar v. State of Bihar [2014] 8 SCC 273)
"""

from typing import Dict, List, Optional, Any
import json
import urllib.request
import os

COUNTER_STRATEGY_PRESETS = [
    {
        "key": "bns_248_false_charge",
        "title": "Cross-Complaint for False Charge with Intent to Injure",
        "statutory_basis": "Section 248 BNS 2023 (formerly §211 IPC) & Section 223 BNSS",
        "category": "Criminal Counter-Offensive",
        "icon": "shield_with_heart",
        "target_forum": "Court of Chief Judicial Magistrate / Metropolitan Magistrate",
        "objective": "Initiate criminal prosecution against a malicious complainant for instituting false criminal proceedings knowing there is no just or lawful ground.",
        "punishment": "Imprisonment up to 5 years (or up to 7 years / life if false charge punishable with death/life/7+ years) plus fine.",
        "landmark_precedents": [
            "Santokh Singh v. Izhar Hussain (1973) 2 SCC 406",
            "State of Punjab v. Brij Lal Palta [1969] 1 SCR 853",
            "Chidananda v. State of Karnataka (2020) SCC OnLine Kar 1215"
        ]
    },
    {
        "key": "bnss_379_perjury_inquiry",
        "title": "Application for Prosecution for Perjury & Fabricated Evidence",
        "statutory_basis": "Section 379 BNSS 2023 (formerly §340 CrPC) read with Section 215 BNS 2023",
        "category": "Judicial Perjury Sanctions",
        "icon": "fact_check",
        "target_forum": "Court where false affidavit, statement or fabricated digital evidence was tendered",
        "objective": "Trigger mandatory preliminary inquiry into intentionally false sworn affidavits, forged digital exhibits, or suppressed material facts.",
        "punishment": "Judicial complaint dispatched to Magistrate; imprisonment up to 7 years under Section 215 BNS.",
        "landmark_precedents": [
            "Pritish v. State of Maharashtra [2002] 1 SCC 253",
            "Iqbal Singh Marwah v. Meenakshi Marwah [2005] 4 SCC 370",
            "K.G. Premshanker v. Inspector of Police [2002] 8 SCC 87"
        ]
    },
    {
        "key": "cpc_148a_caveat_petition",
        "title": "Pre-Emptive Caveat Petition Against Ex-Parte Injunctions",
        "statutory_basis": "Section 148A Code of Civil Procedure, 1908",
        "category": "Pre-Emptive Civil Defense",
        "icon": "lock",
        "target_forum": "High Court / Principal District & Sessions Judge",
        "objective": "Deprive adversary of the element of surprise. Mandates that NO ex-parte stay, status quo, or freeze order can be passed without prior written notice to Caveator.",
        "punishment": "Any ex-parte order passed without serving Caveator is rendered null and irregular.",
        "landmark_precedents": [
            "Reserve Bank of India v. Ashis Ray (1993) 1 CALLT 239 HC",
            "C. Seethaiah v. Govt. of A.P. AIR 1983 AP 443",
            "Deepak Khosla v. Union of India (Delhi High Court 2011)"
        ]
    },
    {
        "key": "malicious_prosecution_tort",
        "title": "Civil Plaint for Damages for Malicious Prosecution & Defamation",
        "statutory_basis": "Law of Torts & Section 9 Code of Civil Procedure, 1908",
        "category": "Civil Tort & Exemplary Damages",
        "icon": "payments",
        "target_forum": "Competent Civil Court / Commercial Court",
        "objective": "Claim substantial monetary compensation (e.g. ₹25,00,000/- to ₹1,00,00,000/-) for loss of business reputation, mental trauma, legal defense costs, and humiliation.",
        "punishment": "Money decree with 18% p.a. pendente lite interest and exemplary costs.",
        "landmark_precedents": [
            "West Bengal State Electricity Board v. Dilip Kumar Ray [2007] 14 SCC 568",
            "S. Nambi Narayanan v. Siby Mathews [2018] 10 SCC 804",
            "Babu v. Gokuldoss AIR 1928 Mad 385"
        ]
    },
    {
        "key": "contempt_arnesh_kumar_breach",
        "title": "Contempt of Court Notice for Violation of Arnesh Kumar Directives",
        "statutory_basis": "Article 215 Constitution of India & Contempt of Courts Act, 1971 read with §35 BNSS",
        "category": "Constitutional Enforcement",
        "icon": "gavel",
        "target_forum": "High Court having jurisdiction over the defaulting Police Station",
        "objective": "Hold arresting police officer and supervisory ACP/DCP personally liable for departmental disciplinary inquiry and civil imprisonment for unlawful arrest without §35(3) BNSS notice.",
        "punishment": "Contempt penalties, disciplinary censure in service record, and personal damages.",
        "landmark_precedents": [
            "Arnesh Kumar v. State of Bihar [2014] 8 SCC 273",
            "Satender Kumar Antil v. CBI [2022] 10 SCC 51",
            "Md. Aslam v. State of Bihar (2020) Patna HC"
        ]
    }
]

class CounterStrategyService:
    @staticmethod
    def get_presets() -> List[Dict[str, Any]]:
        return COUNTER_STRATEGY_PRESETS

    @staticmethod
    def generate_strategy(payload: Dict[str, Any], gemini_api_key: Optional[str] = None) -> Dict[str, Any]:
        preset_key = payload.get("preset_key", "bns_248_false_charge")
        preset = next((p for p in COUNTER_STRATEGY_PRESETS if p["key"] == preset_key), COUNTER_STRATEGY_PRESETS[0])

        applicant_name = payload.get("applicant_name") or "Aggrieved Party / Applicant"
        applicant_details = payload.get("applicant_details") or "Resident of NCT of Delhi, Citizen of India"
        opposite_party_name = payload.get("opposite_party_name") or "Malicious Complainant / Defaulting Officer"
        opposite_party_details = payload.get("opposite_party_details") or "Opposite Party / Complainant"
        court_name = payload.get("court_name") or preset["target_forum"]
        state_name = payload.get("state_name") or "State (NCT of Delhi)"
        case_ref = payload.get("case_ref") or "FIR No. ____ / 2024 / Complaint Case No. ____"
        police_station = payload.get("police_station") or "P.S. ________"
        claim_amount = payload.get("claim_amount") or "₹25,00,000/-"
        facts_summary = payload.get("facts_summary") or (
            "The Opposite Party has deliberately, maliciously, and without reasonable or probable cause "
            "instituted false, vexatious, and fabricated criminal proceedings against the Applicant with "
            "the fraudulent intention of causing wrongful loss, public humiliation, and criminal extortion."
        )
        advocate_name = payload.get("advocate_name") or "Senior Counsel / Enrolled Advocate"
        advocate_enrolment = payload.get("advocate_enrolment") or "D/____/2018"
        advocate_office = payload.get("advocate_office") or "Chamber No. __, High Court of Delhi, New Delhi"

        # Deterministic generation
        if preset_key == "bns_248_false_charge":
            pleading_text = CounterStrategyService._generate_bns_248(
                court_name, state_name, applicant_name, applicant_details,
                opposite_party_name, opposite_party_details, case_ref, police_station,
                facts_summary, advocate_name, advocate_enrolment, advocate_office
            )
        elif preset_key == "bnss_379_perjury_inquiry":
            pleading_text = CounterStrategyService._generate_bnss_379(
                court_name, state_name, applicant_name, applicant_details,
                opposite_party_name, opposite_party_details, case_ref,
                facts_summary, advocate_name, advocate_enrolment, advocate_office
            )
        elif preset_key == "cpc_148a_caveat_petition":
            pleading_text = CounterStrategyService._generate_cpc_148a(
                court_name, state_name, applicant_name, applicant_details,
                opposite_party_name, opposite_party_details,
                facts_summary, advocate_name, advocate_enrolment, advocate_office
            )
        elif preset_key == "malicious_prosecution_tort":
            pleading_text = CounterStrategyService._generate_malicious_prosecution(
                court_name, state_name, applicant_name, applicant_details,
                opposite_party_name, opposite_party_details, claim_amount,
                facts_summary, advocate_name, advocate_enrolment, advocate_office
            )
        elif preset_key == "contempt_arnesh_kumar_breach":
            pleading_text = CounterStrategyService._generate_contempt_arnesh(
                court_name, state_name, applicant_name, applicant_details,
                opposite_party_name, opposite_party_details, case_ref, police_station,
                facts_summary, advocate_name, advocate_enrolment, advocate_office
            )
        else:
            pleading_text = CounterStrategyService._generate_bns_248(
                court_name, state_name, applicant_name, applicant_details,
                opposite_party_name, opposite_party_details, case_ref, police_station,
                facts_summary, advocate_name, advocate_enrolment, advocate_office
            )

        # Gemini 1.5 Flash Enhancement if API key available
        api_key = (gemini_api_key or os.environ.get("GEMINI_API_KEY", "")).strip()
        engine_label = "Bharat Anti-Vexatious Statutory Studio (Deterministic Indian Law)"
        if api_key and len(api_key) > 10:
            prompt = (
                f"You are a Senior Criminal Defense Partner and Supreme Court Advocate in India. "
                f"Enhance and refine this Anti-Vexatious Counter-Strategy Legal Instrument.\n"
                f"Statutory Framework: {preset['statutory_basis']}\n"
                f"Landmark Benchmarks: {', '.join(preset['landmark_precedents'])}\n\n"
                f"Requirements:\n"
                f"1. Strictly maintain authentic High Court / Magistrate legal formatting.\n"
                f"2. Articulate unassailable grounds on absence of reasonable and probable cause, malicious intent to injure, and abuse of court process.\n"
                f"3. Include formal Verification Affidavit and Advocate Endorsement.\n\n"
                f"BASE DRAFT:\n{pleading_text}"
            )
            url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
            try:
                req_data = json.dumps({"contents": [{"parts": [{"text": prompt}]}]}).encode("utf-8")
                http_req = urllib.request.Request(
                    url,
                    data=req_data,
                    headers={"Content-Type": "application/json", "x-goog-api-key": api_key}
                )
                with urllib.request.urlopen(http_req, timeout=9.0) as resp:
                    if resp.status == 200:
                        res_json = json.loads(resp.read().decode("utf-8"))
                        pleading_text = res_json["candidates"][0]["content"]["parts"][0]["text"]
                        engine_label = "Google Gemini 1.5 Flash (Senior Advocate Grounded Defense)"
            except Exception:
                pass

        return {
            "preset": preset,
            "title": f"Counter-Strategy: {preset['title']}",
            "pleading_text": pleading_text,
            "statutory_basis": preset["statutory_basis"],
            "target_forum": court_name,
            "engine": engine_label
        }

    @staticmethod
    def _generate_bns_248(
        court, state, app_name, app_details, opp_name, opp_details,
        case_ref, ps, facts, adv_name, adv_enrol, adv_office
    ) -> str:
        return f"""IN THE COURT OF THE CHIEF JUDICIAL MAGISTRATE / METROPOLITAN MAGISTRATE
AT {court.upper()}, {state.upper()}

CRIMINAL COMPLAINT CASE NO. _______ OF 2024

IN THE MATTER OF:
{app_name}
{app_details}
... COMPLAINANT / AGGRIEVED PARTY

VERSUS

{opp_name}
{opp_details}
... ACCUSED / MALICIOUS COMPLAINANT

CRIMINAL COMPLAINT UNDER SECTION 223 READ WITH SECTION 248 & 217 OF THE BHARATIYA NYAYA SANHITA, 2023 (FORMERLY SECTION 211 & 182 IPC) FOR INSTITUTING FALSE CRIMINAL CHARGE WITH INTENT TO INJURE AND EXTORT.

MOST RESPECTFULLY SHOWETH:

I. PRELIMINARY SUBMISSIONS & LOCUS STANDI
1. That the Complainant is a law-abiding citizen of India with unblemished personal and commercial reputation.
2. That the Accused has maliciously, corruptly, and without an iota of reasonable or probable cause instituted frivolous and vexatious criminal proceedings against the Complainant vide {case_ref} at Police Station {ps}.

II. FACTUAL MATRIX DEMONSTRATING MALICIOUS INTENT
3. {facts}
4. That the Accused was fully aware at the time of lodging the said complaint that the allegations contained therein were fabricated, groundless, and contrary to contemporary documentary and electronic evidence.
5. That the sole motive of the Accused was to weaponize the criminal justice apparatus to harass, intimidate, and extort unmerited commercial concessions from the Complainant.

III. STATUTORY INGREDIENTS UNDER SECTION 248 BNS SATISFIED
6. That Section 248 of Bharatiya Nyaya Sanhita, 2023 unambiguously mandates:
   "Whoever, with intent to cause injury to any person, institutes or causes to be instituted any criminal proceeding against that person, or falsely charges any person with having committed an offence, knowing that there is no just or lawful ground for such proceeding or charge, shall be punished with imprisonment..."
7. That in Santokh Singh v. Izhar Hussain (1973) 2 SCC 406, the Hon'ble Supreme Court held that the prosecution for instituting false charges is vital to maintain the sanctity of judicial administration and deter dishonest litigants from abusing the police machinery.

IV. PRAYER
WHEREFORE, in light of the facts and binding judicial precedents cited herein, it is most respectfully prayed that this Hon'ble Court may be pleased to:
(a) Take cognizance of the offence committed by the Accused under Section 248 and Section 217 of the Bharatiya Nyaya Sanhita, 2023;
(b) Issue process/summons against the Accused to face trial in accordance with law;
(c) Award exemplary interim compensation to the Complainant under Section 273 of Bharatiya Nagarik Suraksha Sanhita, 2023 for facing accusation without reasonable cause; and
(d) Pass such other and further orders as this Hon'ble Court may deem fit and proper in the interest of justice.

FILED BY:
{adv_name}
Advocate for the Complainant
Enrolment No.: {adv_enrol}
Chamber / Office: {adv_office}
Place: {state}
Date: ________________________

VERIFICATION
I, {app_name}, the Complainant above-named, do hereby verify that the contents of paragraphs 1 to 5 are true to my personal knowledge and paragraphs 6 to 7 are based on legal advice received and believed to be true.
Verified at {state} on this day of ____________, 2024.

DEPONENT
"""

    @staticmethod
    def _generate_bnss_379(
        court, state, app_name, app_details, opp_name, opp_details,
        case_ref, facts, adv_name, adv_enrol, adv_office
    ) -> str:
        return f"""IN THE COURT OF {court.upper()}, {state.upper()}

MISC. CRIMINAL APPLICATION NO. _______ OF 2024
IN
CASE NO. {case_ref}

IN THE MATTER OF:
{app_name} ({app_details}) ... APPLICANT
VERSUS
{opp_name} ({opp_details}) ... RESPONDENT / PERJURER

APPLICATION UNDER SECTION 379 OF THE BHARATIYA NAGARIK SURAKSHA SANHITA, 2023 (FORMERLY SECTION 340 CrPC) READ WITH SECTION 215 OF THE BHARATIYA NYAYA SANHITA, 2023 FOR INITIATING PRELIMINARY INQUIRY AND PROSECUTION FOR TENDERING DELIBERATELY FALSE AFFIDAVIT AND FABRICATED EVIDENCE.

MOST RESPECTFULLY SHOWETH:

1. That the Applicant is a contesting party in the above-captioned proceedings pending before this Hon'ble Court.
2. That the Respondent has deliberately and dishonestly made statements under oath in the Affidavit dated ________ which the Respondent knew to be false and completely baseless.
3. SPECIFIC PERJURY INSTANCES:
   {facts}
4. That the Hon'ble Supreme Court in Pritish v. State of Maharashtra [2002] 1 SCC 253 held that the purpose of Section 340 CrPC (now Section 379 BNSS) is to protect the administration of justice from being polluted by perjured testimony and dishonest litigants.
5. That it is expedient in the interest of justice that an inquiry be made into the offence under Section 215 BNS committed in respect of the document and testimony produced before this Hon'ble Court.

PRAYER:
It is most respectfully prayed that this Hon'ble Court may graciously be pleased to:
(a) Conduct a preliminary inquiry under Section 379(1) BNSS into the deliberate perjury and fabrication of evidence committed by the Respondent;
(b) Record a finding to that effect and lodge a formal written complaint before the competent Judicial Magistrate having jurisdiction;
(c) Take necessary security for the appearance of the Respondent before such Magistrate; and
(d) Pass any further orders deemed fit in the interest of justice.

APPLICANT THROUGH COUNSEL:
{adv_name} (Enrolment: {adv_enrol})
Office: {adv_office}
Date: ________________________
"""

    @staticmethod
    def _generate_cpc_148a(
        court, state, app_name, app_details, opp_name, opp_details,
        facts, adv_name, adv_enrol, adv_office
    ) -> str:
        return f"""IN THE HIGH COURT OF JUDICATURE / DISTRICT COURT
AT {court.upper()}, {state.upper()}

CAVEAT PETITION NO. _______ OF 2024

IN THE MATTER OF:
{app_name}
{app_details}
... CAVEATOR / APPLICANT

VERSUS

{opp_name}
{opp_details}
... EXPECTED PETITIONER / PLAINTIFF

CAVEAT PETITION UNDER SECTION 148A OF THE CODE OF CIVIL PROCEDURE, 1908.

THE CAVEATOR RESPECTFULLY STATES AS UNDER:

1. That the Caveator has a genuine and bona fide apprehension that the Expected Petitioner/Plaintiff may institute a Civil Suit, Writ Petition, or Appeal before this Hon'ble Court and attempt to seek ex-parte interim injunctions, stay orders, or status quo directives against the Caveator without serving advance notice.
2. DISPUTE BACKGROUND & BONA FIDE DEFENSE:
   {facts}
3. That the Caveator has a strong prima facie defense on merits and the balance of convenience lies entirely in favor of the Caveator. Any ex-parte order granted without hearing the Caveator will cause irreparable loss and injury.
4. That the Caveator has duly dispatched a copy of this Caveat Petition to the Expected Petitioner by Registered Post / Speed Post on ________ in compliance with Section 148A(2) CPC. Postal receipt is annexed herewith as ANNEXURE C-1.

PRAYER:
Wherefore, it is most respectfully prayed that no ex-parte interim order, injunction, stay, or status quo be passed in any suit, appeal, or petition filed by the Expected Petitioner against the Caveator without giving prior written notice of the application and reasonable opportunity of hearing to the Caveator's counsel.

CAVEATOR
THROUGH COUNSEL:
{adv_name}
Advocate for the Caveator
Enrolment No.: {adv_enrol}
Office: {adv_office}
Place: {state}
Date: ________________________

VERIFICATION
I, {app_name}, the Caveator above named, do hereby verify that the facts stated in paragraphs 1 to 4 are true to my personal knowledge and belief.
Verified at {state} on ____________ 2024.

DEPONENT
"""

    @staticmethod
    def _generate_malicious_prosecution(
        court, state, app_name, app_details, opp_name, opp_details,
        claim_amount, facts, adv_name, adv_enrol, adv_office
    ) -> str:
        return f"""IN THE COURT OF THE DISTRICT JUDGE / COMMERCIAL COURT
AT {court.upper()}, {state.upper()}

COMMERCIAL SUIT / CIVIL SUIT NO. _______ OF 2024

IN THE MATTER OF:
{app_name}
{app_details}
... PLAINTIFF

VERSUS

{opp_name}
{opp_details}
... DEFENDANT

SUIT UNDER SECTION 9 OF THE CODE OF CIVIL PROCEDURE, 1908 FOR RECOVERY OF EXEMPLARY DAMAGES OF {claim_amount} FOR MALICIOUS PROSECUTION, LOSS OF REPUTATION, COMMERCIAL INJURY, AND MENTAL HARASSMENT.

MOST RESPECTFULLY SHOWETH:

1. That the Plaintiff is an established professional / enterprise of high standing and unblemished creditworthiness in {state}.
2. That the Defendant maliciously and without any reasonable or probable cause initiated frivolous criminal / civil proceedings against the Plaintiff.
3. CONCURRENT DEMONSTRATION OF TORTIOUS INGREDIENTS:
   (a) PROSECUTION INSTITUTED BY DEFENDANT: The Defendant instituted proceedings vide complaint dated ________.
   (b) TERMINATION IN FAVOR OF PLAINTIFF: The said proceedings terminated entirely in favor of the Plaintiff vide order dated ________ by which the Plaintiff was exonerated / discharged / acquitted.
   (c) ABSENCE OF REASONABLE & PROBABLE CAUSE: There was no objective basis for the allegations, as held by the judicial order.
   (d) MALICE IN FACT & LAW: The proceedings were actuated by improper and spiteful motives.
4. PARTICULARS OF SPECIAL & GENERAL DAMAGES CLAIMED:
   {facts}
   - Loss of Business Revenue & Contracts: ₹15,00,000/-
   - Legal Defense Expenses & Counsel Fees: ₹5,00,000/-
   - General Damages for Mental Agony & Defamation: ₹5,00,000/-
   TOTAL CLAIM: {claim_amount}
5. That in West Bengal State Electricity Board v. Dilip Kumar Ray [2007] 14 SCC 568 and S. Nambi Narayanan v. Siby Mathews [2018] 10 SCC 804, the Hon'ble Supreme Court held that the constitutional right to live with dignity (Article 21) encompasses compensation for victims of malicious and groundless prosecution.

PRAYER:
It is most respectfully prayed that this Hon'ble Court may be pleased to:
(a) Pass a decree in favor of the Plaintiff and against the Defendant for a sum of {claim_amount} towards general and special damages;
(b) Award pendente lite and future interest @ 18% per annum from the date of institution of suit until realization;
(c) Award exemplary costs of the suit; and
(d) Pass such further orders as this Hon'ble Court deems fit and proper.

PLAINTIFF THROUGH COUNSEL:
{adv_name} (Enrolment: {adv_enrol})
Office: {adv_office}
Date: ________________________
"""

    @staticmethod
    def _generate_contempt_arnesh(
        court, state, app_name, app_details, opp_name, opp_details,
        case_ref, ps, facts, adv_name, adv_enrol, adv_office
    ) -> str:
        return f"""IN THE HIGH COURT OF JUDICATURE AT {court.upper()}
(CONTEMPT JURISDICTION UNDER ARTICLE 215 OF THE CONSTITUTION OF INDIA)

CONTEMPT PETITION (CIVIL / CRIMINAL) NO. _______ OF 2024

IN THE MATTER OF:
{app_name}
{app_details}
... PETITIONER / AGGRIEVED CITIZEN

VERSUS

1. {opp_name} (Investigating Officer, Police Station {ps})
2. Station House Officer (SHO), Police Station {ps}
3. State of {state}, Through Commissioner / Director General of Police
... CONTEMNORS / RESPONDENTS

CONTEMPT PETITION UNDER ARTICLE 215 OF THE CONSTITUTION OF INDIA READ WITH SECTION 11 & 12 OF THE CONTEMPT OF COURTS ACT, 1971 FOR WILLFUL AND CONTUMACIOUS DISOBEDIENCE OF THE BINDING DIRECTIVES OF THE HON'BLE SUPREME COURT IN ARNESH KUMAR V. STATE OF BIHAR [2014] 8 SCC 273 AND SATENDER KUMAR ANTIL V. CBI [2022] 10 SCC 51.

MOST RESPECTFULLY SHOWETH:

1. That this Contempt Petition is preferred to uphold the Rule of Law and protect personal liberty guaranteed under Article 21 against arbitrary police despotism.
2. That in Arnesh Kumar v. State of Bihar [2014] 8 SCC 273 (followed in Satender Kumar Antil), the Hon'ble Supreme Court issued mandatory binding directions under Article 141/142 that for all offences punishable with imprisonment up to 7 years:
   (a) Police officers shall not mechanically arrest without recording reasons in writing;
   (b) A formal written Notice of Appearance under Section 41A CrPC (now Section 35(3) BNSS 2023) MUST be served within two weeks of FIR;
   (c) Failure to comply renders the police officer liable for departmental inquiry and CONTEMPT OF COURT before the High Court.
3. WILLFUL CONTEMPT COMMITTED BY CONTEMNORS:
   In respect of {case_ref} at Police Station {ps}:
   {facts}
   The Contemnors knowingly, intentionally, and willfully flouted the aforesaid directions by threatening mechanical arrest and refusing to issue Section 35(3) BNSS notice.

PRAYER:
Wherefore, it is most respectfully prayed that this Hon'ble High Court may be pleased to:
(a) Initiate contempt proceedings against the Contemnors for willful violation of the Supreme Court's binding mandate in Arnesh Kumar v. State of Bihar;
(b) Punish the Contemnors under the Contempt of Courts Act, 1971 and Article 215 of the Constitution;
(c) Direct immediate registration of a departmental vigilance inquiry against Contemnor No. 1; and
(d) Pass such further orders as this Hon'ble Court deems fit to protect personal liberty.

PETITIONER THROUGH COUNSEL:
{adv_name} (Enrolment: {adv_enrol})
Office: {adv_office}
Place: {state}
Date: ________________________
"""
