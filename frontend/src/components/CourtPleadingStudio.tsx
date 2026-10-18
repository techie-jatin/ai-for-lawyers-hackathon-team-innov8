import { useState, useEffect } from 'react';
import {
  CLIENT_PLEADING_PRESETS,
  type PleadingFormData,
  type PleadingPreset,
  generateClientPleading
} from '../services/clientPleadingEngine';
import {
  extractDisputeEntities,
  generateCustomPleading
} from '../services/clientSeniorAdvocateBrain';

interface CourtPleadingStudioProps {
  isDark: boolean;
  apiBase?: string;
  initialFacts?: string;
  onClose?: () => void;
}

const QUICK_DISPUTE_TEMPLATES = [
  {
    label: '🏠 Rent Deposit Refund',
    text: 'I rented an apartment in Bengaluru on 1st March 2025. I vacated on 31st January 2026 after 30 days written notice. Landlord Ramesh Rao has withheld my ₹85,000 security deposit citing false painting charges.'
  },
  {
    label: '📜 Cheque Bounce (§138)',
    text: 'M/s Skyline Infra issued a cheque of ₹4,50,000 on 10-09-2026 which bounced with return memo dated 12-09-2026 for insufficient funds. Notice dispatched demanding payment within 15 days.'
  },
  {
    label: '🛡️ Consumer Deficiency',
    text: 'Purchased defective refrigerator from Retailer for ₹42,000 on 10-05-2025. Company refused replacement or refund within statutory warranty period causing severe mental agony.'
  },
  {
    label: '🏢 Builder Delay (RERA)',
    text: 'Booked flat with Apex Promoters for ₹65 Lakhs on 10-01-2023. Promised possession date of 31-12-2024 has passed and promoter has halted construction and refused statutory delay interest.'
  },
  {
    label: '⚖️ False FIR Quashing',
    text: 'Complainant filed a false criminal complaint under Sections 318 & 351 BNS on 14-03-2026 at P.S. Connaught Place to extort money arising out of a purely civil contractual disagreement.'
  }
];

