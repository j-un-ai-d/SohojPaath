import React, { useState } from 'react';
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
  onBack: () => void;
}

export const Reader: React.FC<ReaderProps> = ({
  content,
  title,
  language,
  settings,
  onUpdateSettings,
  onBack
}) => {
  const [showSettings, setShowSettings] = useState(false);

  const words = content.split(/\s+/);
  const theme = THEMES[settings.theme];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100">
      <header className="h-16 border-b border-black/5 dark:border-white/10 flex items-center justify-between px-4 sticky top-0 z-30 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-display font-semibold truncate max-w-[200px] dark:text-white">{title}</h1>
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

      <main className={cn("flex-1 overflow-y-auto relative p-6 md:p-12 transition-colors duration-300", theme.bg, theme.text)}>
        {settings.overlayColor && (
          <div
            className="fixed inset-0 pointer-events-none z-10"
            style={{ backgroundColor: settings.overlayColor }}
          />
        )}

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
          {words.map((word, i) => (
            <span key={i} className="inline-block mr-[0.25em]">
              {word}
            </span>
          ))}
        </div>
      </main>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="bg-white dark:bg-slate-900 shadow-2xl rounded-full px-6 py-3 flex items-center gap-6 border border-black/5 dark:border-white/10"
        >
          <button
            className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
            title="Text-to-Speech (demo)"
          >
            <Play fill="currentColor" />
          </button>

          <div className="flex items-center gap-4 border-l border-black/10 dark:border-white/10 pl-6">
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold opacity-50 dark:opacity-70">Speed</span>
              <span className="text-sm font-medium dark:text-white">1.0x</span>
            </div>
          </div>

          <div className="text-[10px] font-bold opacity-50 dark:opacity-70 border-l border-black/10 dark:border-white/10 pl-6">
            {words.length} words
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
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
                <section>
                  <label className="text-xs font-bold uppercase opacity-50 dark:opacity-70 mb-3 block">Font Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {FONTS.map(f => (
                      <button
                        key={f.name}
                        onClick={() => onUpdateSettings({ ...settings, fontFamily: f.value })}
                        className={cn(
                          "p-3 rounded-xl border text-sm transition-all",
                          settings.fontFamily === f.value
                            ? "border-primary bg-primary/5 text-primary font-bold"
                            : "border-black/5 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 dark:text-white"
                        )}
                        style={{ fontFamily: f.value }}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <label className="text-xs font-bold uppercase opacity-50 dark:opacity-70 mb-3 block">Theme</label>
                  <div className="grid grid-cols-4 gap-2">
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
                            '#000000',
                          color:
                            t === 'light' ? '#111827' :
                            t === 'dark' ? '#f1f5f9' :
                            t === 'sepia' ? '#5B4636' :
                            '#facc15',
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </section>

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

                <section className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Sparkles size={20} className="text-primary" />
                      <div>
                        <p className="text-sm font-bold dark:text-white">Segmented View</p>
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
                        <p className="text-sm font-bold dark:text-white">Line Focus</p>
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
                        <p className="text-sm font-bold dark:text-white">Reading Ruler</p>
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
