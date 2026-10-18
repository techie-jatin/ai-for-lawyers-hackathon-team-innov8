"""
Statutory Concordance & Transition Engine
Bharat Legal Intelligence 2.0
Provides 100+ bi-directional cross-mappings between:
- IPC (1860) <-> BNS (2023)
- CrPC (1973) <-> BNSS (2023)
- IEA (1872) <-> BSA (2023)
Includes Transition & Savings Clause Advisor (Sec 358 BNS, Sec 531 BNSS, Art 20(1) Constitution).
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, date

CONCORDANCE_MASTER_DATA: List[Dict[str, Any]] = [
    # -------------------------------------------------------------------------
    # 1. IPC 1860 <-> BNS 2023: OFFENSES AGAINST HUMAN BODY
    # -------------------------------------------------------------------------
    {
        "id": 1,
        "old_act": "IPC 1860",
        "old_section": "Section 300 / 302",
        "new_act": "BNS 2023",
        "new_section": "Section 103(1)",
        "offense_title": "Punishment for Murder",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Death or Imprisonment for Life + Fine",
        "bailable_status": "Non-Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Basic murder definition retained. Sub-section (2) introduces strict penal provisions for mob lynching and group murders."
    },
    {
        "id": 2,
        "old_act": "IPC 1860",
        "old_section": "None (New Offense)",
        "new_act": "BNS 2023",
        "new_section": "Section 103(2)",
        "offense_title": "Mob Lynching (Murder by Group of 5 or More)",
        "category": "IPC_BNS",
        "status": "New Offense",
        "penalty_summary": "Death or Imprisonment for Life or not less than 7 years + Fine",
        "bailable_status": "Non-Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Specifically codifies mob lynching when 5 or more persons act in concert to commit murder on grounds of race, caste, sex, place of birth, language, or personal belief."
    },
    {
        "id": 3,
        "old_act": "IPC 1860",
        "old_section": "Section 299 / 304",
        "new_act": "BNS 2023",
        "new_section": "Section 105",
        "offense_title": "Culpable Homicide Not Amounting to Murder",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Life imprisonment or up to 10 years + Fine",
        "bailable_status": "Non-Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Maintains distinction between intention (Part I) and knowledge without intention (Part II)."
    },
    {
        "id": 4,
        "old_act": "IPC 1860",
        "old_section": "Section 304A",
        "new_act": "BNS 2023",
        "new_section": "Section 106(1) & (2)",
        "offense_title": "Causing Death by Negligence & Hit-and-Run",
        "category": "IPC_BNS",
        "status": "Enhanced",
        "penalty_summary": "Sec 106(1): Up to 5 yrs; Sec 106(2): Up to 10 yrs + Fine for fleeing without reporting.",
        "bailable_status": "Bailable (106(1)) / Non-Bailable (106(2))",
        "cognizable_status": "Cognizable",
        "key_change": "Section 106(2) creates a distinct aggravated offense for drivers fleeing the scene without reporting to police or magistrate (held in abeyance pending stakeholder consultations)."
    },
    {
        "id": 5,
        "old_act": "IPC 1860",
        "old_section": "Section 304B",
        "new_act": "BNS 2023",
        "new_section": "Section 80",
        "offense_title": "Dowry Death",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Imprisonment not less than 7 years up to Life",
        "bailable_status": "Non-Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Relocated to Chapter V (Offenses against Women and Children); presumes cruelty in connection with dowry demands within 7 years of marriage."
    },
    {
        "id": 6,
        "old_act": "IPC 1860",
        "old_section": "Section 306",
        "new_act": "BNS 2023",
        "new_section": "Section 108",
        "offense_title": "Abetment of Suicide",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Up to 10 years imprisonment + Fine",
        "bailable_status": "Non-Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Direct instigation or facilitation benchmark retained from Arnesh Kumar / Praveen Pradhan jurisprudence."
    },
    {
        "id": 7,
        "old_act": "IPC 1860",
        "old_section": "Section 307",
        "new_act": "BNS 2023",
        "new_section": "Section 109",
        "offense_title": "Attempt to Murder",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Up to 10 years (or Life if hurt is caused) + Fine",
        "bailable_status": "Non-Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Streamlined wording preserving requirement of intention and execution of an overt act toward commission."
    },
    {
        "id": 8,
        "old_act": "IPC 1860",
        "old_section": "Section 319 / 323",
        "new_act": "BNS 2023",
        "new_section": "Section 114 / 115",
        "offense_title": "Voluntarily Causing Hurt",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Up to 1 year imprisonment or fine up to ₹1,000 or both",
        "bailable_status": "Bailable",
        "cognizable_status": "Non-Cognizable",
        "key_change": "Introduces community service as an alternative penal disposition for minor simple hurt."
    },
    {
        "id": 9,
        "old_act": "IPC 1860",
        "old_section": "Section 320 / 325",
        "new_act": "BNS 2023",
        "new_section": "Section 116 / 117",
        "offense_title": "Voluntarily Causing Grievous Hurt",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Up to 7 years imprisonment + Fine",
        "bailable_status": "Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Eight designated statutory clauses of grievous hurt (emasculation, permanent sight/hearing loss, 15 days severe bodily pain) modernized."
    },
    {
        "id": 10,
        "old_act": "IPC 1860",
        "old_section": "Section 326A / 326B",
        "new_act": "BNS 2023",
        "new_section": "Section 124(1) & (2)",
        "offense_title": "Voluntarily Causing Grievous Hurt by Acid Attack",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Minimum 10 years up to Life imprisonment + Fine to cover medical expenses",
        "bailable_status": "Non-Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Fine must be just and reasonable to meet the medical expenses of the treatment of the victim and paid directly to her."
    },
    {
        "id": 11,
        "old_act": "IPC 1860",
        "old_section": "Section 339 / 341",
        "new_act": "BNS 2023",
        "new_section": "Section 126(1) & (2)",
        "offense_title": "Wrongful Restraint",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Simple imprisonment up to 1 month or fine up to ₹5,000 or both",
        "bailable_status": "Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Enhanced monetary fine threshold from colonial ₹500 to ₹5,000."
    },
    {
        "id": 12,
        "old_act": "IPC 1860",
        "old_section": "Section 340 / 342",
        "new_act": "BNS 2023",
        "new_section": "Section 127",
        "offense_title": "Wrongful Confinement",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Up to 1 year imprisonment or fine up to ₹5,000 or both",
        "bailable_status": "Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Increased fine thresholds and streamlined definitions of circumscribed boundaries."
    },
    {
        "id": 13,
        "old_act": "IPC 1860",
        "old_section": "Section 351 / 352",
        "new_act": "BNS 2023",
        "new_section": "Section 130 / 131",
        "offense_title": "Assault & Criminal Force",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Up to 3 months or fine up to ₹1,000 or both",
        "bailable_status": "Bailable",
        "cognizable_status": "Non-Cognizable",
        "key_change": "Modernized formulation clarifying gestures causing reasonable apprehension of criminal force."
    },
    {
        "id": 14,
        "old_act": "IPC 1860",
        "old_section": "Section 359 / 363",
        "new_act": "BNS 2023",
        "new_section": "Section 137 / 140",
        "offense_title": "Kidnapping from Lawful Guardianship",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Up to 7 years imprisonment + Fine",
        "bailable_status": "Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Age benchmark standardized (under 18 years for both male and female)."
    },
    {
        "id": 15,
        "old_act": "IPC 1860",
        "old_section": "Section 364A",
        "new_act": "BNS 2023",
        "new_section": "Section 140(2)",
        "offense_title": "Kidnapping for Ransom",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Death or Imprisonment for Life + Fine",
        "bailable_status": "Non-Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Directly links extortionate hostage demands to capital deterrence."
    },

    # -------------------------------------------------------------------------
    # 2. IPC 1860 <-> BNS 2023: OFFENSES AGAINST WOMEN & CHILDREN
    # -------------------------------------------------------------------------
    {
        "id": 16,
        "old_act": "IPC 1860",
        "old_section": "Section 375 / 376",
        "new_act": "BNS 2023",
        "new_section": "Section 63 / 64",
        "offense_title": "Rape",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Rigorous imprisonment not less than 10 years up to Life + Fine",
        "bailable_status": "Non-Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Relocated to prime position in Chapter V; fine must be paid to the victim to meet medical expenses."
    },
    {
        "id": 17,
        "old_act": "IPC 1860",
        "old_section": "Section 376D",
        "new_act": "BNS 2023",
        "new_section": "Section 70(1)",
        "offense_title": "Gang Rape",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Rigorous imprisonment not less than 20 years up to Life (remainder of natural life) + Fine",
        "bailable_status": "Non-Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Joint vicarious liability reaffirmed; life imprisonment explicitly defined as remainder of natural life."
    },
    {
        "id": 18,
        "old_act": "IPC 1860",
        "old_section": "Section 376DA / 376DB",
        "new_act": "BNS 2023",
        "new_section": "Section 70(2)",
        "offense_title": "Gang Rape of Minor under 18 / 12 Years",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Imprisonment for Life (natural life) or Death + Fine",
        "bailable_status": "Non-Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Stringent capital deterrence harmonized with POCSO Act provisions."
    },
    {
        "id": 19,
        "old_act": "IPC 1860",
        "old_section": "None (New Offense)",
        "new_act": "BNS 2023",
        "new_section": "Section 69",
        "offense_title": "Sexual Intercourse by Deceitful Means / False Promise of Marriage",
        "category": "IPC_BNS",
        "status": "New Offense",
        "penalty_summary": "Up to 10 years imprisonment + Fine",
        "bailable_status": "Non-Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Specifically criminalizes sexual relations induced by false promise of employment, promotion, or marriage without intending to fulfill it."
    },
    {
        "id": 20,
        "old_act": "IPC 1860",
        "old_section": "Section 354",
        "new_act": "BNS 2023",
        "new_section": "Section 74",
        "offense_title": "Assault or Criminal Force to Woman with Intent to Outrage Modesty",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Imprisonment 1 to 5 years + Fine",
        "bailable_status": "Non-Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Retains strict non-bailable classification and victim protection safeguards."
    },
    {
        "id": 21,
        "old_act": "IPC 1860",
        "old_section": "Section 354A",
        "new_act": "BNS 2023",
        "new_section": "Section 75",
        "offense_title": "Sexual Harassment",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Rigorous imprisonment up to 3 years or fine or both",
        "bailable_status": "Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Covers physical contact, demand for sexual favors, and showing pornography."
    },
    {
        "id": 22,
        "old_act": "IPC 1860",
        "old_section": "Section 354C",
        "new_act": "BNS 2023",
        "new_section": "Section 77",
        "offense_title": "Voyeurism",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "1st conviction: 1 to 3 yrs; 2nd conviction: 3 to 7 yrs + Fine",
        "bailable_status": "Bailable (1st offense) / Non-Bailable (subsequent)",
        "cognizable_status": "Cognizable",
        "key_change": "Expanded digital capture and surveillance camera exploitation coverage."
    },
    {
        "id": 23,
        "old_act": "IPC 1860",
        "old_section": "Section 354D",
        "new_act": "BNS 2023",
        "new_section": "Section 78",
        "offense_title": "Stalking (Physical & Cyber)",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "1st conviction: up to 3 yrs; subsequent: up to 5 yrs + Fine",
        "bailable_status": "Bailable (1st offense) / Non-Bailable (subsequent)",
        "cognizable_status": "Cognizable",
        "key_change": "Explicitly covers internet, email, social media, and electronic monitoring."
    },
    {
        "id": 24,
        "old_act": "IPC 1860",
        "old_section": "Section 498A",
        "new_act": "BNS 2023",
        "new_section": "Section 85",
        "offense_title": "Cruelty by Husband or Relatives of Husband",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Up to 3 years imprisonment + Fine",
        "bailable_status": "Non-Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Section 86 defines cruelty (wilful conduct likely to drive woman to suicide or harass for property). Arnesh Kumar notice under Section 35(3) BNSS mandatory."
    },
    {
        "id": 25,
        "old_act": "IPC 1860",
        "old_section": "Section 509",
        "new_act": "BNS 2023",
        "new_section": "Section 79",
        "offense_title": "Word, Gesture or Act Intended to Insult Modesty of a Woman",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Simple imprisonment up to 3 years + Fine",
        "bailable_status": "Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Enhanced minimum punishment from colonial 1 year to up to 3 years."
    },

    # -------------------------------------------------------------------------
    # 3. IPC 1860 <-> BNS 2023: OFFENSES AGAINST PROPERTY & FINANCIAL CRIMES
    # -------------------------------------------------------------------------
    {
        "id": 26,
        "old_act": "IPC 1860",
        "old_section": "Section 378 / 379",
        "new_act": "BNS 2023",
        "new_section": "Section 303(2)",
        "offense_title": "Theft",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Up to 3 years imprisonment or fine or both. Community service for petty theft < ₹5,000 upon return.",
        "bailable_status": "Non-Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "First statutory introduction of Community Service for first-time petty theft where stolen property value is under ₹5,000 and restored."
    },
    {
        "id": 27,
        "old_act": "IPC 1860",
        "old_section": "None (New Offense)",
        "new_act": "BNS 2023",
        "new_section": "Section 304",
        "offense_title": "Snatching (Quick / Forcible Seizure of Property)",
        "category": "IPC_BNS",
        "status": "New Offense",
        "penalty_summary": "Up to 3 years imprisonment + Fine",
        "bailable_status": "Non-Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Fills colonial void where chain/mobile phone snatching was charged as simple theft or robbery."
    },
    {
        "id": 28,
        "old_act": "IPC 1860",
        "old_section": "Section 383 / 384",
        "new_act": "BNS 2023",
        "new_section": "Section 308",
        "offense_title": "Extortion",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Up to 3 years imprisonment or fine or both",
        "bailable_status": "Non-Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Covers digital extortion, cyber blackmail, and extortionate coercive debt collection."
    },
    {
        "id": 29,
        "old_act": "IPC 1860",
        "old_section": "Section 390 / 392",
        "new_act": "BNS 2023",
        "new_section": "Section 309",
        "offense_title": "Robbery",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Rigorous imprisonment up to 10 years (14 years on highway at night) + Fine",
        "bailable_status": "Non-Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Clear statutory nexus: theft or extortion converts to robbery if hurt, death or restraint is caused or attempted."
    },
    {
        "id": 30,
        "old_act": "IPC 1860",
        "old_section": "Section 391 / 395",
        "new_act": "BNS 2023",
        "new_section": "Section 310",
        "offense_title": "Dacoity (Robbery by 5 or More Persons)",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Imprisonment for Life or rigorous imprisonment up to 10 years + Fine",
        "bailable_status": "Non-Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Maintains 5-person threshold and joint responsibility of all conspirators."
    },
    {
        "id": 31,
        "old_act": "IPC 1860",
        "old_section": "Section 403",
        "new_act": "BNS 2023",
        "new_section": "Section 314",
        "offense_title": "Dishonest Misappropriation of Property",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Up to 2 years or fine or both",
        "bailable_status": "Bailable",
        "cognizable_status": "Non-Cognizable",
        "key_change": "Applies where innocent possession subsequently turns dishonest (e.g. found property)."
    },
    {
        "id": 32,
        "old_act": "IPC 1860",
        "old_section": "Section 405 / 406",
        "new_act": "BNS 2023",
        "new_section": "Section 316",
        "offense_title": "Criminal Breach of Trust",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Up to 5 years imprisonment or fine or both",
        "bailable_status": "Non-Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Increased maximum term from 3 to 5 years. Covers security deposit misappropriation and digital wallets."
    },
    {
        "id": 33,
        "old_act": "IPC 1860",
        "old_section": "Section 415 / 417 / 420",
        "new_act": "BNS 2023",
        "new_section": "Section 318(1)-(4)",
        "offense_title": "Cheating and Dishonestly Inducing Delivery of Property",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Sec 318(4): Up to 7 years imprisonment + Fine",
        "bailable_status": "Non-Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Consolidated cheating definitions. Covers electronic inducements, fake UPI/QR codes, and online marketplace fraud."
    },
    {
        "id": 34,
        "old_act": "IPC 1860",
        "old_section": "Section 441 / 447",
        "new_act": "BNS 2023",
        "new_section": "Section 329(1) & (3)",
        "offense_title": "Criminal Trespass",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Up to 3 months or fine up to ₹5,000 or both",
        "bailable_status": "Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Fine threshold enhanced tenfold from colonial ₹500 to ₹5,000."
    },
    {
        "id": 35,
        "old_act": "IPC 1860",
        "old_section": "Section 442 / 448",
        "new_act": "BNS 2023",
        "new_section": "Section 329(2) & 330",
        "offense_title": "House-Trespass",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Up to 1 year or fine up to ₹5,000 or both",
        "bailable_status": "Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Applies to residential flats, rented premises, and student hostels against illegal lockouts."
    },
    {
        "id": 36,
        "old_act": "IPC 1860",
        "old_section": "Section 457",
        "new_act": "BNS 2023",
        "new_section": "Section 331(4)",
        "offense_title": "Lurking House-Trespass or House-Breaking by Night to Commit Offense",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Up to 5 years (14 years if offense is theft) + Fine",
        "bailable_status": "Non-Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Consolidated night house-breaking provisions."
    },
    {
        "id": 37,
        "old_act": "IPC 1860",
        "old_section": "Section 463 / 465",
        "new_act": "BNS 2023",
        "new_section": "Section 336(1) & (2)",
        "offense_title": "Forgery",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Up to 2 years or fine or both",
        "bailable_status": "Bailable",
        "cognizable_status": "Non-Cognizable",
        "key_change": "Definition updated to cover digital documents, electronic records, and scanned signatures."
    },
    {
        "id": 38,
        "old_act": "IPC 1860",
        "old_section": "Section 467",
        "new_act": "BNS 2023",
        "new_section": "Section 338",
        "offense_title": "Forgery of Valuable Security, Will, etc.",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Imprisonment for Life or up to 10 years + Fine",
        "bailable_status": "Non-Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Applies to forged bank guarantees, property sale deeds, promissory notes, and digital e-stamps."
    },
    {
        "id": 39,
        "old_act": "IPC 1860",
        "old_section": "Section 468",
        "new_act": "BNS 2023",
        "new_section": "Section 336(3)",
        "offense_title": "Forgery for Purpose of Cheating",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Up to 7 years imprisonment + Fine",
        "bailable_status": "Non-Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Essential offense charged in banking loan frauds and forged identity documents (Aadhaar/PAN)."
    },
    {
        "id": 40,
        "old_act": "IPC 1860",
        "old_section": "Section 471",
        "new_act": "BNS 2023",
        "new_section": "Section 340",
        "offense_title": "Using as Genuine a Forged Document or Electronic Record",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Punished in the same manner as if forged by that person",
        "bailable_status": "Bailable (if document bailable) / Non-Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Explicit inclusion of electronic records, PDFs, and digitally altered certificates."
    },

    # -------------------------------------------------------------------------
    # 4. IPC 1860 <-> BNS 2023: INCHOATE, CONSPIRACY & SPECIAL OFFENSES
    # -------------------------------------------------------------------------
    {
        "id": 41,
        "old_act": "IPC 1860",
        "old_section": "Section 120A / 120B",
        "new_act": "BNS 2023",
        "new_section": "Section 61(1) & (2)",
        "offense_title": "Criminal Conspiracy",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Same as abetment of the offense conspired",
        "bailable_status": "Depends on offense",
        "cognizable_status": "Cognizable",
        "key_change": "Preserves core doctrine: meeting of minds and agreement to do an unlawful act."
    },
    {
        "id": 42,
        "old_act": "IPC 1860",
        "old_section": "Section 107 / 108 / 109",
        "new_act": "BNS 2023",
        "new_section": "Section 45 / 46 / 49",
        "offense_title": "Abetment",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Same punishment as principal offense if act committed in consequence",
        "bailable_status": "Depends on offense",
        "cognizable_status": "Depends on offense",
        "key_change": "Modernized abetment by instigation, conspiracy, and intentional aiding."
    },
    {
        "id": 43,
        "old_act": "IPC 1860",
        "old_section": "None (New Offense)",
        "new_act": "BNS 2023",
        "new_section": "Section 111",
        "offense_title": "Organized Crime Syndicate",
        "category": "IPC_BNS",
        "status": "New Offense",
        "penalty_summary": "Death or Life imprisonment + Fine (min ₹5 Lakhs) if death caused; else min 5 yrs up to Life",
        "bailable_status": "Non-Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "First Central codification of organized crime syndicate offenses previously only covered under state laws like MCOCA."
    },
    {
        "id": 44,
        "old_act": "IPC 1860",
        "old_section": "None (New Offense)",
        "new_act": "BNS 2023",
        "new_section": "Section 112",
        "offense_title": "Petty Organized Crime",
        "category": "IPC_BNS",
        "status": "New Offense",
        "penalty_summary": "Imprisonment 1 to 7 years + Fine",
        "bailable_status": "Non-Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Punishes theft, snatching, cheating, ticket unauthorized selling, betting or gambling committed by gangs or syndicates."
    },
    {
        "id": 45,
        "old_act": "IPC 1860",
        "old_section": "None (New Offense)",
        "new_act": "BNS 2023",
        "new_section": "Section 113",
        "offense_title": "Terrorist Act",
        "category": "IPC_BNS",
        "status": "New Offense",
        "penalty_summary": "Death or Life imprisonment + Fine",
        "bailable_status": "Non-Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Directly incorporates terrorist act definitions from UAPA into the general penal code."
    },
    {
        "id": 46,
        "old_act": "IPC 1860",
        "old_section": "Section 124A (Sedition)",
        "new_act": "BNS 2023",
        "new_section": "Section 152",
        "offense_title": "Act Endangering Sovereignty, Unity and Integrity of India",
        "category": "IPC_BNS",
        "status": "Substituted",
        "penalty_summary": "Imprisonment for Life or up to 7 years + Fine",
        "bailable_status": "Non-Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Colonial word 'Sedition' (Rajdroh) deleted. Focus shifted to acts exciting secession, armed rebellion, or subversive activities endangering sovereignty."
    },
    {
        "id": 47,
        "old_act": "IPC 1860",
        "old_section": "Section 141 / 146 / 147",
        "new_act": "BNS 2023",
        "new_section": "Section 189 / 191(1)",
        "offense_title": "Unlawful Assembly & Rioting",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Up to 2 years or fine or both",
        "bailable_status": "Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Retains common object doctrine under Section 190 (formerly Section 149 IPC)."
    },
    {
        "id": 48,
        "old_act": "IPC 1860",
        "old_section": "Section 153A",
        "new_act": "BNS 2023",
        "new_section": "Section 196",
        "offense_title": "Promoting Enmity between Different Groups on Grounds of Religion, Race, etc.",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Up to 3 years or fine or both (up to 5 years in place of worship)",
        "bailable_status": "Non-Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Electronic and social media hate speech explicitly integrated."
    },
    {
        "id": 49,
        "old_act": "IPC 1860",
        "old_section": "Section 191 / 193",
        "new_act": "BNS 2023",
        "new_section": "Section 227 / 229",
        "offense_title": "Giving or Fabricating False Evidence (Perjury)",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Up to 7 years (judicial proceedings) + Fine",
        "bailable_status": "Bailable",
        "cognizable_status": "Non-Cognizable",
        "key_change": "Includes filing false affidavits, doctored electronic records, and manipulated videos in court."
    },
    {
        "id": 50,
        "old_act": "IPC 1860",
        "old_section": "None (New Offense)",
        "new_act": "BNS 2023",
        "new_section": "Section 232",
        "offense_title": "Threatening or Inducing Any Person to Give False Evidence",
        "category": "IPC_BNS",
        "status": "New Offense",
        "penalty_summary": "Up to 7 years imprisonment + Fine",
        "bailable_status": "Non-Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Dedicated penalization of witness tampering and witness intimidation."
    },
    {
        "id": 51,
        "old_act": "IPC 1860",
        "old_section": "Section 503 / 506",
        "new_act": "BNS 2023",
        "new_section": "Section 351(1)-(3)",
        "offense_title": "Criminal Intimidation",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Simple: up to 2 yrs; If threat be to cause death or grievous hurt: up to 7 yrs + Fine",
        "bailable_status": "Bailable",
        "cognizable_status": "Non-Cognizable",
        "key_change": "Includes verbal, written, electronic, and recovery agent coercion."
    },
    {
        "id": 52,
        "old_act": "IPC 1860",
        "old_section": "Section 499 / 500",
        "new_act": "BNS 2023",
        "new_section": "Section 356",
        "offense_title": "Defamation",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Simple imprisonment up to 2 years or fine or both or Community Service",
        "bailable_status": "Bailable",
        "cognizable_status": "Non-Cognizable",
        "key_change": "Community service added as a sentencing alternative for defamation."
    },
    {
        "id": 53,
        "old_act": "IPC 1860",
        "old_section": "None (New Provision)",
        "new_act": "BNS 2023",
        "new_section": "Section 4(f)",
        "offense_title": "Community Service as a Recognized Form of Punishment",
        "category": "IPC_BNS",
        "status": "New Form of Punishment",
        "penalty_summary": "Court-directed unpaid work for benefit of community without imprisonment stigma",
        "bailable_status": "Reformative Disposition",
        "cognizable_status": "Judicial Discretion",
        "key_change": "Sixth statutory punishment in India (alongside Death, Life, Imprisonment, Forfeiture, Fine)."
    },

    # -------------------------------------------------------------------------
    # 5. CrPC 1973 <-> BNSS 2023: ARREST, INVESTIGATION & PROCEDURAL SAFEGUARDS
    # -------------------------------------------------------------------------
    {
        "id": 54,
        "old_act": "CrPC 1973",
        "old_section": "Section 41A",
        "new_act": "BNSS 2023",
        "new_section": "Section 35(3)",
        "offense_title": "Mandatory Notice of Appearance Prior to Arrest (Arnesh Kumar Rule)",
        "category": "CrPC_BNSS",
        "status": "Active",
        "penalty_summary": "Mandatory issuance for offenses <= 7 years; arrest only on documented necessity",
        "bailable_status": "Procedural Right",
        "cognizable_status": "Statutory Mandate",
        "key_change": "Statutory codification of Arnesh Kumar (2014) 8 SCC 273. Police officer failing to issue notice is liable for disciplinary and contempt proceedings."
    },
    {
        "id": 55,
        "old_act": "CrPC 1973",
        "old_section": "Section 41",
        "new_act": "BNSS 2023",
        "new_section": "Section 35(1)",
        "offense_title": "When Police May Arrest Without Warrant",
        "category": "CrPC_BNSS",
        "status": "Active",
        "penalty_summary": "Police arrest powers circumscribed by objective conditions (prevention of tampering, flight risk)",
        "bailable_status": "Statutory Power",
        "cognizable_status": "Cognizable Offenses",
        "key_change": "Sub-clause (7) mandates that for offenses punishable with less than 3 years imprisonment, arrest can only be made with prior sanction of an officer not below Deputy SP rank if person is infirm/elderly."
    },
    {
        "id": 56,
        "old_act": "CrPC 1973",
        "old_section": "Section 46(4)",
        "new_act": "BNSS 2023",
        "new_section": "Section 43(5)",
        "offense_title": "Safeguards on Arrest of Women (Sunset to Sunrise Protection)",
        "category": "CrPC_BNSS",
        "status": "Active",
        "penalty_summary": "No woman can be arrested after sunset and before sunrise except with prior Judicial Magistrate sanction",
        "bailable_status": "Constitutional Safeguard",
        "cognizable_status": "Mandatory Compliance",
        "key_change": "Strictly enforces female police officer presence and prior judicial permission."
    },
    {
        "id": 57,
        "old_act": "CrPC 1973",
        "old_section": "Section 57",
        "new_act": "BNSS 2023",
        "new_section": "Section 58",
        "offense_title": "Person Arrested Not to be Detained Beyond 24 Hours",
        "category": "CrPC_BNSS",
        "status": "Active",
        "penalty_summary": "Magistrate production mandatory within 24 hours excluding journey time",
        "bailable_status": "Fundamental Right (Art 22)",
        "cognizable_status": "Constitutional Mandate",
        "key_change": "Non-compliance renders detention illegal; production via audio-video electronic means permitted."
    },
    {
        "id": 58,
        "old_act": "CrPC 1973",
        "old_section": "Section 61 / 62",
        "new_act": "BNSS 2023",
        "new_section": "Section 63 / 64",
        "offense_title": "Service of Summons by Electronic Means",
        "category": "CrPC_BNSS",
        "status": "Enhanced",
        "penalty_summary": "Valid service through encrypted email, messaging applications, and portal notices",
        "bailable_status": "Procedural Rule",
        "cognizable_status": "Judicial Process",
        "key_change": "Formally legalizes service of court summons via WhatsApp, email, and digital portals."
    },
    {
        "id": 59,
        "old_act": "CrPC 1973",
        "old_section": "Section 100 / 102",
        "new_act": "BNSS 2023",
        "new_section": "Section 105",
        "offense_title": "Mandatory Audio-Video Recording of Search and Seizure",
        "category": "CrPC_BNSS",
        "status": "New Mandatory Safeguard",
        "penalty_summary": "Search and seizure process must be videographed on mobile/camera and submitted without delay",
        "bailable_status": "Evidentiary Requirement",
        "cognizable_status": "Investigation Rule",
        "key_change": "Revolutionary change: Search of places and seizure of property (including panchnama) MUST be recorded by audio-video electronic means and uploaded to District Magistrate / Court within 48 hours."
    },
    {
        "id": 60,
        "old_act": "CrPC 1973",
        "old_section": "Section 154",
        "new_act": "BNSS 2023",
        "new_section": "Section 173(1)",
        "offense_title": "Information in Cognizable Cases & Statutory Zero FIR",
        "category": "CrPC_BNSS",
        "status": "Enhanced",
        "penalty_summary": "Police cannot refuse FIR on territorial grounds; must register Zero FIR and transfer",
        "bailable_status": "Statutory Right",
        "cognizable_status": "Mandatory Duty",
        "key_change": "First explicit statutory codification of Zero FIR and e-FIR (e-FIR must be signed by complainant within 3 days)."
    },
    {
        "id": 61,
        "old_act": "CrPC 1973",
        "old_section": "None (Lalita Kumari judgment rule)",
        "new_act": "BNSS 2023",
        "new_section": "Section 173(3)",
        "offense_title": "Preliminary Enquiry in Offenses Punishable Between 3 and 7 Years",
        "category": "CrPC_BNSS",
        "status": "New Statutory Step",
        "penalty_summary": "14-day preliminary enquiry permitted with prior permission of DSP before FIR registration",
        "bailable_status": "Pre-FIR Safeguard",
        "cognizable_status": "Discretionary",
        "key_change": "Statutory enactment of preliminary enquiry for offenses carrying 3 to 7 years to ascertain existence of prima facie case."
    },
    {
        "id": 62,
        "old_act": "CrPC 1973",
        "old_section": "Section 161",
        "new_act": "BNSS 2023",
        "new_section": "Section 176(1) & (3)",
        "offense_title": "Examination of Witnesses & Forensics in Serious Crimes",
        "category": "CrPC_BNSS",
        "status": "Enhanced",
        "penalty_summary": "Forensic investigation mandatory for offenses punishable with 7 years or more",
        "bailable_status": "Investigation Mandate",
        "cognizable_status": "Statutory Compliance",
        "key_change": "Mandates visit of forensic expert team to crime scene and collection of scientific evidence for offenses carrying >= 7 years."
    },
    {
        "id": 63,
        "old_act": "CrPC 1973",
        "old_section": "Section 164",
        "new_act": "BNSS 2023",
        "new_section": "Section 183",
        "offense_title": "Recording of Confessions and Statements by Magistrate",
        "category": "CrPC_BNSS",
        "status": "Enhanced",
        "penalty_summary": "Statements in sexual offenses must be recorded immediately by woman magistrate with audio-video",
        "bailable_status": "Judicial Pre-Trial Stage",
        "cognizable_status": "Statutory Duty",
        "key_change": "Audio-video electronic recording of Section 183 statements legalized."
    },
    {
        "id": 64,
        "old_act": "CrPC 1973",
        "old_section": "Section 167(2)",
        "new_act": "BNSS 2023",
        "new_section": "Section 187(2) & (3)",
        "offense_title": "Police Custody / Remand & Phased Detention",
        "category": "CrPC_BNSS",
        "status": "Major Procedural Shift",
        "penalty_summary": "15 days police custody can now be taken in parts across first 40 or 60 days of detention",
        "bailable_status": "Remand Adjudication",
        "cognizable_status": "Judicial Discretion",
        "key_change": "Substantial change from CrPC: Police custody is no longer restricted strictly to the first 15 days; Magistrate may authorize 15 days police remand in whole or in parts during the first 40 or 60 days."
    },
    {
        "id": 65,
        "old_act": "CrPC 1973",
        "old_section": "Section 167(2) Proviso (a)",
        "new_act": "BNSS 2023",
        "new_section": "Section 187(5)",
        "offense_title": "Default Bail (Statutory Bail on Failure to File Charge-Sheet)",
        "category": "CrPC_BNSS",
        "status": "Active",
        "penalty_summary": "Indefeasible right to bail upon expiry of 60 or 90 days if investigation incomplete",
        "bailable_status": "Indefeasible Right",
        "cognizable_status": "Statutory Mandate",
        "key_change": "60 days (offenses < 10 yrs) and 90 days (offenses with death, life, or min 10 yrs) default bail timelines preserved."
    },
    {
        "id": 66,
        "old_act": "CrPC 1973",
        "old_section": "Section 173(2)",
        "new_act": "BNSS 2023",
        "new_section": "Section 193",
        "offense_title": "Police Report (Charge-Sheet) & 90-Day Informant Update",
        "category": "CrPC_BNSS",
        "status": "Enhanced",
        "penalty_summary": "Charge-sheet completion within 90 days in sexual offenses; mandatory progress update to informant",
        "bailable_status": "Filing Deadline",
        "cognizable_status": "Investigation Conclusion",
        "key_change": "Section 193(3)(ii) introduces a novel right: Police MUST inform the victim/informant of the progress of the investigation within 90 days (including via electronic means)."
    },

    # -------------------------------------------------------------------------
    # 6. CrPC 1973 <-> BNSS 2023: BAIL, TRIAL, INHERENT POWERS & DISPOSITIONS
    # -------------------------------------------------------------------------
    {
        "id": 67,
        "old_act": "CrPC 1973",
        "old_section": "Section 436A",
        "new_act": "BNSS 2023",
        "new_section": "Section 479",
        "offense_title": "Maximum Period for Which Undertrial Prisoner Can Be Detained",
        "category": "CrPC_BNSS",
        "status": "Pro-Accused Reform",
        "penalty_summary": "First-time offenders entitled to mandatory bail upon completing 1/3rd of maximum sentence",
        "bailable_status": "Mandatory Undertrial Bail",
        "cognizable_status": "Statutory Relief",
        "key_change": "Major humanitarian reform: First-time offenders (never convicted previously) MUST be released on bail on bond upon serving one-third of the maximum imprisonment period."
    },
    {
        "id": 68,
        "old_act": "CrPC 1973",
        "old_section": "Section 437",
        "new_act": "BNSS 2023",
        "new_section": "Section 480",
        "offense_title": "When Bail May Be Taken in Case of Non-Bailable Offense by Magistrate",
        "category": "CrPC_BNSS",
        "status": "Active",
        "penalty_summary": "Magistrate discretion; favorable consideration for sick, infirm, women, and minors under 16",
        "bailable_status": "Judicial Discretion",
        "cognizable_status": "Non-Bailable Offenses",
        "key_change": "Harmonized with modern electronic bail bonds and deposit mechanisms."
    },
    {
        "id": 69,
        "old_act": "CrPC 1973",
        "old_section": "Section 438",
        "new_act": "BNSS 2023",
        "new_section": "Section 482",
        "offense_title": "Anticipatory Bail (Pre-Arrest Bail Direction)",
        "category": "CrPC_BNSS",
        "status": "Active",
        "penalty_summary": "Sessions Court or High Court direction to release on bail in the event of arrest",
        "bailable_status": "Equitable Discretion",
        "cognizable_status": "Non-Bailable Offenses",
        "key_change": "Sushila Aggarwal (2020) 5 SCC 1 doctrine embedded: anticipatory bail ordinarily continues until end of trial without mechanical time-limits."
    },
    {
        "id": 70,
        "old_act": "CrPC 1973",
        "old_section": "Section 439",
        "new_act": "BNSS 2023",
        "new_section": "Section 483",
        "offense_title": "Special Powers of High Court or Sessions Court Regarding Bail",
        "category": "CrPC_BNSS",
        "status": "Active",
        "penalty_summary": "Broad regular bail powers; notice to Public Prosecutor mandatory before grant",
        "bailable_status": "Superior Court Bail",
        "cognizable_status": "Superior Jurisdiction",
        "key_change": "Incorporates electronic surety verification and DigiLocker bond verification."
    },
    {
        "id": 71,
        "old_act": "CrPC 1973",
        "old_section": "Section 482",
        "new_act": "BNSS 2023",
        "new_section": "Section 528",
        "offense_title": "Inherent Powers of High Court to Quash FIRs and Proceedings",
        "category": "CrPC_BNSS",
        "status": "Active",
        "penalty_summary": "Power to quash malicious, frivolous, or non-cognizable proceedings to prevent abuse of process",
        "bailable_status": "Inherent Power",
        "cognizable_status": "High Court Jurisdiction",
        "key_change": "Preserves foundational Bhajan Lal (1992 Supp (1) SCC 335) seven-point guidelines while accommodating digital evidence audits."
    },
    {
        "id": 72,
        "old_act": "CrPC 1973",
        "old_section": "Section 320",
        "new_act": "BNSS 2023",
        "new_section": "Section 359",
        "offense_title": "Compounding of Offences",
        "category": "CrPC_BNSS",
        "status": "Active",
        "penalty_summary": "Table 1 (without court permission) and Table 2 (with court permission) acquittal upon settlement",
        "bailable_status": "Compounding Mechanism",
        "cognizable_status": "Mutual Dispute Resolution",
        "key_change": "Concordance table cross-referenced with BNS sections; Lok Adalat settlement directly results in acquittal."
    },
    {
        "id": 73,
        "old_act": "CrPC 1973",
        "old_section": "Section 125",
        "new_act": "BNSS 2023",
        "new_section": "Section 144",
        "offense_title": "Order for Maintenance of Wives, Children and Parents",
        "category": "CrPC_BNSS",
        "status": "Active",
        "penalty_summary": "Monthly maintenance allowance; interim maintenance within 60 days of notice",
        "bailable_status": "Social Welfare Remedy",
        "cognizable_status": "Summary Proceeding",
        "key_change": "Interim maintenance application must be decided within 60 days from the date of service of notice."
    },
    {
        "id": 74,
        "old_act": "CrPC 1973",
        "old_section": "Section 265A-265L",
        "new_act": "BNSS 2023",
        "new_section": "Section 289-300",
        "offense_title": "Plea Bargaining",
        "category": "CrPC_BNSS",
        "status": "Enhanced",
        "penalty_summary": "Application within 30 days of charges framed; mutually satisfactory disposition",
        "bailable_status": "Settlement Framework",
        "cognizable_status": "Offenses <= 7 Yrs",
        "key_change": "Strict 30-day timeline introduced from date of framing of charges to apply for plea bargaining."
    },
    {
        "id": 75,
        "old_act": "CrPC 1973",
        "old_section": "None (New Provision)",
        "new_act": "BNSS 2023",
        "new_section": "Section 356",
        "offense_title": "Inquiry, Trial or Judgment in Absentia of Proclaimed Offender",
        "category": "CrPC_BNSS",
        "status": "New Groundbreaking Power",
        "penalty_summary": "Trial and conviction can proceed even if the accused absconds or flees abroad",
        "bailable_status": "Anti-Fugitive Mandate",
        "cognizable_status": "Judicial Authority",
        "key_change": "Major procedural shift: When a proclaimed offender flees justice, the court may proceed with trial in absentia after 90 days and pronounce conviction/sentence."
    },
    {
        "id": 76,
        "old_act": "CrPC 1973",
        "old_section": "Section 353",
        "new_act": "BNSS 2023",
        "new_section": "Section 392",
        "offense_title": "Judgment Delivery Timeline (30 to 45 Days)",
        "category": "CrPC_BNSS",
        "status": "New Strict Timeline",
        "penalty_summary": "Judgment MUST be pronounced within 30 days (max 45 days for recorded reasons) from conclusion of arguments",
        "bailable_status": "Judicial Accountability",
        "cognizable_status": "Trial Conclusion",
        "key_change": "Strict statutory cap: Criminal courts must pronounce judgment within 30 days of concluding arguments (extendable to 45 days only with written reasons)."
    },

    # -------------------------------------------------------------------------
    # 7. IEA 1872 <-> BSA 2023: EVIDENCE, ELECTRONIC RECORDS & BURDEN OF PROOF
    # -------------------------------------------------------------------------
    {
        "id": 77,
        "old_act": "IEA 1872",
        "old_section": "Section 65B",
        "new_act": "BSA 2023",
        "new_section": "Section 63",
        "offense_title": "Admissibility of Electronic Records & Mandatory Certificate",
        "category": "IEA_BSA",
        "status": "Major Overhaul",
        "penalty_summary": "Electronic records treated as primary evidence if generated/stored in own computer; certificate mandatory for secondary copies",
        "bailable_status": "Evidentiary Standard",
        "cognizable_status": "Trial Admissibility",
        "key_change": "Revolutionary overhaul of Arjun Panditrao Khotkar (2020) 7 SCC 1. Section 63 defines electronic evidence admissibility, incorporates hash values, and allows production of original device as primary evidence under Section 57 without certificate."
    },
    {
        "id": 78,
        "old_act": "IEA 1872",
        "old_section": "Section 3 (Interpretation)",
        "new_act": "BSA 2023",
        "new_section": "Section 2(1)(d)",
        "offense_title": "Definition of 'Document' Including Electronic Records",
        "category": "IEA_BSA",
        "status": "Expanded",
        "penalty_summary": "Includes emails, server logs, mobile apps, SMS, cloud files, digital voicemails",
        "bailable_status": "Statutory Definition",
        "cognizable_status": "Universal Application",
        "key_change": "Electronic and digital records are placed on complete parity with physical paper documents as 'documents'."
    },
    {
        "id": 79,
        "old_act": "IEA 1872",
        "old_section": "Section 62",
        "new_act": "BSA 2023",
        "new_section": "Section 57",
        "offense_title": "Primary Evidence (Including Original Electronic Stored Devices)",
        "category": "IEA_BSA",
        "status": "Enhanced",
        "penalty_summary": "The document itself produced for inspection; digital device where file is created is primary",
        "bailable_status": "Highest Evidentiary Value",
        "cognizable_status": "Direct Admissibility",
        "key_change": "Explanation 4 to Section 57 BSA provides that where an electronic record is created or stored across multiple files/devices, each is primary evidence."
    },
    {
        "id": 80,
        "old_act": "IEA 1872",
        "old_section": "Section 63",
        "new_act": "BSA 2023",
        "new_section": "Section 58",
        "offense_title": "Secondary Evidence",
        "category": "IEA_BSA",
        "status": "Active",
        "penalty_summary": "Certified copies, copies made by mechanical processes, oral accounts of contents",
        "bailable_status": "Secondary Proof",
        "cognizable_status": "Conditional Admissibility",
        "key_change": "Includes digital prints, hash copies, and forensic image mirrors."
    },
    {
        "id": 81,
        "old_act": "IEA 1872",
        "old_section": "Section 25",
        "new_act": "BSA 2023",
        "new_section": "Section 23(1)",
        "offense_title": "Confession to Police Officer Not to be Proved",
        "category": "IEA_BSA",
        "status": "Active",
        "penalty_summary": "No confession made to a police officer shall be proved against accused person",
        "bailable_status": "Exclusionary Rule",
        "cognizable_status": "Trial Safeguard",
        "key_change": "Fundamental safeguard against custodial confessions strictly reaffirmed."
    },
    {
        "id": 82,
        "old_act": "IEA 1872",
        "old_section": "Section 27",
        "new_act": "BSA 2023",
        "new_section": "Section 23(2)",
        "offense_title": "Information Received from Accused Leading to Discovery",
        "category": "IEA_BSA",
        "status": "Active",
        "penalty_summary": "So much of information as relates distinctly to the fact thereby discovered may be proved",
        "bailable_status": "Exception to Inadmissibility",
        "cognizable_status": "Evidentiary Recovery",
        "key_change": "Pulukuri Kottaya doctrine preserved; audio-video recording of recovery encouraged under BNSS 105."
    },
    {
        "id": 83,
        "old_act": "IEA 1872",
        "old_section": "Section 32(1)",
        "new_act": "BSA 2023",
        "new_section": "Section 26(a)",
        "offense_title": "Dying Declaration",
        "category": "IEA_BSA",
        "status": "Active",
        "penalty_summary": "Statement made by person as to the cause of death is admissible without cross-examination",
        "bailable_status": "Substantive Evidence",
        "cognizable_status": "Admissibility Exception",
        "key_change": "Audio-video recorded dying declarations granted statutory recognition."
    },
    {
        "id": 84,
        "old_act": "IEA 1872",
        "old_section": "Section 45",
        "new_act": "BSA 2023",
        "new_section": "Section 39",
        "offense_title": "Opinions of Experts (Forensics, Digital Signatures, Ballistics)",
        "category": "IEA_BSA",
        "status": "Enhanced",
        "penalty_summary": "Opinion of examiners of electronic records, cyber forensics, and medical experts admissible",
        "bailable_status": "Expert Proof",
        "cognizable_status": "Scientific Evidence",
        "key_change": "Includes examiner of electronic evidence (Cert-In accredited examiners) under Section 79A IT Act."
    },
    {
        "id": 85,
        "old_act": "IEA 1872",
        "old_section": "Section 101 / 102",
        "new_act": "BSA 2023",
        "new_section": "Section 104 / 105",
        "offense_title": "Burden of Proof & On Whom Burden Lies",
        "category": "IEA_BSA",
        "status": "Active",
        "penalty_summary": "Whoever desires court to give judgment as to any legal right must prove facts asserted",
        "bailable_status": "Core Evidence Rule",
        "cognizable_status": "Civil & Criminal Trials",
        "key_change": "Preponderance of probabilities for civil; beyond reasonable doubt for criminal."
    },
    {
        "id": 86,
        "old_act": "IEA 1872",
        "old_section": "Section 113B",
        "new_act": "BSA 2023",
        "new_section": "Section 118",
        "offense_title": "Presumption as to Dowry Death",
        "category": "IEA_BSA",
        "status": "Active",
        "penalty_summary": "Mandatory presumption of dowry death if cruelty shown soon before death within 7 years of marriage",
        "bailable_status": "Reverse Burden of Proof",
        "cognizable_status": "Statutory Presumption",
        "key_change": "Statutory shift of burden onto the husband and family once basic harassment is proven."
    },
    {
        "id": 87,
        "old_act": "IEA 1872",
        "old_section": "Section 114A",
        "new_act": "BSA 2023",
        "new_section": "Section 119",
        "offense_title": "Presumption as to Absence of Consent in Certain Prosecutions for Rape",
        "category": "IEA_BSA",
        "status": "Active",
        "penalty_summary": "If victim states in her evidence that she did not consent, court shall presume absence of consent",
        "bailable_status": "Protective Presumption",
        "cognizable_status": "Trial Mandate",
        "key_change": "Non-negotiable evidentiary protection for victim testimony."
    },
    {
        "id": 88,
        "old_act": "IEA 1872",
        "old_section": "Section 115",
        "new_act": "BSA 2023",
        "new_section": "Section 121",
        "offense_title": "Estoppel",
        "category": "IEA_BSA",
        "status": "Active",
        "penalty_summary": "Party cannot deny truth of thing intentionally caused another to believe and act upon",
        "bailable_status": "Equitable Doctrine",
        "cognizable_status": "Commercial & Civil Proof",
        "key_change": "Applies to contractual representations and digital acceptance of terms."
    },
    {
        "id": 89,
        "old_act": "IEA 1872",
        "old_section": "Section 133",
        "new_act": "BSA 2023",
        "new_section": "Section 138",
        "offense_title": "Accomplice Evidence",
        "category": "IEA_BSA",
        "status": "Active",
        "penalty_summary": "An accomplice shall be a competent witness against an accused person",
        "bailable_status": "Competency Rule",
        "cognizable_status": "Pardon & Approver",
        "key_change": "Read with Section 119 illustration (b) requiring corroboration in material particulars."
    },
    {
        "id": 90,
        "old_act": "IEA 1872",
        "old_section": "Section 137 / 138",
        "new_act": "BSA 2023",
        "new_section": "Section 142 / 143",
        "offense_title": "Order of Examinations (Chief, Cross, Re-Examination)",
        "category": "IEA_BSA",
        "status": "Active",
        "penalty_summary": "Witness first examined-in-chief, then cross-examined, then re-examined",
        "bailable_status": "Trial Procedure",
        "cognizable_status": "Examination of Witnesses",
        "key_change": "Examination through video-conferencing explicitly authorized."
    },
    {
        "id": 91,
        "old_act": "IEA 1872",
        "old_section": "Section 154",
        "new_act": "BSA 2023",
        "new_section": "Section 159",
        "offense_title": "Hostile Witness (Questions by Party to His Own Witness)",
        "category": "IEA_BSA",
        "status": "Active",
        "penalty_summary": "Court may permit party calling witness to put questions which might be put in cross-examination",
        "bailable_status": "Trial Discretion",
        "cognizable_status": "Impeachment of Witness",
        "key_change": "Sub-section (2) clarifies that testimony of hostile witness is not discarded entirely and can be relied upon by either party."
    },
    {
        "id": 92,
        "old_act": "IEA 1872",
        "old_section": "Section 159",
        "new_act": "BSA 2023",
        "new_section": "Section 164",
        "offense_title": "Refreshing Memory by Writing or Electronic Record",
        "category": "IEA_BSA",
        "status": "Enhanced",
        "penalty_summary": "Witness may refresh memory by referring to contemporaneous writing or electronic device/file",
        "bailable_status": "Evidentiary Aid",
        "cognizable_status": "Examination Aid",
        "key_change": "Allows police officers, investigators, and doctors to refresh memory from digital case diaries and electronic medical records."
    },

    # -------------------------------------------------------------------------
    # 8. SAVINGS & TRANSITION CLAUSES (THE 2024 CRITICAL CONSTITUTIONAL RULES)
    # -------------------------------------------------------------------------
    {
        "id": 93,
        "old_act": "IPC 1860",
        "old_section": "Section 1-511 (All Sections)",
        "new_act": "BNS 2023",
        "new_section": "Section 358",
        "offense_title": "Repeal and Savings Clause of Bharatiya Nyaya Sanhita, 2023",
        "category": "SAVINGS_TRANSITION",
        "status": "Overarching Rule",
        "penalty_summary": "Acts committed on or before 30 June 2024 MUST be tried and punished under IPC 1860. BNS applies exclusively to acts committed on or after 1 July 2024.",
        "bailable_status": "Constitutional Mandate",
        "cognizable_status": "Substantive Law Rule",
        "key_change": "Protected by Article 20(1) of the Constitution (Prohibition of ex-post facto laws). No person can be convicted of an offense under BNS for an act committed before 1 July 2024."
    },
    {
        "id": 94,
        "old_act": "CrPC 1973",
        "old_section": "Section 1-484 (All Sections)",
        "new_act": "BNSS 2023",
        "new_section": "Section 531",
        "offense_title": "Repeal and Savings Clause of Bharatiya Nagarik Suraksha Sanhita, 2023",
        "category": "SAVINGS_TRANSITION",
        "status": "Overarching Rule",
        "penalty_summary": "Investigations, inquiries, trials, or appeals pending immediately before 1 July 2024 shall continue under CrPC 1973 as if BNSS had not come into force.",
        "bailable_status": "Procedural Rule",
        "cognizable_status": "Procedural Grandfathering",
        "key_change": "However, for any FIR or fresh criminal complaint instituted on or after 1 July 2024, the investigation and bail procedure MUST follow BNSS 2023, even if the offense was committed under IPC 1860."
    },
    {
        "id": 95,
        "old_act": "IEA 1872",
        "old_section": "Section 1-167 (All Sections)",
        "new_act": "BSA 2023",
        "new_section": "Section 170",
        "offense_title": "Repeal and Savings Clause of Bharatiya Sakshya Adhiniyam, 2023",
        "category": "SAVINGS_TRANSITION",
        "status": "Overarching Rule",
        "penalty_summary": "Any certificate, declaration or proceeding initiated prior to 1 July 2024 remains valid; all evidence tendered in trials post 1 July 2024 is governed by BSA 2023.",
        "bailable_status": "Evidentiary Standard",
        "cognizable_status": "Procedural Standard",
        "key_change": "Electronic evidence filed in court proceedings on or after 1 July 2024 should comply with Section 63 BSA certificate format."
    },
    {
        "id": 96,
        "old_act": "Constitution",
        "old_section": "Article 20(1)",
        "new_act": "Constitution",
        "new_section": "Article 20(1)",
        "offense_title": "Protection Against Ex-Post Facto Criminal Laws",
        "category": "SAVINGS_TRANSITION",
        "status": "Supreme Constitutional Protection",
        "penalty_summary": "No person shall be convicted of any offence except for violation of a law in force at the time of the commission of the act.",
        "bailable_status": "Fundamental Right",
        "cognizable_status": "Non-Derogable",
        "key_change": "Supreme bar stopping police from invoking newly created BNS offenses (e.g. Section 69, Section 103(2), Section 304 Snatching) for events occurring prior to 1 July 2024."
    },
    {
        "id": 97,
        "old_act": "IPC 1860",
        "old_section": "Section 279",
        "new_act": "BNS 2023",
        "new_section": "Section 281",
        "offense_title": "Rash Driving or Riding on a Public Way",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Up to 6 months imprisonment or fine up to ₹1,000 or both",
        "bailable_status": "Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Retains standard traffic rash driving provisions."
    },
    {
        "id": 98,
        "old_act": "IPC 1860",
        "old_section": "Section 337 / 338",
        "new_act": "BNS 2023",
        "new_section": "Section 125(a) & (b)",
        "offense_title": "Causing Hurt or Grievous Hurt by Act Endangering Life or Personal Safety",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Hurt: up to 6 months; Grievous hurt: up to 3 years or fine or both",
        "bailable_status": "Bailable",
        "cognizable_status": "Cognizable",
        "key_change": "Commonly invoked alongside Section 281 in road accident cases."
    },
    {
        "id": 99,
        "old_act": "IPC 1860",
        "old_section": "Section 427",
        "new_act": "BNS 2023",
        "new_section": "Section 324(4)",
        "offense_title": "Mischief Causing Damage to Amount of ₹20,000 to ₹1 Lakh",
        "category": "IPC_BNS",
        "status": "Enhanced",
        "penalty_summary": "Up to 2 years or fine or both",
        "bailable_status": "Bailable",
        "cognizable_status": "Non-Cognizable",
        "key_change": "Colonial ₹50 damage threshold updated to realistic modern economic loss brackets (₹20,000 to ₹1,00,000)."
    },
    {
        "id": 100,
        "old_act": "IPC 1860",
        "old_section": "Section 504",
        "new_act": "BNS 2023",
        "new_section": "Section 352",
        "offense_title": "Intentional Insult with Intent to Provoke Breach of the Peace",
        "category": "IPC_BNS",
        "status": "Active",
        "penalty_summary": "Up to 2 years imprisonment or fine or both",
        "bailable_status": "Bailable",
        "cognizable_status": "Non-Cognizable",
        "key_change": "Standard provision in verbal altercations, tenancy disputes, and public altercations."
    }
]


class StatutoryConcordanceService:
    """
    Service for fast search, bi-directional lookup, and transition date advice across 100+ provisions.
    """

    TRANSITION_CUTOFF = date(2024, 7, 1)

    @classmethod
    def search(cls, query_str: Optional[str] = None, category_filter: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
        results = CONCORDANCE_MASTER_DATA
        if category_filter and category_filter != "ALL":
            results = [r for r in results if r.get("category") == category_filter]

        if not query_str or not query_str.strip():
            return results[:limit]

        q = query_str.lower().strip()
        filtered = []
        for r in results:
            match = (
                q in r["old_section"].lower() or
                q in r["new_section"].lower() or
                q in r["offense_title"].lower() or
                q in r["old_act"].lower() or
                q in r["new_act"].lower() or
                q in (r.get("key_change") or "").lower()
            )
            if match:
                filtered.append(r)

        return filtered[:limit]

    @classmethod
    def evaluate_transition_date(cls, incident_date_str: str) -> Dict[str, Any]:
        """
        Calculates whether IPC/CrPC or BNS/BNSS applies for a given date of incident.
        Cites Section 358 BNS, Section 531 BNSS, and Article 20(1) Constitution.
        """
        try:
            # Try parsing various date formats
            dt = None
            for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%Y/%m/%d", "%d.%m.%Y"):
                try:
                    dt = datetime.strptime(incident_date_str.strip(), fmt).date()
                    break
                except ValueError:
                    pass

            if not dt:
                # Year-only check (e.g. "2023", "2024", "2025")
                if incident_date_str.strip().isdigit() and len(incident_date_str.strip()) == 4:
                    year = int(incident_date_str.strip())
                    dt = date(year, 1, 1) if year < 2024 else date(year, 7, 2)
                else:
                    return {
                        "status": "error",
                        "message": "Invalid date format. Please provide date as YYYY-MM-DD or DD/MM/YYYY."
                    }

            is_pre_july_2024 = dt < cls.TRANSITION_CUTOFF

            if is_pre_july_2024:
                return {
                    "status": "success",
                    "incident_date": dt.isoformat(),
                    "regime": "PRE_JULY_2024_COLONIAL_LAWS",
                    "substantive_law": "Indian Penal Code, 1860 (IPC)",
                    "procedural_law": (
                        "BNSS 2023 for investigation and bail if FIR filed post-July 1, 2024 (Section 531 BNSS); "
                        "CrPC 1973 if FIR/trial was already pending before July 1, 2024."
                    ),
                    "evidence_law": "Bharatiya Sakshya Adhiniyam, 2023 (for evidence produced in trial today) / IEA 1872 for past certificates",
                    "governing_savings_section": "Section 358(1) & (2) of Bharatiya Nyaya Sanhita, 2023",
                    "constitutional_safeguard": "Article 20(1) Constitution of India (Absolute prohibition against ex-post facto penal prosecution)",
                    "actionable_instruction": (
                        f"Because the offence occurred on {dt.strftime('%d %B %Y')} (prior to 1 July 2024), the police or court "
                        f"MUST charge the accused under the relevant sections of the Indian Penal Code, 1860 (e.g. Section 420 for cheating, "
                        f"Section 302 for murder). Charging under BNS 2023 is unconstitutional and liable to be quashed under Section 528 BNSS."
                    )
                }
            else:
                return {
                    "status": "success",
                    "incident_date": dt.isoformat(),
                    "regime": "POST_JULY_2024_MODERN_SANHITAS",
                    "substantive_law": "Bharatiya Nyaya Sanhita, 2023 (BNS)",
                    "procedural_law": "Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
                    "evidence_law": "Bharatiya Sakshya Adhiniyam, 2023 (BSA)",
                    "governing_savings_section": "Section 1(2) BNS 2023 & Ministry of Home Affairs Gazette S.O. 850(E)",
                    "constitutional_safeguard": "Law in force on the date of commission",
                    "actionable_instruction": (
                        f"Because the offence occurred on {dt.strftime('%d %B %Y')} (on or after 1 July 2024), the Indian Penal Code (IPC) "
                        f"is completely superseded. The FIR, charge-sheet, and court summons must strictly cite the Bharatiya Nyaya Sanhita, 2023 "
                        f"(e.g. Section 318 for cheating, Section 103 for murder) and follow BNSS procedural rules."
                    )
                }
        except Exception as e:
            return {"status": "error", "message": f"Date evaluation failed: {str(e)}"}
