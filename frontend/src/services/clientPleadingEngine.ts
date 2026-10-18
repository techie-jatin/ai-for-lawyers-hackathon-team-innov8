/**
 * Bharat Legal Intelligence 2.0 - Client-Side Court Pleading & Statutory Notice Engine
 * Provides 100% offline parity for generating authentic High Court petitions, 
 * NI Act statutory notices, Consumer e-Daakhil plaints, and caution money refund demands.
 */

export interface PleadingFormData {
  pleading_type: string;
  court_name?: string;
  petitioner_name: string;
  petitioner_details?: string;
  respondent_name: string;
  respondent_details?: string;
  state_name?: string;
  case_number?: string;
  police_station?: string;
  dispute_amount?: string;
  incident_date?: string;
  cause_of_action?: string;
  facts_summary?: string;
  bank_name?: string;
  return_memo_date?: string;
  dishonour_reason?: string;
  advocate_name?: string;
  advocate_enrolment?: string;
  advocate_office?: string;
}

export interface PleadingPreset {
  key: string;
  title: string;
  forum: string;
  governing_statute: string;
  icon: string;
  desc: string;
  defaultCourt: string;
  defaultPetitioner: string;
  defaultPetitionerDetails: string;
  defaultRespondent: string;
  defaultRespondentDetails: string;
  defaultCaseNumber: string;
  defaultAmount: string;
  defaultFacts: string;
}

export const CLIENT_PLEADING_PRESETS: PleadingPreset[] = [
  {
    key: 'quashing_528_bnss',
    title: 'Criminal Quashing Petition (§528 BNSS / §482 CrPC)',
    forum: "Hon'ble High Court",
    governing_statute: 'Bharatiya Nagarik Suraksha Sanhita, 2023 § 528',
    icon: 'gavel',
    desc: 'High Court petition for quashing malicious or civil-turned-criminal FIRs under Bhajan Lal & Arnesh Kumar benchmarks.',
    defaultCourt: 'THE HIGH COURT OF JUDICATURE AT DELHI',
    defaultPetitioner: 'Sunil Sharma',
    defaultPetitionerDetails: 'S/o Sh. Ramesh Sharma, R/o Flat No. 402, Green Avenue, New Delhi - 110025',
    defaultRespondent: 'Vikram Patel',
    defaultRespondentDetails: 'R/o 12, Civil Lines, Kota, Rajasthan',
    defaultCaseNumber: 'FIR No. 248/2026',
    defaultAmount: '₹3,50,000/-',
    defaultFacts: 'The dispute between the parties arises out of a commercial and tenancy agreement wherein the complainant is attempting to convert a purely civil contractual dispute regarding security deposit adjustment into criminal offences of cheating and criminal intimidation.'
  },
  {
    key: 'notice_138_ni_act',
    title: 'Statutory Cheque Dishonour Notice (§138 NI Act)',
    forum: 'Advocate Legal Demand (Speed Post / Regd Post)',
    governing_statute: 'Negotiable Instruments Act, 1881 § 138, 141 & 142',
    icon: 'receipt_long',
    desc: 'Mandatory statutory 15-day payment demand notice with criminal prosecution warning for drawer and directors under Section 141.',
    defaultCourt: 'Court of Chief Judicial Magistrate / Metropolitan Magistrate',
    defaultPetitioner: 'M/s Apex Capital Solutions LLP',
    defaultPetitionerDetails: 'through its Partner Sh. Alok Verma, Connaught Place, New Delhi',
    defaultRespondent: 'Rohit Agarwal, Managing Director',
    defaultRespondentDetails: 'M/s Prime Mercantile India Pvt. Ltd., Industrial Area, Phase-I, Gurugram, Haryana',
    defaultCaseNumber: 'Cheque No. 408192',
    defaultAmount: '₹12,50,000/- (Rupees Twelve Lakhs Fifty Thousand Only)',
    defaultFacts: 'The cheque was issued in discharge of legally enforceable commercial debt for services rendered and invoice obligations acknowledged in writing.'
  },
  {
    key: 'consumer_complaint_35_cpa',
    title: 'e-Daakhil Consumer Complaint Plaint (§35 CPA)',
    forum: 'District Consumer Disputes Redressal Commission (DCDRC)',
    governing_statute: 'Consumer Protection Act, 2019 § 35, 2(46) & 2(47)',
    icon: 'storefront',
    desc: 'Formal consumer plaint seeking full caution money refund with 18% p.a. interest, damages for harassment, and declaring lock-in clauses void.',
    defaultCourt: 'DISTRICT CONSUMER DISPUTES REDRESSAL COMMISSION (DCDRC) AT KOTA, RAJASTHAN',
    defaultPetitioner: 'Rahul Meena',
    defaultPetitionerDetails: 'Age 20 years, Student, R/o Room 204, Landmark Residency, Vigyan Nagar, Kota, Rajasthan',
    defaultRespondent: 'Landmark Residency & Hostel Management',
    defaultRespondentDetails: 'Through its Managing Partner / Warden, Vigyan Nagar, Kota, Rajasthan',
    defaultCaseNumber: 'Consumer Complaint No. _____ / 2026',
    defaultAmount: '₹35,000/- (Rupees Thirty-Five Thousand Only)',
    defaultFacts: 'The complainant was constrained to leave the hostel prematurely owing to unavoidable family medical and financial emergency. The Opposite Party arbitrarily refused to refund or adjust the security caution deposit relying on a predatory adhesion 10-month lock-in clause in violation of Kota Collectorate circulars and Section 2(46) of the Consumer Protection Act, 2019.'
  },
  {
    key: 'deposit_refund_notice',
    title: 'Student / Tenant Caution Money Refund Notice',
    forum: 'Direct Legal Demand (Speed Post / WhatsApp / Email)',
    governing_statute: 'Indian Contract Act § 74, CPA § 2(46), Kota Collectorate Guidelines',
    icon: 'mark_email_read',
    desc: 'Immediate 7-day statutory restitution demand nullifying illegal non-refund lock-in terms with e-Daakhil and administrative escalation notice.',
    defaultCourt: 'Direct Pre-Litigation Legal Demand',
    defaultPetitioner: 'Student / Resident Inquirer',
    defaultPetitionerDetails: 'Ex-Resident, Room No. 204, Coral Park, Kota, Rajasthan',
    defaultRespondent: 'The Hostel Warden / Management',
    defaultRespondentDetails: 'Landmark Residency & Hostels, Coral Park, Kota, Rajasthan',
    defaultCaseNumber: 'Notice Ref: BLI/KOTA/2026/01',
    defaultAmount: '₹30,000/-',
    defaultFacts: 'Unreturned caution security money under arbitrary lock-in clauses despite genuine emergency and premature exit.'
  }
];

