/**
 * clientConstitutionEngine.ts - Client Parity Engine for Complete Constitution of India
 * Bharat Legal Intelligence 2.0 (Reverse Engineer Anything - REA Methodology)
 *
 * 100% offline standalone in-browser search, Article retrieval, and Constitutional
 * controversy decompiler across all 25 Parts, 456+ Articles, and 12 Schedules.
 */

import constitutionData from '../data/constitutionComplete.json';

export interface ConstitutionalPrecedent {
  case_title: string;
  neutral_citation: string;
  bench_strength: number;
  ratio_decidendi: string;
  doctrine_established: string;
}

export interface ConstitutionalConcordanceLink {
  target_statute: string;
  target_section: string;
  relationship_type: string;
  notes: string;
}

export interface ConstitutionalArticleAST {
  article_id: string;
  article_number: string;
  part_number: string;
  part_title: string;
  chapter_title?: string;
  heading: string;
  verbatim_text: string;
  plain_explanation: string;
  classification: string;
  rights_bearer: string;
  duty_bearer: string;
  justiciable: boolean;
  reasonable_restrictions: string[];
  applicable_doctrines: string[];
  landmark_precedents: ConstitutionalPrecedent[];
  concordance_links: ConstitutionalConcordanceLink[];
  advocate_pleading_notes: string;
  citizen_actionable_rights: string[];
}

export interface ConstitutionalSchedule {
  schedule_number: string;
  title: string;
  articles_covered: string[];
  summary: string;
}

export interface ConstitutionalPartMeta {
  part_number: string;
  title: string;
  articles: string;
}

export interface ConstitutionalAnalysisResult {
  is_constitutional_matter: boolean;
  recommended_forum: string;
  recommended_writ: string;
  scrutiny_standard: string;
  invoked_articles: ConstitutionalArticleAST[];
  constitutional_doctrines: string[];
  key_precedents: ConstitutionalPrecedent[];
  advocate_pleading_summary: string;
}

const typedCorpus = constitutionData as {
  preamble: {
    title: string;
    verbatim_text: string;
    plain_explanation: string;
    classification: string;
    applicable_doctrines: string[];
    landmark_precedents: ConstitutionalPrecedent[];
  };
  parts_metadata: ConstitutionalPartMeta[];
  schedules: ConstitutionalSchedule[];
  total_articles: number;
  articles: ConstitutionalArticleAST[];
};

export function getClientPreamble() {
  return typedCorpus.preamble;
}

export function getClientSchedules(): ConstitutionalSchedule[] {
  return typedCorpus.schedules;
}

export function getClientParts(): ConstitutionalPartMeta[] {
  return typedCorpus.parts_metadata;
}

export function getClientArticle(queryId: string): ConstitutionalArticleAST | undefined {
  const q = queryId.trim().toLowerCase().replace(/^article\s+/i, '').replace(/^art-?/i, '');
  return typedCorpus.articles.find((a) => {
    const num = a.article_number.trim().toLowerCase().replace(/^article\s+/i, '');
    const id = a.article_id.trim().toLowerCase().replace(/^art-?/i, '');
    return num === q || id === q;
  });
}

export function searchClientConstitution(
  query: string,
  partFilter?: string,
  classificationFilter?: string,
  limit: number = 25
): ConstitutionalArticleAST[] {
  const qTerms = query.trim().toLowerCase().split(/\s+/).filter(t => t.length >= 2);
  
  let filtered = typedCorpus.articles;
  if (partFilter && partFilter !== 'ALL') {
    filtered = filtered.filter(a => a.part_number.toLowerCase().includes(partFilter.toLowerCase()));
  }
  if (classificationFilter && classificationFilter !== 'ALL') {
    filtered = filtered.filter(a => a.classification.toUpperCase() === classificationFilter.toUpperCase());
  }

  if (qTerms.length === 0) {
    return filtered.slice(0, limit);
  }

  const scored: Array<{ score: number; article: ConstitutionalArticleAST }> = [];

  for (const a of filtered) {
    let score = 0;
    const artNum = a.article_number.toLowerCase();
    const heading = a.heading.toLowerCase();
    const plain = a.plain_explanation.toLowerCase();
    const text = a.verbatim_text.toLowerCase();
    const doctrines = a.applicable_doctrines.join(' ').toLowerCase();

    for (const term of qTerms) {
      if (artNum.includes(term)) score += 50;
      if (heading.includes(term)) score += 30;
      if (doctrines.includes(term)) score += 20;
      if (plain.includes(term)) score += 10;
      if (text.includes(term)) score += 5;
    }

    if (score > 0) {
      scored.push({ score, article: a });
    }
  }

  scored.sort((x, y) => y.score - x.score);
  return scored.slice(0, limit).map(item => item.article);
}

