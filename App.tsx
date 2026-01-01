
import React, { useState, useEffect, useCallback } from 'react';
import { UserData, RivalryState, UserRole, HistoryEntry } from './types.ts';
import { getRivalryCommentary } from './services/aiAssistant.ts';
import UserPanel from './components/UserPanel.tsx';
import HistorySection from './components/HistorySection.tsx';

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
    const saved = localStorage.getItem('power_list_rivalry_sprint');
    if (saved) return JSON.parse(saved);
    return {
      Sebastian: INITIAL_USER_DATA('Sebastian'),
      Cole: INITIAL_USER_DATA('Cole')
    };
  });

  const [aiCommentary, setAiCommentary] = useState<string>("Referee is inspecting the track...");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    localStorage.setItem('power_list_rivalry_sprint', JSON.stringify(state));
  }, [state]);

  const updateAiCommentary = useCallback(async () => {
    setIsRefreshing(true);
    const comment = await getRivalryCommentary(state);
    setAiCommentary(comment);
    setIsRefreshing(false);
  }, [state]);

  useEffect(() => {
    updateAiCommentary();
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
    setState(prev => {
      const userData = { ...prev[user] };
      const allDone = userData.tasksToday.length === 5 && userData.tasksToday.every(t => t.completed);
      const readyForTomorrow = userData.tasksTomorrow.every(t => t.trim().length > 0);

      if (!readyForTomorrow) {
        alert(`${user}, you must plan your 5 tasks for tomorrow before ending today!`);
        return prev;
      }

      const todayStr = new Date().toDateString();
      if (userData.lastCompletedDate === todayStr) {
        alert("Already submitted for today. Rest up.");
        return prev;
      }

      // Gamify Streak
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
        <div className="inline-block bg-yellow-500 text-black font-bungee px-4 py-1 rounded-sm mb-4 transform -rotate-1 skew-x-12">
          NEW YEAR HABIT TRACKER
        </div>
        <h1 className="text-5xl md:text-8xl font-bungee text-white mb-2 tracking-tight">
          30 DAY <span className="text-red-600">SPRINT</span>
        </h1>
        
        <div className="flex justify-center items-center gap-8 mb-10 mt-6">
          <div className="text-center">
            <span className="text-4xl">🦁</span>
            <p className="text-[10px] font-black text-cyan-500 tracking-widest mt-1 uppercase">Sebastian</p>
          </div>
          <div className="text-2xl font-bungee text-slate-700 italic">VS</div>
          <div className="text-center">
            <span className="text-4xl">🐼</span>
            <p className="text-[10px] font-black text-red-500 tracking-widest mt-1 uppercase">Cole</p>
          </div>
        </div>

        <div className="bg-slate-900/80 border-2 border-slate-800 rounded-3xl p-6 max-w-3xl mx-auto shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-md relative">
          <div className="flex items-start gap-4 text-left">
            <div className="bg-slate-800 p-3 rounded-2xl">
              <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Race Commentary</p>
              <p className="text-xl font-medium text-slate-100 leading-tight">
                "{aiCommentary}"
              </p>
            </div>
            <button 
              onClick={updateAiCommentary}
              disabled={isRefreshing}
              className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all disabled:opacity-30"
            >
              <svg className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          
          {leadDiff > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500">
              Current Leader: <span className={sebLead ? 'text-cyan-400' : 'text-red-400'}>{sebLead ? 'Sebastian' : 'Cole'}</span> by {leadDiff} days
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        <UserPanel 
          user={state.Sebastian} 
          color="cyan" 
          onUpdateTask={(id) => handleUpdateTask('Sebastian', id)}
          onUpdateTomorrow={(idx, val) => handleUpdateTomorrow('Sebastian', idx, val)}
          onEndDay={() => handleEndDay('Sebastian')}
        />
        <UserPanel 
          user={state.Cole} 
          color="red" 
          onUpdateTask={(id) => handleUpdateTask('Cole', id)}
          onUpdateTomorrow={(idx, val) => handleUpdateTomorrow('Cole', idx, val)}
          onEndDay={() => handleEndDay('Cole')}
        />
      </main>

      <div className="max-w-7xl mx-auto mt-20 grid grid-cols-1 lg:grid-cols-2 gap-10 opacity-80 hover:opacity-100 transition-opacity">
        <HistorySection name="Sebastian" history={state.Sebastian.history} color="cyan" />
        <HistorySection name="Cole" history={state.Cole.history} color="red" />
      </div>

      <footer className="mt-20 py-10 border-t border-slate-900 text-center">
        <button 
          onClick={() => {
            if(confirm("Factory Reset? All streaks and history will be nuked.")) {
              localStorage.removeItem('power_list_rivalry_sprint');
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
