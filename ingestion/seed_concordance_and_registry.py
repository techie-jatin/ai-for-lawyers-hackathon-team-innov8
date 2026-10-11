import os
import sys

# Ensure root and backend directories are in sys.path
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
backend_dir = os.path.join(root_dir, "backend")
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.db.session import engine, SessionLocal
from app.db.base_class import Base
from app.models.legal import StatutoryConcordance, GazetteNotification, LegalHelpline, ChamberDossier

CONCORDANCE_DATA = [
    # Offenses against Property & Fraud
    {
        "old_act": "IPC 1860", "old_section": "IPC 420",
        "new_act": "BNS 2023", "new_section": "BNS § 318(4)",
        "offense_title": "Cheating and dishonestly inducing delivery of property",
        "status": "Active", "penalty_summary": "Imprisonment up to 7 years and fine",
        "bailable_status": "Non-Bailable", "cognizable_status": "Cognizable",
        "key_change": "Directly mapped to Section 318 Clause 4. Retains 7-year imprisonment standard."
    },
    {
        "old_act": "IPC 1860", "old_section": "IPC 378 / 379",
        "new_act": "BNS 2023", "new_section": "BNS § 303(2)",
        "offense_title": "Theft",
        "status": "Active", "penalty_summary": "Imprisonment up to 3 years or fine or both",
        "bailable_status": "Non-Bailable", "cognizable_status": "Cognizable",
        "key_change": "Community service option introduced for first-time petty theft under ₹5,000 upon return."
    },
    {
        "old_act": "IPC 1860", "old_section": "IPC None (New Offense)",
        "new_act": "BNS 2023", "new_section": "BNS § 304",
        "offense_title": "Snatching (Theft with sudden, quick or forcible seizure)",
        "status": "Active", "penalty_summary": "Rigorous imprisonment up to 3 years and fine",
        "bailable_status": "Non-Bailable", "cognizable_status": "Cognizable",
        "key_change": "Newly codified distinct offense in BNS addressing street snatching previously charged under IPC 379."
    },
    {
        "old_act": "IPC 1860", "old_section": "IPC 405 / 406",
        "new_act": "BNS 2023", "new_section": "BNS § 316",
        "offense_title": "Criminal breach of trust",
        "status": "Active", "penalty_summary": "Imprisonment up to 5 years (increased from 3 yrs in IPC 406)",
        "bailable_status": "Non-Bailable", "cognizable_status": "Cognizable",
        "key_change": "Base punishment enhanced from 3 years under colonial IPC to 5 years under BNS 316(2)."
    },
    {
        "old_act": "IPC 1860", "old_section": "IPC 463 / 465 / 468",
        "new_act": "BNS 2023", "new_section": "BNS § 336 / 338",
        "offense_title": "Forgery & Forgery for purpose of cheating",
        "status": "Active", "penalty_summary": "Imprisonment up to 7 years and fine",
        "bailable_status": "Non-Bailable", "cognizable_status": "Cognizable",
        "key_change": "Explicitly codifies electronic records, digital signatures, and metadata tampering."
    },
    {
        "old_act": "IPC 1860", "old_section": "IPC 383 / 384",
        "new_act": "BNS 2023", "new_section": "BNS § 308",
        "offense_title": "Extortion",
        "status": "Active", "penalty_summary": "Imprisonment up to 7 years or fine or both",
        "bailable_status": "Non-Bailable", "cognizable_status": "Cognizable",
        "key_change": "Subsumes blackmail through cyber publication of private intimate media."
    },

    # Offenses against Human Body & Life
    {
        "old_act": "IPC 1860", "old_section": "IPC 300 / 302",
        "new_act": "BNS 2023", "new_section": "BNS § 103(1)",
        "offense_title": "Murder",
        "status": "Active", "penalty_summary": "Death or imprisonment for life, and liable to fine",
        "bailable_status": "Non-Bailable", "cognizable_status": "Cognizable",
        "key_change": "Moved from iconic IPC 302 to BNS 103(1). Definitions of intention and knowledge retained."
    },
    {
        "old_act": "IPC 1860", "old_section": "IPC None (New Offense)",
        "new_act": "BNS 2023", "new_section": "BNS § 103(2)",
        "offense_title": "Mob Lynching (Murder by group of five or more on grounds of race, caste, sex)",
        "status": "Active", "penalty_summary": "Death or imprisonment for life and fine",
        "bailable_status": "Non-Bailable", "cognizable_status": "Cognizable",
        "key_change": "Historic separate penalization of hate-motivated group lynching with capital punishment parity."
    },
    {
        "old_act": "IPC 1860", "old_section": "IPC 299 / 304",
        "new_act": "BNS 2023", "new_section": "BNS § 105",
        "offense_title": "Culpable homicide not amounting to murder",
        "status": "Active", "penalty_summary": "Life imprisonment or imprisonment up to 10 years and fine",
        "bailable_status": "Non-Bailable", "cognizable_status": "Cognizable",
        "key_change": "Re-numbered to Section 105 with identical subjective fault thresholds."
    },
    {
        "old_act": "IPC 1860", "old_section": "IPC 304A",
        "new_act": "BNS 2023", "new_section": "BNS § 106(1) & (2)",
        "offense_title": "Causing death by negligence / Hit and Run",
        "status": "Enhanced", "penalty_summary": "Up to 5 yrs (rash driving); Up to 10 yrs if driver escapes without reporting",
        "bailable_status": "Bailable (106(1)) / Non-Bailable (106(2))", "cognizable_status": "Cognizable",
        "key_change": "Stringent 10-year penalty for failing to report crash to police/magistrate immediately."
    },
    {
        "old_act": "IPC 1860", "old_section": "IPC 319 / 323",
        "new_act": "BNS 2023", "new_section": "BNS § 115",
        "offense_title": "Voluntarily causing hurt",
        "status": "Active", "penalty_summary": "Imprisonment up to 1 year, or fine up to ₹10,000, or both",
        "bailable_status": "Bailable", "cognizable_status": "Non-Cognizable",
        "key_change": "Fine limit significantly increased from ₹1,000 in colonial IPC to ₹10,000."
    },
    {
        "old_act": "IPC 1860", "old_section": "IPC 320 / 325",
        "new_act": "BNS 2023", "new_section": "BNS § 117",
        "offense_title": "Voluntarily causing grievous hurt",
        "status": "Active", "penalty_summary": "Imprisonment up to 7 years and fine",
        "bailable_status": "Bailable", "cognizable_status": "Cognizable",
        "key_change": "Includes permanent disfigurement, bone fracture, or 15 days severe bodily pain."
    },
    {
        "old_act": "IPC 1860", "old_section": "IPC 375 / 376",
        "new_act": "BNS 2023", "new_section": "BNS § 64",
        "offense_title": "Rape",
        "status": "Active", "penalty_summary": "Rigorous imprisonment not less than 10 years, up to life imprisonment",
        "bailable_status": "Non-Bailable", "cognizable_status": "Cognizable",
        "key_change": "Moved to beginning of chapter on Crimes against Women & Children."
    },
    {
        "old_act": "IPC 1860", "old_section": "IPC None (New Offense)",
        "new_act": "BNS 2023", "new_section": "BNS § 69",
        "offense_title": "Sexual intercourse by deceitful means / false promise of marriage",
        "status": "Active", "penalty_summary": "Imprisonment up to 10 years and fine",
        "bailable_status": "Non-Bailable", "cognizable_status": "Cognizable",
        "key_change": "Explicit statutory codification of deceptive inducement without bona fide marital intent."
    },

    # State Security, Sovereignty & Organized Crime
    {
        "old_act": "IPC 1860", "old_section": "IPC 124A (Sedition)",
        "new_act": "BNS 2023", "new_section": "BNS § 152",
        "offense_title": "Act endangering sovereignty, unity and integrity of India",
        "status": "Substituted", "penalty_summary": "Imprisonment for life or up to 7 years, and fine",
        "bailable_status": "Non-Bailable", "cognizable_status": "Cognizable",
        "key_change": "Colonial 'Sedition' concept removed; replaced with targeted protection of sovereignty."
    },
    {
        "old_act": "IPC 1860", "old_section": "IPC None (New Chapter)",
        "new_act": "BNS 2023", "new_section": "BNS § 111",
        "offense_title": "Organized Crime (Syndicate violence, cyber trafficking, extortion)",
        "status": "Active", "penalty_summary": "Death or Life imprisonment (if death caused); otherwise min 5 yrs up to life",
        "bailable_status": "Non-Bailable", "cognizable_status": "Cognizable",
        "key_change": "Central statutory baseline akin to MCOCA applying across all states in India."
    },
    {
        "old_act": "IPC 1860", "old_section": "IPC None (New Offense)",
        "new_act": "BNS 2023", "new_section": "BNS § 113",
        "offense_title": "Terrorist Act",
        "status": "Active", "penalty_summary": "Death or Life imprisonment; fine not less than ₹10 Lakhs",
        "bailable_status": "Non-Bailable", "cognizable_status": "Cognizable",
        "key_change": "Codified inside general penal code alongside the specialized UAPA enactment."
    },

    # Public Order, Defamation & Misconduct
    {
        "old_act": "IPC 1860", "old_section": "IPC 499 / 500",
        "new_act": "BNS 2023", "new_section": "BNS § 356",
        "offense_title": "Defamation",
        "status": "Active", "penalty_summary": "Simple imprisonment up to 2 years, or with fine, or with community service",
        "bailable_status": "Bailable", "cognizable_status": "Non-Cognizable",
        "key_change": "Community service option introduced as a progressive rehabilitative judicial remedy."
    },
    {
        "old_act": "IPC 1860", "old_section": "IPC 503 / 506",
        "new_act": "BNS 2023", "new_section": "BNS § 351",
        "offense_title": "Criminal intimidation",
        "status": "Active", "penalty_summary": "Imprisonment up to 2 years, or with fine, or both",
        "bailable_status": "Bailable", "cognizable_status": "Non-Cognizable",
        "key_change": "Includes digital intimidation and threats communicated over encrypted channels."
    },

    # Procedural Concordance (CrPC ➔ BNSS 2023)
    {
        "old_act": "CrPC 1973", "old_section": "CrPC 154",
        "new_act": "BNSS 2023", "new_section": "BNSS § 173",
        "offense_title": "Information in cognizable cases (FIR / Zero-FIR / e-FIR)",
        "status": "Active", "penalty_summary": "Statutory right to lodge Zero-FIR irrespective of jurisdictional boundaries",
        "bailable_status": "Procedural", "cognizable_status": "Cognizable Mandate",
        "key_change": "Zero FIR statutorily mandated; electronic FIR permitted with signature verification in 3 days."
    },
    {
        "old_act": "CrPC 1973", "old_section": "CrPC 41 / 41A",
        "new_act": "BNSS 2023", "new_section": "BNSS § 35",
        "offense_title": "When police may arrest without warrant & Notice of Appearance",
        "status": "Active", "penalty_summary": "Prior DSP permission required for infirm/elderly or petty offenses under 3 yrs",
        "bailable_status": "Procedural", "cognizable_status": "Safeguard Mandate",
        "key_change": "Arrest guidelines reinforced with mandatory prior senior officer sanction in minor offenses."
    },
    {
        "old_act": "CrPC 1973", "old_section": "CrPC 167",
        "new_act": "BNSS 2023", "new_section": "BNSS § 187",
        "offense_title": "Procedure when investigation cannot be completed in 24 hours (Remand)",
        "status": "Enhanced", "penalty_summary": "Police custody of 15 days permitted in tranches across initial 40 or 60 days",
        "bailable_status": "Procedural", "cognizable_status": "Judicial Oversight",
        "key_change": "Overturns CBI v. Anupam Kulkarni precedent: custody can now be taken in split periods."
    },
    {
        "old_act": "CrPC 1973", "old_section": "CrPC 438",
        "new_act": "BNSS 2023", "new_section": "BNSS § 482",
        "offense_title": "Direction for grant of bail to person apprehending arrest (Anticipatory Bail)",
        "status": "Active", "penalty_summary": "High Court / Sessions Court equitable power to protect liberty",
        "bailable_status": "Procedural", "cognizable_status": "Apex Discretion",
        "key_change": "Section number moved from 438 to 482; grounds and jurisdictional powers preserved."
    },
    {
        "old_act": "CrPC 1973", "old_section": "CrPC 437 / 439",
        "new_act": "BNSS 2023", "new_section": "BNSS § 480 / 483",
        "offense_title": "Regular Bail in non-bailable offenses",
        "status": "Active", "penalty_summary": "Statutory discretion of Magistrate (480) & Sessions/High Court (483)",
        "bailable_status": "Procedural", "cognizable_status": "Bail Discretion",
        "key_change": "Explicit mandates for compassionate consideration for women, sick, or infirm undertrials."
    },
    {
        "old_act": "CrPC 1973", "old_section": "CrPC 436A",
        "new_act": "BNSS 2023", "new_section": "BNSS § 479",
        "offense_title": "Maximum period for which an undertrial prisoner can be detained",
        "status": "Enhanced", "penalty_summary": "First-time offenders eligible for release on personal bond after 1/3rd term",
        "bailable_status": "Procedural", "cognizable_status": "Human Rights",
        "key_change": "Liberalized undertrial relief: first-time offenders released after one-third period instead of half."
    },
    {
        "old_act": "CrPC 1973", "old_section": "CrPC 100",
        "new_act": "BNSS 2023", "new_section": "BNSS § 105",
        "offense_title": "Recording of search and seizure through audio-video electronic means",
        "status": "Active", "penalty_summary": "Mandatory videography on phones/cameras during searches and seizures",
        "bailable_status": "Procedural", "cognizable_status": "Integrity Shield",
        "key_change": "Police must record panchnama / seizures via electronic device and submit without delay."
    },

    # Evidence Concordance (IEA 1872 ➔ BSA 2023)
    {
        "old_act": "IEA 1872", "old_section": "IEA 65B",
        "new_act": "BSA 2023", "new_section": "BSA § 63",
        "offense_title": "Admissibility of electronic records and certificates",
        "status": "Active", "penalty_summary": "Primary legal status for cloud, mobile, and cryptographic logs",
        "bailable_status": "Evidentiary", "cognizable_status": "Admissibility Standard",
        "key_change": "Electronic records formally placed on equal legal footing with paper documents."
    },
    {
        "old_act": "IEA 1872", "old_section": "IEA 62 / 63",
        "new_act": "BSA 2023", "new_section": "BSA § 57 / 58",
        "offense_title": "Primary evidence and Secondary evidence definition",
        "status": "Active", "penalty_summary": "Digital records stored across server clouds categorized as primary evidence",
        "bailable_status": "Evidentiary", "cognizable_status": "Judicial Proof",
        "key_change": "Each simultaneous copy produced in digital storage recognized as primary evidence."
    }
]
GAZETTE_DATA = [
    {
        "ministry": "Ministry of Electronics & IT",
        "notification_ref": "MEITY GAZETTE NOTIFICATION G.S.R. 28(E) / 2026",
        "title": "Digital Personal Data Protection (DPDP) Enforcement & DPBI Operational Regulations 2026",
        "effective_date": "Jan 2026",
        "category": "Statutory Rules & Gazette of India",
        "summary": "Formally operationalizes the Data Protection Board of India (DPBI) digital adjudication portal under Section 18 of DPDP Act 2023. Mandates 72-hour algorithmic audit disclosures, child verifiable parental consent protocols under Section 9, and enforceable financial penalties up to ₹250 Crores for significant data fiduciaries.",
        "official_url": "https://meity.gov.in"
    },
    {
        "ministry": "Ministry of Home Affairs",
        "notification_ref": "MHA NOTIFICATION S.O. 412(E) / 2026",
        "title": "Inter-Operable Criminal Justice System (ICJS 2.0) & Section 530 BNSS Electronic Summons & Audio-Video Protocol 2026",
        "effective_date": "Feb 2026",
        "category": "Standard Operating Procedure",
        "summary": "Mandates across all state police directorates that e-summons, digital notices under Section 35(3) BNSS, and search/seizure audio-video recordings under Section 105 BNSS must be cryptographically hashed (SHA-256) and verified via the national CCTNS/e-Sakshya cloud repository within 48 hours to preserve chain of custody.",
        "official_url": "https://mha.gov.in"
    },
    {
        "ministry": "Supreme Court of India",
        "notification_ref": "SCI PRACTICE DIRECTION NO. 04 / 2026",
        "title": "Mandatory Dual-Citation Concordance & Section 63 BSA Digital Evidence Compliance in All Courts",
        "effective_date": "Mar 2026",
        "category": "Apex Court Practice Direction",
        "summary": "Directs all criminal courts across India that trial courts shall not reject electronic evidence on mere formal defects if accompanied by a Section 63 BSA electronic certificate matching hash metadata. Further clarifies that Section 479 BNSS (undertrial release on 1/3rd term) applies retrospectively to all undertrial proceedings pending across Indian prisons.",
        "official_url": "https://main.sci.gov.in"
    },
    {
        "ministry": "Central Consumer Protection Authority",
        "notification_ref": "CCPA GAZETTE REGULATION F.NO. J-25/01/2026",
        "title": "Prevention and Regulation of Dark Patterns & AI Deceptive Commercial Practices in Digital Consumer Interfaces 2026",
        "effective_date": "Apr 2026",
        "category": "Consumer Protection Regulations",
        "summary": "Notifies strict enforcement standards under Section 18 of Consumer Protection Act 2019 prohibiting deceptive UI patterns ('forced continuity', 'drip pricing', AI bot misrepresentation as humans, and non-cancellable subscriptions). Imposes immediate product recall orders and statutory restitution.",
        "official_url": "https://consumeraffairs.nic.in"
    },
    {
        "ministry": "Ministry of Home Affairs",
        "notification_ref": "MHA NOTIFICATION S.O. 850(E)",
        "title": "e-Evidence Digital Forensics Protocol under Bharatiya Sakshya Adhiniyam, 2023",
        "effective_date": "Feb 2025",
        "category": "Standard Operating Procedure",
        "summary": "Mandates cryptographic hash verification (SHA-256) for all body-worn camera footages, seized smartphone memory dumps, and CCTV transcripts presented in criminal trials.",
        "official_url": "https://mha.gov.in"
    },
    {
        "ministry": "Ministry of Electronics & IT",
        "notification_ref": "MEITY REGULATION G.S.R. 114",
        "title": "Draft Data Protection Board Procedures & Timelines under DPDP Act 2023",
        "effective_date": "Jan 2025",
        "category": "Statutory Rules",
        "summary": "Prescribes 72-hour mandatory breach notification window to Data Protection Board of India and impacted data principals. Sets penalty benchmarks under Section 33 Schedule.",
        "official_url": "https://meity.gov.in"
    },
    {
        "ministry": "Supreme Court of India",
        "notification_ref": "SCI CIRCULAR NO. 12/2024",
        "title": "Dual Filing Guidelines: Quoting IPC Alongside BNS in Judicial Petitions",
        "effective_date": "Dec 2024",
        "category": "Registry Practice Direction",
        "summary": "Directs all High Court registries and Apex Court advocates to cite corresponding colonial sections in brackets alongside Bharatiya Sanhitas during the 3-year transitional window.",
        "official_url": "https://main.sci.gov.in"
    },
    {
        "ministry": "Ministry of Law & Justice",
        "notification_ref": "LAW MIN GAZETTE S.O. 312(E)",
        "title": "Transition Rules for Criminal Inquiries Registered Prior to July 1, 2024",
        "effective_date": "July 2024",
        "category": "Statutory Notification",
        "summary": "Clarifies that investigations and FIRs registered prior to 00:00 hrs of 1 July 2024 shall be substantive under IPC 1860, while procedure shall follow BNSS 2023 guidelines.",
        "official_url": "https://lawmin.gov.in"
    }
]

