"""
Bharat Legal Intelligence 2.0 - AI Contract Clean-Room Clause Rewriter & e-Stamping Directory
Provides statutory clean-room rewriting of predatory commercial clauses under the Indian Contract Act, 1872
and authoritative state-by-state stamp duty schedules adhering to N.N. Global [2023] INSC 1066.
"""

from typing import Dict, Any, List, Optional
import os
import json
import urllib.request
from app.core.config import settings

# 10 Major Indian States e-Stamping Directory
STATE_STAMP_DIRECTORY: Dict[str, Dict[str, Any]] = {
    "Delhi": {
        "state_name": "NCT of Delhi",
        "governing_act": "Indian Stamp Act, 1899 (Delhi Amendment)",
        "commercial_rate": "₹100/- non-judicial e-Stamp paper (Article 5(c))",
        "lease_rate": "2% of average annual rent for term up to 5 years (Article 35)",
        "nda_rate": "₹100/- non-judicial e-Stamp paper",
        "service_agreement_rate": "₹100/- non-judicial e-Stamp paper",
        "stamping_portal": "Stock Holding Corporation of India Limited (SHCIL) e-Stamping (shcilestamp.com)",
        "admissibility_mandate": "Unstamped agreements are inadmissible in evidence under Section 35 Indian Stamp Act; curable with deficit duty + penalty up to 10x (N.N. Global [2023] INSC 1066).",
        "online_facility": "100% Online via SHCIL / Authorized CRA Collection Centers"
    },
    "Maharashtra": {
        "state_name": "State of Maharashtra",
        "governing_act": "Maharashtra Stamp Act, 1958 (formerly Bombay Stamp Act)",
        "commercial_rate": "0.1% of contract value (minimum ₹100/-, Article 5(h)(A)) or ₹500/- general deed",
        "lease_rate": "0.25% of total rent + deposit for leave and licence deeds (Article 36A)",
        "nda_rate": "₹500/- non-judicial e-Stamp paper (Article 5(h))",
        "service_agreement_rate": "0.1% of consideration or ₹500/- whichever is higher",
        "stamping_portal": "Government Receipt Accounting System (GRAS / Mahakosh) & SHCIL",
        "admissibility_mandate": "Mandatory registration and e-Stamping under Section 55 of Maharashtra Rent Control Act for residential/commercial licences.",
        "online_facility": "eSBTR (Electronic Secure Bank Treasury Receipt) & SHCIL portal"
    },
    "Karnataka": {
        "state_name": "State of Karnataka",
        "governing_act": "Karnataka Stamp Act, 1957",
        "commercial_rate": "₹200/- non-judicial e-Stamp paper or 0.1% ad valorem (Article 5)",
        "lease_rate": "0.5% to 1% of total rent/advance depending on term (Article 30)",
        "nda_rate": "₹200/- non-judicial e-Stamp paper",
        "service_agreement_rate": "₹200/- (simple agreement) or 0.1% of contract consideration",
        "stamping_portal": "KAVERI Online Services & SHCIL e-Stamping",
        "admissibility_mandate": "Strict compliance with Section 33 impounding provisions upon presentation before civil court or arbitrator.",
        "online_facility": "KAVERI 2.0 Web Portal & Certified Sub-Registrar CRA outlets"
    },
    "Tamil Nadu": {
        "state_name": "State of Tamil Nadu",
        "governing_act": "Indian Stamp Act, 1899 (Tamil Nadu Amendment)",
        "commercial_rate": "₹100/- to ₹200/- non-judicial e-Stamp paper (Article 5(j))",
        "lease_rate": "1% of total rent and advance sum (Article 35)",
        "nda_rate": "₹100/- non-judicial e-Stamp paper",
        "service_agreement_rate": "₹100/- or 0.1% for high-value procurement",
        "stamping_portal": "Tamil Nadu Registration Department (TNREGINET) & SHCIL",
        "admissibility_mandate": "Mandatory e-Stamp paper or physical non-judicial stamp; verified via TNREGINET QR.",
        "online_facility": "TNREGINET portal & Authorized Banking Branches"
    },
    "Uttar Pradesh": {
        "state_name": "State of Uttar Pradesh",
        "governing_act": "Indian Stamp Act, 1899 (UP Amendment)",
        "commercial_rate": "₹100/- non-judicial e-Stamp paper (Article 5(c))",
        "lease_rate": "2% of annual rent + deposit (Article 35)",
        "nda_rate": "₹100/- non-judicial e-Stamp paper",
        "service_agreement_rate": "₹100/- non-judicial e-Stamp paper",
        "stamping_portal": "Integrated Grievance & Registration System (IGRSUP) & SHCIL",
        "admissibility_mandate": "Impounded under UP Stamp Rules if executed on deficit stamp duty.",
        "online_facility": "IGRSUP portal & SHCIL collection kiosks"
    },
    "Rajasthan": {
        "state_name": "State of Rajasthan",
        "governing_act": "Rajasthan Stamp Act, 1998",
        "commercial_rate": "₹500/- non-judicial e-Stamp paper + 20% surcharge (Gaushala & Water Infrastructure surcharge)",
        "lease_rate": "1% to 2% of total rent value + statutory surcharge",
        "nda_rate": "₹500/- e-Stamp + statutory surcharge",
        "service_agreement_rate": "₹500/- or 0.15% of contract value + surcharge",
        "stamping_portal": "e-GRAS Rajasthan & SHCIL",
        "admissibility_mandate": "Section 37 Rajasthan Stamp Act imposes strict liability for unstamped arbitration agreements.",
        "online_facility": "e-GRAS (rajasthan.gov.in) & Authorized Bank E-Stamp Counters"
    },
    "Gujarat": {
        "state_name": "State of Gujarat",
        "governing_act": "Gujarat Stamp Act, 1958",
        "commercial_rate": "₹300/- non-judicial e-Stamp paper (Article 5(h))",
        "lease_rate": "1% of total rent consideration (Article 30)",
        "nda_rate": "₹300/- non-judicial e-Stamp paper",
        "service_agreement_rate": "₹300/- or 0.1% of value",
        "stamping_portal": "GARVI Portal (Gujarat Revenue Dept) & SHCIL",
        "admissibility_mandate": "Unstamped deeds inadmissible; duty deficit regularized with Section 34 penalty.",
        "online_facility": "GARVI Web Services & Cyber Treasury"
    },
    "West Bengal": {
        "state_name": "State of West Bengal",
        "governing_act": "Indian Stamp Act, 1899 (WB Amendment)",
        "commercial_rate": "₹100/- to ₹500/- non-judicial e-Stamp paper (Article 5(c))",
        "lease_rate": "1% of total average consideration (Article 35)",
        "nda_rate": "₹100/- non-judicial e-Stamp paper",
        "service_agreement_rate": "₹100/- or 0.1% ad valorem",
        "stamping_portal": "GRIPS (Government Receipt Portal System) & WB e-District",
        "admissibility_mandate": "Impounding under Section 33; certificate endorsement by Collector required.",
        "online_facility": "GRIPS 2.0 (wbifms.gov.in)"
    },
    "Telangana": {
        "state_name": "State of Telangana",
        "governing_act": "Indian Stamp Act, 1899 (Telangana Amendment)",
        "commercial_rate": "₹100/- non-judicial e-Stamp paper (Article 5(c))",
        "lease_rate": "0.4% to 1% of total rent consideration",
        "nda_rate": "₹100/- non-judicial e-Stamp paper",
        "service_agreement_rate": "₹100/- or 0.1% of total consideration",
        "stamping_portal": "Registration & Stamps Dept (registration.telangana.gov.in) & SHCIL",
        "admissibility_mandate": "Section 35 bar on admissibility for unstamped commercial undertakings.",
        "online_facility": "Treasury e-Challan & SHCIL e-Stamping"
    },
    "Haryana": {
        "state_name": "State of Haryana",
        "governing_act": "Indian Stamp Act, 1899 (Haryana Amendment)",
        "commercial_rate": "₹100/- non-judicial e-Stamp paper (Article 5(c))",
        "lease_rate": "1.5% to 2% of annual rent consideration",
        "nda_rate": "₹100/- non-judicial e-Stamp paper",
        "service_agreement_rate": "₹100/- non-judicial e-Stamp paper",
        "stamping_portal": "e-GRAS Haryana (egrashry.nic.in) & Jamabandi portal",
        "admissibility_mandate": "Mandatory e-Stamp paper purchase via e-GRAS with unique 16-digit certificate ID.",
        "online_facility": "e-GRAS Portal & Authorized Antyodaya Kendra outlets"
    }
}

