
import React, { useState, useEffect, useCallback } from 'react';
import { UserData, RivalryState, Task, UserRole, HistoryEntry } from './types';
import { getRivalryCommentary } from './services/aiAssistant';
import UserPanel from './components/UserPanel';
import HistorySection from './components/HistorySection';

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
    const saved = localStorage.getItem('power_list_rivalry');
    if (saved) return JSON.parse(saved);
    return {
      Sebastian: INITIAL_USER_DATA('Sebastian'),
      Cole: INITIAL_USER_DATA('Cole')
    };
  });

  const [aiCommentary, setAiCommentary] = useState<string>("Loading the referee's opinion...");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('power_list_rivalry', JSON.stringify(state));
  }, [state]);

  const updateAiCommentary = useCallback(async () => {
    setIsRefreshing(true);
    const comment = await getRivalryCommentary(state);
    setAiCommentary(comment);
    setIsRefreshing(false);
  }, [state]);

  useEffect(() => {
    updateAiCommentary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateTask = (user: UserRole, taskId: string) => {
    setState(prev => {
      const userData = { ...prev[user] };
      const oldCompletedCount = userData.tasksToday.filter(t => t.completed).length;
      
      userData.tasksToday = userData.tasksToday.map(t => 
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );

      const newCompletedCount = userData.tasksToday.filter(t => t.completed).length;

      // Real-time gamification: Increment streak immediately when 5th task is checked
      if (oldCompletedCount === 4 && newCompletedCount === 5) {
        userData.streak += 1;
        if (userData.streak > userData.bestStreak) userData.bestStreak = userData.streak;
      } 
      // Decrement if they uncheck one after hitting 5
      else if (oldCompletedCount === 5 && newCompletedCount === 4) {
        userData.streak = Math.max(0, userData.streak - 1);
      }

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
        alert("You've already finalized today. Go enjoy your victory!");
        return prev;
      }

      // If they didn't finish today (less than 5), their streak was not incremented in handleUpdateTask,
      // but it might have been > 0 from previous days. Now we hard-reset it to zero as they failed the day.
      if (!allDone) {
        userData.streak = 0;
      }

      // Store in history
      const historyEntry: HistoryEntry = {
        date: todayStr,
        tasks: [...userData.tasksToday],
        success: allDone,
        streak: userData.streak
      };
      userData.history = [historyEntry, ...userData.history];

      // Rotate tasks
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

  const resetAll = () => {
    if (confirm("🚨 WARNING: This will permanently purge ALL streaks, history, and task lists. Are you sure?")) {
      const freshState = {
        Sebastian: INITIAL_USER_DATA('Sebastian'),
        Cole: INITIAL_USER_DATA('Cole')
      };
      setState(freshState);
      localStorage.setItem('power_list_rivalry', JSON.stringify(freshState));
      // Forced reload to ensure clean slate
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen pb-20 p-4 md:p-8 bg-slate-950">
      <header className="max-w-6xl mx-auto text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-bungee text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-red-500 mb-2">
          POWER LIST RIVALRY
        </h1>
        <p className="text-slate-400 text-lg uppercase tracking-widest font-bold opacity-70">Sebastian vs. Cole</p>
        
        {/* The Stakes Banner */}
        <div className="mt-6 mb-8 transform -rotate-1">
          <div className="bg-red-600 text-white font-bungee p-3 rounded-lg shadow-[0_0_30px_rgba(220,38,38,0.3)] inline-block border-2 border-dashed border-white/50 animate-pulse">
            <span className="text-sm md:text-base tracking-wider uppercase">
              🚨 The Stakes: First one to 30 days. Loser get's a buzz cut. No wavering. 🚨
            </span>
          </div>
        </div>

        <div className="mt-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl mx-auto shadow-2xl relative overflow-hidden group hover:border-slate-600 transition-colors">
          <div className="absolute top-0 left-0 w-2 h-full bg-cyan-500"></div>
          <div className="flex items-center justify-between">
             <div className="flex-1 text-left">
                <span className="text-[10px] uppercase tracking-[0.3em] text-cyan-400 font-black">Referee Intelligence</span>
                <p className="text-lg md:text-xl italic text-slate-100 mt-1 leading-relaxed">
                  "{aiCommentary}"
                </p>
             </div>
             <button 
                onClick={updateAiCommentary}
                disabled={isRefreshing}
                className="ml-4 p-3 rounded-full bg-slate-800 hover:bg-slate-700 transition-all disabled:opacity-50 border border-slate-700"
             >
                <svg className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <HistorySection name="Sebastian" history={state.Sebastian.history} color="cyan" />
           <HistorySection name="Cole" history={state.Cole.history} color="red" />
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 flex justify-center z-50">
        <button 
          onClick={resetAll}
          className="px-6 py-2 rounded-full border border-red-900/30 text-[10px] text-slate-500 hover:text-white hover:bg-red-600 hover:border-red-600 uppercase tracking-[0.2em] font-black transition-all"
        >
          Factory Reset Data
        </button>
      </footer>
    </div>
  );
};

export default App;
