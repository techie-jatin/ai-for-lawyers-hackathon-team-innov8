import { detectOffTopicQuery, generateAutonomousLegalResponse } from '../src/services/clientLegalEngine';

interface TestCase {
  name: string;
  query: string;
  expectedBlocked: boolean;
  expectedCategory?: string;
  notes: string;
}

const TEST_CASES: TestCase[] = [
  // OFF-TOPIC: Software Development & Coding
  {
    name: 'Pure Python Code Request',
    query: 'write a python function to sort an array using quicksort',
    expectedBlocked: true,
    expectedCategory: 'CODING_AND_DEV',
    notes: 'Developer seeking free general code generation'
  },
  {
    name: 'React Component Generation',
    query: 'create a responsive navbar component in react with tailwind css',
    expectedBlocked: true,
    expectedCategory: 'CODING_AND_DEV',
    notes: 'Web developer seeking frontend template'
  },
  {
    name: 'SQL Database Script',
    query: 'write a sql query to find the second highest salary from employees table',
    expectedBlocked: true,
    expectedCategory: 'CODING_AND_DEV',
    notes: 'Database developer asking for SQL script'
  },
  {
    name: 'Debugging Script Request',
    query: 'fix the bug in this javascript function: function add(a, b) { return a - b; }',
    expectedBlocked: true,
    expectedCategory: 'CODING_AND_DEV',
    notes: 'Developer asking to debug snippet'
  },

  // OFF-TOPIC: Academic Homework & Mathematics
  {
    name: 'Math Integral Homework',
    query: 'solve this integral of 3x^2 + 2x + 1 dx',
    expectedBlocked: true,
    expectedCategory: 'ACADEMIC_HOMEWORK',
    notes: 'Student asking to solve calculus homework'
  },
  {
    name: 'Biology Homework',
    query: 'explain how photosynthesis works in green plants and write an essay on it',
    expectedBlocked: true,
    expectedCategory: 'ACADEMIC_HOMEWORK',
    notes: 'Student asking for high-school biology essay'
  },

  // OFF-TOPIC: Culinary & Lifestyle
  {
    name: 'Cooking Recipe Request',
    query: 'give me a step by step recipe for butter chicken with naan',
    expectedBlocked: true,
    expectedCategory: 'CULINARY_AND_LIFESTYLE',
    notes: 'User treating bot as recipe generator'
  },
  {
    name: 'Vacation Itinerary Request',
    query: 'plan a 4-day travel itinerary for a family trip to goa',
    expectedBlocked: true,
    expectedCategory: 'CULINARY_AND_LIFESTYLE',
    notes: 'User treating bot as travel agent'
  },

  // OFF-TOPIC: Creative Fiction & General Trivia
  {
    name: 'Romantic Poetry Request',
    query: 'write a romantic poem about rain and moonlight',
    expectedBlocked: true,
    expectedCategory: 'CREATIVE_AND_FICTION',
    notes: 'User asking for creative writing'
  },
  {
    name: 'Sports Trivia Request',
    query: 'who won the fifa world cup in 2022 and how many goals were scored',
    expectedBlocked: true,
    expectedCategory: 'CREATIVE_AND_FICTION',
    notes: 'User asking general sports trivia'
  },

  // OFF-TOPIC: Casual Chit-Chat
  {
    name: 'Casual Greeting',
    query: 'hello',
    expectedBlocked: true,
    expectedCategory: 'CASUAL_CHITCHAT',
    notes: 'One-word greeting - should receive zero-token chamber introduction'
  },

  // SAFE-HARBOR TECH-LEGAL (MUST NEVER BE BLOCKED!)
  {
    name: 'Tech-Legal: Software Developer Moonlighting & Termination',
    query: 'My employer terminated me and withheld my salary because I wrote open-source python code on weekends. Is this legal?',
    expectedBlocked: false,
    notes: 'Employment contract, wage withholding, termination dispute - LEGAL!'
  },
  {
    name: 'Tech-Legal: Software Copyright Ownership',
    query: 'Who owns the copyright of software code written by an independent contractor under the Indian Copyright Act?',
    expectedBlocked: false,
    notes: 'Statutory copyright inquiry under Copyright Act 1957 - LEGAL!'
  },
  {
    name: 'Tech-Legal: Cyber Liability for Security Vulnerability',
    query: 'Our software API leaked customer data. What is our legal liability and penalty under Section 43A of the IT Act and DPDP Act?',
    expectedBlocked: false,
    notes: 'Cyber law, DPDP penalty, IT Act inquiry - LEGAL!'
  },
  {
    name: 'Tech-Legal: Unpaid Freelance Invoice Recovery',
    query: 'Client refuses to pay ₹1,50,000 for website development work. How to issue a legal notice for breach of contract?',
    expectedBlocked: false,
    notes: 'Contractual breach, legal notice, commercial debt recovery - LEGAL!'
  },
  {
    name: 'Tech-Legal: Legality of Web Scraping',
    query: 'Is web scraping e-commerce prices a cyber crime under Section 66 of the Information Technology Act?',
    expectedBlocked: false,
    notes: 'Criminal cyber defense & IT Act inquiry - LEGAL!'
  },
  {
    name: 'Civil/Consumer: Medical Negligence',
    query: 'A surgeon doctor was negligent during gall bladder surgery and caused severe internal bleeding. What compensation can we claim?',
    expectedBlocked: false,
    notes: 'Medical negligence under Consumer Protection Act - LEGAL!'
  },
  {
    name: 'Core Legal: Section 35(3) BNSS Police Arrest Notice',
    query: 'Police called me to station saying someone complained I cheated them of money in business. Can they arrest me directly?',
    expectedBlocked: false,
    notes: 'Criminal defense & arrest notice safeguard - LEGAL!'
  }
];

