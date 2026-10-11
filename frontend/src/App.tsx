import { useState, useEffect, useRef } from 'react';
import './App.css';
import { ChatView } from './components/ChatView';
import { ContractStudioView } from './components/ContractStudioView';
import { SearchView } from './components/SearchView';
import { InfoView } from './components/InfoView';
import { DossiersDrawer, type ChamberDossier } from './components/DossiersDrawer';

export interface ChatLaunchContext {
  type: 'search_provision' | 'concordance' | 'gazette' | 'dossier';
  title: string;
  query: string;
  category?: string;
  autoExecute?: boolean;
  dossier?: ChamberDossier;
}

export interface DailyLegalTip {
  title: string;
  provision: string;
  description: string;
  actionableTip: string;
  category: string;
  icon: string;
}

const DAILY_LEGAL_TIPS: DailyLegalTip[] = [
  {
    title: "Mandatory Notice Before Arrest",
    provision: "Section 35(3) BNSS 2023 (Arnesh Kumar Mandate)",
    description: "For offenses punishable with imprisonment up to 7 years, police cannot arrest mechanically without objective necessity and recording written reasons. They must issue a formal Notice of Appearance.",
    actionableTip: "If police summon you for an inquiry without arrest warrants, demand a formal written Section 35(3) BNSS notice.",
    category: "Criminal Procedure",
    icon: "gavel"
  },
  {
    title: "Right to Lodge Zero FIR",
    provision: "Section 173 BNSS 2023",
    description: "Any citizen can file an FIR at ANY police station in India, regardless of where the incident occurred. The station cannot refuse registration on grounds of territorial jurisdiction.",
    actionableTip: "Request a 'Zero FIR' acknowledgment number if an officer claims the incident occurred outside their police station limits.",
    category: "Citizens' Rights",
    icon: "local_police"
  },
  {
    title: "Safeguards for Women's Arrest",
    provision: "Section 35 BNSS 2023 & D.K. Basu Directives",
    description: "No female person can be arrested after sunset and before sunrise, except in extraordinary circumstances with prior permission of a Judicial Magistrate First Class.",
    actionableTip: "All searches and arrests of female persons must strictly be conducted by female police officers.",
    category: "Constitutional Protections",
    icon: "shield"
  },
  {
    title: "Legal Equality of DigiLocker Documents",
    provision: "Section 139A Motor Vehicles Act & IT Rules 2018",
    description: "Digital Driving Licenses, Registration Certificates (RC), and Insurance presented via DigiLocker or mParivahan are legally valid and on par with physical documents.",
    actionableTip: "Traffic police cannot impound your physical smartphone or demand plastic cards if DigiLocker copies are produced.",
    category: "Cyber & Transport",
    icon: "badge"
  },
  {
    title: "Constitutional Entitlement to Free Legal Aid",
    provision: "Article 39A Constitution of India & NALSA Act",
    description: "Every person unable to afford an advocate—including all women, children, undertrials, and low-income citizens—is entitled to free legal counsel from the State.",
    actionableTip: "Approach the District Legal Services Authority (DLSA) at any district court for free advocate assignment.",
    category: "Constitutional Law",
    icon: "balance"
  },
  {
    title: "Mandatory 24-Hour Magistrate Production",
    provision: "Article 22(2) Constitution & Section 57 BNSS",
    description: "Every person arrested or detained by police must be produced before the nearest Judicial Magistrate within 24 hours of arrest, excluding travel time.",
    actionableTip: "Detention in police lockup beyond 24 hours without a Magistrate's remand order is strictly unconstitutional and illegal.",
    category: "Personal Liberty",
    icon: "lock_clock"
  },
  {
    title: "Invalidity of 'Goods Once Sold Won't Be Returned'",
    provision: "Consumer Protection Act 2019 (Section 2(47))",
    description: "Printing 'Goods once sold will not be exchanged or refunded' on cash memos is an unfair trade practice under law. Consumers are legally entitled to refunds or replacement for defective products or deficient services.",
    actionableTip: "Consumers can lodge complaints directly through the National Consumer Helpline (1915) or e-Daakhil.",
    category: "Consumer Rights",
    icon: "shopping_cart_checkout"
  },
  {
    title: "Mandatory 30-Day RTI Response",
    provision: "Right to Information Act 2005 (Section 7)",
    description: "Public Information Officers are legally obligated to provide requested government information within 30 days of application (or within 48 hours if it concerns life and personal liberty).",
    actionableTip: "Failure to respond attracts a personal financial penalty of ₹250 per day on the defaulting officer.",
    category: "Administrative Transparency",
    icon: "fact_check"
  }
];