function val(d: PleadingFormData, key: keyof PleadingFormData, fallback: string): string {
  const v = d[key];
  if (v !== undefined && v !== null && String(v).trim().length > 0) {
    return String(v).trim();
  }
  return fallback;
}

export function generateClientPleading(data: PleadingFormData): {
  title: string;
  forum: string;
  governing_statute: string;
  pleading_text: string;
  engine: string;
} {
  const preset = CLIENT_PLEADING_PRESETS.find(p => p.key === data.pleading_type) || CLIENT_PLEADING_PRESETS[0];

  let text = '';
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  if (preset.key === 'quashing_528_bnss') {
    const court = val(data, 'court_name', preset.defaultCourt);
    const pet = val(data, 'petitioner_name', preset.defaultPetitioner);
    const petDet = val(data, 'petitioner_details', preset.defaultPetitionerDetails);
    const resp = val(data, 'respondent_name', preset.defaultRespondent);
    const respDet = val(data, 'respondent_details', preset.defaultRespondentDetails);
    const stName = val(data, 'state_name', 'State (NCT of Delhi)');
    const fir = val(data, 'case_number', preset.defaultCaseNumber);
    const ps = val(data, 'police_station', 'P.S. Connaught Place');
    const incDate = val(data, 'incident_date', '14th March, 2026');
    const facts = val(data, 'facts_summary', preset.defaultFacts);
    const adv = val(data, 'advocate_name', 'Advocate A. K. Verma & Associates');
    const enrol = val(data, 'advocate_enrolment', 'D/1452/2018');

    text = `IN ${court.toUpperCase()}
CRIMINAL MISCELLANEOUS PETITION NO. _____ OF 2026
(UNDER SECTION 528 OF THE BHARATIYA NAGARIK SURAKSHA SANHITA, 2023)

IN THE MATTER OF:
${pet.toUpperCase()},
${petDet}
                                                        ...PETITIONER

                                VERSUS

1. ${stName.toUpperCase()}
   THROUGH SHO, ${ps.toUpperCase()}
                                                        ...RESPONDENT NO. 1

2. ${resp.toUpperCase()},
   ${respDet}
                                                        ...RESPONDENT NO. 2 / COMPLAINANT

MEMORANDUM OF CRIMINAL MISCELLANEOUS PETITION UNDER SECTION 528 OF THE 
BHARATIYA NAGARIK SURAKSHA SANHITA, 2023 (BNSS) FOR QUASHING OF ${fir.toUpperCase()} 
DATED ${incDate.toUpperCase()} REGISTERED AT ${ps.toUpperCase()} UNDER SECTIONS 318(4) / 
351(2) OF BHARATIYA NYAYA SANHITA, 2023 AND ALL PROCEEDINGS ARISING THEREFROM.

TO,
THE HON'BLE THE CHIEF JUSTICE AND HIS COMPANION JUSTICES OF THE HON'BLE HIGH COURT.

THE HUMBLE PETITION OF THE PETITIONER ABOVENAMED:

MOST RESPECTFULLY SHOWETH:

1. SYNOPSIS & CHRONOLOGICAL LIST OF DATES:
   (a) ${incDate}: Parties entered into mutual commercial/tenancy arrangement.
   (b) Subsequent Date: Dispute arose strictly regarding contractual interpretation and deposit adjustment.
   (c) Registration Date: Respondent No. 2 lodged impugned ${fir} falsely attributing criminal cheating and intimidation.
   (d) Present Date: Petitioner files this petition under Section 528 BNSS (formerly Section 482 CrPC) as continuation of proceedings constitutes gross abuse of the process of law.

2. STATEMENT OF MATERIAL FACTS:
   ${facts}
   That a bare perusal of the impugned FIR reveals that no prima facie offence under Section 318(4) BNS (formerly Section 420 IPC) or Section 351(2) BNS (formerly Section 506 IPC) is disclosed against the Petitioner.

3. GROUNDS FOR QUASHING:
   A. CIVIL DISPUTE CRIMINALIZED (HIT BY BHAJAN LAL RATIO):
      The Hon'ble Supreme Court in 'State of Haryana v. Bhajan Lal', [1992] Supp (1) SCC 335, and recently reaffirmed in 'Prof. R.K. Vijayasarathy v. Sudha Seetharam', [2019] 16 SCC 739, categorically held that criminal proceedings instituted with an ulterior motive for wreaking vengeance on a private dispute of civil nature must be quashed under the inherent powers of the High Court.

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
(i) Quash and set aside the impugned ${fir} registered at ${ps} under Sections 318(4)/351(2) of the Bharatiya Nyaya Sanhita, 2023 and all consequential proceedings emanating therefrom;
(ii) Grant ad-interim ex-parte stay of all coercive proceedings and investigation against the Petitioner during the pendency of the present petition; and
(iii) Pass such other or further order(s) as this Hon'ble Court may deem fit and proper in the interest of justice.

AND FOR THIS ACT OF KINDNESS, THE PETITIONER AS IN DUTY BOUND SHALL EVER PRAY.

FILED BY:

${adv.toUpperCase()}
COUNSEL FOR THE PETITIONER
ENROLMENT NO.: ${enrol}
CHAMBER: HIGH COURT BAR ASSOCIATION
PLACE: ${court}
DATE: ${dateStr}

================================================================================
                              VERIFICATION AFFIDAVIT
================================================================================
I, ${pet}, age adult, ${petDet}, do hereby solemnly affirm and declare on oath as under:
1. That I am the Petitioner in the above petition and am fully conversant with the facts of the case and competent to swear this affidavit.
2. That the contents of paragraphs 1 to 4 of the petition are true and correct to my knowledge derived from official records and legal advice, and nothing material has been concealed therefrom.

DEPONENT

VERIFICATION:
Verified at on this ${dateStr} that the contents of the above affidavit are true and correct.
DEPONENT`;
  } else if (preset.key === 'notice_138_ni_act') {
    const adv = val(data, 'advocate_name', 'Advocate Rajeshwar Singh & Partners');
    const enrol = val(data, 'advocate_enrolment', 'D/892/2014');
    const office = val(data, 'advocate_office', 'Chamber 418, Lawyers Chambers Block, High Court of Delhi');
    const payee = val(data, 'petitioner_name', preset.defaultPetitioner);
    const payeeAddr = val(data, 'petitioner_details', preset.defaultPetitionerDetails);
    const drawer = val(data, 'respondent_name', preset.defaultRespondent);
    const drawerAddr = val(data, 'respondent_details', preset.defaultRespondentDetails);
    const chqNo = val(data, 'case_number', preset.defaultCaseNumber);
    const chqDate = val(data, 'incident_date', '28th August, 2026');
    const chqAmt = val(data, 'dispute_amount', preset.defaultAmount);
    const bank = val(data, 'bank_name', 'HDFC Bank Ltd., Connaught Place Branch');
    const memoDate = val(data, 'return_memo_date', '10th September, 2026');
    const memoReason = val(data, 'dishonour_reason', 'Funds Insufficient');

    text = `LEGAL DEMAND NOTICE UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881
(DELIVERED VIA SPEED POST WITH A.D. & REGISTERED EMAIL / WHATSAPP)

FROM:
${adv.toUpperCase()}
ADVOCATE, HIGH COURT & SUPREME COURT OF INDIA
${office}
BAR COUNCIL ENROLMENT NO.: ${enrol}
CONTACT: legal.counsel@bharatlegal.in

DATE: ${dateStr}

TO:
1. ${drawer.toUpperCase()}
   ${drawerAddr}
2. M/s Prime Mercantile India Pvt. Ltd. (Corporate Drawer)
   Through its Board of Directors

SUBJECT: STATUTORY DEMAND NOTICE UNDER SECTION 138 READ WITH SECTION 141 & 142 
         OF THE NEGOTIABLE INSTRUMENTS ACT, 1881 FOR DISHONOUR OF ${chqNo.toUpperCase()} 
         FOR AMOUNT OF ${chqAmt.toUpperCase()}.

SIR / MADAM,

Under instructions from, and on behalf of, our Client, ${payee.toUpperCase()}, ${payeeAddr} (hereinafter referred to as "Our Client"), we hereby serve upon you this Statutory Legal Demand Notice:

1. LEGALLY ENFORCEABLE DEBT & LIABILITY:
   Our Client and you entered into commercial transactions wherein goods/services were supplied to you against verified invoices. Towards the lawful discharge of your admitted, legally enforceable liability, you issued and handed over to Our Client the following negotiable instrument:
   - Cheque Number: ${chqNo}
   - Cheque Date: ${chqDate}
   - Cheque Amount: ${chqAmt}
   - Drawn On: ${bank}

2. BANK PRESENTATION & STATUTORY DISHONOUR:
   Our Client presented the said Cheque for encashment through their banker within the period of its validity. However, the said Cheque was returned dishonoured and unpaid by your banker vide Banker's Return Memo dated ${memoDate} with the official endorsement:
   "${memoReason.toUpperCase()}"

3. PRESUMPTIONS OF LAW UNDER SECTION 118 & 139 NI ACT:
   The dishonour of the said cheque conclusively establishes your failure to maintain sufficient funds in your bank account. Under Section 139 of the Negotiable Instruments Act, 1881, there is a mandatory statutory presumption in favour of Our Client that the cheque was received for the discharge of a debt or liability.

4. VICARIOUS CRIMINAL LIABILITY UNDER SECTION 141 NI ACT:
   Take notice that as Managing Director / Director actively in-charge of and responsible to the Company for the conduct of its business, you are personally, jointly, and severally liable for criminal prosecution along with the Company pursuant to Section 141 of the Negotiable Instruments Act, 1881 ('SMS Pharmaceuticals Ltd. v. Neeta Bhalla', (2005) 8 SCC 89).

5. STATUTORY 15-DAY MANDATORY PAYMENT DEMAND:
   Pursuant to Section 138, Clause (c) of the Negotiable Instruments Act, 1881, we hereby formally call upon you to pay the entire cheque amount of ${chqAmt} to Our Client within FIFTEEN (15) DAYS from the date of receipt of this notice, by way of Demand Draft, NEFT/RTGS, or verified bank transfer.

6. NOTICE OF CRIMINAL COMPLAINT & CIVIL REMEDIES:
   Take notice that in the event you fail to make payment of the said amount within the stipulated statutory period of 15 days, Our Client has issued strict instructions to initiate:
   (a) A Criminal Complaint under Section 138 & 141 of the Negotiable Instruments Act, 1881 before the competent Judicial Magistrate having territorial jurisdiction under Section 142(2) NI Act, wherein you shall be liable to be punished with imprisonment for a term up to TWO (2) YEARS, or with fine which may extend to TWICE THE AMOUNT OF THE CHEQUE, or with both;
   (b) Summary Commercial Suit under Order XXXVII of the Code of Civil Procedure, 1908 for recovery of principal sum along with interest @ 18% per annum and full litigation costs;
   (c) Proceedings under Section 318(4) of the Bharatiya Nyaya Sanhita, 2023 for criminal breach of trust and cheating if fraudulent inception is established.

Yours faithfully,

${adv.toUpperCase()}
ADVOCATE FOR THE PAYEE / COMPLAINANT`;
  } else if (preset.key === 'consumer_complaint_35_cpa') {
    const court = val(data, 'court_name', preset.defaultCourt);
    const comp = val(data, 'petitioner_name', preset.defaultPetitioner);
    const compDet = val(data, 'petitioner_details', preset.defaultPetitionerDetails);
    const op = val(data, 'respondent_name', preset.defaultRespondent);
    const opDet = val(data, 'respondent_details', preset.defaultRespondentDetails);
    const amt = val(data, 'dispute_amount', preset.defaultAmount);
    const incDate = val(data, 'incident_date', '10th August, 2026');
    const facts = val(data, 'facts_summary', preset.defaultFacts);

    text = `BEFORE THE HON'BLE ${court.toUpperCase()}
CONSUMER COMPLAINT NO. _____ OF 2026
(UNDER SECTION 35 OF THE CONSUMER PROTECTION ACT, 2019)

IN THE MATTER OF:
${comp.toUpperCase()},
${compDet}
                                                        ...COMPLAINANT

                                VERSUS

${op.toUpperCase()},
${opDet}
                                                        ...OPPOSITE PARTY

COMPLAINT UNDER SECTION 35 OF THE CONSUMER PROTECTION ACT, 2019 ON BEHALF OF THE 
COMPLAINANT AGAINST UNFAIR TRADE PRACTICE, UNFAIR CONTRACT PURSUANT TO SECTION 
2(46), AND DEFICIENCY IN SERVICE PURSUANT TO SECTION 2(11) IN ARBITRARY FORFEITURE 
OF SECURITY DEPOSIT AMOUNTING TO ${amt.toUpperCase()}.

MOST RESPECTFULLY SHOWETH:

1. STATUS AS 'CONSUMER' UNDER SECTION 2(7) CPA 2019:
   The Complainant is a student and availed residential accommodation, amenities, and food services from the Opposite Party upon payment of consideration, and is therefore a bona fide 'Consumer' under Section 2(7) of the Consumer Protection Act, 2019.

2. STATEMENT OF MATERIAL FACTS:
   (a) The Complainant was admitted to Opposite Party's facility and deposited an advance caution security amount of ${amt} against official receipt.
   (b) ${facts}
   (c) On ${incDate}, Complainant issued formal written notice seeking refund/adjustment of deposit. Opposite Party illegally rejected the request citing a one-sided boilerplate clause.

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
(i) Direct the Opposite Party to immediately refund the security deposit of ${amt} along with interest @ 18% per annum from ${incDate} until full realization;
(ii) Direct the Opposite Party to pay compensation of ₹50,000/- for acute mental harassment, agony, and consumer exploitation;
(iii) Award litigation costs of ₹15,000/- in favour of the Complainant; and
(iv) Pass such further order(s) as deemed fit in the interest of justice.

COMPLAINANT THROUGH COUNSEL

================================================================================
                              VERIFICATION AFFIDAVIT
================================================================================
I, ${comp}, the Complainant, do hereby verify that paragraphs 1 to 4 of this complaint are true to my personal knowledge and belief. No part is false.
DEPONENT`;
  } else {
    // deposit_refund_notice
    const sender = val(data, 'petitioner_name', preset.defaultPetitioner);
    const senderDet = val(data, 'petitioner_details', preset.defaultPetitionerDetails);
    const recp = val(data, 'respondent_name', preset.defaultRespondent);
    const recpDet = val(data, 'respondent_details', preset.defaultRespondentDetails);
    const amt = val(data, 'dispute_amount', preset.defaultAmount);
    const facts = val(data, 'facts_summary', preset.defaultFacts);

    text = `LEGAL DEMAND NOTICE (DELIVERED VIA SPEED POST / REGISTERED EMAIL & WHATSAPP)

DATE: ${dateStr}

TO:
${recp.toUpperCase()}
${recpDet}

SUBJECT: FINAL STATUTORY DEMAND NOTICE FOR IMMEDIATE REFUND OF UNRETURNED SECURITY 
         DEPOSIT OF ${amt} UNDER SECTION 74 OF THE INDIAN CONTRACT ACT, 1872, 
         SECTION 2(46) OF CONSUMER PROTECTION ACT, 2019, AND DISTRICT GUIDELINES.

SIR / MADAM,

I, ${sender}, ${senderDet}, hereby serve upon you this Final Statutory Demand Notice:

1. SUMMARY OF ADMITTED OCCUPANCY & TRANSACTION:
   I occupied room accommodation at your premises after depositing an advance caution deposit of ${amt}. ${facts}

2. UNLAWFUL CHARACTER OF "LOCK-IN / NON-REFUNDABLE" RETENTION:
   Your refusal to adjust or refund the caution deposit relying on a clause asserting that "security deposit will only be adjusted on completion of 10 months" is VOID and UNLAWFUL in the Republic of India:
   - Section 74 of the Indian Contract Act, 1872 strictly invalidates arbitrary penal forfeiture where no actual financial loss is established ('Kailash Nath Associates v. DDA', (2015) 4 SCC 136).
   - Section 2(46) & 2(47) of the Consumer Protection Act, 2019 classifies one-sided forfeiture clauses as an 'Unfair Contract' and 'Unfair Trade Practice'.
   - District Collectorate Directives strictly forbid hostel managements from withholding caution money when a student is compelled to leave due to circumstances beyond their control.

3. FINAL 7-DAY RECTIFICATION DEMAND:
   I hereby formally demand that you refund the entire sum of ${amt} to my bank account within SEVEN (7) DAYS of receipt of this notice.

4. NOTICE OF REDRESSAL ACTION:
   Should you fail to comply within 7 days, please take notice that I shall immediately initiate:
   (a) Formal complaint before the District Collector / Student Welfare Cell (Helpline: 0744-2325342);
   (b) Online Consumer Complaint on the National Consumer Portal e-Daakhil seeking refund with 18% p.a. interest, ₹50,000/- compensation for harassment, and costs;
   (c) Formal police representation under Section 318(4) & Section 351(2) of the Bharatiya Nyaya Sanhita, 2023 if unreturned funds are misappropriated.

Yours sincerely,

${sender.toUpperCase()}`;
  }

  return {
    title: preset.title,
    forum: preset.forum,
    governing_statute: preset.governing_statute,
    pleading_text: text,
    engine: 'Bharat Court Pleading Engine (Deterministic High Court Compliance)'
  };
}
