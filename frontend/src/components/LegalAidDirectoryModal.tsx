import { useState, useMemo } from 'react';
import { 
  X, 
  Scale, 
  Phone, 
  ExternalLink, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  Building2,
  HelpCircle
} from 'lucide-react';

export interface LegalAidDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

interface StateLegalAidEntry {
  state: string;
  authority: string;
  headquarters: string;
  helpline: string;
  website: string;
  incomeLimit: string;
}

const STATE_LEGAL_SERVICES_DATA: StateLegalAidEntry[] = [
  {
    state: 'Delhi (NCT)',
    authority: 'Delhi State Legal Services Authority (DSLSA)',
    headquarters: 'Central Office, Patiala House Courts Complex, New Delhi',
    helpline: '1516 / 15100',
    website: 'https://dslsa.org',
    incomeLimit: '₹3,00,000 per annum (No limit for women/SC/ST)'
  },
  {
    state: 'Maharashtra',
    authority: 'Maharashtra State Legal Services Authority (MSLSA)',
    headquarters: 'High Court Building, PWD Annexe, Fort, Mumbai - 400032',
    helpline: '15100 / 022-22673962',
    website: 'https://legalservices.maharashtra.gov.in',
    incomeLimit: '₹3,00,000 per annum'
  },
  {
    state: 'Karnataka',
    authority: 'Karnataka State Legal Services Authority (KSLSA)',
    headquarters: 'Nyaya Degula, 1st Floor, Siddaiah Road, Bengaluru - 560027',
    helpline: '15100 / 080-22111725',
    website: 'https://kslsa.kar.nic.in',
    incomeLimit: '₹3,00,000 per annum'
  },
  {
    state: 'Uttar Pradesh',
    authority: 'UP State Legal Services Authority (UPSLSA)',
    headquarters: '3rd Floor, Jawahar Bhawan, Annexe, Lucknow - 226001',
    helpline: '15100 / 0522-2286395',
    website: 'https://upslsa.up.nic.in',
    incomeLimit: '₹3,00,000 per annum'
  },
  {
    state: 'Tamil Nadu',
    authority: 'Tamil Nadu State Legal Services Authority (TNSLSA)',
    headquarters: 'North Fort Road, High Court Campus, Chennai - 600104',
    helpline: '15100 / 044-25342834',
    website: 'https://tnlegal.tn.gov.in',
    incomeLimit: '₹3,00,000 per annum'
  },
  {
    state: 'West Bengal',
    authority: 'West Bengal State Legal Services Authority (WBSLSA)',
    headquarters: 'City Civil Court Building, 2&3 Kiran Sankar Roy Road, Kolkata',
    helpline: '15100 / 033-22483892',
    website: 'https://wbslsa.gov.in',
    incomeLimit: '₹3,00,000 per annum'
  },
  {
    state: 'Gujarat',
    authority: 'Gujarat State Legal Services Authority (GSLSA)',
    headquarters: 'High Court Complex, Sola, Ahmedabad - 380060',
    helpline: '15100 / 079-27664688',
    website: 'https://gslsa.gujarat.gov.in',
    incomeLimit: '₹3,00,000 per annum'
  },
  {
    state: 'Rajasthan',
    authority: 'Rajasthan State Legal Services Authority (RSLSA)',
    headquarters: 'Rajasthan High Court Campus, Jaipur - 302005',
    helpline: '15100 / 0141-2227481',
    website: 'https://rlsa.gov.in',
    incomeLimit: '₹3,00,000 per annum'
  },
  {
    state: 'Telangana',
    authority: 'Telangana State Legal Services Authority (TSLSA)',
    headquarters: 'High Court Buildings, Hyderabad - 500066',
    helpline: '15100 / 040-23446700',
    website: 'https://tslsa.telangana.gov.in',
    incomeLimit: '₹3,00,000 per annum'
  },
  {
    state: 'Madhya Pradesh',
    authority: 'MP State Legal Services Authority (MPSLSA)',
    headquarters: 'High Court of MP Campus, Jabalpur - 482001',
    helpline: '15100 / 0761-2622223',
    website: 'https://mpslsa.gov.in',
    incomeLimit: '₹2,00,000 per annum'
  },
  {
    state: 'Bihar',
    authority: 'Bihar State Legal Services Authority (BSLSA)',
    headquarters: 'Old High Court Building, Patna - 800028',
    helpline: '15100 / 0612-2504071',
    website: 'https://bslsa.bih.nic.in',
    incomeLimit: '₹1,50,000 per annum'
  },
  {
    state: 'Kerala',
    authority: 'Kerala State Legal Services Authority (KELSA)',
    headquarters: 'Niyama Sahaya Bhavan, High Court Compound, Ernakulam, Kochi',
    helpline: '15100 / 0484-2396717',
    website: 'https://kelsa.nic.in',
    incomeLimit: '₹3,00,000 per annum'
  },
  {
    state: 'Punjab & Haryana',
    authority: 'Punjab State Legal Services Authority (PULSA)',
    headquarters: 'Site No. 126, Sector 69, SAS Nagar (Mohali) - 160062',
    helpline: '15100 / 0172-2216690',
    website: 'https://pulsa.punjab.gov.in',
    incomeLimit: '₹3,00,000 per annum'
  }
];

