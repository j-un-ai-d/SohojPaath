import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, BookOpen, LogOut,
  Plus, Bell, Search, User, HelpCircle, Sparkles, Mic,
  Brain, CreditCard, CheckCircle2, ChevronRight,
  Mail, MessageSquare, FileText, BarChart2, Trash2
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { InputSelector } from './components/InputSelector';
import { Reader } from './components/Reader';
import { Onboarding } from './components/Onboarding';
import { Progress } from './components/Progress';
import { Dictation } from './components/Dictation';
import { LoginPage } from './components/LoginPage';
import DyslexiaScreening from './components/DyslexiaScreening';
import { UserStats, ReadingSettings, Language, UserPreferences, ReadingSession, ScreeningResult } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { cn } from './lib/utils';

// ── helpers
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function calcStreak(sessions: ReadingSession[], currentStreak: number, lastReadDate: string): number {
  const today = todayStr();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (lastReadDate === today) return currentStreak;
  if (lastReadDate === yesterday) return currentStreak + 1;
  return 1;
}

export default function App() {
  // ── state
  const [currentUser, setCurrentUser] = useState(() => {
    const session = localStorage.getItem('sp_session');
    return session ? JSON.parse(session) : null;
  });

  const [prefs, setPrefs] = useState<UserPreferences>(() => {
    const s = localStorage.getItem('sp_prefs');
    return s ? JSON.parse(s) : {
      language: 'both',
      assistanceLevel: 'moderate',
      theme: 'light',
      onboardingComplete: false,
    };
  });

  const [stats, setStats] = useState<UserStats>(() => {
    const s = localStorage.getItem('sp_stats');
    const parsed = s ? JSON.parse(s) : {
      streak: 0,
      lastReadDate: '',
      totalTime: 0,
      totalWords: 0,
      sessions: [],
      screeningHistory: [],
    };
    // ensure screeningHistory exists for old saved data
    if (!parsed.screeningHistory) parsed.screeningHistory = [];
    return parsed;
  });

  const [library, setLibrary] = useState<any[]>(() => {
    const s = localStorage.getItem('sp_library');
    return s ? JSON.parse(s) : [
      { id: '1', title: 'The Joy of Reading',       date: '2026-03-10', words: 450,  lang: 'en', favorite: false },
      { id: '2', title: 'Bengali Literature Intro',  date: '2026-03-12', words: 1200, lang: 'bn', favorite: true  },
      { id: '3', title: 'Neurodiversity Guide',      date: '2026-03-14', words: 850,  lang: 'en', favorite: false },
    ];
  });

  const [settings, setSettings] = useState<ReadingSettings>(() => {
    const s = localStorage.getItem('sp_settings');
    return s ? JSON.parse(s) : DEFAULT_SETTINGS;
  });

  const [view, setView] = useState<
    'dashboard' | 'input' | 'reader' | 'dictation' |
    'profile' | 'subscription' | 'help' | 'library' | 'progress' | 'screening'
  >('dashboard');

  const [libraryFilter,   setLibraryFilter]   = useState<'all' | 'favorites'>('all');
  const [currentContent,  setCurrentContent]  = useState({
    text: '', segmentedText: '', title: '', language: 'en' as Language,
  });
  const [sessionStart, setSessionStart] = useState<number | null>(null);

  // ── persist
  useEffect(() => { localStorage.setItem('sp_prefs',    JSON.stringify(prefs));    }, [prefs]);
  useEffect(() => { localStorage.setItem('sp_stats',    JSON.stringify(stats));    }, [stats]);
  useEffect(() => { localStorage.setItem('sp_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('sp_library',  JSON.stringify(library));  }, [library]);

  // ── theme sync
  // Tailwind v4 class-based dark mode — requires .dark on <html>
  useEffect(() => {
    if (prefs.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [prefs.theme]);

  // ── handlers
  const handleLogout = () => {
    localStorage.removeItem('sp_session');
    setCurrentUser(null);
  };

  const handleOnboardingComplete = (p: UserPreferences) => {
    setPrefs({ ...p, onboardingComplete: true });
  };

  const handleContentReady = (text: string, title: string, language: Language) => {
    setCurrentContent({ text, segmentedText: text, title, language });
    setSessionStart(Date.now());
    setView('reader');
  };

  const handleSessionEnd = (wordsRead: number) => {
    if (!sessionStart) return;
    const duration = Math.round((Date.now() - sessionStart) / 1000);
    const today = todayStr();

    const newSession: ReadingSession = {
      id:        Date.now().toString(),
      title:     currentContent.title || 'Untitled',
      language:  currentContent.language,
      timestamp: Date.now(),
      duration,
      wordsRead,
      completed: wordsRead > 0,
    };

    setStats(prev => ({
      streak:       calcStreak(prev.sessions, prev.streak, prev.lastReadDate),
      lastReadDate: today,
      totalTime:    prev.totalTime + duration,
      totalWords:   prev.totalWords + wordsRead,
      sessions:     [newSession, ...prev.sessions].slice(0, 100),
    }));

    if (duration > 30 && currentContent.title) {
      setLibrary(prev => {
        const exists = prev.some(item => item.title === currentContent.title);
        if (exists) return prev;
        return [{
          id:       Date.now().toString(),
          title:    currentContent.title,
          date:     today,
          words:    wordsRead,
          lang:     currentContent.language,
          favorite: false,
        }, ...prev];
      });
    }

    setSessionStart(null);
  };

  const handleScreeningComplete = (result: ScreeningResult) => {
    setStats(prev => ({
      ...prev,
      screeningHistory: [result, ...prev.screeningHistory].slice(0, 50),
    }));
  };

  const handleDictationSendToReader = (text: string) => {
    handleContentReady(text, 'Dictated Text', prefs.language === 'bn' ? 'bn' : 'en');
  };

  // ── auth gate
  if (!currentUser) return <LoginPage onLogin={(user) => setCurrentUser(user)} />;

  // ── onboarding gate
  if (!prefs.onboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // ── reader (full-screen)
  if (view === 'reader') {
    return (
      <Reader
        content={settings.segmentedView ? currentContent.segmentedText : currentContent.text}
        title={currentContent.title}
        language={currentContent.language}
        settings={settings}
        onUpdateSettings={setSettings}
        onBack={(wordsRead) => {
          handleSessionEnd(wordsRead);
          setView('dashboard');
        }}
      />
    );
  }

  const filteredLibrary = libraryFilter === 'favorites'
    ? library.filter(i => i.favorite)
    : library;

  const navItems = [
    { id: 'dashboard',    icon: LayoutDashboard, label: 'Dashboard'    },
    { id: 'input',        icon: Plus,            label: 'New Reading'  },
    { id: 'library',      icon: BookOpen,         label: 'Library'      },
    { id: 'progress',     icon: BarChart2,        label: 'Progress'     },
    { id: 'dictation',    icon: Mic,              label: 'Dictation'    },
    { id: 'screening',    icon: Brain,            label: 'Screening'    },
    { id: 'subscription', icon: CreditCard,       label: 'Subscription' },
  ];

  // ── main shell
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 flex">

      {/* ── Sidebar ── */}
      <aside className="w-20 lg:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/5 flex flex-col transition-all h-screen sticky top-0 overflow-hidden">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            S
          </div>
          <span className="hidden lg:block font-display font-bold text-xl tracking-tight text-slate-900 dark:text-white">
            SohojPaath
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => { setView(id as any); }}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-2xl transition-all",
                view === id
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
              )}
            >
              <Icon size={22} className="flex-shrink-0" />
              <span className="hidden lg:block font-semibold text-sm">{label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-white/5 space-y-1">
          <button
            onClick={() => setView('help')}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-2xl transition-all",
              view === 'help'
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
            )}
          >
            <HelpCircle size={22} className="flex-shrink-0" />
            <span className="hidden lg:block font-semibold text-sm">Help & Support</span>
          </button>
          <button
            onClick={() => { setPrefs(p => ({ ...p, onboardingComplete: false })); handleLogout(); }}
            className="w-full flex items-center gap-3 p-3 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut size={22} className="flex-shrink-0" />
            <span className="hidden lg:block font-semibold text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-8">
          <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-2xl w-full max-w-sm">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search library…"
              className="bg-transparent border-none outline-none text-sm w-full text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
            </button>
            <div
              onClick={() => setView('profile')}
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Free Plan</p>
              </div>
              <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                {currentUser.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">

            {/* ── Dashboard ── */}
            {view === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
              >
                <Dashboard 
                  stats={stats} 
                  currentUser={currentUser}
                  onStartReading={() => setView('input')}
                />
              </motion.div>
            )}

            {/* ── New Reading ── */}
            {view === 'input' && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="max-w-4xl mx-auto pt-8"
              >
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-display font-bold mb-3 text-slate-900 dark:text-white">
                    What are we reading today?
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400">
                    Choose a source — SohojPaath will optimise it for you.
                  </p>
                </div>
                <InputSelector onContentReady={handleContentReady} />
              </motion.div>
            )}

            {/* ── Library ── */}
            {view === 'library' && (
              <motion.div
                key="library"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-4xl mx-auto"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Your Library</h2>
                  <div className="flex gap-2">
                    {(['all', 'favorites'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setLibraryFilter(f)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all",
                          libraryFilter === f
                            ? "bg-primary text-white"
                            : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredLibrary.length === 0 ? (
                  <div className="text-center py-20 text-slate-400 dark:text-slate-600">
                    <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="font-medium">No items here yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredLibrary.map(item => (
                      <div
                        key={item.id}
                        className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-white/5 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center flex-shrink-0">
                            <BookOpen size={22} />
                          </div>
                          <div>
                            <h3 className="font-bold group-hover:text-primary transition-colors text-slate-900 dark:text-white">
                              {item.title}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {item.date} · {item.words} words · {item.lang === 'bn' ? 'Bengali' : 'English'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setLibrary(prev =>
                                prev.map(i => i.id === item.id ? { ...i, favorite: !i.favorite } : i)
                              );
                            }}
                            className={cn(
                              "text-xl transition-colors",
                              item.favorite
                                ? "text-yellow-400"
                                : "text-slate-200 dark:text-slate-700 hover:text-yellow-300"
                            )}
                          >
                            ★
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setLibrary(prev => prev.filter(i => i.id !== item.id));
                            }}
                            className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                          <ChevronRight size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Progress ── */}
            {view === 'progress' && (
              <motion.div
                key="progress"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Progress stats={stats} />
              </motion.div>
            )}

            {/* ── Dictation ── */}
            {view === 'dictation' && (
              <motion.div
                key="dictation"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Dictation onSendToReader={handleDictationSendToReader} />
              </motion.div>
            )}



            {view === 'screening' && (
              <motion.div key="screening" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <DyslexiaScreening onScreeningComplete={handleScreeningComplete} />
              </motion.div>
            )}

            {/* ── Profile ── */}
            {view === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-3xl mx-auto"
              >
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-white/5 overflow-hidden">
                  <div className="h-28 bg-gradient-to-r from-primary to-violet-600 relative">
                    <div className="absolute -bottom-10 left-8 w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-2xl border-4 border-white dark:border-slate-800 flex items-center justify-center">
                      <User size={36} className="text-slate-400 dark:text-slate-300" />
                    </div>
                  </div>
                  <div className="pt-14 pb-8 px-8">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">{currentUser.name}</h2>
                        <p className="text-slate-500 dark:text-slate-400">{currentUser.email}</p>
                      </div>
                      <button className="px-5 py-2 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                        Edit Profile
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      {[
                        { label: 'Plan',         value: 'Free Tier',  special: 'text-primary'                          },
                        { label: 'Member Since', value: 'March 2026', special: 'text-slate-900 dark:text-white'        },
                        { label: 'Language',     value: prefs.language === 'both' ? 'EN + BN' : prefs.language.toUpperCase(), special: 'text-slate-900 dark:text-white' },
                      ].map(s => (
                        <div key={s.label} className="p-4 bg-slate-50 dark:bg-slate-700/40 rounded-2xl">
                          <p className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">{s.label}</p>
                          <p className={cn("text-base font-bold", s.special)}>{s.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-3">Account Settings</h3>
                      {[
                        { icon: Bell,     label: 'Notifications',     value: 'Enabled'  },
                        { icon: Sparkles, label: 'AI Personalisation', value: 'Adaptive' },
                        { icon: BookOpen, label: 'Reading History',    value: 'Private'  },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl cursor-pointer transition-all">
                          <div className="flex items-center gap-3">
                            <item.icon size={18} className="text-slate-400" />
                            <span className="font-medium text-sm text-slate-700 dark:text-white">{item.label}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <span className="text-sm">{item.value}</span>
                            <ChevronRight size={14} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setPrefs(p => ({ ...p, onboardingComplete: false }))}
                      className="mt-6 text-sm text-slate-400 hover:text-primary transition-colors"
                    >
                      ↺ Redo onboarding
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Subscription ── */}
            {view === 'subscription' && (
              <motion.div
                key="subscription"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-4xl mx-auto"
              >
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-display font-bold mb-3 text-slate-900 dark:text-white">Choose Your Plan</h2>
                  <p className="text-slate-500 dark:text-slate-400">
                    Unlock advanced AI features and institutional support.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    {
                      name: 'Free', price: '$0',
                      features: ['Basic Reader', 'Standard TTS', 'Unlimited OCR Scans', 'Dyslexia Screening'],
                      current: true,
                    },
                    {
                      name: 'Pro', price: '$9.99',
                      features: ['Unlimited OCR Scans', 'Premium Neural TTS', 'Unlimited Scans', 'Full Screening History', 'Offline Mode'],
                      popular: true,
                    },
                    {
                      name: 'Institutional', price: 'Custom',
                      features: ['School Dashboard', 'Bulk Licensing', 'Teacher Controls', 'API Access', '24/7 Support'],
                    },
                  ].map((plan, i) => (
                    <div
                      key={i}
                      className={cn(
                        "bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border flex flex-col relative",
                        (plan as any).popular
                          ? "border-primary ring-4 ring-primary/10"
                          : "border-slate-200 dark:border-white/5"
                      )}
                    >
                      {(plan as any).popular && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                          Most Popular
                        </div>
                      )}
                      <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl font-display font-bold text-slate-900 dark:text-white">{plan.price}</span>
                        {plan.price !== 'Custom' && (
                          <span className="text-slate-500 dark:text-slate-400 text-sm">/mo</span>
                        )}
                      </div>
                      <ul className="space-y-3 mb-8 flex-1">
                        {plan.features.map((f, j) => (
                          <li key={j} className="flex items-center gap-3 text-sm">
                            <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                            <span className="text-slate-700 dark:text-slate-300">{f}</span>
                          </li>
                        ))}
                      </ul>
                      <button
                        className={cn(
                          "w-full py-3.5 rounded-2xl font-bold transition-all text-sm shadow-lg",
                          (plan as any).current
                            ? "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-400 cursor-default shadow-black/5"
                            : "bg-primary text-white hover:scale-105 shadow-primary/20"
                        )}
                      >
                        {(plan as any).current ? 'Current Plan' : 'Upgrade Now'}
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Help ── */}
            {view === 'help' && (
              <motion.div
                key="help"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-3xl mx-auto"
              >
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-display font-bold mb-3 text-slate-900 dark:text-white">How can we help?</h2>
                  <p className="text-slate-500 dark:text-slate-400">
                    Find answers or contact our accessibility experts.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-5 mb-10">
                  {[
                    { icon: MessageSquare, title: 'Live Chat',     desc: 'Talk to a specialist'  },
                    { icon: Mail,          title: 'Email Support', desc: 'Get help in 24 hours'  },
                    { icon: FileText,      title: 'Documentation', desc: 'Read our user guides'  },
                  ].map((item, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-white/5 text-center hover:shadow-md transition-all cursor-pointer">
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <item.icon size={22} />
                      </div>
                      <h3 className="font-bold mb-1 text-slate-900 dark:text-white">{item.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Frequently Asked Questions</h3>
                  {[
                    { q: 'How does Syllable Splitter work?',    a: 'It uses an offline dictionary-based algorithm (pyphen) to break words into syllables and adds visual markers to help with phonetic decoding.'           },
                    { q: 'Is Bengali script fully supported?',  a: 'Yes. SohojPaath is optimised for Bengali orthography including complex conjunct characters and vowel signs.'         },
                    { q: 'Can I use this for school textbooks?',a: 'Absolutely. Use the Scan feature to capture printed pages and convert them into an accessible reading format.'        },
                    { q: 'Is my data secure?',                  a: "All reading data stays in your browser's localStorage. Nothing is sent to external servers without your consent."    },
                  ].map((faq, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-white/5">
                      <h4 className="font-bold mb-1.5 text-slate-900 dark:text-white">{faq.q}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>


    </div>
  );
}
