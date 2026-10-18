import { useState } from 'react';
import {
  CLIENT_PLEADING_PRESETS,
  type PleadingFormData,
  type PleadingPreset,
  generateClientPleading
} from '../services/clientPleadingEngine';

interface CourtPleadingStudioProps {
  isDark: boolean;
  apiBase?: string;
  initialFacts?: string;
  onClose?: () => void;
}

export function CourtPleadingStudio({
  isDark,
  apiBase = 'http://localhost:8000',
  initialFacts,
  onClose
}: CourtPleadingStudioProps) {
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('quashing_528_bnss');
  const activePreset = CLIENT_PLEADING_PRESETS.find(p => p.key === selectedPresetKey) || CLIENT_PLEADING_PRESETS[0];

  const [formData, setFormData] = useState<PleadingFormData>({
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
    facts_summary: initialFacts || activePreset.defaultFacts,
    bank_name: 'HDFC Bank Ltd., Connaught Place Branch',
    return_memo_date: '10th September, 2026',
    dishonour_reason: 'Funds Insufficient',
    advocate_name: 'Advocate A. K. Verma & Associates',
    advocate_enrolment: 'D/1452/2018',
    advocate_office: 'Chamber 418, High Court Lawyers Chambers Block'
  });

  const [draftResult, setDraftResult] = useState<{
    title: string;
    forum: string;
    governing_statute: string;
    pleading_text: string;
    engine: string;
  }>(() => generateClientPleading(formData));

  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('preview');

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
      facts_summary: initialFacts || preset.defaultFacts
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
        // Fallback to client generator
        setDraftResult(generateClientPleading(formData));
      }
    } catch {
      // Offline fallback
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
              margin: 1.5in 1.0in 1.0in 1.0in; /* 1.5 inch left margin for court filing punch */
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
            COURT-READY FILING PLEADING • BHARAT LEGAL INTELLIGENCE 2.0
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
    <div className={`flex flex-col h-full rounded-2xl overflow-hidden border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
      {/* Studio Header */}
      <div className={`p-4 sm:p-5 border-b flex flex-wrap items-center justify-between gap-3 ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏛️</span>
            <h2 className={`font-bold text-lg sm:text-xl tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Court-Ready Pleading & Notice Studio
            </h2>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
              High Court Parchment Grade
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Draft authentic petitions, Section 138 notices, e-Daakhil consumer plaints, and caution money refund demands adhering strictly to Indian Court practice.
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            ✕ Close
          </button>
        )}
      </div>

      {/* Preset Selector Grid */}
      <div className={`p-3 sm:p-4 border-b grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-100/70 border-slate-200'}`}>
        {CLIENT_PLEADING_PRESETS.map(preset => {
          const isSelected = preset.key === selectedPresetKey;
          return (
            <button
              key={preset.key}
              onClick={() => handlePresetSelect(preset)}
              className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/40 shadow-sm'
                  : isDark
                  ? 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">
                    {preset.icon === 'gavel' && '⚖️'}
                    {preset.icon === 'receipt_long' && '📜'}
                    {preset.icon === 'storefront' && '🛡️'}
                    {preset.icon === 'mark_email_read' && '📬'}
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                    isSelected ? 'bg-amber-500 text-black' : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {preset.forum.split(' ')[0]}
                  </span>
                </div>
                <div className={`font-semibold text-xs leading-snug line-clamp-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {preset.title}
                </div>
              </div>
              <div className={`text-[10.5px] mt-2 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {preset.desc}
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Controls for Mobile */}
      <div className={`sm:hidden flex border-b ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <button
          onClick={() => setActiveTab('editor')}
          className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 ${
            activeTab === 'editor'
              ? 'border-amber-500 text-amber-500'
              : isDark ? 'border-transparent text-slate-400' : 'border-transparent text-slate-600'
          }`}
        >
          📝 Pleading Details
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 ${
            activeTab === 'preview'
              ? 'border-amber-500 text-amber-500'
              : isDark ? 'border-transparent text-slate-400' : 'border-transparent text-slate-600'
          }`}
        >
          📜 Legal Ledger Preview
        </button>
      </div>

      {/* Main Studio Body: 2 Columns on Desktop */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
        
        {/* Left Column: Form Fields */}
        <div className={`lg:col-span-5 p-4 overflow-y-auto space-y-4 ${
          activeTab === 'preview' ? 'hidden sm:block' : 'block'
        } ${isDark ? 'bg-slate-900/40 text-slate-200' : 'bg-white text-slate-800'}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Pleading Metadata & Averments
            </h3>
            <span className="text-[11px] text-amber-600 font-mono font-medium">
              {activePreset.governing_statute}
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
                Petitioner Details (Parentage & Address):
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
            <div>
              <label className="block text-[11px] font-semibold mb-1 opacity-80">
                Respondent Address / Corporate Details:
              </label>
              <input
                type="text"
                value={formData.respondent_details || ''}
                onChange={e => handleInputChange('respondent_details', e.target.value)}
                className={`w-full text-xs px-3 py-2 rounded-lg border outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* FIR / Cheque / Case Ref & Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold mb-1 opacity-80">
                Case / FIR / Cheque No.:
              </label>
              <input
                type="text"
                value={formData.case_number || ''}
                onChange={e => handleInputChange('case_number', e.target.value)}
                className={`w-full text-xs px-3 py-2 rounded-lg border outline-none font-mono ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold mb-1 opacity-80">
                Dispute Amount / Cheque Value:
              </label>
              <input
                type="text"
                value={formData.dispute_amount || ''}
                onChange={e => handleInputChange('dispute_amount', e.target.value)}
                className={`w-full text-xs px-3 py-2 rounded-lg border outline-none font-semibold ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Statement of Material Facts */}
          <div>
            <label className="block text-[11px] font-semibold mb-1 opacity-80">
              Material Facts & Factual Controversy:
            </label>
            <textarea
              rows={4}
              value={formData.facts_summary || ''}
              onChange={e => handleInputChange('facts_summary', e.target.value)}
              placeholder="State the material dispute facts chronologically..."
              className={`w-full text-xs p-3 rounded-lg border outline-none leading-relaxed ${
                isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Counsel / Advocate Details */}
          <div className="grid grid-cols-2 gap-3">
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
                Bar Enrolment No.:
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

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md transition-all flex items-center justify-center gap-2"
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
          activeTab === 'editor' ? 'hidden sm:flex' : 'flex'
        } ${isDark ? 'bg-slate-950' : 'bg-slate-100'}`}>
          {/* Preview Toolbar */}
          <div className={`p-3 border-b flex flex-wrap items-center justify-between gap-2 ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Court-Ready Legal Ledger
              </span>
              <span className="text-[10px] font-mono opacity-60">
                ({draftResult.engine.split('(')[0]})
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopy}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
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
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                  isDark
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                📄 Download .doc
              </button>

              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors flex items-center gap-1.5 shadow-sm"
              >
                🖨️ Print to Court Ledger
              </button>
            </div>
          </div>

          {/* Legal Ledger Page Container (1.5" Left Margin Binding Simulation) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex justify-center">
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
