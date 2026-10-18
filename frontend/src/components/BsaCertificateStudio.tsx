import { useState } from 'react';
import {
  CLIENT_BSA_MEDIA_TYPES,
  type BsaCertFormData,
  type BsaCertResult,
  type BsaMediaArchetype,
  computeClientSha256,
  generateClientBsaCertificate
} from '../services/clientBsaEngine';

interface BsaCertificateStudioProps {
  isDark: boolean;
  apiBase?: string;
  onClose?: () => void;
}

export function BsaCertificateStudio({
  isDark,
  apiBase = 'http://localhost:8000',
  onClose
}: BsaCertificateStudioProps) {
  const [selectedMediaType, setSelectedMediaType] = useState<string>('whatsapp_chat');
  const activeMedia = CLIENT_BSA_MEDIA_TYPES.find(m => m.key === selectedMediaType) || CLIENT_BSA_MEDIA_TYPES[0];

  const [formData, setFormData] = useState<BsaCertFormData>({
    deponent_name: 'Rahul Meena',
    deponent_parentage: 'S/o Sh. Ramesh Meena',
    deponent_address: 'R/o Room 204, Landmark Residency, Vigyan Nagar, Kota, Rajasthan',
    deponent_age: '22',
    media_type: 'whatsapp_chat',
    doc_description: activeMedia.sample_identifier,
    device_make_model: 'OnePlus 12 (Model CPH2573, Android 14)',
    device_imei_or_mac: 'IMEI1: 864920061298471 / MAC: 4C:D5:77:8A:21:09',
    operating_system: 'OxygenOS 14.0 / Linux Kernel 6.1',
    ip_address: '192.168.1.104 (ISP: Airtel Fiber)',
    sha256_hash: '5b8924f0c98e21a73d8b1209384fe982a1b98402941098deca98762314502891',
    court_case_ref: 'Consumer Complaint No. _____ / 2026 before DCDRC Kota'
  });

  const [certResult, setCertResult] = useState<BsaCertResult>(() =>
    generateClientBsaCertificate(formData)
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('preview');

  const handleMediaSelect = async (media: BsaMediaArchetype) => {
    setSelectedMediaType(media.key);
    const updatedDesc = media.sample_identifier;
    const computedHash = await computeClientSha256(`${updatedDesc}_${formData.device_make_model}_${formData.deponent_name}`);
    const updated: BsaCertFormData = {
      ...formData,
      media_type: media.key,
      doc_description: updatedDesc,
      device_make_model: media.default_device,
      sha256_hash: computedHash
    };
    setFormData(updated);
    setCertResult(generateClientBsaCertificate(updated, computedHash));
  };

  const handleInputChange = (field: keyof BsaCertFormData, val: string) => {
    const updated = { ...formData, [field]: val };
    setFormData(updated);
  };

  const handleRecalculateHash = async () => {
    const seed = `${formData.doc_description}_${formData.device_make_model}_${formData.device_imei_or_mac}_${Date.now()}`;
    const newHash = await computeClientSha256(seed);
    const updated = { ...formData, sha256_hash: newHash };
    setFormData(updated);
    setCertResult(generateClientBsaCertificate(updated, newHash));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`${apiBase}/api/contracts/bsa/certificate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const data = await res.json();
        setCertResult(data);
      } else {
        setCertResult(generateClientBsaCertificate(formData));
      }
    } catch {
      setCertResult(generateClientBsaCertificate(formData));
    } finally {
      setIsGenerating(false);
      setActiveTab('preview');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(certResult.certificate_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDoc = () => {
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>${certResult.title}</title>
    <style>
      @page { size: A4; margin: 1.5in 1.0in 1.0in 1.0in; }
      body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 2.0; text-align: justify; }
      h1, h2, h3 { text-align: center; font-size: 14pt; font-weight: bold; }
    </style></head><body>`;
    const footer = `</body></html>`;
    const content = `<pre style="font-family: 'Times New Roman', serif; font-size: 12pt; white-space: pre-wrap; line-height: 1.8;">${certResult.certificate_text}</pre>`;
    const blob = new Blob([header + content + footer], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Section63_BSA_Certificate_${selectedMediaType}.doc`;
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
          <title>${certResult.title} - Bharat Legal Intelligence</title>
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
            SECTION 63 BSA STATUTORY ELECTRONIC CERTIFICATE • ARJUN PANDITRAO KHOTKAR COMPLIANCE
          </div>
          <pre>${certResult.certificate_text}</pre>
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
            <span className="text-xl">📜</span>
            <h2 className={`font-bold text-lg sm:text-xl tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Section 63 BSA Electronic Certificate Studio
            </h2>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
              Formerly Section 65B Indian Evidence Act
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Mandatory statutory electronic certificate for WhatsApp chats, UPI fraud logs, call recordings, and emails adhering to Arjun Panditrao Khotkar [2020] 7 SCC 1.
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

      {/* Media Type Selector Grid */}
      <div className={`p-3 sm:p-4 border-b grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-100/70 border-slate-200'}`}>
        {CLIENT_BSA_MEDIA_TYPES.map(m => {
          const isSelected = m.key === selectedMediaType;
          return (
            <button
              key={m.key}
              onClick={() => handleMediaSelect(m)}
              className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/40 shadow-xs'
                  : isDark
                  ? 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="font-bold text-xs leading-tight">
                {m.title.split('&')[0].trim()}
              </div>
              <div className="text-[10px] opacity-75 mt-1 line-clamp-1">
                {m.description.slice(0, 45)}...
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
              ? 'border-indigo-500 text-indigo-500'
              : isDark ? 'border-transparent text-slate-400' : 'border-transparent text-slate-600'
          }`}
        >
          📝 Device & Custody Details
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 ${
            activeTab === 'preview'
              ? 'border-indigo-500 text-indigo-500'
              : isDark ? 'border-transparent text-slate-400' : 'border-transparent text-slate-600'
          }`}
        >
          📜 Statutory Certificate
        </button>
      </div>

      {/* Main Studio Body: 2 Columns on Desktop */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
        
        {/* Left Column: Form Controls */}
        <div className={`lg:col-span-5 p-4 overflow-y-auto space-y-4 ${
          activeTab === 'preview' ? 'hidden sm:block' : 'block'
        } ${isDark ? 'bg-slate-900/40 text-slate-200' : 'bg-white text-slate-800'}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Deponent & Forensic Hardware Metadata
            </h3>
            <span className="text-[10px] text-indigo-600 font-mono font-bold">
              § 63(4) BSA Mandatory
            </span>
          </div>

          {/* Deponent Name & Parentage */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold mb-1 opacity-80">
                Deponent Full Name:
              </label>
              <input
                type="text"
                value={formData.deponent_name}
                onChange={e => handleInputChange('deponent_name', e.target.value)}
                className={`w-full text-xs px-3 py-2 rounded-lg border outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold mb-1 opacity-80">
                Parentage:
              </label>
              <input
                type="text"
                value={formData.deponent_parentage || ''}
                onChange={e => handleInputChange('deponent_parentage', e.target.value)}
                className={`w-full text-xs px-3 py-2 rounded-lg border outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Address & Case Ref */}
          <div>
            <label className="block text-[11px] font-semibold mb-1 opacity-80">
              Deponent Residence Address:
            </label>
            <input
              type="text"
              value={formData.deponent_address || ''}
              onChange={e => handleInputChange('deponent_address', e.target.value)}
              className={`w-full text-xs px-3 py-2 rounded-lg border outline-none ${
                isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold mb-1 opacity-80">
              Court / Tribunal Proceeding Reference:
            </label>
            <input
              type="text"
              value={formData.court_case_ref || ''}
              onChange={e => handleInputChange('court_case_ref', e.target.value)}
              className={`w-full text-xs px-3 py-2 rounded-lg border outline-none font-mono ${
                isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Electronic Record Description */}
          <div>
            <label className="block text-[11px] font-semibold mb-1 opacity-80">
              Digital Evidence Record Description:
            </label>
            <textarea
              rows={2}
              value={formData.doc_description}
              onChange={e => handleInputChange('doc_description', e.target.value)}
              placeholder="Describe the tendered digital document or transaction log..."
              className={`w-full text-xs p-2.5 rounded-lg border outline-none font-mono ${
                isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Hardware & Identifiers */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold mb-1 opacity-80">
                Device Make & Model:
              </label>
              <input
                type="text"
                value={formData.device_make_model || ''}
                onChange={e => handleInputChange('device_make_model', e.target.value)}
                className={`w-full text-xs px-3 py-2 rounded-lg border outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold mb-1 opacity-80">
                IMEI / MAC Address:
              </label>
              <input
                type="text"
                value={formData.device_imei_or_mac || ''}
                onChange={e => handleInputChange('device_imei_or_mac', e.target.value)}
                className={`w-full text-xs px-3 py-2 rounded-lg border outline-none font-mono ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* SHA-256 Hash Box */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold opacity-80 flex items-center gap-1">
                <span>🔒</span>
                Cryptographic SHA-256 Hash:
              </label>
              <button
                type="button"
                onClick={handleRecalculateHash}
                className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                ↻ Re-Calculate Hash
              </button>
            </div>
            <input
              type="text"
              value={formData.sha256_hash || ''}
              onChange={e => handleInputChange('sha256_hash', e.target.value)}
              className={`w-full text-[10.5px] px-3 py-2 rounded-lg border outline-none font-mono ${
                isDark ? 'bg-slate-800 border-indigo-900/60 text-indigo-300' : 'bg-indigo-50/50 border-indigo-200 text-indigo-950'
              }`}
            />
          </div>

          {/* Compile Action */}
          <div className="pt-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Compiling Statutory Certificate...
                </>
              ) : (
                <>
                  <span>📜</span>
                  Compile Section 63 BSA Certificate
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: High Court Parchment Preview */}
        <div className={`lg:col-span-7 flex flex-col h-full overflow-hidden ${
          activeTab === 'editor' ? 'hidden sm:flex' : 'flex'
        } ${isDark ? 'bg-slate-950' : 'bg-slate-100'}`}>
          {/* Preview Toolbar */}
          <div className={`p-3 border-b flex flex-wrap items-center justify-between gap-2 ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                Court-Admissible Electronic Certificate
              </span>
              <span className="text-[10px] font-mono opacity-60">
                (Arjun Panditrao Khotkar Ratio)
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
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5 shadow-sm"
              >
                🖨️ Print Certificate
              </button>
            </div>
          </div>

          {/* Parchment Ledger Page */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex justify-center">
            <div
              className="w-full max-w-3xl bg-[#fdfbf7] dark:bg-[#1a1f26] text-[#1c1917] dark:text-[#f3f4f6] shadow-xl border border-[#e5e0d4] dark:border-slate-800 rounded-sm p-6 sm:p-10 select-text transition-colors"
              style={{
                fontFamily: "'Times New Roman', Georgia, serif",
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                borderLeft: '16px solid #1e293b',
                paddingLeft: '2.5rem'
              }}
            >
              {/* Header Stamp Ribbon */}
              <div className="border-b-2 border-slate-900 dark:border-slate-600 pb-3 mb-6 text-center">
                <div className="text-[10px] sm:text-[11px] font-mono tracking-widest uppercase opacity-75">
                  REPUBLIC OF INDIA • STATUTORY EVIDENCE CERTIFICATION
                </div>
                <div className="text-xs sm:text-sm font-bold uppercase tracking-wider mt-1 text-slate-900 dark:text-slate-100">
                  SECTION 63 BHARATIYA SAKSHYA ADHINIYAM, 2023
                </div>
                <div className="text-[9px] font-mono uppercase text-indigo-700 dark:text-indigo-400 font-semibold mt-0.5">
                  Arjun Panditrao Khotkar [2020] 7 SCC 1 Mandatory Benchmark
                </div>
              </div>

              {/* Certificate Body */}
              <pre
                className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-justify font-serif"
                style={{
                  fontFamily: "'Times New Roman', Georgia, serif",
                  lineHeight: '1.9'
                }}
              >
                {certResult.certificate_text}
              </pre>

              {/* Footer Registry Note */}
              <div className="border-t border-slate-300 dark:border-slate-700 mt-8 pt-3 text-[9px] font-mono text-center opacity-60">
                Prepared via Bharat Legal Intelligence 2.0 • Section 63 BSA Electronic Certificate Studio
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
export default BsaCertificateStudio;
