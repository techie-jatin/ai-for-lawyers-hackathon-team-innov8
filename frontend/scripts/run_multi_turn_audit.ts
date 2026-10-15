import { generateAutonomousLegalResponse } from '../src/services/clientLegalEngine';

interface DialogueTurn {
  userQuery: string;
  expectedDomain: string;
  expectedKeywords: string[];
  forbiddenKeywords: string[];
}

interface DialogueScenario {
  id: string;
  title: string;
  mode: 'citizen' | 'professional';
  turns: DialogueTurn[];
}

const TEST_SCENARIOS: DialogueScenario[] = [
  // 1. Criminal Defense (Citizen Mode)
  {
    id: 'SCENARIO_1_CRIMINAL_CITIZEN',
    title: 'Police Harassment & False Cheating Allegation (Citizen)',
    mode: 'citizen',
    turns: [
      {
        userQuery: 'Police called me to station saying someone complained I cheated them of money in business. Can they arrest me directly?',
        expectedDomain: 'criminal_defense',
        expectedKeywords: ['Section 35(3)', 'BNSS', 'Notice', 'Arnesh Kumar', '112'],
        forbiddenKeywords: ['Colonial Concordance', 'BNS § 64', 'RTI Act', 'Right to Information']
      },
      {
        userQuery: 'What if I go to station and they refuse to give me written notice and threaten to put me in jail?',
        expectedDomain: 'criminal_defense',
        expectedKeywords: ['D.K. Basu', 'Magistrate', '24 hours', 'Anticipatory Bail', '482 BNSS'],
        forbiddenKeywords: ['BNS § 64', 'Rape', 'RTI Act']
      },
      {
        userQuery: 'Can I apply for bail before they arrest me for this?',
        expectedDomain: 'criminal_defense',
        expectedKeywords: ['Anticipatory Bail', '482', 'Sushila Aggarwal'],
        forbiddenKeywords: ['BNS § 64', 'Rape']
      }
    ]
  },

  // 2. Criminal Defense (Advocate Mode)
  {
    id: 'SCENARIO_2_CRIMINAL_ADVOCATE',
    title: 'Cheating Defense & Quashing Petition (Advocate)',
    mode: 'professional',
    turns: [
      {
        userQuery: 'Client accused under Section 318(4) BNS for commercial transaction failure. How to establish lack of fraudulent intent ab initio?',
        expectedDomain: 'criminal_defense',
        expectedKeywords: ['Section 318', 'Hridaya Ranjan', 'Mens Rea', 'Actus Reus', 'Section 63 BSA'],
        forbiddenKeywords: ['BNS § 64', 'RTI Act']
      },
      {
        userQuery: 'How to move High Court for quashing this FIR under Section 528 BNSS on Bhajan Lal grounds?',
        expectedDomain: 'criminal_defense',
        expectedKeywords: ['Section 528', 'Bhajan Lal', 'inherent powers', 'civil dispute'],
        forbiddenKeywords: ['BNS § 64', 'RTI Act']
      }
    ]
  },

  // 3. Cheque Bounce / NI Act (Advocate Mode)
  {
    id: 'SCENARIO_3_NI_ACT_ADVOCATE',
    title: 'Section 138 NI Act Defense Strategy (Advocate)',
    mode: 'professional',
    turns: [
      {
        userQuery: 'Drafting defense for accused in Section 138 NI Act complaint. How to rebut statutory presumption under Section 139?',
        expectedDomain: 'ni_act',
        expectedKeywords: ['Section 138', 'Section 139', 'Rangappa', 'preponderance of probabilities'],
        forbiddenKeywords: ['Colonial Concordance', 'BNS § 64', 'Rape', 'Section 35(3) BNSS', 'Arrest']
      },
      {
        userQuery: 'Complainant did not serve statutory notice within 30 days of return memo. Can we seek dismissal at threshold?',
        expectedDomain: 'ni_act',
        expectedKeywords: ['Section 138', '142', 'statutory notice', 'limitation'],
        forbiddenKeywords: ['Colonial Concordance', 'BNS § 64', 'Rape', 'Arnesh Kumar']
      }
    ]
  },

  // 4. Tenancy & Civil Injunction (Citizen Mode)
  {
    id: 'SCENARIO_4_TENANCY_CITIZEN',
    title: 'Unlawful Eviction by Landlord (Citizen)',
    mode: 'citizen',
    turns: [
      {
        userQuery: 'My landlord locked my flat with all my belongings inside and is threatening to throw me out without any court order.',
        expectedDomain: 'civil_injunction',
        expectedKeywords: ['Order 39', 'Dalpat Kumar', 'Injunction', 'Caveat', '15100'],
        forbiddenKeywords: ['Colonial Concordance', 'BNS § 64', 'Rape', 'RTI Act']
      },
      {
        userQuery: 'How can I get an urgent court order to break the lock and stop him?',
        expectedDomain: 'civil_injunction',
        expectedKeywords: ['Order 39', 'Injunction', 'Prima Facie', 'Status Quo'],
        forbiddenKeywords: ['Colonial Concordance', 'BNS § 64', 'RTI Act']
      }
    ]
  },

  // 5. Matrimonial Maintenance (Citizen Mode)
  {
    id: 'SCENARIO_5_MATRIMONIAL_CITIZEN',
    title: 'Maintenance Claim & Domestic Violence (Citizen)',
    mode: 'citizen',
    turns: [
      {
        userQuery: 'My husband threw me out of the matrimonial home and stopped giving any money for our child. What maintenance can I claim?',
        expectedDomain: 'family_matrimonial',
        expectedKeywords: ['Section 144 BNSS', 'Rajnesh v. Neha', 'assets affidavit', 'Maintenance'],
        forbiddenKeywords: ['Colonial Concordance', 'BNS § 64', 'Rape', 'RTI Act', 'BNS 318']
      },
      {
        userQuery: 'What if he hides his actual business income and claims he is unemployed?',
        expectedDomain: 'family_matrimonial',
        expectedKeywords: ['Rajnesh v. Neha', 'affidavit of assets', 'income disclosure'],
        forbiddenKeywords: ['Colonial Concordance', 'BNS § 64', 'RTI Act']
      }
    ]
  },

  // 6. Cyber Fraud & UPI Scam (Citizen Mode)
  {
    id: 'SCENARIO_6_CYBER_CITIZEN',
    title: 'UPI Scam & Online Banking Fraud (Citizen)',
    mode: 'citizen',
    turns: [
      {
        userQuery: 'I got scammed of 85,000 rupees on Google Pay through a fake QR code. Can I get my money back?',
        expectedDomain: 'cyber_privacy',
        expectedKeywords: ['1930', 'cybercrime.gov.in', 'RBI', 'Section 66D'],
        forbiddenKeywords: ['Colonial Concordance', 'BNS § 64', 'Rape', 'RTI Act']
      },
      {
        userQuery: 'Bank says they are not responsible because I scanned the code. Is that legally true?',
        expectedDomain: 'cyber_privacy',
        expectedKeywords: ['RBI', 'Zero Liability', '1930'],
        forbiddenKeywords: ['Colonial Concordance', 'BNS § 64', 'RTI Act']
      }
    ]
  },

  // 7. Constitutional Freedom (Citizen Mode)
  {
    id: 'SCENARIO_7_CONSTITUTION_CITIZEN',
    title: 'Compulsory Religious Prayer in Aided College (Citizen)',
    mode: 'citizen',
    turns: [
      {
        userQuery: 'A government aided college is forcing my daughter to attend compulsory religious prayer. Is this allowed under Article 28?',
        expectedDomain: 'constitutional_writ',
        expectedKeywords: ['Article 28', 'D.A.V. College', 'Clause (3)', 'consent', 'opt-out'],
        forbiddenKeywords: ['Colonial Concordance', 'BNS § 64', 'RTI Act', 'Section 8']
      },
      {
        userQuery: 'Again tell me what legal action can I take if the principal threatens to suspend her for opting out?',
        expectedDomain: 'constitutional_writ',
        expectedKeywords: ['Article 28', 'Article 226', 'High Court', 'Writ'],
        forbiddenKeywords: ['Colonial Concordance', 'BNS § 64', 'RTI Act', 'Section 8']
      }
    ]
  },

  // 8. Commercial Contract Breach (Advocate Mode)
  {
    id: 'SCENARIO_8_CONTRACT_ADVOCATE',
    title: 'Liquidated Damages & Forfeiture under Section 74 (Advocate)',
    mode: 'professional',
    turns: [
      {
        userQuery: 'Client issued notice forfeiting entire security deposit under contract penalty clause. How to defend against arbitrary forfeiture under Section 74?',
        expectedDomain: 'commercial_contract',
        expectedKeywords: ['Section 74', 'Kailash Nath', 'earnest money', 'actual loss'],
        forbiddenKeywords: ['Colonial Concordance', 'BNS § 64', 'RTI Act', 'Police', 'Arrest']
      },
      {
        userQuery: 'Can the opposing party file a criminal cheating FIR for this breach of contract?',
        expectedDomain: 'commercial_contract',
        expectedKeywords: ['Hridaya Ranjan', 'civil breach', 'mens rea ab initio'],
        forbiddenKeywords: ['BNS § 64', 'Rape', 'RTI Act']
      }
    ]
  }
];

