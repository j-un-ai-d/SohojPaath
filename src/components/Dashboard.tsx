import React, { useState } from 'react';
import { 
  Flame, 
  Clock, 
  BookOpen, 
  Trophy,
  Pin,
  PinOff,
} from 'lucide-react';
import { UserStats } from '../types';
import { cn } from '../lib/utils';

interface DashboardProps {
  stats: UserStats;
  currentUser?: { name: string };
  onStartReading: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, currentUser, onStartReading }) => {
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('sp_pinned') || '[]'); }
    catch { return []; }
  });

  const togglePin = (id: string) => {
    setPinnedIds(prev => {
      const next = prev.includes(id) ? prev.filter(p => p !== id) : [id, ...prev];
      localStorage.setItem('sp_pinned', JSON.stringify(next));
      return next;
    });
  };

  const pinnedSessions = stats.sessions.filter(s => pinnedIds.includes(s.id));
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayMinutes = stats.sessions
    .filter(s => new Date(s.timestamp).toISOString().slice(0, 10) === todayStr)
    .reduce((acc, s) => acc + Math.round(s.duration / 60), 0);
  const goalMinutes = 20;
  const goalPercent = Math.min(100, Math.round((todayMinutes / goalMinutes) * 100));

  return (
    <div className="space-y-8">
      {/* greeting banner */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold dark:text-white">{greeting}, {currentUser?.name ?? 'Reader'}!</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{today}</p>
        </div>
      </div>

      {/* start reading CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-8 rounded-3xl text-white flex items-center justify-between gap-6 shadow-xl shadow-blue-600/20">
        <div>
          <h3 className="text-2xl font-display font-bold mb-2">Ready to read today?</h3>
          <p className="text-white/70 text-sm max-w-sm">Pick up where you left off or start something new. Every session builds your streak.</p>
        </div>
        <button
          onClick={onStartReading}
          className="flex-shrink-0 bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg text-sm whitespace-nowrap"
        >
          Start Reading
        </button>
      </div>

      {/* today's goal */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-black/5 dark:border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-lg dark:text-white">Today's Goal</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{todayMinutes} / {goalMinutes} minutes read today</p>
          </div>
          <span className="text-2xl font-display font-bold text-blue-600">{goalPercent}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-700"
            style={{ width: `${goalPercent}%` }}
          />
        </div>
        {goalPercent >= 100 && (
          <p className="text-xs font-bold text-emerald-500 mt-3">Goal reached! Keep going!</p>
        )}
      </div>



      {/* pinned sessions */}
      {pinnedSessions.length > 0 && (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-black/5 dark:border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <Pin size={18} className="text-primary" />
            <h3 className="text-xl font-display font-bold dark:text-white">Pinned Sessions</h3>
          </div>
          <div className="space-y-3">
            {pinnedSessions.map(session => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
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
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <div className="text-right">
                    <p className="text-sm font-bold dark:text-white">{session.wordsRead} words</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{Math.round(session.duration / 60)}m {session.duration % 60}s</p>
                  </div>
                  <button onClick={() => togglePin(session.id)} className="p-2 rounded-xl text-primary hover:bg-primary/10 transition-colors" title="Unpin">
                    <PinOff size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* recent sessions */}
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
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <div className="text-right">
                    <p className="text-sm font-bold dark:text-white">{session.wordsRead} words</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{Math.round(session.duration / 60)}m {session.duration % 60}s</p>
                  </div>
                  <button onClick={() => togglePin(session.id)} className="p-2 rounded-xl hover:bg-primary/10 transition-colors" title={pinnedIds.includes(session.id) ? 'Unpin' : 'Pin'}>
                    {pinnedIds.includes(session.id) ? <PinOff size={15} className="text-primary"/> : <Pin size={15} className="text-slate-400 hover:text-primary"/>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
