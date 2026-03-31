import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Languages, 
  Sparkles, 
  Eye, 
  Zap,
  Sun,
  Moon
} from 'lucide-react';
import { UserPreferences } from '../types';
import { cn } from '../lib/utils';

interface OnboardingProps {
  onComplete: (prefs: UserPreferences) => void;
}

const STEPS = [
  { id: 1, title: 'Welcome' },
  { id: 2, title: 'Language' },
  { id: 3, title: 'Theme' },
  { id: 4, title: 'Assistance' },
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [prefs, setPrefs] = useState<UserPreferences>({
    language: 'both',
    assistanceLevel: 'moderate',
    theme: 'light',
    onboardingComplete: false,
  });

  useEffect(() => {
    
  }, [prefs.theme]);

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onComplete({ ...prefs, onboardingComplete: true });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-display font-bold text-slate-900">Welcome to SohojPaath</h1>
              <p className="text-lg text-slate-600 max-w-md mx-auto">
                Your AI-powered companion for adaptive reading and bilingual learning.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Bilingual Support', desc: 'Seamlessly switch between English and Bengali.', icon: <Languages className="text-blue-500" /> },
                { title: 'Adaptive View', desc: 'Syllable and grapheme splitting for easier reading.', icon: <Sparkles className="text-purple-500" /> },
                { title: 'Focus Tools', desc: 'Line focus and reading rulers to reduce distraction.', icon: <Eye className="text-emerald-500" /> },
                { title: 'AI Assistance', desc: 'Instant word definitions and smart segmentation.', icon: <Zap className="text-orange-500" /> },
              ].map((feature, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{feature.title}</h3>
                    <p className="text-sm text-slate-500">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-display font-bold text-slate-900">Choose your language</h1>
              <p className="text-lg text-slate-600">Which language would you like to read in?</p>
            </div>

            <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
              {[
                { id: 'en', label: 'English', sub: 'Read primarily in English' },
                { id: 'bn', label: 'বাংলা (Bengali)', sub: 'বাংলায় পড়তে পছন্দ করি' },
                { id: 'both', label: 'Both / উভয়ই', sub: 'English & Bengali mixed' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setPrefs({ ...prefs, language: lang.id as any })}
                  className={cn(
                    "p-6 rounded-3xl border-2 text-left transition-all flex items-center justify-between",
                    prefs.language === lang.id 
                      ? "border-primary bg-primary/5 shadow-md" 
                      : "border-slate-100 bg-white hover:border-slate-200"
                  )}
                >
                  <div>
                    <h3 className={cn("font-bold text-lg", prefs.language === lang.id ? "text-primary" : "text-slate-900")}>
                      {lang.label}
                    </h3>
                    <p className="text-sm text-slate-500">{lang.sub}</p>
                  </div>
                  {prefs.language === lang.id && (
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-display font-bold text-slate-900">Pick a theme</h1>
              <p className="text-lg text-slate-600">Choose the appearance that feels best for your eyes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <button
                
                className={cn(
                  "group p-4 rounded-[2rem] border-2 transition-all",
                  prefs.theme === 'light' ? "border-primary bg-primary/5 shadow-lg" : "border-slate-100 bg-white hover:border-slate-200"
                )}
              >
                <div className="bg-slate-50 rounded-2xl p-8 mb-4 flex items-center justify-center">
                  <Sun size={48} className={prefs.theme === 'light' ? "text-primary" : "text-slate-400"} />
                </div>
                <h3 className={cn("font-bold text-lg text-center", prefs.theme === 'light' ? "text-primary" : "text-slate-900")}>
                  Light Mode
                </h3>
              </button>

              <button
                
                className={cn(
                  "group p-4 rounded-[2rem] border-2 transition-all",
                  prefs.theme === 'dark' ? "border-primary bg-primary/5 shadow-lg" : "border-slate-100 bg-white hover:border-slate-200"
                )}
              >
                <div className="bg-slate-900 rounded-2xl p-8 mb-4 flex items-center justify-center">
                  <Moon size={48} className={prefs.theme === 'dark' ? "text-primary" : "text-slate-600"} />
                </div>
                <h3 className={cn("font-bold text-lg text-center", prefs.theme === 'dark' ? "text-primary" : "text-slate-900")}>
                  Dark Mode
                </h3>
              </button>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-display font-bold text-slate-900">Assistance Level</h1>
              <p className="text-lg text-slate-600">How much AI support would you like while reading?</p>
            </div>

            <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
              {[
                { id: 'light', label: 'Light Support', desc: 'Minimal interventions, standard reading experience.' },
                { id: 'moderate', label: 'Moderate Support', desc: 'Helpful segmentation and key word definitions.' },
                { id: 'full', label: 'Full Support', desc: 'Maximum assistance with syllables, focus tools, and TTS.' },
              ].map((level) => (
                <button
                  key={level.id}
                  onClick={() => setPrefs({ ...prefs, assistanceLevel: level.id as any })}
                  className={cn(
                    "p-6 rounded-3xl border-2 text-left transition-all flex items-center justify-between",
                    prefs.assistanceLevel === level.id 
                      ? "border-primary bg-primary/5 shadow-md" 
                      : "border-slate-100 bg-white hover:border-slate-200"
                  )}
                >
                  <div>
                    <h3 className={cn("font-bold text-lg", prefs.assistanceLevel === level.id ? "text-primary" : "text-slate-900")}>
                      {level.label}
                    </h3>
                    <p className="text-sm text-slate-500">{level.desc}</p>
                  </div>
                  {prefs.assistanceLevel === level.id && (
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 flex gap-1">
        {STEPS.map((s) => (
          <div 
            key={s.id} 
            className={cn(
              "flex-1 transition-all duration-500",
              step >= s.id ? "bg-primary" : "bg-slate-200"
            )}
          />
        ))}
      </div>

      <div className="max-w-4xl w-full">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>

      <div className="mt-12 flex flex-col items-center gap-6 w-full max-w-md">
        <div className="flex items-center gap-6 w-full">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 py-4 px-6 rounded-2xl border-2 border-slate-200 font-bold text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft size={20} />
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            className={cn(
              "flex-1 py-4 px-6 rounded-2xl font-bold text-white shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2",
              step === 4 ? "bg-emerald-600 shadow-emerald-600/20" : "bg-primary"
            )}
          >
            {step === 4 ? (
              <>
                Start Reading
              </>
            ) : (
              <>
                Continue
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {STEPS.map((s) => (
            <div 
              key={s.id}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                step === s.id ? "bg-primary w-6" : "bg-slate-300"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