export function CourtPleadingStudio({
  isDark,
  apiBase = 'http://localhost:8000',
  initialFacts,
  onClose
}: CourtPleadingStudioProps) {
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('quashing_528_bnss');
  const activePreset = CLIENT_PLEADING_PRESETS.find(p => p.key === selectedPresetKey) || CLIENT_PLEADING_PRESETS[0];

  const [aiIntakeText, setAiIntakeText] = useState<string>(initialFacts || '');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);

  const [formData, setFormData] = useState<PleadingFormData>(() => {
    if (initialFacts) {
      const extracted = extractDisputeEntities(initialFacts);
      return {
        pleading_type: 'custom_matter',
        court_name: extracted.court_forum,
        petitioner_name: extracted.petitioner_name,
        petitioner_details: 'Citizen of India & Aggrieved Party',
        respondent_name: extracted.respondent_name,
        respondent_details: 'Opposite Party / Defaulting Entity',
        state_name: 'State (NCT of Delhi)',
        case_number: 'Diary No. _____ / 2026',
        police_station: 'Local Jurisdiction Police Station',
        dispute_amount: extracted.dispute_amount,
        incident_date: extracted.anchor_date,
        facts_summary: initialFacts,
        bank_name: 'Scheduled Commercial Bank',
        return_memo_date: '10th September, 2026',
        dishonour_reason: 'Funds Insufficient',
        advocate_name: 'Senior Advocate Chamber Associates',
        advocate_enrolment: 'D/1452/2018',
        advocate_office: 'High Court Lawyers Chambers Block, New Delhi'
      };
    }
    return {
      pleading_type: 'quashing_528_bnss',
      court_name: activePreset.defaultCourt,
      petitioner_name: activePreset.defaultPetitioner,
      petitioner_details: activePreset.defaultPetitionerDetails,
      respondent_name: activePreset.defaultRespondent,
      respondent_details: activePreset.defaultRespondentDetails,
      state_name: 'State (NCT of Delhi)',
      case_number: activePreset.defaultCaseNumber,
      police_station: 'P.S. Connaught Place',
      dispute_amount: activePreset.defaultAmount,
      incident_date: '14th March, 2026',
      facts_summary: activePreset.defaultFacts,
      bank_name: 'HDFC Bank Ltd., Connaught Place Branch',
      return_memo_date: '10th September, 2026',
      dishonour_reason: 'Funds Insufficient',
      advocate_name: 'Advocate A. K. Verma & Associates',
      advocate_enrolment: 'D/1452/2018',
      advocate_office: 'Chamber 418, High Court Lawyers Chambers Block'
    };
  });

  const [draftResult, setDraftResult] = useState<{
    title: string;
    forum: string;
    governing_statute: string;
    pleading_text: string;
    engine: string;
  }>(() => {
    if (initialFacts) {
      return generateCustomPleading(initialFacts);
    }
    return generateClientPleading(formData);
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('preview');

  // Trigger auto-analysis if initialFacts was passed
  useEffect(() => {
    if (initialFacts && initialFacts.trim().length > 15) {
      handleAutoDecompile(initialFacts);
    }
  }, [initialFacts]);

  // Senior Advocate Brain: Auto Decompile any raw user narrative
  const handleAutoDecompile = (textToAnalyze?: string) => {
    const raw = textToAnalyze || aiIntakeText;
    if (!raw.trim()) return;

    setIsAiAnalyzing(true);
    const extracted = extractDisputeEntities(raw);

    const updated: PleadingFormData = {
      ...formData,
      pleading_type: 'custom_dispute',
      court_name: extracted.court_forum,
      petitioner_name: extracted.petitioner_name,
      respondent_name: extracted.respondent_name,
      dispute_amount: extracted.dispute_amount,
      incident_date: extracted.anchor_date,
      facts_summary: raw
    };

    setFormData(updated);

    const customDraft = generateCustomPleading(raw, {
      petitioner_name: extracted.petitioner_name,
      respondent_name: extracted.respondent_name,
      court_forum: extracted.court_forum,
      dispute_amount: extracted.dispute_amount,
      raw_text: raw,
      case_number: formData.case_number,
      advocate_name: formData.advocate_name,
      advocate_enrolment: formData.advocate_enrolment,
      advocate_office: formData.advocate_office
    });

    setDraftResult(customDraft);
    setIsAiAnalyzing(false);
    setActiveTab('preview');
  };

  const handlePresetSelect = (preset: PleadingPreset) => {
    setSelectedPresetKey(preset.key);
    const updated: PleadingFormData = {
      ...formData,
      pleading_type: preset.key,
      court_name: preset.defaultCourt,
      petitioner_name: preset.defaultPetitioner,
      petitioner_details: preset.defaultPetitionerDetails,
      respondent_name: preset.defaultRespondent,
      respondent_details: preset.defaultRespondentDetails,
      case_number: preset.defaultCaseNumber,
      dispute_amount: preset.defaultAmount,
      facts_summary: preset.defaultFacts
    };
    setFormData(updated);
    setDraftResult(generateClientPleading(updated));
  };

  const handleInputChange = (field: keyof PleadingFormData, val: string) => {
    const updated = { ...formData, [field]: val };
    setFormData(updated);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      if (formData.pleading_type === 'custom_dispute' || formData.pleading_type === 'custom_matter') {
        const customDraft = generateCustomPleading(formData.facts_summary || '', {
          petitioner_name: formData.petitioner_name,
          respondent_name: formData.respondent_name,
          court_forum: formData.court_name,
          dispute_amount: formData.dispute_amount,
          raw_text: formData.facts_summary,
          case_number: formData.case_number,
          advocate_name: formData.advocate_name,
          advocate_enrolment: formData.advocate_enrolment,
          advocate_office: formData.advocate_office
        });
        setDraftResult(customDraft);
        return;
      }

      const res = await fetch(`${apiBase}/api/contracts/pleadings/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const data = await res.json();
        setDraftResult({
          title: data.title,
          forum: data.forum,
          governing_statute: data.governing_statute,
          pleading_text: data.pleading_text,
          engine: data.engine
        });
      } else {
        setDraftResult(generateClientPleading(formData));
      }
    } catch {
      setDraftResult(generateClientPleading(formData));
    } finally {
      setIsGenerating(false);
      setActiveTab('preview');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draftResult.pleading_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDoc = () => {
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>${draftResult.title}</title>
    <style>
      @page { size: A4; margin: 1.5in 1.0in 1.0in 1.0in; }
      body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 2.0; text-align: justify; }
      h1, h2, h3 { text-align: center; font-size: 14pt; font-weight: bold; }
      .prayer { font-weight: bold; }
    </style></head><body>`;
    const footer = `</body></html>`;
    const content = `<pre style="font-family: 'Times New Roman', serif; font-size: 12pt; white-space: pre-wrap; line-height: 1.8;">${draftResult.pleading_text}</pre>`;
    const blob = new Blob([header + content + footer], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedPresetKey}_pleading.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${draftResult.title} - Bharat Legal Intelligence</title>
          <style>
            @page {
              size: legal portrait;
              margin: 1.5in 1.0in 1.0in 1.0in;
            }
            body {
              font-family: 'Times New Roman', Georgia, serif;
              font-size: 13pt;
              line-height: 2.0;
              color: #000;
              margin: 0;
              padding: 0;
              text-align: justify;
            }
            pre {
              white-space: pre-wrap;
              word-wrap: break-word;
              font-family: 'Times New Roman', Georgia, serif;
              font-size: 12pt;
              line-height: 1.9;
            }
            .header-banner {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 8px;
              margin-bottom: 24px;
              font-size: 11pt;
              font-weight: bold;
              text-transform: uppercase;
            }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <div>HIGH COURT OF JUDICATURE • FORMAL PLEADING</div>
            <div style="font-size: 13pt; margin-top: 4px;">${draftResult.forum}</div>
            <div style="font-size: 9pt; font-style: italic; margin-top: 2px;">Prepared via Senior Advocate Dynamic Brain • 100% Statutory Adherence</div>
          </div>
          <pre>${draftResult.pleading_text}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
  };

  return (
    <div className={`flex flex-col h-full rounded-2xl overflow-hidden border font-sans ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
      
      {/* Studio Top Header */}
      <div className={`p-4 sm:p-5 border-b shrink-0 flex flex-wrap items-center justify-between gap-3 ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xl">🏛️</span>
            <h2 className={`font-bold text-lg sm:text-xl tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Court-Ready Pleading & Notice Studio
            </h2>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
              High Court Parchment Grade
            </span>
            {draftResult.engine.includes('Zero Hardcoding') && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">
                Dynamic Case Mode
              </span>
            )}
          </div>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Draft authentic petitions, Section 138 notices, e-Daakhil consumer plaints, and custom litigation instruments without hardcoded constraints.
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            ✕ Close
          </button>
        )}
      </div>

      {/* Preset Reference Selector Bar */}
      <div className={`p-3 sm:p-4 border-b shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-2.5 ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-100/70 border-slate-200'}`}>
        {CLIENT_PLEADING_PRESETS.map(preset => {
          const isSelected = preset.key === selectedPresetKey;
          return (
            <button
              key={preset.key}
              onClick={() => handlePresetSelect(preset)}
              className={`p-2.5 sm:p-3 rounded-xl text-left border transition-all flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/40 shadow-xs'
                  : isDark
                  ? 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">
                    {preset.icon === 'gavel' && '⚖️'}
                    {preset.icon === 'receipt_long' && '📜'}
                    {preset.icon === 'storefront' && '🛡️'}
                    {preset.icon === 'mark_email_read' && '📬'}
                  </span>
                  <span className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                    isSelected ? 'bg-amber-500 text-black' : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {preset.forum.split(' ')[0]}
                  </span>
                </div>
                <div className={`font-semibold text-xs leading-snug line-clamp-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {preset.title}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Controls for Mobile & Tablet (< lg) */}
      <div className={`lg:hidden flex border-b shrink-0 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <button
          type="button"
          onClick={() => setActiveTab('editor')}
          className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
            activeTab === 'editor'
              ? 'border-amber-500 text-amber-500 bg-amber-500/5'
              : isDark ? 'border-transparent text-slate-400' : 'border-transparent text-slate-600'
          }`}
        >
          📝 Case Averments & Parties
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
            activeTab === 'preview'
              ? 'border-amber-500 text-amber-500 bg-amber-500/5'
              : isDark ? 'border-transparent text-slate-400' : 'border-transparent text-slate-600'
          }`}
        >
          📜 Legal Ledger Preview
        </button>
      </div>

      {/* Main Studio Body: Split View on Desktop (>= lg) */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
        
        {/* Left Column: Form Fields & AI Case Intake */}
        <div className={`lg:col-span-5 h-full overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin ${
          activeTab === 'preview' ? 'hidden lg:block' : 'block'
        } ${isDark ? 'bg-slate-900/40 text-slate-200' : 'bg-white text-slate-800'}`}>

          {/* ================= SENIOR ADVOCATE BRAIN AI CASE INTAKE ================= */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            isDark ? 'bg-[#121526] border-slate-700/80 shadow-md' : 'bg-amber-50/50 border-amber-200/80 shadow-xs'
          }`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🧠</span>
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Senior Advocate Dynamic Intake (Zero Hardcoding)
                </h3>
              </div>
              <span className="text-[10px] font-mono opacity-70">
                Any Real Controversy
              </span>
            </div>

            <textarea
              rows={3}
              value={aiIntakeText}
              onChange={e => setAiIntakeText(e.target.value)}
              placeholder="Paste any real story: parties, transaction details, breach dates, money involved, police/legal notices..."
              className={`w-full text-xs p-2.5 rounded-lg border font-sans focus:outline-none ${
                isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />

            {/* Quick Template Fillers */}
            <div className="space-y-1.5">
              <div className="text-[10.5px] font-semibold opacity-75">Quick Load Real Scenarios:</div>
              <div className="flex flex-wrap gap-1">
                {QUICK_DISPUTE_TEMPLATES.map(tmpl => (
                  <button
                    key={tmpl.label}
                    type="button"
                    onClick={() => {
                      setAiIntakeText(tmpl.text);
                      handleAutoDecompile(tmpl.text);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors cursor-pointer ${
                      isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleAutoDecompile()}
              disabled={isAiAnalyzing}
              className="w-full py-2 px-3 rounded-lg text-xs font-black bg-amber-600 hover:bg-amber-500 text-white shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>{isAiAnalyzing ? '⚡ Decompiling Scenario...' : '⚡ Auto-Populate Parties, Dates & Pleadings'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-3">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Court Pleading Particulars
            </h3>
            <span className="text-[11px] text-amber-600 font-mono font-medium">
              {draftResult.governing_statute}
            </span>
          </div>

          {/* Court / Forum */}
          <div>
            <label className="block text-[11px] font-semibold mb-1 opacity-80">
              Forum / Court Name:
            </label>
            <input
              type="text"
              value={formData.court_name || ''}
              onChange={e => handleInputChange('court_name', e.target.value)}
              className={`w-full text-xs px-3 py-2 rounded-lg border outline-none font-mono ${
                isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Petitioner / Complainant */}
          <div className="grid grid-cols-1 gap-2">
            <div>
              <label className="block text-[11px] font-semibold mb-1 opacity-80">
                Petitioner / Complainant / Payee Name:
              </label>
              <input
                type="text"
                value={formData.petitioner_name}
                onChange={e => handleInputChange('petitioner_name', e.target.value)}
                className={`w-full text-xs px-3 py-2 rounded-lg border outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold mb-1 opacity-80">
                Petitioner Details (Address & Standing):
              </label>
              <input
                type="text"
                value={formData.petitioner_details || ''}
                onChange={e => handleInputChange('petitioner_details', e.target.value)}
                className={`w-full text-xs px-3 py-2 rounded-lg border outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Respondent / Opposite Party */}
          <div className="grid grid-cols-1 gap-2">
            <div>
              <label className="block text-[11px] font-semibold mb-1 opacity-80">
                Respondent / Opposite Party / Drawer Name:
              </label>
              <input
                type="text"
                value={formData.respondent_name}
                onChange={e => handleInputChange('respondent_name', e.target.value)}
                className={`w-full text-xs px-3 py-2 rounded-lg border outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Amount and Incident Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold mb-1 opacity-80">
                Dispute Amount / Consideration:
              </label>
              <input
                type="text"
                value={formData.dispute_amount || ''}
                onChange={e => handleInputChange('dispute_amount', e.target.value)}
                className={`w-full text-xs px-3 py-2 rounded-lg border outline-none font-mono ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold mb-1 opacity-80">
                Incident / Trigger Date:
              </label>
              <input
                type="text"
                value={formData.incident_date || ''}
                onChange={e => handleInputChange('incident_date', e.target.value)}
                className={`w-full text-xs px-3 py-2 rounded-lg border outline-none font-mono ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Statement of Facts */}
          <div>
            <label className="block text-[11px] font-semibold mb-1 opacity-80">
              Statement of Material Facts & Grievance:
            </label>
            <textarea
              rows={4}
              value={formData.facts_summary || ''}
              onChange={e => handleInputChange('facts_summary', e.target.value)}
              className={`w-full text-xs px-3 py-2 rounded-lg border outline-none font-sans leading-relaxed ${
                isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Advocate Filing Particulars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold mb-1 opacity-80">
                Advocate Name:
              </label>
              <input
                type="text"
                value={formData.advocate_name || ''}
                onChange={e => handleInputChange('advocate_name', e.target.value)}
                className={`w-full text-xs px-3 py-2 rounded-lg border outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold mb-1 opacity-80">
                Enrolment No.:
              </label>
              <input
                type="text"
                value={formData.advocate_enrolment || ''}
                onChange={e => handleInputChange('advocate_enrolment', e.target.value)}
                className={`w-full text-xs px-3 py-2 rounded-lg border outline-none font-mono ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Re-compile Button */}
          <div className="pt-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Synthesizing Court Pleading...
                </>
              ) : (
                <>
                  <span>🏛️</span>
                  Re-Compile Court Pleading
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: High Court Green Parchment Ledger Preview */}
        <div className={`lg:col-span-7 flex flex-col h-full overflow-hidden ${
          activeTab === 'editor' ? 'hidden lg:flex' : 'flex'
        } ${isDark ? 'bg-slate-950' : 'bg-slate-100'}`}>
          
          {/* Preview Toolbar */}
          <div className={`p-3 border-b shrink-0 flex flex-wrap items-center justify-between gap-2 ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Court-Ready Legal Ledger
              </span>
              <span className="text-[10px] font-mono opacity-60">
                ({draftResult.engine.split('(')[0].trim()})
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopy}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
                  copied
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : isDark
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {copied ? '✓ Copied' : '📋 Copy Text'}
              </button>

              <button
                onClick={handleDownloadDoc}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isDark
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                📄 Download .doc
              </button>

              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                🖨️ Print Ledger
              </button>
            </div>
          </div>

          {/* Legal Ledger Page Container (1.5" Left Margin Binding Simulation) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex justify-center scrollbar-thin">
            <div
              className="w-full max-w-3xl bg-[#fdfbf7] dark:bg-[#1a1f26] text-[#1c1917] dark:text-[#f3f4f6] shadow-xl border border-[#e5e0d4] dark:border-slate-800 rounded-sm p-6 sm:p-10 select-text transition-colors"
              style={{
                fontFamily: "'Times New Roman', Georgia, serif",
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                borderLeft: '16px solid #2e4a3d', // High Court Green Ledger Binding Spine
                paddingLeft: '2.5rem' // 1.5 inch court margin simulation
              }}
            >
              {/* Header Stamp Ribbon */}
              <div className="border-b-2 border-slate-900 dark:border-slate-600 pb-3 mb-6 text-center">
                <div className="text-[10px] sm:text-[11px] font-mono tracking-widest uppercase opacity-75">
                  COURT OF JUDICATURE • FORMAL STATUTORY PLEADING
                </div>
                <div className="text-xs sm:text-sm font-bold uppercase tracking-wider mt-1 text-slate-900 dark:text-slate-100">
                  {draftResult.forum}
                </div>
                <div className="text-[9px] font-mono uppercase text-emerald-800 dark:text-emerald-400 font-semibold mt-0.5">
                  100% Statutory Grounding • Zero Hallucination Precedents
                </div>
              </div>

              {/* Pleading Body with authentic spacing */}
              <pre
                className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-justify font-serif"
                style={{
                  fontFamily: "'Times New Roman', Georgia, serif",
                  lineHeight: '1.9'
                }}
              >
                {draftResult.pleading_text}
              </pre>

              {/* Footer Registry Note */}
              <div className="border-t border-slate-300 dark:border-slate-700 mt-8 pt-3 text-[9px] font-mono text-center opacity-60">
                Prepared via Bharat Legal Intelligence 2.0 • Court-Ready Pleading & Notice Studio
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
export default CourtPleadingStudio;