# Clean-Room Rewriting Rules and Templates
CLEANROOM_PRESETS: Dict[str, Dict[str, Any]] = {
    "uncapped_indemnity": {
        "title": "Uncapped & Remote Indemnity -> Direct Proven Loss Cap (§73 ICA)",
        "category": "Liability & Indemnity",
        "statutory_violation": "Section 73 Indian Contract Act, 1872 (Prohibition of Remote and Speculative Damages)",
        "rationale": (
            "Section 73 ICA establishes that damages for breach are only compensable for natural, direct losses "
            "which naturally arose in the usual course of things, or which the parties knew to be likely. "
            "Clauses holding a party liable for 'any and all losses, indirect, remote, and consequential without limitation' "
            "violate this fundamental principle and create catastrophic existential exposure."
        ),
        "clean_clause": (
            "Each Party ('Indemnifying Party') agrees to indemnify, defend, and hold harmless the other Party "
            "from and against direct, actual, and proven losses or damages finally awarded by a court of competent "
            "jurisdiction arising exclusively out of: (i) gross negligence or willful misconduct, or (ii) breach of statutory "
            "confidentiality. In no event shall either Party be liable for any indirect, incidental, punitive, remote, or "
            "consequential damages. The aggregate liability of either Party under this Agreement, whether in contract, tort, "
            "or indemnity, shall strictly not exceed the total fees paid or payable by Client in the twelve (12) months preceding the claim."
        ),
        "negotiation_talk_track": (
            "Counsel / Founder Redline Note: 'We cannot accept open-ended indemnity for remote or consequential damages as it directly "
            "contradicts Section 73 of the Indian Contract Act, 1872 and Hadley v. Baxendale principles. We have substituted mutual direct-loss "
            "indemnity paired with a standard commercial 12-month trailing liability cap.'"
        )
    },
    "void_non_compete": {
        "title": "Post-Termination Non-Compete -> Trade Secret & Non-Solicit (§27 ICA)",
        "category": "Restrictive Covenants",
        "statutory_violation": "Section 27 Indian Contract Act, 1872 (Agreement in Restraint of Profession, Trade or Business Void ab Initio)",
        "rationale": (
            "Under Section 27 ICA, every agreement by which anyone is restrained from exercising a lawful profession, trade, "
            "or business is void ab initio. The Supreme Court in 'Percept D'Mark (India) Pvt. Ltd. v. Zaheer Khan', (2006) 4 SCC 227 "
            "and 'Niranjan Shankar Golikari v. Century Spg & Mfg Co.', AIR 1967 SC 1098 firmly settled that post-termination non-compete "
            "covenants cannot be enforced under Indian law. Only active-term covenants and proprietary trade secret protection are valid."
        ),
        "clean_clause": (
            "During the term of this Agreement, the Service Provider shall not undertake conflicting engagements directly detrimental to the Deliverables. "
            "Following termination of this Agreement, pursuant to Section 27 of the Indian Contract Act, 1872, no restriction shall apply to either Party "
            "from practicing any lawful vocation, profession, or commercial trade. For a period of twelve (12) months following termination, neither Party "
            "shall knowingly solicit or induce away any key active managerial personnel or exclusive client accounts of the other Party without express written consent. "
            "All proprietary code, algorithms, and trade secrets shall remain protected in perpetuity under Clause X (Confidentiality)."
        ),
        "negotiation_talk_track": (
            "Counsel / Founder Redline Note: 'Post-employment non-compete covenants are completely void and unenforceable under Section 27 of the Indian "
            "Contract Act, 1872 as confirmed by the Supreme Court in Percept D'Mark v. Zaheer Khan. We have rewritten this clause into an enforceable "
            "12-month employee/client non-solicitation obligation and perpetual trade secret protection.'"
        )
    },
    "penal_forfeiture": {
        "title": "Arbitrary Deposit Forfeiture -> Reasonable Proven Loss (§74 ICA)",
        "category": "Liquidated Damages & Penalties",
        "statutory_violation": "Section 74 Indian Contract Act, 1872 (Liquidated Damages vs. Penal Forfeiture)",
        "rationale": (
            "Section 74 ICA provides that where a sum is named as penalty or liquidated damages, the aggrieved party is entitled only to reasonable "
            "compensation not exceeding the sum named, upon establishing actual injury or reasonable pre-estimate of loss. "
            "Boilerplate clauses asserting 'entire caution deposit shall be non-refundable / forfeited upon early exit' are void penalties "
            "as held by the Supreme Court in 'Kailash Nath Associates v. DDA', (2015) 4 SCC 136 and 'Fateh Chand v. Balkishan Das', AIR 1963 SC 1405."
        ),
        "clean_clause": (
            "In the event of premature termination by Tenant / Client prior to completion of the agreed term, the Security Deposit of [Amount] "
            "shall be refunded in full within fifteen (15) days of handing over vacant possession, subject only to: (i) deduction of actual unpaid utilities, "
            "and (ii) direct verifiable physical damage to the premises beyond ordinary wear and tear. No arbitrary penal forfeiture or non-refundable "
            "lock-in retention shall apply pursuant to Section 74 of the Indian Contract Act, 1872 and Consumer Protection Act guidelines."
        ),
        "negotiation_talk_track": (
            "Counsel / Founder Redline Note: 'Clauses declaring 100% of deposits non-refundable regardless of actual loss violate Section 74 ICA and "
            "Supreme Court binding ratio in Kailash Nath Associates v. DDA. We have revised this to standard deduction for actual damages with mandatory 15-day refund.'"
        )
    },
    "unilateral_termination": {
        "title": "Immediate Termination at Will -> Bilateral Notice with 15-Day Cure (§39 ICA)",
        "category": "Term & Repudiation",
        "statutory_violation": "Section 39 Indian Contract Act, 1872 & Principles of Natural Justice",
        "rationale": (
            "Unilateral termination without cause and without cure creates severe contractual asymmetry, exposing the service provider "
            "to unrecoverable sunk costs and abrupt repudiation. Balanced Indian commercial practice mandates written notice of termination for convenience "
            "and a mandatory opportunity to cure alleged operational defaults."
        ),
        "clean_clause": (
            "Either Party may terminate this Agreement without cause upon providing thirty (30) days' prior written notice to the other Party. "
            "Either Party may terminate this Agreement immediately for material breach, provided the non-defaulting Party has issued a detailed written "
            "notice specifying the breach and the defaulting Party has failed to remedy or cure such breach within a mandatory cure period of fifteen (15) days "
            "from receipt of such notice. Upon termination, Client shall pay for all milestone deliverables completed up to the effective termination date."
        ),
        "negotiation_talk_track": (
            "Counsel / Founder Redline Note: 'Immediate termination without cause or cure creates operational unviability. We have incorporated standard bilateral "
            "30-day notice for convenience and a mandatory 15-day cure period before termination for material breach.'"
        )
    },
    "foreign_jurisdiction": {
        "title": "Foreign Jurisdiction Trap -> Indian Arbitration (§28 ICA & Act 1996)",
        "category": "Jurisdiction & Dispute Resolution",
        "statutory_violation": "Section 28 Indian Contract Act, 1872 (Ousting Jurisdiction of Competent Courts)",
        "rationale": (
            "Subjecting Indian domestic commercial entities to foreign jurisdictions (e.g. Delaware, London) for contracts performed entirely in India "
            "is cost-prohibitive and often hit by Section 28 ICA if it ousts Indian legal redress. Indian arbitration under the 1996 Act offers fast, binding, "
            "and enforceable commercial resolution with domestic courts retaining supervisory jurisdiction."
        ),
        "clean_clause": (
            "This Agreement shall be governed by, and construed in accordance with, the substantive laws of the Republic of India. "
            "Any dispute, controversy, or claim arising out of or relating to this Agreement shall be referred to and finally resolved by arbitration "
            "administered in accordance with the Arbitration & Conciliation Act, 1996 by a Sole Arbitrator appointed by mutual agreement of the Parties "
            "(or failing which, by the Hon'ble High Court under Section 11). The seat and venue of arbitration shall be [City], India. "
            "The courts at [City] shall have exclusive supervisory jurisdiction."
        ),
        "negotiation_talk_track": (
            "Counsel / Founder Redline Note: 'For services delivered in India by Indian registered entities, foreign jurisdiction clauses impose unnecessary "
            "currency and legal friction. We have substituted expedited domestic arbitration under the Arbitration & Conciliation Act 1996 in [City].'"
        )
    }
}

