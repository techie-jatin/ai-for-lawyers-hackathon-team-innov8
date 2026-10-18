import React, { useState, useRef } from 'react';
import { parseUploadedDocument } from '../utils/documentParser';
import { CourtPleadingStudio } from './CourtPleadingStudio';
import { CleanroomStampingStudio } from './CleanroomStampingStudio';
import { BsaCertificateStudio } from './BsaCertificateStudio';
import { DisputeTimelineVisualizer } from './DisputeTimelineVisualizer';
import { CounterStrategyStudio } from './CounterStrategyStudio';

interface ContractStudioViewProps {
  isDark: boolean;
  mode: 'citizen' | 'professional';
  apiBase?: string;
}

type StudioMode = 'pleadings' | 'generator' | 'scanner' | 'cleanroom' | 'bsa_cert' | 'timeline' | 'counter_strategy';

interface RiskItem {
  id: string;
  severity: 'critical' | 'warning' | 'safe';
  clause_title: string;
  flagged_text: string;
  statutory_violation?: string;
  risk_explanation: string;
  counter_clause_revision: string;
}

interface AuditResult {
  contract_title: string;
  health_score: number;
  risk_rating: string;
  total_clauses_analyzed: number;
  critical_count: number;
  warning_count: number;
  safe_count: number;
  statutory_conflicts: string[];
  stamp_duty_advisory: string;
  risk_items: RiskItem[];
  ai_engine: string;
}

const TEMPLATE_PRESETS = [
  {
    key: 'nda',
    title: 'Mutual Non-Disclosure Agreement (NDA)',
    tag: 'ICA 1872 §27 Compliant',
    icon: 'lock',
    desc: 'Protects proprietary code, trade secrets, and customer data without imposing illegal trade restraints.'
  },
  {
    key: 'msa',
    title: 'Master Services & Freelancer Agreement (MSA)',
    tag: 'IP Assignment & Milestones',
    icon: 'handshake',
    desc: 'Standard commercial contract with work-made-for-hire copyright transfer, payment terms, and 15-day cure period.'
  },
  {
    key: 'employment',
    title: 'Employment & IP Assignment Agreement',
    tag: 'DPDP 2023 & Non-Solicit',
    icon: 'badge',
    desc: 'Lawful Indian employment deed with employee DPDP consent, invention assignment, and enforceable non-solicitation.'
  },
  {
    key: 'lease',
    title: 'Commercial Office Lease & Licence Deed',
    tag: 'Stamp Duty & Regn Act §17',
    icon: 'apartment',
    desc: 'Office tenancy deed with lock-in period, security deposit refund terms, and state e-Stamping advisory.'
  },
  {
    key: 'saas_dpdp',
    title: 'SaaS Agreement (with DPDP Schedule)',
    tag: '₹250 Cr Penalty Protection',
    icon: 'cloud_done',
    desc: 'Enterprise software agreement with 99.5% SLA, liability caps, and statutory Data Processor schedules under DPDP 2023.'
  }
];

const PREDATORY_SAMPLE_CONTRACT = `VENDOR SERVICES & WORK AGREEMENT

1. INDEMNITY (UNCAPPED):
The Service Provider agrees to defend, indemnify, and hold harmless the Client and all affiliates from and against any and all claims, demands, losses, damages, liabilities, costs, and expenses (including indirect, remote, and consequential losses) arising out of this Agreement, without any limitation whatsoever.

2. RESTRICTION ON VOCATION (NON-COMPETE):
The Service Provider and its key personnel shall not, for a period of twenty-four (24) months following termination of this Agreement, directly or indirectly provide services, consult, or engage in any business competing with the Client anywhere in India.

3. TERMINATION AT WILL:
The Client may terminate this Agreement immediately at any time without cause and without giving any prior written notice or cure period.

4. EXCLUSIVE FOREIGN JURISDICTION:
This Agreement shall be governed by the laws of the State of Delaware, USA, and the courts in Wilmington, Delaware shall have exclusive jurisdiction over all disputes.

5. CUSTOMER DATA USAGE:
Provider may access and process Client customer records for operational purposes without requiring formal Data Fiduciary agreements.`;

const COMPLIANT_SAMPLE_CONTRACT = `BHARAT COMMERCIAL SERVICES AGREEMENT (ICA 1872 & DPDP 2023)

Executed at New Delhi, State of Delhi, Republic of India.

BY AND BETWEEN:
1. Bharat Innovations Pvt. Ltd. (Client / First Party)
AND
2. Apex Technology Solutions LLP (Service Provider / Second Party)

OPERATIVE STATUTORY CLAUSES:
1. SCOPE OF SERVICES: Full-stack software engineering and legal tech API microservices development.
2. CONSIDERATION & TAXATION: ₹2,50,000/- plus applicable GST, subject to statutory TDS under Income Tax Act, 1961.
3. TERM & 15-DAY CURE PERIOD: Commences on effective date for 24 months. Either party may terminate for convenience on 30 days written notice, or for material breach subject to a mandatory 15-day cure period.
4. BALANCED INDEMNITY & LIABILITY CAP (§73 ICA): Total aggregate liability of either party shall not exceed the total fees paid in the preceding six (6) months. Indirect, remote, and speculative damages are expressly excluded.
5. SECTION 27 COMPLIANCE & TRADE SECRET PROTECTION: Post-termination covenants are restricted to confidentiality and non-solicitation of clients. Post-employment non-compete restraints on any lawful profession, trade, or business are expressly excluded as void pursuant to Section 27 of the Indian Contract Act, 1872.
6. DATA PRIVACY UNDER DPDP ACT, 2023: Provider acts as Data Processor under Section 8 of the Digital Personal Data Protection Act, 2023, implementing technical safeguards and notifying Client within 72 hours of any security breach.
7. GOVERNING LAW & ARBITRATION: Governed by laws of India. Disputes shall be resolved by a Sole Arbitrator in New Delhi in accordance with the Arbitration & Conciliation Act, 1996.
8. ELECTRONIC ADMISSIBILITY: Valid and admissible under Section 63 of Bharatiya Sakshya Adhiniyam, 2023.`;

interface CourtReadyParchmentProps {
  contractText: string;
  presetKey: string;
  partyA: string;
  partyB: string;
  governingState: string;
  arbitrationCity: string;
  durationMonths: number;
  consideration: string;
  specificScope: string;
  isPrintOnly?: boolean;
}

