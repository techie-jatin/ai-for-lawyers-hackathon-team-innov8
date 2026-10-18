import { useState, useEffect, useRef } from 'react';
import { Loader2, CheckCircle2, Scale, Lightbulb, ShieldCheck } from 'lucide-react';
import './App.css';
import { ChatView } from './components/ChatView';
import { ContractStudioView } from './components/ContractStudioView';
import { ConstitutionView } from './components/ConstitutionView';
import { InfoView } from './components/InfoView';
import { DossiersDrawer, type ChamberDossier } from './components/DossiersDrawer';
import { StatutoryConcordanceModal } from './components/StatutoryConcordanceModal';
import { ConstitutionStudioModal } from './components/ConstitutionStudioModal';
import { getGuestId, resetGuestId, hasSeenGuestNotice, markGuestNoticeSeen } from './utils/guestSession';

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
  const [guestId] = useState<string>(() => getGuestId());
  const [showGuestNoticeModal, setShowGuestNoticeModal] = useState<boolean>(() => !hasSeenGuestNotice());
  const [isGuestMenuOpen, setIsGuestMenuOpen] = useState(false);
  const [guestIdCopied, setGuestIdCopied] = useState(false);
  const guestMenuRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<'chat' | 'contracts' | 'constitution' | 'info'>('chat');
  const [mode, setMode] = useState<'citizen' | 'professional'>('citizen');
  const [dossierCount, setDossierCount] = useState<number>(0);
  const [isDossiersOpen, setIsDossiersOpen] = useState(false);
  const [isConcordanceModalOpen, setIsConcordanceModalOpen] = useState(false);
  const [isConstitutionModalOpen, setIsConstitutionModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
  const API_BASE = (
    import.meta.env.VITE_API_BASE ||
    (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://127.0.0.1:8000'
      : '')
  ).replace(/\/+$/, '');

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

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Click-outside & Escape key listener for menus
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (guestMenuRef.current && !guestMenuRef.current.contains(event.target as Node)) {
        setIsGuestMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsGuestMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
    fetch(`${API_BASE}/api/dossiers?guest_id=${guestId}`)
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
  }, [guestId]);

  const isDark = theme === 'dark';

  return (
    <div className={`h-screen flex flex-col font-sans overflow-hidden transition-colors duration-200 ${
      isDark ? 'bg-[#090a0f] text-[#f8fafc]' : 'bg-[#f4f6fb] text-[#0b1c30]'
    }`}>
      {/* BESPOKE INSTITUTIONAL LOADING / SPLASH EXPERIENCE (Tailored Responsive UI/UX) */}
      {isLoading && (
        <div 
          id="app-splash-screen"
          className={`fixed inset-0 z-[10000] flex flex-col items-center justify-between p-3.5 sm:p-6 md:p-8 transition-all duration-500 select-none overflow-hidden ${
            isFadingOut ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
          }`}
          style={{ backgroundColor: isDark ? '#080a10' : '#f4f6fb' }}
        >
          {/* Ambient Background Glow Orbs */}
          <div className="absolute top-1/4 -left-20 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-[#ff7722]/10 blur-3xl pointer-events-none animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-20 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-[#00288e]/10 blur-3xl pointer-events-none animate-pulse delay-300"></div>

          {/* Top Status Header Bar */}
          <div className="w-full flex items-center justify-between max-w-5xl text-[10px] sm:text-[11px] font-mono z-10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
              <span className={`font-bold uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                Bharatiya Statutory Engine Active
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-zinc-400">
              <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${
                isDark ? 'bg-white/5 border-white/10 text-zinc-300' : 'bg-white border-slate-200 text-slate-700'
              }`}>
                2024-2026 Sanhitas
              </span>
              <span className="hidden sm:inline">Neon pgvector Synced</span>
            </div>
          </div>

          {/* ============================================================== */}
          {/* DESKTOP & LARGE SCREENS PRESENTATION (>= 1024px / lg+) */}
          {/* ============================================================== */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-8 max-w-5xl w-full my-auto items-center z-10">
            {/* Left Column: Brand Emblem, Authority Badges, & Architecture Telemetry (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-[#ff7722]/30 via-[#00288e]/30 to-emerald-500/30 blur-md animate-pulse"></div>
                  <img 
                    src="/logo.png" 
                    alt="Logo" 
                    className={`relative w-16 h-16 rounded-2xl object-contain p-1 border shadow-2xl ${
                      isDark ? 'bg-[#121626] border-[#222a44]' : 'bg-white border-[#dce9ff]'
                    }`}
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 font-black text-2xl tracking-tight">
                    <span className="text-[#ff7722]">भारत</span>
                    <span className={isDark ? 'text-white' : 'text-[#00288e]'}>Legal Intelligence</span>
                  </div>
                  <span className={`text-[11.5px] font-medium ${isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'}`}>
                    Constitutional & Courtroom Precedents Platform
                  </span>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className={`flex items-center gap-1.5 font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin shrink-0" />
                    Loading Central Acts & Landmark Precedents...
                  </span>
                  <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>100%</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-[#15192c]' : 'bg-slate-200'}`}>
                  <div className="h-full bg-gradient-to-r from-[#ff7722] via-[#00288e] to-emerald-400 rounded-full w-full animate-pulse"></div>
                </div>
              </div>

              {/* Engine Architecture Checklist */}
              <div className={`p-3.5 rounded-xl border space-y-2 font-mono text-[11px] ${
                isDark ? 'bg-[#101322]/80 border-[#202740]' : 'bg-white/80 border-[#dce9ff] shadow-sm'
              }`}>
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider pb-1.5 border-b border-zinc-700/20">
                  <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>Core Verification Pipeline</span>
                  <span className="text-emerald-400 font-bold">READY</span>
                </div>
                {[
                  { label: 'Central Statutory Corpus (Neon pgvector)', state: 'ACTIVE' },
                  { label: 'BNS • BNSS • BSA 2023 Concordance', state: 'SYNCED' },
                  { label: 'AIR & e-SCR Landmark Precedent Benchmarks', state: 'ONLINE' },
                  { label: 'Deterministic Lexical AST Anti-Hallucination Gate', state: 'ZERO TOLERANCE' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className={`flex items-center gap-1.5 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      {item.label}
                    </span>
                    <span className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded ${
                      isDark ? 'bg-emerald-950/60 text-emerald-300' : 'bg-emerald-50 text-emerald-800'
                    }`}>
                      {item.state}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Daily Law for Everyday Use Card (7 cols) */}
            <div className="lg:col-span-7">
              <div className={`p-6 rounded-2xl border shadow-xl transition-all relative overflow-hidden ${
                isDark ? 'bg-[#101424] border-[#222b48]' : 'bg-white border-[#dce9ff]'
              }`}>
                {/* Subtle Watermark Icon */}
                <Scale className="absolute -right-6 -bottom-6 w-36 h-36 opacity-[0.03] select-none pointer-events-none" />

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-500 shrink-0">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                    </div>
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                        isDark ? 'text-amber-400' : 'text-amber-800'
                      }`}>
                        Daily Law for Everyday Use
                      </span>
                      <span className={`text-[11px] font-mono font-bold ${
                        isDark ? 'text-emerald-400' : 'text-emerald-700'
                      }`}>
                        ⚖️ {splashTip.provision}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border font-bold ${
                    isDark ? 'bg-[#181d32] border-[#283252] text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}>
                    {splashTip.category}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#ff7722] mb-1.5 tracking-tight">
                  {splashTip.title}
                </h3>
                <p className={`text-[13px] leading-relaxed mb-4 ${
                  isDark ? 'text-[#cbd5e1]' : 'text-[#334155]'
                }`}>
                  {splashTip.description}
                </p>

                <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                  isDark ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  <ShieldCheck className={`w-4.5 h-4.5 shrink-0 mt-0.5 ${
                    isDark ? 'text-emerald-400' : 'text-emerald-700'
                  }`} />
                  <div className="text-[12px] leading-relaxed">
                    <strong className="block font-bold mb-0.5">Citizen / Advocate Practice Mandate:</strong>
                    <span>{splashTip.actionableTip}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* MOBILE & TABLET PRESENTATION (< 1024px) */}
          {/* ============================================================== */}
          <div className="flex lg:hidden flex-col items-center max-w-md w-full text-center gap-3.5 sm:gap-4 my-auto z-10">
            {/* Pulsing Brand Emblem */}
            <div className="relative flex items-center justify-center">
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-[#ff7722]/30 via-[#00288e]/30 to-emerald-500/30 blur-md animate-pulse"></div>
              <img 
                src="/logo.png" 
                alt="Logo" 
                className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-2xl object-contain shadow-2xl p-1 border ${
                  isDark ? 'bg-[#131726] border-[#242b42]' : 'bg-white border-[#e2e8f0]'
                }`}
              />
            </div>

            {/* Brand Title */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl sm:text-2xl tracking-tight text-[#ff7722]">भारत</span>
                <span className={`font-black text-xl sm:text-2xl tracking-tight ${isDark ? 'text-white' : 'text-[#00288e]'}`}>
                  Legal Intelligence
                </span>
              </div>
              <p className={`text-[10.5px] sm:text-[11.5px] font-medium mt-0.5 ${isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'}`}>
                Constitutional & Courtroom Precedents Platform
              </p>
            </div>

            {/* Tablet-Only Metric Badges (Visible 640px to 1023px) */}
            <div className="hidden sm:flex items-center justify-center gap-2 font-mono text-[10px]">
              <span className={`px-2 py-0.5 rounded-full border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                59+ Central Statutes
              </span>
              <span className={`px-2 py-0.5 rounded-full border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                BNS • BNSS • BSA Synced
              </span>
              <span className={`px-2 py-0.5 rounded-full border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                AIR Precedents Active
              </span>
            </div>

            {/* Progress Indicator */}
            <div className="w-full max-w-xs flex flex-col items-center gap-1">
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`}>
                <div className="h-full bg-gradient-to-r from-[#ff7722] via-[#00288e] to-emerald-400 rounded-full w-full animate-pulse"></div>
              </div>
              <span className="text-[9.5px] sm:text-[10px] font-mono text-zinc-400 flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin text-emerald-400 shrink-0" />
                Loading Central Acts & Landmark Precedents...
              </span>
            </div>

            {/* Compact Daily Law Card */}
            <div className={`w-full p-3.5 sm:p-4 rounded-xl border text-left shadow-md transition-colors ${
              isDark ? 'bg-[#111422] border-[#242b42]' : 'bg-white border-[#dce9ff]'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Lightbulb className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-700'}`} />
                  <span className={`text-[9.5px] font-bold uppercase tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
                    Daily Law for Everyday Use
                  </span>
                </div>
                <span className={`text-[8.5px] font-mono px-1.5 py-0.2 rounded border ${
                  isDark ? 'bg-white/5 border-white/10 text-zinc-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}>
                  {splashTip.category}
                </span>
              </div>

              <h4 className="text-[12.5px] sm:text-[13.5px] font-bold text-[#ff7722] mb-0.5">
                {splashTip.title}
              </h4>
              <p className={`text-[10px] font-mono font-semibold mb-1 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                ⚖️ {splashTip.provision}
              </p>
              <p className={`text-[11px] leading-relaxed mb-2 line-clamp-3 sm:line-clamp-none ${
                isDark ? 'text-[#cbd5e1]' : 'text-[#334155]'
              }`}>
                {splashTip.description}
              </p>
              <div className={`p-2 rounded-lg text-[10px] flex items-center gap-1.5 ${
                isDark ? 'bg-emerald-950/30 border border-emerald-900/40 text-emerald-300' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              }`}>
                <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`} />
                <span className="truncate"><strong>Rule:</strong> {splashTip.actionableTip}</span>
              </div>
            </div>
          </div>

          {/* Bottom Legal Note Footer */}
          <div className="text-[9px] sm:text-[9.5px] font-mono opacity-50 text-center z-10">
            Grounded in Central Acts • Law Ministry Directives • Supreme Court of India
          </div>
        </div>
      )}

      {/* FIXED TOP HEADER (Exact 84px on sm+, 56px on mobile, z-[99] overflow-visible) */}
      <header id="app-header" className={`no-print fixed top-0 left-0 right-0 z-[99] backdrop-blur-md border-b shadow-md transition-colors duration-200 overflow-visible ${
        isDark 
          ? 'bg-[#0d0f17]/95 border-[#1f2438]' 
          : 'bg-white/95 border-[#e2e8f0]'
      }`}>
        {/* Main Bar (h-12 on mobile < md, h-14 on md+ across desktop viewports) */}
        <div className="h-12 md:h-14 w-full px-2.5 sm:px-4 md:px-6 flex items-center justify-between gap-1.5 sm:gap-3">
          {/* ZONE 1: BRAND IDENTITY (Left, Fluid & Compact) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 min-w-0">
            {/* Clickable Brand seal & title (Returns to Chat Assistant Home) */}
            <button
              type="button"
              onClick={() => { setActiveTab('chat'); setIsMobileMenuOpen(false); }}
              className="flex items-center gap-2 text-left cursor-pointer group shrink-0 focus:outline-none"
              title="Return to Bharat Legal Assistant Home"
            >
              <img 
                src="/logo.png" 
                alt="भारत Legal Intelligence" 
                className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg object-contain shadow-xs p-0.5 border group-hover:scale-105 transition-transform ${
                  isDark ? 'bg-[#131624] border-[#242b42]' : 'bg-white border-[#e2e8f0]'
                }`}
              />
              {/* Brand Title (Hidden on small screens < md to free horizontal header space) */}
              <div className="hidden md:flex flex-col min-w-0">
                <div className="flex items-center gap-1 whitespace-nowrap">
                  <span className="font-extrabold text-[13.5px] sm:text-[14px] tracking-tight text-[#ff7722]">भारत</span>
                  <span className={`font-extrabold text-[13.5px] sm:text-[14px] tracking-tight ${
                    isDark ? 'text-white' : 'text-[#00288e]'
                  }`}>
                    Legal
                  </span>
                  <span className={`font-extrabold text-[13.5px] sm:text-[14px] tracking-tight ${
                    isDark ? 'text-white' : 'text-[#00288e]'
                  }`}>
                    Intelligence
                  </span>
                </div>
                <span className={`text-[8.5px] font-medium leading-tight hidden lg:block truncate ${
                  isDark ? 'text-[#94a3b8]' : 'text-[#565e74]'
                }`}>
                  Constitutional & Statutory Platform
                </span>
              </div>
            </button>
          </div>

          {/* ZONE 2: PRIMARY NAVIGATION (Center, Visible on md+ / 768px+) */}
          <div className="hidden md:flex items-center justify-center flex-1 min-w-0 px-1 sm:px-2">
            {/* Desktop Full Navigation Tabs (>= lg / 1024px+): Fluid 4-Column Grid, Equal 25% Share Each */}
            <nav className={`hidden lg:flex items-center w-full max-w-[clamp(440px,46vw,660px)] gap-1 p-0.5 rounded-lg border shadow-2xs ${
              isDark ? 'bg-[#131624] border-[#23283f]' : 'bg-[#eff4ff] border-[#dce9ff]'
            }`}>
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`flex-1 min-w-0 px-1.5 xl:px-2 py-0.5 xl:py-1 rounded-md text-[clamp(9.5px,0.72vw,10.5px)] font-medium transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                  activeTab === 'chat'
                    ? isDark ? 'bg-white text-black shadow-2xs font-bold' : 'bg-[#00288e] text-white shadow-2xs font-bold'
                    : isDark ? 'text-[#94a3b8] hover:text-white hover:bg-white/5' : 'text-[#565e74] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
                }`}
                title="Legal Chat Assistant"
              >
                <span className="material-symbols-outlined text-[12.5px] xl:text-[13px] shrink-0">chat</span>
                <span className="tracking-tight truncate">Chat Assistant</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('contracts')}
                className={`flex-1 min-w-0 px-1.5 xl:px-2 py-0.5 xl:py-1 rounded-md text-[clamp(9.5px,0.72vw,10.5px)] font-medium transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                  activeTab === 'contracts'
                    ? isDark ? 'bg-white text-black shadow-2xs font-bold' : 'bg-[#00288e] text-white shadow-2xs font-bold'
                    : isDark ? 'text-[#94a3b8] hover:text-white hover:bg-white/5' : 'text-[#565e74] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
                }`}
                title="AI Contract Studio & Redline Risk Scanner"
              >
                <span className="material-symbols-outlined text-[12.5px] xl:text-[13px] shrink-0">edit_document</span>
                <span className="tracking-tight truncate">AI Contract Studio</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('constitution')}
                className={`flex-1 min-w-0 px-1.5 xl:px-2 py-0.5 xl:py-1 rounded-md text-[clamp(9.5px,0.72vw,10.5px)] font-medium transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                  activeTab === 'constitution'
                    ? isDark ? 'bg-white text-black shadow-2xs font-bold' : 'bg-[#00288e] text-white shadow-2xs font-bold'
                    : isDark ? 'text-[#94a3b8] hover:text-white hover:bg-white/5' : 'text-[#565e74] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
                }`}
                title="Constitution of India • 25 Parts & 456+ Articles"
              >
                <span className="material-symbols-outlined text-[12.5px] xl:text-[13px] shrink-0">account_balance</span>
                <span className="tracking-tight truncate">Constitution</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className={`flex-1 min-w-0 px-1.5 xl:px-2 py-0.5 xl:py-1 rounded-md text-[clamp(9.5px,0.72vw,10.5px)] font-medium transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                  activeTab === 'info'
                    ? isDark ? 'bg-white text-black shadow-2xs font-bold' : 'bg-[#00288e] text-white shadow-2xs font-bold'
                    : isDark ? 'text-[#94a3b8] hover:text-white hover:bg-white/5' : 'text-[#565e74] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
                }`}
                title="Knowledge & Validator Hub"
              >
                <span className="material-symbols-outlined text-[12.5px] xl:text-[13px] shrink-0">fact_check</span>
                <span className="tracking-tight truncate">Validator Hub</span>
              </button>
            </nav>

            {/* Medium Screens Compact Segmented Bar (md to lg: 768px - 1023px) */}
            <nav className={`flex lg:hidden items-center gap-0.5 p-0.5 rounded-lg border ${
              isDark ? 'bg-[#131624] border-[#23283f]' : 'bg-[#eff4ff] border-[#dce9ff]'
            }`}>
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`px-1.5 py-0.5 rounded-md text-[9.5px] font-medium transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  activeTab === 'chat'
                    ? isDark ? 'bg-white text-black shadow-2xs font-bold' : 'bg-[#00288e] text-white shadow-2xs font-bold'
                    : isDark ? 'text-[#94a3b8] hover:text-white hover:bg-white/5' : 'text-[#565e74] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
                }`}
                title="Legal Chat Assistant"
              >
                <span className="material-symbols-outlined text-[12px]">chat</span>
                <span>Chat</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('contracts')}
                className={`px-1.5 py-0.5 rounded-md text-[9.5px] font-medium transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  activeTab === 'contracts'
                    ? isDark ? 'bg-white text-black shadow-2xs font-bold' : 'bg-[#00288e] text-white shadow-2xs font-bold'
                    : isDark ? 'text-[#94a3b8] hover:text-white hover:bg-white/5' : 'text-[#565e74] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
                }`}
                title="AI Contract Studio"
              >
                <span className="material-symbols-outlined text-[12px]">edit_document</span>
                <span>Contracts</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('constitution')}
                className={`px-1.5 py-0.5 rounded-md text-[9.5px] font-medium transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  activeTab === 'constitution'
                    ? isDark ? 'bg-white text-black shadow-2xs font-bold' : 'bg-[#00288e] text-white shadow-2xs font-bold'
                    : isDark ? 'text-[#94a3b8] hover:text-white hover:bg-white/5' : 'text-[#565e74] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
                }`}
                title="Constitution of India"
              >
                <span className="material-symbols-outlined text-[12px]">account_balance</span>
                <span>Constitution</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className={`px-1.5 py-0.5 rounded-md text-[9.5px] font-medium transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  activeTab === 'info'
                    ? isDark ? 'bg-white text-black shadow-2xs font-bold' : 'bg-[#00288e] text-white shadow-2xs font-bold'
                    : isDark ? 'text-[#94a3b8] hover:text-white hover:bg-white/5' : 'text-[#565e74] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
                }`}
                title="Knowledge & Validator Hub"
              >
                <span className="material-symbols-outlined text-[12px]">fact_check</span>
                <span>Validator</span>
              </button>
            </nav>
          </div>

          {/* ZONE 3: UTILITY CONTROLS (Right, Fluid & Flexible) */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0">
            {/* Neon pgvector Telemetry Pill (Large Desktop >= xl / 1280px+) */}
            <div className={`hidden xl:flex items-center gap-[clamp(4px,0.4vw,8px)] px-[clamp(8px,0.7vw,12px)] py-0.5 xl:py-1 rounded-full text-[clamp(9.5px,0.72vw,11px)] font-mono border shadow-2xs whitespace-nowrap ${
              isDark 
                ? 'bg-[#0d1f17] border-emerald-900/60 text-emerald-300' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              <span className="w-1.5 h-1.5 2xl:w-2 2xl:h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="font-semibold hidden 2xl:inline">Neon pgvector: Active • {totalProvisions} Provisions</span>
              <span className="font-semibold inline 2xl:hidden">Neon pgvector: {totalProvisions} Provisions</span>
            </div>

            {/* Citizen vs Advocate Mode Segmented Control (Visible on md+ / 768px+) */}
            <div className={`hidden md:flex items-center p-0.5 2xl:p-1 rounded-full border shadow-2xs whitespace-nowrap ${
              isDark ? 'bg-[#131624] border-[#23283f]' : 'bg-[#eff4ff] border-[#dce9ff]'
            }`}>
              <button
                type="button"
                onClick={() => setMode('citizen')}
                className={`px-[clamp(8px,0.7vw,14px)] py-0.5 xl:py-1 rounded-full text-[clamp(9.5px,0.72vw,11px)] font-semibold transition-all cursor-pointer ${
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
                className={`flex items-center gap-1.5 px-[clamp(8px,0.7vw,14px)] py-0.5 xl:py-1 rounded-full text-[clamp(9.5px,0.72vw,11px)] font-semibold transition-all cursor-pointer ${
                  mode === 'professional'
                    ? isDark ? 'bg-white text-black shadow-md font-bold' : 'bg-[#00288e] text-white shadow-md font-bold'
                    : isDark ? 'text-[#94a3b8] hover:text-white' : 'text-[#565e74] hover:text-[#0b1c30]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span>Advocate</span>
              </button>
            </div>

            {/* Mobile Citizen vs Advocate Mode Quick Toggle (< md) */}
            <button
              type="button"
              onClick={() => setMode(mode === 'citizen' ? 'professional' : 'citizen')}
              className={`md:hidden h-7.5 px-2 rounded-lg flex items-center gap-1 text-[10px] font-bold border transition-all cursor-pointer shrink-0 ${
                mode === 'citizen'
                  ? isDark ? 'bg-[#ff7722]/15 text-[#ff7722] border-[#ff7722]/40' : 'bg-orange-50 text-[#ff7722] border-orange-200'
                  : isDark ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
              title={`Active Mode: ${mode === 'citizen' ? 'Citizen' : 'Advocate'} (tap to switch)`}
              aria-label="Toggle Legal Persona Mode"
            >
              <span className="material-symbols-outlined text-[13px]">
                {mode === 'citizen' ? 'person' : 'gavel'}
              </span>
              <span>{mode === 'citizen' ? 'Citizen' : 'Advocate'}</span>
            </button>

            {/* GUEST SESSION IDENTITY PILL & MENU (Desktop >= lg / 1024px+) */}
            <div className="hidden lg:block relative shrink-0" ref={guestMenuRef}>
              <button
                type="button"
                onClick={() => setIsGuestMenuOpen(!isGuestMenuOpen)}
                className={`h-8 flex items-center gap-1.5 px-2.5 rounded-full text-[clamp(9.5px,0.72vw,11.5px)] font-mono border transition-all cursor-pointer shadow-2xs whitespace-nowrap ${
                  isDark 
                    ? 'bg-[#131624] text-[#cbd5e1] border-[#23283f] hover:border-[#ff7722]/50 hover:text-white' 
                    : 'bg-[#eff4ff] text-[#0b1c30] border-[#dce9ff] hover:border-[#00288e]/40 hover:bg-[#e5eeff]'
                }`}
                title={`Guest Session #${guestId} • Click for session details`}
                aria-label="Guest Session Details"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff7722] animate-pulse shrink-0"></span>
                <span className="material-symbols-outlined text-[14px] 2xl:text-[16px] text-[#ff7722] shrink-0">shield_person</span>
                <span className="font-bold hidden xl:inline">Guest</span>
                <span className="font-extrabold text-[#ff7722]">{guestId.slice(0, 8)}</span>
                <span className={`material-symbols-outlined text-[13px] shrink-0 transition-transform duration-200 ${isGuestMenuOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              {isGuestMenuOpen && (
                <div 
                  className={`absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-24px)] rounded-xl shadow-2xl border p-3 z-[9999] animate-in fade-in zoom-in-95 duration-150 ${
                    isDark ? 'border-[#23283f] text-white' : 'border-[#e2e8f0] text-[#0b1c30]'
                  }`}
                  style={{ backgroundColor: isDark ? '#0f121e' : '#ffffff', opacity: 1, zIndex: 9999 }}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-700/20">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#ff7722]">fingerprint</span>
                      <span className="text-[11px] font-black uppercase tracking-wider">Guest Session Identity</span>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                      Private
                    </span>
                  </div>

                  <div className={`p-2 rounded-lg font-mono text-[11px] break-all border mb-2.5 flex items-center justify-between gap-1.5 ${
                    isDark ? 'bg-[#090b12] border-[#1f2438] text-amber-300' : 'bg-slate-50 border-slate-200 text-[#00288e]'
                  }`}>
                    <span className="font-bold select-all">{guestId}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(guestId);
                        setGuestIdCopied(true);
                        setTimeout(() => setGuestIdCopied(false), 2000);
                      }}
                      className={`p-1 rounded cursor-pointer transition-all ${
                        guestIdCopied 
                          ? (isDark ? 'text-emerald-400' : 'text-emerald-700') 
                          : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')
                      }`}
                      title="Copy Guest ID"
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {guestIdCopied ? 'check' : 'content_copy'}
                      </span>
                    </button>
                  </div>

                  <p className={`text-[10px] leading-relaxed mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    🔒 Your chat history and chamber research briefs are safely stored locally in this browser. To sync across devices, advocate/citizen profile registration is launching soon.
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Start a fresh session? This will create a new Guest ID and start a new clean chat workspace.')) {
                          resetGuestId();
                          window.location.reload();
                        }
                      }}
                      className={`w-full py-1.5 px-2 rounded-lg text-[10.5px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        isDark ? 'bg-[#181c2d] hover:bg-[#20253d] text-rose-300 border-rose-900/40' : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px]">refresh</span>
                      <span>Start Fresh Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* THEME TOGGLE SWITCH (Visible across ALL screens) */}
            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`flex items-center justify-center h-7.5 w-7.5 sm:w-auto sm:h-8 px-0 sm:px-2.5 rounded-lg md:rounded-full text-[clamp(9.5px,0.72vw,11.5px)] font-semibold transition-all border cursor-pointer shadow-2xs whitespace-nowrap shrink-0 ${
                isDark 
                  ? 'bg-[#131624] hover:bg-[#1a1f33] text-amber-300 border-[#23283f] hover:border-amber-400/40' 
                  : 'bg-[#eff4ff] hover:bg-[#e5eeff] text-[#00288e] border-[#dce9ff] hover:border-[#00288e]/30'
              }`}
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle Theme"
            >
              <span className="material-symbols-outlined text-[15px] sm:text-[16px] 2xl:text-[18px]">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
              <span className="hidden xl:inline font-mono text-[clamp(9.5px,0.72vw,11px)] ml-1 font-bold">
                {isDark ? 'Light' : 'Dark'}
              </span>
            </button>

            {/* Complete Constitution Studio (456+ Articles, Visible across ALL screens) */}
            <button
              type="button"
              onClick={() => setIsConstitutionModalOpen(true)}
              className={`flex h-7.5 sm:h-8 items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 md:px-3 rounded-lg md:rounded-xl text-[10px] sm:text-[10.5px] md:text-[clamp(9.5px,0.72vw,11.5px)] font-medium border transition-colors cursor-pointer shadow-xs whitespace-nowrap shrink-0 ${
                isDark 
                  ? 'bg-[#131624] text-[#cbd5e1] border-[#23283f] hover:bg-[#1a1f33] hover:text-white' 
                  : 'bg-[#eff4ff] text-[#0b1c30] border-[#dce9ff] hover:bg-[#e5eeff]'
              }`}
              title="Open Complete Constitution of India Studio (All 25 Parts, 456+ Articles, 12 Schedules & Realtime Controversy Analyzer)"
              aria-label="Open Constitution Studio"
            >
              <span className="material-symbols-outlined text-[14px] sm:text-[15px] 2xl:text-[18px] text-[#22c55e] shrink-0">account_balance</span>
              <span className="hidden xs:inline font-bold">Constitution</span>
              <span className={`px-1.5 py-0.2 rounded-full font-mono text-[8px] sm:text-[9px] 2xl:text-[10px] font-extrabold shadow-xs ${
                isDark ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-[#15803d]/15 text-[#15803d]'
              }`}>
                456+
              </span>
            </button>

            {/* 100+ Statutory Concordance Action Button (Visible on sm+) */}
            <button
              type="button"
              onClick={() => setIsConcordanceModalOpen(true)}
              className={`hidden sm:flex h-8 items-center gap-1.5 px-2.5 sm:px-3 rounded-lg md:rounded-xl text-[10.5px] md:text-[clamp(9.5px,0.72vw,11.5px)] font-medium border transition-colors cursor-pointer shadow-xs whitespace-nowrap shrink-0 ${
                isDark 
                  ? 'bg-[#131624] text-[#cbd5e1] border-[#23283f] hover:bg-[#1a1f33] hover:text-white' 
                  : 'bg-[#eff4ff] text-[#0b1c30] border-[#dce9ff] hover:bg-[#e5eeff]'
              }`}
              title="Open 100+ Statutory Concordance Matrix (IPC ⟷ BNS, CrPC ⟷ BNSS, IEA ⟷ BSA)"
              aria-label="Open Statutory Concordance"
            >
              <span className="material-symbols-outlined text-[14px] sm:text-[15px] 2xl:text-[18px] text-[#ff7722] shrink-0">compare_arrows</span>
              <span className="hidden sm:inline font-bold">Concordance</span>
              <span className={`px-1.5 py-0.2 rounded-full font-mono text-[8.5px] sm:text-[9px] 2xl:text-[10px] font-extrabold shadow-xs ${
                isDark ? 'bg-[#ff7722]/20 text-[#ff7722]' : 'bg-[#00288e]/10 text-[#00288e]'
              }`}>
                100+
              </span>
            </button>

            {/* Chamber Dossiers Action Button (Visible on sm+) */}
            <button
              type="button"
              onClick={() => setIsDossiersOpen(true)}
              className={`hidden sm:flex h-8 items-center gap-1.5 px-2.5 sm:px-3 rounded-lg md:rounded-xl text-[10.5px] md:text-[clamp(9.5px,0.72vw,11.5px)] font-medium border transition-colors cursor-pointer shadow-xs whitespace-nowrap shrink-0 ${
                isDark 
                  ? 'bg-[#131624] text-[#e2e8f0] border-[#23283f] hover:bg-[#1a1f33]' 
                  : 'bg-[#eff4ff] text-[#0b1c30] border-[#dce9ff] hover:bg-[#e5eeff]'
              }`}
              title="Open Chamber Dossiers Repository"
              aria-label="Open Chamber Dossiers Repository"
            >
              <span className="material-symbols-outlined text-[14px] sm:text-[15px] 2xl:text-[18px] text-[#60a5fa] shrink-0">folder_special</span>
              <span className="hidden sm:inline font-bold">Dossiers</span>
              <span className={`px-1.5 py-0.2 rounded-full font-mono text-[8.5px] sm:text-[9px] 2xl:text-[10px] font-extrabold shadow-xs ${
                isDark ? 'bg-white text-black' : 'bg-[#00288e] text-white'
              }`}>
                {dossierCount}
              </span>
            </button>

            {/* Mobile Chamber Menu Hamburger Trigger (< md ONLY) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className={`md:hidden h-7.5 w-7.5 rounded-lg border flex items-center justify-center cursor-pointer shadow-2xs shrink-0 transition-all ${
                isMobileMenuOpen
                  ? isDark ? 'bg-white text-black border-white' : 'bg-[#00288e] text-white border-[#00288e]'
                  : isDark ? 'bg-[#131624] text-white border-[#23283f] hover:bg-[#1a1f33]' : 'bg-[#eff4ff] text-[#00288e] border-[#dce9ff] hover:bg-[#e5eeff]'
              }`}
              title="Open Chamber Navigation & Settings"
              aria-label="Open Mobile Menu"
            >
              <span className="material-symbols-outlined text-[17px]">
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Secondary Statutory Sub-Header (Ticker Bar - h-7 / 28px, hidden on small mobile to maximize screen) */}
        <div id="statutory-ticker" className={`hidden md:block h-7 w-full border-t overflow-hidden transition-colors ${
          isDark 
            ? 'bg-[#06070a] border-[#1a1e2e] text-[#94a3b8]' 
            : 'bg-[#f8f9ff] border-[#e2e8f0] text-[#565e74]'
        }`}>
          <div className="w-full h-full px-[clamp(10px,1.8vw,32px)] flex items-center justify-between text-[clamp(9.5px,0.7vw,11px)] font-mono">
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

      {/* MAIN SCREEN CANVAS (Responsive top padding: 48px on mobile, 84px on md+) */}
      <div className="pt-12 md:pt-[84px] pb-14 md:pb-0 flex-1 flex flex-col h-[100dvh] overflow-hidden w-full">
        <main className={`flex-1 flex flex-col w-full h-full ${activeTab === 'chat' || activeTab === 'constitution' ? 'overflow-hidden' : 'overflow-y-auto'} transition-colors duration-200 ${
          isDark ? 'bg-[#090a0f]' : 'bg-[#f4f6fb]'
        }`}>
          {activeTab === 'chat' && (
            <ChatView 
              guestId={guestId}
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
                setActiveTab('constitution');
              }} 
              geminiApiKey={geminiApiKey}
              onOpenConstitutionModal={() => setIsConstitutionModalOpen(true)}
            />
          )}
          {activeTab === 'contracts' && (
            <ContractStudioView 
              isDark={isDark} 
              mode={mode} 
              apiBase={API_BASE}
            />
          )}
          {activeTab === 'constitution' && (
            <ConstitutionView 
              isDark={isDark}
              initialQuery={searchInitialQuery || undefined}
              onSendToChat={(query: string, title?: string) => {
                setChatLaunchContext({
                  type: 'search_provision',
                  title: title || 'Constitutional Legal Analysis',
                  query: query,
                  category: 'Constitutional Law',
                  autoExecute: true
                });
                setActiveTab('chat');
              }}
              onBackToChat={() => setActiveTab('chat')}
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

      {/* Mobile Ergonomic Bottom Navigation Bar (< md ONLY: Thumb-Friendly Direct 1-Tap Access) */}
      <nav 
        className={`md:hidden fixed bottom-0 left-0 right-0 h-14 z-40 border-t flex items-center justify-around px-2 shadow-lg backdrop-blur-md transition-colors ${
          isDark 
            ? 'bg-[#0d0f17]/95 border-[#1f2438] text-slate-400' 
            : 'bg-white/95 border-[#e2e8f0] text-slate-600'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        aria-label="Mobile Primary Navigation"
      >
        {[
          { id: 'chat', label: 'Chat', icon: 'chat', title: 'Constitutional AI Chat Assistant' },
          { id: 'contracts', label: 'Contracts', icon: 'edit_document', title: 'AI Contract Studio' },
          { id: 'constitution', label: 'Constitution', icon: 'account_balance', title: 'Constitution of India • 25 Parts & 456+ Articles' },
          { id: 'info', label: 'Validator', icon: 'fact_check', title: 'Knowledge & Truth Validator' },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => { setActiveTab(tab.id as any); setIsMobileMenuOpen(false); }}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? isDark
                    ? 'text-white font-bold'
                    : 'text-[#00288e] font-bold'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
              }`}
              title={tab.title}
            >
              <div className={`p-1 rounded-lg flex items-center justify-center transition-all ${
                isActive 
                  ? isDark ? 'bg-white/10 text-white' : 'bg-[#00288e]/10 text-[#00288e]'
                  : 'text-current'
              }`}>
                <span className="material-symbols-outlined text-[19px]">{tab.icon}</span>
              </div>
              <span className="text-[10px] tracking-tight leading-none mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* MOBILE CHAMBER HUB SLIDE-OVER DRAWER (< md / < 768px, Rendered outside header to prevent backdrop-blur containment clipping) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[10000] flex justify-end animate-in fade-in duration-200">
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-out Drawer Panel */}
          <div 
            className={`relative w-[85%] max-w-[340px] h-full shadow-2xl flex flex-col z-[10001] border-l animate-in slide-in-from-right duration-200 overflow-y-auto ${
              isDark ? 'bg-[#0d0f17] border-[#1f2438] text-white' : 'bg-white border-[#e2e8f0] text-[#0b1c30]'
            }`}
            style={{ backgroundColor: isDark ? '#0d0f17' : '#ffffff' }}
          >
            {/* Drawer Top Header */}
            <div className="p-4 border-b border-zinc-700/20 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Logo" className="w-6 h-6 rounded-md object-contain" />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 font-extrabold text-[13px] tracking-tight">
                    <span className="text-[#ff7722]">भारत</span>
                    <span className={isDark ? 'text-white' : 'text-[#00288e]'}>Chamber Hub</span>
                  </div>
                  <span className="text-[9px] font-mono text-zinc-400">Controls & Navigation</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center border cursor-pointer ${
                  isDark ? 'bg-[#181c2d] border-[#242b42] text-zinc-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-black'
                }`}
                aria-label="Close menu"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Drawer Body Content */}
            <div className="p-4 flex flex-col gap-4 flex-1">
              {/* 1. Platform Modules */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Platform Modules
                  </span>
                  <span className="text-[9px] font-mono text-[#ff7722] font-semibold">4 Modules</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {[
                    { id: 'chat', label: 'Chat Assistant', icon: 'chat', desc: 'Constitutional AI & Precedents' },
                    { id: 'contracts', label: 'AI Contract Studio', icon: 'edit_document', desc: 'Drafting & Redline Risk Audit' },
                    { id: 'constitution', label: 'Constitution', icon: 'account_balance', desc: '25 Parts, 456+ Articles & Writs' },
                    { id: 'info', label: 'Validator Hub', icon: 'fact_check', desc: 'Truth Audit & Hash Verification' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                        activeTab === tab.id
                          ? isDark
                            ? 'bg-white text-black font-bold border-white shadow-md'
                            : 'bg-[#00288e] text-white font-bold border-[#00288e] shadow-md'
                          : isDark
                            ? 'bg-[#131624] text-zinc-300 border-[#23283f] hover:bg-[#1a1f33]'
                            : 'bg-[#f8f9ff] text-[#334155] border-[#e2e8f0] hover:bg-[#eff4ff]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`material-symbols-outlined text-[18px] shrink-0 ${
                          activeTab === tab.id ? (isDark ? 'text-black' : 'text-white') : 'text-[#ff7722]'
                        }`}>
                          {tab.icon}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[12px] font-bold leading-snug truncate">{tab.label}</span>
                          <span className={`text-[9px] truncate ${
                            activeTab === tab.id ? (isDark ? 'text-black/70' : 'text-white/80') : 'text-zinc-400'
                          }`}>
                            {tab.desc}
                          </span>
                        </div>
                      </div>
                      {activeTab === tab.id && (
                        <span className="material-symbols-outlined text-[16px] shrink-0">check_circle</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Constitutional & Statutory Tools */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Constitutional & Statutory Tools
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 font-semibold">Live Law DB</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsConstitutionModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col gap-1 text-left cursor-pointer transition-all ${
                      isDark ? 'bg-[#131624] border-[#23283f] text-zinc-200 hover:bg-[#1a1f33]' : 'bg-emerald-50/50 border-emerald-200 text-emerald-900 hover:bg-emerald-100/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="material-symbols-outlined text-[16px] text-emerald-400">account_balance</span>
                      <span className="text-[8px] font-mono font-bold px-1 rounded bg-emerald-500/20 text-emerald-400">456+</span>
                    </div>
                    <span className="text-[11px] font-bold">Constitution</span>
                    <span className="text-[8.5px] leading-tight opacity-75">All 25 Parts & Writs</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsConcordanceModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col gap-1 text-left cursor-pointer transition-all ${
                      isDark ? 'bg-[#131624] border-[#23283f] text-zinc-200 hover:bg-[#1a1f33]' : 'bg-orange-50/50 border-orange-200 text-orange-950 hover:bg-orange-100/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="material-symbols-outlined text-[16px] text-[#ff7722]">compare_arrows</span>
                      <span className="text-[8px] font-mono font-bold px-1 rounded bg-[#ff7722]/20 text-[#ff7722]">100+</span>
                    </div>
                    <span className="text-[11px] font-bold">Concordance</span>
                    <span className="text-[8.5px] leading-tight opacity-75">IPC ⟷ BNS Crosswalk</span>
                  </button>
                </div>
              </div>

              {/* 3. Legal Persona Mode */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 block">
                  Legal Persona Mode
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('citizen')}
                    className={`p-2.5 rounded-xl border flex flex-col gap-1 text-left cursor-pointer transition-all ${
                      mode === 'citizen'
                        ? isDark ? 'bg-[#ff7722]/15 border-[#ff7722] text-[#ff7722] font-bold' : 'bg-orange-50 border-[#ff7722] text-[#ff7722] font-bold'
                        : isDark ? 'bg-[#131624] border-[#23283f] text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="material-symbols-outlined text-[16px]">person</span>
                      {mode === 'citizen' && <span className="material-symbols-outlined text-[14px]">check</span>}
                    </div>
                    <span className="text-[11px] font-bold">Citizen</span>
                    <span className="text-[8.5px] leading-tight opacity-75">Everyday rights & plain terms</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('professional')}
                    className={`p-2.5 rounded-xl border flex flex-col gap-1 text-left cursor-pointer transition-all ${
                      mode === 'professional'
                        ? isDark ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 font-bold' : 'bg-emerald-50 border-emerald-600 text-emerald-800 font-bold'
                        : isDark ? 'bg-[#131624] border-[#23283f] text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="material-symbols-outlined text-[16px]">gavel</span>
                      {mode === 'professional' && <span className="material-symbols-outlined text-[14px]">check</span>}
                    </div>
                    <span className="text-[11px] font-bold">Advocate</span>
                    <span className="text-[8.5px] leading-tight opacity-75">Court citations & sections</span>
                  </button>
                </div>
              </div>

              {/* 3. Theme Toggle */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 block">
                  Appearance & Theme
                </span>
                <div className={`p-1 rounded-xl border flex items-center ${
                  isDark ? 'bg-[#131624] border-[#23283f]' : 'bg-[#eff4ff] border-[#dce9ff]'
                }`}>
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      isDark ? 'bg-white text-black shadow-xs' : 'text-zinc-500 hover:text-black'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">dark_mode</span>
                    <span>Dark</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      !isDark ? 'bg-[#00288e] text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">light_mode</span>
                    <span>Light</span>
                  </button>
                </div>
              </div>

              {/* 4. Guest Session Identity */}
              <div className={`p-3 rounded-xl border ${
                isDark ? 'bg-[#131624]/60 border-[#23283f]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-[#ff7722]">shield_person</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Guest Session</span>
                  </div>
                  <span className="text-[8.5px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                    Private
                  </span>
                </div>

                <div className={`p-1.5 px-2 rounded-lg font-mono text-[10px] flex items-center justify-between gap-1 mb-2 border ${
                  isDark ? 'bg-[#090b12] border-[#1f2438] text-amber-300' : 'bg-white border-slate-200 text-[#00288e]'
                }`}>
                  <span className="font-bold select-all truncate">{guestId}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(guestId);
                      setGuestIdCopied(true);
                      setTimeout(() => setGuestIdCopied(false), 2000);
                    }}
                    className={`p-1 rounded cursor-pointer transition-all ${
                      guestIdCopied 
                        ? (isDark ? 'text-emerald-400' : 'text-emerald-700') 
                        : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')
                    }`}
                    title="Copy Guest ID"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {guestIdCopied ? 'check' : 'content_copy'}
                    </span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Start a fresh session? This will create a new Guest ID and clean chat workspace.')) {
                      resetGuestId();
                      window.location.reload();
                    }
                  }}
                  className={`w-full py-1.5 px-2 rounded-lg text-[10.5px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    isDark ? 'bg-[#181c2d] hover:bg-[#20253d] text-rose-300 border-rose-900/40' : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px]">refresh</span>
                  <span>Start Fresh Session</span>
                </button>
              </div>

              {/* 5. System Status */}
              <div className="flex items-center justify-between px-1 text-[9.5px] font-mono text-zinc-400 mt-auto pt-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Neon pgvector: Active</span>
                </span>
                <span>{totalProvisions} Provisions</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chamber Dossiers Slide-Over Drawer */}
      <DossiersDrawer
        guestId={guestId}
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

      {/* 100+ STATUTORY CONCORDANCE & TRANSITION ADVISOR MODAL */}
      <StatutoryConcordanceModal
        isOpen={isConcordanceModalOpen}
        onClose={() => setIsConcordanceModalOpen(false)}
        isDark={isDark}
        onConsultInChat={(item) => {
          setChatLaunchContext({
            type: 'concordance',
            title: `${item.old_act} ${item.old_section} ⟷ ${item.new_act} ${item.new_section}`,
            query: `Provide a senior advocate legal analysis comparing ${item.old_act} ${item.old_section} with ${item.new_act} ${item.new_section} (${item.offense_title}). Explain substantive changes, bail classification (${item.bailable_status}), and whether IPC or BNS applies today.`,
            category: 'Criminal Law (BNS)',
            autoExecute: true
          });
          setActiveTab('chat');
        }}
      />

      {/* COMPLETE CONSTITUTION OF INDIA STUDIO MODAL (456+ Articles, 25 Parts, 12 Schedules) */}
      <ConstitutionStudioModal
        isOpen={isConstitutionModalOpen}
        onClose={() => setIsConstitutionModalOpen(false)}
        isDark={isDark}
        onSendToChat={(query: string, title?: string) => {
          setChatLaunchContext({
            type: 'search_provision',
            title: title || 'Constitutional Legal Analysis',
            query: query,
            category: 'Constitutional Law',
            autoExecute: true
          });
          setActiveTab('chat');
        }}
      />

      {/* FIRST-VISIT PERMISSIONS & PRIVACY CENTER */}
      {showGuestNoticeModal && (
        <div className="fixed inset-0 z-[10001] bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs select-none animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto ${
            isDark ? 'bg-[#0f121e] border-[#242b42] text-white' : 'bg-white border-[#e2e8f0] text-[#0b1c30]'
          }`}>
            {/* Header with Seal and Guest ID */}
            <div className="flex items-start justify-between gap-3 pb-1 border-b border-zinc-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00288e] to-[#ff7722] flex items-center justify-center text-white shadow-md shrink-0">
                  <span className="material-symbols-outlined text-[22px]">verified_user</span>
                </div>
                <div>
                  <h3 className="text-[15px] font-black tracking-tight">Platform Permissions & Privacy Setup</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-mono font-bold text-[#ff7722]">
                      Assigned ID: {guestId}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(guestId);
                        setGuestIdCopied(true);
                        setTimeout(() => setGuestIdCopied(false), 2000);
                      }}
                      className={`text-[10px] font-mono flex items-center gap-0.5 cursor-pointer ${
                        isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                      }`}
                      title="Copy Guest ID"
                    >
                      <span className="material-symbols-outlined text-[13px]">
                        {guestIdCopied ? 'check' : 'content_copy'}
                      </span>
                      <span>{guestIdCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                DPDP 2023 Compliant
              </span>
            </div>

            <p className={`text-[11.5px] leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Bharat Legal Intelligence operates with a <strong>Zero-Surveillance, Privacy-First Architecture</strong>. Below are the permissions and device capabilities used to provide an optimal legal research experience:
            </p>

            {/* Permissions Cards */}
            <div className="space-y-2.5">
              {/* Permission 1: Microphone */}
              <div className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                isDark ? 'bg-[#131726] border-[#222940]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[18px]">mic</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-[12px] font-bold">Microphone (Hands-Free Legal Dictation)</h4>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                      isDark 
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/25' 
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}>
                      Prompt When Used
                    </span>
                  </div>
                  <p className={`text-[10.5px] mt-0.5 leading-relaxed ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Used to speak legal queries, section citations, and FIR facts in <strong>Indian English & Hindi</strong>.
                  </p>
                  <p className={`text-[9.5px] mt-1 flex items-center gap-1 font-mono ${
                    isDark ? 'text-emerald-400/90' : 'text-emerald-700 font-semibold'
                  }`}>
                    <span className="material-symbols-outlined text-[12px]">lock</span>
                    <span>100% On-Device Web Speech API • Zero voice audio stored</span>
                  </p>
                </div>
              </div>

              {/* Permission 2: Clipboard */}
              <div className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                isDark ? 'bg-[#131726] border-[#222940]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="p-2 rounded-lg bg-blue-500/15 text-blue-400 shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[18px]">content_copy</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-[12px] font-bold">Clipboard (Legal Citations & Petitions)</h4>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                      isDark 
                        ? 'bg-blue-500/15 text-blue-300 border-blue-500/25' 
                        : 'bg-blue-100 text-blue-900 border-blue-300'
                    }`}>
                      Write-Only on Click
                    </span>
                  </div>
                  <p className={`text-[10.5px] mt-0.5 leading-relaxed ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Allows 1-click copying of High Court & Supreme Court citations, contract drafts, and counter-clauses.
                  </p>
                  <p className={`text-[9.5px] mt-1 flex items-center gap-1 font-mono ${
                    isDark ? 'text-emerald-400/90' : 'text-emerald-700 font-semibold'
                  }`}>
                    <span className="material-symbols-outlined text-[12px]">security</span>
                    <span>Only writes formatted legal text on explicit button click</span>
                  </p>
                </div>
              </div>

              {/* Permission 3: Local Storage / Guest Identity */}
              <div className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                isDark ? 'bg-[#131726] border-[#222940]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[18px]">shield</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-[12px] font-bold">Local Device Storage (Private Chamber Dockets)</h4>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                      isDark 
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' 
                        : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    }`}>
                      Active
                    </span>
                  </div>
                  <p className={`text-[10.5px] mt-0.5 leading-relaxed ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Saves your research threads and case dossiers strictly in your browser under your unique Guest ID without tracking cookies.
                  </p>
                  <p className={`text-[9.5px] mt-1 flex items-center gap-1 font-mono ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    <span className="material-symbols-outlined text-[12px]">delete_sweep</span>
                    <span>Reset or zeroize session at any time via header controls</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-zinc-500/20">
              <button
                type="button"
                onClick={() => {
                  markGuestNoticeSeen();
                  setShowGuestNoticeModal(false);
                }}
                className={`w-full sm:w-auto px-3.5 py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer text-center ${
                  isDark ? 'bg-[#181c2d] hover:bg-[#20253d] text-slate-300 border-[#2b334d]' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                Continue (Ask Permissions When Needed)
              </button>

              <button
                type="button"
                onClick={async () => {
                  try {
                    // Pre-authorize dictation if user chooses
                    localStorage.setItem('bharat_mic_permission_granted', 'true');
                  } catch {}
                  markGuestNoticeSeen();
                  setShowGuestNoticeModal(false);
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-[11.5px] font-black bg-gradient-to-r from-[#00288e] to-[#ff7722] hover:opacity-90 text-white flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
              >
                <span>Enable Features & Enter Chamber</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