HELPLINE_DATA = [
    {
        "category": "Legal Aid",
        "service_name": "National Legal Services Authority (NALSA)",
        "short_code": "15100",
        "hours": "24/7 (All India Toll-Free)",
        "description": "Free and competent legal services to eligible citizens, women, children, and undertrial prisoners under Section 12 of LSA Act 1987.",
        "jurisdiction": "All India (Central & State DLSAs)"
    },
    {
        "category": "Cyber Emergency",
        "service_name": "National Cyber Crime Reporting Helpline",
        "short_code": "1930",
        "hours": "24/7 (All India Toll-Free)",
        "description": "Immediate financial fraud interception, freezing stolen bank amounts, and reporting identity theft or non-consensual imagery.",
        "jurisdiction": "All India (I4C Ministry of Home Affairs)"
    },
    {
        "category": "Women Safety",
        "service_name": "National Commission for Women Emergency Helpline",
        "short_code": "1091 / 181",
        "hours": "24/7 (All India Toll-Free)",
        "description": "Support, police rescue, shelter, and medical/legal triage for women experiencing domestic violence or harassment.",
        "jurisdiction": "All India (Ministry of WCD)"
    },
    {
        "category": "Consumer Grievance",
        "service_name": "National Consumer Dispute Redressal Helpline (NCH)",
        "short_code": "1915",
        "hours": "8:00 AM - 8:00 PM (Mon - Sat)",
        "description": "Filing e-Daakhil consumer complaints against unfair trade practices, warranty fraud, and e-commerce deficiencies under CPA 2019.",
        "jurisdiction": "All India (Dept of Consumer Affairs)"
    },
    {
        "category": "Emergency Response",
        "service_name": "Emergency Response Support System (ERSS)",
        "short_code": "112",
        "hours": "24/7 (All India Toll-Free)",
        "description": "Unified emergency number integrating Police (100), Fire (101), and Ambulance (102) across all States & UTs.",
        "jurisdiction": "All India (Central MHA)"
    },
    {
        "category": "Child Welfare",
        "service_name": "CHILDLINE Emergency Rescue",
        "short_code": "1098",
        "hours": "24/7 (All India Toll-Free)",
        "description": "Nationwide emergency phone outreach for children in need of care, protection, and rescue from exploitation.",
        "jurisdiction": "All India (Ministry of WCD)"
    },
    {
        "category": "Senior Citizens",
        "service_name": "National Helpline for Senior Citizens (Elderline)",
        "short_code": "14567",
        "hours": "8:00 AM - 8:00 PM (All 7 Days)",
        "description": "Legal guidance on Maintenance and Welfare of Parents and Senior Citizens Act 2007, abuse redressal, and shelter support.",
        "jurisdiction": "All India (Ministry of Social Justice)"
    },
    {
        "category": "Mental Health",
        "service_name": "National Tele-Mental Health Assistance (Tele-MANAS)",
        "short_code": "14416",
        "hours": "24/7 (All India Toll-Free)",
        "description": "Free psychological triage and emotional crisis counseling for distressed individuals and crime victims.",
        "jurisdiction": "All India (Ministry of Health)"
    }
]

