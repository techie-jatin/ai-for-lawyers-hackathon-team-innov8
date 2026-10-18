/**
 * Client-Side 100+ Statutory Concordance & Transition Advisor Engine
 * Bharat Legal Intelligence 2.0
 * Provides 100% offline Vercel parity with the backend concordance service.
 */

export interface ConcordanceItem {
  id: number;
  old_act: string;
  old_section: string;
  new_act: string;
  new_section: string;
  offense_title: string;
  category: 'IPC_BNS' | 'CrPC_BNSS' | 'IEA_BSA' | 'SAVINGS_TRANSITION';
  status: string;
  penalty_summary: string;
  bailable_status: string;
  cognizable_status: string;
  key_change: string;
}

export interface TransitionAdvisorResult {
  status: 'success' | 'error';
  incident_date?: string;
  regime?: 'PRE_JULY_2024_COLONIAL_LAWS' | 'POST_JULY_2024_MODERN_SANHITAS';
  substantive_law?: string;
  procedural_law?: string;
  evidence_law?: string;
  governing_savings_section?: string;
  constitutional_safeguard?: string;
  actionable_instruction?: string;
  message?: string;
}

export const CLIENT_CONCORDANCE_MASTER_DATA: ConcordanceItem[] = [
  // 1. IPC 1860 <-> BNS 2023: OFFENSES AGAINST HUMAN BODY
  {
    id: 1,
    old_act: 'IPC 1860',
    old_section: 'Section 300 / 302',
    new_act: 'BNS 2023',
    new_section: 'Section 103(1)',
    offense_title: 'Punishment for Murder',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Death or Imprisonment for Life + Fine',
    bailable_status: 'Non-Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Basic murder definition retained. Sub-section (2) introduces strict penal provisions for mob lynching and group murders.'
  },
  {
    id: 2,
    old_act: 'IPC 1860',
    old_section: 'None (New Offense)',
    new_act: 'BNS 2023',
    new_section: 'Section 103(2)',
    offense_title: 'Mob Lynching (Murder by Group of 5 or More)',
    category: 'IPC_BNS',
    status: 'New Offense',
    penalty_summary: 'Death or Imprisonment for Life or not less than 7 years + Fine',
    bailable_status: 'Non-Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Specifically codifies mob lynching when 5 or more persons act in concert to commit murder on grounds of race, caste, sex, or belief.'
  },
  {
    id: 3,
    old_act: 'IPC 1860',
    old_section: 'Section 299 / 304',
    new_act: 'BNS 2023',
    new_section: 'Section 105',
    offense_title: 'Culpable Homicide Not Amounting to Murder',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Life imprisonment or up to 10 years + Fine',
    bailable_status: 'Non-Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Maintains distinction between intention (Part I) and knowledge without intention (Part II).'
  },
  {
    id: 4,
    old_act: 'IPC 1860',
    old_section: 'Section 304A',
    new_act: 'BNS 2023',
    new_section: 'Section 106(1) & (2)',
    offense_title: 'Causing Death by Negligence & Hit-and-Run',
    category: 'IPC_BNS',
    status: 'Enhanced',
    penalty_summary: 'Sec 106(1): Up to 5 yrs; Sec 106(2): Up to 10 yrs + Fine for fleeing without reporting.',
    bailable_status: 'Bailable (106(1)) / Non-Bailable (106(2))',
    cognizable_status: 'Cognizable',
    key_change: 'Section 106(2) creates a distinct aggravated offense for drivers fleeing the scene without reporting to police or magistrate.'
  },
  {
    id: 5,
    old_act: 'IPC 1860',
    old_section: 'Section 304B',
    new_act: 'BNS 2023',
    new_section: 'Section 80',
    offense_title: 'Dowry Death',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Imprisonment not less than 7 years up to Life',
    bailable_status: 'Non-Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Relocated to Chapter V (Offenses against Women and Children); presumes cruelty in connection with dowry demands within 7 years of marriage.'
  },
  {
    id: 6,
    old_act: 'IPC 1860',
    old_section: 'Section 306',
    new_act: 'BNS 2023',
    new_section: 'Section 108',
    offense_title: 'Abetment of Suicide',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Up to 10 years imprisonment + Fine',
    bailable_status: 'Non-Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Direct instigation or facilitation benchmark retained from Arnesh Kumar / Praveen Pradhan jurisprudence.'
  },
  {
    id: 7,
    old_act: 'IPC 1860',
    old_section: 'Section 307',
    new_act: 'BNS 2023',
    new_section: 'Section 109',
    offense_title: 'Attempt to Murder',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Up to 10 years (or Life if hurt is caused) + Fine',
    bailable_status: 'Non-Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Streamlined wording preserving requirement of intention and execution of an overt act toward commission.'
  },
  {
    id: 8,
    old_act: 'IPC 1860',
    old_section: 'Section 319 / 323',
    new_act: 'BNS 2023',
    new_section: 'Section 114 / 115',
    offense_title: 'Voluntarily Causing Hurt',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Up to 1 year imprisonment or fine up to ₹1,000 or both',
    bailable_status: 'Bailable',
    cognizable_status: 'Non-Cognizable',
    key_change: 'Introduces community service as an alternative penal disposition for minor simple hurt.'
  },
  {
    id: 9,
    old_act: 'IPC 1860',
    old_section: 'Section 320 / 325',
    new_act: 'BNS 2023',
    new_section: 'Section 116 / 117',
    offense_title: 'Voluntarily Causing Grievous Hurt',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Up to 7 years imprisonment + Fine',
    bailable_status: 'Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Eight designated statutory clauses of grievous hurt modernized.'
  },
  {
    id: 10,
    old_act: 'IPC 1860',
    old_section: 'Section 326A / 326B',
    new_act: 'BNS 2023',
    new_section: 'Section 124(1) & (2)',
    offense_title: 'Voluntarily Causing Grievous Hurt by Acid Attack',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Minimum 10 years up to Life imprisonment + Fine to cover medical expenses',
    bailable_status: 'Non-Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Fine must be just and reasonable to meet the medical expenses of the treatment of the victim and paid directly to her.'
  },
  {
    id: 11,
    old_act: 'IPC 1860',
    old_section: 'Section 339 / 341',
    new_act: 'BNS 2023',
    new_section: 'Section 126(1) & (2)',
    offense_title: 'Wrongful Restraint',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Simple imprisonment up to 1 month or fine up to ₹5,000 or both',
    bailable_status: 'Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Enhanced monetary fine threshold from colonial ₹500 to ₹5,000.'
  },
  {
    id: 12,
    old_act: 'IPC 1860',
    old_section: 'Section 340 / 342',
    new_act: 'BNS 2023',
    new_section: 'Section 127',
    offense_title: 'Wrongful Confinement',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Up to 1 year imprisonment or fine up to ₹5,000 or both',
    bailable_status: 'Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Increased fine thresholds and streamlined definitions of circumscribed boundaries.'
  },
  {
    id: 13,
    old_act: 'IPC 1860',
    old_section: 'Section 351 / 352',
    new_act: 'BNS 2023',
    new_section: 'Section 130 / 131',
    offense_title: 'Assault & Criminal Force',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Up to 3 months or fine up to ₹1,000 or both',
    bailable_status: 'Bailable',
    cognizable_status: 'Non-Cognizable',
    key_change: 'Modernized formulation clarifying gestures causing reasonable apprehension of criminal force.'
  },
  {
    id: 14,
    old_act: 'IPC 1860',
    old_section: 'Section 359 / 363',
    new_act: 'BNS 2023',
    new_section: 'Section 137 / 140',
    offense_title: 'Kidnapping from Lawful Guardianship',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Up to 7 years imprisonment + Fine',
    bailable_status: 'Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Age benchmark standardized (under 18 years for both male and female).'
  },
  {
    id: 15,
    old_act: 'IPC 1860',
    old_section: 'Section 364A',
    new_act: 'BNS 2023',
    new_section: 'Section 140(2)',
    offense_title: 'Kidnapping for Ransom',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Death or Imprisonment for Life + Fine',
    bailable_status: 'Non-Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Directly links extortionate hostage demands to capital deterrence.'
  },

  // 2. OFFENSES AGAINST WOMEN & CHILDREN
  {
    id: 16,
    old_act: 'IPC 1860',
    old_section: 'Section 375 / 376',
    new_act: 'BNS 2023',
    new_section: 'Section 63 / 64',
    offense_title: 'Rape',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Rigorous imprisonment not less than 10 years up to Life + Fine',
    bailable_status: 'Non-Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Relocated to prime position in Chapter V; fine must be paid to the victim to meet medical expenses.'
  },
  {
    id: 17,
    old_act: 'IPC 1860',
    old_section: 'Section 376D',
    new_act: 'BNS 2023',
    new_section: 'Section 70(1)',
    offense_title: 'Gang Rape',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Rigorous imprisonment not less than 20 years up to Life (remainder of natural life) + Fine',
    bailable_status: 'Non-Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Joint vicarious liability reaffirmed; life imprisonment explicitly defined as remainder of natural life.'
  },
  {
    id: 18,
    old_act: 'IPC 1860',
    old_section: 'Section 376DA / 376DB',
    new_act: 'BNS 2023',
    new_section: 'Section 70(2)',
    offense_title: 'Gang Rape of Minor under 18 / 12 Years',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Imprisonment for Life (natural life) or Death + Fine',
    bailable_status: 'Non-Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Stringent capital deterrence harmonized with POCSO Act provisions.'
  },
  {
    id: 19,
    old_act: 'IPC 1860',
    old_section: 'None (New Offense)',
    new_act: 'BNS 2023',
    new_section: 'Section 69',
    offense_title: 'Sexual Intercourse by Deceitful Means / False Promise of Marriage',
    category: 'IPC_BNS',
    status: 'New Offense',
    penalty_summary: 'Up to 10 years imprisonment + Fine',
    bailable_status: 'Non-Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Specifically criminalizes sexual relations induced by false promise of employment, promotion, or marriage without intending to fulfill it.'
  },
  {
    id: 20,
    old_act: 'IPC 1860',
    old_section: 'Section 354',
    new_act: 'BNS 2023',
    new_section: 'Section 74',
    offense_title: 'Assault or Criminal Force to Woman with Intent to Outrage Modesty',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Imprisonment 1 to 5 years + Fine',
    bailable_status: 'Non-Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Retains strict non-bailable classification and victim protection safeguards.'
  },
  {
    id: 21,
    old_act: 'IPC 1860',
    old_section: 'Section 354A',
    new_act: 'BNS 2023',
    new_section: 'Section 75',
    offense_title: 'Sexual Harassment',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Rigorous imprisonment up to 3 years or fine or both',
    bailable_status: 'Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Covers physical contact, demand for sexual favors, and showing pornography.'
  },
  {
    id: 22,
    old_act: 'IPC 1860',
    old_section: 'Section 354C',
    new_act: 'BNS 2023',
    new_section: 'Section 77',
    offense_title: 'Voyeurism',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: '1st conviction: 1 to 3 yrs; 2nd conviction: 3 to 7 yrs + Fine',
    bailable_status: 'Bailable (1st offense) / Non-Bailable (subsequent)',
    cognizable_status: 'Cognizable',
    key_change: 'Expanded digital capture and surveillance camera exploitation coverage.'
  },
  {
    id: 23,
    old_act: 'IPC 1860',
    old_section: 'Section 354D',
    new_act: 'BNS 2023',
    new_section: 'Section 78',
    offense_title: 'Stalking (Physical & Cyber)',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: '1st conviction: up to 3 yrs; subsequent: up to 5 yrs + Fine',
    bailable_status: 'Bailable (1st offense) / Non-Bailable (subsequent)',
    cognizable_status: 'Cognizable',
    key_change: 'Explicitly covers internet, email, social media, and electronic monitoring.'
  },
  {
    id: 24,
    old_act: 'IPC 1860',
    old_section: 'Section 498A',
    new_act: 'BNS 2023',
    new_section: 'Section 85',
    offense_title: 'Cruelty by Husband or Relatives of Husband',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Up to 3 years imprisonment + Fine',
    bailable_status: 'Non-Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Section 86 defines cruelty. Arnesh Kumar notice under Section 35(3) BNSS mandatory.'
  },
  {
    id: 25,
    old_act: 'IPC 1860',
    old_section: 'Section 509',
    new_act: 'BNS 2023',
    new_section: 'Section 79',
    offense_title: 'Word, Gesture or Act Intended to Insult Modesty of a Woman',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Simple imprisonment up to 3 years + Fine',
    bailable_status: 'Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Enhanced minimum punishment from colonial 1 year to up to 3 years.'
  },

  // 3. PROPERTY & FINANCIAL OFFENSES
  {
    id: 26,
    old_act: 'IPC 1860',
    old_section: 'Section 378 / 379',
    new_act: 'BNS 2023',
    new_section: 'Section 303(2)',
    offense_title: 'Theft',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Up to 3 years imprisonment or fine or both. Community service for petty theft < ₹5,000.',
    bailable_status: 'Non-Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Introduces Community Service for first-time petty theft under ₹5,000 where property is returned.'
  },
  {
    id: 27,
    old_act: 'IPC 1860',
    old_section: 'None (New Offense)',
    new_act: 'BNS 2023',
    new_section: 'Section 304',
    offense_title: 'Snatching (Quick / Forcible Seizure of Property)',
    category: 'IPC_BNS',
    status: 'New Offense',
    penalty_summary: 'Up to 3 years imprisonment + Fine',
    bailable_status: 'Non-Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Fills colonial void where mobile/chain snatching was treated as simple theft.'
  },
  {
    id: 28,
    old_act: 'IPC 1860',
    old_section: 'Section 383 / 384',
    new_act: 'BNS 2023',
    new_section: 'Section 308',
    offense_title: 'Extortion',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Up to 3 years imprisonment or fine or both',
    bailable_status: 'Non-Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Covers digital extortion, cyber blackmail, and recovery agent coercion.'
  },
  {
    id: 29,
    old_act: 'IPC 1860',
    old_section: 'Section 390 / 392',
    new_act: 'BNS 2023',
    new_section: 'Section 309',
    offense_title: 'Robbery',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Rigorous imprisonment up to 10 years + Fine',
    bailable_status: 'Non-Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Clear statutory nexus: theft converts to robbery if hurt/death is caused.'
  },
  {
    id: 30,
    old_act: 'IPC 1860',
    old_section: 'Section 391 / 395',
    new_act: 'BNS 2023',
    new_section: 'Section 310',
    offense_title: 'Dacoity (Robbery by 5 or More Persons)',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Imprisonment for Life or up to 10 years + Fine',
    bailable_status: 'Non-Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Maintains 5-person threshold and joint responsibility.'
  },
  {
    id: 31,
    old_act: 'IPC 1860',
    old_section: 'Section 403',
    new_act: 'BNS 2023',
    new_section: 'Section 314',
    offense_title: 'Dishonest Misappropriation of Property',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Up to 2 years or fine or both',
    bailable_status: 'Bailable',
    cognizable_status: 'Non-Cognizable',
    key_change: 'Applies where innocent possession turns dishonest.'
  },
  {
    id: 32,
    old_act: 'IPC 1860',
    old_section: 'Section 405 / 406',
    new_act: 'BNS 2023',
    new_section: 'Section 316',
    offense_title: 'Criminal Breach of Trust',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Up to 5 years imprisonment or fine or both',
    bailable_status: 'Non-Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Increased maximum term from 3 to 5 years. Covers caution money retention.'
  },
  {
    id: 33,
    old_act: 'IPC 1860',
    old_section: 'Section 415 / 417 / 420',
    new_act: 'BNS 2023',
    new_section: 'Section 318(1)-(4)',
    offense_title: 'Cheating and Dishonestly Inducing Delivery of Property',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Sec 318(4): Up to 7 years imprisonment + Fine',
    bailable_status: 'Non-Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Consolidated cheating definitions. Covers electronic inducements, fake UPI/QR codes, and online fraud.'
  },
  {
    id: 34,
    old_act: 'IPC 1860',
    old_section: 'Section 441 / 447',
    new_act: 'BNS 2023',
    new_section: 'Section 329(1) & (3)',
    offense_title: 'Criminal Trespass',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Up to 3 months or fine up to ₹5,000 or both',
    bailable_status: 'Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Fine threshold enhanced tenfold from colonial ₹500 to ₹5,000.'
  },
  {
    id: 35,
    old_act: 'IPC 1860',
    old_section: 'Section 442 / 448',
    new_act: 'BNS 2023',
    new_section: 'Section 329(2) & 330',
    offense_title: 'House-Trespass',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Up to 1 year or fine up to ₹5,000 or both',
    bailable_status: 'Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Applies to residential premises and hostels against illegal lockouts.'
  },
  {
    id: 36,
    old_act: 'IPC 1860',
    old_section: 'Section 463 / 465',
    new_act: 'BNS 2023',
    new_section: 'Section 336(1) & (2)',
    offense_title: 'Forgery',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Up to 2 years or fine or both',
    bailable_status: 'Bailable',
    cognizable_status: 'Non-Cognizable',
    key_change: 'Definition updated to cover digital documents and scanned signatures.'
  },
  {
    id: 37,
    old_act: 'IPC 1860',
    old_section: 'Section 467',
    new_act: 'BNS 2023',
    new_section: 'Section 338',
    offense_title: 'Forgery of Valuable Security, Will, etc.',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Imprisonment for Life or up to 10 years + Fine',
    bailable_status: 'Non-Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Applies to forged bank guarantees, property deeds, and digital e-stamps.'
  },
  {
    id: 38,
    old_act: 'IPC 1860',
    old_section: 'Section 468',
    new_act: 'BNS 2023',
    new_section: 'Section 336(3)',
    offense_title: 'Forgery for Purpose of Cheating',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Up to 7 years imprisonment + Fine',
    bailable_status: 'Non-Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Essential offense in bank loan frauds and fake Aadhaar/PAN cards.'
  },
  {
    id: 39,
    old_act: 'IPC 1860',
    old_section: 'Section 471',
    new_act: 'BNS 2023',
    new_section: 'Section 340',
    offense_title: 'Using as Genuine a Forged Document or Electronic Record',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Punished as if forged by that person',
    bailable_status: 'Depends on document',
    cognizable_status: 'Cognizable',
    key_change: 'Explicit inclusion of electronic records and manipulated PDFs.'
  },

  // 4. INCHOATE, CONSPIRACY & SPECIAL OFFENSES
  {
    id: 40,
    old_act: 'IPC 1860',
    old_section: 'Section 120A / 120B',
    new_act: 'BNS 2023',
    new_section: 'Section 61(1) & (2)',
    offense_title: 'Criminal Conspiracy',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Same as abetment of offense conspired',
    bailable_status: 'Depends on offense',
    cognizable_status: 'Cognizable',
    key_change: 'Preserves requirement of meeting of minds to do an unlawful act.'
  },
  {
    id: 41,
    old_act: 'IPC 1860',
    old_section: 'Section 107 / 109',
    new_act: 'BNS 2023',
    new_section: 'Section 45 / 49',
    offense_title: 'Abetment',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Same punishment as principal offense if act committed',
    bailable_status: 'Depends on offense',
    cognizable_status: 'Depends on offense',
    key_change: 'Modernized abetment by instigation, conspiracy, and aiding.'
  },
  {
    id: 42,
    old_act: 'IPC 1860',
    old_section: 'None (New Offense)',
    new_act: 'BNS 2023',
    new_section: 'Section 111',
    offense_title: 'Organized Crime Syndicate',
    category: 'IPC_BNS',
    status: 'New Offense',
    penalty_summary: 'Death or Life imprisonment + Fine (min ₹5 Lakhs)',
    bailable_status: 'Non-Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Central codification of organized syndicate crimes previously limited to state laws like MCOCA.'
  },
  {
    id: 43,
    old_act: 'IPC 1860',
    old_section: 'None (New Offense)',
    new_act: 'BNS 2023',
    new_section: 'Section 112',
    offense_title: 'Petty Organized Crime',
    category: 'IPC_BNS',
    status: 'New Offense',
    penalty_summary: 'Imprisonment 1 to 7 years + Fine',
    bailable_status: 'Non-Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Punishes theft, snatching, cheating, gambling committed by organized gangs.'
  },
  {
    id: 44,
    old_act: 'IPC 1860',
    old_section: 'None (New Offense)',
    new_act: 'BNS 2023',
    new_section: 'Section 113',
    offense_title: 'Terrorist Act',
    category: 'IPC_BNS',
    status: 'New Offense',
    penalty_summary: 'Death or Life imprisonment + Fine',
    bailable_status: 'Non-Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Directly incorporates terrorist act definitions into general penal code.'
  },
  {
    id: 45,
    old_act: 'IPC 1860',
    old_section: 'Section 124A (Sedition)',
    new_act: 'BNS 2023',
    new_section: 'Section 152',
    offense_title: 'Act Endangering Sovereignty, Unity and Integrity of India',
    category: 'IPC_BNS',
    status: 'Substituted',
    penalty_summary: 'Imprisonment for Life or up to 7 years + Fine',
    bailable_status: 'Non-Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Colonial word Sedition deleted. Focus shifted to acts exciting secession or armed rebellion.'
  },
  {
    id: 46,
    old_act: 'IPC 1860',
    old_section: 'Section 503 / 506',
    new_act: 'BNS 2023',
    new_section: 'Section 351(1)-(3)',
    offense_title: 'Criminal Intimidation',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Simple: up to 2 yrs; If threat to kill: up to 7 yrs + Fine',
    bailable_status: 'Bailable',
    cognizable_status: 'Non-Cognizable',
    key_change: 'Includes electronic and recovery agent coercion.'
  },
  {
    id: 47,
    old_act: 'IPC 1860',
    old_section: 'Section 499 / 500',
    new_act: 'BNS 2023',
    new_section: 'Section 356',
    offense_title: 'Defamation',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Simple imprisonment up to 2 years or fine or Community Service',
    bailable_status: 'Bailable',
    cognizable_status: 'Non-Cognizable',
    key_change: 'Community service added as a sentencing alternative.'
  },
  {
    id: 48,
    old_act: 'IPC 1860',
    old_section: 'None (New Provision)',
    new_act: 'BNS 2023',
    new_section: 'Section 4(f)',
    offense_title: 'Community Service as Recognized Punishment',
    category: 'IPC_BNS',
    status: 'New Form of Punishment',
    penalty_summary: 'Court-directed unpaid work for benefit of community',
    bailable_status: 'Reformative Disposition',
    cognizable_status: 'Judicial Discretion',
    key_change: 'Sixth statutory punishment under Indian Law.'
  },

  // 5. CrPC 1973 <-> BNSS 2023: ARREST, INVESTIGATION & BAIL
  {
    id: 49,
    old_act: 'CrPC 1973',
    old_section: 'Section 41A',
    new_act: 'BNSS 2023',
    new_section: 'Section 35(3)',
    offense_title: 'Mandatory Notice of Appearance Prior to Arrest (Arnesh Kumar Rule)',
    category: 'CrPC_BNSS',
    status: 'Active',
    penalty_summary: 'Mandatory issuance for offenses <= 7 years',
    bailable_status: 'Procedural Right',
    cognizable_status: 'Statutory Mandate',
    key_change: 'Codification of Arnesh Kumar (2014). Officer failing to issue notice faces contempt.'
  },
  {
    id: 50,
    old_act: 'CrPC 1973',
    old_section: 'Section 41',
    new_act: 'BNSS 2023',
    new_section: 'Section 35(1)',
    offense_title: 'When Police May Arrest Without Warrant',
    category: 'CrPC_BNSS',
    status: 'Active',
    penalty_summary: 'Arrest circumscribed by necessity benchmarks',
    bailable_status: 'Statutory Power',
    cognizable_status: 'Cognizable Offenses',
    key_change: 'Prior sanction of DSP mandatory before arresting infirm/elderly for offenses < 3 years.'
  },
  {
    id: 51,
    old_act: 'CrPC 1973',
    old_section: 'Section 46(4)',
    new_act: 'BNSS 2023',
    new_section: 'Section 43(5)',
    offense_title: 'Safeguards on Arrest of Women (Sunset to Sunrise Protection)',
    category: 'CrPC_BNSS',
    status: 'Active',
    penalty_summary: 'No female person can be arrested after sunset and before sunrise without prior Magistrate sanction',
    bailable_status: 'Constitutional Safeguard',
    cognizable_status: 'Mandatory Compliance',
    key_change: 'Strictly enforces female police officer presence and prior judicial permission.'
  },
  {
    id: 52,
    old_act: 'CrPC 1973',
    old_section: 'Section 57',
    new_act: 'BNSS 2023',
    new_section: 'Section 58',
    offense_title: 'Person Arrested Not to be Detained Beyond 24 Hours',
    category: 'CrPC_BNSS',
    status: 'Active',
    penalty_summary: 'Magistrate production mandatory within 24 hours',
    bailable_status: 'Fundamental Right (Art 22)',
    cognizable_status: 'Constitutional Mandate',
    key_change: 'Production via audio-video electronic means permitted.'
  },
  {
    id: 53,
    old_act: 'CrPC 1973',
    old_section: 'Section 61 / 62',
    new_act: 'BNSS 2023',
    new_section: 'Section 63 / 64',
    offense_title: 'Service of Summons by Electronic Means',
    category: 'CrPC_BNSS',
    status: 'Enhanced',
    penalty_summary: 'Valid service through encrypted email, messaging apps, and portal notices',
    bailable_status: 'Procedural Rule',
    cognizable_status: 'Judicial Process',
    key_change: 'Formally legalizes service of court summons via WhatsApp and email.'
  },
  {
    id: 54,
    old_act: 'CrPC 1973',
    old_section: 'Section 100 / 102',
    new_act: 'BNSS 2023',
    new_section: 'Section 105',
    offense_title: 'Mandatory Audio-Video Recording of Search and Seizure',
    category: 'CrPC_BNSS',
    status: 'New Mandatory Safeguard',
    penalty_summary: 'Search and seizure must be videographed and submitted to court within 48 hours',
    bailable_status: 'Evidentiary Requirement',
    cognizable_status: 'Investigation Rule',
    key_change: 'Search of premises and property seizure MUST be recorded by mobile/video camera.'
  },
  {
    id: 55,
    old_act: 'CrPC 1973',
    old_section: 'Section 154',
    new_act: 'BNSS 2023',
    new_section: 'Section 173(1)',
    offense_title: 'Information in Cognizable Cases & Statutory Zero FIR',
    category: 'CrPC_BNSS',
    status: 'Enhanced',
    penalty_summary: 'Police cannot refuse FIR on territorial grounds; must register Zero FIR and transfer',
    bailable_status: 'Statutory Right',
    cognizable_status: 'Mandatory Duty',
    key_change: 'First statutory institutionalization of Zero FIR and e-FIR nationwide.'
  },
  {
    id: 56,
    old_act: 'CrPC 1973',
    old_section: 'None (Lalita Kumari rule)',
    new_act: 'BNSS 2023',
    new_section: 'Section 173(3)',
    offense_title: 'Preliminary Enquiry in Offenses Between 3 and 7 Years',
    category: 'CrPC_BNSS',
    status: 'New Statutory Step',
    penalty_summary: '14-day preliminary enquiry permitted with DSP sanction before FIR registration',
    bailable_status: 'Pre-FIR Safeguard',
    cognizable_status: 'Discretionary',
    key_change: 'Statutory enquiry period to prevent malicious complaints.'
  },
  {
    id: 57,
    old_act: 'CrPC 1973',
    old_section: 'Section 167(2)',
    new_act: 'BNSS 2023',
    new_section: 'Section 187(2) & (3)',
    offense_title: 'Police Custody / Remand & Phased Detention',
    category: 'CrPC_BNSS',
    status: 'Major Procedural Shift',
    penalty_summary: '15 days police custody can be taken in parts across first 40 or 60 days',
    bailable_status: 'Remand Adjudication',
    cognizable_status: 'Judicial Discretion',
    key_change: 'Custody is no longer limited strictly to initial 15 days; can be staggered.'
  },
  {
    id: 58,
    old_act: 'CrPC 1973',
    old_section: 'Section 167(2) Proviso',
    new_act: 'BNSS 2023',
    new_section: 'Section 187(5)',
    offense_title: 'Default Bail (Statutory Bail on Incomplete Investigation)',
    category: 'CrPC_BNSS',
    status: 'Active',
    penalty_summary: 'Indefeasible right to bail upon expiry of 60 or 90 days',
    bailable_status: 'Indefeasible Right',
    cognizable_status: 'Statutory Mandate',
    key_change: '60/90 days default bail timelines preserved.'
  },
  {
    id: 59,
    old_act: 'CrPC 1973',
    old_section: 'Section 173(2)',
    new_act: 'BNSS 2023',
    new_section: 'Section 193',
    offense_title: 'Police Report (Charge-Sheet) & 90-Day Informant Update',
    category: 'CrPC_BNSS',
    status: 'Enhanced',
    penalty_summary: 'Police MUST update informant of investigation progress within 90 days',
    bailable_status: 'Filing Deadline',
    cognizable_status: 'Investigation Conclusion',
    key_change: 'Section 193(3)(ii) introduces mandatory progress notification to victims.'
  },
  {
    id: 60,
    old_act: 'CrPC 1973',
    old_section: 'Section 436A',
    new_act: 'BNSS 2023',
    new_section: 'Section 479',
    offense_title: 'Maximum Undertrial Detention Period (1/3rd Bail for First Offenders)',
    category: 'CrPC_BNSS',
    status: 'Pro-Accused Reform',
    penalty_summary: 'First-time offenders entitled to bail upon completing 1/3rd of maximum sentence',
    bailable_status: 'Mandatory Undertrial Bail',
    cognizable_status: 'Statutory Relief',
    key_change: 'First-time undertrials must be released on bond upon serving one-third of the maximum term.'
  },
  {
    id: 61,
    old_act: 'CrPC 1973',
    old_section: 'Section 437',
    new_act: 'BNSS 2023',
    new_section: 'Section 480',
    offense_title: 'Magistrate Regular Bail in Non-Bailable Cases',
    category: 'CrPC_BNSS',
    status: 'Active',
    penalty_summary: 'Discretionary; special safeguards for sick, infirm, minors, and women',
    bailable_status: 'Judicial Discretion',
    cognizable_status: 'Non-Bailable Offenses',
    key_change: 'Integrated with electronic bail bonds.'
  },
  {
    id: 62,
    old_act: 'CrPC 1973',
    old_section: 'Section 438',
    new_act: 'BNSS 2023',
    new_section: 'Section 482',
    offense_title: 'Anticipatory Bail (Pre-Arrest Bail Direction)',
    category: 'CrPC_BNSS',
    status: 'Active',
    penalty_summary: 'Sessions or High Court pre-arrest bail direction',
    bailable_status: 'Equitable Discretion',
    cognizable_status: 'Non-Bailable Offenses',
    key_change: 'Sushila Aggarwal (2020) doctrine embedded: bail continues until trial conclusion.'
  },
  {
    id: 63,
    old_act: 'CrPC 1973',
    old_section: 'Section 439',
    new_act: 'BNSS 2023',
    new_section: 'Section 483',
    offense_title: 'Special Powers of High Court / Sessions Court Regarding Bail',
    category: 'CrPC_BNSS',
    status: 'Active',
    penalty_summary: 'Broad regular bail jurisdiction',
    bailable_status: 'Superior Court Bail',
    cognizable_status: 'Superior Jurisdiction',
    key_change: 'Incorporates DigiLocker surety verification.'
  },
  {
    id: 64,
    old_act: 'CrPC 1973',
    old_section: 'Section 482',
    new_act: 'BNSS 2023',
    new_section: 'Section 528',
    offense_title: 'Inherent Powers of High Court to Quash FIRs and Proceedings',
    category: 'CrPC_BNSS',
    status: 'Active',
    penalty_summary: 'Power to quash malicious proceedings to prevent abuse of process',
    bailable_status: 'Inherent Power',
    cognizable_status: 'High Court Jurisdiction',
    key_change: 'Preserves Bhajan Lal benchmarks while accommodating digital evidence audits.'
  },
  {
    id: 65,
    old_act: 'CrPC 1973',
    old_section: 'Section 320',
    new_act: 'BNSS 2023',
    new_section: 'Section 359',
    offense_title: 'Compounding of Offences',
    category: 'CrPC_BNSS',
    status: 'Active',
    penalty_summary: 'Compounding results in direct acquittal',
    bailable_status: 'Compounding Mechanism',
    cognizable_status: 'Mutual Settlement',
    key_change: 'Cross-referenced with BNS sections; Lok Adalat awards result in acquittal.'
  },
  {
    id: 66,
    old_act: 'CrPC 1973',
    old_section: 'Section 125',
    new_act: 'BNSS 2023',
    new_section: 'Section 144',
    offense_title: 'Maintenance of Wives, Children and Parents',
    category: 'CrPC_BNSS',
    status: 'Active',
    penalty_summary: 'Interim maintenance must be decided within 60 days of notice',
    bailable_status: 'Social Welfare Remedy',
    cognizable_status: 'Summary Proceeding',
    key_change: 'Strict 60-day disposal deadline for interim maintenance applications.'
  },
  {
    id: 67,
    old_act: 'CrPC 1973',
    old_section: 'None (New Provision)',
    new_act: 'BNSS 2023',
    new_section: 'Section 356',
    offense_title: 'Trial in Absentia of Proclaimed Offenders',
    category: 'CrPC_BNSS',
    status: 'New Groundbreaking Power',
    penalty_summary: 'Trial and conviction can proceed even if the accused flees abroad',
    bailable_status: 'Anti-Fugitive Mandate',
    cognizable_status: 'Judicial Authority',
    key_change: 'Allows court to proceed with trial in absentia after 90 days of abscondance.'
  },
  {
    id: 68,
    old_act: 'CrPC 1973',
    old_section: 'Section 353',
    new_act: 'BNSS 2023',
    new_section: 'Section 392',
    offense_title: 'Judgment Delivery Timeline (30 to 45 Days)',
    category: 'CrPC_BNSS',
    status: 'New Strict Timeline',
    penalty_summary: 'Judgment MUST be pronounced within 30 to 45 days of concluding arguments',
    bailable_status: 'Judicial Accountability',
    cognizable_status: 'Trial Conclusion',
    key_change: 'Strict cap preventing indefinite reservation of criminal judgments.'
  },

  // 6. IEA 1872 <-> BSA 2023: EVIDENCE & ELECTRONIC RECORDS
  {
    id: 69,
    old_act: 'IEA 1872',
    old_section: 'Section 65B',
    new_act: 'BSA 2023',
    new_section: 'Section 63',
    offense_title: 'Admissibility of Electronic Records & Mandatory Certificate',
    category: 'IEA_BSA',
    status: 'Major Overhaul',
    penalty_summary: 'Electronic records admissible; hash value verification; original device is primary',
    bailable_status: 'Evidentiary Standard',
    cognizable_status: 'Trial Admissibility',
    key_change: 'Overhaul of Arjun Panditrao Khotkar. Primary digital devices admissible without certificate under Section 57.'
  },
  {
    id: 70,
    old_act: 'IEA 1872',
    old_section: 'Section 3',
    new_act: 'BSA 2023',
    new_section: 'Section 2(1)(d)',
    offense_title: 'Definition of Document Including Digital Records',
    category: 'IEA_BSA',
    status: 'Expanded',
    penalty_summary: 'Includes emails, server logs, mobile apps, SMS, and cloud files',
    bailable_status: 'Statutory Definition',
    cognizable_status: 'Universal Application',
    key_change: 'Digital records placed on equal legal footing with physical paper documents.'
  },
  {
    id: 71,
    old_act: 'IEA 1872',
    old_section: 'Section 62',
    new_act: 'BSA 2023',
    new_section: 'Section 57',
    offense_title: 'Primary Evidence (Including Original Electronic Stored Devices)',
    category: 'IEA_BSA',
    status: 'Enhanced',
    penalty_summary: 'Device where electronic record is created/stored is primary evidence',
    bailable_status: 'Highest Evidentiary Value',
    cognizable_status: 'Direct Admissibility',
    key_change: 'Explanation 4 treats each multi-device file instance as primary evidence.'
  },
  {
    id: 72,
    old_act: 'IEA 1872',
    old_section: 'Section 25',
    new_act: 'BSA 2023',
    new_section: 'Section 23(1)',
    offense_title: 'Confession to Police Officer Not to be Proved',
    category: 'IEA_BSA',
    status: 'Active',
    penalty_summary: 'No confession to police officer admissible against accused',
    bailable_status: 'Exclusionary Rule',
    cognizable_status: 'Trial Safeguard',
    key_change: 'Fundamental safeguard against custodial torture reaffirmed.'
  },
  {
    id: 73,
    old_act: 'IEA 1872',
    old_section: 'Section 27',
    new_act: 'BSA 2023',
    new_section: 'Section 23(2)',
    offense_title: 'Information from Accused Leading to Discovery',
    category: 'IEA_BSA',
    status: 'Active',
    penalty_summary: 'Portion distinctly relating to fact discovered may be proved',
    bailable_status: 'Recovery Exception',
    cognizable_status: 'Evidentiary Recovery',
    key_change: 'Pulukuri Kottaya doctrine preserved; videography encouraged under BNSS 105.'
  },
  {
    id: 74,
    old_act: 'IEA 1872',
    old_section: 'Section 32(1)',
    new_act: 'BSA 2023',
    new_section: 'Section 26(a)',
    offense_title: 'Dying Declaration',
    category: 'IEA_BSA',
    status: 'Active',
    penalty_summary: 'Statement as to cause of death admissible without cross-examination',
    bailable_status: 'Substantive Evidence',
    cognizable_status: 'Admissibility Exception',
    key_change: 'Audio-video recorded dying declarations granted statutory recognition.'
  },
  {
    id: 75,
    old_act: 'IEA 1872',
    old_section: 'Section 45',
    new_act: 'BSA 2023',
    new_section: 'Section 39',
    offense_title: 'Opinions of Experts (Digital Forensics, Signatures)',
    category: 'IEA_BSA',
    status: 'Enhanced',
    penalty_summary: 'Opinion of examiner of electronic records and cyber forensics admissible',
    bailable_status: 'Expert Proof',
    cognizable_status: 'Scientific Evidence',
    key_change: 'Includes Cert-In accredited digital forensics experts.'
  },
  {
    id: 76,
    old_act: 'IEA 1872',
    old_section: 'Section 101 / 102',
    new_act: 'BSA 2023',
    new_section: 'Section 104 / 105',
    offense_title: 'Burden of Proof',
    category: 'IEA_BSA',
    status: 'Active',
    penalty_summary: 'Party asserting legal right must prove facts',
    bailable_status: 'Core Evidence Rule',
    cognizable_status: 'Civil & Criminal Trials',
    key_change: 'Preponderance of probabilities for civil; beyond reasonable doubt for criminal.'
  },
  {
    id: 77,
    old_act: 'IEA 1872',
    old_section: 'Section 113B',
    new_act: 'BSA 2023',
    new_section: 'Section 118',
    offense_title: 'Presumption as to Dowry Death',
    category: 'IEA_BSA',
    status: 'Active',
    penalty_summary: 'Mandatory reverse presumption if harassment shown within 7 years of marriage',
    bailable_status: 'Reverse Burden of Proof',
    cognizable_status: 'Statutory Presumption',
    key_change: 'Statutory burden shift onto husband once basic harassment is shown.'
  },
  {
    id: 78,
    old_act: 'IEA 1872',
    old_section: 'Section 114A',
    new_act: 'BSA 2023',
    new_section: 'Section 119',
    offense_title: 'Presumption as to Absence of Consent in Rape Prosecutions',
    category: 'IEA_BSA',
    status: 'Active',
    penalty_summary: 'If victim states she did not consent, court shall presume absence of consent',
    bailable_status: 'Protective Presumption',
    cognizable_status: 'Trial Mandate',
    key_change: 'Non-negotiable evidentiary protection for victim testimony.'
  },
  {
    id: 79,
    old_act: 'IEA 1872',
    old_section: 'Section 115',
    new_act: 'BSA 2023',
    new_section: 'Section 121',
    offense_title: 'Estoppel',
    category: 'IEA_BSA',
    status: 'Active',
    penalty_summary: 'Party cannot deny truth of thing intentionally caused another to act upon',
    bailable_status: 'Equitable Doctrine',
    cognizable_status: 'Commercial & Civil Proof',
    key_change: 'Applies to contractual representations and digital acceptance.'
  },
  {
    id: 80,
    old_act: 'IEA 1872',
    old_section: 'Section 137 / 138',
    new_act: 'BSA 2023',
    new_section: 'Section 142 / 143',
    offense_title: 'Order of Examinations (Chief, Cross, Re-Examination)',
    category: 'IEA_BSA',
    status: 'Active',
    penalty_summary: 'Examination through video-conferencing explicitly authorized',
    bailable_status: 'Trial Procedure',
    cognizable_status: 'Examination of Witnesses',
    key_change: 'Full statutory recognition of remote video testimony.'
  },
  {
    id: 81,
    old_act: 'IEA 1872',
    old_section: 'Section 154',
    new_act: 'BSA 2023',
    new_section: 'Section 159',
    offense_title: 'Hostile Witness (Questions by Party to Own Witness)',
    category: 'IEA_BSA',
    status: 'Active',
    penalty_summary: 'Testimony of hostile witness is not discarded entirely and can be relied upon',
    bailable_status: 'Trial Discretion',
    cognizable_status: 'Impeachment of Witness',
    key_change: 'Sub-section (2) affirms hostile witness evidence remains partially usable.'
  },
  {
    id: 82,
    old_act: 'IEA 1872',
    old_section: 'Section 159',
    new_act: 'BSA 2023',
    new_section: 'Section 164',
    offense_title: 'Refreshing Memory by Writing or Electronic Record',
    category: 'IEA_BSA',
    status: 'Enhanced',
    penalty_summary: 'Witness may refresh memory from electronic device or digital case diary',
    bailable_status: 'Evidentiary Aid',
    cognizable_status: 'Examination Aid',
    key_change: 'Allows police and doctors to refresh memory from digital hospital logs.'
  },

  // 7. SAVINGS & TRANSITION CLAUSES
  {
    id: 83,
    old_act: 'IPC 1860',
    old_section: 'Section 1-511 (All Sections)',
    new_act: 'BNS 2023',
    new_section: 'Section 358',
    offense_title: 'Repeal and Savings Clause of Bharatiya Nyaya Sanhita, 2023',
    category: 'SAVINGS_TRANSITION',
    status: 'Overarching Rule',
    penalty_summary: 'Acts committed on or before 30 June 2024 MUST be tried under IPC. BNS applies exclusively post 1 July 2024.',
    bailable_status: 'Constitutional Mandate',
    cognizable_status: 'Substantive Law Rule',
    key_change: 'Article 20(1) bar against ex-post facto laws: No person can be punished under BNS for an act committed before 1 July 2024.'
  },
  {
    id: 84,
    old_act: 'CrPC 1973',
    old_section: 'Section 1-484 (All Sections)',
    new_act: 'BNSS 2023',
    new_section: 'Section 531',
    offense_title: 'Repeal and Savings Clause of BNSS, 2023',
    category: 'SAVINGS_TRANSITION',
    status: 'Overarching Rule',
    penalty_summary: 'Pending trials/appeals continue under CrPC. Fresh FIRs/complaints post 1 July 2024 follow BNSS.',
    bailable_status: 'Procedural Rule',
    cognizable_status: 'Procedural Grandfathering',
    key_change: 'Investigation and bail for any fresh complaint post-July 1, 2024 follows BNSS, even if offense occurred under IPC.'
  },
  {
    id: 85,
    old_act: 'IEA 1872',
    old_section: 'Section 1-167 (All Sections)',
    new_act: 'BSA 2023',
    new_section: 'Section 170',
    offense_title: 'Repeal and Savings Clause of Bharatiya Sakshya Adhiniyam, 2023',
    category: 'SAVINGS_TRANSITION',
    status: 'Overarching Rule',
    penalty_summary: 'Evidence filed in court proceedings on or after 1 July 2024 must comply with BSA 2023',
    bailable_status: 'Evidentiary Standard',
    cognizable_status: 'Procedural Standard',
    key_change: 'Section 63 electronic certificates govern all new evidentiary filings.'
  },
  {
    id: 86,
    old_act: 'Constitution',
    old_section: 'Article 20(1)',
    new_act: 'Constitution',
    new_section: 'Article 20(1)',
    offense_title: 'Protection Against Ex-Post Facto Criminal Laws',
    category: 'SAVINGS_TRANSITION',
    status: 'Supreme Protection',
    penalty_summary: 'No person shall be convicted except for violation of law in force at time of commission',
    bailable_status: 'Fundamental Right',
    cognizable_status: 'Non-Derogable',
    key_change: 'Supreme bar preventing police from applying newly created BNS offenses retrospectively.'
  },
  {
    id: 87,
    old_act: 'IPC 1860',
    old_section: 'Section 279',
    new_act: 'BNS 2023',
    new_section: 'Section 281',
    offense_title: 'Rash Driving or Riding on a Public Way',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Up to 6 months imprisonment or fine up to ₹1,000 or both',
    bailable_status: 'Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Standard traffic rash driving provision.'
  },
  {
    id: 88,
    old_act: 'IPC 1860',
    old_section: 'Section 337 / 338',
    new_act: 'BNS 2023',
    new_section: 'Section 125(a) & (b)',
    offense_title: 'Causing Hurt by Act Endangering Life or Personal Safety',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Hurt: up to 6 months; Grievous hurt: up to 3 years or fine or both',
    bailable_status: 'Bailable',
    cognizable_status: 'Cognizable',
    key_change: 'Invoked alongside Section 281 in road accident cases.'
  },
  {
    id: 89,
    old_act: 'IPC 1860',
    old_section: 'Section 427',
    new_act: 'BNS 2023',
    new_section: 'Section 324(4)',
    offense_title: 'Mischief Causing Damage of ₹20,000 to ₹1 Lakh',
    category: 'IPC_BNS',
    status: 'Enhanced',
    penalty_summary: 'Up to 2 years or fine or both',
    bailable_status: 'Bailable',
    cognizable_status: 'Non-Cognizable',
    key_change: 'Colonial ₹50 damage threshold updated to realistic modern economic loss brackets.'
  },
  {
    id: 90,
    old_act: 'IPC 1860',
    old_section: 'Section 504',
    new_act: 'BNS 2023',
    new_section: 'Section 352',
    offense_title: 'Intentional Insult with Intent to Provoke Breach of Peace',
    category: 'IPC_BNS',
    status: 'Active',
    penalty_summary: 'Up to 2 years imprisonment or fine or both',
    bailable_status: 'Bailable',
    cognizable_status: 'Non-Cognizable',
    key_change: 'Standard provision in altercations, tenancy disputes, and public disputes.'
  }
];