async function runMultiTurnAudit() {
  console.log('======================================================================');
  console.log('   BHARAT LEGAL INTELLIGENCE - MULTI-TURN & MULTI-DOMAIN AUDIT SUITE   ');
  console.log('======================================================================\n');

  let totalTurns = 0;
  let passedTurns = 0;
  const faults: Array<{ scenario: string; turn: number; query: string; issues: string[] }> = [];

  for (const scenario of TEST_SCENARIOS) {
    console.log(`\n>>> TESTING: [${scenario.id}] ${scenario.title} (Mode: ${scenario.mode})`);
    const history: Array<{ role: string; text: string }> = [];

    for (let tIdx = 0; tIdx < scenario.turns.length; tIdx++) {
      totalTurns++;
      const turn = scenario.turns[tIdx];
      console.log(`\n  [Turn ${tIdx + 1}] Query: "${turn.userQuery}"`);

      const resp = await generateAutonomousLegalResponse({
        query: turn.userQuery,
        mode: scenario.mode,
        history
      });

      const answer = resp.answer || '';
      const laws = (resp.applicable_laws || []).map(l => `${l.source_title} - ${l.section_number}`);
      const precedents = (resp.similar_cases || []).map(c => c.title);
      const detected = resp.auto_detected_domain || '';

      const turnIssues: string[] = [];

      // Check Expected Keywords
      for (const kw of turn.expectedKeywords) {
        const foundInAnswer = answer.toLowerCase().includes(kw.toLowerCase());
        const foundInLaws = laws.some(l => l.toLowerCase().includes(kw.toLowerCase()));
        const foundInPrecedents = precedents.some(p => p.toLowerCase().includes(kw.toLowerCase()));
        if (!foundInAnswer && !foundInLaws && !foundInPrecedents) {
          turnIssues.push(`Missing expected keyword/citation: "${kw}"`);
        }
      }

      // Check Forbidden Keywords (Hallucinations)
      for (const fKw of turn.forbiddenKeywords) {
        if (answer.toLowerCase().includes(fKw.toLowerCase())) {
          turnIssues.push(`Found forbidden hallucinated phrase: "${fKw}" in answer`);
        }
        if (laws.some(l => l.toLowerCase().includes(fKw.toLowerCase()))) {
          turnIssues.push(`Found forbidden law pill: "${fKw}" in applicable laws`);
        }
      }

      // Check for illegal horizontal lines (Directive 4)
      if (/^---+$/m.test(answer) || /^\*\*\*+$/m.test(answer)) {
        turnIssues.push('Found illegal horizontal rule (--- or ***) in markdown response');
      }

      // Check for empty or trivial response
      if (answer.length < 300) {
        turnIssues.push(`Response too brief (${answer.length} chars)`);
      }

      if (turnIssues.length === 0) {
        passedTurns++;
        console.log(`    PASS Turn ${tIdx + 1}: Passed all checks. (Domain: ${detected}, Laws: ${laws.length}, Precedents: ${precedents.length})`);
      } else {
        console.log(`    FAIL Turn ${tIdx + 1}: ${turnIssues.length} issue(s) detected:`);
        turnIssues.forEach(iss => console.log(`      - ${iss}`));
        faults.push({
          scenario: scenario.id,
          turn: tIdx + 1,
          query: turn.userQuery,
          issues: turnIssues
        });
      }

      // Append to history for multi-turn progression
      history.push({ role: 'user', text: turn.userQuery });
      history.push({ role: 'assistant', text: answer });
    }
  }

  console.log('\n======================================================================');
  console.log(`   AUDIT RESULTS: ${passedTurns} / ${totalTurns} TURNS PASSED (${Math.round((passedTurns / totalTurns) * 100)}%)`);
  console.log('======================================================================\n');

  if (faults.length > 0) {
    console.log(`[!] CRITICAL MECHANISM FAULTS DETECTED (${faults.length}):`);
    faults.forEach((f, idx) => {
      console.log(`\nFault #${idx + 1} in [${f.scenario}] Turn ${f.turn}:`);
      console.log(`Query: "${f.query}"`);
      f.issues.forEach(i => console.log(`  - ${i}`));
    });
  } else {
    console.log('[+] ALL SCENARIOS PASSED WITH 100% SUCCESS!');
  }
}

runMultiTurnAudit().catch(err => {
  console.error('Audit execution failed:', err);
  process.exit(1);
});
