/**
 * clientCounterStrategyEngine.ts - Client Parity Engine for Anti-Vexatious Counter-Strategy
 * Bharat Legal Intelligence 2.0 (Reverse Engineer Anything - REA Methodology)
 *
 * Provides 100% offline standalone generation of defensive legal instruments:
 * - Cross-complaint under Section 248 & 217 BNS 2023 (False charge with intent to injure)
 * - Application under Section 379 BNSS read with Section 215 BNS (Perjury inquiry)
 * - Caveat Petition under Section 148A CPC 1908 (Pre-emptive anti-injunction defense)
 * - Civil Plaint for Exemplary Damages for Malicious Prosecution & Tortious Defamation
 * - Contempt Petition under Article 215 for breach of Arnesh Kumar / Satender Antil directives
 */

export interface CounterStrategyPreset {
  key: string;
  title: string;
  statutory_basis: string;
  category: string;
  icon: string;
  target_forum: string;
  objective: string;
  punishment: string;
  landmark_precedents: string[];
}

export interface CounterStrategyPayload {
  preset_key: string;
  applicant_name: string;
  applicant_details?: string;
  opposite_party_name: string;
  opposite_party_details?: string;
  court_name?: string;
  state_name?: string;
  case_ref?: string;
  police_station?: string;
  claim_amount?: string;
  facts_summary?: string;
  advocate_name?: string;
  advocate_enrolment?: string;
  advocate_office?: string;
}

export interface CounterStrategyResult {
  preset: CounterStrategyPreset;
  title: string;
  pleading_text: string;
  statutory_basis: string;
  target_forum: string;
  engine: string;
}

export const CLIENT_COUNTER_STRATEGY_PRESETS: CounterStrategyPreset[] = [
  {
    key: 'bns_248_false_charge',
    title: 'Cross-Complaint for False Charge with Intent to Injure',
    statutory_basis: 'Section 248 BNS 2023 (formerly §211 IPC) & Section 223 BNSS',
    category: 'Criminal Counter-Offensive',
    icon: 'shield_with_heart',
    target_forum: 'Court of Chief Judicial Magistrate / Metropolitan Magistrate',
    objective: 'Initiate criminal prosecution against a malicious complainant for instituting false criminal proceedings knowing there is no just or lawful ground.',
    punishment: 'Imprisonment up to 5 years (or up to 7 years / life if false charge punishable with death/life/7+ years) plus fine.',
    landmark_precedents: [
      'Santokh Singh v. Izhar Hussain (1973) 2 SCC 406',
      'State of Punjab v. Brij Lal Palta [1969] 1 SCR 853',
      'Chidananda v. State of Karnataka (2020) SCC OnLine Kar 1215'
    ]
  },
  {
    key: 'bnss_379_perjury_inquiry',
    title: 'Application for Prosecution for Perjury & Fabricated Evidence',
    statutory_basis: 'Section 379 BNSS 2023 (formerly §340 CrPC) read with Section 215 BNS 2023',
    category: 'Judicial Perjury Sanctions',
    icon: 'fact_check',
    target_forum: 'Court where false affidavit, statement or fabricated digital evidence was tendered',
    objective: 'Trigger mandatory preliminary inquiry into intentionally false sworn affidavits, forged digital exhibits, or suppressed material facts.',
    punishment: 'Judicial complaint dispatched to Magistrate; imprisonment up to 7 years under Section 215 BNS.',
    landmark_precedents: [
      'Pritish v. State of Maharashtra [2002] 1 SCC 253',
      'Iqbal Singh Marwah v. Meenakshi Marwah [2005] 4 SCC 370',
      'K.G. Premshanker v. Inspector of Police [2002] 8 SCC 87'
    ]
  },
  {
    key: 'cpc_148a_caveat_petition',
    title: 'Pre-Emptive Caveat Petition Against Ex-Parte Injunctions',
    statutory_basis: 'Section 148A Code of Civil Procedure, 1908',
    category: 'Pre-Emptive Civil Defense',
    icon: 'lock',
    target_forum: 'High Court / Principal District & Sessions Judge',
    objective: 'Deprive adversary of the element of surprise. Mandates that NO ex-parte stay, status quo, or freeze order can be passed without prior written notice to Caveator.',
    punishment: 'Any ex-parte order passed without serving Caveator is rendered null and irregular.',
    landmark_precedents: [
      'Reserve Bank of India v. Ashis Ray (1993) 1 CALLT 239 HC',
      'C. Seethaiah v. Govt. of A.P. AIR 1983 AP 443',
      'Deepak Khosla v. Union of India (Delhi High Court 2011)'
    ]
  },
  {
    key: 'malicious_prosecution_tort',
    title: 'Civil Plaint for Damages for Malicious Prosecution & Defamation',
    statutory_basis: 'Law of Torts & Section 9 Code of Civil Procedure, 1908',
    category: 'Civil Tort & Exemplary Damages',
    icon: 'payments',
    target_forum: 'Competent Civil Court / Commercial Court',
    objective: 'Claim substantial monetary compensation (e.g. ₹25,00,000/- to ₹1,00,00,000/-) for loss of business reputation, mental trauma, legal defense costs, and humiliation.',
    punishment: 'Money decree with 18% p.a. pendente lite interest and exemplary costs.',
    landmark_precedents: [
      'West Bengal State Electricity Board v. Dilip Kumar Ray [2007] 14 SCC 568',
      'S. Nambi Narayanan v. Siby Mathews [2018] 10 SCC 804',
      'Babu v. Gokuldoss AIR 1928 Mad 385'
    ]
  },
  {
    key: 'contempt_arnesh_kumar_breach',
    title: 'Contempt of Court Notice for Violation of Arnesh Kumar Directives',
    statutory_basis: 'Article 215 Constitution of India & Contempt of Courts Act, 1971 read with §35 BNSS',
    category: 'Constitutional Enforcement',
    icon: 'gavel',
    target_forum: 'High Court having jurisdiction over the defaulting Police Station',
    objective: 'Hold arresting police officer and supervisory ACP/DCP personally liable for departmental disciplinary inquiry and civil imprisonment for unlawful arrest without §35(3) BNSS notice.',
    punishment: 'Contempt penalties, disciplinary censure in service record, and personal damages.',
    landmark_precedents: [
      'Arnesh Kumar v. State of Bihar [2014] 8 SCC 273',
      'Satender Kumar Antil v. CBI [2022] 10 SCC 51',
      'Md. Aslam v. State of Bihar (2020) Patna HC'
    ]
  }
];

