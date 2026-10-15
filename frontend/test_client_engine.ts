import { generateAutonomousLegalResponse } from './src/services/clientLegalEngine';

async function runTest() {
  console.log('=== TESTING CLIENT LEGAL ENGINE MULTI-TURN FIDELITY ===\n');

  // Turn 1
  const t1Query = "someone asking me about Article 28. tell me";
  console.log(`[Turn 1] Query: "${t1Query}"`);
  const res1 = await generateAutonomousLegalResponse({
    query: t1Query,
    mode: 'citizen'
  });

  const t1Laws = res1.applicable_laws.map(l => `${l.source_title} - ${l.section_number}`);
  const t1Precedents = (res1.similar_cases || []).map(c => c.title);
  const t1HasRTI = t1Laws.some(l => l.includes('Right to Information') || l.includes('Section 8'));
  const t1HasLSA = t1Laws.some(l => l.includes('Legal Services'));
  const t1HasConcordance = (res1.answer || '').includes('Colonial Concordance') || (res1.answer || '').includes('BNS § 64') || (res1.answer || '').includes('375');
  const t1HasArt28 = t1Laws.some(l => l.includes('Article 28'));

  console.log('Turn 1 Laws:', t1Laws);
  console.log('Turn 1 Precedents:', t1Precedents);
  console.log('Turn 1 Has Article 28:', t1HasArt28);
  console.log('Turn 1 Has RTI (Bug Check):', t1HasRTI);
  console.log('Turn 1 Has Legal Services Act (Bug Check):', t1HasLSA);
  console.log('Turn 1 Has Concordance/BNS 64 (Bug Check):', t1HasConcordance);

  if (!t1HasArt28 || t1HasRTI || t1HasLSA || t1HasConcordance) {
    console.error('FAIL: Turn 1 failed validation!');
    process.exit(1);
  }

  // Turn 2
  const t2Query = "again tell me about this article";
  console.log(`\n[Turn 2] Query: "${t2Query}" (History: 1 previous turn)`);
  const history = [
    { role: 'user', text: t1Query },
    { role: 'assistant', text: res1.answer }
  ];

  const res2 = await generateAutonomousLegalResponse({
    query: t2Query,
    mode: 'citizen',
    history
  });

  const t2Laws = res2.applicable_laws.map(l => `${l.source_title} - ${l.section_number}`);
  const t2Precedents = (res2.similar_cases || []).map(c => c.title);
  const t2HasRTI = t2Laws.some(l => l.includes('Right to Information') || l.includes('Section 8'));
  const t2HasLSA = t2Laws.some(l => l.includes('Legal Services'));
  const t2HasConcordance = (res2.answer || '').includes('Colonial Concordance') || (res2.answer || '').includes('BNS § 64') || (res2.answer || '').includes('375');
  const t2HasArt28 = t2Laws.some(l => l.includes('Article 28'));

  console.log('Turn 2 Laws:', t2Laws);
  console.log('Turn 2 Precedents:', t2Precedents);
  console.log('Turn 2 Has Article 28:', t2HasArt28);
  console.log('Turn 2 Has RTI (Bug Check):', t2HasRTI);
  console.log('Turn 2 Has Legal Services Act (Bug Check):', t2HasLSA);
  console.log('Turn 2 Has Concordance/BNS 64 (Bug Check):', t2HasConcordance);

  if (!t2HasArt28 || t2HasRTI || t2HasLSA || t2HasConcordance) {
    console.error('FAIL: Turn 2 failed validation!');
    process.exit(1);
  }

  console.log('\n=== ALL TURN 1 & TURN 2 CLIENT TESTS PASSED WITH 100% SUCCESS! ===');
}

runTest().catch(err => {
  console.error('Unexpected error during test execution:', err);
  process.exit(1);
});
