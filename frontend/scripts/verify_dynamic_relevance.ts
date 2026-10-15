import { generateAutonomousLegalResponse } from '../src/services/clientLegalEngine';

async function runVerification() {
  console.log('=============================================================================');
  console.log('  TESTING DYNAMIC PROVISION & PRECEDENT DIVERSITY (CITIZEN & ADVOCATE MODES) ');
  console.log('=============================================================================\n');

  const testCases = [
    {
      name: 'Tenancy / Illegal Eviction',
      query: 'My landlord locked my flat and threw out my belongings without court order',
      forbiddenProvisions: ['Section 318(4)'],
      forbiddenPrecedents: ['Arnesh Kumar v. State of Bihar'],
      expectedProvisionsAny: ['Order 39', 'Specific Relief', 'Section 10'],
      expectedPrecedentsAny: ['Vidya Drolia', 'Dalpat Kumar']
    },
    {
      name: 'Medical Negligence / Hospital Liability',
      query: 'Doctor performed wrong surgery and left scissor inside abdomen causing severe infection',
      forbiddenProvisions: ['Section 318(4)'],
      forbiddenPrecedents: ['Arnesh Kumar v. State of Bihar'],
      expectedProvisionsAny: ['Section 35', 'Consumer Protection', 'Article 21'],
      expectedPrecedentsAny: ['Indian Medical Association v. V.P. Shantha', 'Maneka Gandhi']
    },
    {
      name: 'Cheque Bounce / Debt',
      query: 'Cheque of ₹5,00,000 bounced due to insufficient funds, drawer refusing to pay',
      forbiddenProvisions: ['Section 318(4)', 'Section 103'],
      forbiddenPrecedents: ['Arnesh Kumar v. State of Bihar'],
      expectedProvisionsAny: ['Section 138', 'Section 141', 'Negotiable Instruments'],
      expectedPrecedentsAny: ['Rangappa v. Sri Mohan']
    },
    {
      name: 'Online UPI Fraud / Phishing',
      query: 'Lost ₹75,000 in UPI phishing fraud after caller claimed to be bank official',
      forbiddenProvisions: ['Section 103', 'Section 85'],
      forbiddenPrecedents: ['Arnesh Kumar v. State of Bihar'],
      expectedProvisionsAny: ['Section 66D', 'Section 63', 'Section 33'],
      expectedPrecedentsAny: ['Anvar P.V.', 'Shreya Singhal']
    },
    {
      name: 'Constitutional / Article 26',
      query: 'Article 26',
      forbiddenProvisions: ['Section 318(4)', 'Section 138'],
      forbiddenPrecedents: ['Arnesh Kumar v. State of Bihar', 'Bhajan Lal'],
      expectedProvisionsAny: ['Article 26', 'Article 25'],
      expectedPrecedentsAny: ['Shirur Mutt']
    },
    {
      name: 'Constitutional / Article 320',
      query: 'Article 320',
      forbiddenProvisions: ['Section 318(4)', 'Section 138'],
      forbiddenPrecedents: ['Arnesh Kumar v. State of Bihar', 'Bhajan Lal'],
      expectedProvisionsAny: ['Article 320', 'Article 311'],
      expectedPrecedentsAny: ['Manbodhan Lal Srivastava']
    },
    {
      name: 'Matrimonial / Abandonment & Maintenance',
      query: 'Husband abandoned wife and minor child without any maintenance or financial support',
      forbiddenProvisions: ['Section 318(4)', 'Section 103'],
      forbiddenPrecedents: ['Bhajan Lal', 'Kailash Nath'],
      expectedProvisionsAny: ['Section 144', 'Section 24', 'Section 12', 'Hindu Marriage'],
      expectedPrecedentsAny: ['Rajnesh v. Neha']
    },
    {
      name: 'Employment / Unpaid Salary & Wrongful Firing',
      query: 'Company fired me without notice period and withheld my 3 months salary and gratuity',
      forbiddenProvisions: ['Section 318(4)', 'Section 103'],
      forbiddenPrecedents: ['Arnesh Kumar v. State of Bihar'],
      expectedProvisionsAny: ['Section 73', 'Section 74', 'Order 37', 'Contract', 'Payment of Gratuity', 'Section 4'],
      expectedPrecedentsAny: ['Kailash Nath Associates', 'Bangalore Water Supply']
    },
    {
      name: 'Property / Land Encroachment',
      query: 'Neighbor constructed boundary wall encroaching 6 feet into my registered agricultural land',
      forbiddenProvisions: ['Section 318(4)', 'Section 138'],
      forbiddenPrecedents: ['Arnesh Kumar v. State of Bihar'],
      expectedProvisionsAny: ['Order 39', 'Specific Relief', 'Section 41'],
      expectedPrecedentsAny: ['Dalpat Kumar v. Prahlad Singh']
    },
    {
      name: 'Anticipatory Bail Apprehension',
      query: 'Client apprehending imminent arrest in commercial payment dispute, seek anticipatory bail',
      forbiddenProvisions: ['Section 103'],
      forbiddenPrecedents: ['Shirur Mutt'],
      expectedProvisionsAny: ['Section 482', 'Section 35(3)'],
      expectedPrecedentsAny: ['Sushila Aggarwal', 'Satender Kumar Antil']
    },
    {
      name: 'Traffic Light Rules & Automated E-Challan',
      query: 'traffic light rules',
      forbiddenProvisions: ['Section 318(4)', 'Section 103', 'Section 12', 'Section 8'],
      forbiddenPrecedents: ['Arnesh Kumar v. State of Bihar', 'State of Haryana v. Bhajan Lal', 'Hridaya Ranjan'],
      expectedProvisionsAny: ['Section 119', 'Section 184', 'Motor Vehicles Act'],
      expectedPrecedentsAny: ['Dr. S. Rajaseekaran v. Union of India']
    },
    {
      name: 'Real Estate / RERA Builder Delay',
      query: 'Builder delayed flat possession by 3 years, seeking full refund with interest under RERA',
      forbiddenProvisions: ['Section 318(4)', 'Section 103'],
      forbiddenPrecedents: ['Arnesh Kumar v. State of Bihar', 'Bhajan Lal'],
      expectedProvisionsAny: ['Section 18', 'Real Estate (Regulation and Development) Act'],
      expectedPrecedentsAny: ['Imperia Structures Ltd. v. Anil Patni']
    },
    {
      name: 'RTI / Answer Sheet Inspection',
      query: 'How to file RTI application to inspect evaluated board exam answer book copies',
      forbiddenProvisions: ['Section 318(4)', 'Section 103'],
      forbiddenPrecedents: ['Arnesh Kumar v. State of Bihar', 'Bhajan Lal'],
      expectedProvisionsAny: ['Section 6', 'Section 7', 'Right to Information Act'],
      expectedPrecedentsAny: ['Aditya Bandopadhyay']
    },
    {
      name: 'Labor & Gratuity Non-Payment',
      query: 'Completed 6 years continuous service, company refusing to release gratuity amount',
      forbiddenProvisions: ['Section 318(4)', 'Section 103'],
      forbiddenPrecedents: ['Arnesh Kumar v. State of Bihar'],
      expectedProvisionsAny: ['Section 4', 'Payment of Gratuity Act'],
      expectedPrecedentsAny: ['Bangalore Water Supply']
    },
    {
      name: 'Environmental Pollution / NGT Restitution',
      query: 'Industrial factory discharging chemical effluents into village river causing groundwater pollution',
      forbiddenProvisions: ['Section 318(4)'],
      forbiddenPrecedents: ['Arnesh Kumar v. State of Bihar'],
      expectedProvisionsAny: ['Section 14', 'National Green Tribunal Act'],
      expectedPrecedentsAny: ['Vellore Citizens Welfare Forum']
    },
    {
      name: 'Hindu Succession / Daughter Ancestral Coparcenary',
      query: 'Can married daughter claim equal share in ancestral agricultural property under Hindu Succession Act',
      forbiddenProvisions: ['Section 318(4)', 'Section 103'],
      forbiddenPrecedents: ['Arnesh Kumar v. State of Bihar', 'Bhajan Lal'],
      expectedProvisionsAny: ['Section 6', 'Hindu Succession Act'],
      expectedPrecedentsAny: ['Vineeta Sharma v. Rakesh Sharma']
    },
    {
      name: 'Direct Tax / Section 148 Reassessment Notice',
      query: 'Received income tax Section 148 notice for assessment year 2018 without Section 148A show cause inquiry',
      forbiddenProvisions: ['Section 318(4)'],
      forbiddenPrecedents: ['Arnesh Kumar v. State of Bihar', 'Bhajan Lal'],
      expectedProvisionsAny: ['Section 148', 'Income Tax Act'],
      expectedPrecedentsAny: ['Union of India v. Ashish Agarwal']
    }
  ];

  let allPassed = true;

  for (const tc of testCases) {
    console.log(`-----------------------------------------------------------------------------`);
    console.log(`[TEST]: ${tc.name}`);
    console.log(`Query: "${tc.query}"`);

    for (const mode of ['citizen', 'professional'] as const) {
      const res = await generateAutonomousLegalResponse({
        query: tc.query,
        mode: mode
      });

      const provTitles = (res.applicable_laws || []).map(p => `${p.source_title} (${p.section_number})`).join(' | ');
      const caseTitles = (res.similar_cases || []).map(c => c.title).join(' | ');

      console.log(`  [Mode: ${mode.toUpperCase()}]`);
      console.log(`  - Domain: ${res.auto_detected_domain}`);
      console.log(`  - Provisions: ${provTitles}`);
      console.log(`  - Precedents: ${caseTitles}`);

      // Check forbidden provisions
      for (const fp of tc.forbiddenProvisions) {
        if (provTitles.includes(fp)) {
          console.error(`  FAILED: Contained forbidden fallback provision "${fp}"`);
          allPassed = false;
        }
      }

      // Check forbidden precedents
      for (const fc of tc.forbiddenPrecedents) {
        if (caseTitles.includes(fc)) {
          console.error(`  FAILED: Contained forbidden fallback precedent "${fc}"`);
          allPassed = false;
        }
      }

      // Check expected provisions
      const hasExpProv = tc.expectedProvisionsAny.some(ep => provTitles.includes(ep));
      if (!hasExpProv) {
        console.error(`  FAILED: Missing expected provisions from [${tc.expectedProvisionsAny.join(', ')}]`);
        allPassed = false;
      }

      // Check expected precedents
      const hasExpPrec = tc.expectedPrecedentsAny.some(ep => caseTitles.includes(ep));
      if (!hasExpPrec) {
        console.error(`  FAILED: Missing expected precedents from [${tc.expectedPrecedentsAny.join(', ')}]`);
        allPassed = false;
      }

      // Verify mode formatting
      if (mode === 'citizen') {
        const hasHelpline = res.answer?.includes('112') || res.answer?.includes('15100') || res.answer?.includes('1930') || res.answer?.includes('1915') || res.answer?.includes('181');
        if (!hasHelpline) {
          console.error(`  FAILED: Citizen mode missing official helpline contact`);
          allPassed = false;
        }
      } else {
        const hasLitigationStrategy = res.answer?.includes('Litigation Strategy') || res.answer?.includes('Pleading Strategy') || res.answer?.includes('Jurisdictional Matrix');
        if (!hasLitigationStrategy) {
          console.error(`  FAILED: Professional mode missing chamber litigation strategy`);
          allPassed = false;
        }
      }
    }
  }

  console.log('\n=============================================================================');
  if (allPassed) {
    console.log('  SUCCESS: ALL DIVERSITY & ACCURACY TESTS PASSED PERFECTLY ACROSS BOTH MODES! ');
  } else {
    console.error('  FAILED: Some diversity checks failed.');
    process.exit(1);
  }
  console.log('=============================================================================');
}

runVerification().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
