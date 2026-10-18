import React, { createContext, useContext, useState, useEffect } from 'react';

export type DesignPreset = 'institutional' | 'classic';

interface DesignPresetContextType {
  designPreset: DesignPreset;
  setDesignPreset: (preset: DesignPreset) => void;
  toggleDesignPreset: () => void;
  isInstitutional: boolean;
  isClassic: boolean;
}

const DesignPresetContext = createContext<DesignPresetContextType | undefined>(undefined);

export function DesignPresetProvider({ children }: { children: React.ReactNode }) {
  const [designPreset, setDesignPresetState] = useState<DesignPreset>(() => {
    try {
      const saved = localStorage.getItem('bharat_design_preset');
      return (saved === 'classic' || saved === 'institutional') ? saved : 'institutional';
    } catch {
      return 'institutional';
    }
  });

  const setDesignPreset = (preset: DesignPreset) => {
    setDesignPresetState(preset);
    try {
      localStorage.setItem('bharat_design_preset', preset);
    } catch {}
  };

  const toggleDesignPreset = () => {
    const next = designPreset === 'institutional' ? 'classic' : 'institutional';
    setDesignPreset(next);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-design-preset', designPreset);
  }, [designPreset]);

  return (
    <DesignPresetContext.Provider
      value={{
        designPreset,
        setDesignPreset,
        toggleDesignPreset,
        isInstitutional: designPreset === 'institutional',
        isClassic: designPreset === 'classic'
      }}
    >
      {children}
    </DesignPresetContext.Provider>
  );
}

export function useDesignPreset() {
  const context = useContext(DesignPresetContext);
  if (!context) {
    throw new Error('useDesignPreset must be used within a DesignPresetProvider');
  }
  return context;
}