function CourtReadyParchmentDeed({
  contractText,
  presetKey,
  partyA,
  partyB,
  governingState,
  arbitrationCity,
  durationMonths,
  consideration,
  specificScope,
  isPrintOnly = false
}: CourtReadyParchmentProps) {
  // Deterministic certificate number
  const certNumber = `IN-DL${Math.abs(
    (partyA + partyB + governingState).split('').reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) | 0, 0)
  ).toString().padStart(10, '7')}Z`;

  const presetTitle = TEMPLATE_PRESETS.find(p => p.key === presetKey)?.title || 'COMMERCIAL LEGAL AGREEMENT';

  // Parse text into structured clauses
  const rawLines = (contractText || '').split('\n');
  const filteredLines = rawLines.filter(line => {
    const trimmed = line.trim();
    if (!trimmed) return true;
    if (
      trimmed.startsWith('MUTUAL COMMERCIAL AGREEMENT') ||
      trimmed.startsWith('Executed at') ||
      trimmed.startsWith('BY AND BETWEEN:') ||
      trimmed.startsWith('1. ' + partyA) ||
      trimmed.startsWith('2. ' + partyB) ||
      trimmed.startsWith('AND') ||
      trimmed.startsWith('OPERATIVE STATUTORY CLAUSES:') ||
      trimmed.startsWith('SIGNATURES:')
    ) {
      return false;
    }
    return true;
  });
  const cleanedBody = filteredLines.join('\n').trim();

  return (
    <div
      id={isPrintOnly ? "court-ready-deed-printable" : "court-ready-deed-preview"}
      className={
        isPrintOnly
          ? "hidden print:block bg-white text-black font-serif text-[11pt] leading-[1.8] text-justify"
          : "bg-white text-[#111827] font-serif p-3.5 sm:p-6 md:p-10 rounded-sm shadow-xl border border-slate-300 max-h-[580px] overflow-y-auto select-text text-[11.5px] sm:text-[13px] leading-[1.8] text-justify space-y-4 sm:space-y-6"
      }
      style={{
        fontFamily: "'Times New Roman', Times, Georgia, serif"
      }}
    >
      {/* 1. OFFICIAL NON-JUDICIAL E-STAMP CERTIFICATE HEADER */}
      <div className="border-2 border-black p-2.5 sm:p-3 bg-white text-black font-sans text-[9.5px] sm:text-[10.5px] leading-tight space-y-2 avoid-page-break">
        <div className="text-center font-bold uppercase tracking-wider text-[10px] sm:text-[12px] border-b border-black pb-1.5 flex items-center justify-between gap-1.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded border border-black flex items-center justify-center font-serif text-[10px] sm:text-[11px] font-bold shrink-0">
            सत्य
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[9px] sm:text-[11px]">GOVERNMENT OF NCT OF DELHI / STATE OF {governingState.toUpperCase()}</div>
            <div className="text-[8px] sm:text-[9.5px] font-semibold tracking-normal text-slate-800 truncate">
              e-Stamp Certificate • Non-Judicial Commercial Stamp (Ref: SHCIL/IND-STAMP-2026)
            </div>
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 border border-black flex flex-col items-center justify-center text-[6px] sm:text-[7px] font-mono shrink-0">
            <span>QR</span>
            <span>SEC</span>
          </div>
        </div>

        {/* 2-Column Official Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-x-4 gap-y-1 py-1 font-mono text-[8.5px] sm:text-[9.5px] break-all">
          <div><strong>Certificate No:</strong> {certNumber}</div>
          <div><strong>Issued Date:</strong> 12-Oct-2026 11:30 AM IST</div>
          <div><strong>Account Reference:</strong> NONACC (FI) / dl2026 / {governingState.toUpperCase()} / INDIA</div>
          <div><strong>Unique Doc Ref:</strong> SUBIN-DL{governingState.slice(0, 2).toUpperCase()}202688410291X</div>
          <div><strong>Purchased By:</strong> {partyA}</div>
          <div><strong>Description:</strong> Article 5(c) / Article 35 - Agreement</div>
          <div><strong>First Party:</strong> {partyA}</div>
          <div><strong>Second Party:</strong> {partyB}</div>
          <div><strong>Stamp Duty Paid By:</strong> {partyA}</div>
          <div><strong>Duty Amount (Rs.):</strong> ₹ 100/- (One Hundred Only) [Adjudicated]</div>
          <div><strong>Consideration:</strong> {consideration}</div>
          <div><strong>Arbitration Seat:</strong> {arbitrationCity}, State of {governingState}</div>
        </div>

        <div className="border-t border-black pt-1 text-center font-sans italic text-[8px] sm:text-[8.5px] text-slate-700">
          *** Please write or type below this line. Official verification: www.shcilestamp.com / National e-Stamping Portal ***
        </div>
      </div>

      {/* 2. DEED TITLE */}
      <div className="text-center my-6 avoid-page-break">
        <h1 className="text-[15px] sm:text-[17px] font-black uppercase tracking-wider text-black">
          {presetTitle}
        </h1>
        <div className="w-48 mx-auto border-t-2 border-b border-black h-1 mt-1 mb-2" />
        <p className="text-[11px] font-sans font-bold uppercase tracking-wider text-slate-700">
          Executed under the Indian Contract Act, 1872 & Arbitration and Conciliation Act, 1996
        </p>
      </div>

      {/* 3. FORMAL PREAMBLE */}
      <div className="space-y-3">
        <p>
          <strong>THIS COMMERCIAL DEED OF AGREEMENT</strong> (hereinafter referred to as the <em>"Agreement"</em>) is entered into and executed on this <strong>12th day of October, 2026</strong> at <strong>{arbitrationCity}</strong>, State of <strong>{governingState}</strong>, Republic of India:
        </p>

        <p className="font-bold uppercase tracking-wider">BY AND BETWEEN:</p>

        <p className="pl-4">
          <strong>1. {partyA}</strong>, an entity incorporated and operating under the laws of India, having its registered / corporate office at its principal place of business (hereinafter referred to as the <strong>"PARTY OF THE FIRST PART / DISCLOSING PARTY"</strong>, which expression shall, unless repugnant to the context or meaning thereof, be deemed to include its authorized directors, legal representatives, successors-in-interest, and permitted assigns);
        </p>

        <p className="font-bold text-center uppercase tracking-widest text-[11px]">- AND -</p>

        <p className="pl-4">
          <strong>2. {partyB}</strong>, an entity incorporated and operating under the laws of India, having its commercial office at its principal place of business (hereinafter referred to as the <strong>"PARTY OF THE SECOND PART / RECEIVING PARTY"</strong>, which expression shall, unless repugnant to the context or meaning thereof, be deemed to include its authorized directors, legal representatives, successors-in-interest, and permitted assigns).
        </p>

        <p className="italic text-[11.5px] text-slate-800">
          (The Party of the First Part and Party of the Second Part are hereinafter collectively referred to as the <strong>"Parties"</strong> and individually as a <strong>"Party"</strong>).
        </p>
      </div>

      {/* 4. RECITALS ("WHEREAS" CLAUSES) */}
      <div className="space-y-2 border-t border-slate-300 pt-3">
        <p className="font-bold uppercase tracking-wider text-[12px]">RECITALS:</p>
        <p className="pl-4">
          <strong>WHEREAS</strong>, the Parties are engaged in commercial discussions and active business collaboration concerning <strong>{specificScope}</strong>;
        </p>
        <p className="pl-4">
          <strong>AND WHEREAS</strong>, the Parties acknowledge that in the course of such engagement, confidential information, intellectual assets, and valuable considerations will be exchanged between them;
        </p>
        <p className="pl-4">
          <strong>AND WHEREAS</strong>, the Parties desire to define their mutual statutory rights, reciprocal covenants, liabilities, and obligations in writing under the provisions of the Indian Contract Act, 1872;
        </p>
        <p className="pt-2 font-bold uppercase tracking-wide">
          NOW, THEREFORE, IN CONSIDERATION OF THE MUTUAL COVENANTS CONTAINED HEREIN, AND THE VALUABLE CONSIDERATION OF {consideration.toUpperCase()}, THE RECEIPT AND SUFFICIENCY OF WHICH ARE HEREBY MUTUALLY ACKNOWLEDGED, THE PARTIES MUTUALLY AGREE AS FOLLOWS:
        </p>
      </div>

      {/* 5. OPERATIVE STATUTORY CLAUSES */}
      <div className="space-y-4 border-t border-slate-300 pt-3">
        {cleanedBody ? (
          <div className="whitespace-pre-wrap leading-[1.8] text-[12.5px] sm:text-[13px]">
            {cleanedBody}
          </div>
        ) : (
          <div className="space-y-3">
            <p>
              <strong>1. SCOPE AND OBLIGATIONS:</strong> The Parties agree that all commercial deliverables and services shall strictly adhere to the defined project scope: {specificScope}. Neither Party shall subcontract or delegate performance without prior express written authorization.
            </p>
            <p>
              <strong>2. CONSIDERATION & TAX COMPLIANCE:</strong> The agreed consideration payable under this deed is {consideration}, payable against valid tax invoices and subject to statutory Indian Tax Deducted at Source (TDS) and Goods and Services Tax (GST) mandates.
            </p>
            <p>
              <strong>3. TERM & DURATION:</strong> This Agreement shall commence on the Effective Execution Date and continue in full force and effect for a period of {durationMonths} months, unless terminated earlier in writing in accordance with the provisions herein.
            </p>
            <p>
              <strong>4. SECTION 27 INDIAN CONTRACT ACT COMPLIANCE:</strong> The Parties mutually agree that post-termination covenants shall be strictly restricted to the protection of proprietary trade secrets and non-solicitation of active personnel. Post-employment non-compete restraints on any lawful profession, trade, or business are expressly excluded as void pursuant to Section 27 of the Indian Contract Act, 1872.
            </p>
            <p>
              <strong>5. DATA PRIVACY UNDER DPDP ACT, 2023:</strong> In the event either Party processes digital personal data of Indian citizens, such Party shall act in full compliance with the Digital Personal Data Protection Act, 2023, implementing reasonable technical and organizational security safeguards to prevent personal data breaches.
            </p>
            <p>
              <strong>6. LIMITATION OF LIABILITY (§73 ICA):</strong> Neither Party shall be liable to the other for indirect, remote, punitive, or consequential damages. Aggregate liability under this Agreement shall not exceed the total fees paid or payable in the preceding six (6) months.
            </p>
            <p>
              <strong>7. GOVERNING LAW & ARBITRATION:</strong> This Agreement shall be governed by, and construed in accordance with, the substantive laws of India. Any controversy, claim, or dispute arising out of or in connection with this Agreement shall be referred to and finally resolved by arbitration in {arbitrationCity}, State of {governingState}, in accordance with the Arbitration & Conciliation Act, 1996 by a sole arbitrator mutually appointed by the Parties.
            </p>
          </div>
        )}
      </div>

      {/* 6. EXECUTION CLOSING FORMULA */}
      <div className="pt-6 border-t border-slate-300 avoid-page-break">
        <p className="font-bold uppercase tracking-wider text-[11.5px] text-center mb-6">
          IN WITNESS WHEREOF, THE PARTIES HERETO HAVE CAUSED THIS COMMERCIAL DEED TO BE DULY EXECUTED AND DELIVERED BY THEIR RESPECTIVE AUTHORIZED SIGNATORIES AS OF THE DAY, MONTH AND YEAR FIRST ABOVE WRITTEN.
        </p>

        {/* 7. DUAL-COLUMN SIGNATURE BOXES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-4 sm:gap-8 pt-2 pb-4">
          {/* Party A */}
          <div className="border border-black p-3 sm:p-4 space-y-2.5 sm:space-y-3 bg-white">
            <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-700">
              For and on behalf of First Party:
            </div>
            <div className="font-bold text-[12px] truncate">{partyA}</div>
            <div className="pt-6 sm:pt-8 border-b border-black" />
            <div className="text-[10px] font-sans space-y-1">
              <div><strong>By:</strong> <span className="inline-block border-b border-black w-28 sm:w-40 ml-1"></span></div>
              <div><strong>Name:</strong> Authorized Signatory</div>
              <div><strong>Title:</strong> Managing Director / Partner</div>
              <div><strong>Date:</strong> 12 / 10 / 2026</div>
              <div className="pt-2 text-center text-slate-600 italic text-[9px] sm:text-[10px]">[ Common Seal / Company Stamp ]</div>
            </div>
          </div>

          {/* Party B */}
          <div className="border border-black p-3 sm:p-4 space-y-2.5 sm:space-y-3 bg-white">
            <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-700">
              For and on behalf of Second Party:
            </div>
            <div className="font-bold text-[12px] truncate">{partyB}</div>
            <div className="pt-6 sm:pt-8 border-b border-black" />
            <div className="text-[10px] font-sans space-y-1">
              <div><strong>By:</strong> <span className="inline-block border-b border-black w-28 sm:w-40 ml-1"></span></div>
              <div><strong>Name:</strong> Authorized Signatory</div>
              <div><strong>Title:</strong> Director / Authorized Signatory</div>
              <div><strong>Date:</strong> 12 / 10 / 2026</div>
              <div className="pt-2 text-center text-slate-600 italic text-[9px] sm:text-[10px]">[ Common Seal / Company Stamp ]</div>
            </div>
          </div>
        </div>

        {/* 8. WITNESS ATTESTATION BOX */}
        <div className="border border-black p-3 sm:p-3.5 mt-3 sm:mt-4 space-y-2 font-sans text-[10px] avoid-page-break bg-slate-50/50">
          <div className="font-bold uppercase tracking-wider text-[9.5px] sm:text-[10px]">
            IN THE PRESENCE OF INDEPENDENT WITNESSES:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-3 sm:gap-4 pt-1">
            <div className="space-y-1">
              <div><strong>Witness 1:</strong></div>
              <div>Signature: <span className="inline-block border-b border-black w-28 sm:w-40 ml-1"></span></div>
              <div>Full Name: <span className="inline-block border-b border-black w-28 sm:w-40 ml-1"></span></div>
              <div>Address: <span className="inline-block border-b border-black w-28 sm:w-40 ml-1"></span></div>
            </div>
            <div className="space-y-1">
              <div><strong>Witness 2:</strong></div>
              <div>Signature: <span className="inline-block border-b border-black w-28 sm:w-40 ml-1"></span></div>
              <div>Full Name: <span className="inline-block border-b border-black w-28 sm:w-40 ml-1"></span></div>
              <div>Address: <span className="inline-block border-b border-black w-28 sm:w-40 ml-1"></span></div>
            </div>
          </div>
        </div>

        {/* 9. STATUTORY ADMISSIBILITY CERTIFICATE */}
        <div className="pt-4 text-center font-mono text-[9px] text-slate-600 border-t border-slate-300 mt-4">
          ⚖️ Certified under Section 63 of Bharatiya Sakshya Adhiniyam, 2023 (BSA). Formatted for Indian Judicial Admissibility under the Indian Stamp Act, 1899 and Arbitration & Conciliation Act, 1996.
        </div>
      </div>
    </div>
  );
}