export function generateClientCounterStrategy(payload: CounterStrategyPayload): CounterStrategyResult {
  const presetKey = payload.preset_key || 'bns_248_false_charge';
  const preset = CLIENT_COUNTER_STRATEGY_PRESETS.find(p => p.key === presetKey) || CLIENT_COUNTER_STRATEGY_PRESETS[0];

  const appName = payload.applicant_name || 'Aggrieved Party / Applicant';
  const appDetails = payload.applicant_details || 'Resident of NCT of Delhi, Citizen of India';
  const oppName = payload.opposite_party_name || 'Malicious Complainant / Defaulting Officer';
  const oppDetails = payload.opposite_party_details || 'Opposite Party / Complainant';
  const courtName = payload.court_name || preset.target_forum;
  const stateName = payload.state_name || 'State (NCT of Delhi)';
  const caseRef = payload.case_ref || 'FIR No. ____ / 2024 / Complaint Case No. ____';
  const ps = payload.police_station || 'P.S. ________';
  const claimAmount = payload.claim_amount || '₹25,00,000/-';
  const facts = payload.facts_summary || (
    'The Opposite Party has deliberately, maliciously, and without reasonable or probable cause ' +
    'instituted false, vexatious, and fabricated criminal proceedings against the Applicant with ' +
    'the fraudulent intention of causing wrongful loss, public humiliation, and criminal extortion.'
  );
  const advName = payload.advocate_name || 'Senior Counsel / Enrolled Advocate';
  const advEnrol = payload.advocate_enrolment || 'D/____/2018';
  const advOffice = payload.advocate_office || 'Chamber No. __, High Court of Delhi, New Delhi';

  let pleadingText = '';

  if (presetKey === 'bns_248_false_charge') {
    pleadingText = `IN THE COURT OF THE CHIEF JUDICIAL MAGISTRATE / METROPOLITAN MAGISTRATE
AT ${courtName.toUpperCase()}, ${stateName.toUpperCase()}

CRIMINAL COMPLAINT CASE NO. _______ OF 2024

IN THE MATTER OF:
${appName}
${appDetails}
... COMPLAINANT / AGGRIEVED PARTY

VERSUS

${oppName}
${oppDetails}
... ACCUSED / MALICIOUS COMPLAINANT

CRIMINAL COMPLAINT UNDER SECTION 223 READ WITH SECTION 248 & 217 OF THE BHARATIYA NYAYA SANHITA, 2023 (FORMERLY SECTION 211 & 182 IPC) FOR INSTITUTING FALSE CRIMINAL CHARGE WITH INTENT TO INJURE AND EXTORT.

MOST RESPECTFULLY SHOWETH:

I. PRELIMINARY SUBMISSIONS & LOCUS STANDI
1. That the Complainant is a law-abiding citizen of India with unblemished personal and commercial reputation.
2. That the Accused has maliciously, corruptly, and without an iota of reasonable or probable cause instituted frivolous and vexatious criminal proceedings against the Complainant vide ${caseRef} at Police Station ${ps}.

II. FACTUAL MATRIX DEMONSTRATING MALICIOUS INTENT
3. ${facts}
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
${advName}
Advocate for the Complainant
Enrolment No.: ${advEnrol}
Chamber / Office: ${advOffice}
Place: ${stateName}
Date: ________________________

VERIFICATION
I, ${appName}, the Complainant above-named, do hereby verify that the contents of paragraphs 1 to 5 are true to my personal knowledge and paragraphs 6 to 7 are based on legal advice received and believed to be true.
Verified at ${stateName} on this day of ____________, 2024.

DEPONENT`;
  } else if (presetKey === 'bnss_379_perjury_inquiry') {
    pleadingText = `IN THE COURT OF ${courtName.toUpperCase()}, ${stateName.toUpperCase()}

MISC. CRIMINAL APPLICATION NO. _______ OF 2024
IN
CASE NO. ${caseRef}

IN THE MATTER OF:
${appName} (${appDetails}) ... APPLICANT
VERSUS
${oppName} (${oppDetails}) ... RESPONDENT / PERJURER

APPLICATION UNDER SECTION 379 OF THE BHARATIYA NAGARIK SURAKSHA SANHITA, 2023 (FORMERLY SECTION 340 CrPC) READ WITH SECTION 215 OF THE BHARATIYA NYAYA SANHITA, 2023 FOR INITIATING PRELIMINARY INQUIRY AND PROSECUTION FOR TENDERING DELIBERATELY FALSE AFFIDAVIT AND FABRICATED EVIDENCE.

MOST RESPECTFULLY SHOWETH:

1. That the Applicant is a contesting party in the above-captioned proceedings pending before this Hon'ble Court.
2. That the Respondent has deliberately and dishonestly made statements under oath in the Affidavit dated ________ which the Respondent knew to be false and completely baseless.
3. SPECIFIC PERJURY INSTANCES:
   ${facts}
4. That the Hon'ble Supreme Court in Pritish v. State of Maharashtra [2002] 1 SCC 253 held that the purpose of Section 340 CrPC (now Section 379 BNSS) is to protect the administration of justice from being polluted by perjured testimony and dishonest litigants.
5. That it is expedient in the interest of justice that an inquiry be made into the offence under Section 215 BNS committed in respect of the document and testimony produced before this Hon'ble Court.

PRAYER:
It is most respectfully prayed that this Hon'ble Court may graciously be pleased to:
(a) Conduct a preliminary inquiry under Section 379(1) BNSS into the deliberate perjury and fabrication of evidence committed by the Respondent;
(b) Record a finding to that effect and lodge a formal written complaint before the competent Judicial Magistrate having jurisdiction;
(c) Take necessary security for the appearance of the Respondent before such Magistrate; and
(d) Pass any further orders deemed fit in the interest of justice.

APPLICANT THROUGH COUNSEL:
${advName} (Enrolment: ${advEnrol})
Office: ${advOffice}
Date: ________________________`;
  } else if (presetKey === 'cpc_148a_caveat_petition') {
    pleadingText = `IN THE HIGH COURT OF JUDICATURE / DISTRICT COURT
AT ${courtName.toUpperCase()}, ${stateName.toUpperCase()}

CAVEAT PETITION NO. _______ OF 2024

IN THE MATTER OF:
${appName}
${appDetails}
... CAVEATOR / APPLICANT

VERSUS

${oppName}
${oppDetails}
... EXPECTED PETITIONER / PLAINTIFF

CAVEAT PETITION UNDER SECTION 148A OF THE CODE OF CIVIL PROCEDURE, 1908.

THE CAVEATOR RESPECTFULLY STATES AS UNDER:

1. That the Caveator has a genuine and bona fide apprehension that the Expected Petitioner/Plaintiff may institute a Civil Suit, Writ Petition, or Appeal before this Hon'ble Court and attempt to seek ex-parte interim injunctions, stay orders, or status quo directives against the Caveator without serving advance notice.
2. DISPUTE BACKGROUND & BONA FIDE DEFENSE:
   ${facts}
3. That the Caveator has a strong prima facie defense on merits and the balance of convenience lies entirely in favor of the Caveator. Any ex-parte order granted without hearing the Caveator will cause irreparable loss and injury.
4. That the Caveator has duly dispatched a copy of this Caveat Petition to the Expected Petitioner by Registered Post / Speed Post on ________ in compliance with Section 148A(2) CPC. Postal receipt is annexed herewith as ANNEXURE C-1.

PRAYER:
Wherefore, it is most respectfully prayed that no ex-parte interim order, injunction, stay, or status quo be passed in any suit, appeal, or petition filed by the Expected Petitioner against the Caveator without giving prior written notice of the application and reasonable opportunity of hearing to the Caveator's counsel.

CAVEATOR
THROUGH COUNSEL:
${advName}
Advocate for the Caveator
Enrolment No.: ${advEnrol}
Office: ${advOffice}
Place: ${stateName}
Date: ________________________

VERIFICATION
I, ${appName}, the Caveator above named, do hereby verify that the facts stated in paragraphs 1 to 4 are true to my personal knowledge and belief.
Verified at ${stateName} on ____________ 2024.

DEPONENT`;
  } else if (presetKey === 'malicious_prosecution_tort') {
    pleadingText = `IN THE COURT OF THE DISTRICT JUDGE / COMMERCIAL COURT
AT ${courtName.toUpperCase()}, ${stateName.toUpperCase()}

COMMERCIAL SUIT / CIVIL SUIT NO. _______ OF 2024

IN THE MATTER OF:
${appName}
${appDetails}
... PLAINTIFF

VERSUS

${oppName}
${oppDetails}
... DEFENDANT

SUIT UNDER SECTION 9 OF THE CODE OF CIVIL PROCEDURE, 1908 FOR RECOVERY OF EXEMPLARY DAMAGES OF ${claimAmount} FOR MALICIOUS PROSECUTION, LOSS OF REPUTATION, COMMERCIAL INJURY, AND MENTAL HARASSMENT.

MOST RESPECTFULLY SHOWETH:

1. That the Plaintiff is an established professional / enterprise of high standing and unblemished creditworthiness in ${stateName}.
2. That the Defendant maliciously and without any reasonable or probable cause initiated frivolous criminal / civil proceedings against the Plaintiff.
3. CONCURRENT DEMONSTRATION OF TORTIOUS INGREDIENTS:
   (a) PROSECUTION INSTITUTED BY DEFENDANT: The Defendant instituted proceedings vide complaint dated ________.
   (b) TERMINATION IN FAVOR OF PLAINTIFF: The said proceedings terminated entirely in favor of the Plaintiff vide order dated ________ by which the Plaintiff was exonerated / discharged / acquitted.
   (c) ABSENCE OF REASONABLE & PROBABLE CAUSE: There was no objective basis for the allegations, as held by the judicial order.
   (d) MALICE IN FACT & LAW: The proceedings were actuated by improper and spiteful motives.
4. PARTICULARS OF SPECIAL & GENERAL DAMAGES CLAIMED:
   ${facts}
   - Loss of Business Revenue & Contracts: ₹15,00,000/-
   - Legal Defense Expenses & Counsel Fees: ₹5,00,000/-
   - General Damages for Mental Agony & Defamation: ₹5,00,000/-
   TOTAL CLAIM: ${claimAmount}
5. That in West Bengal State Electricity Board v. Dilip Kumar Ray [2007] 14 SCC 568 and S. Nambi Narayanan v. Siby Mathews [2018] 10 SCC 804, the Hon'ble Supreme Court held that the constitutional right to live with dignity (Article 21) encompasses compensation for victims of malicious and groundless prosecution.

PRAYER:
It is most respectfully prayed that this Hon'ble Court may be pleased to:
(a) Pass a decree in favor of the Plaintiff and against the Defendant for a sum of ${claimAmount} towards general and special damages;
(b) Award pendente lite and future interest @ 18% per annum from the date of institution of suit until realization;
(c) Award exemplary costs of the suit; and
(d) Pass such further orders as this Hon'ble Court deems fit and proper.

PLAINTIFF THROUGH COUNSEL:
${advName} (Enrolment: ${advEnrol})
Office: ${advOffice}
Date: ________________________`;
  } else if (presetKey === 'contempt_arnesh_kumar_breach') {
    pleadingText = `IN THE HIGH COURT OF JUDICATURE AT ${courtName.toUpperCase()}
(CONTEMPT JURISDICTION UNDER ARTICLE 215 OF THE CONSTITUTION OF INDIA)

CONTEMPT PETITION (CIVIL / CRIMINAL) NO. _______ OF 2024

IN THE MATTER OF:
${appName}
${appDetails}
... PETITIONER / AGGRIEVED CITIZEN

VERSUS

1. ${oppName} (Investigating Officer, Police Station ${ps})
2. Station House Officer (SHO), Police Station ${ps}
3. State of ${stateName}, Through Commissioner / Director General of Police
... CONTEMNORS / RESPONDENTS

CONTEMPT PETITION UNDER ARTICLE 215 OF THE CONSTITUTION OF INDIA READ WITH SECTION 11 & 12 OF THE CONTEMPT OF COURTS ACT, 1971 FOR WILLFUL AND CONTUMACIOUS DISOBEDIENCE OF THE BINDING DIRECTIVES OF THE HON'BLE SUPREME COURT IN ARNESH KUMAR V. STATE OF BIHAR [2014] 8 SCC 273 AND SATENDER KUMAR ANTIL V. CBI [2022] 10 SCC 51.

MOST RESPECTFULLY SHOWETH:

1. That this Contempt Petition is preferred to uphold the Rule of Law and protect personal liberty guaranteed under Article 21 against arbitrary police despotism.
2. That in Arnesh Kumar v. State of Bihar [2014] 8 SCC 273 (followed in Satender Kumar Antil), the Hon'ble Supreme Court issued mandatory binding directions under Article 141/142 that for all offences punishable with imprisonment up to 7 years:
   (a) Police officers shall not mechanically arrest without recording reasons in writing;
   (b) A formal written Notice of Appearance under Section 41A CrPC (now Section 35(3) BNSS 2023) MUST be served within two weeks of FIR;
   (c) Failure to comply renders the police officer liable for departmental inquiry and CONTEMPT OF COURT before the High Court.
3. WILLFUL CONTEMPT COMMITTED BY CONTEMNORS:
   In respect of ${caseRef} at Police Station ${ps}:
   ${facts}
   The Contemnors knowingly, intentionally, and willfully flouted the aforesaid directions by threatening mechanical arrest and refusing to issue Section 35(3) BNSS notice.

PRAYER:
Wherefore, it is most respectfully prayed that this Hon'ble High Court may be pleased to:
(a) Initiate contempt proceedings against the Contemnors for willful violation of the Supreme Court's binding mandate in Arnesh Kumar v. State of Bihar;
(b) Punish the Contemnors under the Contempt of Courts Act, 1971 and Article 215 of the Constitution;
(c) Direct immediate registration of a departmental vigilance inquiry against Contemnor No. 1; and
(d) Pass such further orders as this Hon'ble Court deems fit to protect personal liberty.

PETITIONER THROUGH COUNSEL:
${advName} (Enrolment: ${advEnrol})
Office: ${advOffice}
Place: ${stateName}
Date: ________________________`;
  }

  return {
    preset,
    title: `Counter-Strategy: ${preset.title}`,
    pleading_text: pleadingText,
    statutory_basis: preset.statutory_basis,
    target_forum: courtName,
    engine: 'Bharat Anti-Vexatious Statutory Studio (Deterministic Indian Law)'
  };
}
