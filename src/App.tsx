import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, BookOpen, LogOut,
  Plus, Bell, Search, HelpCircle, Sparkles, Mic,
  Trophy, CreditCard, CheckCircle2, ChevronRight,
  Mail, MessageSquare, FileText, BarChart2
} from 'lucide-react';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { InputSelector } from './components/InputSelector';
import { Reader } from './components/Reader';
import { Onboarding } from './components/Onboarding';
import { Progress } from './components/Progress';
import { Dictation } from './components/Dictation';
import { UserStats, ReadingSettings, Language, UserPreferences } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { cn } from './lib/utils';


const MOCK_STATS: UserStats = {
  streak: 7,
  lastReadDate: new Date().toISOString().slice(0, 10),
  totalTime: 14400, 
  totalWords: 12850,
  sessions: [
    { id: '1', title: 'The Joy of Reading',      language: 'en', timestamp: Date.now() - 86400000 * 0, duration: 1800, wordsRead: 1450, completed: true },
    { id: '2', title: 'Bengali Literature Intro', language: 'bn', timestamp: Date.now() - 86400000 * 1, duration: 2400, wordsRead: 2100, completed: true },
    { id: '3', title: 'Neurodiversity Guide',     language: 'en', timestamp: Date.now() - 86400000 * 2, duration: 1200, wordsRead: 950,  completed: true },
    { id: '4', title: 'Focus & Attention',         language: 'en', timestamp: Date.now() - 86400000 * 3, duration: 900,  wordsRead: 780,  completed: true },
    { id: '5', title: 'রবীন্দ্রনাথের গল্প',         language: 'bn', timestamp: Date.now() - 86400000 * 4, duration: 2100, wordsRead: 1800, completed: true },
    { id: '6', title: 'Adaptive Learning Methods', language: 'en', timestamp: Date.now() - 86400000 * 5, duration: 1500, wordsRead: 1250, completed: true },
    { id: '7', title: 'Phonics Made Easy',         language: 'en', timestamp: Date.now() - 86400000 * 6, duration: 600,  wordsRead: 520,  completed: false },
    { id: '8', title: 'Reading Comprehension',     language: 'en', timestamp: Date.now() - 86400000 * 7, duration: 1800, wordsRead: 1600, completed: true },
    { id: '9', title: 'বাংলা ব্যাকরণ পরিচিতি',       language: 'bn', timestamp: Date.now() - 86400000 * 8, duration: 2100, wordsRead: 2400, completed: true },
  ],
};

const MOCK_LIBRARY = [
  { id: '1', title: 'The Joy of Reading',           date: '2026-03-28', words: 1450,  lang: 'en', favorite: true  },
  { id: '2', title: 'Bengali Literature Intro',      date: '2026-03-26', words: 2100,  lang: 'bn', favorite: true  },
  { id: '3', title: 'Neurodiversity Guide',          date: '2026-03-24', words: 950,   lang: 'en', favorite: false },
  { id: '4', title: 'Focus & Attention',             date: '2026-03-22', words: 780,   lang: 'en', favorite: false },
  { id: '5', title: 'রবীন্দ্রনাথের গল্প',              date: '2026-03-20', words: 1800,  lang: 'bn', favorite: true  },
  { id: '6', title: 'Adaptive Learning Methods',     date: '2026-03-18', words: 1250,  lang: 'en', favorite: false },
  { id: '7', title: 'Phonics Made Easy',             date: '2026-03-16', words: 520,   lang: 'en', favorite: false },
  { id: '8', title: 'Reading Comprehension',         date: '2026-03-14', words: 1600,  lang: 'en', favorite: true  },
];



