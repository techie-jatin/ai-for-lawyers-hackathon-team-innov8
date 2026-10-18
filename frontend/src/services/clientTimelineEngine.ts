/**
 * clientTimelineEngine.ts - Client Parity Engine for Interactive Dispute Timeline Visualizer
 * Bharat Legal Intelligence 2.0 (Reverse Engineer Anything - REA Methodology)
 *
 * Provides 100% offline standalone date math, limitation deadlines, and statutory milestones
 * for Indian legal dispute archetypes.
 */

export interface TimelineMilestone {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  formatted_date: string;
  phase: 'trigger' | 'statutory_notice' | 'cure_period' | 'cause_of_action' | 'limitation_deadline' | 'mediation' | 'investigation' | 'safeguards' | 'court_filing' | 'adjudication' | 'grievance_portal';
  days_from_anchor: number;
  days_remaining: number;
  status: 'completed' | 'active_now' | 'upcoming' | 'attention' | 'critical_warning' | 'fatal_expired';
  is_deadline: boolean;
  statutory_provision: string;
  statutory_act: string;
  legal_consequence: string;
  precedent_citation: string;
  actionable_guidance: string;
}

export interface LimitationSummary {
  name: string;
  date: string;
  days_remaining: number;
  is_expired: boolean;
  statutory_provision: string;
  urgency_rating: 'SAFE' | 'ATTENTION' | 'CRITICAL' | 'FATAL_EXPIRED';
  remedy_status: string;
}

export interface TimelineArchetype {
  key: string;
  title: string;
  statute_badge: string;
  category: string;
  icon: string;
  color_accent: string;
  anchor_label: string;
  summary: string;
  governing_statutes: string[];
  landmark_precedents: string[];
}

export interface CalculatedTimeline {
  archetype: TimelineArchetype;
  anchor_date: string;
  today_date: string;
  total_milestones: number;
  milestones: TimelineMilestone[];
  limitation_summary: LimitationSummary;
}

