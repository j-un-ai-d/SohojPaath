import React from 'react';
import {
  Mic,
  Copy,
  Trash2,
  BookOpen,
  MessageSquare,
  Languages,
  Edit3
} from 'lucide-react';
import { cn } from '../lib/utils';

export const Dictation: React.FC = () => {

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-display font-bold mb-3 dark:text-white">Speech-to-Text Dictation</h2>
        <p className="text-slate-500 dark:text-slate-400">Compose your thoughts verbally. SohojPaath transcribes for you.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-3xl shadow-xl border border-black/5 dark:border-white/5 text-center space-y-8">
        {}
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <button
              className="w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 border-4 bg-primary/5 dark:bg-primary/10 border-primary text-primary hover:scale-105"
            >
              <Mic size={40} />
            </button>
          </div>

          <div>
            <p className="text-xl font-bold mb-1 dark:text-white">
              Tap to start
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your voice will be converted to text
            </p>
          </div>
        </div>

        {}
        <div className="flex justify-center">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex gap-1">
            <button
              className="px-6 py-2 rounded-xl text-sm font-bold transition-all bg-white dark:bg-slate-700 shadow-sm text-primary"
            >
              EN
            </button>
            <button
              className="px-6 py-2 rounded-xl text-sm font-bold transition-all text-slate-500"
            >
              বাংলা
            </button>
          </div>
        </div>

        {}
        <div className="relative group">
          <div className="w-full min-h-[200px] max-h-[400px] overflow-y-auto bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 text-left border border-black/5 dark:border-white/5">
              <p className="text-lg leading-relaxed dark:text-slate-200">
                SohojPaath is an AI-powered adaptive reading platform designed to support neurodiverse learners. The platform transforms standard text into a multi-sensory, accessible reading format with features like syllable segmentation, adjustable typography, and text-to-speech.
              </p>
          </div>
        </div>

        {}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 rounded-2xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all dark:text-white"
          >
            <Copy size={18} />
            Copy Text
          </button>

          <button
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 rounded-2xl font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all dark:text-white"
          >
            <Trash2 size={18} />
            Clear
          </button>

          <button
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
          >
            <BookOpen size={18} />
            Send to Reader
          </button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        {[
          { icon: MessageSquare, title: 'Clear Speech', desc: 'Speak at a natural pace for better accuracy.' },
          { icon: Languages, title: 'Bilingual', desc: 'Switch languages to dictate in English or Bengali.' },
          { icon: Edit3, title: 'Edit After', desc: 'Copy your text to refine it in any document.' },
        ].map((tip, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
              <tip.icon size={20} />
            </div>
            <h4 className="font-bold mb-1 dark:text-white">{tip.title}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">{tip.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
