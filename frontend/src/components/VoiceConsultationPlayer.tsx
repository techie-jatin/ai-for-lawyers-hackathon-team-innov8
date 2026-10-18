import React, { useState, useEffect, useRef } from 'react';
import {
  speechSynthesizer,
  getBilingualSpokenBriefing,
  type VoiceLanguage,
  type VoicePlaybackState,
  type SpokenBriefing
} from '../services/voiceConsultationEngine';

interface VoiceConsultationPlayerProps {
  text: string;
  isDark?: boolean;
  apiBase?: string;
  defaultLang?: VoiceLanguage;
}

export const VoiceConsultationPlayer: React.FC<VoiceConsultationPlayerProps> = ({
  text,
  isDark = true,
  apiBase,
  defaultLang = 'en-IN'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [playbackState, setPlaybackState] = useState<VoicePlaybackState>('idle');
  const [currentLang, setCurrentLang] = useState<VoiceLanguage>(defaultLang);
  const [speed, setSpeed] = useState<number>(1.0);
  const [briefing, setBriefing] = useState<SpokenBriefing | null>(null);
  const [isLoadingBriefing, setIsLoadingBriefing] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      speechSynthesizer.stop();
    };
  }, []);

  const handleToggleOpen = async () => {
    if (!isOpen) {
      setIsOpen(true);
      let activeBriefing = briefing;
      if (!activeBriefing) {
        setIsLoadingBriefing(true);
        try {
          activeBriefing = await getBilingualSpokenBriefing(text, apiBase);
          if (mountedRef.current) setBriefing(activeBriefing);
        } catch {
          // Fallback handled inside getBilingualSpokenBriefing
        } finally {
          if (mountedRef.current) setIsLoadingBriefing(false);
        }
      }
      if (activeBriefing) {
        const textToSpeak = currentLang === 'hi-IN' ? activeBriefing.spokenHindi : activeBriefing.spokenEnglish;
        if (textToSpeak) {
          speechSynthesizer.speak(
            textToSpeak,
            currentLang,
            speed,
            () => { if (mountedRef.current) setPlaybackState('playing'); },
            () => { if (mountedRef.current) setPlaybackState('idle'); },
            (err) => {
              console.error('Speech synthesis error:', err);
              if (mountedRef.current) setPlaybackState('idle');
            }
          );
        }
      }
    } else {
      speechSynthesizer.stop();
      setPlaybackState('idle');
      setIsOpen(false);
    }
  };

  const currentSpokenText = currentLang === 'hi-IN' 
    ? (briefing?.spokenHindi || '') 
    : (briefing?.spokenEnglish || '');

  const handlePlay = (langToPlay?: VoiceLanguage) => {
    const lang = langToPlay || currentLang;
    const textToSpeak = lang === 'hi-IN' 
      ? (briefing?.spokenHindi || '') 
      : (briefing?.spokenEnglish || '');

    if (!textToSpeak) return;

    speechSynthesizer.speak(
      textToSpeak,
      lang,
      speed,
      () => {
        if (mountedRef.current) setPlaybackState('playing');
      },
      () => {
        if (mountedRef.current) setPlaybackState('idle');
      },
      (err) => {
        console.error('Speech synthesis error:', err);
        if (mountedRef.current) setPlaybackState('idle');
      }
    );
  };

  const handlePause = () => {
    speechSynthesizer.pause();
    setPlaybackState('paused');
  };

  const handleResume = () => {
    speechSynthesizer.resume();
    setPlaybackState('playing');
  };

  const handleStop = () => {
    speechSynthesizer.stop();
    setPlaybackState('idle');
  };

  const handleLangChange = (newLang: VoiceLanguage) => {
    setCurrentLang(newLang);
    if (playbackState === 'playing') {
      speechSynthesizer.stop();
      handlePlay(newLang);
    }
  };

  const handleSpeedCycle = () => {
    const speeds = [1.0, 1.25, 1.5];
    const nextIdx = (speeds.indexOf(speed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setSpeed(nextSpeed);
    if (playbackState === 'playing') {
      speechSynthesizer.stop();
      // Restart at new speed
      setTimeout(() => handlePlay(), 50);
    }
  };

  return (
    <div className="w-full my-2.5">
      {!isOpen ? (
        <button
          type="button"
          onClick={handleToggleOpen}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
            isDark
              ? 'bg-[#121624] hover:bg-[#1a2136] text-amber-300 border-amber-500/30 hover:border-amber-500/50 shadow-sm'
              : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 hover:border-amber-400 shadow-sm'
          }`}
          title="Listen to legal advice recited aloud in English or Hindi"
        >
          <span className="material-symbols-outlined text-[16px] text-amber-400">volume_up</span>
          <span>Listen to Legal Advice</span>
          <span className="text-[10px] opacity-75 font-hindi font-normal">/ ऑडियो सुनें</span>
        </button>
      ) : (
        <div className={`p-3 rounded-xl border flex flex-col gap-2.5 text-xs animate-in fade-in transition-colors shadow-md ${
          isDark 
            ? 'bg-[#101422] border-[#252f4c] text-slate-200' 
            : 'bg-amber-50/70 border-amber-200 text-slate-800'
        }`}>
          {/* Header Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-amber-400">graphic_eq</span>
              <span className="font-semibold text-[12.5px]">Voice Consultation Briefing</span>

              {/* Animated waveform bars while playing */}
              {playbackState === 'playing' && (
                <div className="flex items-center gap-0.5 ml-1">
                  <span className="w-1 h-3.5 bg-amber-400 rounded-full animate-pulse" />
                  <span className="w-1 h-5 bg-amber-400 rounded-full animate-pulse [animation-delay:150ms]" />
                  <span className="w-1 h-2.5 bg-amber-400 rounded-full animate-pulse [animation-delay:300ms]" />
                  <span className="w-1 h-4 bg-amber-400 rounded-full animate-pulse [animation-delay:75ms]" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {/* Language Switcher */}
              <div className={`inline-flex p-0.5 rounded-lg border text-[11px] font-medium ${
                isDark ? 'bg-[#0b0e18] border-slate-700/60' : 'bg-white border-slate-300'
              }`}>
                <button
                  type="button"
                  onClick={() => handleLangChange('en-IN')}
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    currentLang === 'en-IN'
                      ? (isDark ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'bg-amber-100 text-amber-900 font-semibold')
                      : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-black')
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => handleLangChange('hi-IN')}
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    currentLang === 'hi-IN'
                      ? (isDark ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'bg-amber-100 text-amber-900 font-semibold')
                      : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-black')
                  }`}
                >
                  हिन्दी
                </button>
              </div>

              {/* Speed Button */}
              <button
                type="button"
                onClick={handleSpeedCycle}
                className={`px-2 py-1 rounded-md text-[10.5px] font-mono border cursor-pointer transition-colors ${
                  isDark ? 'bg-[#181f33] border-slate-700 hover:bg-[#202944] text-slate-300' : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
                title="Toggle playback speed"
              >
                {speed.toFixed(2)}x
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleToggleOpen}
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-600 hover:text-black'
                }`}
                title="Close voice briefing"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          </div>

          {/* Spoken Text Preview */}
          <div className={`p-2.5 rounded-lg border text-[11.5px] leading-relaxed max-h-24 overflow-y-auto ${
            isDark ? 'bg-[#0a0d16] border-[#1d253d] text-slate-300' : 'bg-white border-amber-200/70 text-slate-700'
          }`}>
            {isLoadingBriefing ? (
              <div className="flex items-center gap-2 text-slate-400 animate-pulse text-xs">
                <span className="material-symbols-outlined text-[15px] animate-spin">sync</span>
                <span>Optimizing speech pronunciation and stripping citations...</span>
              </div>
            ) : (
              currentSpokenText || 'No spoken text available for playback.'
            )}
          </div>

          {/* Playback Action Buttons */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <div className="flex items-center gap-2">
              {playbackState === 'idle' && (
                <button
                  type="button"
                  onClick={() => handlePlay()}
                  disabled={isLoadingBriefing || !currentSpokenText}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                  <span>Play {currentLang === 'hi-IN' ? 'हिन्दी' : 'English'} Audio</span>
                </button>
              )}

              {playbackState === 'playing' && (
                <button
                  type="button"
                  onClick={handlePause}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">pause</span>
                  <span>Pause</span>
                </button>
              )}

              {playbackState === 'paused' && (
                <button
                  type="button"
                  onClick={handleResume}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs transition-colors cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                  <span>Resume</span>
                </button>
              )}

              {playbackState !== 'idle' && (
                <button
                  type="button"
                  onClick={handleStop}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">stop</span>
                  <span>Stop</span>
                </button>
              )}
            </div>

            <div className="text-[10px] font-mono text-slate-400">
              {playbackState === 'playing' ? '🎙️ Playing Audio' : playbackState === 'paused' ? '⏸️ Paused' : 'Ready'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