export const CLIENT_TIMELINE_ARCHETYPES: TimelineArchetype[] = [
  {
    key: 'cheque_bounce_138_ni',
    title: 'Cheque Dishonour & Prosecution',
    statute_badge: '§138 & §142 NI Act 1881',
    category: 'Criminal & Banking',
    icon: 'receipt_long',
    color_accent: 'emerald',
    anchor_label: 'Date of Bank Cheque Return Memo',
    summary: 'Mandatory 30-day notice window, 15-day repayment cure period, and strict 1-month limitation to file criminal complaint before Judicial Magistrate.',
    governing_statutes: [
      'Negotiable Instruments Act, 1881 (§138, §139, §142)',
      'General Clauses Act, 1897 (§27 - Deemed Service)',
      'Bharatiya Nagarik Suraksha Sanhita, 2023 (§190 - Cognizance)'
    ],
    landmark_precedents: [
      'Dalmia Cement (Bharat) Ltd. v. Galaxy Traders & Agencies Ltd. [2001] 1 SCC 631',
      'C.C. Alavi Haji v. Palapetty Muhammed (2007) 6 SCC 555',
      'Dashrath Rupsingh Rathod v. State of Maharashtra [2014] 9 SCC 129'
    ]
  },
  {
    key: 'consumer_complaint_35_cpa',
    title: 'Consumer Deficiency & e-Daakhil Redressal',
    statute_badge: '§35 & §69 CPA 2019',
    category: 'Consumer Protection',
    icon: 'shopping_cart',
    color_accent: 'blue',
    anchor_label: 'Date of Deficiency / Defect / Unfair Transaction',
    summary: '15-day pre-litigation grievance notice, National Consumer Helpline escalation, and inviolable 2-year limitation to file on e-Daakhil.',
    governing_statutes: [
      'Consumer Protection Act, 2019 (§2(46), §35, §37, §69)',
      'Consumer Protection (Consumer Commission Procedure) Regulations, 2020'
    ],
    landmark_precedents: [
      'State Bank of India v. B.S. Agriculture Industries [2009] 5 SCC 121',
      'National Insurance Co. Ltd. v. Harsolia Motors (2023) INSC 362',
      'Lucknow Development Authority v. M.K. Gupta [1994] 1 SCC 243'
    ]
  },
  {
    key: 'contract_breach_deposit_refund',
    title: 'Commercial Breach & Deposit / Rent Refund',
    statute_badge: '§73 & §74 ICA 1872 • Art. 55 Limitation',
    category: 'Civil & Tenancy',
    icon: 'apartment',
    color_accent: 'amber',
    anchor_label: 'Date of Breach / Eviction / Refusal to Refund',
    summary: 'Demand notice asserting invalidity of penal forfeiture, pre-institution commercial mediation, and 3-year money recovery limitation.',
    governing_statutes: [
      'Indian Contract Act, 1872 (§73 - Direct Damages, §74 - Penalties)',
      'Limitation Act, 1963 (Schedule Division I, Article 55 & Article 113)',
      'Commercial Courts Act, 2015 (§12A - Mandatory Pre-Institution Mediation)'
    ],
    landmark_precedents: [
      'Kailash Nath Associates v. Delhi Development Authority [2015] 4 SCC 136',
      'Patil Automation Pvt. Ltd. v. Rakheja Engineers Pvt. Ltd. [2022] 10 SCC 1',
      'Fateh Chand v. Balkishan Dass [1964] 1 SCR 515'
    ]
  },
  {
    key: 'criminal_investigation_bnss',
    title: 'FIR, Arrest, Production & Default Bail',
    statute_badge: '§35, §58 & §187 BNSS 2023',
    category: 'Criminal Procedure',
    icon: 'shield',
    color_accent: 'rose',
    anchor_label: 'Date of FIR Lodged / Police Arrest',
    summary: 'Preliminary inquiry for 3–7 year offenses, Section 35(3) notice of appearance, 24-hr magistrate production, and 60/90-day default bail.',
    governing_statutes: [
      'Bharatiya Nagarik Suraksha Sanhita, 2023 (§35, §58, §173, §187, §531)',
      'Constitution of India (Article 21 & Article 22(2))'
    ],
    landmark_precedents: [
      'Arnesh Kumar v. State of Bihar [2014] 8 SCC 273',
      'D.K. Basu v. State of West Bengal [1997] 1 SCC 416',
      'Bikramjit Singh v. State of Punjab [2020] 10 SCC 616'
    ]
  },
  {
    key: 'commercial_arbitration_act',
    title: 'Arbitration Invocation & Award Challenge',
    statute_badge: '§11, §21 & §34 Arbitration Act 1996',
    category: 'Commercial ADR',
    icon: 'gavel',
    color_accent: 'purple',
    anchor_label: 'Date Dispute Arose / Claim Rejection',
    summary: 'Section 21 notice of arbitration within 3 years, 30-day arbitrator appointment window, 12-month award delivery, and 3-month §34 limitation.',
    governing_statutes: [
      'Arbitration and Conciliation Act, 1996 (§11, §21, §29A, §34)',
      'Limitation Act, 1963 (Article 137)'
    ],
    landmark_precedents: [
      'Union of India v. Popular Construction Co. [2001] 8 SCC 470',
      'Perkins Eastman Architects DPC v. HSCC (India) Ltd. [2020] 20 SCC 760',
      'Bharat Aluminium Co. (BALCO) v. Kaiser Aluminium [2012] 9 SCC 552'
    ]
  },
  {
    key: 'motor_accident_mact',
    title: 'Motor Accident Compensation (MACT)',
    statute_badge: '§159 & §166(3) MV Act 1988',
    category: 'Motor Accident',
    icon: 'car_crash',
    color_accent: 'cyan',
    anchor_label: 'Date of Motor Vehicle Accident',
    summary: 'Police Detailed Accident Report (DAR) within 90 days, and strict 6-month statutory limitation to lodge claim petition before MACT.',
    governing_statutes: [
      'Motor Vehicles (Amendment) Act, 2019 (§166(3))',
      'Motor Vehicles Act, 1988 (§159, §166)'
    ],
    landmark_precedents: [
      'National Insurance Co. Ltd. v. Pranay Sethi [2017] 16 SCC 680',
      'Sarla Verma v. Delhi Transport Corporation [2009] 6 SCC 121'
    ]
  },
  {
    key: 'rti_appeal_lifecycle',
    title: 'RTI Request & 2-Tier Appeals Escalation',
    statute_badge: '§7 & §19 RTI Act 2005',
    category: 'Administrative Law',
    icon: 'description',
    color_accent: 'teal',
    anchor_label: 'Date RTI Application Submitted to CPIO',
    summary: '30-day CPIO reply deadline, 30-day First Appeal window to FAA, 45-day FAA decision order, and 90-day Second Appeal to CIC/SIC.',
    governing_statutes: [
      'Right to Information Act, 2005 (§7(1), §19(1), §19(3), §19(6))'
    ],
    landmark_precedents: [
      'Central Board of Secondary Education v. Aditya Bandopadhyay [2011] 8 SCC 497',
      'Chief Information Commissioner v. State of Manipur (2011) 15 SCC 1'
    ]
  }
];

// Helper functions for date math
function parseLocalDate(dateStr: string): Date {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }
  return new Date();
}

function formatDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDateDisplay(d: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(d.getDate()).padStart(2, '0');
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function addDays(d: Date, days: number): Date {
  const res = new Date(d.getTime());
  res.setDate(res.getDate() + days);
  return res;
}

function addMonths(d: Date, months: number): Date {
  const res = new Date(d.getTime());
  const targetMonth = res.getMonth() + months;
  res.setMonth(targetMonth);
  // Handle overflow if day doesn't exist in target month
  if (res.getMonth() > (targetMonth % 12)) {
    res.setDate(0);
  }
  return res;
}

function addYears(d: Date, years: number): Date {
  const res = new Date(d.getTime());
  res.setFullYear(res.getFullYear() + years);
  return res;
}

function dayDiff(d1: Date, d2: Date): number {
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return Math.round((utc1 - utc2) / (1000 * 60 * 60 * 24));
}

interface RawMilestone {
  id: string;
  title: string;
  date: Date;
  phase: TimelineMilestone['phase'];
  is_deadline: boolean;
  statutory_provision: string;
  statutory_act: string;
  legal_consequence: string;
  precedent_citation: string;
  actionable_guidance: string;
}

export function calculateClientTimeline(
  archetypeKey: string,
  anchorDateStr: string,
  currentDateOverride?: string
): CalculatedTimeline {
  const anchorDate = parseLocalDate(anchorDateStr);
  const today = currentDateOverride ? parseLocalDate(currentDateOverride) : new Date();

  const archetype = CLIENT_TIMELINE_ARCHETYPES.find(a => a.key === archetypeKey) || CLIENT_TIMELINE_ARCHETYPES[0];
  const key = archetype.key;

  let rawList: RawMilestone[] = [];

  if (key === 'cheque_bounce_138_ni') {
    const d0 = anchorDate;
    const dNoticeLimit = addDays(d0, 30);
    const dDeemedService = addDays(d0, 33);
    const dCureEnd = addDays(dDeemedService, 15);
    const dCauseAccrual = addDays(dCureEnd, 1);
    const dComplaintLimit = addMonths(dCauseAccrual, 1);

    rawList = [
      {
        id: 'ni_memo_received',
        title: 'Cheque Return Memo Received',
        date: d0,
        phase: 'trigger',
        is_deadline: false,
        statutory_provision: 'Section 138 Proviso (a) NI Act 1881',
        statutory_act: 'Negotiable Instruments Act, 1881',
        legal_consequence: 'Clock starts ticking. Cheque was presented within its 3-month validity period and returned unpaid with bank memo.',
        precedent_citation: 'Dalmia Cement (Bharat) Ltd. v. Galaxy Traders & Agencies Ltd. [2001] 1 SCC 631',
        actionable_guidance: 'Obtain original cheque return memo with bank stamp specifying reason (Funds Insufficient / Account Closed).'
      },
      {
        id: 'ni_notice_window',
        title: 'Statutory 30-Day Notice Dispatch Deadline',
        date: dNoticeLimit,
        phase: 'statutory_notice',
        is_deadline: true,
        statutory_provision: 'Section 138 Proviso (b) NI Act 1881',
        statutory_act: 'Negotiable Instruments Act, 1881',
        legal_consequence: 'Fatal condition precedent. If formal written demand notice is not dispatched within 30 days of memo receipt, criminal remedy under §138 is completely extinguished.',
        precedent_citation: 'Dashrath Rupsingh Rathod v. State of Maharashtra [2014] 9 SCC 129',
        actionable_guidance: 'Issue formal demand notice via Speed Post / Registered AD demanding payment of exact cheque amount within 15 days.'
      },
      {
        id: 'ni_deemed_service',
        title: 'Deemed / Presumed Postal Delivery',
        date: dDeemedService,
        phase: 'statutory_notice',
        is_deadline: false,
        statutory_provision: 'Section 27 General Clauses Act, 1897',
        statutory_act: 'General Clauses Act, 1897',
        legal_consequence: 'Presumption of service arises when notice is sent to drawer\'s correct address by registered post.',
        precedent_citation: 'C.C. Alavi Haji v. Palapetty Muhammed (2007) 6 SCC 555',
        actionable_guidance: 'Preserve postal tracking receipt and India Post delivery confirmation sheet.'
      },
      {
        id: 'ni_cure_window',
        title: '15-Day Repayment Cure Period Expiry',
        date: dCureEnd,
        phase: 'cure_period',
        is_deadline: true,
        statutory_provision: 'Section 138 Proviso (c) NI Act 1881',
        statutory_act: 'Negotiable Instruments Act, 1881',
        legal_consequence: 'Drawer has 15 full days to pay without penal consequences. No complaint can be filed before the 15 days expire (premature complaint is void).',
        precedent_citation: 'Yogendra Pratap Singh v. Savitri Pandey [2014] 10 SCC 713',
        actionable_guidance: 'Monitor bank account for payment credit. Do not file complaint prematurely.'
      },
      {
        id: 'ni_cause_accrual',
        title: 'Accrual of Criminal Cause of Action',
        date: dCauseAccrual,
        phase: 'cause_of_action',
        is_deadline: false,
        statutory_provision: 'Section 142(1)(a) NI Act 1881',
        statutory_act: 'Negotiable Instruments Act, 1881',
        legal_consequence: 'The statutory offence under Section 138 is fully constituted on the 16th day following notice receipt.',
        precedent_citation: 'Saketh India Ltd. v. India Securities Ltd. [1999] 3 SCC 1',
        actionable_guidance: 'Finalize draft complaint, affidavit in evidence, and list of documents for filing before CJM / MM.'
      },
      {
        id: 'ni_complaint_limitation',
        title: 'Statutory Limitation to File Criminal Complaint',
        date: dComplaintLimit,
        phase: 'limitation_deadline',
        is_deadline: true,
        statutory_provision: 'Section 142(1)(b) NI Act 1881',
        statutory_act: 'Negotiable Instruments Act, 1881',
        legal_consequence: 'Complaint must be filed within 1 month of cause of action. Delay requires filing a formal condonation application showing sufficient cause under the Proviso.',
        precedent_citation: 'Pawan Kumar Ralli v. Maninder Singh Narula [2014] 15 SCC 245',
        actionable_guidance: 'File complaint before the Metropolitan Magistrate (MM) / Judicial Magistrate First Class (JMFC) having territorial jurisdiction over the drawee bank branch.'
      }
    ];
  } else if (key === 'consumer_complaint_35_cpa') {
    const d0 = anchorDate;
    const dNotice = addDays(d0, 15);
    const dNch = addDays(d0, 30);
    const dMed = addDays(d0, 60);
    const dLimitation = addYears(d0, 2);

    rawList = [
      {
        id: 'cpa_trigger',
        title: 'Deficiency in Service / Unfair Trade Practice Occurred',
        date: d0,
        phase: 'trigger',
        is_deadline: false,
        statutory_provision: 'Section 2(11) & Section 2(47) CPA 2019',
        statutory_act: 'Consumer Protection Act, 2019',
        legal_consequence: 'Cause of action arises on the date deficiency or unfair trade practice occurred.',
        precedent_citation: 'Lucknow Development Authority v. M.K. Gupta [1994] 1 SCC 243',
        actionable_guidance: 'Preserve invoices, warranty cards, screenshots, email chains, and payment transaction receipts.'
      },
      {
        id: 'cpa_notice',
        title: 'Dispatch Pre-Litigation Legal Demand Notice',
        date: dNotice,
        phase: 'statutory_notice',
        is_deadline: false,
        statutory_provision: 'Section 35 CPA 2019 Procedural Practice',
        statutory_act: 'Consumer Protection Act, 2019',
        legal_consequence: 'Gives the opposite party 15 days to rectify defect or refund amount, demonstrating bona fide consumer attempt.',
        precedent_citation: 'National Insurance Co. Ltd. v. Harsolia Motors (2023) INSC 362',
        actionable_guidance: 'Send legal demand notice via registered email and post giving 15 days to refund/replace.'
      },
      {
        id: 'cpa_nch',
        title: 'National Consumer Helpline (NCH 1915) Grievance',
        date: dNch,
        phase: 'grievance_portal',
        is_deadline: false,
        statutory_provision: 'CCPA Grievance Redressal Directives',
        statutory_act: 'Consumer Protection Act, 2019',
        legal_consequence: 'Free governmental mediation portal. Docket ID serves as documentary evidence of failure to resolve.',
        precedent_citation: 'Ministry of Consumer Affairs Guidelines 2020',
        actionable_guidance: 'Register complaint on consumerhelpline.gov.in (Toll Free 1915 or INGRAM app).'
      },
      {
        id: 'cpa_mediation',
        title: 'Pre-Litigation Consumer Mediation Window',
        date: dMed,
        phase: 'mediation',
        is_deadline: false,
        statutory_provision: 'Section 37 CPA 2019 (Consumer Mediation Cell)',
        statutory_act: 'Consumer Protection Act, 2019',
        legal_consequence: 'Parties may consent to mediation before the Consumer Commission Mediation Cell with zero court fee.',
        precedent_citation: 'Section 37 & 38 CPA 2019 Statutory Procedure',
        actionable_guidance: 'Assess if opposite party is amenable to settlement before formal e-filing.'
      },
      {
        id: 'cpa_limitation',
        title: 'Strict 2-Year Limitation Deadline (e-Daakhil)',
        date: dLimitation,
        phase: 'limitation_deadline',
        is_deadline: true,
        statutory_provision: 'Section 69(1) CPA 2019',
        statutory_act: 'Consumer Protection Act, 2019',
        legal_consequence: 'District / State Commission cannot admit complaint unless filed within 2 years from date on which cause of action arose. Delay requires strict application u/s 69(2).',
        precedent_citation: 'State Bank of India v. B.S. Agriculture Industries [2009] 5 SCC 121',
        actionable_guidance: 'File complaint online on edaakhil.nic.in before the District Commission having jurisdiction (pecuniary limit up to ₹50 Lakh).'
      }
    ];
  } else if (key === 'contract_breach_deposit_refund') {
    const d0 = anchorDate;
    const dNotice = addDays(d0, 15);
    const dCause = addDays(d0, 30);
    const dMed = addDays(d0, 60);
    const dLimitation = addYears(d0, 3);

    rawList = [
      {
        id: 'ica_breach',
        title: 'Date of Breach / Eviction / Deposit Refusal',
        date: d0,
        phase: 'trigger',
        is_deadline: false,
        statutory_provision: 'Section 39 & Section 73 Indian Contract Act, 1872',
        statutory_act: 'Indian Contract Act, 1872',
        legal_consequence: 'Contractual breach occurs. Right to compensation for actual loss or refund of security deposit accrues.',
        precedent_citation: 'Fateh Chand v. Balkishan Dass [1964] 1 SCR 515',
        actionable_guidance: 'Preserve lease/service agreement, handover acknowledgment, inspection memo, and rent receipts.'
      },
      {
        id: 'ica_notice',
        title: 'Statutory Demand Notice (Penal Clauses Void)',
        date: dNotice,
        phase: 'statutory_notice',
        is_deadline: false,
        statutory_provision: 'Section 74 Indian Contract Act, 1872',
        statutory_act: 'Indian Contract Act, 1872',
        legal_consequence: 'Establishes that arbitrary lock-in forfeitures are void penalty stipulations under Section 74 ICA.',
        precedent_citation: 'Kailash Nath Associates v. Delhi Development Authority [2015] 4 SCC 136',
        actionable_guidance: 'Issue formal legal notice demanding refund with 18% p.a. interest within 15 days.'
      },
      {
        id: 'ica_cause',
        title: 'Accrual of Cause of Action for Money Recovery',
        date: dCause,
        phase: 'cause_of_action',
        is_deadline: false,
        statutory_provision: 'Article 55 Limitation Act, 1963',
        statutory_act: 'Limitation Act, 1963',
        legal_consequence: 'Notice cure period expires without compliance; formal cause of action for civil recovery suit is complete.',
        precedent_citation: 'Union of India v. West Coast Paper Mills Ltd. [2004] 2 SCC 747',
        actionable_guidance: 'Calculate principal refund balance plus accrued interest and legal drafting expenses.'
      },
      {
        id: 'ica_pre_med',
        title: 'Mandatory Pre-Institution Mediation (§12A CCA)',
        date: dMed,
        phase: 'mediation',
        is_deadline: false,
        statutory_provision: 'Section 12A Commercial Courts Act, 2015',
        statutory_act: 'Commercial Courts Act, 2015',
        legal_consequence: 'Mandatory pre-institution mediation through District Legal Services Authority (DLSA) for commercial disputes not contemplating urgent interim relief.',
        precedent_citation: 'Patil Automation Pvt. Ltd. v. Rakheja Engineers Pvt. Ltd. [2022] 10 SCC 1',
        actionable_guidance: 'File Form 1 before DLSA or demonstrate urgent interim relief under Order 39 CPC.'
      },
      {
        id: 'ica_limitation',
        title: '3-Year Limitation Expiry to File Recovery Suit',
        date: dLimitation,
        phase: 'limitation_deadline',
        is_deadline: true,
        statutory_provision: 'Article 55 & Article 113 Limitation Act, 1963',
        statutory_act: 'Limitation Act, 1963',
        legal_consequence: 'Fatal limitation bar. Plaint for recovery of money or breach of contract is barred by limitation after 3 years from date of breach.',
        precedent_citation: 'Babulal Rukmanand v. Official Liquidator [1968] 1 SCR 330',
        actionable_guidance: 'File civil suit / summary suit under Order 37 CPC before competent Civil Court / Commercial Court.'
      }
    ];
  } else if (key === 'criminal_investigation_bnss') {
    const d0 = anchorDate;
    const dInquiry = addDays(d0, 14);
    const dNotice35 = addDays(d0, 2);
    const dMagistrate = addDays(d0, 1);
    const dRemand = addDays(d0, 15);
    const dDefault60 = addDays(d0, 60);
    const dDefault90 = addDays(d0, 90);

    rawList = [
      {
        id: 'bnss_fir',
        title: 'Registration of FIR / Incident Accrual',
        date: d0,
        phase: 'trigger',
        is_deadline: false,
        statutory_provision: 'Section 173 BNSS 2023 (formerly §154 CrPC)',
        statutory_act: 'Bharatiya Nagarik Suraksha Sanhita, 2023',
        legal_consequence: 'FIR registered. If offence was committed prior to 1 July 2024, IPC 1860 applies; if on or after 1 July 2024, BNS 2023 applies (§531 BNSS).',
        precedent_citation: 'Lalita Kumari v. Govt. of U.P. [2014] 2 SCC 1',
        actionable_guidance: 'Obtain certified copy of FIR u/s 173(2) BNSS free of cost. Check applicable penal sections.'
      },
      {
        id: 'bnss_inquiry',
        title: 'Mandatory 14-Day Preliminary Inquiry Window',
        date: dInquiry,
        phase: 'investigation',
        is_deadline: true,
        statutory_provision: 'Section 173(3) BNSS 2023',
        statutory_act: 'Bharatiya Nagarik Suraksha Sanhita, 2023',
        legal_consequence: 'For offences punishable with 3 to 7 years, preliminary inquiry must be conducted within 14 days with prior permission of DySP.',
        precedent_citation: 'Section 173(3) BNSS Statutory Safeguard',
        actionable_guidance: 'Submit documentary proof of innocence or civil nature of dispute to the Investigating Officer during inquiry.'
      },
      {
        id: 'bnss_notice35',
        title: 'Section 35(3) Notice of Appearance (Arnesh Kumar)',
        date: dNotice35,
        phase: 'safeguards',
        is_deadline: false,
        statutory_provision: 'Section 35(3) BNSS 2023 (formerly §41A CrPC)',
        statutory_act: 'Bharatiya Nagarik Suraksha Sanhita, 2023',
        legal_consequence: 'For offences punishable with up to 7 years, arrest is not automatic. Police MUST issue written notice of appearance.',
        precedent_citation: 'Arnesh Kumar v. State of Bihar [2014] 8 SCC 273',
        actionable_guidance: 'Comply with notice appearance. If police threaten illegal custody, file writ petition / contempt before High Court.'
      },
      {
        id: 'bnss_prod24',
        title: '24-Hour Production Before Judicial Magistrate',
        date: dMagistrate,
        phase: 'safeguards',
        is_deadline: true,
        statutory_provision: 'Section 58 BNSS 2023 & Art. 22(2) Constitution',
        statutory_act: 'Constitution of India / BNSS 2023',
        legal_consequence: 'Person arrested must be produced before the nearest Judicial Magistrate within 24 hours excluding travel time. Detention beyond 24 hours is unlawful.',
        precedent_citation: 'D.K. Basu v. State of West Bengal [1997] 1 SCC 416',
        actionable_guidance: 'Advocate must be present before Magistrate to oppose police custody remand and move regular bail application.'
      },
      {
        id: 'bnss_remand',
        title: 'Maximum Initial Police Custody Remand',
        date: dRemand,
        phase: 'investigation',
        is_deadline: true,
        statutory_provision: 'Section 187(2) BNSS 2023 (formerly §167 CrPC)',
        statutory_act: 'Bharatiya Nagarik Suraksha Sanhita, 2023',
        legal_consequence: 'Police custody remand permissible in whole or in parts up to 15 days during first 40 or 60 days of detention.',
        precedent_citation: 'V. Senthil Balaji v. State [2023] INSC 677',
        actionable_guidance: 'Demand mandatory medical examination under Section 53 BNSS every 48 hours during custody.'
      },
      {
        id: 'bnss_bail60',
        title: 'Default Bail Deadline (Offences <= 10 Years)',
        date: dDefault60,
        phase: 'limitation_deadline',
        is_deadline: true,
        statutory_provision: 'Section 187(3)(a)(ii) BNSS 2023',
        statutory_act: 'Bharatiya Nagarik Suraksha Sanhita, 2023',
        legal_consequence: 'Inviolable fundamental right to statutory default bail if police fail to file Chargesheet / Final Report within 60 days.',
        precedent_citation: 'Bikramjit Singh v. State of Punjab [2020] 10 SCC 616',
        actionable_guidance: 'File default bail application immediately on the 61st day before police file chargesheet.'
      },
      {
        id: 'bnss_bail90',
        title: 'Default Bail Deadline (Offences > 10 Years / Life)',
        date: dDefault90,
        phase: 'limitation_deadline',
        is_deadline: true,
        statutory_provision: 'Section 187(3)(a)(i) BNSS 2023',
        statutory_act: 'Bharatiya Nagarik Suraksha Sanhita, 2023',
        legal_consequence: 'Absolute right to default bail if chargesheet is not filed within 90 days for serious offences punishable with 10+ years or life imprisonment.',
        precedent_citation: 'M. Ravindran v. Intelligence Officer, DRI [2021] 2 SCC 485',
        actionable_guidance: 'Furnish bail bonds. Magistrate cannot reject application if chargesheet is delayed.'
      }
    ];
  } else if (key === 'commercial_arbitration_act') {
    const d0 = anchorDate;
    const dNotice21 = addDays(d0, 30);
    const dApp11 = addDays(dNotice21, 30);
    const dAward = addMonths(dApp11, 12);
    const dChallenge = addMonths(dAward, 3);

    rawList = [
      {
        id: 'arb_dispute',
        title: 'Accrual of Commercial Dispute',
        date: d0,
        phase: 'trigger',
        is_deadline: false,
        statutory_provision: 'Section 21 Arbitration Act 1996',
        statutory_act: 'Arbitration and Conciliation Act, 1996',
        legal_consequence: 'Arbitral proceedings commence on the date on which a request for that dispute to be referred to arbitration is received.',
        precedent_citation: 'State of Goa v. Praveen Enterprises [2012] 12 SCC 581',
        actionable_guidance: 'Collate arbitration agreement clause, notice of claim, statement of unpaid invoices.'
      },
      {
        id: 'arb_notice',
        title: 'Dispatch Notice Invoking Arbitration (§21)',
        date: dNotice21,
        phase: 'statutory_notice',
        is_deadline: true,
        statutory_provision: 'Section 21 & Art. 137 Limitation Act',
        statutory_act: 'Arbitration and Conciliation Act, 1996',
        legal_consequence: 'Must be invoked within 3 years of dispute. Proposes names of independent sole arbitrator.',
        precedent_citation: 'Perkins Eastman Architects DPC v. HSCC (India) Ltd. [2020] 20 SCC 760',
        actionable_guidance: 'Provide 30 days to counter-party to concur on nominated sole arbitrator.'
      },
      {
        id: 'arb_sec11',
        title: 'File Section 11(6) Application (Appointment by HC)',
        date: dApp11,
        phase: 'court_filing',
        is_deadline: false,
        statutory_provision: 'Section 11(6) Arbitration Act 1996',
        statutory_act: 'Arbitration and Conciliation Act, 1996',
        legal_consequence: 'If counterparty fails to agree on arbitrator within 30 days, file Section 11 application before High Court.',
        precedent_citation: 'In Re: Interplay Between Arbitration Agreements & Stamp Act [2023] INSC 1066',
        actionable_guidance: 'Ensure agreement is duly stamped to prevent impounding hurdles under Section 33 Stamp Act.'
      },
      {
        id: 'arb_award',
        title: 'Mandatory 12-Month Award Pronouncement',
        date: dAward,
        phase: 'adjudication',
        is_deadline: true,
        statutory_provision: 'Section 29A(1) Arbitration Act 1996',
        statutory_act: 'Arbitration and Conciliation Act, 1996',
        legal_consequence: 'Tribunal mandate terminates if award is not rendered within 12 months (extendable by 6 months by party consent u/s 29A(3)).',
        precedent_citation: 'Harkirat Singh Sodhi v. Omaxe Ltd. (Delhi High Court 2022)',
        actionable_guidance: 'Parties may jointly extend mandate or petition High Court for time extension u/s 29A(4).'
      },
      {
        id: 'arb_sec34',
        title: 'Strict 3-Month Limitation to Challenge Award',
        date: dChallenge,
        phase: 'limitation_deadline',
        is_deadline: true,
        statutory_provision: 'Section 34(3) Arbitration Act 1996',
        statutory_act: 'Arbitration and Conciliation Act, 1996',
        legal_consequence: 'Inviolable limitation bar. Section 34 petition must be filed within 3 months. Court cannot condone delay beyond 30 days.',
        precedent_citation: 'Union of India v. Popular Construction Co. [2001] 8 SCC 470',
        actionable_guidance: 'File Section 34 petition within 90 days. Section 5 Limitation Act does NOT apply to arbitral challenges.'
      }
    ];
  } else if (key === 'motor_accident_mact') {
    const d0 = anchorDate;
    const dDar = addDays(d0, 90);
    const dLimitation = addMonths(d0, 6);

    rawList = [
      {
        id: 'mact_accident',
        title: 'Date of Motor Vehicle Accident',
        date: d0,
        phase: 'trigger',
        is_deadline: false,
        statutory_provision: 'Section 166 Motor Vehicles Act, 1988',
        statutory_act: 'Motor Vehicles Act, 1988',
        legal_consequence: 'Accident gives rise to tortious claim for compensation against driver, owner, and insurer.',
        precedent_citation: 'National Insurance Co. Ltd. v. Pranay Sethi [2017] 16 SCC 680',
        actionable_guidance: 'Collect FIR, site plan, MLC / post-mortem report, vehicle RC, insurance policy, and driving license.'
      },
      {
        id: 'mact_dar',
        title: 'Police Detailed Accident Report (DAR) Submission',
        date: dDar,
        phase: 'investigation',
        is_deadline: true,
        statutory_provision: 'Section 159 MV Act & Supreme Court Guidelines',
        statutory_act: 'Motor Vehicles Act, 1988',
        legal_consequence: 'Police must submit Detailed Accident Report (DAR) to Claims Tribunal within 90 days of accident.',
        precedent_citation: 'Jai Prakash v. National Insurance Co. Ltd. (2010) 2 SCC 607',
        actionable_guidance: 'Request DAR copy from investigating officer for automatic conversion into claim petition.'
      },
      {
        id: 'mact_limitation',
        title: 'Strict 6-Month Statutory Limitation Expiry',
        date: dLimitation,
        phase: 'limitation_deadline',
        is_deadline: true,
        statutory_provision: 'Section 166(3) Motor Vehicles Act, 1988',
        statutory_act: 'Motor Vehicles (Amendment) Act, 2019',
        legal_consequence: 'No application for compensation shall be entertained unless it is made within six months of the occurrence of the accident.',
        precedent_citation: 'Gurcharan Singh v. Allied Motors (Strict enforcement of 6-month bar)',
        actionable_guidance: 'File MACT claim petition before the Motor Accident Claims Tribunal within territorial jurisdiction of accident or residence.'
      }
    ];
  } else if (key === 'rti_appeal_lifecycle') {
    const d0 = anchorDate;
    const dCpio = addDays(d0, 30);
    const dFaaLimit = addDays(dCpio, 30);
    const dFaaOrder = addDays(dFaaLimit, 45);
    const dCicLimit = addDays(dFaaOrder, 90);

    rawList = [
      {
        id: 'rti_filed',
        title: 'RTI Application Submitted to CPIO',
        date: d0,
        phase: 'trigger',
        is_deadline: false,
        statutory_provision: 'Section 6(1) RTI Act 2005',
        statutory_act: 'Right to Information Act, 2005',
        legal_consequence: 'CPIO is duty bound to provide information or reject under Section 8/9 with reasons.',
        precedent_citation: 'Central Board of Secondary Education v. Aditya Bandopadhyay [2011] 8 SCC 497',
        actionable_guidance: 'Preserve RTI registration number and postal/online fee receipt.'
      },
      {
        id: 'rti_cpio_deadline',
        title: 'Mandatory 30-Day CPIO Disposal Deadline',
        date: dCpio,
        phase: 'statutory_notice',
        is_deadline: true,
        statutory_provision: 'Section 7(1) RTI Act 2005',
        statutory_act: 'Right to Information Act, 2005',
        legal_consequence: 'CPIO must respond within 30 days (or within 48 hours if information concerns life or liberty). Failure to respond is deemed refusal.',
        precedent_citation: 'Section 7(2) RTI Act (Deemed Refusal)',
        actionable_guidance: 'If information not provided within 30 days, information must be provided free of cost u/s 7(6).'
      },
      {
        id: 'rti_faa_limit',
        title: 'First Appeal Filing Window (FAA)',
        date: dFaaLimit,
        phase: 'court_filing',
        is_deadline: true,
        statutory_provision: 'Section 19(1) RTI Act 2005',
        statutory_act: 'Right to Information Act, 2005',
        legal_consequence: 'First appeal must be filed within 30 days from expiry of CPIO reply period before First Appellate Authority.',
        precedent_citation: 'Chief Information Commissioner v. State of Manipur (2011) 15 SCC 1',
        actionable_guidance: 'Draft First Appeal citing lack of response or illegal denial under Section 8 exemptions.'
      },
      {
        id: 'rti_faa_order',
        title: 'FAA Disposal Order Deadline',
        date: dFaaOrder,
        phase: 'adjudication',
        is_deadline: true,
        statutory_provision: 'Section 19(6) RTI Act 2005',
        statutory_act: 'Right to Information Act, 2005',
        legal_consequence: 'First Appellate Authority must decide appeal within 30 days (extendable up to 45 days for recorded reasons).',
        precedent_citation: 'Section 19(6) Mandatory Order Timeline',
        actionable_guidance: 'Track dispatch of appellate order. If dismissed or ignored, prepare Second Appeal.'
      },
      {
        id: 'rti_cic_limit',
        title: 'Second Appeal Filing Window (CIC / SIC)',
        date: dCicLimit,
        phase: 'limitation_deadline',
        is_deadline: true,
        statutory_provision: 'Section 19(3) RTI Act 2005',
        statutory_act: 'Right to Information Act, 2005',
        legal_consequence: 'Second appeal must be filed within 90 days from the date on which decision should have been made or was received.',
        precedent_citation: 'Union of India v. Namit Sharma [2013] 10 SCC 359',
        actionable_guidance: 'File Second Appeal online on cic.gov.in seeking penalty u/s 20(1) (₹250/day up to ₹25,000) against defaulting CPIO.'
      }
    ];
  }

  // Process milestones
  const milestones: TimelineMilestone[] = [];
  let primaryDeadline: { name: string; date: string; days_remaining: number; is_expired: boolean; statutory_provision: string } | null = null;

  for (const m of rawList) {
    const daysFromAnchor = dayDiff(m.date, anchorDate);
    const daysRemaining = dayDiff(m.date, today);

    let status: TimelineMilestone['status'];
    if (daysRemaining < 0) {
      status = m.is_deadline ? 'fatal_expired' : 'completed';
    } else if (daysRemaining === 0) {
      status = 'active_now';
    } else if (daysRemaining <= 14) {
      status = 'critical_warning';
    } else if (daysRemaining <= 30) {
      status = 'attention';
    } else {
      status = 'upcoming';
    }

    if (m.phase === 'limitation_deadline' && !primaryDeadline) {
      primaryDeadline = {
        name: m.title,
        date: formatDateISO(m.date),
        days_remaining: daysRemaining,
        is_expired: daysRemaining < 0,
        statutory_provision: m.statutory_provision
      };
    }

    milestones.push({
      id: m.id,
      title: m.title,
      date: formatDateISO(m.date),
      formatted_date: formatDateDisplay(m.date),
      phase: m.phase,
      days_from_anchor: daysFromAnchor,
      days_remaining: daysRemaining,
      status,
      is_deadline: m.is_deadline,
      statutory_provision: m.statutory_provision,
      statutory_act: m.statutory_act,
      legal_consequence: m.legal_consequence,
      precedent_citation: m.precedent_citation,
      actionable_guidance: m.actionable_guidance
    });
  }

  if (!primaryDeadline && milestones.length > 0) {
    const last = milestones[milestones.length - 1];
    primaryDeadline = {
      name: last.title,
      date: last.date,
      days_remaining: last.days_remaining,
      is_expired: last.days_remaining < 0,
      statutory_provision: last.statutory_provision
    };
  }

  const rem = primaryDeadline ? primaryDeadline.days_remaining : 0;
  let urgencyRating: LimitationSummary['urgency_rating'];
  let remedyStatus: string;

  if (rem < 0) {
    urgencyRating = 'FATAL_EXPIRED';
    remedyStatus = `Statutory limitation expired ${Math.abs(rem)} days ago. Requires formal Section 5 Limitation Act or Proviso Condonation application.`;
  } else if (rem === 0) {
    urgencyRating = 'CRITICAL';
    remedyStatus = 'TODAY IS THE FINAL STATUTORY DEADLINE. Immediate emergency filing required.';
  } else if (rem <= 14) {
    urgencyRating = 'CRITICAL';
    remedyStatus = `URGENT: Only ${rem} days remaining before statutory limitation closes. Immediate filing advised.`;
  } else if (rem <= 30) {
    urgencyRating = 'ATTENTION';
    remedyStatus = `Attention: ${rem} days remaining. Finalize pleadings and documentation.`;
  } else {
    urgencyRating = 'SAFE';
    remedyStatus = `Safe: ${rem} days remaining within statutory limitation window.`;
  }

  return {
    archetype,
    anchor_date: formatDateISO(anchorDate),
    today_date: formatDateISO(today),
    total_milestones: milestones.length,
    milestones,
    limitation_summary: {
      name: primaryDeadline?.name || 'Statutory Limitation',
      date: primaryDeadline?.date || formatDateISO(today),
      days_remaining: rem,
      is_expired: rem < 0,
      statutory_provision: primaryDeadline?.statutory_provision || '',
      urgency_rating: urgencyRating,
      remedy_status: remedyStatus
    }
  };
}