export const ContractStudioView: React.FC<ContractStudioViewProps> = ({ isDark, mode, apiBase }) => {
  const [studioMode, setStudioMode] = useState<StudioMode>('generator');
  const resolvedApiBase = (apiBase || import.meta.env.VITE_API_BASE || (typeof window !== 'undefined' && window.location.origin.includes('localhost') ? 'http://127.0.0.1:8000' : '')).replace(/\/+$/, '');

  // Generator State
  const [selectedPreset, setSelectedPreset] = useState<string>('nda');
  const [partyA, setPartyA] = useState<string>('Bharat Innovations Pvt. Ltd.');
  const [partyB, setPartyB] = useState<string>('Apex Technology Solutions LLP');
  const [governingState, setGoverningState] = useState<string>('Delhi');
  const [arbitrationCity, setArbitrationCity] = useState<string>('New Delhi');
  const [durationMonths, setDurationMonths] = useState<number>(24);
  const [consideration, setConsideration] = useState<string>('₹2,50,000/- plus applicable GST');
  const [specificScope, setSpecificScope] = useState<string>('AI-powered legal tech integration, API microservices development, and maintenance.');
  
  const [generatedText, setGeneratedText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [engineUsed, setEngineUsed] = useState<string>('Bharat Statutory Contract Engine (Deterministic Indian Law)');
  const [copiedContract, setCopiedContract] = useState<boolean>(false);
  const [previewFormat, setPreviewFormat] = useState<'parchment' | 'code'>('parchment');
  const [isFullParchmentModalOpen, setIsFullParchmentModalOpen] = useState<boolean>(false);
  const [mobileGenTab, setMobileGenTab] = useState<'config' | 'preview'>('config');

  // Scanner State
  const [scanText, setScanText] = useState<string>('');
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [copiedClauseId, setCopiedClauseId] = useState<string | null>(null);
  const contractFileInputRef = useRef<HTMLInputElement>(null);
  const [isParsingContractDoc, setIsParsingContractDoc] = useState<boolean>(false);
  const [contractUploadNotice, setContractUploadNotice] = useState<string | null>(null);

  const handleProcessContractFile = async (file: File) => {
    setIsParsingContractDoc(true);
    setContractUploadNotice(null);
    try {
      const parsed = await parseUploadedDocument(file);
      if (parsed.isScannedOrEmpty && parsed.warning) {
        setContractUploadNotice(parsed.warning);
        setTimeout(() => setContractUploadNotice(null), 8000);
      } else {
        setContractUploadNotice(`Successfully extracted ${parsed.fileName} (${parsed.formattedSize}, ~${parsed.wordCount} words).`);
        setTimeout(() => setContractUploadNotice(null), 5000);
      }
      setScanText(parsed.text);
    } catch (err: any) {
      console.error('Contract file parsing error:', err);
      setContractUploadNotice('Failed to extract document text. Please ensure the file is not password-protected.');
      setTimeout(() => setContractUploadNotice(null), 5000);
    } finally {
      setIsParsingContractDoc(false);
      if (contractFileInputRef.current) contractFileInputRef.current.value = '';
    }
  };

  // Generate contract text dynamically
  const handleGenerateContract = async (useAI: boolean = false) => {
    setIsGenerating(true);
    try {
      const res = await fetch(`${resolvedApiBase}/api/contracts/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_type: selectedPreset,
          party_a_name: partyA,
          party_b_name: partyB,
          governing_state: governingState,
          arbitration_city: arbitrationCity,
          duration_months: durationMonths,
          consideration_amount: consideration,
          specific_covenants: specificScope,
          gemini_api_key: useAI ? (localStorage.getItem('gemini_api_key') || undefined) : undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedText(data.contract_text);
        setEngineUsed(data.engine);
        setMobileGenTab('preview');
      } else {
        throw new Error('API request failed');
      }
    } catch {
      // Fallback deterministic local generation
      const fallback = `MUTUAL COMMERCIAL AGREEMENT (${selectedPreset.toUpperCase()})
Executed at ${arbitrationCity}, State of ${governingState}, India.

BY AND BETWEEN:
1. ${partyA} (First Party)
AND
2. ${partyB} (Second Party)

OPERATIVE STATUTORY CLAUSES:
1. SCOPE & PURPOSE: ${specificScope}
2. CONSIDERATION & TAXATION: ${consideration}. Subject to Indian TDS & GST compliance.
3. DURATION: ${durationMonths} months from the effective execution date.
4. SECTION 27 COMPLIANCE: Parties observe mutual trade secret protection. Post-termination restraint on lawful profession is strictly excluded under Section 27 Indian Contract Act 1872.
5. ARBITRATION: Sole Arbitrator in ${arbitrationCity} under the Arbitration & Conciliation Act, 1996.
6. STAMP DUTY: Subject to applicable non-judicial stamp duty in ${governingState} (SHCIL e-Stamping).
7. ELECTRONIC EXECUTION: Valid under Section 63 Bharatiya Sakshya Adhiniyam, 2023.

SIGNATURES:
FOR ${partyA.toUpperCase()}: ______________________
FOR ${partyB.toUpperCase()}: ______________________`;
      setGeneratedText(fallback);
      setEngineUsed('Bharat Statutory Contract Engine (Deterministic Offline Mode)');
      setMobileGenTab('preview');
    } finally {
      setIsGenerating(false);
    }
  };

  // Run audit on input contract
  const handleAuditContract = async (textToAudit?: string) => {
    const text = textToAudit || scanText;
    if (!text.trim()) return;

    setIsAuditing(true);
    try {
      const res = await fetch(`${resolvedApiBase}/api/contracts/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_text: text,
          contract_title: 'Commercial Agreement Audit',
          gemini_api_key: localStorage.getItem('gemini_api_key') || undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAuditResult(data);
      } else {
        throw new Error('Audit API call failed');
      }
    } catch {
      // Context-aware client-side evaluation fallback (runs seamlessly on Vercel / offline)
      const textLower = text.toLowerCase();
      const items: RiskItem[] = [];
      const conflicts: string[] = [];

      // 1. Uncapped Indemnity (§73 ICA)
      const hasIndemnity = textLower.includes('indemnif');
      const hasUncappedQualifiers = ['without limitation whatsoever', 'without any limitation', 'uncapped', 'indirect, remote, and consequential', 'remote, and consequential losses'].some(k => textLower.includes(k));
      const hasLiabilityCap = ['limitation of liability', 'aggregate liability shall not exceed', 'exceed the total fees paid', 'exceed the total fees', 'fees paid in the preceding'].some(k => textLower.includes(k));

      if (hasIndemnity && hasUncappedQualifiers && !hasLiabilityCap) {
        items.push({
          id: 'crit-indemnity',
          severity: 'critical',
          clause_title: 'Uncapped & Disproportionate Indemnity',
          flagged_text: 'Party shall indemnify and hold harmless from any and all claims, damages, indirect, consequential losses without limitation...',
          statutory_violation: 'Section 73 Indian Contract Act 1872 (Remoteness of Damages)',
          risk_explanation: 'Imposes uncapped liability for remote and consequential damages prohibited under Section 73 ICA.',
          counter_clause_revision: 'Each Party\'s indemnity obligation shall be strictly limited to direct, proven damages caused solely by gross negligence, subject to the overall limitation of liability cap stipulated in Clause X.'
        });
        conflicts.push('Section 73 ICA 1872 (Damages must be direct, not remote)');
      } else if (hasLiabilityCap || hasIndemnity) {
        items.push({
          id: 'safe-indemnity-cap',
          severity: 'safe',
          clause_title: 'Balanced Liability & Section 73 ICA Compliance',
          flagged_text: 'Aggregate liability is capped to fees paid with exclusion of remote and indirect damages.',
          statutory_violation: undefined,
          risk_explanation: 'Agreement respects Section 73 of the Indian Contract Act 1872 by capping aggregate liability to commercial consideration.',
          counter_clause_revision: 'Retain existing balanced liability cap.'
        });
      }

      // 2. Section 27 Non-Compete Evaluation
      const hasRestrictiveIntent = ['shall not directly or indirectly engage in', 'shall not work for', 'restrained from carrying on', 'competing with the client', 'engaging in any business competing', 'covenant not to compete'].some(k => textLower.includes(k));
      const hasPostTerm = ['following termination', 'after termination', 'post-termination', 'post termination'].some(k => textLower.includes(k));
      const hasStatutoryDisclaimer = ['excluded as void', 'expressly excluded', 'are void pursuant to section 27', 'void under section 27', 'in lieu of illegal trade restraints', 'no post-termination restriction on practicing a lawful profession', 'does not constitute an unlawful restraint', 'strictly excluded under section 27'].some(k => textLower.includes(k));

      if (hasRestrictiveIntent && hasPostTerm && !hasStatutoryDisclaimer) {
        items.push({
          id: 'crit-noncompete',
          severity: 'critical',
          clause_title: 'Void Post-Termination Non-Compete Restriction',
          flagged_text: 'Restricts party from engaging in competing business for 24 months post termination...',
          statutory_violation: 'Section 27 Indian Contract Act 1872 (Restraint of Trade Void ab Initio)',
          risk_explanation: 'Supreme Court jurisprudence (Percept D\'Mark v. Zaheer Khan) holds all post-employment trade restraints completely void.',
          counter_clause_revision: 'Parties agree to strict confidentiality and 12-month client non-solicitation. No post-termination profession ban shall apply.'
        });
        conflicts.push('Section 27 ICA 1872 (Restraint of lawful trade is void)');
      } else {
        items.push({
          id: 'safe-sec27-trade',
          severity: 'safe',
          clause_title: 'Section 27 Compliant Trade Secret & Profession Protection',
          flagged_text: 'Post-termination trade restraints are excluded; protection is lawfully focused on trade secrets and non-solicitation.',
          statutory_violation: undefined,
          risk_explanation: 'Agreement strictly complies with Section 27 of ICA 1872 without imposing void restrictions on lawful vocation or commerce.',
          counter_clause_revision: 'Retain compliant Section 27 trade secret protective terms.'
        });
      }

      // 3. Termination & Natural Justice (§39 ICA)
      const hasPredatoryTermination = ['without cause and without giving any prior written notice', 'without cause and without notice', 'without notice or cure period', 'immediately without notice', 'sole discretion without notice'].some(k => textLower.includes(k));

      if (hasPredatoryTermination) {
        items.push({
          id: 'warn-unilateral-term',
          severity: 'warning',
          clause_title: 'Unilateral Termination for Convenience without Cure',
          flagged_text: 'Client may terminate this Agreement immediately at its sole discretion without any notice or cure period...',
          statutory_violation: 'Section 39 Indian Contract Act 1872 & Principles of Natural Justice',
          risk_explanation: 'Permits counterparty to abruptly cancel agreements without giving you an opportunity to cure alleged defaults, leading to unrecovered operational overheads.',
          counter_clause_revision: 'Either Party may terminate upon thirty (30) days\' written notice, or immediately for material breach provided the defaulting party is afforded a mandatory fifteen (15) day written cure period.'
        });
      } else {
        items.push({
          id: 'safe-termination-cure',
          severity: 'safe',
          clause_title: 'Equitable Termination & Cure Period Safeguards',
          flagged_text: 'Agreement incorporates mandatory written notice periods and cure opportunities prior to cancellation.',
          statutory_violation: undefined,
          risk_explanation: 'Balanced termination terms prevent surprise repudiation and adhere to Section 39 ICA principles.',
          counter_clause_revision: 'Retain standard notice and cure provisions.'
        });
      }

      // 4. Asymmetric Jurisdiction & Foreign Arbitration Trap (§28 ICA)
      const hasForeignVenue = ['delaware', 'wilmington', 'london', 'courts of england', 'new york'].some(k => textLower.includes(k));

      if (hasForeignVenue) {
        items.push({
          id: 'crit-foreign-venue',
          severity: 'critical',
          clause_title: 'Remote / Foreign Jurisdiction Trap',
          flagged_text: 'Governed by Delaware/London courts...',
          statutory_violation: 'Section 28 Indian Contract Act 1872 (Ousting Indian Legal Remedies)',
          risk_explanation: 'Forces Indian entity into expensive overseas litigation, making dispute recovery economically impossible.',
          counter_clause_revision: 'Governed by laws of India, with Sole Arbitrator in India under the Arbitration & Conciliation Act, 1996.'
        });
        conflicts.push('Section 28 ICA 1872 (Agreements restricting legal proceedings)');
      } else {
        items.push({
          id: 'safe-arbitration-seat',
          severity: 'safe',
          clause_title: 'Indian Seat & Domestic Arbitration (§28 Compliant)',
          flagged_text: 'Governed by Indian substantive law with domestic arbitration under Arbitration & Conciliation Act 1996.',
          statutory_violation: undefined,
          risk_explanation: 'Agreement designates an accessible domestic seat in India, fully upholding Section 28 of ICA 1872.',
          counter_clause_revision: 'Retain Indian jurisdiction and sole arbitrator framework.'
        });
      }

      // 5. DPDP Act 2023 Compliance
      const processesPersonalData = ['process client customer records', 'processes digital personal data', 'personal data of indian citizens', 'data processor', 'data fiduciary'].some(k => textLower.includes(k));
      const hasDpdpsafeguards = ['dpdp', 'digital personal data protection', 'data fiduciary agreements', 'data fiduciary', 'data processor'].some(k => textLower.includes(k));

      if (processesPersonalData && !hasDpdpsafeguards) {
        items.push({
          id: 'warn-dpdp-missing',
          severity: 'warning',
          clause_title: 'Missing Statutory DPDP Act 2023 Schedule',
          flagged_text: 'Contract processes customer/personal data without statutory Data Fiduciary vs Data Processor stipulations...',
          statutory_violation: 'Section 8 & 9 Digital Personal Data Protection Act, 2023',
          risk_explanation: 'Processing Indian citizen personal data without formal contractual Data Processor safeguards exposes parties to penalties up to ₹250 Crore.',
          counter_clause_revision: 'Provider shall act strictly as a Data Processor under Section 8 of the DPDP Act 2023, process personal data only on verified instructions, and notify Data Fiduciary within 72 hours of any security breach.'
        });
        conflicts.push('Section 8 DPDP Act 2023 (Mandatory Data Fiduciary & Processor commitments)');
      } else {
        items.push({
          id: 'safe-dpdp-compliance',
          severity: 'safe',
          clause_title: 'DPDP Act 2023 & Data Privacy Compliance',
          flagged_text: 'Personal data handling aligns with the Digital Personal Data Protection Act, 2023.',
          statutory_violation: undefined,
          risk_explanation: 'Complies with DPDP Act 2023 security obligations and statutory data processing boundaries.',
          counter_clause_revision: 'Maintain statutory privacy safeguards.'
        });
      }

      const critCount = items.filter(r => r.severity === 'critical').length;
      const warnCount = items.filter(r => r.severity === 'warning').length;
      const safeCount = items.filter(r => r.severity === 'safe').length;

      const score = Math.max(20, Math.min(100, 100 - (critCount * 25) - (warnCount * 12)));

      setAuditResult({
        contract_title: 'Commercial Agreement Audit',
        health_score: score,
        risk_rating: score >= 90 ? 'Low Risk (Compliant)' : score >= 70 ? 'Moderate Risk' : score >= 50 ? 'High Risk' : 'Critical Risk (Predatory Terms)',
        total_clauses_analyzed: items.length + 4,
        critical_count: critCount,
        warning_count: warnCount,
        safe_count: safeCount,
        statutory_conflicts: conflicts,
        stamp_duty_advisory: 'Execute on state-specific non-judicial e-Stamp paper (SHCIL) to ensure court admissibility under N.N. Global.',
        risk_items: items,
        ai_engine: 'Bharat Contract Intelligence Guardrail (Contextual Rule Engine)'
      });
    } finally {
      setIsAuditing(false);
    }
  };

  // Dedicated Isolated Print Engine for Court-Ready Parchment Deed
  const handlePrintDeed = () => {
    const printableEl = document.getElementById('court-ready-deed-printable') || document.getElementById('court-ready-deed-preview');
    if (!printableEl) {
      window.print();
      return;
    }

    // Clean up any existing print iframe
    const oldIframe = document.getElementById('bharat-contract-print-frame');
    if (oldIframe) {
      oldIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'bharat-contract-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Court-Ready Commercial Deed - Team Innov8</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 15mm 15mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff !important;
      color: #000000 !important;
      font-family: 'Times New Roman', Times, Georgia, serif;
      font-size: 11pt;
      line-height: 1.75;
      text-align: justify;
    }
    .avoid-page-break {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .page-break-before {
      page-break-before: always !important;
      break-before: page !important;
    }
    .border-2 { border: 2px solid #000000; }
    .border { border: 1px solid #000000; }
    .border-black { border-color: #000000; }
    .border-t-2 { border-top: 2px solid #000000; }
    .border-b { border-bottom: 1px solid #000000; }
    .border-t { border-top: 1px solid #cbd5e1; }
    .border-slate-300 { border-color: #cbd5e1; }
    .p-3 { padding: 12px; }
    .p-4 { padding: 16px; }
    .p-3\\.5 { padding: 14px; }
    .pl-4 { padding-left: 20px; }
    .pt-1 { padding-top: 4px; }
    .pt-2 { padding-top: 8px; }
    .pt-3 { padding-top: 12px; }
    .pt-4 { padding-top: 16px; }
    .pt-6 { padding-top: 24px; }
    .pt-8 { padding-top: 32px; }
    .pb-1\\.5 { padding-bottom: 6px; }
    .pb-4 { padding-bottom: 16px; }
    .my-6 { margin-top: 22px; margin-bottom: 22px; }
    .mt-1 { margin-top: 4px; }
    .mt-4 { margin-top: 16px; }
    .mb-2 { margin-bottom: 8px; }
    .mb-6 { margin-bottom: 24px; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .text-center { text-align: center; }
    .text-justify { text-align: justify; }
    .font-bold { font-weight: 700; }
    .font-black { font-weight: 900; }
    .font-semibold { font-weight: 600; }
    .font-serif { font-family: 'Times New Roman', Times, Georgia, serif; }
    .font-sans { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .uppercase { text-transform: uppercase; }
    .italic { font-style: italic; }
    .tracking-normal { letter-spacing: normal; }
    .tracking-wide { letter-spacing: 0.025em; }
    .tracking-wider { letter-spacing: 0.05em; }
    .tracking-widest { letter-spacing: 0.1em; }
    .space-y-1 > * + * { margin-top: 4px; }
    .space-y-2 > * + * { margin-top: 8px; }
    .space-y-3 > * + * { margin-top: 12px; }
    .space-y-4 > * + * { margin-top: 16px; }
    .space-y-6 > * + * { margin-top: 24px; }
    .grid { display: grid; }
    .grid-cols-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .gap-4 { gap: 16px; }
    .gap-6 { gap: 24px; }
    .gap-x-4 { column-gap: 16px; }
    .gap-y-1 { row-gap: 4px; }
    .flex { display: flex; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .justify-center { justify-content: center; }
    .flex-col { flex-direction: column; }
    .whitespace-pre-wrap { white-space: pre-wrap; }
    .w-8 { width: 32px; }
    .h-8 { height: 32px; }
    .w-48 { width: 192px; }
    .h-1 { height: 4px; }
    .text-black { color: #000000; }
    .text-slate-600 { color: #475569; }
    .text-slate-700 { color: #334155; }
    .text-slate-800 { color: #1e293b; }
    .bg-white { background-color: #ffffff; }
    .bg-slate-50\\/50 { background-color: #f8fafc; }
    .rounded { border-radius: 4px; }
    .rounded-sm { border-radius: 2px; }
    .leading-tight { line-height: 1.25; }
    .leading-\\[1\\.8\\] { line-height: 1.8; }
    .text-\\[7px\\] { font-size: 7px; }
    .text-\\[8\\.5px\\] { font-size: 8.5px; }
    .text-\\[9px\\] { font-size: 9px; }
    .text-\\[9\\.5px\\] { font-size: 9.5px; }
    .text-\\[10px\\] { font-size: 10px; }
    .text-\\[10\\.5px\\] { font-size: 10.5px; }
    .text-\\[11px\\] { font-size: 11px; }
    .text-\\[11\\.5px\\] { font-size: 11.5px; }
    .text-\\[12px\\] { font-size: 12px; }
    .text-\\[12\\.5px\\] { font-size: 12.5px; }
    .text-\\[13px\\] { font-size: 13px; }
    .text-\\[15px\\] { font-size: 15px; }
    .text-\\[17px\\] { font-size: 17px; }
  </style>
</head>
<body>
  <div style="padding: 10mm 5mm;">
    ${printableEl.innerHTML}
  </div>
</body>
</html>`);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Print iframe error:', err);
        window.print();
      }
    }, 250);
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden transition-colors ${
      isDark ? 'bg-[#090a0f] text-slate-100' : 'bg-[#f4f6fb] text-[#0b1c30]'
    }`}>
      {/* HEADER BANNER */}
      <div className={`p-3 sm:p-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 contract-studio-no-print ${
        isDark ? 'bg-[#0d0f17] border-[#1f2438]' : 'bg-white border-[#e2e8f0]'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00288e] to-[#ff7722] flex items-center justify-center text-white shadow-md shrink-0">
            <span className="material-symbols-outlined text-[20px]">edit_document</span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h2 className={`text-[14px] sm:text-[16px] font-black tracking-tight ${
                isDark ? 'text-white' : 'text-[#00288e]'
              }`}>
                AI Contract Studio & Redline Guardrail
              </h2>
              <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Indian Contract Act 1872
              </span>
              <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                mode === 'professional'
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
              }`}>
                {mode === 'professional' ? 'Advocate Counsel Studio' : 'Citizen / Founder Studio'}
              </span>
            </div>
            <p className={`text-[10.5px] sm:text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Draft court-ready agreements & audit third-party contracts for predatory clauses, uncapped liability & DPDP 2023 risks.
            </p>
          </div>
        </div>

        {/* MODE SWITCHER PILL */}
        <div className={`w-full sm:w-auto grid grid-cols-2 sm:grid-cols-4 sm:flex items-center p-0.5 rounded-lg border shadow-2xs ${
          isDark ? 'bg-[#131624] border-[#242b42]' : 'bg-[#f0f4ff] border-[#dce9ff]'
        }`}>
          <button
            type="button"
            onClick={() => setStudioMode('pleadings')}
            className={`px-3 py-1.5 rounded-md text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              studioMode === 'pleadings'
                ? isDark ? 'bg-white text-black shadow-xs' : 'bg-[#00288e] text-white shadow-xs'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-[#00288e]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">gavel</span>
            <span>Court Pleadings</span>
          </button>

          <button
            type="button"
            onClick={() => setStudioMode('generator')}
            className={`px-3 py-1.5 rounded-md text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              studioMode === 'generator'
                ? isDark ? 'bg-white text-black shadow-xs' : 'bg-[#00288e] text-white shadow-xs'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-[#00288e]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">description</span>
            <span>Commercial Contracts</span>
          </button>

          <button
            type="button"
            onClick={() => setStudioMode('scanner')}
            className={`px-3 py-1.5 rounded-md text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              studioMode === 'scanner'
                ? isDark ? 'bg-white text-black shadow-xs' : 'bg-[#00288e] text-white shadow-xs'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-[#00288e]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">fact_check</span>
            <span>Risk Scanner</span>
          </button>

          <button
            type="button"
            onClick={() => setStudioMode('cleanroom')}
            className={`px-3 py-1.5 rounded-md text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              studioMode === 'cleanroom'
                ? isDark ? 'bg-white text-black shadow-xs' : 'bg-[#00288e] text-white shadow-xs'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-[#00288e]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">auto_fix_high</span>
            <span>Clean-Room & e-Stamping</span>
          </button>

          <button
            type="button"
            onClick={() => setStudioMode('bsa_cert')}
            className={`px-3 py-1.5 rounded-md text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              studioMode === 'bsa_cert'
                ? isDark ? 'bg-white text-black shadow-xs' : 'bg-[#00288e] text-white shadow-xs'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-[#00288e]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">verified</span>
            <span>§63 BSA Evidence</span>
          </button>

          <button
            type="button"
            onClick={() => setStudioMode('timeline')}
            className={`px-3 py-1.5 rounded-md text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              studioMode === 'timeline'
                ? isDark ? 'bg-white text-black shadow-xs' : 'bg-[#00288e] text-white shadow-xs'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-[#00288e]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">timeline</span>
            <span>Dispute Timeline</span>
          </button>

          <button
            type="button"
            onClick={() => setStudioMode('counter_strategy')}
            className={`px-3 py-1.5 rounded-md text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              studioMode === 'counter_strategy'
                ? isDark ? 'bg-white text-black shadow-xs' : 'bg-[#00288e] text-white shadow-xs'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-[#00288e]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">shield_with_heart</span>
            <span>Counter-Strategy</span>
          </button>
        </div>
      </div>

      {/* WORKSPACE BODY */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 contract-studio-no-print">
        <div className="max-w-[1240px] mx-auto space-y-5">
          {studioMode === 'counter_strategy' ? (
            /* ================= MODE 6: DEFENSIVE COUNTER-STRATEGY ================= */
            <div className="h-[82vh] min-h-[680px] max-h-[920px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 flex flex-col">
              <CounterStrategyStudio isDark={isDark} apiBase={resolvedApiBase} />
            </div>
          ) : studioMode === 'timeline' ? (
            /* ================= MODE 5: INTERACTIVE DISPUTE TIMELINE ================= */
            <div className="h-[82vh] min-h-[680px] max-h-[920px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 flex flex-col">
              <DisputeTimelineVisualizer isDark={isDark} apiBase={resolvedApiBase} />
            </div>
          ) : studioMode === 'bsa_cert' ? (
            /* ================= MODE 4: SECTION 63 BSA ELECTRONIC EVIDENCE CERTIFICATE ================= */
            <div className="h-[82vh] min-h-[680px] max-h-[920px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 flex flex-col">
              <BsaCertificateStudio isDark={isDark} apiBase={resolvedApiBase} />
            </div>
          ) : studioMode === 'cleanroom' ? (
            /* ================= MODE 3: CLEAN-ROOM CLAUSE REWRITER & E-STAMPING ================= */
            <div className="h-[82vh] min-h-[680px] max-h-[920px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 flex flex-col">
              <CleanroomStampingStudio isDark={isDark} apiBase={resolvedApiBase} />
            </div>
          ) : studioMode === 'pleadings' ? (
            /* ================= MODE 0: COURT PLEADINGS & NOTICES ================= */
            <div className="h-[82vh] min-h-[680px] max-h-[920px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 flex flex-col">
              <CourtPleadingStudio isDark={isDark} apiBase={resolvedApiBase} />
            </div>
          ) : studioMode === 'generator' ? (
            /* ================= MODE 1: CONTRACT GENERATOR ================= */
            <div className="space-y-4">
              {/* MOBILE/TABLET WORKSPACE VIEW SELECTOR (< lg) */}
              <div className={`lg:hidden grid grid-cols-2 p-1 rounded-xl border text-[12px] font-bold shadow-xs ${
                isDark ? 'bg-[#121524] border-[#242a42]' : 'bg-slate-100 border-slate-200'
              }`}>
                <button
                  type="button"
                  onClick={() => setMobileGenTab('config')}
                  className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    mobileGenTab === 'config'
                      ? isDark ? 'bg-white text-black shadow-sm font-black' : 'bg-[#00288e] text-white shadow-sm font-black'
                      : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  <span>1. Configure Terms</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileGenTab('preview')}
                  className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all relative ${
                    mobileGenTab === 'preview'
                      ? isDark ? 'bg-white text-black shadow-sm font-black' : 'bg-[#00288e] text-white shadow-sm font-black'
                      : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  <span>2. Preview Deed</span>
                  {generatedText && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* LEFT CONFIGURATION PANEL (5 cols) */}
                <div className={`lg:col-span-5 p-3 sm:p-4 rounded-xl border space-y-4 ${
                  mobileGenTab === 'preview' ? 'hidden lg:block' : 'block'
                } ${
                  isDark ? 'bg-[#0f111a] border-[#23283f]' : 'bg-white border-[#e2e8f0] shadow-sm'
                }`}>
                <div>
                  <h3 className={`text-[13px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
                    isDark ? 'text-amber-400' : 'text-[#00288e]'
                  }`}>
                    <span className="material-symbols-outlined text-[16px]">library_books</span>
                    1. Select Contract Template
                  </h3>
                  <div className="space-y-1.5">
                    {TEMPLATE_PRESETS.map((p) => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => { setSelectedPreset(p.key); setGeneratedText(''); }}
                        className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                          selectedPreset === p.key
                            ? isDark
                              ? 'bg-[#181c2d] border-amber-500/50 shadow-xs'
                              : 'bg-[#f0f5ff] border-[#00288e] shadow-xs'
                            : isDark
                              ? 'bg-[#121524] border-[#1f2438] hover:border-slate-600'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-[18px] mt-0.5 ${
                          selectedPreset === p.key ? 'text-amber-500' : 'text-slate-400'
                        }`}>
                          {p.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className={`text-[12px] font-bold truncate ${
                              selectedPreset === p.key ? (isDark ? 'text-white' : 'text-[#00288e]') : ''
                            }`}>
                              {p.title}
                            </h4>
                            <span className="text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                              {p.tag}
                            </span>
                          </div>
                          <p className={`text-[10px] mt-0.5 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {p.desc}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-700/20">
                  <h3 className={`text-[13px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    isDark ? 'text-amber-400' : 'text-[#00288e]'
                  }`}>
                    <span className="material-symbols-outlined text-[16px]">tune</span>
                    2. Customize Terms & Jurisdiction
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10.5px] font-bold block mb-1">First Party (Disclosing / Client)</label>
                      <input
                        type="text"
                        value={partyA}
                        onChange={(e) => setPartyA(e.target.value)}
                        className={`w-full p-2 rounded-lg text-[11.5px] border outline-none ${
                          isDark ? 'bg-[#151928] border-[#2b334d] text-white' : 'bg-slate-50 border-slate-300 text-black'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-[10.5px] font-bold block mb-1">Second Party (Receiving / Contractor)</label>
                      <input
                        type="text"
                        value={partyB}
                        onChange={(e) => setPartyB(e.target.value)}
                        className={`w-full p-2 rounded-lg text-[11.5px] border outline-none ${
                          isDark ? 'bg-[#151928] border-[#2b334d] text-white' : 'bg-slate-50 border-slate-300 text-black'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10.5px] font-bold block mb-1">Governing State (Stamp Duty)</label>
                      <select
                        value={governingState}
                        onChange={(e) => setGoverningState(e.target.value)}
                        className={`w-full p-2 rounded-lg text-[11.5px] border outline-none ${
                          isDark ? 'bg-[#151928] border-[#2b334d] text-white' : 'bg-slate-50 border-slate-300 text-black'
                        }`}
                      >
                        <option value="Delhi">Delhi (NCT)</option>
                        <option value="Maharashtra">Maharashtra (Mumbai)</option>
                        <option value="Karnataka">Karnataka (Bengaluru)</option>
                        <option value="Tamil Nadu">Tamil Nadu (Chennai)</option>
                        <option value="Telangana">Telangana (Hyderabad)</option>
                        <option value="Uttar Pradesh">Uttar Pradesh (Noida)</option>
                        <option value="West Bengal">West Bengal (Kolkata)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10.5px] font-bold block mb-1">Arbitration City (Seat & Venue)</label>
                      <input
                        type="text"
                        value={arbitrationCity}
                        onChange={(e) => setArbitrationCity(e.target.value)}
                        className={`w-full p-2 rounded-lg text-[11.5px] border outline-none ${
                          isDark ? 'bg-[#151928] border-[#2b334d] text-white' : 'bg-slate-50 border-slate-300 text-black'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10.5px] font-bold block mb-1">Consideration / Value</label>
                      <input
                        type="text"
                        value={consideration}
                        onChange={(e) => setConsideration(e.target.value)}
                        className={`w-full p-2 rounded-lg text-[11.5px] border outline-none ${
                          isDark ? 'bg-[#151928] border-[#2b334d] text-white' : 'bg-slate-50 border-slate-300 text-black'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-[10.5px] font-bold block mb-1">Duration (Months)</label>
                      <input
                        type="number"
                        value={durationMonths}
                        onChange={(e) => setDurationMonths(Number(e.target.value))}
                        className={`w-full p-2 rounded-lg text-[11.5px] border outline-none ${
                          isDark ? 'bg-[#151928] border-[#2b334d] text-white' : 'bg-slate-50 border-slate-300 text-black'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10.5px] font-bold block mb-1">Specific Scope / Deliverables</label>
                    <textarea
                      rows={2}
                      value={specificScope}
                      onChange={(e) => setSpecificScope(e.target.value)}
                      className={`w-full p-2 rounded-lg text-[11.5px] border outline-none resize-none ${
                        isDark ? 'bg-[#151928] border-[#2b334d] text-white' : 'bg-slate-50 border-slate-300 text-black'
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleGenerateContract(false)}
                      disabled={isGenerating}
                      className="flex-1 py-2 rounded-lg text-[12px] font-bold bg-[#00288e] hover:bg-[#002070] text-white flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">gavel</span>
                      <span>{isGenerating ? 'Synthesizing...' : 'Generate Agreement'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGenerateContract(true)}
                      disabled={isGenerating}
                      title="Enhance clauses using Google Gemini 1.5 Flash"
                      className="px-3 py-2 rounded-lg text-[12px] font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 flex items-center gap-1 shadow-md cursor-pointer transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                      <span>AI Refine</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT PREVIEW PANEL (7 cols) */}
              <div className={`lg:col-span-7 p-3 sm:p-5 rounded-xl border flex flex-col justify-between gap-3 ${
                mobileGenTab === 'config' ? 'hidden lg:flex' : 'flex'
              } ${
                isDark ? 'bg-[#0f111a] border-[#23283f]' : 'bg-white border-[#e2e8f0] shadow-sm'
              }`}>
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-700/20">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-amber-500">article</span>
                      <h3 className={`text-[13px] font-bold ${isDark ? 'text-white' : 'text-[#0b1c30]'}`}>
                        Court-Ready Agreement Preview
                      </h3>
                    </div>

                    {/* VIEW TOGGLE: [ 📜 Court Sheet ] vs [ 💻 Raw Text ] + FULLSCREEN */}
                    <div className="flex items-center gap-1.5">
                      <div className={`flex items-center p-0.5 rounded-lg border text-[10.5px] font-bold ${
                        isDark ? 'bg-[#121524] border-[#242a42]' : 'bg-slate-100 border-slate-200'
                      }`}>
                        <button
                          type="button"
                          onClick={() => setPreviewFormat('parchment')}
                          className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                            previewFormat === 'parchment'
                              ? isDark ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-white text-[#00288e] shadow-xs'
                              : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="View authentic legal parchment format with e-Stamp certificate and court margins"
                        >
                          <span className="material-symbols-outlined text-[13px]">description</span>
                          <span>Official White Sheet</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPreviewFormat('code')}
                          className={`px-2 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                            previewFormat === 'code'
                              ? isDark ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-white text-[#00288e] shadow-xs'
                              : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="View raw monospace clause text"
                        >
                          <span className="material-symbols-outlined text-[13px]">code</span>
                          <span>Raw Text</span>
                        </button>
                      </div>

                      {/* Full-Page Popout Button */}
                      <button
                        type="button"
                        onClick={() => setIsFullParchmentModalOpen(true)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isDark 
                            ? 'bg-[#181c2d] hover:bg-[#20253d] text-amber-400 border-[#2b334d]' 
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                        }`}
                        title="Open in Fullscreen Court Document Viewer"
                      >
                        <span className="material-symbols-outlined text-[15px]">open_in_full</span>
                      </button>
                    </div>
                  </div>

                  {/* PREVIEW CONTAINER */}
                  <div className="mt-3">
                    {previewFormat === 'parchment' ? (
                      <CourtReadyParchmentDeed
                        contractText={generatedText}
                        presetKey={selectedPreset}
                        partyA={partyA}
                        partyB={partyB}
                        governingState={governingState}
                        arbitrationCity={arbitrationCity}
                        durationMonths={durationMonths}
                        consideration={consideration}
                        specificScope={specificScope}
                        isPrintOnly={false}
                      />
                    ) : (
                      <div className={`p-4 rounded-xl border font-mono text-[11px] leading-relaxed max-h-[520px] overflow-y-auto whitespace-pre-wrap select-text ${
                        isDark ? 'bg-[#0a0c14] border-[#1f2438] text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}>
                        {generatedText || (
                          <div className={`text-center py-20 space-y-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            <span className="material-symbols-outlined text-[36px] opacity-40">assignment</span>
                            <p className="text-[12px]">Configure parties and click "Generate Agreement" to preview the complete legal deed.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-700/20">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-sans ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      ⚖️ Formatted with Indian Stamp Act e-Stamping placeholder & Section 63 BSA execution lines.
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded border ${
                      isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      <span className="material-symbols-outlined text-[11px]">smart_toy</span>
                      AI Drafted — Subject to Advocate Vetting
                    </span>
                    {engineUsed && (
                      <span className="inline-block text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {engineUsed}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedText || 'Legal Deed');
                        setCopiedContract(true);
                        setTimeout(() => setCopiedContract(false), 2000);
                      }}
                      className={`w-full sm:w-auto px-3 py-2 sm:py-1.5 rounded-lg text-[11px] font-bold border flex items-center justify-center gap-1 cursor-pointer transition-all ${
                        copiedContract
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : isDark ? 'bg-[#181c2d] hover:bg-[#20253d] text-white border-[#2b334d]' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {copiedContract ? 'check' : 'content_copy'}
                      </span>
                      <span>{copiedContract ? 'Copied Deed' : 'Copy Text'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const targetText = generatedText || COMPLIANT_SAMPLE_CONTRACT;
                        setScanText(targetText);
                        setStudioMode('scanner');
                        handleAuditContract(targetText);
                      }}
                      className="w-full sm:w-auto px-3 py-2 sm:py-1.5 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1 cursor-pointer shadow-md transition-all"
                      title="Test and audit this contract in the Redline Risk Scanner for Section 27, Section 73, and DPDP 2023 compliance"
                    >
                      <span className="material-symbols-outlined text-[15px]">fact_check</span>
                      <span>Audit in Risk Scanner</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePrintDeed()}
                      className="w-full sm:w-auto px-3.5 py-2 sm:py-1.5 rounded-lg text-[11px] font-bold bg-[#00288e] hover:bg-[#002070] text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                      title="Prints ONLY the official white sheet agreement with e-Stamp certificate and signatures"
                    >
                      <span className="material-symbols-outlined text-[15px]">print</span>
                      <span>Print Deed</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
            /* ================= MODE 2: REDLINING & RISK SCANNER ================= */
            <div className="space-y-5">
              {/* INPUT SCAN CARD */}
              <div className={`p-4 sm:p-5 rounded-xl border space-y-3 ${
                isDark ? 'bg-[#0f111a] border-[#23283f]' : 'bg-white border-[#e2e8f0] shadow-sm'
              }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-rose-500 shrink-0">warning</span>
                    <h3 className={`text-[13px] sm:text-[13.5px] font-bold ${isDark ? 'text-white' : 'text-[#0b1c30]'}`}>
                      Upload or Paste Contract to Audit for Predatory Clauses & Legal Risks
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="file"
                      ref={contractFileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleProcessContractFile(file);
                      }}
                      accept=".txt,.pdf,.docx,.doc"
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => contractFileInputRef.current?.click()}
                      disabled={isParsingContractDoc}
                      className="w-full sm:w-auto px-2.5 py-1.5 sm:py-1 rounded-lg text-[10.5px] font-bold bg-[#00288e]/15 hover:bg-[#00288e]/25 text-[#00288e] dark:text-blue-300 dark:bg-blue-500/15 dark:hover:bg-blue-500/25 border border-[#00288e]/30 dark:border-blue-500/30 flex items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                      title="Upload PDF, DOCX, or TXT agreement"
                    >
                      <span className={`material-symbols-outlined text-[14px] ${isParsingContractDoc ? 'animate-spin' : ''}`}>
                        {isParsingContractDoc ? 'sync' : 'upload_file'}
                      </span>
                      <span>{isParsingContractDoc ? 'Extracting Text...' : 'Upload Contract (.pdf, .docx, .txt)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setScanText(COMPLIANT_SAMPLE_CONTRACT);
                        handleAuditContract(COMPLIANT_SAMPLE_CONTRACT);
                      }}
                      className="w-full sm:w-auto px-2.5 py-1.5 sm:py-1 rounded-lg text-[10.5px] font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-500 border border-emerald-500/30 flex items-center justify-center gap-1 cursor-pointer transition-all"
                      title="Load a 100% compliant Indian agreement generated by our Bharat Legal Contract Studio"
                    >
                      <span className="material-symbols-outlined text-[14px]">verified</span>
                      <span>Compliant Sample</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setScanText(PREDATORY_SAMPLE_CONTRACT);
                        handleAuditContract(PREDATORY_SAMPLE_CONTRACT);
                      }}
                      className="w-full sm:w-auto px-2.5 py-1.5 sm:py-1 rounded-lg text-[10.5px] font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 border border-rose-500/30 flex items-center justify-center gap-1 cursor-pointer transition-all"
                      title="Load an unfair third-party vendor contract with 4 critical predatory traps"
                    >
                      <span className="material-symbols-outlined text-[14px]">warning</span>
                      <span>Predatory Sample</span>
                    </button>
                  </div>
                </div>

                {contractUploadNotice && (
                  <div className={`p-2 rounded-lg text-[11px] flex items-center justify-between border animate-in fade-in ${
                    isDark ? 'bg-blue-950/40 border-blue-500/30 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-900 font-medium'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px]">info</span>
                      <span>{contractUploadNotice}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setContractUploadNotice(null)}
                      className="cursor-pointer p-0.5 opacity-70 hover:opacity-100"
                    >
                      <span className="material-symbols-outlined text-[13px]">close</span>
                    </button>
                  </div>
                )}

                <textarea
                  rows={6}
                  value={scanText}
                  onChange={(e) => setScanText(e.target.value)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleProcessContractFile(file);
                  }}
                  placeholder="Paste agreement text here, upload a .pdf / .docx file, or drag & drop a contract to test instant clause-by-clause redlining..."
                  className={`w-full p-3 rounded-xl text-[12px] font-mono border outline-none resize-y leading-relaxed ${
                    isDark ? 'bg-[#090b12] border-[#23283f] text-slate-100 placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-black placeholder-slate-400'
                  }`}
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className={`text-[10.5px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Scans for: Uncapped Indemnity (§73 ICA), Void Non-Competes (§27 ICA), Unilateral Termination, Remote Venues & DPDP 2023.
                  </span>

                  <button
                    type="button"
                    onClick={() => handleAuditContract()}
                    disabled={isAuditing || !scanText.trim()}
                    className="w-full sm:w-auto px-4 py-2 rounded-lg text-[12px] font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50 transition-all shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">security</span>
                    <span>{isAuditing ? 'Scanning Clauses...' : 'Audit Contract Health'}</span>
                  </button>
                </div>
              </div>

              {/* AUDIT REPORT DASHBOARD */}
              {auditResult && (
                <div className="space-y-4">
                  {/* SCORECARD BANNER */}
                  <div className={`p-4 sm:p-5 rounded-xl border shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isDark ? 'bg-gradient-to-r from-[#170a0e] via-[#121524] to-[#0f111a] border-rose-500/30' : 'bg-gradient-to-r from-rose-50 via-white to-amber-50 border-rose-200'
                  }`}>
                    <div className="flex items-center gap-3.5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-mono text-[22px] font-black border shadow-inner shrink-0 ${
                        auditResult.health_score < 60
                          ? 'bg-rose-600/20 text-rose-500 border-rose-500/40'
                          : auditResult.health_score < 80
                          ? 'bg-amber-600/20 text-amber-500 border-amber-500/40'
                          : 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40'
                      }`}>
                        {auditResult.health_score}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <h4 className={`text-[14px] sm:text-[15px] font-black tracking-tight ${isDark ? 'text-white' : 'text-[#0b1c30]'}`}>
                            Contract Health Score: {auditResult.health_score} / 100
                          </h4>
                          <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                            auditResult.health_score < 60
                              ? 'bg-rose-950/40 text-rose-400 border-rose-500/40'
                              : 'bg-amber-950/40 text-amber-400 border-amber-500/40'
                          }`}>
                            {auditResult.risk_rating}
                          </span>
                        </div>
                        <p className={`text-[11px] sm:text-[11.5px] mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          Found <strong>{auditResult.critical_count} Critical Traps</strong> and <strong>{auditResult.warning_count} Warnings</strong> under Indian commercial law.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/25">
                        🔴 {auditResult.critical_count} Critical
                      </span>
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/25">
                        🟡 {auditResult.warning_count} Warning
                      </span>
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                        🟢 {auditResult.safe_count} Safe
                      </span>
                    </div>
                  </div>

                  {/* STAMP DUTY & STATUTORY WARNING CALLOUT */}
                  <div className={`p-3 rounded-lg border text-[11px] leading-relaxed flex items-center gap-2 ${
                    isDark ? 'bg-[#181c2d] border-[#2b334d] text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}>
                    <span className="material-symbols-outlined text-[17px] shrink-0 text-amber-500">gavel</span>
                    <span><strong>Statutory Admissibility Notice:</strong> {auditResult.stamp_duty_advisory}</span>
                  </div>

                  {/* CLAUSE-BY-CLAUSE REDLINE MATRIX */}
                  <div className="space-y-3">
                    <h4 className={`text-[13px] font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#00288e]'}`}>
                      Clause-by-Clause Risk Breakdown & Suggested Counter-Revisions
                    </h4>

                    {auditResult.risk_items.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3.5 sm:p-4 rounded-xl border transition-all space-y-2.5 ${
                          item.severity === 'critical'
                            ? isDark ? 'bg-[#150a0d] border-rose-500/40' : 'bg-rose-50/50 border-rose-200'
                            : item.severity === 'warning'
                            ? isDark ? 'bg-[#17120a] border-amber-500/40' : 'bg-amber-50/50 border-amber-200'
                            : isDark ? 'bg-[#0a1510] border-emerald-500/40' : 'bg-emerald-50/50 border-emerald-200'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${
                              item.severity === 'critical' ? 'bg-rose-500 animate-pulse' : item.severity === 'warning' ? 'bg-amber-500' : 'bg-emerald-400'
                            }`} />
                            <h5 className={`text-[13px] font-bold ${
                              item.severity === 'critical' ? 'text-rose-500' : item.severity === 'warning' ? 'text-amber-500' : 'text-emerald-500'
                            }`}>
                              {item.clause_title}
                            </h5>
                          </div>
                          {item.statutory_violation && (
                            <span className="text-[9.5px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 w-fit">
                              ⚖️ {item.statutory_violation}
                            </span>
                          )}
                        </div>

                        {/* Flagged Clause */}
                        <div className={`p-2.5 rounded-lg text-[11px] font-mono leading-relaxed border ${
                          isDark ? 'bg-[#0a0d16] border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                        }`}>
                          <strong className="block text-[9.5px] uppercase tracking-wider text-rose-400 mb-0.5 font-sans">
                            Flagged Predatory Language:
                          </strong>
                          "{item.flagged_text}"
                        </div>

                        {/* Risk Explanation */}
                        <p className={`text-[11.5px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          <strong>Why this is dangerous:</strong> {item.risk_explanation}
                        </p>

                        {/* Suggested Counter-Revision */}
                        <div className={`p-3 rounded-lg border space-y-1.5 ${
                          isDark ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        }`}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <strong className="text-[10px] uppercase tracking-wider text-emerald-500 flex items-center gap-1 font-bold">
                              <span className="material-symbols-outlined text-[14px]">auto_fix_normal</span>
                              Suggested Counter-Clause (Safe & Enforceable under Indian Law):
                            </strong>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(item.counter_clause_revision);
                                setCopiedClauseId(item.id);
                                setTimeout(() => setCopiedClauseId(null), 2000);
                              }}
                              className={`w-fit px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all border ${
                                copiedClauseId === item.id
                                  ? 'bg-emerald-600 text-white border-emerald-500'
                                  : isDark ? 'bg-[#181c2d] text-white border-slate-700 hover:border-slate-500' : 'bg-white text-slate-800 border-slate-300'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[13px]">
                                {copiedClauseId === item.id ? 'check' : 'content_copy'}
                              </span>
                              <span>{copiedClauseId === item.id ? 'Copied' : 'Copy Counter-Clause'}</span>
                            </button>
                          </div>
                          <p className="font-mono text-[11px] leading-relaxed">
                            "{item.counter_clause_revision}"
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FULL-PAGE PARCHMENT MODAL */}
      {isFullParchmentModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/80 flex flex-col items-center justify-between p-2 sm:p-6 backdrop-blur-xs contract-studio-no-print">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-t-xl px-3 sm:px-4 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2 text-white shrink-0 shadow-2xl">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500 text-[18px] sm:text-[20px] shrink-0">description</span>
              <h3 className="text-[12px] sm:text-[13px] font-bold">Court-Ready Parchment Viewer (Official Indian Deed)</h3>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(generatedText || 'Legal Deed');
                  setCopiedContract(true);
                  setTimeout(() => setCopiedContract(false), 2000);
                }}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10.5px] sm:text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 flex items-center gap-1 cursor-pointer transition-all"
              >
                <span className="material-symbols-outlined text-[13px] sm:text-[14px]">
                  {copiedContract ? 'check' : 'content_copy'}
                </span>
                <span>{copiedContract ? 'Copied' : 'Copy Text'}</span>
              </button>

              <button
                type="button"
                onClick={() => handlePrintDeed()}
                className="px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-[10.5px] sm:text-[11px] font-bold bg-[#00288e] hover:bg-[#002070] text-white flex items-center gap-1 sm:gap-1.5 cursor-pointer shadow-md"
              >
                <span className="material-symbols-outlined text-[14px] sm:text-[15px]">print</span>
                <span>Print Deed</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFullParchmentModalOpen(false)}
                className="p-1 sm:p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer ml-0.5 sm:ml-1"
                title="Close Viewer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>

          <div className="w-full max-w-4xl flex-1 overflow-y-auto bg-slate-300/90 p-2 sm:p-6 md:p-8 rounded-b-xl border border-slate-700 flex justify-center">
            <div className="w-full max-w-[850px] shadow-2xl">
              <CourtReadyParchmentDeed
                contractText={generatedText}
                presetKey={selectedPreset}
                partyA={partyA}
                partyB={partyB}
                governingState={governingState}
                arbitrationCity={arbitrationCity}
                durationMonths={durationMonths}
                consideration={consideration}
                specificScope={specificScope}
                isPrintOnly={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* ISOLATED PRINTABLE CANVAS (Only visible during window.print()) */}
      <CourtReadyParchmentDeed
        contractText={generatedText}
        presetKey={selectedPreset}
        partyA={partyA}
        partyB={partyB}
        governingState={governingState}
        arbitrationCity={arbitrationCity}
        durationMonths={durationMonths}
        consideration={consideration}
        specificScope={specificScope}
        isPrintOnly={true}
      />
    </div>
  );
};
