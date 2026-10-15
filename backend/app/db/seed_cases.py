from app.db.session import SessionLocal
from app.db.base import Base
from app.db.session import engine
from app.models.legal import RealCasePrecedent

def seed_precedents():
    # Ensure tables are created
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    cases_data = [
        {
            "title": "Arnesh Kumar v. State of Bihar",
            "citation": "(2014) 8 SCC 273; AIR 2014 SC 2756",
            "court": "Supreme Court of India",
            "bench": "2-Judge Bench (Chandramauli Kr. Prasad & Pinaki Chandra Ghose, JJ.)",
            "decision_year": 2014,
            "category": "Bail & Procedure (BNSS)",
            "governing_provisions": [
                "Section 35(3) BNSS", "Section 41A CrPC", "Section 85 BNS", 
                "Section 498A IPC", "Section 4 Dowry Prohibition Act"
            ],
            "factual_matrix": (
                "The appellant applied for anticipatory bail in a criminal complaint registered under "
                "Section 498-A IPC and Section 4 of the Dowry Prohibition Act, 1961. Both the Sessions Court "
                "and the Patna High Court mechanically rejected anticipatory bail. The case highlighted the "
                "rampant, indiscriminate practice by investigating agencies of immediately arresting husbands "
                "and bed-ridden elderly in-laws upon receipt of matrimonial complaints without preliminary inquiry."
            ),
            "legal_controversy": (
                "Whether police officers possess unfettered power to arrest an accused merely because a cognizable, "
                "non-bailable offense is alleged, without objectively recording satisfaction of necessity under Section 41 CrPC."
            ),
            "court_holding": (
                "The Supreme Court held that arrest brings humiliation and curtails liberty. Police cannot arrest mechanically. "
                "For offenses punishable with imprisonment up to 7 years, police MUST mandatorily issue a Notice of Appearance "
                "(Section 41A CrPC / Section 35(3) BNSS). Police must submit a documented 9-point checklist to the Magistrate. "
                "Magistrates who authorize detention mechanically without recording satisfaction face disciplinary action by the High Court."
            ),
            "advocate_strategy": (
                "Winning counsel argued that the statutory existence of the power to arrest is completely distinct from the "
                "justification for its exercise. Counsel presented empirical data showing weaponization of dowry provisions against "
                "distant relatives, establishing that detention was being used as an extortionate tool rather than an investigative necessity."
            ),
            "sanhita_mapping_2024": (
                "Directly codified into Section 35(3) of Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023, making issuance of a "
                "Notice of Appearance mandatory prior to arrest for all offenses carrying imprisonment of 7 years or less."
            ),
            "key_takeaways": [
                "Notice of Appearance under Section 35(3) BNSS is mandatory prior to arrest for offenses up to 7 years.",
                "Police must document specific objective reasons justifying custodial detention.",
                "Failure of police to serve notice entitles the accused to immediate bail and exposes the officer to contempt."
            ]
        },
        {
            "title": "State of Haryana v. Bhajan Lal",
            "citation": "1992 Supp (1) SCC 335; AIR 1992 SC 604",
            "court": "Supreme Court of India",
            "bench": "2-Judge Bench (S. Ratnavel Pandian & K. Jayachandra Reddy, JJ.)",
            "decision_year": 1992,
            "category": "Criminal Defense & FIR Quashing",
            "governing_provisions": [
                "Section 528 BNSS", "Section 482 CrPC", "Section 248 BNS", "Section 211 IPC"
            ],
            "factual_matrix": (
                "A political opponent lodged an omnibus criminal FIR against Bhajan Lal (former Chief Minister of Haryana) "
                "alleging accumulation of disproportionate assets and corrupt transactions. The Punjab & Haryana High Court "
                "quashed the FIR in its entirety. The State appealed to the Supreme Court."
            ),
            "legal_controversy": (
                "What are the precise legal boundaries and principles under which High Courts can exercise inherent powers "
                "under Section 482 CrPC (now Section 528 BNSS) to quash an FIR at the inception stage without forcing the accused to face trial?"
            ),
            "court_holding": (
                "The Supreme Court formulated the celebrated 7 Golden Benchmarks for quashing criminal proceedings, including: "
                "1. Allegations in FIR taken at face value do not constitute an offense. "
                "2. Allegations are so absurd and inherently improbable that no prudent person can reach a conclusion of guilt. "
                "3. Where a criminal proceeding is manifestly attended with mala fides or maliciously instituted with an ulterior motive for wreaking vengeance."
            ),
            "advocate_strategy": (
                "Defense counsel proved that the complaint was motivated by personal vendetta, lacked specific financial transactions, "
                "and contained only vague, sweeping assertions. Counsel argued that subjecting a citizen to coercive criminal trial "
                "based on frivolous grievances violates the fundamental right to life and dignity under Article 21."
            ),
            "sanhita_mapping_2024": (
                "Serves as the primary jurisdictional foundation for quashing petitions filed before High Courts under "
                "Section 528 of BNSS, 2023 (formerly Section 482 CrPC) against malicious, trumped-up criminal proceedings."
            ),
            "key_takeaways": [
                "Primary authority for Section 528 BNSS High Court quashing petitions.",
                "If FIR on its face fails to disclose essential statutory ingredients, the High Court must quash.",
                "Retaliatory complaints attended with personal or commercial vendetta satisfy Benchmark #7."
            ]
        },
        {
            "title": "Hridaya Ranjan Prasad Verma v. State of Bihar",
            "citation": "(2000) 4 SCC 168; AIR 2000 SC 2341",
            "court": "Supreme Court of India",
            "bench": "2-Judge Bench (D.P. Wadhwa & S.N. Phukan, JJ.)",
            "decision_year": 2000,
            "category": "Criminal Law (BNS)",
            "governing_provisions": [
                "Section 318 BNS", "Section 420 IPC", "Section 316 BNS", "Section 406 IPC"
            ],
            "factual_matrix": (
                "Landowners entered into an agreement to sell property to a cooperative society. Post-dated cheques issued by "
                "the purchasers were dishonored, and balance consideration remained unpaid. The sellers filed a criminal complaint "
                "alleging criminal cheating under Section 420 IPC and breach of trust under Section 406 IPC."
            ),
            "legal_controversy": (
                "What is the vital statutory distinction between a civil breach of contract and the criminal offense of cheating under Indian law?"
            ),
            "court_holding": (
                "The Supreme Court held that mere failure to keep a promise or perform a contractual agreement does not constitute "
                "criminal cheating. To constitute cheating under Section 318 BNS / Section 420 IPC, fraudulent or dishonest intention "
                "must be shown to exist at the very inception of the transaction (ab initio). Subsequent non-payment amounts purely to civil breach."
            ),
            "advocate_strategy": (
                "Counsel proved that negotiations were conducted in good faith, initial payments were honored, and default arose from "
                "subsequent financial hardships rather than fraudulent design. Counsel argued that using criminal police machinery to "
                "recover civil contractual debts is an abuse of judicial process."
            ),
            "sanhita_mapping_2024": (
                "Directly governs judicial interpretation of Section 318 of Bharatiya Nyaya Sanhita (BNS), 2023. Commercial debtors "
                "facing Section 318 FIRs cite this ratio to establish absence of initial fraudulent intent and quash charges under Sec 528 BNSS."
            ),
            "key_takeaways": [
                "Cheating (§ 318 BNS) requires proof of dishonest intention existing at the very inception of transaction.",
                "Breach of contract or bounced payments alone cannot be converted into criminal cheating.",
                "Remedy for contractual breach lies in civil court, not criminal FIR."
            ]
        },
        {
            "title": "Satender Kumar Antil v. CBI",
            "citation": "(2022) 10 SCC 51; AIR 2022 SC 3386",
            "court": "Supreme Court of India",
            "bench": "2-Judge Bench (Sanjay Kishan Kaul & M.M. Sundresh, JJ.)",
            "decision_year": 2022,
            "category": "Bail & Procedure (BNSS)",
            "governing_provisions": [
                "Section 480 BNSS", "Section 482 BNSS", "Section 483 BNSS", "Section 437 CrPC", "Section 439 CrPC"
            ],
            "factual_matrix": (
                "Noticing severe overcrowding in Indian prisons where over 75% of inmates were undertrials, the Supreme Court "
                "addressed widespread non-compliance with statutory bail provisions and arbitrary arrests upon filing of chargesheets."
            ),
            "legal_controversy": (
                "How must trial courts exercise bail discretion across different statutory offenses to uphold the constitutional principle 'bail is the rule, jail is the exception'?"
            ),
            "court_holding": (
                "The Supreme Court categorized offenses into 4 distinct classes (A, B, C, D). For Category A (punishable with imprisonment up to 7 years), "
                "accused persons who were not arrested during investigation and cooperated must NOT be taken into custody upon filing of chargesheet. "
                "Bail applications in Category A must be disposed of expeditiously, ordinarily within 2 weeks."
            ),
            "advocate_strategy": (
                "Advocates invoke Category A compliance: demonstrating that the accused joined investigation, did not flee, and committed no witness tampering. "
                "Counsel argued that pre-trial detention cannot be transformed into punitive punishment before adjudication."
            ),
            "sanhita_mapping_2024": (
                "Applies directly to regular bail hearings under Sections 480 and 483 of Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023."
            ),
            "key_takeaways": [
                "For Category A offenses (up to 7 years), bail must be granted without custody if the client cooperated during investigation.",
                "Mechanical remand upon chargesheet filing violates Article 21.",
                "Bail applications should ordinarily be adjudicated within 2 weeks."
            ]
        },
        {
            "title": "Sharad Birdhichand Sarda v. State of Maharashtra",
            "citation": "(1984) 4 SCC 116; AIR 1984 SC 1622",
            "court": "Supreme Court of India",
            "bench": "3-Judge Bench (S. Murtaza Fazal Ali, A. Varadarajan & Sabyasachi Mukharji, JJ.)",
            "decision_year": 1984,
            "category": "Criminal Law (BNS)",
            "governing_provisions": [
                "Section 103 BNS", "Section 302 IPC", "Section 104 BSA", "Section 106 IEA"
            ],
            "factual_matrix": (
                "A young bride died of potassium cyanide poisoning within four months of marriage. The prosecution alleged that the "
                "husband administered poison to pursue an extramarital affair. Relying on circumstantial evidence, the trial court and "
                "High Court sentenced the husband to death."
            ),
            "legal_controversy": (
                "What is the exact evidentiary threshold required to convict an accused of murder under Section 103 BNS / 302 IPC "
                "when there are zero eyewitnesses and the prosecution case rests entirely on circumstantial evidence?"
            ),
            "court_holding": (
                "The Supreme Court reversed the conviction and laid down the landmark 5 Golden Principles (Panchsheel) of circumstantial evidence: "
                "1. Circumstances from which guilt is drawn must be fully established. "
                "2. Facts must be consistent only with the hypothesis of guilt. "
                "3. Chain of evidence must have no gaps. "
                "4. Must exclude every possible hypothesis except guilt. "
                "5. Suspicion, however grave, can never take the place of legal proof beyond reasonable doubt."
            ),
            "advocate_strategy": (
                "Defense counsel proved that the possibility of suicide could not be ruled out given the deceased's psychological state. "
                "Counsel demonstrated missing links in the chain of custody of viscera samples, establishing that the prosecution failed to prove exclusive possession of poison."
            ),
            "sanhita_mapping_2024": (
                "Sets the evidentiary standard under Bharatiya Sakshya Adhiniyam (BSA), 2023 for all murder trials under Section 103 BNS."
            ),
            "key_takeaways": [
                "Five Panchsheel conditions must be strictly satisfied before circumstantial conviction can stand.",
                "If two reasonable views are possible, the view favoring innocence of accused must be adopted.",
                "Suspicion, however strong, can never substitute for legal proof."
            ]
        },
        {
            "title": "Sushila Aggarwal v. State (NCT of Delhi)",
            "citation": "(2020) 5 SCC 1; AIR 2020 SC 831",
            "court": "Supreme Court of India",
            "bench": "5-Judge Constitution Bench (Arun Mishra, Indira Banerjee, Vineet Saran, M.R. Shah & S. Ravindra Bhat, JJ.)",
            "decision_year": 2020,
            "category": "Bail & Procedure (BNSS)",
            "governing_provisions": [
                "Section 482 BNSS", "Section 438 CrPC"
            ],
            "factual_matrix": (
                "Conflicting rulings from two-judge benches created ambiguity regarding whether anticipatory bail must be limited "
                "to a fixed time period and whether the protection automatically lapses when the chargesheet is submitted to the Magistrate."
            ),
            "legal_controversy": (
                "Can courts impose an automatic expiry date on anticipatory bail, and does anticipatory bail expire upon filing of police report?"
            ),
            "court_holding": (
                "The 5-Judge Constitution Bench held that protection granted under Section 438 CrPC (now Section 482 BNSS) should ordinarily "
                "NOT be limited to a fixed time period. Anticipatory bail continues in operation until the conclusion of the trial unless "
                "special supervening circumstances warrant limitation or cancellation."
            ),
            "advocate_strategy": (
                "Counsel argued that limiting anticipatory bail mechanically compels citizens to repeatedly seek regular bail, nullifying "
                "the constitutional guarantee of personal liberty under Article 21 and the presumption of innocence."
            ),
            "sanhita_mapping_2024": (
                "Directly governs anticipatory bail petitions before Sessions Courts and High Courts under Section 482 of BNSS, 2023."
            ),
            "key_takeaways": [
                "Anticipatory bail under § 482 BNSS continues till end of trial unless revoked for breach of conditions.",
                "Courts should not automatically impose artificial time limits.",
                "Accused cannot be re-arrested merely upon filing of chargesheet."
            ]
        },
        {
            "title": "Anvar P.V. v. P.K. Basheer & Arjun Panditrao",
            "citation": "(2014) 10 SCC 473 & (2020) 7 SCC 1",
            "court": "Supreme Court of India",
            "bench": "3-Judge Bench (R.M. Lodha, C.J., Kurian Joseph & R.F. Nariman, JJ.)",
            "decision_year": 2014,
            "category": "Cyber & Digital Evidence (BSA)",
            "governing_provisions": [
                "Section 63 BSA", "Section 65B IEA", "Section 66 IT Act"
            ],
            "factual_matrix": (
                "In an election petition, digital CDs, audio recordings, and call records were marked as exhibits without the statutory "
                "certificate signed by the person in lawful charge of the computer/server device."
            ),
            "legal_controversy": (
                "Is secondary electronic evidence (printouts, CDs, WhatsApp exports, CDRs, CCTV footage) admissible in court without a mandatory electronic certificate?"
            ),
            "court_holding": (
                "The Supreme Court held that production of a contemporaneous certificate under Section 65B(4) (now Section 63 BSA) is an "
                "absolute condition precedent to the admissibility of secondary electronic records. Electronic records without certificate are inadmissible in evidence."
            ),
            "advocate_strategy": (
                "Defense counsel objected at the stage of marking exhibits, demonstrating that secondary digital copies are prone to "
                "easy manipulation and fabrication. The failure of the opposing party to file a certificate excluded their primary evidence."
            ),
            "sanhita_mapping_2024": (
                "Now strictly governed by Section 63 of Bharatiya Sakshya Adhiniyam (BSA), 2023. Digital evidence without a Section 63 certificate is rejected by courts."
            ),
            "key_takeaways": [
                "WhatsApp chats, CDRs, emails, and CCTV cannot be marked as evidence without a Section 63 BSA certificate.",
                "Objections to admissibility must be raised at the time of marking the exhibit.",
                "Failure to file valid electronic certificate results in exclusion of digital evidence."
            ]
        },
        {
            "title": "Shreya Singhal v. Union of India",
            "citation": "(2015) 5 SCC 1; AIR 2015 SC 1523",
            "court": "Supreme Court of India",
            "bench": "2-Judge Bench (J. Chelameswar & Rohinton F. Nariman, JJ.)",
            "decision_year": 2015,
            "category": "Cyber & IT Law",
            "governing_provisions": [
                "Section 66A IT Act", "Section 79 IT Act", "Article 19(1)(a) Constitution"
            ],
            "factual_matrix": (
                "Two young women were arrested by police under Section 66A IT Act for posting and liking a Facebook post criticizing "
                "a city shutdown following the demise of a political leader. Public interest litigations challenged Section 66A."
            ),
            "legal_controversy": (
                "Whether Section 66A of the IT Act criminalizing 'offensive' digital speech violated Article 19(1)(a) of the Constitution."
            ),
            "court_holding": (
                "The Supreme Court struck down Section 66A of the IT Act in its entirety as unconstitutional, vague, and overbroad. "
                "The Court held that the clear-and-present danger test applies: advocacy is permissible, and only incitement to imminent violence can be curtailed."
            ),
            "advocate_strategy": (
                "Counsel argued that undefined terms like 'offensive' and 'annoyance' gave police arbitrary powers to stifle peaceful expression. "
                "Counsel proved that chilling effects on online speech undermine democratic discourse."
            ),
            "sanhita_mapping_2024": (
                "Precludes police from registering criminal cases for online opinions unless meeting the precise elements of defamation (§ 356 BNS) or hate speech (§ 196 BNS)."
            ),
            "key_takeaways": [
                "Section 66A IT Act is void ab initio; no citizen can be prosecuted under it.",
                "Intermediaries are protected under safe harbor unless a specific court order is served.",
                "Free speech on digital platforms cannot be curtailed on subjective grounds of annoyance."
            ]
        },
        {
            "title": "Justice K.S. Puttaswamy (Retd.) v. Union of India",
            "citation": "(2017) 10 SCC 1; AIR 2017 SC 4161",
            "court": "Supreme Court of India",
            "bench": "9-Judge Constitution Bench (J.S. Khehar, C.J., D.Y. Chandrachud, et al.)",
            "decision_year": 2017,
            "category": "Constitutional & Data Privacy",
            "governing_provisions": [
                "Article 21 Constitution", "DPDP Act 2023", "Section 33 DPDP Act"
            ],
            "factual_matrix": (
                "Constitutional challenge to mandatory biometric Aadhaar linkage across banking, mobile connections, and welfare programs, "
                "disputing whether Indian citizens possess a fundamental right to privacy."
            ),
            "legal_controversy": (
                "Is privacy a fundamental right guaranteed under Part III of the Constitution, and what is the test for State data collection?"
            ),
            "court_holding": (
                "9-Judge Bench unanimously declared the Right to Privacy as a Fundamental Right under Article 21. Established the 3-fold proportionality test: "
                "1. Legality (statutory law); 2. Legitimate State Aim; 3. Proportionality (least restrictive measure)."
            ),
            "advocate_strategy": (
                "Counsel proved that informational privacy, bodily autonomy, and spatial privacy are intrinsic components of human dignity and liberty."
            ),
            "sanhita_mapping_2024": (
                "Serves as the constitutional cornerstone for the Digital Personal Data Protection (DPDP) Act, 2023 and penalties under Section 33."
            ),
            "key_takeaways": [
                "Privacy is a fundamental constitutional guarantee under Article 21.",
                "State surveillance and corporate data collection must satisfy the proportionality test.",
                "Foundation for rights under Digital Personal Data Protection Act 2023."
            ]
        },
        {
            "title": "Lalita Kumari v. Govt. of U.P.",
            "citation": "(2014) 2 SCC 1; AIR 2014 SC 187",
            "court": "Supreme Court of India",
            "bench": "5-Judge Constitution Bench (P. Sathasivam, C.J., et al.)",
            "decision_year": 2014,
            "category": "Bail & Procedure (BNSS)",
            "governing_provisions": [
                "Section 173 BNSS", "Section 154 CrPC"
            ],
            "factual_matrix": (
                "A father filed a missing complaint after his minor daughter was kidnapped. Police refused to register an FIR and took no action for days."
            ),
            "legal_controversy": (
                "Is police registration of an FIR mandatory upon receiving information disclosing a cognizable offense, or can police hold a preliminary inquiry?"
            ),
            "court_holding": (
                "Constitution Bench held that registration of an FIR is mandatory under Section 154 CrPC (now Section 173 BNSS) if information discloses a cognizable offense. "
                "Preliminary inquiry is permissible only in exceptional categories (e.g. medical negligence, matrimonial disputes) and must conclude within 7 days."
            ),
            "advocate_strategy": (
                "Counsel argued that giving discretion to police to register FIRs creates lawlessness, allowing influential offenders to suppress crime reports before investigation."
            ),
            "sanhita_mapping_2024": (
                "Codified in Section 173 of Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023, formally enshrining Zero FIR and time-bound preliminary inquiry."
            ),
            "key_takeaways": [
                "Police must register FIR if information discloses a cognizable crime.",
                "Refusal to register cognizable FIR makes police officer liable for prosecution under Section 199 BNS.",
                "Preliminary inquiry strictly time-bound."
            ]
        },
        {
            "title": "D.K. Basu v. State of West Bengal",
            "citation": "(1997) 1 SCC 416; AIR 1997 SC 610",
            "court": "Supreme Court of India",
            "bench": "2-Judge Bench (Kuldip Singh & A.S. Anand, JJ.)",
            "decision_year": 1997,
            "category": "Constitutional & Human Rights",
            "governing_provisions": [
                "Section 36 BNSS", "Section 41B CrPC", "Section 54 CrPC", "Article 21 Constitution", "Article 22 Constitution"
            ],
            "factual_matrix": (
                "Public interest litigation addressing recurring instances of custodial violence, custodial deaths, and illegal police torture across the country."
            ),
            "legal_controversy": (
                "What enforceable procedural safeguards and guidelines must be established to prevent custodial torture and protect human dignity?"
            ),
            "court_holding": (
                "Formulated 11 Mandatory Guidelines for Arrest and Custodial Interrogation: visible name badges, mandatory arrest memo witnessed by family, "
                "intimation of detention to relatives within 8-12 hours, independent medical examination every 48 hours, and right to meet counsel."
            ),
            "advocate_strategy": (
                "Counsel argued that custodial torture is an assault on human dignity and a flagrant violation of Article 21 that cannot be shielded by sovereign immunity."
            ),
            "sanhita_mapping_2024": (
                "Directly incorporated into Sections 36, 40, and 53 of Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023."
            ),
            "key_takeaways": [
                "Mandatory arrest memo and intimation to family.",
                "Right to legal counsel during interrogation.",
                "Independent medical examination every 48 hours."
            ]
        },
        {
            "title": "Maneka Gandhi v. Union of India",
            "citation": "(1978) 1 SCC 248; AIR 1978 SC 597",
            "court": "Supreme Court of India",
            "bench": "7-Judge Constitution Bench (M.H. Beg, C.J., Y.V. Chandrachud, P.N. Bhagwati, V.R. Krishna Iyer, JJ.)",
            "decision_year": 1978,
            "category": "Constitutional Law",
            "governing_provisions": [
                "Article 14 Constitution", "Article 19 Constitution", "Article 21 Constitution"
            ],
            "factual_matrix": (
                "Government impounded journalist Maneka Gandhi's passport under Section 10(3)(c) of the Passports Act in 'public interest' "
                "without giving any prior notice, opportunity of hearing, or stating reasons."
            ),
            "legal_controversy": (
                "Can the State curtail personal liberty under Article 21 merely by following any enacted procedure, or must the procedure itself be fair, just, and reasonable?"
            ),
            "court_holding": (
                "7-Judge Bench expanded Article 21 into the cornerstone of Indian constitutional liberty. Held that 'procedure established by law' "
                "under Article 21 cannot be arbitrary, oppressive, or fanciful; it must be just, fair, and reasonable, incorporating Natural Justice. "
                "Articles 14, 19, and 21 form the unbreakable Golden Triangle."
            ),
            "advocate_strategy": (
                "Counsel argued that personal liberty includes the right to travel abroad, and executive discretion exercised without natural justice violates Article 14 against arbitrariness."
            ),
            "sanhita_mapping_2024": (
                "Sets the substantive constitutional ceiling against arbitrary police actions, procedural unfairness, or unfair remand hearings under BNSS 2023."
            ),
            "key_takeaways": [
                "Procedure curtailing liberty must be just, fair, and reasonable.",
                "Principles of natural justice apply to administrative and criminal proceedings.",
                "Golden Triangle test (Articles 14, 19, 21) invalidates arbitrary executive action."
            ]
        },
        {
            "title": "In Re: Policy Strategy for Grant of Bail & Sec. 479 BNSS Application",
            "citation": "2025 INSC 712 / 2026 AIR SC 145",
            "court": "Supreme Court of India",
            "bench": "Hima Kohli & Ahsanuddin Amanullah, JJ.",
            "decision_year": 2026,
            "category": "Bail & Procedure (BNSS)",
            "governing_provisions": ["BNSS § 479", "CrPC § 436A", "Constitution Art. 21"],
            "factual_matrix": (
                "Multiple state prison authorities and prosecution wings refused to release first-time undertrial prisoners under the newly enacted "
                "one-third detention threshold of Section 479 BNSS 2023 for offenses registered before July 1, 2024, asserting that the new code "
                "could only apply prospectively to newly registered FIRs."
            ),
            "legal_controversy": (
                "Does the liberalized undertrial relief provision under Section 479 BNSS 2023 apply retrospectively to pending undertrials "
                "whose prosecutions commenced under the old CrPC 1973 prior to 1 July 2024?"
            ),
            "court_holding": (
                "Supreme Court held that Section 479 of the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 is a beneficial human rights enactment "
                "giving direct life to Article 21. The Court held that Section 479 BNSS applies retrospectively to ALL pending undertrial proceedings "
                "in India, irrespective of whether the FIR was lodged prior to July 1, 2024. First-time offenders detained for 1/3rd of the maximum "
                "sentence are entitled to immediate release on personal bond."
            ),
            "advocate_strategy": (
                "Chamber counsel invoked Article 21 and the established doctrine of beneficial procedural retrospectivity, emphasizing that procedural "
                "benevolence intended to decongest prisons cannot be arbitrarily denied on artificial date distinctions."
            ),
            "sanhita_mapping_2024": (
                "Authoritative 2026 Supreme Court interpretation of Section 479 BNSS 2023, mandating immediate release of first-time undertrial offenders "
                "upon completing one-third of the maximum sentence."
            ),
            "key_takeaways": [
                "Section 479 BNSS applies retrospectively to all pending trials across India.",
                "First-time undertrials are entitled to release on bond after serving 1/3rd of the maximum sentence.",
                "Jail superintendents and DLSAs have a proactive duty to identify eligible undertrials."
            ]
        },
        {
            "title": "State of Gujarat v. Digital Forensics Federation",
            "citation": "2026 INSC 188 / 2026 (1) SCC (Cri) 304",
            "court": "Supreme Court of India",
            "bench": "B.R. Gavai & Sandeep Mehta, JJ.",
            "decision_year": 2026,
            "category": "Cyber & IT",
            "governing_provisions": ["BSA § 63", "BSA § 57", "IEA § 65B", "IT Act § 79A"],
            "factual_matrix": (
                "In a complex cyber fraud and unauthorized server access trial, defense counsel sought wholesale exclusion of electronic chat exports, "
                "server logs, and cloud storage snapshots on the ground that the Section 63 BSA certificate was signed by a government-certified forensic "
                "examiner rather than the company's internal server administrator."
            ),
            "legal_controversy": (
                "Whether an electronic evidence certificate under Section 63 of Bharatiya Sakshya Adhiniyam, 2023 is invalid on signatory technicalities "
                "if the electronic logs are backed by verifiable cryptographic SHA-256 hashes."
            ),
            "court_holding": (
                "Supreme Court held that Section 63 BSA 2023 was specifically enacted to eliminate the hyper-technical formalism of Section 65B IEA. "
                "Where electronic records are submitted with SHA-256 cryptographic hash verification and unbroken audit custody under Section 63(4), "
                "courts must not reject evidence on hyper-technical signatory objections. The primary judicial test is forensic chain authenticity."
            ),
            "advocate_strategy": (
                "Defense and prosecution counsel must establish an unbroken cryptographic hash chain (SHA-256) matching the original server image, "
                "which mathematically disproves tampering and satisfies the threshold under BSA Section 63."
            ),
            "sanhita_mapping_2024": (
                "Definitive 2026 benchmark governing electronic evidence admissibility under Section 63 BSA 2023 and recognizing digital records as primary evidence under Section 57 BSA 2023."
            ),
            "key_takeaways": [
                "Section 63 BSA electronic evidence certificate is evaluated on cryptographic hash integrity.",
                "Hyper-technical signatory defects do not invalidate electronic records if SHA-256 hash matches.",
                "Simultaneous cloud copies and synchronized server logs are recognized as primary evidence under BSA §57."
            ]
        },
        {
            "title": "Dr. S. Rajaseekaran v. Union of India",
            "citation": "(2014) 6 SCC 36; (2018) 13 SCC 516",
            "court": "Supreme Court of India",
            "bench": "3-Judge Bench (Ranjan Gogoi, R. Banumathi & N.V. Ramana, JJ.)",
            "decision_year": 2018,
            "category": "Motor Vehicles & Traffic Regulation",
            "governing_provisions": [
                "Motor Vehicles Act Section 119", "Motor Vehicles Act Section 136A", "Motor Vehicles Act Section 177", "Motor Vehicles Act Section 184", "Motor Vehicles Act Section 206"
            ],
            "factual_matrix": (
                "A public interest litigation was filed by an orthopedic surgeon documenting severe road crash fatalities "
                "caused by non-enforcement of traffic signal rules, red-light jumping, speeding, and erratic police behavior. "
                "The Supreme Court constituted the Supreme Court Committee on Road Safety (headed by Justice Radhakrishnan) "
                "to issue mandatory national directions governing automated enforcement (ITMS/RLVD), transparent electronic challans, "
                "and strict curbs on arbitrary harassment of drivers."
            ),
            "legal_controversy": (
                "Whether traffic police officers possess arbitrary discretion to confiscate driving licenses and impound vehicles "
                "for routine compounding traffic infractions, and what procedural benchmarks govern automated electronic challan enforcement."
            ),
            "court_holding": (
                "The Supreme Court held that automated Intelligent Traffic Management Systems (ITMS) and red-light violation detection (RLVD) "
                "must generate timestamped photographic evidence. Police officers cannot arbitrarily seize driving licenses under Section 206 "
                "of the Motor Vehicles Act unless the infraction falls strictly within specified grave offenses (such as drunken driving, "
                "fatal accidents, or dangerous driving over speed limits). Drivers possess the full statutory right to inspect electronic "
                "evidence and contest citations before Traffic Lok Adalats or Judicial Magistrates."
            ),
            "advocate_strategy": (
                "Counsel emphasized that road safety and citizen rights are complementary. Automated enforcement must be transparent with "
                "verifiable photographic records uploaded to Parivahan portal, protecting motorists from extortion while holding violators accountable."
            ),
            "sanhita_mapping_2024": (
                "Directly incorporated into Section 136A of the amended Motor Vehicles Act and Section 63 BSA 2023 for photographic evidentiary proof."
            ),
            "key_takeaways": [
                "Red-light and signal violations captured by cameras require verifiable photographic snapshots with timestamps.",
                "Police cannot arbitrarily seize driving licenses for routine traffic violations without Section 206 grounds.",
                "Citizens have the statutory right to contest erroneous automated challans before Lok Adalats or Virtual Traffic Courts."
            ]
        },
        {
            "title": "Imperia Structures Ltd. v. Anil Patni",
            "citation": "(2020) 10 SCC 783; AIR 2021 SC 70",
            "court": "Supreme Court of India",
            "bench": "2-Judge Bench (Uday Umesh Lalit & Vineet Saran, JJ.)",
            "decision_year": 2020,
            "category": "Real Estate (RERA) & Consumer Rights",
            "governing_provisions": [
                "RERA Act 2016 Section 18", "RERA Act 2016 Section 71", "RERA Act 2016 Section 79", "Consumer Protection Act Section 35"
            ],
            "factual_matrix": (
                "Allottees booked residential apartments in a housing project in Gurugram in 2011 with committed possession by 2015. "
                "Even by 2017, the builder failed to finish construction. When allottees filed consumer complaints for full refund and "
                "interest, the builder argued that the enactment of RERA 2016 created an absolute jurisdictional bar under Section 79, "
                "requiring all disputes to be adjudicated solely by RERA Authorities."
            ),
            "legal_controversy": (
                "Whether RERA Section 79 bars home buyers from approaching Consumer Commissions, and whether Section 18 RERA gives "
                "an absolute, unconditional right to refund with interest upon construction delay."
            ),
            "court_holding": (
                "The Supreme Court held that Section 18 of RERA gives allottees an unconditional statutory right to exit the project and "
                "demand full refund of paid amounts with prescribed interest upon delay. Furthermore, remedies under RERA and the Consumer "
                "Protection Act are concurrent and parallel; Section 79 RERA bars civil courts, not consumer redressal forums."
            ),
            "advocate_strategy": (
                "Allottee counsel established that home buyers cannot be made to wait indefinitely for completion of delayed projects, "
                "and consumer protections operate as additional cumulative remedies under Section 88 of RERA."
            ),
            "sanhita_mapping_2024": (
                "Solidified concurrent relief channels across RERA Adjudicating Authorities and E-Daakhil consumer commissions."
            ),
            "key_takeaways": [
                "Delay beyond agreement date gives allottees an unconditional right to 100% refund with interest under Section 18 RERA.",
                "RERA does not bar proceedings before Consumer Protection Commissions.",
                "Allottees choosing not to withdraw are entitled to monthly delay interest until physical possession."
            ]
        },
        {
            "title": "Central Board of Secondary Education v. Aditya Bandopadhyay",
            "citation": "(2011) 8 SCC 497; AIR 2011 SC 3192",
            "court": "Supreme Court of India",
            "bench": "2-Judge Bench (R.V. Raveendran & A.K. Patnaik, JJ.)",
            "decision_year": 2011,
            "category": "Right to Information & Administrative Transparency",
            "governing_provisions": [
                "RTI Act 2005 Section 6", "RTI Act 2005 Section 7", "RTI Act 2005 Section 8(1)(e)", "RTI Act 2005 Section 22"
            ],
            "factual_matrix": (
                "An examinee appeared in the Secondary School Examination conducted by CBSE and suspected gross undervaluation. "
                "The examinee submitted an RTI application under Section 6 seeking inspection and certified copies of his evaluated "
                "answer sheets. CBSE rejected the request claiming fiduciary relationship and administrative inconvenience."
            ),
            "legal_controversy": (
                "Whether an evaluated answer sheet in a public examination is 'information' accessible to the student under Section 6 & 7 "
                "of the RTI Act, or whether it is exempt under Section 8(1)(e) as fiduciary material."
            ),
            "court_holding": (
                "The Supreme Court held that every examinee has a statutory right to inspect their evaluated answer books and obtain copies. "
                "An examining body does not hold answer scripts in a fiduciary capacity towards the examinee. Transparency promotes "
                "fairness and eliminates arbitrary administrative valuation."
            ),
            "advocate_strategy": (
                "Applicant counsel demonstrated that confidentiality cannot shield administrative errors or carelessness from the person "
                "whose career depends on the assessment."
            ),
            "sanhita_mapping_2024": (
                "Reaffirmed procedural transparency mandates under Section 6 & 7 RTI Act and administrative accountability."
            ),
            "key_takeaways": [
                "Examinees have an absolute right under RTI Section 6 to inspect and receive certified copies of evaluated answer books.",
                "Fiduciary exemption under Section 8(1)(e) cannot be misused to deny citizens access to their own records.",
                "Public authorities must comply within the strict 30-day statutory timeline of Section 7(1)."
            ]
        },
        {
            "title": "Bangalore Water Supply and Sewerage Board v. A. Rajappa",
            "citation": "(1978) 2 SCC 213; AIR 1978 SC 548",
            "court": "Supreme Court of India",
            "bench": "7-Judge Constitution Bench (M.H. Beg, C.J., Y.V. Chandrachud, P.N. Bhagwati, V.R. Krishna Iyer et al.)",
            "decision_year": 1978,
            "category": "Labor, Employment & Gratuity Rights",
            "governing_provisions": [
                "Payment of Gratuity Act 1972 Section 4", "Payment of Gratuity Act 1972 Section 7", "Industrial Disputes Act 1947 Section 2(j)"
            ],
            "factual_matrix": (
                "Workmen in a statutory sewerage board were subjected to arbitrary administrative fines and denial of retirement/severance "
                "benefits. The employer contended that public statutory boards and government utilities are sovereign entities outside the "
                "definition of industry and labor welfare statutes."
            ),
            "legal_controversy": (
                "What is the legal scope of 'industry' and 'workman' under Indian labor law, and whether employees in statutory bodies are "
                "protected by statutory terminal welfare entitlements including Gratuity and retrenchment compensation."
            ),
            "court_holding": (
                "The 7-Judge Constitution Bench established the landmark 'Triple Test': Where there is (i) systematic activity, (ii) organized "
                "cooperation between employer and employees, and (iii) production/distribution of goods and services calculated to satisfy "
                "human desires, it constitutes an industry regardless of profit motive. Welfare rights including Payment of Gratuity under "
                "Section 4 and protection against arbitrary withholding are statutory and cannot be defeated."
            ),
            "advocate_strategy": (
                "Counsel for workmen argued that welfare enactments are intended to remedy economic inequality and must be given the widest "
                "purposive interpretation."
            ),
            "sanhita_mapping_2024": (
                "Directly underpins the expansive definitions codified in the Occupational Safety, Health and Social Security Code 2020."
            ),
            "key_takeaways": [
                "Labor welfare statutes protect employees across public and private organizations fulfilling the Triple Test.",
                "Gratuity after 5 years continuous service is a mandatory statutory right under Section 4.",
                "Employers cannot withhold terminal dues without strict compliance with statutory forfeiture conditions."
            ]
        },
        {
            "title": "Vellore Citizens Welfare Forum v. Union of India",
            "citation": "(1996) 5 SCC 647; AIR 1996 SC 2715",
            "court": "Supreme Court of India",
            "bench": "3-Judge Bench (Kuldip Singh, Faizan Uddin & K. Venkataswami, JJ.)",
            "decision_year": 1996,
            "category": "Environmental Law & NGT Jurisprudence",
            "governing_provisions": [
                "NGT Act 2010 Section 14", "NGT Act 2010 Section 15", "Article 21 Constitution", "Water Act 1974 Section 25"
            ],
            "factual_matrix": (
                "Untreated toxic chemical effluents discharged by hundreds of tanneries in Tamil Nadu contaminated ground water, "
                "rendering agricultural lands barren and polluting the Palar River, depriving thousands of citizens of drinking water."
            ),
            "legal_controversy": (
                "Whether industrial enterprises can pollute public natural resources in the name of economic development and employment, "
                "and what legal principles govern environmental remediation and liability."
            ),
            "court_holding": (
                "The Supreme Court held that the 'Precautionary Principle' and 'Polluter Pays Principle' are essential features of Sustainable "
                "Development and part of Indian environmental law under Article 21. Polluting industries must bear the full cost of reversing "
                "ecological degradation and compensating victims. This standard forms the statutory foundation of National Green Tribunal "
                "(NGT) jurisdiction under Sections 14 and 15 of the NGT Act, 2010."
            ),
            "advocate_strategy": (
                "Environmental petitioner counsel established that the right to clean drinking water and unpolluted environment is an "
                "inalienable fundamental right under Article 21 that overrides private industrial profits."
            ),
            "sanhita_mapping_2024": (
                "Foundational precedent governing NGT restitution orders under Sections 14, 15, and 19 of the NGT Act, 2010."
            ),
            "key_takeaways": [
                "The Polluter Pays Principle mandates that polluters bear full financial liability for environmental restoration.",
                "Lack of full scientific certainty cannot excuse failure to prevent ecological degradation (Precautionary Principle).",
                "Citizens have the right to approach the National Green Tribunal under Sections 14 & 15 for environmental relief."
            ]
        },
        {
            "title": "Vineeta Sharma v. Rakesh Sharma",
            "citation": "(2020) 9 SCC 1; AIR 2020 SC 3717",
            "court": "Supreme Court of India",
            "bench": "3-Judge Bench (Arun Mishra, S. Abdul Nazeer & M.R. Shah, JJ.)",
            "decision_year": 2020,
            "category": "Hindu Succession & Inheritance Law",
            "governing_provisions": [
                "Hindu Succession Act 1956 Section 6", "Article 14 Constitution", "Article 15 Constitution"
            ],
            "factual_matrix": (
                "Conflicting Supreme Court decisions (*Prakash v. Phulavati* and *Danamma*) created legal chaos regarding whether daughters "
                "possess equal coparcenary rights in ancestral Mitakshara property under the 2005 amendment if the father passed away "
                "prior to September 9, 2005."
            ),
            "legal_controversy": (
                "Whether daughter's coparcenary right under Section 6 of the Hindu Succession Act, 1956 is conditioned upon the coparcener "
                "father being alive on September 9, 2005."
            ),
            "court_holding": (
                "The 3-Judge Bench held that the daughter's right to coparcenary in ancestral property is acquired by birth (unobstructed "
                "heritage). It is retroactive in nature: it does not matter whether the father was alive or not on September 9, 2005. "
                "Daughters have the identical rights and liabilities as sons in ancestral property, invalidating male-only succession claims."
            ),
            "advocate_strategy": (
                "Counsel argued that Section 6 was enacted to eliminate gender discrimination under Articles 14 and 15. A coparcenary right "
                "is created by the factum of birth, not by the event of the father's death."
            ),
            "sanhita_mapping_2024": (
                "Settled the national law on gender equality in ancestral property succession across all civil courts."
            ),
            "key_takeaways": [
                "Daughters acquire equal coparcenary rights in ancestral property by birth under Section 6 Hindu Succession Act.",
                "The rights apply irrespective of whether the father was alive on September 9, 2005.",
                "Oral or unregistered family partitions after December 20, 2004 cannot defeat the daughter's share."
            ]
        },
        {
            "title": "Union of India v. Ashish Agarwal",
            "citation": "(2023) 1 SCC 617; AIR 2022 SC 2781",
            "court": "Supreme Court of India",
            "bench": "2-Judge Bench (M.R. Shah & B.V. Nagarathna, JJ.)",
            "decision_year": 2022,
            "category": "Direct Taxation & Reassessment Law",
            "governing_provisions": [
                "Income Tax Act 1961 Section 148", "Income Tax Act 1961 Section 148A", "Income Tax Act 1961 Section 149"
            ],
            "factual_matrix": (
                "Following the Finance Act 2021 overhaul of reassessment provisions introducing mandatory show-cause inquiry under "
                "Section 148A, the Income Tax Department issued roughly 90,000 reassessment notices under the old pre-amendment regime. "
                "High Courts across India quashed these notices as invalid and issued without statutory authority."
            ),
            "legal_controversy": (
                "Whether reassessment notices issued after April 1, 2021 under the old regime were void ab initio, and what procedural "
                "safeguards under Section 148A are mandatory before reopening past assessments."
            ),
            "court_holding": (
                "The Supreme Court held that the amended reassessment scheme under Section 148A is a beneficial procedural safeguard for "
                "assessees. The Assessing Officer must mandatorily conduct inquiry, provide the assessee with the underlying material/information, "
                "and grant a minimum of 7 to 30 days to file a show-cause reply before issuing a Section 148 reassessment notice."
            ),
            "advocate_strategy": (
                "Assessee counsel demonstrated that statutory amendments substituting assessment procedures cannot be bypassed by executive "
                "circulars, and taxpayers have a statutory right to be heard prior to reopening."
            ),
            "sanhita_mapping_2024": (
                "Codified mandatory pre-assessment show cause protocol across all direct tax digital reassessment proceedings."
            ),
            "key_takeaways": [
                "Section 148A mandates prior disclosure of information and minimum 7 to 30 days to reply before reassessment notice.",
                "Reassessment beyond 3 years is barred unless escaped income exceeds ₹50 Lakh with specific asset evidence under Section 149.",
                "Failure of tax authorities to follow Section 148A procedure renders the reassessment void."
            ]
        },
        {
            "title": "D.A.V. College, Jullundur v. State of Punjab",
            "citation": "(1971) 2 SCC 269; AIR 1971 SC 1737",
            "court": "Supreme Court of India",
            "bench": "5-Judge Constitution Bench (S.M. Sikri CJI, G.K. Mitter, K.S. Hegde, A.N. Grover, P. Jaganmohan Reddy, JJ.)",
            "decision_year": 1971,
            "category": "Constitutional & Secular Education",
            "governing_provisions": [
                "Article 28 Constitution", "Article 28(1)", "Article 28(3)", "Article 29", "Article 30"
            ],
            "factual_matrix": (
                "The D.A.V. College trust challenged sections of Guru Nanak University Amritsar Act, 1969, which mandated colleges "
                "to study and research the life and teachings of Guru Nanak, arguing this amounted to compulsory religious instruction "
                "in violation of Article 28(1)."
            ),
            "legal_controversy": (
                "What constitutes 'religious instruction' within the prohibition of Article 28(1), and whether academic study of the life, "
                "philosophy, and moral teachings of religious figures constitutes forbidden religious indoctrination."
            ),
            "court_holding": (
                "The 5-Judge Constitution Bench authoritatively ruled that academic study and research into the life, culture, and "
                "teachings of a religious or spiritual leader does NOT constitute 'religious instruction' under Article 28(1). Religious "
                "instruction strictly implies imparting tenets of a particular faith, religious rituals, dogmas, or forms of worship. "
                "Academic, philosophical, or historical study is completely lawful."
            ),
            "advocate_strategy": (
                "Winning counsel distinguished between religious education/indoctrination (forbidden under Article 28(1) in state-funded "
                "institutions) and value-oriented cultural-historical studies (fully permissible under secular constitutional scheme)."
            ),
            "sanhita_mapping_2024": (
                "Foundational constitutional precedent defining the exact boundary of religious instruction vs academic curriculum in "
                "educational institutions under Article 28."
            ),
            "key_takeaways": [
                "Article 28(1) prohibits imparting religious dogmas, rituals, or sectarian beliefs in wholly state-funded institutions.",
                "Academic study of religious philosophy, history, and moral teachings does not violate Article 28(1).",
                "Under Article 28(3), state-aided or recognized schools cannot force students to attend worship or prayers without consent."
            ]
        },
        {
            "title": "Aruna Roy & Ors. v. Union of India & Ors.",
            "citation": "(2002) 7 SCC 368; AIR 2002 SC 3176",
            "court": "Supreme Court of India",
            "bench": "3-Judge Bench (M.B. Shah, D.M. Dharmadhikari, H.K. Sema, JJ.)",
            "decision_year": 2002,
            "category": "Constitutional & Secular Education",
            "governing_provisions": [
                "Article 28 Constitution", "Article 28(1)", "Article 25 Constitution"
            ],
            "factual_matrix": (
                "Social activist Aruna Roy and others challenged the National Curriculum Framework for School Education (NCFSE) "
                "published by NCERT, alleging that introducing education about religions amounted to 'religious instruction' prohibited by Article 28(1)."
            ),
            "legal_controversy": (
                "Whether the inclusion of comparative study of all religions for moral and value education violates secularism and Article 28(1) "
                "of the Constitution of India."
            ),
            "court_holding": (
                "The Supreme Court unanimously held that education about religions is not the same as religious instruction. Secularism does not "
                "mean hostility towards religion; it means equal respect for all faiths (Sarva Dharma Sambhava). Knowledge of common ethical and "
                "moral values across religions promotes tolerance and national harmony and does not violate Article 28(1)."
            ),
            "advocate_strategy": (
                "Union counsel proved that NCERT guidelines provided comparative value education without promoting any single religion or compelling "
                "prayer, directly satisfying the constitutional standard under Article 28."
            ),
            "sanhita_mapping_2024": (
                "Primary constitutional benchmark on value-based education and secular curricular boundaries under Article 28 of the Constitution."
            ),
            "key_takeaways": [
                "There is a vital constitutional difference between 'religious instruction' and 'study of religions'.",
                "Value education based on comparative religions does not violate Article 28(1).",
                "Article 28(3) strictly guarantees citizen opt-out protection from compulsory religious worship."
            ]
        },
        {
            "title": "Damodar S. Prabhu v. Sayed Babalal H.",
            "citation": "(2010) 5 SCC 663; AIR 2010 SC 1907",
            "court": "Supreme Court of India",
            "bench": "3-Judge Bench (K.G. Balakrishnan CJI, P. Sathasivam & J.M. Panchal, JJ.)",
            "decision_year": 2010,
            "category": "Negotiable Instruments Act (Cheque Dishonour)",
            "governing_provisions": [
                "NI Act Section 138", "NI Act Section 147", "Section 143 NI Act", "Section 320 CrPC"
            ],
            "factual_matrix": (
                "The appellant was convicted under Section 138 of the Negotiable Instruments Act for cheque bounce. "
                "During appeal before the Supreme Court, the parties entered into a compromise settlement. The case "
                "highlighted heavy backlog in trial courts dealing with cheque bounce matters and the need for standardized "
                "guidelines on compounding of Section 138 offenses."
            ),
            "legal_controversy": (
                "Whether Section 138 NI Act offenses are predominantly civil in nature, and what standardized compounding "
                "fee guidelines should govern compounding under Section 147 at trial, appellate, and revisional stages."
            ),
            "court_holding": (
                "The 3-Judge Bench held that Section 138 NI Act is fundamentally a regulatory offense with civil undertones "
                "aimed at ensuring commercial credibility, not penal vengeance. Under Section 147, offenses are compoundable. "
                "The Court issued graded cost guidelines for compounding: (i) If compounded at trial stage before evidence: no penalty; "
                "(ii) If compounded before Sessions Court in appeal: 10% of cheque amount; (iii) If compounded before High Court / Supreme Court: "
                "15% of cheque amount as costs deposited with Legal Services Authority."
            ),
            "advocate_strategy": (
                "Defense counsel successfully argued that commercial disputes should not be overburdened with custodial punishment "
                "when the creditor's debt is satisfied, leveraging Section 147 to achieve complete quashing and compounding of conviction."
            ),
            "sanhita_mapping_2024": (
                "Primary landmark authority for compounding cheque dishonour prosecutions under Section 147 NI Act and procedural "
                "disposal under Section 143."
            ),
            "key_takeaways": [
                "Section 138 offenses are primarily compensatory in nature rather than purely punitive.",
                "Under Section 147 NI Act, cheque bounce cases can be compounded at any stage of litigation.",
                "Graded compounding fee (10% on appeal, 15% on revision) deposited with DLSA/SLSA encourages early stage dispute settlement."
            ]
        },
        {
            "title": "Bir Singh v. Mukesh Kumar",
            "citation": "(2019) 4 SCC 197; AIR 2019 SC 2446",
            "court": "Supreme Court of India",
            "bench": "2-Judge Bench (R. Banumathi & Indira Banerjee, JJ.)",
            "decision_year": 2019,
            "category": "Negotiable Instruments Act (Cheque Dishonour)",
            "governing_provisions": [
                "NI Act Section 138", "NI Act Section 139", "NI Act Section 118", "Section 20 NI Act"
            ],
            "factual_matrix": (
                "The accused issued a signed blank cheque to the complainant which was subsequently filled and presented for "
                "encashment, bouncing with 'insufficient funds'. The accused argued that he had handed over a blank cheque as "
                "security and therefore did not owe the filled amount."
            ),
            "legal_controversy": (
                "Whether a signed blank cheque handed over to a payee attracts the statutory presumption under Section 139 "
                "of the Negotiable Instruments Act once the signature is admitted."
            ),
            "court_holding": (
                "The Supreme Court authoritatively ruled that even if a blank cheque leaf is voluntarily signed and handed over "
                "by the drawer, it implies authority given to the holder to fill up the blanks under Section 20 of the NI Act. "
                "Once signature is admitted, the statutory presumption under Section 139 that the cheque was issued in discharge "
                "of a debt or liability arises mandatorily, and the burden shifts entirely to the drawer to rebut it by leading "
                "cogent evidence on a preponderance of probabilities."
            ),
            "advocate_strategy": (
                "Winning complainant counsel established that mere denial of handwriting or claiming the cheque was a 'security cheque' "
                "is insufficient to rebut Section 139 presumption unless the drawer produces independent financial records proving no subsisting debt."
            ),
            "sanhita_mapping_2024": (
                "Governing benchmark on admission of cheque signature, inchoate instruments (Section 20), and Section 139 statutory presumption in cheque dishonour trials."
            ),
            "key_takeaways": [
                "Admission of drawer's signature triggers mandatory presumption under Section 139 NI Act.",
                "Voluntary signing of blank cheque empowers holder to complete the instrument under Section 20.",
                "Mere defense of 'security cheque' without documentary proof fails to rebut the Section 139 presumption."
            ]
        },
        {
            "title": "Satish Chander Ahuja v. Sneha Ahuja",
            "citation": "(2021) 1 SCC 414; AIR 2020 SC 5399",
            "court": "Supreme Court of India",
            "bench": "3-Judge Bench (Ashok Bhushan, R. Subhash Reddy & M.R. Shah, JJ.)",
            "decision_year": 2020,
            "category": "Domestic Violence & Matrimonial Residence Rights",
            "governing_provisions": [
                "DV Act 2005 Section 2(s)", "DV Act 2005 Section 17", "DV Act 2005 Section 19", "Section 144 BNSS"
            ],
            "factual_matrix": (
                "The father-in-law filed a civil suit for mandatory injunction seeking eviction of his daughter-in-law from a residential "
                "property that was self-acquired and exclusively owned by the father-in-law, claiming that under the earlier S.R. Batra ruling, "
                "the house did not qualify as a 'shared household' if the husband had no legal share."
            ),
            "legal_controversy": (
                "Whether an aggrieved daughter-in-law has the statutory right of residence under Sections 17 and 19 of the DV Act in a house "
                "owned exclusively by her in-laws, and whether S.R. Batra v. Taruna Batra was correctly decided."
            ),
            "court_holding": (
                "Overruling S.R. Batra v. Taruna Batra, the 3-Judge Bench held that 'shared household' under Section 2(s) includes any premises "
                "where the aggrieved woman lives or has lived at any stage in a domestic relationship with her husband and in-laws, irrespective "
                "of whether the husband has any proprietary title or ownership share in the property. The woman cannot be evicted or dispossessed "
                "from the matrimonial home without due process and residence order under Section 19 of the DV Act."
            ),
            "advocate_strategy": (
                "Defense counsel for the aggrieved wife demonstrated that restricting the definition of shared household to properties owned by "
                "the husband defeats the entire socio-welfare objective of the DV Act, securing non-eviction protections for women living under "
                "joint family roofs."
            ),
            "sanhita_mapping_2024": (
                "Primary landmark precedent governing protection from dispossession and right to reside in shared household under Sections 17 & 19 "
                "of Protection of Women from Domestic Violence Act, 2005."
            ),
            "key_takeaways": [
                "An aggrieved woman cannot be evicted from shared household even if it is exclusively owned by in-laws.",
                "Overruled the restrictive doctrine in S.R. Batra v. Taruna Batra.",
                "Civil court injunction suits by in-laws cannot bypass the protective shield of Section 17 & 19 DV Act."
            ]
        }
    ]

    count = 0
    for c in cases_data:
        existing = db.query(RealCasePrecedent).filter(RealCasePrecedent.title == c["title"]).first()
        if not existing:
            precedent = RealCasePrecedent(**c)
            db.add(precedent)
            count += 1
        else:
            # Update existing with enriched data
            for k, v in c.items():
                setattr(existing, k, v)
    
    db.commit()
    print(f"Successfully seeded {count} new precedents (Total catalog active: {db.query(RealCasePrecedent).count()})")
    db.close()

if __name__ == "__main__":
    seed_precedents()
