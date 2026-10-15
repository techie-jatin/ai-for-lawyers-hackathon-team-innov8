import { CANONICAL_PROVISIONS, CANONICAL_CONCORDANCES, verifyStatutoryQuote, searchCanonicalProvisions } from '../src/services/clientLegalEngine';

export interface TestReport {
  id: number;
  category: string;
  name: string;
  input: any;
  passed: boolean;
  score: number;
  expected: string;
  actual: string;
  problem?: string;
  recommendation?: string;
}

// Use new Intelligent Multi-Pillar Statute Search Engine
function currentSearchLogic(query: string, sourceId?: string) {
  return searchCanonicalProvisions(query, sourceId);
}

export function runComprehensive100Suite() {
  const results: TestReport[] = [];

  // =========================================================================
  // PART A: STATUTE SEARCH (55 TEST CASES)
  // =========================================================================
  const searchTestCases = [
    // 1-10: Exact Section Lookups
    { id: 1, name: 'Exact BNS Section 318', query: 'Section 318', expectSec: 'Section 318(4)' },
    { id: 2, name: 'Exact BNS Section 103', query: 'Section 103', expectSec: 'Section 103' },
    { id: 3, name: 'Exact BNS Section 303', query: 'Section 303', expectSec: 'Section 303' },
    { id: 4, name: 'Exact BNS Section 85', query: 'Section 85', expectSec: 'Section 85' },
    { id: 5, name: 'Exact BNSS Section 35(3)', query: 'Section 35(3)', expectSec: 'Section 35(3)' },
    { id: 6, name: 'Exact BNSS Section 482', query: 'Section 482', expectSec: 'Section 482' },
    { id: 7, name: 'Exact BNSS Section 528', query: 'Section 528', expectSec: 'Section 528' },
    { id: 8, name: 'Exact BSA Section 63', query: 'Section 63', expectSec: 'Section 63' },
    { id: 9, name: 'Exact Article 21', query: 'Article 21', expectSec: 'Article 21' },
    { id: 10, name: 'Exact Article 14', query: 'Article 14', expectSec: 'Article 14' },

    // 11-18: Non-Criminal & Specialized Acts Exact Sections
    { id: 11, name: 'Exact NI Act Section 138', query: 'Section 138', expectSec: 'Section 138' },
    { id: 12, name: 'Exact Contract Act Section 73', query: 'Section 73', expectSec: 'Section 73' },
    { id: 13, name: 'Exact CPC Order 39', query: 'Order 39', expectSec: 'Order XXXIX' },
    { id: 14, name: 'Exact Arbitration Section 9', query: 'Section 9', expectSec: 'Section 9' },
    { id: 15, name: 'Exact Consumer Protection Section 35', query: 'Section 35', expectSec: 'Section 35' },
    { id: 16, name: 'Exact Motor Vehicles Section 119', query: 'Section 119', expectSec: 'Section 119' },
    { id: 17, name: 'Exact RERA Section 18', query: 'Section 18', expectSec: 'Section 18' },
    { id: 18, name: 'Exact RTI Section 6', query: 'Section 6', expectSec: 'Section 6' },

    // 19-25: Colonial Section Inquiries (Needs Concordance Bridge)
    { id: 19, name: 'Colonial IPC 420 Cheating', query: 'IPC 420', expectSec: 'Section 318(4)' },
    { id: 20, name: 'Colonial IPC 302 Murder', query: 'IPC 302', expectSec: 'Section 103' },
    { id: 21, name: 'Colonial CrPC 438 Anticipatory Bail', query: 'Section 438 CrPC', expectSec: 'Section 482' },
    { id: 22, name: 'Colonial CrPC 482 Quashing', query: 'Section 482 CrPC', expectSec: 'Section 528' },
    { id: 23, name: 'Colonial CrPC 154 FIR', query: 'Section 154 CrPC', expectSec: 'Section 173' },
    { id: 24, name: 'Colonial CrPC 41A Notice', query: 'Section 41A CrPC', expectSec: 'Section 35(3)' },
    { id: 25, name: 'Colonial IEA 65B Electronic Records', query: 'Section 65B', expectSec: 'Section 63' },

    // 26-32: Prefix and Abbreviation Variations
    { id: 26, name: 'Abbreviation sec. 318', query: 'sec. 318', expectSec: 'Section 318(4)' },
    { id: 27, name: 'Abbreviation sec 35', query: 'sec 35', expectSec: 'Section 35(3)' },
    { id: 28, name: 'Abbreviation art. 21', query: 'art. 21', expectSec: 'Article 21' },
    { id: 29, name: 'Abbreviation art 19', query: 'art 19', expectSec: 'Article 19' },
    { id: 30, name: 'Lowercase article 226', query: 'article 226', expectSec: 'Article 226' },
    { id: 31, name: 'Bare Number 138 with NI hint', query: '138 cheque', expectSec: 'Section 138' },
    { id: 32, name: 'Bare Number 318 with cheat hint', query: '318 cheating', expectSec: 'Section 318(4)' },

    // 33-40: Factual & Concept Queries
    { id: 33, name: 'Concept: traffic light rules', query: 'traffic light rules', expectSec: 'Section 119' },
    { id: 34, name: 'Concept: stop line signal jump', query: 'stop line signal jump', expectSec: 'Section 119' },
    { id: 35, name: 'Concept: delay in flat handover builder refund', query: 'delay in flat handover builder refund', expectSec: 'Section 18' },
    { id: 36, name: 'Concept: evaluated board exam answer sheet inspection', query: 'evaluated board exam answer sheet inspection', expectSec: 'Section 6' },
    { id: 37, name: 'Concept: 5 years continuous service gratuity unpaid', query: '5 years continuous service gratuity unpaid', expectSec: 'Section 4' },
    { id: 38, name: 'Concept: chemical factory river pollution NGT', query: 'chemical factory river pollution NGT', expectSec: 'Section 14 & 15' },
    { id: 39, name: 'Concept: married daughter coparcener share ancestral property', query: 'married daughter coparcener share ancestral property', expectSec: 'Section 6' },
    { id: 40, name: 'Concept: income tax reassessment notice section 148', query: 'income tax reassessment notice section 148', expectSec: 'Section 148' },

    // 41-47: Common Typos & Fuzzy Inputs
    { id: 41, name: 'Typo: Articel 21', query: 'Articel 21', expectSec: 'Article 21' },
    { id: 42, name: 'Typo: Setcion 318', query: 'Setcion 318', expectSec: 'Section 318(4)' },
    { id: 43, name: 'Typo: red lite challan', query: 'red lite challan', expectSec: 'Section 119' },
    { id: 44, name: 'Typo: cheq bounc 138', query: 'cheq bounc 138', expectSec: 'Section 138' },
    { id: 45, name: 'Typo: anticipetry bail', query: 'anticipetry bail', expectSec: 'Section 482' },
    { id: 46, name: 'Typo: quashign fir 528', query: 'quashign fir 528', expectSec: 'Section 528' },
    { id: 47, name: 'Typo: whatspp electornic evdence', query: 'whatspp electornic evdence', expectSec: 'Section 63' },

    // 48-52: Stop-word Polluted Queries
    { id: 48, name: 'Stopword: what is the meaning of section 318', query: 'what is the meaning of section 318', expectSec: 'Section 318(4)' },
    { id: 49, name: 'Stopword: is there any protection under article 21', query: 'is there any protection under article 21', expectSec: 'Article 21' },
    { id: 50, name: 'Stopword: how to file an application under section 138', query: 'how to file an application under section 138', expectSec: 'Section 138' },
    { id: 51, name: 'Stopword: who is liable for red light fine', query: 'who is liable for red light fine', expectSec: 'Section 119' },
    { id: 52, name: 'Stopword: explain the rule of law in article 14', query: 'explain the rule of law in article 14', expectSec: 'Article 14' },

    // 53-55: Non-existent / Extreme Edge Cases
    { id: 53, name: 'Edge: Non-existent Section 9999', query: 'Section 9999', expectSec: 'NONE' },
    { id: 54, name: 'Edge: Non-existent Article 500', query: 'Article 500', expectSec: 'NONE' },
    { id: 55, name: 'Edge: Arbitrary string with no legal relevance', query: 'xyzqwerty nonsense banana', expectSec: 'NONE' }
  ];

  for (const tc of searchTestCases) {
    const rawMatches = currentSearchLogic(tc.query);
    const topMatch = rawMatches[0];
    const topSec = topMatch ? topMatch.section_number : 'NONE';
    const topTitle = topMatch ? topMatch.title : 'None';

    let passed = false;
    let score = 0;
    let problem = '';

    if (tc.expectSec === 'NONE') {
      // In current logic, if terms don't match, it dumped ALL canonical provisions!
      if (rawMatches.length === CANONICAL_PROVISIONS.length) {
        passed = false;
        score = 0.1;
        problem = 'Dumped all provisions as fallback instead of reporting zero authentic matches.';
      } else if (rawMatches.length === 0) {
        passed = true;
        score = 1.0;
      } else {
        passed = false;
        score = 0.3;
        problem = `Spurious matches returned for non-existent query (${rawMatches.length} items).`;
      }
    } else {
      const isTopMatched = topSec.toLowerCase().includes(tc.expectSec.toLowerCase());
      const isAnyMatched = rawMatches.some(m => m.section_number.toLowerCase().includes(tc.expectSec.toLowerCase()));

      if (isTopMatched) {
        passed = true;
        score = 1.0;
      } else if (isAnyMatched) {
        passed = false;
        score = 0.6;
        problem = `Expected section was matched at lower rank (#${rawMatches.findIndex(m => m.section_number.toLowerCase().includes(tc.expectSec.toLowerCase())) + 1}), not #1.`;
      } else {
        passed = false;
        score = 0.0;
        problem = `Expected ${tc.expectSec} was completely absent in search results.`;
      }
    }

    results.push({
      id: tc.id,
      category: 'Statute Search',
      name: tc.name,
      input: tc.query,
      passed,
      score,
      expected: tc.expectSec,
      actual: topSec,
      problem,
      recommendation: problem ? 'Upgrade with weighted token scoring, colonial concordance detection, and zero-match guard.' : undefined
    });
  }

  // =========================================================================
  // PART B: VALIDATOR HUB (50 TEST CASES)
  // =========================================================================
  const validatorTestCases = [
    // 56-65: 100% Verbatim Authentic National Gazette Quotes
    { id: 56, name: 'Verbatim Article 21', sec: 'Article 21', quote: 'No person shall be deprived of his life or personal liberty except according to procedure established by law.', expectValid: true, minRatio: 0.95 },
    { id: 57, name: 'Verbatim Article 14', sec: 'Article 14', quote: 'The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India.', expectValid: true, minRatio: 0.95 },
    { id: 58, name: 'Verbatim BNS 318(4)', sec: 'Section 318(4)', quote: 'Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, or anything which is signed or sealed, and which is capable of being converted into a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.', expectValid: true, minRatio: 0.95 },
    { id: 59, name: 'Verbatim BNSS 35(3)', sec: 'Section 35(3)', quote: 'The police officer shall, in all cases where the arrest of a person is not required under the provisions of sub-section (1), issue a notice directing the person against whom a reasonable complaint has been made, or credible information has been received, or a reasonable suspicion exists that he has committed a cognizable offence, to appear before him or at such other place as may be specified in the notice.', expectValid: true, minRatio: 0.95 },
    { id: 60, name: 'Verbatim BNSS 528', sec: 'Section 528', quote: 'Nothing in this Sanhita shall be deemed to limit or affect the inherent powers of the High Court to make such orders as may be necessary to give effect to any order under this Sanhita, or to prevent abuse of the process of any Court or otherwise to secure the ends of justice.', expectValid: true, minRatio: 0.95 },
    { id: 61, name: 'Verbatim BSA 63', sec: 'Section 63', quote: 'Notwithstanding anything contained in this Adhiniyam, any information contained in an electronic record which is printed on a paper, stored, recorded or copied in optical or magnetic media or semiconductor memory produced by a computer shall be deemed to be also a document, if the conditions mentioned in this section are satisfied in relation to the information and computer in question and shall be admissible in any proceedings, without further proof or production of the original, as evidence of any contents of the original or of any fact stated therein of which direct evidence would be admissible.', expectValid: true, minRatio: 0.95 },
    { id: 62, name: 'Verbatim NI Act 138', sec: 'Section 138', quote: 'Where any cheque drawn by a person on an account maintained by him with a banker for payment of any amount of money to another person from out of that account for the discharge, in whole or in part, of any debt or other liability, is returned by the bank unpaid, either because of the amount of money standing to the credit of that account is insufficient to honour the cheque or that it exceeds the amount arranged to be paid from that account by an agreement made with that bank, such person shall be deemed to have committed an offence and shall, without prejudice to any other provisions of this Act, be punished with imprisonment for a term which may be extended to two years, or with fine which may extend to twice the amount of the cheque, or with both.', expectValid: true, minRatio: 0.95 },
    { id: 63, name: 'Verbatim MV Act 119', sec: 'Section 119', quote: 'Every driver of a motor vehicle shall drive the vehicle in conformity with any indicated traffic sign, and shall comply with all directions given to him by any police officer for the time being engaged in the regulation of traffic in any public place.', expectValid: true, minRatio: 0.95 },
    { id: 64, name: 'Verbatim RERA 18', sec: 'Section 18', quote: 'If the promoter fails to complete or is unable to give possession of an apartment, plot or building in accordance with the terms of the agreement for sale or, as the case may be, duly completed by the date specified therein, he shall be liable on demand to the allottees, in case the allottee wishes to withdraw from the project, without prejudice to any other remedy available, to return the amount received by him in respect of that apartment, plot, building, as the case may be, with interest at such rate as may be prescribed.', expectValid: true, minRatio: 0.90 },
    { id: 65, name: 'Verbatim Gratuity 4', sec: 'Section 4', quote: 'Gratuity shall be payable to an employee on the termination of his employment after he has rendered continuous service for not less than five years on his superannuation, or on his retirement or resignation, or on his death or disablement due to accident or disease.', expectValid: true, minRatio: 0.90 },

    // 66-73: Punctuation, Case and Minor Whitespace Variations (Should still verify as legitimate)
    { id: 66, name: 'Minor Whitespace Art 21', sec: 'Article 21', quote: 'No  person  shall be deprived   of his life or personal liberty except according to procedure established by law.', expectValid: true, minRatio: 0.95 },
    { id: 67, name: 'Punctuation Missing Art 14', sec: 'Article 14', quote: 'The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India', expectValid: true, minRatio: 0.95 },
    { id: 68, name: 'Capitalization Variance Art 19', sec: 'Article 19', quote: 'all citizens shall have the right to freedom of speech and expression.', expectValid: true, minRatio: 0.80 },
    { id: 69, name: 'Prefix Whitespace Sec 318', sec: '  Section 318(4)  ', quote: 'Whoever cheats and thereby dishonestly induces the person deceived to deliver any property', expectValid: true, minRatio: 0.85 },
    { id: 70, name: 'Quotation Marks Included', sec: 'Section 119', quote: '"Every driver of a motor vehicle shall drive the vehicle in conformity with any indicated traffic sign"', expectValid: true, minRatio: 0.90 },
    { id: 71, name: 'Ellipsis in Middle Art 21', sec: 'Article 21', quote: 'No person shall be deprived of his life... except according to procedure established by law.', expectValid: true, minRatio: 0.85 },
    { id: 72, name: 'Section Suffix Omission (Sec 318 instead of Sec 318(4))', sec: 'Section 318', quote: 'Whoever cheats and thereby dishonestly induces the person deceived to deliver any property', expectValid: true, minRatio: 0.85 },
    { id: 73, name: 'Bare Section 138 number', sec: '138', quote: 'Where any cheque drawn by a person on an account maintained by him with a banker for payment of any amount of money', expectValid: true, minRatio: 0.85 },

    // 74-83: Partial Clauses (Sub-section / Clause Matching)
    { id: 74, name: 'Partial Clause: Section 35(3) notice mandate', sec: 'Section 35(3)', quote: 'issue a notice directing the person against whom a reasonable complaint has been made', expectValid: true, minRatio: 0.70 },
    { id: 75, name: 'Partial Clause: Section 528 inherent powers', sec: 'Section 528', quote: 'to prevent abuse of the process of any Court or otherwise to secure the ends of justice', expectValid: true, minRatio: 0.70 },
    { id: 76, name: 'Partial Clause: Section 63 electronic document', sec: 'Section 63', quote: 'shall be deemed to be also a document, if the conditions mentioned in this section are satisfied', expectValid: true, minRatio: 0.70 },
    { id: 77, name: 'Partial Clause: Section 138 penalty twice amount', sec: 'Section 138', quote: 'punished with imprisonment for a term which may be extended to two years, or with fine which may extend to twice the amount of the cheque', expectValid: true, minRatio: 0.70 },
    { id: 78, name: 'Partial Clause: Article 320 directory consultation', sec: 'Article 320', quote: 'The Union Public Service Commission or the State Public Service Commission, as the case may be, shall be consulted', expectValid: true, minRatio: 0.70 },
    { id: 79, name: 'Partial Clause: Hindu Succession 6 coparcenary by birth', sec: 'Section 6', quote: 'the daughter of a coparcener shall by birth become a coparcener in her own right the same manner as the son', expectValid: true, minRatio: 0.70 },
    { id: 80, name: 'Partial Clause: NGT Act 14 jurisdiction', sec: 'Section 14 & 15', quote: 'The Tribunal shall have the jurisdiction over all civil cases where a substantial question relating to environment is involved', expectValid: true, minRatio: 0.70 },
    { id: 81, name: 'Partial Clause: Income Tax 148 notice', sec: 'Section 148', quote: 'the Assessing Officer shall serve on the assessee a notice, along with a copy of the order passed', expectValid: true, minRatio: 0.70 },
    { id: 82, name: 'Partial Clause: DPDP Act 33 penalty 250 crores', sec: 'Section 33', quote: 'failure of security safeguards preventing personal data breach', expectValid: true, minRatio: 0.70 },
    { id: 83, name: 'Partial Clause: IT Act 66D cyber cheating', sec: 'Section 66D', quote: 'punished with imprisonment of either description for a term which may extend to three years and with fine', expectValid: true, minRatio: 0.70 },

    // 84-93: Fabricated / Hallucinated Quotes (Must be flagged as INVALID!)
    { id: 84, name: 'Hallucination: Police can beat accused under Art 21', sec: 'Article 21', quote: 'Police officers have the full legal right to torture suspects in custody to extract confessions.', expectValid: false, maxRatio: 0.40 },
    { id: 85, name: 'Hallucination: Cheque bounce is capital punishment', sec: 'Section 138', quote: 'Anyone bouncing a cheque shall be sentenced to life imprisonment without bail.', expectValid: false, maxRatio: 0.40 },
    { id: 86, name: 'Hallucination: Red light jump allows vehicle confiscation', sec: 'Section 119', quote: 'Traffic police shall permanently seize and destroy any motor vehicle jumping a red signal.', expectValid: false, maxRatio: 0.40 },
    { id: 87, name: 'Hallucination: BNS 318 excuses fraud if settled later', sec: 'Section 318(4)', quote: 'Cheating is completely legal if the borrower promises to repay after five years.', expectValid: false, maxRatio: 0.40 },
    { id: 88, name: 'Hallucination: Synthetic AI quote with fake Latin phrases', sec: 'Section 528', quote: 'Ipso jure contra legem the Magistrate shall dissolve all proceedings post-haste without trial.', expectValid: false, maxRatio: 0.40 },
    { id: 89, name: 'Hallucination: Gratuity payable after 1 day service', sec: 'Section 4', quote: 'Every worker who joins for single day is entitled to ten lakh rupees instant gratuity.', expectValid: false, maxRatio: 0.40 },
    { id: 90, name: 'Hallucination: DPDP allows selling data to highest bidder', sec: 'Section 33', quote: 'Data fiduciaries may freely sell user private messages to third-party marketing companies without consent.', expectValid: false, maxRatio: 0.40 },
    { id: 91, name: 'Hallucination: RTI applications can be rejected without reason', sec: 'Section 6', quote: 'Public information officers have arbitrary immunity to burn public requests.', expectValid: false, maxRatio: 0.40 },
    { id: 92, name: 'Hallucination: RERA builder never has to pay refund', sec: 'Section 18', quote: 'Promoters are immune from paying any interest regardless of 10 years project delay.', expectValid: false, maxRatio: 0.40 },
    { id: 93, name: 'Hallucination: Section 35(3) mandatory execution without inquiry', sec: 'Section 35(3)', quote: 'The police must arrest all family members instantly without issuing any summons.', expectValid: false, maxRatio: 0.40 },

    // 94-98: Section / Quote Mismatches (Cross-Statute Pollution)
    { id: 94, name: 'Mismatch: Quoting Article 21 against Section 318(4)', sec: 'Section 318(4)', quote: 'No person shall be deprived of his life or personal liberty except according to procedure established by law.', expectValid: false, maxRatio: 0.35 },
    { id: 95, name: 'Mismatch: Quoting Section 138 against Article 14', sec: 'Article 14', quote: 'returned by the bank unpaid, either because of the amount of money standing to the credit of that account is insufficient', expectValid: false, maxRatio: 0.35 },
    { id: 96, name: 'Mismatch: Quoting Traffic MV Act against BNSS 482', sec: 'Section 482', quote: 'Every driver of a motor vehicle shall drive the vehicle in conformity with any indicated traffic sign', expectValid: false, maxRatio: 0.35 },
    { id: 97, name: 'Mismatch: Quoting Gratuity against RTI', sec: 'Section 6', quote: 'Gratuity shall be payable to an employee on the termination of his employment after he has rendered continuous service', expectValid: false, maxRatio: 0.35 },
    { id: 98, name: 'Mismatch: Quoting Consumer Act against Hindu Succession', sec: 'Section 6', quote: 'deficiency in service, breach of warranty, or misleading advertisement', expectValid: false, maxRatio: 0.35 },

    // 99-105: Non-Existent Sections / Adversarial Injections
    { id: 99, name: 'Non-Existent Section 99999', sec: 'Section 99999', quote: 'Any person who violates this section shall be fined.', expectValid: false, maxRatio: 0.40 },
    { id: 100, name: 'Non-Existent Article 999', sec: 'Article 999', quote: 'The Parliament of India shall convene every century.', expectValid: false, maxRatio: 0.40 },
    { id: 101, name: 'Colonial Section IPC 420 with BNS 318 quote', sec: 'Section 420 IPC', quote: 'Whoever cheats and thereby dishonestly induces the person deceived to deliver any property', expectValid: true, minRatio: 0.80 },
    { id: 102, name: 'Colonial Section CrPC 438 with BNSS 482 quote', sec: 'Section 438 CrPC', quote: 'Direction for grant of bail to person apprehending arrest', expectValid: true, minRatio: 0.75 },
    { id: 103, name: 'Adversarial SQL Injection in Section Number', sec: "Section 318' OR '1'='1", quote: 'Whoever cheats and thereby dishonestly induces the person deceived', expectValid: true, minRatio: 0.80 },
    { id: 104, name: 'Adversarial XSS Script Tag in Quote', sec: 'Article 21', quote: '<script>alert(1)</script>No person shall be deprived of his life or personal liberty except according to procedure established by law.', expectValid: true, minRatio: 0.85 },
    { id: 105, name: 'Forced Hallucination Flag Mode Active', sec: 'Article 21', quote: 'No person shall be deprived of his life or personal liberty', forceHallucinate: true, expectValid: false, maxRatio: 0.15 }
  ];

  for (const tc of validatorTestCases) {
    const outcome = verifyStatutoryQuote(tc.sec, tc.quote, Boolean((tc as any).forceHallucinate));
    let passed = false;
    let score = 0;
    let problem = '';

    if (tc.expectValid) {
      if (outcome.is_valid && outcome.match_ratio >= (tc.minRatio || 0.70)) {
        passed = true;
        score = 1.0;
      } else {
        passed = false;
        score = outcome.match_ratio;
        problem = `Expected valid statutory verification (>= ${tc.minRatio}), but received is_valid=${outcome.is_valid} with match_ratio=${outcome.match_ratio}. Reason: ${outcome.reason}`;
      }
    } else {
      if (!outcome.is_valid && outcome.match_ratio <= (tc.maxRatio || 0.45)) {
        passed = true;
        score = 1.0;
      } else {
        passed = false;
        score = 0.0;
        problem = `Expected INVALID detection, but system accepted claim as is_valid=${outcome.is_valid} with match_ratio=${outcome.match_ratio}.`;
      }
    }

    results.push({
      id: tc.id,
      category: 'Validator Hub',
      name: tc.name,
      input: { section: tc.sec, quote: tc.quote.slice(0, 50) + '...' },
      passed,
      score,
      expected: tc.expectValid ? `VALID (>= ${tc.minRatio})` : `INVALID (<= ${tc.maxRatio})`,
      actual: `${outcome.is_valid ? 'VALID' : 'INVALID'} (${outcome.match_ratio}) - ${outcome.source_title} (${outcome.section_number})`,
      problem,
      recommendation: problem ? 'Enhance section normalization, concordance cross-statute resolution, and non-existent section rejection gate.' : undefined
    });
  }

  // Calculate metrics
  const total = results.length;
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = total - passedCount;
  const searchTests = results.filter(r => r.category === 'Statute Search');
  const validatorTests = results.filter(r => r.category === 'Validator Hub');

  const searchPassed = searchTests.filter(r => r.passed).length;
  const validatorPassed = validatorTests.filter(r => r.passed).length;

  console.log('=============================================================================');
  console.log('  105-POINT COMPREHENSIVE SYSTEM CHECK: STATUTE SEARCH & VALIDATOR HUB       ');
  console.log('=============================================================================');
  console.log(`Total Scenarios Tested : ${total}`);
  console.log(`Passed                 : ${passedCount} (${((passedCount / total) * 100).toFixed(1)}%)`);
  console.log(`Failed / Deficiencies  : ${failedCount} (${((failedCount / total) * 100).toFixed(1)}%)`);
  console.log('-----------------------------------------------------------------------------');
  console.log(`Statute Search Score   : ${searchPassed}/${searchTests.length} (${((searchPassed / searchTests.length) * 100).toFixed(1)}%)`);
  console.log(`Validator Hub Score    : ${validatorPassed}/${validatorTests.length} (${((validatorPassed / validatorTests.length) * 100).toFixed(1)}%)`);
  console.log('=============================================================================\n');

  console.log('DETAILED FAILURE & DEFICIENCY AUDIT:');
  const failures = results.filter(r => !r.passed);
  if (failures.length === 0) {
    console.log('✓ All 105 tests passed with zero errors!');
  } else {
    failures.forEach(f => {
      console.log(`[#${f.id}] [${f.category}] ${f.name}`);
      console.log(`  Input    : ${typeof f.input === 'string' ? f.input : JSON.stringify(f.input)}`);
      console.log(`  Expected : ${f.expected}`);
      console.log(`  Actual   : ${f.actual}`);
      console.log(`  Problem  : ${f.problem}`);
      console.log('-----------------------------------------------------------------------------');
    });
  }

  return {
    total,
    passedCount,
    failedCount,
    searchScore: (searchPassed / searchTests.length) * 100,
    validatorScore: (validatorPassed / validatorTests.length) * 100,
    results,
    failures
  };
}

runComprehensive100Suite();
