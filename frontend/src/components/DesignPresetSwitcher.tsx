import { useDesignPreset } from '../context/DesignPresetContext';

interface DesignPresetSwitcherProps {
  isDark: boolean;
  className?: string;
  compact?: boolean;
}

export function DesignPresetSwitcher({ isDark, className = '', compact = false }: DesignPresetSwitcherProps) {
  const { setDesignPreset, isInstitutional } = useDesignPreset();

  return (
    <div className={`flex items-center p-0.5 rounded-lg border transition-all ${
      isDark ? 'bg-[#0f1322] border-[#222a44]' : 'bg-[#eef2fc] border-[#d8e2f8]'
    } ${className}`}>
      <button
        type="button"
        onClick={() => setDesignPreset('institutional')}
        className={`px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
          isInstitutional
            ? isDark 
              ? 'bg-[#d96b27] text-white shadow-xs' 
              : 'bg-[#c2541a] text-white shadow-xs'
            : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
        }`}
        title="Bespoke Institutional Chamber UI: High Court parchment, editorial serif typography, mobile bottom sheets, and desktop cockpit"
      >
        <span className="material-symbols-outlined text-[13px]">account_balance</span>
        <span>{compact ? 'Chamber' : '🏛️ Institutional'}</span>
      </button>

      <button
        type="button"
        onClick={() => setDesignPreset('classic')}
        className={`px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
          !isInstitutional
            ? isDark 
              ? 'bg-white text-black shadow-xs' 
              : 'bg-[#00288e] text-white shadow-xs'
            : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
        }`}
        title="Classic Bharat 2.0 UI: Original cards, contrast badges, and centered modals"
      >
        <span className="material-symbols-outlined text-[13px]">tune</span>
        <span>{compact ? 'Classic' : '⚡ Classic 2.0'}</span>
      </button>
    </div>
  );
}