export class ClientConcordanceEngine {
  static search(queryStr?: string, categoryFilter?: string, limit: number = 100): ConcordanceItem[] {
    let results = CLIENT_CONCORDANCE_MASTER_DATA;
    if (categoryFilter && categoryFilter !== 'ALL') {
      results = results.filter(r => r.category === categoryFilter);
    }
    if (!queryStr || !queryStr.trim()) {
      return results.slice(0, limit);
    }
    const q = queryStr.toLowerCase().trim();
    return results.filter(r => 
      r.old_section.toLowerCase().includes(q) ||
      r.new_section.toLowerCase().includes(q) ||
      r.offense_title.toLowerCase().includes(q) ||
      r.old_act.toLowerCase().includes(q) ||
      r.new_act.toLowerCase().includes(q) ||
      r.key_change.toLowerCase().includes(q)
    ).slice(0, limit);
  }

  static evaluateTransitionDate(incidentDateStr: string): TransitionAdvisorResult {
    try {
      const parts = incidentDateStr.trim().split(/[-/.]/);
      let year = 0;
      let month = 0;
      let day = 0;

      if (parts.length === 3) {
        if (parts[0].length === 4) {
          year = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10);
          day = parseInt(parts[2], 10);
        } else {
          day = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10);
          year = parseInt(parts[2], 10);
        }
      } else if (incidentDateStr.trim().length === 4 && /^\d{4}$/.test(incidentDateStr.trim())) {
        year = parseInt(incidentDateStr.trim(), 10);
        month = 1;
        day = 1;
      } else {
        return {
          status: 'error',
          message: 'Please enter a valid date in YYYY-MM-DD or DD/MM/YYYY format.'
        };
      }

