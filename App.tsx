
import React, { useState, useEffect } from 'react';
import { UserData, RivalryState, UserRole, HistoryEntry } from './types.ts';
import UserPanel from './components/UserPanel.tsx';
import HistorySection from './components/HistorySection.tsx';

const STORAGE_KEY = 'power_list_rivalry_sprint_v3';

const INITIAL_USER_DATA = (name: string): UserData => ({
  name,
  streak: 0,
  bestStreak: 0,
  tasksToday: [],
  tasksTomorrow: ['', '', '', '', ''],
  lastCompletedDate: null,
  history: []
});

const App: React.FC = () => {
  const [state, setState] = useState<RivalryState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load saved state:", e);
    }
    return {
      Sebastian: INITIAL_USER_DATA('Sebastian'),
      Cole: INITIAL_USER_DATA('Cole'),
      customMotto: "LOSER GETS A BUZZ CUT. NO EXCUSES."
    };
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Streak Audit
  useEffect(() => {
    setState(prev => {
      const auditUser = (user: UserData) => {
        if (!user.lastCompletedDate) return user;
        const lastDate = new Date(user.lastCompletedDate);
        const today = new Date();
        today.setHours(0,0,0,0);
        lastDate.setHours(0,0,0,0);
        const diffTime = Math.abs(today.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 1) return { ...user, streak: 0 };
        return user;
      };
      return {
        ...prev,
        Sebastian: auditUser(prev.Sebastian),
        Cole: auditUser(prev.Cole)
      };
    });
  }, []);

  const handleUpdateTask = (user: UserRole, taskId: string) => {
    setState(prev => {
      const userData = { ...prev[user] };
      userData.tasksToday = userData.tasksToday.map(t => 
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      return { ...prev, [user]: userData };
    });
  };

  const handleUpdateName = (user: UserRole, newName: string) => {
    setState(prev => ({
      ...prev,
      [user]: { ...prev[user], name: newName }
    }));
  };

  const handleUpdateTomorrow = (user: UserRole, index: number, value: string) => {
    setState(prev => {
      const userData = { ...prev[user] };
      const nextTasks = [...userData.tasksTomorrow];
      nextTasks[index] = value;
      userData.tasksTomorrow = nextTasks;
      return { ...prev, [user]: userData };
    });
  };

  const handleEndDay = (user: UserRole) => {
    const todayStr = new Date().toDateString();
    setState(prev => {
      const userData = { ...prev[user] };
      if (userData.lastCompletedDate === todayStr) {
        alert("Locked in. Rest up.");
        return prev;
      }
      const allDone = userData.tasksToday.length === 5 && userData.tasksToday.every(t => t.completed);
      const readyForTomorrow = userData.tasksTomorrow.every(t => t.trim().length > 0);
      if (!readyForTomorrow) {
        alert(`${user}, plan tomorrow's power list first!`);
        return prev;
      }
      if (allDone) {
        userData.streak += 1;
        if (userData.streak > userData.bestStreak) userData.bestStreak = userData.streak;
      } else {
        userData.streak = 0;
      }
      const historyEntry: HistoryEntry = {
        date: todayStr,
        tasks: [...userData.tasksToday],
        success: allDone,
        streak: userData.streak
      };
      userData.history = [historyEntry, ...userData.history];
      userData.tasksToday = userData.tasksTomorrow.map((t, idx) => ({
        id: `t-${Date.now()}-${idx}`,
        text: t,
        completed: false
      }));
      userData.tasksTomorrow = ['', '', '', '', ''];
      userData.lastCompletedDate = todayStr;
      return { ...prev, [user]: userData };
    });
  };

  const sebLead = state.Sebastian.streak > state.Cole.streak;
  const leadDiff = Math.abs(state.Sebastian.streak - state.Cole.streak);

  return (
    <div className="min-h-screen pb-24 p-4 md:p-10 bg-[#020617]">
      <header className="max-w-6xl mx-auto text-center mb-12">
        <div className="flex justify-center items-center gap-2 mb-4">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Habit Engine Active</span>
        </div>
        <div className="inline-block bg-yellow-500 text-black font-bungee px-4 py-1 rounded-sm mb-4 transform -rotate-1 skew-x-12">
          NEW YEAR HABIT TRACKER
        </div>
        <h1 className="text-5xl md:text-8xl font-bungee text-white mb-2 tracking-tight">
          30 DAY <span className="text-red-600">SPRINT</span>
        </h1>
        
        <div className="flex justify-center items-center gap-8 mb-10 mt-6">
          <div className="text-center group">
            <span className="text-4xl group-hover:scale-125 transition-transform inline-block">🦁</span>
            <p className="text-[10px] font-black text-cyan-500 tracking-widest mt-1 uppercase">{state.Sebastian.name}</p>
          </div>
          <div className="text-2xl font-bungee text-slate-700 italic">VS</div>
          <div className="text-center group">
            <span className="text-4xl group-hover:scale-125 transition-transform inline-block">🐼</span>
            <p className="text-[10px] font-black text-red-500 tracking-widest mt-1 uppercase">{state.Cole.name}</p>
          </div>
        </div>

        <div className="bg-slate-900/80 border-2 border-slate-800 rounded-3xl p-6 max-w-3xl mx-auto shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-md relative">
          <div className="flex items-start gap-4 text-left">
            <div className="bg-slate-800 p-3 rounded-2xl">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Custom Rivalry Motto</p>
              <input 
                value={state.customMotto}
                onChange={(e) => setState(prev => ({ ...prev, customMotto: e.target.value.toUpperCase() }))}
                placeholder="ENTER YOUR SPRINT MOTTO HERE..."
                className="w-full bg-transparent border-none text-xl font-medium text-slate-100 leading-tight focus:ring-0 placeholder:text-slate-700"
              />
            </div>
          </div>
          
          {leadDiff > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500">
              Leader: <span className={sebLead ? 'text-cyan-400' : 'text-red-400'}>{sebLead ? state.Sebastian.name : state.Cole.name}</span> by {leadDiff} days
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        <UserPanel 
          user={state.Sebastian} 
          color="cyan" 
          onUpdateTask={(id) => handleUpdateTask('Sebastian', id)}
          onUpdateName={(name) => handleUpdateName('Sebastian', name)}
          onUpdateTomorrow={(idx, val) => handleUpdateTomorrow('Sebastian', idx, val)}
          onEndDay={() => handleEndDay('Sebastian')}
        />
        <UserPanel 
          user={state.Cole} 
          color="red" 
          onUpdateTask={(id) => handleUpdateTask('Cole', id)}
          onUpdateName={(name) => handleUpdateName('Cole', name)}
          onUpdateTomorrow={(idx, val) => handleUpdateTomorrow('Cole', idx, val)}
          onEndDay={() => handleEndDay('Cole')}
        />
      </main>

      <div className="max-w-7xl mx-auto mt-20 grid grid-cols-1 lg:grid-cols-2 gap-10 opacity-80 hover:opacity-100 transition-opacity">
        <HistorySection name={state.Sebastian.name} history={state.Sebastian.history} color="cyan" />
        <HistorySection name={state.Cole.name} history={state.Cole.history} color="red" />
      </div>

      <footer className="mt-20 py-10 border-t border-slate-900 text-center">
        <button 
          onClick={() => {
            if(confirm("Factory Reset? All streaks and history will be nuked.")) {
              localStorage.removeItem(STORAGE_KEY);
              window.location.reload();
            }
          }}
          className="px-8 py-2 border border-slate-800 rounded-full text-[10px] font-black text-slate-700 hover:text-red-500 hover:border-red-900 transition-all uppercase tracking-widest"
        >
          Purge Competition Data
        </button>
      </footer>
    </div>
  );
};

export default App;