export function analyzeClientConstitutionalControversy(facts: string): ConstitutionalAnalysisResult {
  const tLower = facts.toLowerCase();
  const invoked: ConstitutionalArticleAST[] = [];

  const addIf = (artId: string) => {
    const a = getClientArticle(artId);
    if (a && !invoked.find(x => x.article_id === a.article_id)) {
      invoked.push(a);
    }
  };

  // 1. Equality & Arbitrariness (Article 14)
  if (/arbitrary|discrimina|equal|unfairly treated|bias|favouritism|tender cancelled|blacklist/i.test(tLower)) {
    addIf('14');
  }

  // 2. Free Speech, Association, Business (Article 19)
  if (/speech|protest|censorship|shutdown|internet|licence cancelled|sealed shop|business closed|union|post deleted|fir for tweet/i.test(tLower)) {
    addIf('19');
  }

  // 3. Life, Liberty, Privacy, Dignity (Article 21)
  if (/arrest|custod|jail|bail|detain|police|torture|phone tap|privacy|medical|hospital refusal|life|clean water|pollution/i.test(tLower)) {
    addIf('21');
  }

  // 4. Arrest Safeguards (Article 22)
  if (/arrest|without warrant|not produced|24 hours|magistrate|grounds of arrest|custodial|handcuff/i.test(tLower)) {
    addIf('22');
  }

  // 5. Property Deprivation & Demolition (Article 300A)
  if (/demolition|bulldozer|land|acquired|possession|evict|seized|compensation|property/i.test(tLower)) {
    addIf('300A');
  }

  // 6. Civil Services Dismissal (Article 311)
  if (/civil servant|dismissed|government employee|inquiry|charge sheet|suspended|demoted/i.test(tLower)) {
    addIf('311');
  }

  // 7. High Court Writ Remedy (Article 226)
  addIf('226');

  // Fallback if none matched
  if (invoked.length <= 1) {
    addIf('14');
    addIf('21');
  }

  // Writ Nature
  let writType = 'WRIT OF MANDAMUS';
  if (/arrest|detain|missing|illegal custody|police station/i.test(tLower)) {
    writType = 'WRIT OF HABEAS CORPUS';
  } else if (/quash|order passed|cancelling|impugned notification|penalty order/i.test(tLower)) {
    writType = 'WRIT OF CERTIORARI';
  } else if (/usurped|not qualified|appointed illegally|eligibility/i.test(tLower)) {
    writType = 'WRIT OF QUO WARRANTO';
  } else if (/tribunal|without jurisdiction|stay proceedings|prohibit/i.test(tLower)) {
    writType = 'WRIT OF PROHIBITION';
  }

  // Standard of Scrutiny
  let scrutinyStandard = (
    'Four-Pronged Proportionality Standard (K.S. Puttaswamy): ' +
    '1. Legitimate State Aim; 2. Rational Nexus; 3. Necessity (Least Restrictive Measure); 4. Balancing.'
  );
  if (/arbitrary|tender|capricious/i.test(tLower)) {
    scrutinyStandard = (
      'Manifest Arbitrariness Doctrine (Shayara Bano): ' +
      'The State action is irrational, capricious, without adequate determining principle, and violative of Article 14.'
    );
  }

  const allDoctrines = Array.from(new Set(invoked.flatMap(a => a.applicable_doctrines || [])));
  const allPrecedents = invoked.flatMap(a => a.landmark_precedents || []).slice(0, 4);

  return {
    is_constitutional_matter: true,
    recommended_forum: "Hon'ble High Court under Article 226 / Hon'ble Supreme Court under Article 32",
    recommended_writ: writType,
    scrutiny_standard: scrutinyStandard,
    invoked_articles: invoked,
    constitutional_doctrines: allDoctrines,
    key_precedents: allPrecedents,
    advocate_pleading_summary: (
      `Invoke ${writType} before the High Court under Article 226. ` +
      `Plead violation of fundamental rights guaranteed under ${invoked.map(a => a.article_number).join(', ')}. ` +
      `Subject the impugned State action to the ${scrutinyStandard.split(':')[0]}.`
    )
  };
}