export function LegalAidDirectoryModal({ isOpen, onClose, isDark }: LegalAidDirectoryModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'directory' | 'eligibility' | 'howToApply'>('directory');

  const filteredStates = useMemo(() => {
    if (!searchQuery.trim()) return STATE_LEGAL_SERVICES_DATA;
    const q = searchQuery.toLowerCase();
    return STATE_LEGAL_SERVICES_DATA.filter(item => 
      item.state.toLowerCase().includes(q) ||
      item.authority.toLowerCase().includes(q) ||
      item.headquarters.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isDark 
            ? 'bg-[#0f121e] border-[#222942] text-white shadow-black/80' 
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-900/20'
        }`}
      >
        {/* MODAL HEADER */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'border-[#1e2438] bg-[#141828]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-serif tracking-tight">
                  NALSA Free Legal Aid Directory & Citizen Rights
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Article 39A
                </span>
              </div>
              <p className={`text-[11.5px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                Under Section 12 of the Legal Services Authorities Act, 1987 • 100% Free Court-Appointed Advocates
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-zinc-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'
            }`}
            title="Close directory"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 24/7 NATIONAL HELPLINE BANNER */}
        <div className="p-3 sm:px-5 bg-gradient-to-r from-[#00288e] to-[#001754] text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-white/10 text-amber-400">
              <Phone className="w-4 h-4" />
            </span>
            <div>
              <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-300">
                National Legal Services 24/7 Helpline
              </div>
              <div className="text-sm sm:text-base font-bold flex items-center gap-2">
                <span>Dial 15100 (Toll-Free Across India)</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="tel:15100"
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call 15100</span>
            </a>
            <a
              href="https://nalsa.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20"
            >
              <span>NALSA Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className={`px-4 sm:px-5 pt-3 border-b flex gap-4 text-xs font-semibold shrink-0 ${
          isDark ? 'border-[#1e2438] bg-[#0c0f1a]' : 'border-slate-200 bg-slate-50'
        }`}>
          <button
            type="button"
            onClick={() => setActiveTab('directory')}
            className={`pb-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'directory'
                ? 'border-amber-500 text-amber-400 font-bold'
                : isDark ? 'border-transparent text-zinc-400 hover:text-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>State Legal Authorities ({STATE_LEGAL_SERVICES_DATA.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('eligibility')}
            className={`pb-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'eligibility'
                ? 'border-amber-500 text-amber-400 font-bold'
                : isDark ? 'border-transparent text-zinc-400 hover:text-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Who is Eligible? (Section 12)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('howToApply')}
            className={`pb-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'howToApply'
                ? 'border-amber-500 text-amber-400 font-bold'
                : isDark ? 'border-transparent text-zinc-400 hover:text-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>How to Get Free Lawyer</span>
          </button>
        </div>

        {/* TAB CONTENTS (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {activeTab === 'directory' && (
            <div className="space-y-4">
              {/* SEARCH INPUT */}
              <div className="relative">
                <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                  isDark ? 'text-zinc-500' : 'text-slate-400'
                }`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by state, authority name, or district court location..."
                  className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs border transition-all focus:outline-none ${
                    isDark 
                      ? 'bg-[#141827] border-[#222940] text-white placeholder:text-zinc-500 focus:border-amber-500' 
                      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#00288e]'
                  }`}
                />
              </div>

              {/* STATE CARDS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredStates.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                      isDark 
                        ? 'bg-[#141828] border-[#222942] hover:border-slate-600' 
                        : 'bg-slate-50 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm text-[#00288e] dark:text-amber-400">
                          {item.state}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-200 text-slate-700'
                        }`}>
                          SLSA Registered
                        </span>
                      </div>
                      <div className="font-semibold text-xs mt-1">
                        {item.authority}
                      </div>
                      <div className={`text-[11px] mt-1 line-clamp-2 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                        {item.headquarters}
                      </div>
                      <div className={`text-[10.5px] mt-2 font-mono ${isDark ? 'text-amber-300/80' : 'text-amber-900'}`}>
                        Income Criterion: {item.incomeLimit}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono font-bold flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-500" />
                        <span>{item.helpline}</span>
                      </span>
                      <a
                        href={item.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                          isDark ? 'text-blue-400 hover:text-blue-300' : 'text-[#00288e] hover:text-blue-800'
                        }`}
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'eligibility' && (
            <div className="space-y-4 text-xs leading-relaxed">
              <div className={`p-4 rounded-xl border ${
                isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}>
                <h3 className="font-bold text-sm mb-1 flex items-center gap-1.5 font-serif">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span>Statutory Entitlement Under Section 12 of the Legal Services Authorities Act, 1987</span>
                </h3>
                <p className="text-[11.5px] opacity-90">
                  Article 39A of the Constitution of India mandates that the State shall provide free legal aid to ensure that opportunities for securing justice are not denied to any citizen by reason of economic or other disabilities.
                </p>
              </div>

              <div className="space-y-2.5">
                <h4 className="font-bold text-xs uppercase tracking-wider font-mono">
                  Who is entitled to 100% Free Court Representation?
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { title: 'Women and Children', desc: 'Every woman and child in India, regardless of income or financial status.' },
                    { title: 'Scheduled Castes & Scheduled Tribes', desc: 'All members of SC and ST communities without any income ceiling.' },
                    { title: 'Persons in Custody / Detention', desc: 'Under-trials, detained individuals, or juveniles in juvenile homes.' },
                    { title: 'Industrial Workmen & Laborers', desc: 'Any workman affected by industrial or labor disputes.' },
                    { title: 'Victims of Trafficking & Beggary', desc: 'Victims of human trafficking or forced labor under Article 23.' },
                    { title: 'Victims of Mass Disasters & Riots', desc: 'Persons affected by flood, drought, earthquake, ethnic violence or industrial catastrophe.' },
                    { title: 'Persons with Disabilities', desc: 'Any individual with physical, mental, or sensory disabilities under RPwD Act.' },
                    { title: 'General Citizens (Income Criteria)', desc: 'Citizens with annual income below ₹3,00,000 (threshold varies ₹1.5L - ₹3L by state).' }
                  ].map((rule, rIdx) => (
                    <div key={rIdx} className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                      isDark ? 'bg-[#141827] border-[#222940]' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{rule.title}</div>
                        <div className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                          {rule.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'howToApply' && (
            <div className="space-y-4 text-xs leading-relaxed">
              <div className="space-y-3">
                {[
                  {
                    step: 'Step 1: Contact NALSA or Visit Your District Court',
                    desc: 'Dial toll-free 15100 (24/7) or visit the District Legal Services Authority (DLSA) office located inside your nearest District Court complex.'
                  },
                  {
                    step: 'Step 2: Submit a Free Legal Aid Application',
                    desc: 'Fill out a simple one-page application form stating your dispute or legal notice received. If you are illiterate, the Front Office Legal Aid Para-Volunteer will draft it for you at zero charge.'
                  },
                  {
                    step: 'Step 3: Verification & Advocate Appointment',
                    desc: 'The Secretary of the DLSA examines the request within 24 to 48 hours and assigns an enrolled Advocate from the Legal Aid Panel.'
                  },
                  {
                    step: 'Step 4: Court Representation at Zero Expense',
                    desc: 'Your assigned advocate will draft petitions, appear before the Judge, and conduct trials without charging you any fees. Court filing fees and paper book expenses are borne directly by the State Legal Services Authority.'
                  }
                ].map((s, sIdx) => (
                  <div key={sIdx} className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                    isDark ? 'bg-[#141827] border-[#222940]' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="w-7 h-7 rounded-lg bg-[#00288e] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {sIdx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">{s.step}</div>
                      <p className={`text-[11.5px] mt-1 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                        {s.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`p-4 rounded-xl border text-center ${
                isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-100 border-slate-300'
              }`}>
                <div className="font-bold text-slate-900 dark:text-white mb-1">
                  Want to Apply Online from Home?
                </div>
                <p className={`text-[11px] mb-3 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  You can file an electronic legal aid application directly on the official Government of India portal:
                </p>
                <a
                  href="https://nalsa.gov.in/lsms/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00288e] hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  <span>Open NALSA Legal Services Management System (LSMS)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className={`p-3 sm:px-5 border-t flex items-center justify-between text-[11px] font-mono shrink-0 ${
          isDark ? 'border-[#1e2438] bg-[#141828] text-zinc-400' : 'border-slate-200 bg-slate-50 text-slate-600'
        }`}>
          <span>Governed by NALSA • Supreme Court of India</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-900 dark:text-white font-bold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