def seed():
    print("Creating tables in database if they do not exist...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Seed Concordance
        print(f"Checking Statutory Concordances (Total data points: {len(CONCORDANCE_DATA)})...")
        existing_conc = db.query(StatutoryConcordance).count()
        if existing_conc < len(CONCORDANCE_DATA):
            db.query(StatutoryConcordance).delete()
            for c in CONCORDANCE_DATA:
                db.add(StatutoryConcordance(**c))
            db.commit()
            print(f"-> Seeded {len(CONCORDANCE_DATA)} statutory concordance mappings.")
        else:
            print(f"-> Statutory concordances already populated ({existing_conc} mappings).")

        # 2. Seed Gazette Notifications
        print(f"Checking Gazette Notifications (Total data points: {len(GAZETTE_DATA)})...")
        existing_gaz = db.query(GazetteNotification).count()
        if existing_gaz < len(GAZETTE_DATA):
            db.query(GazetteNotification).delete()
            for g in GAZETTE_DATA:
                db.add(GazetteNotification(**g))
            db.commit()
            print(f"-> Seeded {len(GAZETTE_DATA)} official gazette circulars.")
        else:
            print(f"-> Gazette circulars already populated ({existing_gaz} records).")

        # 3. Seed Helplines
        print(f"Checking Legal Helplines (Total data points: {len(HELPLINE_DATA)})...")
        existing_help = db.query(LegalHelpline).count()
        if existing_help < len(HELPLINE_DATA):
            db.query(LegalHelpline).delete()
            for h in HELPLINE_DATA:
                db.add(LegalHelpline(**h))
            db.commit()
            print(f"-> Seeded {len(HELPLINE_DATA)} legal helplines.")
        else:
            print(f"-> Legal helplines already populated ({existing_help} records).")

        # 4. Seed Initial Chamber Dossiers if empty
        existing_dossiers = db.query(ChamberDossier).count()
        if existing_dossiers == 0:
            sample_dossiers = [
                {
                    "docket_number": "#CR-2025-084",
                    "title": "Chamber Dossier: Anticipatory Bail Arguments under BNSS 482",
                    "category": "Criminal Law (BNS)",
                    "mode": "professional",
                    "initial_query": "Grounds for anticipatory bail under BNSS Section 482 when police issue notice under Section 35",
                    "legal_summary": "Under BNSS Section 482 (old CrPC 438), the Sessions and High Court maintain equitable jurisdiction to shield personal liberty under Article 21 where arrest is not mandated under Section 35(3).",
                    "applicable_sections": ["BNSS § 482", "BNSS § 35", "Constitution Art. 21", "Arnesh Kumar (2014) 8 SCC 273"],
                    "notes": "File petition before Sessions Judge Chamber 4 on Monday with supporting medical records."
                },
                {
                    "docket_number": "#DP-2025-019",
                    "title": "Corporate Compliance: DPDP Section 33 Breach Disclosure Memo",
                    "category": "DPDP Compliance",
                    "mode": "professional",
                    "initial_query": "What are the statutory reporting requirements and penalties under Section 33 of DPDP Act 2023?",
                    "legal_summary": "Section 33 Schedule prescribes maximum statutory penalty of ₹250 Crores for failure to take reasonable security safeguards. Mandatory notification required to Data Protection Board of India.",
                    "applicable_sections": ["DPDP Act § 8(6)", "DPDP Act § 33 Schedule Item 1"],
                    "notes": "Advise client board to audit database logging mechanisms within 72-hour window."
                }
            ]
            for d in sample_dossiers:
                db.add(ChamberDossier(**d))
            db.commit()
            print("-> Seeded 2 initial chamber dossiers.")

        print("\nSUCCESS: All structured legal intelligence assets synchronized with database!")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed()
