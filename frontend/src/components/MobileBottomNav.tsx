interface MobileBottomNavProps {
  isDark: boolean;
  activeTab: 'chat' | 'contracts' | 'search' | 'info';
  onSelectTab: (tab: 'chat' | 'contracts' | 'search' | 'info') => void;
  onOpenConstitution: () => void;
  onOpenPleadings: () => void;
  onOpenDossiers: () => void;
  dossierCount: number;
}

export function MobileBottomNav({
  isDark,
  activeTab,
  onSelectTab,
  onOpenConstitution,
  onOpenPleadings,
  onOpenDossiers,
  dossierCount
}: MobileBottomNavProps) {
  return (
    <nav 
      aria-label="Mobile Chamber Navigation"
      className={`sm:hidden fixed bottom-0 left-0 right-0 z-[100] border-t px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] backdrop-blur-md transition-colors ${
        isDark 
          ? 'bg-[#060913]/95 border-white/10 text-slate-300' 
          : 'bg-white/95 border-slate-200 text-slate-700 shadow-lg'
      }`}
    >
      <div className="grid grid-cols-4 items-center justify-around gap-1">
        {/* 1. Chat Chamber */}
        <button
          type="button"
          onClick={() => onSelectTab('chat')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'chat'
              ? isDark 
                ? 'text-[#ff7722] font-black' 
                : 'text-[#00288e] font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className={`material-symbols-outlined text-[20px] ${activeTab === 'chat' ? 'scale-110' : ''}`}>
            chat
          </span>
          <span className="text-[10px] tracking-tight mt-0.5">Chamber</span>
        </button>

        {/* 2. Pleadings Studio */}
        <button
          type="button"
          onClick={onOpenPleadings}
          className="flex flex-col items-center justify-center py-1 rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px] text-emerald-500">
            gavel
          </span>
          <span className="text-[10px] tracking-tight mt-0.5">Pleadings</span>
        </button>

        {/* 3. Constitution 456+ */}
        <button
          type="button"
          onClick={onOpenConstitution}
          className="flex flex-col items-center justify-center py-1 rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer relative"
        >
          <span className="material-symbols-outlined text-[20px] text-[#ff7722]">
            account_balance
          </span>
          <span className="text-[10px] tracking-tight mt-0.5 flex items-center gap-0.5">
            <span>Constitution</span>
            <span className="text-[8px] font-mono px-1 rounded bg-[#ff7722]/20 text-[#ff7722] font-bold">456</span>
          </span>
        </button>

        {/* 4. Chamber Dossiers */}
        <button
          type="button"
          onClick={onOpenDossiers}
          className="flex flex-col items-center justify-center py-1 rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer relative"
        >
          <div className="relative">
            <span className="material-symbols-outlined text-[20px] text-blue-400">
              folder_special
            </span>
            {dossierCount > 0 && (
              <span className={`absolute -top-1 -right-2 w-4 h-4 rounded-full text-[9px] font-mono font-bold flex items-center justify-center ${
                isDark ? 'bg-white text-black' : 'bg-[#00288e] text-white'
              }`}>
                {dossierCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Dossiers</span>
        </button>
      </div>
    </nav>
  );
}
