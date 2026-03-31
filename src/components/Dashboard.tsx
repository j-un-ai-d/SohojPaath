import React from 'react';
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import { 
  Flame, 
  Clock, 
  BookOpen, 
  Trophy,
  TrendingUp,
} from 'lucide-react';
import { UserStats } from '../types';
import { cn } from '../lib/utils';

const mockData = [
  { day: 'Mon', minutes: 12 },
  { day: 'Tue', minutes: 25 },
  { day: 'Wed', minutes: 18 },
  { day: 'Thu', minutes: 35 },
  { day: 'Fri', minutes: 22 },
  { day: 'Sat', minutes: 45 },
  { day: 'Sun', minutes: 30 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-black/5 dark:border-white/10 rounded-2xl px-4 py-3 shadow-xl">
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <p className="text-base font-bold text-primary">{payload[0].value} min</p>
    </div>
  );
};

export const Dashboard: React.FC<{ stats: UserStats }> = ({ stats }) => {
  
  const isDark = typeof window !== 'undefined'
    && document.documentElement.classList.contains('dark');
  const gridColor = isDark ? '#1e293b' : '#f1f5f9';

  const chartData = mockData;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-black/5 dark:border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Flame size={24} />
          </div>
          <div>
            <p className="text-2xl font-display font-bold dark:text-white">{stats.streak}</p>
            <p className="text-xs font-bold uppercase opacity-50 dark:text-slate-400">Day Streak</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-black/5 dark:border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-2xl font-display font-bold dark:text-white">{Math.round(stats.totalTime / 60)}m</p>
            <p className="text-xs font-bold uppercase opacity-50 dark:text-slate-400">Total Time</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-black/5 dark:border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 rounded-2xl flex items-center justify-center flex-shrink-0">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-2xl font-display font-bold dark:text-white">{stats.totalWords.toLocaleString()}</p>
            <p className="text-xs font-bold uppercase opacity-50 dark:text-slate-400">Words Read</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-black/5 dark:border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-2xl font-display font-bold dark:text-white">Level {Math.max(1, Math.floor(stats.sessions.length / 5))}</p>
            <p className="text-xs font-bold uppercase opacity-50 dark:text-slate-400">Reading Rank</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-display font-bold dark:text-white">Reading Activity</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Minutes spent reading this week</p>
            </div>
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full text-xs font-bold">
              <TrendingUp size={14} />
              <span>+12% from last week</span>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1D4ED8" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: isDark ? '#94a3b8' : '#64748b' }} 
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
                  activeDot={{ r: 6, fill: '#1D4ED8' }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-black/5 dark:border-white/10">
          <h3 className="text-xl font-display font-bold mb-6 dark:text-white">Achievements</h3>
          <div className="space-y-3">
            {[
              { 
                title: 'Early Bird', 
                desc: 'Read 3 days before 8 AM', 
                icon: '🌅', 
                bg: 'bg-orange-50 dark:bg-orange-900/20',
                textColor: 'text-orange-800 dark:text-orange-400',
                unlocked: true,
              },
              { 
                title: 'Word Smith', 
                desc: 'Read 5,000 words total', 
                icon: '✍️', 
                bg: 'bg-blue-50 dark:bg-blue-900/20',
                textColor: 'text-blue-800 dark:text-blue-400',
                unlocked: true,
              },
              { 
                title: 'Bengali Scholar', 
                desc: 'First Bengali session', 
                icon: '🇧🇩', 
                bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                textColor: 'text-emerald-800 dark:text-emerald-400',
                unlocked: true,
              },
              { 
                title: 'Focus Master', 
                desc: 'Used line focus for 1hr', 
                icon: '🎯', 
                bg: 'bg-purple-50 dark:bg-purple-900/20',
                textColor: 'text-purple-800 dark:text-purple-400',
                unlocked: false,
              },
            ].map((ach, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-2xl transition-colors",
                  ach.unlocked ? "hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer" : "opacity-50 cursor-default"
                )}
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0", ach.bg, ach.textColor)}>
                  {ach.unlocked ? ach.icon : '🔒'}
                </div>
                <div>
                  <p className="text-sm font-bold dark:text-white">{ach.title}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{ach.desc}</p>
                </div>
                {ach.unlocked && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[10px] font-bold">✓</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 text-sm font-bold text-primary hover:bg-primary/5 dark:hover:bg-primary/10 rounded-xl transition-colors">
            View All Badges →
          </button>
        </div>
      </div>

      {stats.sessions.length > 0 && (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-black/5 dark:border-white/10">
          <h3 className="text-xl font-display font-bold mb-6 dark:text-white">Recent Sessions</h3>
          <div className="space-y-3">
            {stats.sessions.slice(0, 5).map((session, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold dark:text-white truncate max-w-[200px]">{session.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {new Date(session.timestamp).toLocaleDateString()} · {session.language === 'bn' ? 'Bengali' : 'English'}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-sm font-bold dark:text-white">{session.wordsRead} words</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{Math.round(session.duration / 60)}m {session.duration % 60}s</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