export default function App() {
  
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(() => {
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

  
  const stats: UserStats = MOCK_STATS;
  const library = MOCK_LIBRARY;

  const [settings, setSettings] = useState<ReadingSettings>(() => {
    const s = localStorage.getItem('sp_settings');
    return s ? JSON.parse(s) : DEFAULT_SETTINGS;
  });

  const [view, setView] = useState<
    'dashboard' | 'input' | 'reader' | 'dictation' | 'challenges' |
    'profile' | 'subscription' | 'help' | 'library' | 'progress'
  >('dashboard');

  const [libraryFilter, setLibraryFilter] = useState<'all' | 'favorites'>('all');


  const [currentContent, setCurrentContent] = useState({
    text: '', segmentedText: '', title: '', language: 'en' as Language,
  });

  
  useEffect(() => { localStorage.setItem('sp_prefs', JSON.stringify(prefs)); }, [prefs]);
  useEffect(() => { localStorage.setItem('sp_settings', JSON.stringify(settings)); }, [settings]);

  
  useEffect(() => {
    
  }, [prefs.theme]);

  
  const userInitial = currentUser?.name ? currentUser.name[0].toUpperCase() : 'U';
  const userDisplayName = currentUser?.name || 'User';

  
  const handleLogin = (user: { name: string; email: string }) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('sp_session');
    setCurrentUser(null);
    setPrefs(p => ({ ...p, onboardingComplete: false }));
  };

  const handleOnboardingComplete = (p: UserPreferences) => {
    setPrefs({ ...p, onboardingComplete: true });
  };

  const handleContentReady = (text: string, title: string, language: Language) => {
    setCurrentContent({ text, segmentedText: text, title, language });
    setView('reader');
  };

  

  
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  
  if (!prefs.onboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  
  if (view === 'reader') {
    return (
      <Reader
        content={settings.segmentedView ? currentContent.segmentedText : currentContent.text}
        title={currentContent.title}
        language={currentContent.language}
        settings={settings}
        onUpdateSettings={() => {}} 
        onBack={() => setView('dashboard')}
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
    { id: 'challenges',   icon: Trophy,           label: 'Challenges'   },
    { id: 'subscription', icon: CreditCard,       label: 'Subscription' },
  ];

  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 flex">

      {}


      {}
      <aside className="w-20 lg:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/5 flex flex-col transition-all">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            S
          </div>
          <span className="hidden lg:block font-display font-bold text-xl tracking-tight text-slate-900 dark:text-white">
            SohojPaath
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-2">
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
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut size={22} className="flex-shrink-0" />
            <span className="hidden lg:block font-semibold text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {}
      <main className="flex-1 flex flex-col overflow-hidden">

        {}
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
                <p className="text-sm font-bold text-slate-900 dark:text-white">{userDisplayName}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Free Plan</p>
              </div>
              <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                {userInitial}
              </div>
            </div>
          </div>
        </header>

        {}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">

            {}
            {view === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
                      Welcome back, {userDisplayName.split(' ')[0]}! 👋
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                      {stats.totalWords.toLocaleString()} words read total. Keep it up!
                    </p>
                  </div>
                  <button
                    className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                  >
                    <Plus size={18} /> New Reading
                  </button>
                </div>
                <Dashboard stats={stats} />
              </motion.div>
            )}

            {}
            {view === 'input' && (
              <motion.div
                key="input"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
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

            {}
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
                          <ChevronRight size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {}
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

            {}
            {view === 'dictation' && (
              <motion.div
                key="dictation"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Dictation />
              </motion.div>
            )}

            {}
            {view === 'challenges' && (
              <motion.div
                key="challenges"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-4xl mx-auto"
              >
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-display font-bold mb-3 text-slate-900 dark:text-white">
                    Reading Challenges
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400">
                    Sharpen your skills with gamified learning modules.
                  </p>
                </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { id: 'spelling',  title: 'Spelling Bee',     desc: 'Listen to a word and spell it correctly.',  icon: '🐝', iconBg: 'bg-amber-100 dark:bg-amber-900/30',    ready: true  },
                        { id: 'speed',     title: 'Speed Reader',      desc: 'Read a passage in under 30 seconds.',       icon: '⚡', iconBg: 'bg-blue-100 dark:bg-blue-900/30',      ready: false },
                        { id: 'syllable',  title: 'Syllable Splitter', desc: 'Break words into correct segments.',        icon: '✂️', iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', ready: false },
                        { id: 'vocab',     title: 'Vocab Master',      desc: 'Match words with simple definitions.',      icon: '📖', iconBg: 'bg-purple-100 dark:bg-purple-900/30',   ready: false },
                      ].map(ch => (
                        <div
                          key={ch.id}
                          className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-white/5 hover:shadow-md transition-shadow relative"
                        >
                          <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6", ch.iconBg)}>
                            {ch.icon}
                          </div>
                          <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{ch.title}</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{ch.desc}</p>
                          <button
                            className="w-full py-3 font-bold rounded-xl transition-all bg-primary/5 dark:bg-primary/10 text-primary hover:bg-primary hover:text-white"
                          >
                            Start Challenge
                          </button>
                        </div>
                      ))}
                </div>
              </motion.div>
            )}

            {}
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
                      <span className="text-3xl font-display font-bold text-primary">{userInitial}</span>
                    </div>
                  </div>
                  <div className="pt-14 pb-8 px-8">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">{userDisplayName}</h2>
                        <p className="text-slate-500 dark:text-slate-400">{currentUser?.email}</p>
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

            {}
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
                      features: ['Basic Reader', 'Standard TTS', '5 OCR scans/day', 'Core Challenges'],
                      current: true,
                    },
                    {
                      name: 'Pro', price: '$9.99',
                      features: ['Advanced AI OCR', 'Premium Neural TTS', 'Unlimited scans', 'All Challenges', 'Offline Mode'],
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
                          "w-full py-3.5 rounded-2xl font-bold transition-all text-sm",
                          (plan as any).current
                            ? "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-400 cursor-default"
                            : "bg-primary text-white hover:scale-105 shadow-lg shadow-primary/20"
                        )}
                      >
                        {(plan as any).current ? 'Current Plan' : 'Upgrade Now'}
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {}
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
                    { q: 'How does Syllable Splitter work?',    a: 'Our AI analyses the linguistic structure of words and adds visual markers to help with phonetic decoding.'           },
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

      {}
      <button
        onClick={() => setView('help')}
        className="fixed bottom-8 right-8 w-12 h-12 bg-white dark:bg-slate-800 shadow-xl rounded-full flex items-center justify-center text-primary border border-slate-200 dark:border-white/10 hover:scale-110 transition-transform z-50"
      >
        <HelpCircle size={22} />
      </button>
    </div>
  );
}