export function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'contracts' | 'search' | 'info'>('chat');
  const [mode, setMode] = useState<'citizen' | 'professional'>('professional');
  const [dossierCount, setDossierCount] = useState<number>(2);
  const [isDossiersOpen, setIsDossiersOpen] = useState(false);
  const [isPagesMenuOpen, setIsPagesMenuOpen] = useState(false);
  const pagesMenuRef = useRef<HTMLDivElement>(null);
  const [chatLaunchContext, setChatLaunchContext] = useState<ChatLaunchContext | null>(null);
  const [searchInitialQuery, setSearchInitialQuery] = useState<string | null>(null);
  const [totalProvisions, setTotalProvisions] = useState<number>(59);
  const [geminiApiKey] = useState<string>(() => {
    return localStorage.getItem('bharat_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
  });
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('bharat_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });
  const API_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:8000').replace(/\/+$/, '');

  // Splash Screen State
  const [isLoading, setIsLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [splashTip] = useState<DailyLegalTip>(() => {
    return DAILY_LEGAL_TIPS[Math.floor(Math.random() * DAILY_LEGAL_TIPS.length)];
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 400);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  // Click-outside listener for mobile pages dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pagesMenuRef.current && !pagesMenuRef.current.contains(event.target as Node)) {
        setIsPagesMenuOpen(false);
      }
    }
    if (isPagesMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isPagesMenuOpen]);

  useEffect(() => {
    localStorage.setItem('bharat_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.body.className = 'bg-[#090a0f] text-[#f8fafc] antialiased m-0 p-0 font-sans';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.body.className = 'bg-[#f4f6fb] text-[#0b1c30] antialiased m-0 p-0 font-sans';
    }
  }, [theme]);

  useEffect(() => {
    fetch(`${API_BASE}/api/dossiers`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDossierCount(data.length);
      })
      .catch(err => console.error('Error fetching dossier count:', err));

    fetch(`${API_BASE}/api/search/sources`)
      .then(res => res.json())
      .then((data: Array<{ provision_count?: number }>) => {
        if (Array.isArray(data)) {
          const count = data.reduce((acc, s) => acc + (s.provision_count || 0), 0);
          if (count > 0) setTotalProvisions(count);
        }
      })
      .catch(err => console.error('Error fetching sources count:', err));
  }, []);

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      isDark ? 'bg-[#090a0f] text-[#f8fafc]' : 'bg-[#f4f6fb] text-[#0b1c30]'
    }`}>
      {/* INSTITUTIONAL DAILY LAWS LOADING / SPLASH SCREEN */}
      {isLoading && (
        <div 
          id="app-splash-screen"
          className={`fixed inset-0 z-[10000] flex flex-col items-center justify-between p-4 sm:p-8 transition-opacity duration-400 select-none ${
            isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          style={{ backgroundColor: isDark ? '#090a0f' : '#f4f6fb' }}
        >
          {/* Top Status Header */}
          <div className="w-full flex items-center justify-between max-w-xl opacity-75 text-[10px] sm:text-[11px] font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-400 font-semibold">Bharatiya Statutory Engine</span>
            </span>
            <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
              BNS • BNSS • BSA 2023
            </span>
          </div>

          {/* Central Emblem & Daily Legal Right Card */}
          <div className="flex flex-col items-center max-w-md w-full text-center gap-4 sm:gap-5 my-auto">
            {/* Pulsing Brand Emblem */}
            <div className="relative flex items-center justify-center">
              <div className="absolute -inset-2.5 rounded-2xl bg-gradient-to-r from-[#ff7722]/30 via-[#3755c3]/30 to-emerald-500/30 blur-md animate-pulse"></div>
              <img 
                src="/logo.png" 
                alt="भारत Legal Intelligence" 
                className={`relative w-14 h-14 sm:w-20 sm:h-20 rounded-2xl object-contain shadow-2xl p-1 border ${
                  isDark ? 'bg-[#131726] border-[#242b42]' : 'bg-white border-[#e2e8f0]'
                }`}
              />
            </div>

            {/* Brand Title */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black text-xl sm:text-2xl tracking-tight text-[#ff7722]">भारत</span>
                <span className={`font-black text-xl sm:text-2xl tracking-tight ${isDark ? 'text-white' : 'text-[#00288e]'}`}>
                  Legal Intelligence
                </span>
              </div>
              <p className={`text-[11px] sm:text-[12px] font-medium mt-0.5 ${isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'}`}>
                Official Constitutional & Courtroom Precedents Platform
              </p>
            </div>

            {/* Smooth Progress Indicator */}
            <div className="w-full max-w-xs flex flex-col items-center gap-1.5">
              <div className="w-full h-1.5 rounded-full overflow-hidden bg-zinc-700/20">
                <div className="h-full bg-gradient-to-r from-[#ff7722] via-[#00288e] to-emerald-400 rounded-full w-full animate-pulse"></div>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] animate-spin text-emerald-400">sync</span>
                Loading Central Acts & Landmark Precedents...
              </span>
            </div>

            {/* Daily Practical Law Tip for Citizens & Advocates */}
            <div className={`w-full p-3.5 sm:p-4 rounded-xl border text-left shadow-lg transition-colors ${
              isDark ? 'bg-[#111422] border-[#242b42]' : 'bg-white border-[#dce9ff]'
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-amber-400">lightbulb</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Daily Law for Everyday Use
                  </span>
                </div>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                  isDark ? 'bg-white/5 border-white/10 text-zinc-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}>
                  {splashTip.category}
                </span>
              </div>

              <h4 className="text-[13px] sm:text-[14px] font-bold text-[#ff7722] mb-0.5">
                {splashTip.title}
              </h4>
              <p className="text-[10.5px] font-mono text-emerald-400 font-semibold mb-1.5">
                ⚖️ {splashTip.provision}
              </p>
              <p className={`text-[11.5px] leading-relaxed mb-2.5 ${isDark ? 'text-[#cbd5e1]' : 'text-[#334155]'}`}>
                {splashTip.description}
              </p>
              <div className={`p-2 rounded-lg text-[10.5px] flex items-center gap-1.5 ${
                isDark ? 'bg-emerald-950/30 border border-emerald-900/40 text-emerald-300' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              }`}>
                <span className="material-symbols-outlined text-[14px] shrink-0 text-emerald-400">verified</span>
                <span><strong>Citizen / Advocate Rule:</strong> {splashTip.actionableTip}</span>
              </div>
            </div>
          </div>

          {/* Bottom Legal Note */}
          <div className="text-[9.5px] font-mono opacity-50 text-center">
            Grounded in Central Acts • Law Ministry Directives • Supreme Court of India
          </div>
        </div>
      )}

      {/* FIXED TOP HEADER (Exact 82px on sm+, 56px on mobile, z-[99] overflow-visible) */}
      <header id="app-header" className={`fixed top-0 left-0 right-0 z-[99] backdrop-blur-md border-b shadow-md transition-colors duration-200 overflow-visible ${
        isDark 
          ? 'bg-[#0d0f17]/95 border-[#1f2438]' 
          : 'bg-white/95 border-[#e2e8f0]'
      }`}>
        {/* Main Bar (h-14 / 56px across all viewports to minimize wasted vertical space) */}
        <div className="h-14 w-full px-2.5 sm:px-4 lg:px-5 xl:px-6 2xl:px-8 flex items-center justify-between gap-1.5 sm:gap-2.5 lg:gap-3 xl:gap-4 2xl:gap-6">
          {/* ZONE 1: BRAND IDENTITY (Left) */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <img 
              src="/logo.png" 
              alt="भारत Legal Intelligence" 
              className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg object-contain shadow-xs p-0.5 border ${
                isDark ? 'bg-[#131726] border-[#242b42]' : 'bg-white border-[#e2e8f0]'
              }`}
            />
            {/* Brand name text: HIDDEN on small screens (< sm) to free up header space */}
            <div className="hidden sm:flex flex-col">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-extrabold text-[13px] sm:text-[14px] tracking-tight text-[#ff7722]">भारत</span>
                <span className={`font-extrabold text-[13px] sm:text-[14px] tracking-tight ${
                  isDark ? 'text-white' : 'text-[#00288e]'
                }`}>
                  Legal Intelligence
                </span>
              </div>
              <span className={`text-[8.5px] font-medium leading-tight hidden md:block truncate ${
                isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'
              }`}>
                Constitutional & Statutory Platform
              </span>
            </div>

            {/* Mobile Small Screens (< sm / < 640px) Dedicated Pages Navigation Dropdown */}
            <div className="relative sm:hidden z-[100]" ref={pagesMenuRef}>
              <button
                type="button"
                onClick={() => setIsPagesMenuOpen(prev => !prev)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer shadow-xs ${
                  isDark 
                    ? 'bg-[#131624] text-white border-[#23283f] hover:bg-[#1a1f33]' 
                    : 'bg-[#eff4ff] text-[#00288e] border-[#dce9ff] hover:bg-[#e5eeff]'
                }`}
                style={{ backgroundColor: isDark ? '#131624' : '#eff4ff', opacity: 1 }}
                aria-label="Toggle Pages Navigation"
                aria-expanded={isPagesMenuOpen}
                title="Navigate Platform Pages"
              >
                <span className="material-symbols-outlined text-[16px] text-[#ff7722]">
                  {activeTab === 'chat' ? 'chat' : activeTab === 'contracts' ? 'edit_document' : activeTab === 'search' ? 'account_balance' : 'fact_check'}
                </span>
                <span className="font-semibold tracking-tight">
                  {activeTab === 'chat' ? 'Chat' : activeTab === 'contracts' ? 'Contracts' : activeTab === 'search' ? 'Search' : 'Hub'}
                </span>
                <span className={`material-symbols-outlined text-[15px] transition-transform duration-200 ${isPagesMenuOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              {isPagesMenuOpen && (
                <div 
                  className={`absolute left-0 top-full mt-2 w-72 rounded-xl shadow-2xl border p-2 z-[9999] animate-in fade-in zoom-in-95 duration-150 ${
                    isDark ? 'border-[#23283f] text-white' : 'border-[#e2e8f0] text-[#0b1c30]'
                  }`}
                  style={{ backgroundColor: isDark ? '#0f121e' : '#ffffff', opacity: 1, zIndex: 9999 }}
                >
                  <div className="px-2 py-1.5 mb-1 border-b border-zinc-700/20 flex items-center justify-between">
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      Platform Pages
                    </span>
                    <span className="text-[9px] font-mono text-[#ff7722] font-semibold">4 Modules</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    {/* Option 1: Legal Chat Assistant */}
                    <button
                      type="button"
                      onClick={() => { setActiveTab('chat'); setIsPagesMenuOpen(false); }}
                      className={`w-full px-2 py-1.5 rounded-lg text-left transition-all flex items-center justify-between cursor-pointer border ${
                        activeTab === 'chat'
                          ? isDark 
                            ? 'bg-white text-black font-bold border-white shadow-xs' 
                            : 'bg-[#00288e] text-white font-bold border-[#00288e] shadow-xs'
                          : isDark 
                            ? 'bg-[#131624] text-[#cbd5e1] hover:text-white border-[#23283f] hover:bg-[#1a1f33]' 
                            : 'bg-[#f8f9ff] text-[#334155] hover:text-[#0b1c30] border-[#e2e8f0] hover:bg-[#eff4ff]'
                      }`}
                      style={{ backgroundColor: activeTab === 'chat' ? (isDark ? '#ffffff' : '#00288e') : (isDark ? '#131624' : '#f8f9ff'), opacity: 1 }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`material-symbols-outlined text-[15px] shrink-0 ${activeTab === 'chat' ? (isDark ? 'text-black' : 'text-white') : 'text-[#ff7722]'}`}>
                          chat
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] font-bold leading-tight truncate">Chat Assistant</span>
                          <span className={`text-[8.5px] truncate ${activeTab === 'chat' ? (isDark ? 'text-black/70' : 'text-white/80') : 'text-zinc-400'}`}>
                            AI Jurist & Landmark Case Analysis
                          </span>
                        </div>
                      </div>
                      {activeTab === 'chat' && (
                        <span className="material-symbols-outlined text-[14px] shrink-0">check</span>
                      )}
                    </button>

                    {/* Option 2: AI Contract Studio */}
                    <button
                      type="button"
                      onClick={() => { setActiveTab('contracts'); setIsPagesMenuOpen(false); }}
                      className={`w-full px-2 py-1.5 rounded-lg text-left transition-all flex items-center justify-between cursor-pointer border ${
                        activeTab === 'contracts'
                          ? isDark 
                            ? 'bg-white text-black font-bold border-white shadow-xs' 
                            : 'bg-[#00288e] text-white font-bold border-[#00288e] shadow-xs'
                          : isDark 
                            ? 'bg-[#131624] text-[#cbd5e1] hover:text-white border-[#23283f] hover:bg-[#1a1f33]' 
                            : 'bg-[#f8f9ff] text-[#334155] hover:text-[#0b1c30] border-[#e2e8f0] hover:bg-[#eff4ff]'
                      }`}
                      style={{ backgroundColor: activeTab === 'contracts' ? (isDark ? '#ffffff' : '#00288e') : (isDark ? '#131624' : '#f8f9ff'), opacity: 1 }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`material-symbols-outlined text-[15px] shrink-0 ${activeTab === 'contracts' ? (isDark ? 'text-black' : 'text-white') : 'text-amber-500'}`}>
                          edit_document
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] font-bold leading-tight truncate">AI Contract Studio</span>
                          <span className={`text-[8.5px] truncate ${activeTab === 'contracts' ? (isDark ? 'text-black/70' : 'text-white/80') : 'text-zinc-400'}`}>
                            Drafting & Redline Risk Scanner
                          </span>
                        </div>
                      </div>
                      {activeTab === 'contracts' && (
                        <span className="material-symbols-outlined text-[14px] shrink-0">check</span>
                      )}
                    </button>

                    {/* Option 3: Statute & Case Search */}
                    <button
                      type="button"
                      onClick={() => { setActiveTab('search'); setIsPagesMenuOpen(false); }}
                      className={`w-full px-2 py-1.5 rounded-lg text-left transition-all flex items-center justify-between cursor-pointer border ${
                        activeTab === 'search'
                          ? isDark 
                            ? 'bg-white text-black font-bold border-white shadow-xs' 
                            : 'bg-[#00288e] text-white font-bold border-[#00288e] shadow-xs'
                          : isDark 
                            ? 'bg-[#131624] text-[#cbd5e1] hover:text-white border-[#23283f] hover:bg-[#1a1f33]' 
                            : 'bg-[#f8f9ff] text-[#334155] hover:text-[#0b1c30] border-[#e2e8f0] hover:bg-[#eff4ff]'
                      }`}
                      style={{ backgroundColor: activeTab === 'search' ? (isDark ? '#ffffff' : '#00288e') : (isDark ? '#131624' : '#f8f9ff'), opacity: 1 }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`material-symbols-outlined text-[15px] shrink-0 ${activeTab === 'search' ? (isDark ? 'text-black' : 'text-white') : 'text-[#60a5fa]'}`}>
                          account_balance
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] font-bold leading-tight truncate">Statute Search</span>
                          <span className={`text-[8.5px] truncate ${activeTab === 'search' ? (isDark ? 'text-black/70' : 'text-white/80') : 'text-zinc-400'}`}>
                            59+ Acts, Concordance & Gazettes
                          </span>
                        </div>
                      </div>
                      {activeTab === 'search' && (
                        <span className="material-symbols-outlined text-[14px] shrink-0">check</span>
                      )}
                    </button>

                    {/* Option 4: Knowledge & Validator Hub */}
                    <button
                      type="button"
                      onClick={() => { setActiveTab('info'); setIsPagesMenuOpen(false); }}
                      className={`w-full px-2 py-1.5 rounded-lg text-left transition-all flex items-center justify-between cursor-pointer border ${
                        activeTab === 'info'
                          ? isDark 
                            ? 'bg-white text-black font-bold border-white shadow-xs' 
                            : 'bg-[#00288e] text-white font-bold border-[#00288e] shadow-xs'
                          : isDark 
                            ? 'bg-[#131624] text-[#cbd5e1] hover:text-white border-[#23283f] hover:bg-[#1a1f33]' 
                            : 'bg-[#f8f9ff] text-[#334155] hover:text-[#0b1c30] border-[#e2e8f0] hover:bg-[#eff4ff]'
                      }`}
                      style={{ backgroundColor: activeTab === 'info' ? (isDark ? '#ffffff' : '#00288e') : (isDark ? '#131624' : '#f8f9ff'), opacity: 1 }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`material-symbols-outlined text-[15px] shrink-0 ${activeTab === 'info' ? (isDark ? 'text-black' : 'text-white') : 'text-emerald-400'}`}>
                          fact_check
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] font-bold leading-tight truncate">Validator Hub</span>
                          <span className={`text-[8.5px] truncate ${activeTab === 'info' ? (isDark ? 'text-black/70' : 'text-white/80') : 'text-zinc-400'}`}>
                            Truth Audit & Hash Verification
                          </span>
                        </div>
                      </div>
                      {activeTab === 'info' && (
                        <span className="material-symbols-outlined text-[14px] shrink-0">check</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ZONE 2: PRIMARY NAVIGATION (Center, Adapts Responsively across Breakpoints) */}
          <div className="hidden sm:flex items-center justify-center flex-1 min-w-0 px-1 sm:px-2">
            {/* Desktop Full Navigation Tabs (>= lg / 1024px+): Micro-Compact on Lg, Roomy & Elegant on 2xl */}
            <nav className={`hidden lg:flex items-center gap-0.5 xl:gap-1 2xl:gap-1.5 p-0.5 2xl:p-1 rounded-lg 2xl:rounded-xl border shadow-2xs ${
              isDark ? 'bg-[#131624] border-[#23283f]' : 'bg-[#eff4ff] border-[#dce9ff]'
            }`}>
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`px-2 xl:px-2.5 2xl:px-3.5 py-0.5 xl:py-1 2xl:py-1.5 rounded-md 2xl:rounded-lg text-[10.5px] xl:text-[11px] 2xl:text-[12.5px] font-medium transition-all flex items-center gap-1 2xl:gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'chat'
                    ? isDark ? 'bg-white text-black shadow-2xs font-bold' : 'bg-[#00288e] text-white shadow-2xs font-bold'
                    : isDark ? 'text-[#94a3b8] hover:text-white hover:bg-white/5' : 'text-[#565e74] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
                }`}
                title="Legal Chat Assistant"
              >
                <span className="material-symbols-outlined text-[13px] 2xl:text-[16px]">chat</span>
                <span className="tracking-tight">Chat Assistant</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('contracts')}
                className={`px-2 xl:px-2.5 2xl:px-3.5 py-0.5 xl:py-1 2xl:py-1.5 rounded-md 2xl:rounded-lg text-[10.5px] xl:text-[11px] 2xl:text-[12.5px] font-medium transition-all flex items-center gap-1 2xl:gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'contracts'
                    ? isDark ? 'bg-white text-black shadow-2xs font-bold' : 'bg-[#00288e] text-white shadow-2xs font-bold'
                    : isDark ? 'text-[#94a3b8] hover:text-white hover:bg-white/5' : 'text-[#565e74] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
                }`}
                title="AI Contract Studio & Redline Risk Scanner"
              >
                <span className="material-symbols-outlined text-[13px] 2xl:text-[16px]">edit_document</span>
                <span className="tracking-tight">AI Contract Studio</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('search')}
                className={`px-2 xl:px-2.5 2xl:px-3.5 py-0.5 xl:py-1 2xl:py-1.5 rounded-md 2xl:rounded-lg text-[10.5px] xl:text-[11px] 2xl:text-[12.5px] font-medium transition-all flex items-center gap-1 2xl:gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'search'
                    ? isDark ? 'bg-white text-black shadow-2xs font-bold' : 'bg-[#00288e] text-white shadow-2xs font-bold'
                    : isDark ? 'text-[#94a3b8] hover:text-white hover:bg-white/5' : 'text-[#565e74] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
                }`}
                title="Statute & Case Search"
              >
                <span className="material-symbols-outlined text-[13px] 2xl:text-[16px]">account_balance</span>
                <span className="tracking-tight">Statute Search</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className={`px-2 xl:px-2.5 2xl:px-3.5 py-0.5 xl:py-1 2xl:py-1.5 rounded-md 2xl:rounded-lg text-[10.5px] xl:text-[11px] 2xl:text-[12.5px] font-medium transition-all flex items-center gap-1 2xl:gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'info'
                    ? isDark ? 'bg-white text-black shadow-2xs font-bold' : 'bg-[#00288e] text-white shadow-2xs font-bold'
                    : isDark ? 'text-[#94a3b8] hover:text-white hover:bg-white/5' : 'text-[#565e74] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
                }`}
                title="Knowledge & Validator Hub"
              >
                <span className="material-symbols-outlined text-[13px] 2xl:text-[16px]">fact_check</span>
                <span className="tracking-tight">Validator Hub</span>
              </button>
            </nav>

            {/* Medium Screens Compact Segmented Bar (sm to lg: 640px - 1023px) */}
            <nav className={`flex lg:hidden items-center gap-0.5 p-0.5 rounded-lg border ${
              isDark ? 'bg-[#131624] border-[#23283f]' : 'bg-[#eff4ff] border-[#dce9ff]'
            }`}>
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  activeTab === 'chat'
                    ? isDark ? 'bg-white text-black shadow-2xs font-bold' : 'bg-[#00288e] text-white shadow-2xs font-bold'
                    : isDark ? 'text-[#94a3b8] hover:text-white hover:bg-white/5' : 'text-[#565e74] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
                }`}
                title="Legal Chat Assistant"
              >
                <span className="material-symbols-outlined text-[13px]">chat</span>
                <span>Chat</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('contracts')}
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  activeTab === 'contracts'
                    ? isDark ? 'bg-white text-black shadow-2xs font-bold' : 'bg-[#00288e] text-white shadow-2xs font-bold'
                    : isDark ? 'text-[#94a3b8] hover:text-white hover:bg-white/5' : 'text-[#565e74] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
                }`}
                title="AI Contract Studio"
              >
                <span className="material-symbols-outlined text-[13px]">edit_document</span>
                <span>Contracts</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('search')}
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  activeTab === 'search'
                    ? isDark ? 'bg-white text-black shadow-2xs font-bold' : 'bg-[#00288e] text-white shadow-2xs font-bold'
                    : isDark ? 'text-[#94a3b8] hover:text-white hover:bg-white/5' : 'text-[#565e74] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
                }`}
                title="Statute & Case Search"
              >
                <span className="material-symbols-outlined text-[13px]">account_balance</span>
                <span>Search</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  activeTab === 'info'
                    ? isDark ? 'bg-white text-black shadow-2xs font-bold' : 'bg-[#00288e] text-white shadow-2xs font-bold'
                    : isDark ? 'text-[#94a3b8] hover:text-white hover:bg-white/5' : 'text-[#565e74] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
                }`}
                title="Knowledge & Validator Hub"
              >
                <span className="material-symbols-outlined text-[13px]">fact_check</span>
                <span>Validator</span>
              </button>
            </nav>
          </div>

          {/* ZONE 3: UTILITY CONTROLS (Right, Fluid and Flexible) */}
          <div className="flex items-center gap-1.5 sm:gap-2 xl:gap-2.5 2xl:gap-3 shrink-0">
            {/* Neon pgvector Telemetry Pill (Large Desktop >= xl / 1280px+) */}
            <div className={`hidden xl:flex items-center gap-1.5 2xl:gap-2 px-2 xl:px-2.5 2xl:px-3 py-0.5 xl:py-1 rounded-full text-[10px] xl:text-[10.5px] 2xl:text-[11.5px] font-mono border shadow-2xs whitespace-nowrap ${
              isDark 
                ? 'bg-[#0d1f17] border-emerald-900/60 text-emerald-300' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              <span className="w-1.5 h-1.5 2xl:w-2 2xl:h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="font-semibold hidden 2xl:inline">Neon pgvector: Active • {totalProvisions} Provisions</span>
              <span className="font-semibold inline 2xl:hidden">Neon pgvector: {totalProvisions} Provisions</span>
            </div>

            {/* Citizen vs Advocate Mode Segmented Control (Desktop >= sm) */}
            <div className={`hidden sm:flex items-center p-0.5 2xl:p-1 rounded-full border shadow-2xs whitespace-nowrap ${
              isDark ? 'bg-[#131624] border-[#23283f]' : 'bg-[#eff4ff] border-[#dce9ff]'
            }`}>
              <button
                type="button"
                onClick={() => setMode('citizen')}
                className={`px-2.5 sm:px-3 2xl:px-4 py-0.5 xl:py-1 2xl:py-1.5 rounded-full text-[10.5px] 2xl:text-[11.5px] font-semibold transition-all cursor-pointer ${
                  mode === 'citizen'
                    ? isDark ? 'bg-white text-black shadow-md font-bold' : 'bg-[#00288e] text-white shadow-md font-bold'
                    : isDark ? 'text-[#94a3b8] hover:text-white' : 'text-[#565e74] hover:text-[#0b1c30]'
                }`}
              >
                Citizen
              </button>
              <button
                type="button"
                onClick={() => setMode('professional')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 2xl:px-4 py-0.5 xl:py-1 2xl:py-1.5 rounded-full text-[10.5px] 2xl:text-[11.5px] font-semibold transition-all cursor-pointer ${
                  mode === 'professional'
                    ? isDark ? 'bg-white text-black shadow-md font-bold' : 'bg-[#00288e] text-white shadow-md font-bold'
                    : isDark ? 'text-[#94a3b8] hover:text-white' : 'text-[#565e74] hover:text-[#0b1c30]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Advocate</span>
              </button>
            </div>

            {/* Compact Mode Switch Icon (< sm) */}
            <button
              type="button"
              onClick={() => setMode(mode === 'citizen' ? 'professional' : 'citizen')}
              className={`sm:hidden w-8 h-8 rounded-lg border text-[10px] font-mono font-bold flex items-center justify-center cursor-pointer shadow-2xs ${
                isDark ? 'bg-[#131624] border-[#23283f] text-white' : 'bg-[#eff4ff] border-[#dce9ff] text-[#00288e]'
              }`}
              title={`Switch Mode (Current: ${mode})`}
            >
              {mode === 'citizen' ? 'CU' : 'AC'}
            </button>

            {/* THEME TOGGLE SWITCH (Light / Dark) */}
            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto sm:px-2.5 2xl:px-3.5 sm:py-0.5 xl:py-1 2xl:py-1.5 rounded-full text-[10.5px] 2xl:text-[12px] font-semibold transition-all border cursor-pointer shadow-2xs whitespace-nowrap ${
                isDark 
                  ? 'bg-[#131624] hover:bg-[#1a1f33] text-amber-300 border-[#23283f] hover:border-amber-400/40' 
                  : 'bg-[#eff4ff] hover:bg-[#e5eeff] text-[#00288e] border-[#dce9ff] hover:border-[#00288e]/30'
              }`}
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle Theme"
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[17px] 2xl:text-[19px]">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
              <span className="hidden md:inline font-mono text-[10.5px] 2xl:text-[11.5px] ml-1 2xl:ml-1.5 font-bold">
                {isDark ? 'Light' : 'Dark'}
              </span>
            </button>

            {/* Chamber Dossiers Action Button */}
            <button
              type="button"
              onClick={() => setIsDossiersOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 2xl:px-3.5 sm:py-1 xl:py-1.5 2xl:py-2 rounded-xl text-[10.5px] xl:text-[11px] 2xl:text-[12px] font-medium border transition-colors cursor-pointer shadow-xs whitespace-nowrap ${
                isDark 
                  ? 'bg-[#131624] text-[#e2e8f0] border-[#23283f] hover:bg-[#1a1f33]' 
                  : 'bg-[#eff4ff] text-[#0b1c30] border-[#dce9ff] hover:bg-[#e5eeff]'
              }`}
              title="Open Chamber Dossiers Repository"
            >
              <span className="material-symbols-outlined text-[16px] 2xl:text-[19px] text-[#60a5fa]">folder_special</span>
              <span className="hidden sm:inline font-bold">Dossiers</span>
              <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] 2xl:text-[10px] font-extrabold shadow-xs ${
                isDark ? 'bg-white text-black' : 'bg-[#00288e] text-white'
              }`}>
                {dossierCount}
              </span>
            </button>
          </div>
        </div>

        {/* Secondary Statutory Sub-Header (Ticker Bar - h-6.5 sm:h-7 / 26px, hidden on small mobile to maximize screen) */}
        <div id="statutory-ticker" className={`h-6.5 sm:h-7 w-full border-t overflow-hidden transition-colors ${
          isDark 
            ? 'bg-[#06070a] border-[#1a1e2e] text-[#94a3b8]' 
            : 'bg-[#f8f9ff] border-[#e2e8f0] text-[#565e74]'
        }`}>
          <div className="w-full h-full px-2.5 sm:px-4 lg:px-5 xl:px-6 2xl:px-8 hidden sm:flex items-center justify-between text-[10px] 2xl:text-[11px] font-mono">
            <div className="flex items-center gap-2 truncate">
              <span className={`px-1.5 py-0.2 rounded font-bold uppercase tracking-wider text-[8.5px] 2xl:text-[9.5px] border shrink-0 ${
                isDark 
                  ? 'bg-white/10 text-white border-white/15' 
                  : 'bg-[#00288e]/10 text-[#00288e] border-[#00288e]/20'
              }`}>
                Statutory Engine
              </span>
              <span className={`truncate ${isDark ? 'text-[#cbd5e1]' : 'text-[#334155]'}`}>
                Institutional Legal Intelligence Engine • Aligned with BNS 2023, BNSS 2023 & Constitution of India
              </span>
            </div>
            <div className={`hidden lg:flex items-center gap-3 shrink-0 ${
              isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'
            }`}>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                AIR / SCC Benchmarks: Synced
              </span>
              <span>•</span>
              <span>Art. 141 Binding Precedent</span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN SCREEN CANVAS (Responsive top padding: 56px on mobile, 82px on sm+) */}
      <div className="pt-14 sm:pt-[82px] flex-1 flex flex-col min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-82px)] w-full">
        <main className={`flex-1 flex flex-col w-full transition-colors duration-200 ${
          isDark ? 'bg-[#090a0f]' : 'bg-[#f4f6fb]'
        }`}>
          {activeTab === 'chat' && (
            <ChatView 
              apiBase={API_BASE} 
              mode={mode} 
              setMode={setMode} 
              totalProvisions={totalProvisions}
              theme={theme}
              activeTab={activeTab}
              onSelectTab={(tab) => setActiveTab(tab)}
              launchContext={chatLaunchContext}
              onClearLaunchContext={() => setChatLaunchContext(null)}
              onSwitchToSearch={(query?: string) => {
                setSearchInitialQuery(query || null);
                setActiveTab('search');
              }} 
              geminiApiKey={geminiApiKey}
            />
          )}
          {activeTab === 'contracts' && (
            <ContractStudioView 
              isDark={isDark} 
              mode={mode} 
              apiBase={API_BASE}
            />
          )}
          {activeTab === 'search' && (
            <SearchView 
              apiBase={API_BASE} 
              theme={theme}
              initialQuery={searchInitialQuery || undefined}
              onClearInitialQuery={() => setSearchInitialQuery(null)}
              onOpenInChat={(ctx) => {
                setChatLaunchContext(ctx);
                setActiveTab('chat');
              }} 
            />
          )}
          {activeTab === 'info' && (
            <InfoView 
              apiBase={API_BASE} 
              theme={theme}
            />
          )}
        </main>
      </div>

      {/* Chamber Dossiers Slide-Over Drawer */}
      <DossiersDrawer
        isOpen={isDossiersOpen}
        onClose={() => setIsDossiersOpen(false)}
        apiBase={API_BASE}
        theme={theme}
        onDossierCountChange={setDossierCount}
        onLoadInChat={(dossier) => {
          setChatLaunchContext({
            type: 'dossier',
            title: dossier.title,
            query: dossier.initial_query || `Docket ${dossier.docket_number}: ${dossier.title}`,
            category: dossier.category,
            autoExecute: false,
            dossier: dossier
          });
          setActiveTab('chat');
          setIsDossiersOpen(false);
        }}
      />
    </div>
  );
}

export default App;