async function runTestSuite() {
  console.log('======================================================================');
  console.log('   BHARAT LEGAL INTELLIGENCE - BOUNDARY & OFF-TOPIC FIREWALL SUITE   ');
  console.log('======================================================================\n');

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < TEST_CASES.length; i++) {
    const tc = TEST_CASES[i];
    const assessment = detectOffTopicQuery(tc.query);
    const isBlocked = assessment !== null && assessment.isOffTopic;

    let testPassed = isBlocked === tc.expectedBlocked;
    if (testPassed && tc.expectedBlocked && tc.expectedCategory) {
      testPassed = assessment?.category === tc.expectedCategory;
    }

    if (testPassed) {
      passed++;
      console.log(`[PASS] Case #${i + 1}: ${tc.name}`);
      console.log(`       Query: "${tc.query}"`);
      console.log(`       Outcome: ${isBlocked ? `[BLOCKED as ${assessment?.categoryLabel}]` : '[ALLOWED as Legitimate Legal Inquiry]'}`);
    } else {
      failed++;
      console.error(`[FAIL] Case #${i + 1}: ${tc.name}`);
      console.error(`       Query: "${tc.query}"`);
      console.error(`       Expected Blocked: ${tc.expectedBlocked}, Actual: ${isBlocked}`);
      if (assessment) {
        console.error(`       Assessment: ${assessment.categoryLabel} (${assessment.category})`);
      }
    }
    console.log('');
  }

  // End-to-end response check
  console.log('--- Testing End-to-End generateAutonomousLegalResponse on Coding Query ---');
  const codingRes = await generateAutonomousLegalResponse({
    query: 'write a python code to sort an array using quicksort',
    mode: 'citizen'
  });

  const hasScopeNotice = codingRes.answer.includes('Chamber Scope & Jurisdiction Notice') && codingRes.answer.includes('Copyright Act 1957');
  if (hasScopeNotice) {
    passed++;
    console.log('[PASS] End-to-End Autonomous Response delivered structured Scope Notice with legal pivots.');
  } else {
    failed++;
    console.error('[FAIL] End-to-End Autonomous Response did not include expected Scope Notice format.');
  }

  console.log('\n======================================================================');
  console.log(`   FIREWALL RESULTS: ${passed} PASSED, ${failed} FAILED (Total: ${passed + failed})`);
  console.log('======================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('\n[+] 100% OF BOUNDARY FIREWALL TESTS PASSED SUCCESSFULLY!\n');
  }
}

runTestSuite();
