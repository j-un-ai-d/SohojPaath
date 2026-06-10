import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  BookOpen, 
  Trophy,
  Flame,
  Calendar,
  ChevronRight,
  Zap,
  Target,
  Lock
} from 'lucide-react';
import { UserStats, ReadingSession, ScreeningResult } from '../types';
import { Brain, Gamepad2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface ProgressProps {
  stats: UserStats;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-black/5 dark:border-white/10 rounded-2xl px-4 py-3 shadow-xl">
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <p className="text-base font-bold text-primary">{payload[0].value} min</p>
    </div>
  );
};

export const Progress: React.FC<ProgressProps> = ({ stats }) => {
  const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
  const gridColor = isDark ? '#1e293b' : '#f1f5f9';

  const weekData = (() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const displayDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const totals: Record<string, number> = {};
    displayDays.forEach(d => { totals[d] = 0; });

    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    
    const recentSessions = stats.sessions.filter(s => s.timestamp >= oneWeekAgo);
    
    if (recentSessions.length === 0) {
      const placeholder = [12, 25, 18, 35, 22, 45, 30];
      return displayDays.map((day, i) => ({ day, minutes: placeholder[i] }));
    }

    recentSessions.forEach(s => {
      const d = new Date(s.timestamp);
      const dayName = days[d.getDay()];
      totals[dayName] += Math.round(s.duration / 60);
    });

    return displayDays.map(day => ({
      day,
      minutes: totals[day],
    }));
  })();

  const achievements = [
    { 
      id: 'early-bird', 
      title: 'Early Bird', 
      icon: '🌅', 
      desc: 'Read a session before 8 AM',
      unlocked: stats.sessions.some(s => new Date(s.timestamp).getHours() < 8)
    },
    { 
      id: 'word-smith', 
      title: 'Word Smith', 
      icon: '✍️', 
      desc: 'Read over 5,000 words total',
      unlocked: stats.totalWords >= 5000
    },
    { 
      id: 'bengali-scholar', 
      title: 'Bengali Scholar', 
      icon: '🇧🇩', 
      desc: 'Complete a session in Bengali',
      unlocked: stats.sessions.some(s => s.language === 'bn')
    },
    { 
      id: 'focus-master', 
      title: 'Focus Master', 
      icon: '🎯', 
      desc: 'Maintain focus for 1 hour (Future)',
      unlocked: false 
    },
    { 
      id: 'streak-7', 
      title: '7-Day Streak', 
      icon: '🔥', 
      desc: 'Read for 7 consecutive days',
      unlocked: stats.streak >= 7
    },
    { 
      id: 'speed-reader', 
      title: 'Speed Reader', 
      icon: '⚡', 
      desc: 'Read at 300+ WPM (Future)',
      unlocked: false 
    },
  ];

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* header */}
      <div>
        <h2 className="text-3xl font-display font-bold dark:text-white">Your Progress</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Reading analytics and achievements</p>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Sessions', value: stats.sessions.length, icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Current Streak', value: `${stats.streak} Days`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
          { label: 'Total Words', value: stats.totalWords.toLocaleString(), icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Total Time', value: `${Math.round(stats.totalTime / 60)}m`, icon: Clock, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-black/5 dark:border-white/10 flex flex-col">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", stat.bg)}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className="text-2xl font-display font-bold dark:text-white">{stat.value}</p>
            <p className="text-xs font-bold uppercase opacity-50 dark:text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* weekly activity chart */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-black/5 dark:border-white/10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-display font-bold dark:text-white">Weekly Activity</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Minutes spent reading per day</p>
          </div>
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full text-xs font-bold">
            <TrendingUp size={14} />
            <span>+12% from last week</span>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weekData}>
              <defs>
                <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fontWeight: 600, fill: isDark ? '#94a3b8' : '#64748b' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fontWeight: 600, fill: isDark ? '#94a3b8' : '#64748b' }} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="minutes" 
                stroke="#1D4ED8" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorMin)"
                dot={{ fill: '#1D4ED8', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: '#1D4ED8', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* achievements */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-black/5 dark:border-white/10">
          <h3 className="text-xl font-display font-bold mb-6 dark:text-white">Achievements</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {achievements.map((ach) => (
              <div 
                key={ach.id} 
                className={cn(
                  "p-5 rounded-2xl border transition-all relative overflow-hidden",
                  ach.unlocked 
                    ? "bg-white dark:bg-slate-800 border-black/5 dark:border-white/10 shadow-sm" 
                    : "bg-slate-50 dark:bg-slate-900/50 border-transparent opacity-50"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{ach.unlocked ? ach.icon : '🔒'}</div>
                  {ach.unlocked && (
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </div>
                <h4 className="font-bold text-sm dark:text-white mb-1">{ach.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{ach.desc}</p>
                
                {!ach.unlocked && (
                  <div className="absolute top-2 right-2">
                    <Lock size={14} className="text-slate-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3.5 text-sm font-bold text-primary hover:bg-primary/5 dark:hover:bg-primary/10 rounded-2xl transition-all flex items-center justify-center gap-2">
            View All Achievements
            <ChevronRight size={16} />
          </button>
      </div>

      {/* ── Screening History ── */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-black/5 dark:border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-2xl flex items-center justify-center flex-shrink-0">
            <Brain size={20} />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold dark:text-white">Screening History</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">All past dyslexia screenings — Track A (games) and Track B (handwriting)</p>
          </div>
        </div>

        {(!stats.screeningHistory || stats.screeningHistory.length === 0) ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-600">
            <Brain size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium text-sm">No screenings completed yet.</p>
            <p className="text-xs mt-1">Complete a screening to see your results here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.screeningHistory.map((result) => (
              <div
                key={result.id}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                    result.track === 'A' ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                  )}>
                    {result.track === 'A' ? <Gamepad2 size={16} /> : <Brain size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold dark:text-white">
                      Track {result.track} — {result.track === 'A' ? 'Game Screening' : 'Handwriting Analysis'}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {new Date(result.timestamp).toLocaleDateString()} · {new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <div className="text-right">
                    {result.track === 'A' && result.probability !== undefined && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{result.probability}% probability</p>
                    )}
                    {result.track === 'B' && result.predictedClass && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{result.predictedClass} · {result.confidence}% confidence</p>
                    )}
                  </div>
                  <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold",
                    result.riskLevel === 'HIGH'   ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" :
                    result.riskLevel === 'MEDIUM' ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" :
                                                   "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                  )}>
                    {result.riskLevel === 'LOW' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                    {result.riskLevel}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

const Check = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