class CleanroomService:
    @staticmethod
    def get_stamping_directory() -> Dict[str, Any]:
        """Returns the state-by-state Indian e-Stamping directory."""
        return {
            "statute": "Indian Stamp Act, 1899 & Respective State Stamp Enactments",
            "precedent": "N.N. Global Mercantile v. Indo Unique Flame Ltd., [2023] INSC 1066",
            "states": STATE_STAMP_DIRECTORY
        }

    @staticmethod
    def get_cleanroom_presets() -> List[Dict[str, Any]]:
        """Returns available clean-room rewriting presets."""
        results = []
        for k, v in CLEANROOM_PRESETS.items():
            results.append({
                "key": k,
                "title": v["title"],
                "category": v["category"],
                "statutory_violation": v["statutory_violation"],
                "rationale": v["rationale"],
                "clean_clause": v["clean_clause"],
                "negotiation_talk_track": v["negotiation_talk_track"]
            })
        return results

    @staticmethod
    def rewrite_clause(
        clause_text: str,
        preset_key: Optional[str] = None,
        context: Optional[str] = None,
        gemini_api_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Rewrites a predatory clause into a balanced, enforceable Indian commercial clause
        with statutory justification and counsel negotiation talk-tracks.
        """
        preset = CLEANROOM_PRESETS.get(preset_key or "")
        
        # If no explicit preset, try to auto-detect based on text
        if not preset:
            cl_lower = clause_text.lower()
            if "non-compete" in cl_lower or "competing" in cl_lower or "restraint" in cl_lower or "24 months" in cl_lower:
                preset = CLEANROOM_PRESETS["void_non_compete"]
            elif "forfeit" in cl_lower or "security deposit" in cl_lower or "non-refundable" in cl_lower or "lock-in" in cl_lower:
                preset = CLEANROOM_PRESETS["penal_forfeiture"]
            elif "delaware" in cl_lower or "foreign" in cl_lower or "courts of england" in cl_lower or "new york" in cl_lower:
                preset = CLEANROOM_PRESETS["foreign_jurisdiction"]
            elif "without notice" in cl_lower or "at will" in cl_lower or "immediately without" in cl_lower:
                preset = CLEANROOM_PRESETS["unilateral_termination"]
            else:
                preset = CLEANROOM_PRESETS["uncapped_indemnity"]

        base_clean = preset["clean_clause"]
        base_rationale = preset["rationale"]
        base_talk_track = preset["negotiation_talk_track"]
        base_statute = preset["statutory_violation"]

        # If Gemini is available, customize rewrite to user's exact clause
        api_key = (gemini_api_key or getattr(settings, "GEMINI_API_KEY", "") or os.environ.get("GEMINI_API_KEY", "") or "").strip()
        if api_key and len(api_key) > 10 and len(clause_text) > 20:
            prompt = (
                f"You are a Senior Corporate Legal Partner in India specializing in Indian Contract Act 1872, "
                f"DPDP Act 2023, and Arbitration & Conciliation Act 1996.\n"
                f"A client has provided this potentially predatory or one-sided contract clause:\n\n"
                f"FLAGGED CLAUSE:\n\"{clause_text}\"\n\n"
                f"Clean-Room Task:\n"
                f"1. Explain the precise statutory invalidity under Indian law (cite sections of ICA 1872 / landmark SC cases).\n"
                f"2. Provide a Clean-Room Balanced Replacement Clause that is commercially fair, court-enforceable, and protects the client.\n"
                f"3. Provide a tactical 2-sentence Negotiation Talk-Track for the client or their counsel to send in redline comments.\n"
                f"Return JSON with keys: statutory_violation, rationale, clean_clause, negotiation_talk_track. Do NOT output markdown rules (---)."
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
                        raw = json.loads(resp.read().decode("utf-8"))
                        txt = raw["candidates"][0]["content"]["parts"][0]["text"]
                        # Clean JSON code block wrappers if any
                        clean_json_str = txt.strip()
                        if clean_json_str.startswith("```json"):
                            clean_json_str = clean_json_str[7:]
                        if clean_json_str.endswith("```"):
                            clean_json_str = clean_json_str[:-3]
                        parsed = json.loads(clean_json_str.strip())
                        return {
                            "original_clause": clause_text,
                            "statutory_violation": parsed.get("statutory_violation", base_statute),
                            "rationale": parsed.get("rationale", base_rationale),
                            "clean_clause": parsed.get("clean_clause", base_clean),
                            "negotiation_talk_track": parsed.get("negotiation_talk_track", base_talk_track),
                            "engine": "Google Gemini 1.5 Flash (Grounded Indian Corporate Partner)"
                        }
            except Exception as e:
                print(f"Cleanroom AI enhancement fallback: {e}")

        return {
            "original_clause": clause_text,
            "statutory_violation": base_statute,
            "rationale": base_rationale,
            "clean_clause": base_clean,
            "negotiation_talk_track": base_talk_track,
            "engine": "Bharat Statutory Clean-Room Engine (Deterministic Indian Law)"
        }
