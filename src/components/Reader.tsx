import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  Play, 
  Pause, 
  ChevronLeft, 
  Eye, 
  Ruler,
  Sparkles
} from 'lucide-react';
import { ReadingSettings, Language } from '../types';
import { THEMES, FONTS, OVERLAY_COLORS } from '../constants';
import { cn } from '../lib/utils';


interface ReaderProps {
  content: string;
  title: string;
  language: Language;
  settings: ReadingSettings;
  onUpdateSettings: (settings: ReadingSettings) => void;
  onBack: (wordsRead: number) => void;
}

export const Reader: React.FC<ReaderProps> = ({ 
  content, 
  title, 
  language, 
  settings, 
  onUpdateSettings,
  onBack 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [showSettings, setShowSettings] = useState(false);
  const [rulerY, setRulerY] = useState(0);
  const [focusY, setFocusY] = useState(0);
  
  const [displayContent, setDisplayContent] = useState(content);
  const [isSegmenting, setIsSegmenting]   = useState(false);
  const [segmentError, setSegmentError]   = useState<string | null>(null);

  // calls /segment when segmented view is toggled on
  useEffect(() => {
    if (!settings.segmentedView) {
      setDisplayContent(content);
      setSegmentError(null);
      return;
    }
    let cancelled = false;
    setIsSegmenting(true);
    setSegmentError(null);
    fetch('http://localhost:5000/segment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: content }),
    })
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        if (data.segmentedText) {
          setDisplayContent(data.segmentedText);
        } else {
          setDisplayContent(content);
          setSegmentError('Segmented View unavailable — make sure Flask is running on port 5000.');
        }
      })
      .catch(() => {
        if (cancelled) return;
        setDisplayContent(content);
        setSegmentError('Segmented View unavailable — make sure Flask is running on port 5000.');
      })
      .finally(() => { if (!cancelled) setIsSegmenting(false); });
    return () => { cancelled = true; };
  }, [settings.segmentedView, content]);

  useEffect(() => { setDisplayContent(content); }, [content]);

  const synth = window.speechSynthesis;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const words = displayContent.split(/\s+/);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setRulerY(e.clientY);
      setFocusY(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    return () => {
      synth.cancel();
    };
  }, []);

  const speak = () => {
    if (isPlaying) {
      synth.cancel();
      setIsPlaying(false);
      setCurrentWordIndex(-1);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = language === 'bn' ? 'bn-BD' : 'en-US';
    utterance.rate = settings.ttsSpeed;
    
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const charIndex = event.charIndex;
        const wordIndex = content.substring(0, charIndex).split(/\s+/).length - 1;
        setCurrentWordIndex(wordIndex);
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentWordIndex(-1);
    };

    utteranceRef.current = utterance;
    synth.speak(utterance);
    setIsPlaying(true);
  };

  const theme = THEMES[settings.theme];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="h-16 border-b border-black/5 dark:border-white/10 flex items-center justify-between px-4 sticky top-0 z-30 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              synth.cancel();
              setIsPlaying(false);
              onBack(currentWordIndex > 0 ? currentWordIndex : 0);
            }}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-display font-semibold dark:text-white text-sm max-w-xs lg:max-w-md truncate" title={title}>{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              "p-2 rounded-full transition-colors",
              showSettings ? "bg-primary text-white" : "hover:bg-black/5 dark:hover:bg-white/5"
            )}
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Reading Area */}
      <main className={cn("flex-1 overflow-y-auto relative p-10 md:p-20 transition-all duration-300", theme.bg, theme.text, showSettings && "lg:mr-[384px]")}>
        {settings.overlayColor && (
          <div 
            className="fixed inset-0 pointer-events-none z-10" 
            style={{ backgroundColor: settings.overlayColor }} 
          />
        )}

        {settings.readingRuler && (
          <div className="reading-ruler" style={{ top: rulerY }} />
        )}

        {settings.lineFocus && (() => {
          const band = Math.max(20, Math.round(settings.fontSize * settings.lineHeight * 0.6));
          return (
            <>
              <div className="line-focus-mask" style={{ top: 0, height: Math.max(0, focusY - band) }} />
              <div className="line-focus-mask" style={{ top: focusY + band, height: '100vh' }} />
            </>
          );
        })()}

        <div 
          className="mx-auto leading-relaxed transition-all duration-300"
          style={{
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
            letterSpacing: `${settings.letterSpacing}em`,
            wordSpacing: `${settings.wordSpacing}em`,
            fontFamily: settings.fontFamily,
            maxWidth: `${settings.paragraphWidth}%`,
          }}
        >
          {segmentError && (
            <div
              className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600"
              style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                lineHeight: '1.5',
                letterSpacing: 'normal',
                wordSpacing: 'normal',
              }}
            >
              {segmentError}
            </div>
          )}
          {words.map((word, i) => {
            const highlighted = i === currentWordIndex;
            if (settings.segmentedView && word.includes('·')) {
              const syls = word.split('·');
              return (
                <span key={i} className={cn("inline-block mr-[0.25em]", highlighted && "word-highlight")}>
                  {syls.map((syl, j) => (
                    <React.Fragment key={j}>
                      {j > 0 && <span style={{ opacity: 0.35 }} className="select-none">-</span>}
                      <span>{syl}</span>
                    </React.Fragment>
                  ))}
                </span>
              );
            }
            return (
              <span key={i} className={cn("inline-block mr-[0.25em]", highlighted && "word-highlight")}>
                {word.replace(/·/g, '')}
              </span>
            );
          })}
        </div>
      </main>

      {/* TTS Controls */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="bg-white dark:bg-slate-900 shadow-2xl rounded-full px-6 py-3 flex items-center gap-6 border border-black/5 dark:border-white/10"
        >
          <button
            onClick={speak}
            className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
          </button>
          
          <div className="flex items-center gap-4 border-l border-black/10 dark:border-white/10 pl-6">
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold opacity-50 dark:opacity-70">Speed</span>
              <select 
                value={settings.ttsSpeed}
                onChange={(e) => onUpdateSettings({ ...settings, ttsSpeed: parseFloat(e.target.value) })}
                className="bg-transparent text-sm font-medium outline-none dark:text-white"
              >
                <option value="0.5" className="dark:bg-slate-900">0.5x</option>
                <option value="0.75" className="dark:bg-slate-900">0.75x</option>
                <option value="1.0" className="dark:bg-slate-900">1.0x</option>
                <option value="1.25" className="dark:bg-slate-900">1.25x</option>
                <option value="1.5" className="dark:bg-slate-900">1.5x</option>
              </select>
            </div>
          </div>

          <div className="text-[10px] font-bold opacity-50 dark:opacity-70 border-l border-black/10 dark:border-white/10 pl-6">
            {currentWordIndex >= 0 ? `${currentWordIndex + 1} / ${words.length}` : `${words.length} words`}
          </div>
        </motion.div>
      </div>

      {/* Settings Drawer */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="fixed inset-0 bg-black/10 z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl z-50 p-6 overflow-y-auto border-l border-black/5 dark:border-white/10"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-display font-bold dark:text-white">Visual Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
                >
                  <ChevronLeft className="rotate-180" />
                </button>
              </div>

              <div className="space-y-8">
                {/* Font Family */}
                <section>
                  <label className="text-xs font-bold uppercase opacity-50 dark:opacity-70 mb-3 block">Font Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {FONTS.map(f => (
                      <button
                        key={f.name}
                        onClick={() => onUpdateSettings({ ...settings, fontFamily: f.value })}
                        title={f.name}
                        className={cn(
                          "py-2.5 px-2 rounded-xl border-2 text-[10px] font-bold transition-all truncate",
                          settings.fontFamily === f.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-black/5 dark:border-white/10 hover:border-primary/40 dark:text-white"
                        )}
                        style={{ fontFamily: f.value }}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Theme */}
                <section>
                  <label className="text-xs font-bold uppercase opacity-50 dark:opacity-70 mb-3 block">Theme</label>
                  <div className="grid grid-cols-5 gap-2">
                    {(Object.keys(THEMES) as Array<keyof typeof THEMES>).map(t => (
                      <button 
                        key={t}
                        onClick={() => onUpdateSettings({ ...settings, theme: t })}
                        className={cn(
                          "h-10 rounded-lg border-2 transition-all capitalize text-[10px] font-bold",
                          settings.theme === t ? "border-primary" : "border-transparent"
                        )}
                        style={{
                          backgroundColor:
                            t === 'light' ? '#F3F4F6' :
                            t === 'dark' ? '#020617' :
                            t === 'sepia' ? '#F4ECD8' :
                            t === 'blue-light' ? '#1a1200' :
                            '#000000',
                          color:
                            t === 'light' ? '#111827' :
                            t === 'dark' ? '#f1f5f9' :
                            t === 'sepia' ? '#5B4636' :
                            t === 'blue-light' ? '#ffd580' :
                            '#facc15',
                        }}
                      >
                        {t === 'blue-light' ? 'warm' : t}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Sliders */}
                <section className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs font-bold uppercase opacity-50 dark:opacity-70">Text Size</label>
                      <span className="text-xs font-bold dark:text-white">{settings.fontSize}px</span>
                    </div>
                    <input 
                      type="range" min="12" max="48" step="1" 
                      value={settings.fontSize}
                      onChange={(e) => onUpdateSettings({ ...settings, fontSize: parseInt(e.target.value) })}
                      className="w-full h-2 bg-black/5 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs font-bold uppercase opacity-50 dark:opacity-70">Line Spacing</label>
                      <span className="text-xs font-bold dark:text-white">{settings.lineHeight}</span>
                    </div>
                    <input 
                      type="range" min="1" max="3" step="0.1" 
                      value={settings.lineHeight}
                      onChange={(e) => onUpdateSettings({ ...settings, lineHeight: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-black/5 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs font-bold uppercase opacity-50 dark:opacity-70">Letter Spacing</label>
                      <span className="text-xs font-bold dark:text-white">{settings.letterSpacing}em</span>
                    </div>
                    <input 
                      type="range" min="0" max="0.2" step="0.01"
                      value={settings.letterSpacing}
                      onChange={(e) => onUpdateSettings({ ...settings, letterSpacing: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-black/5 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs font-bold uppercase opacity-50 dark:opacity-70">Paragraph Width</label>
                      <span className="text-xs font-bold dark:text-white">{settings.paragraphWidth}%</span>
                    </div>
                    <input 
                      type="range" min="40" max="100" step="5" 
                      value={settings.paragraphWidth}
                      onChange={(e) => onUpdateSettings({ ...settings, paragraphWidth: parseInt(e.target.value) })}
                      className="w-full h-2 bg-black/5 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </section>

                {/* Toggles */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Sparkles size={20} className="text-primary" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold dark:text-white">Segmented View</p>
                          {isSegmenting && <span className="text-[10px] text-primary animate-pulse">Processing…</span>}
                        </div>
                        <p className="text-[10px] opacity-50 dark:opacity-70">Syllable / grapheme splitting</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => onUpdateSettings({ ...settings, segmentedView: !settings.segmentedView })}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors relative flex-shrink-0",
                        settings.segmentedView ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                        settings.segmentedView ? "left-7" : "left-1"
                      )} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Eye size={20} className="text-primary" />
                      <div>
                        <p className="text-sm font-bold dark:text-white">Focus Spotlight</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Dims everything except current line</p>
                        <p className="text-[10px] opacity-50 dark:opacity-70">Highlight current line</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => onUpdateSettings({ ...settings, lineFocus: !settings.lineFocus })}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors relative flex-shrink-0",
                        settings.lineFocus ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                        settings.lineFocus ? "left-7" : "left-1"
                      )} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Ruler size={20} className="text-primary" />
                      <div>
                        <p className="text-sm font-bold dark:text-white">Cursor Guide</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Thin line that tracks cursor position</p>
                        <p className="text-[10px] opacity-50 dark:opacity-70">Guide for your eyes</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => onUpdateSettings({ ...settings, readingRuler: !settings.readingRuler })}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors relative flex-shrink-0",
                        settings.readingRuler ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                        settings.readingRuler ? "left-7" : "left-1"
                      )} />
                    </button>
                  </div>
                </section>

                {/* Overlay Colors */}
                <section>
                  <label className="text-xs font-bold uppercase opacity-50 dark:opacity-70 mb-3 block">Color Overlay</label>
                  <div className="flex gap-3 flex-wrap">
                    {OVERLAY_COLORS.map(c => (
                      <button 
                        key={c.name}
                        onClick={() => onUpdateSettings({ ...settings, overlayColor: c.value })}
                        className={cn(
                          "w-10 h-10 rounded-full border-2 transition-all",
                          settings.overlayColor === c.value
                            ? "border-primary scale-110"
                            : "border-transparent hover:border-black/20 dark:hover:border-white/20"
                        )}
                        style={{ backgroundColor: c.value || '#e2e8f0' }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </section>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