      const inputDate = new Date(year, month - 1, day);
      const cutoffDate = new Date(2024, 6, 1); // July 1, 2024

      const isPreJuly = inputDate < cutoffDate;

      if (isPreJuly) {
        return {
          status: 'success',
          incident_date: inputDate.toISOString().split('T')[0],
          regime: 'PRE_JULY_2024_COLONIAL_LAWS',
          substantive_law: 'Indian Penal Code, 1860 (IPC)',
          procedural_law: 'BNSS 2023 for investigation and bail if FIR filed post-July 1, 2024 (Section 531 BNSS); CrPC 1973 if already pending.',
          evidence_law: 'Bharatiya Sakshya Adhiniyam, 2023 (for evidence tendered today in court)',
          governing_savings_section: 'Section 358(1) & (2) of Bharatiya Nyaya Sanhita, 2023',
          constitutional_safeguard: 'Article 20(1) Constitution of India (Absolute prohibition against ex-post facto criminal prosecution)',
          actionable_instruction: `Because the offence occurred on ${inputDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} (prior to 1 July 2024), the police or court MUST charge the accused under the relevant sections of the Indian Penal Code, 1860 (e.g. Section 420 for cheating, Section 302 for murder). Charging under BNS 2023 is unconstitutional and liable to be quashed under Section 528 BNSS.`
        };
      } else {
        return {
          status: 'success',
          incident_date: inputDate.toISOString().split('T')[0],
          regime: 'POST_JULY_2024_MODERN_SANHITAS',
          substantive_law: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
          procedural_law: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
          evidence_law: 'Bharatiya Sakshya Adhiniyam, 2023 (BSA)',
          governing_savings_section: 'Section 1(2) BNS 2023 & Ministry of Home Affairs Gazette S.O. 850(E)',
          constitutional_safeguard: 'Law in force on the date of commission',
          actionable_instruction: `Because the offence occurred on ${inputDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} (on or after 1 July 2024), the Indian Penal Code is completely superseded. The FIR, charge-sheet, and court summons must strictly cite the Bharatiya Nyaya Sanhita, 2023 (e.g. Section 318 for cheating, Section 103 for murder) and follow BNSS procedural rules.`
        };
      }
    } catch (e: any) {
      return { status: 'error', message: `Date evaluation failed: ${e.message}` };
    }
  }
}
