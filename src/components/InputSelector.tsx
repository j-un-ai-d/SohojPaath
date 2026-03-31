import React, { useState } from 'react';
import {
  Camera,
  Link as LinkIcon,
  FileText,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';

const SAMPLE_SCANNED_TEXT = `SohojPaath is an AI-powered adaptive reading platform designed to support neurodiverse learners. The platform transforms standard text into a multi-sensory, accessible reading format with features like syllable segmentation, adjustable typography, color overlays, and text-to-speech — all tailored to individual learning needs.

Built with bilingual support for English and Bengali, SohojPaath aims to bridge the accessibility gap in education by providing tools that adapt to each reader's unique cognitive profile.`;

const SAMPLE_URL_TEXT = `This is simulated content extracted from a web article.

SohojPaath's Distraction Filtering Module has automatically removed ads, sidebars, and pop-ups from this page. You are now viewing a clean, high-legibility version of the article optimized for your reading settings.

In a production environment, this would use our custom DOM extraction engine to provide a consistent, multi-sensory reading experience across any website.`;

interface InputSelectorProps {
  onContentReady: (content: string, title: string, language: 'en' | 'bn') => void;
}

export const InputSelector: React.FC<InputSelectorProps> = ({ onContentReady }) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'url' | 'manual'>('manual');
  const [inputValue, setInputValue] = useState('');

  const handleManualSubmit = () => {
    if (!inputValue.trim()) return;
    const isBengali = /[\u0980-\u09FF]/.test(inputValue);
    onContentReady(inputValue, 'New Reading Session', isBengali ? 'bn' : 'en');
  };

  const handleUrlSubmit = () => {
    if (!inputValue.trim()) return;
    onContentReady(SAMPLE_URL_TEXT, 'Web Article (Filtered)', 'en');
  };

  const handleScanDemo = () => {
    onContentReady(SAMPLE_SCANNED_TEXT, 'Scanned Document', 'en');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-black/5 dark:border-white/10">
        { }
        <div className="flex border-b border-black/5">
          <button
            onClick={() => setActiveTab('scan')}
            className={cn(
              "flex-1 py-4 flex flex-col items-center gap-1 transition-colors",
              activeTab === 'scan' ? "bg-primary/5 text-primary border-b-2 border-primary" : "hover:bg-black/5 dark:hover:bg-white/5 dark:text-slate-400"
            )}
          >
            <Camera size={20} />
            <span className="text-xs font-bold uppercase">Scan</span>
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={cn(
              "flex-1 py-4 flex flex-col items-center gap-1 transition-colors",
              activeTab === 'url' ? "bg-primary/5 text-primary border-b-2 border-primary" : "hover:bg-black/5 dark:hover:bg-white/5 dark:text-slate-400"
            )}
          >
            <LinkIcon size={20} />
            <span className="text-xs font-bold uppercase">URL</span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={cn(
              "flex-1 py-4 flex flex-col items-center gap-1 transition-colors",
              activeTab === 'manual' ? "bg-primary/5 text-primary border-b-2 border-primary" : "hover:bg-black/5 dark:hover:bg-white/5 dark:text-slate-400"
            )}
          >
            <FileText size={20} />
            <span className="text-xs font-bold uppercase">Type</span>
          </button>
        </div>

        { }
        <div className="p-8">
          {activeTab === 'scan' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                <Camera size={32} />
              </div>
              <div>
                <h3 className="text-lg font-display font-bold dark:text-white">Scan Printed Text</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Upload a photo of a book page or document</p>
              </div>
              <button
                onClick={handleScanDemo}
                className="px-8 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
              >
                Try Sample Scan
              </button>
              <p className="text-xs text-slate-400 dark:text-slate-500">

              </p>
            </div>
          )}

          {activeTab === 'url' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-display font-bold dark:text-white">Read from Web</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Paste a link to an article or blog post</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/article"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none dark:text-white"
                />
                <button
                  onClick={handleUrlSubmit}
                  className="bg-primary text-white p-3 rounded-xl hover:bg-primary/90"
                >
                  <ArrowRight size={24} />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'manual' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-display font-bold dark:text-white">Type or Paste</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Enter the text you want to read</p>
              </div>
              <textarea
                rows={6}
                placeholder="Start typing here..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none resize-none dark:text-white"
              />
              <button
                onClick={handleManualSubmit}
                disabled={!inputValue.trim()}
                className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50"
              >
                <Sparkles size={20} />
                Start Reading
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800">
          <p className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase mb-1">Pro Tip</p>
          <p className="text-xs text-amber-800 dark:text-amber-200">Try scanning a page with Bengali text! SohojPaath uses AI to segment grapheme clusters for easier decoding.</p>
        </div>
        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
          <p className="text-xs font-bold text-indigo-800 dark:text-indigo-400 uppercase mb-1">Accessibility</p>
          <p className="text-xs text-indigo-800 dark:text-indigo-200">Our reader supports OpenDyslexic font and adjustable line spacing to reduce visual stress.</p>
        </div>
      </div>
    </div>
  );
};
