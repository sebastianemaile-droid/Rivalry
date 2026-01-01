
import React from 'react';
import { UserData, Task } from '../types';

interface UserPanelProps {
  user: UserData;
  color: 'cyan' | 'red';
  onUpdateTask: (id: string) => void;
  onUpdateTomorrow: (index: number, value: string) => void;
  onEndDay: () => void;
}

const UserPanel: React.FC<UserPanelProps> = ({ user, color, onUpdateTask, onUpdateTomorrow, onEndDay }) => {
  const isRed = color === 'red';
  const accentColor = isRed ? 'text-red-400' : 'text-cyan-400';
  const bgColor = isRed ? 'from-red-900/40' : 'from-cyan-900/40';
  const borderColor = isRed ? 'border-red-500/30' : 'border-cyan-500/30';
  const btnBg = isRed ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20' : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/20';

  const completedCount = user.tasksToday.filter(t => t.completed).length;
  const isComplete = completedCount === 5;
  const progressPercent = (completedCount / 5) * 100;
  
  // Stakes Calculation
  const daysToGo = Math.max(0, 30 - user.streak);
  const challengeProgress = (user.streak / 30) * 100;

  return (
    <div className={`bg-gradient-to-b ${bgColor} to-slate-900/90 border ${borderColor} rounded-[2rem] p-6 md:p-8 shadow-2xl relative transition-all duration-500 ${isComplete ? 'glow-active' : ''}`}>
      {/* Mascot Displays */}
      <div className={`absolute top-4 right-8 text-4xl select-none opacity-80 transition-all duration-500 ${user.streak > 5 ? 'scale-125 brightness-125' : ''}`}>
        {isRed ? (
          <span className="inline-block animate-bounce" title="Team Panda">🐼</span>
        ) : (
          <span className="inline-block animate-pulse" title="Team Mamba">🐍</span>
        )}
      </div>
      
      {/* Success Badge */}
      {isComplete && (
        <div className="absolute -top-4 -right-4 bg-green-500 text-white font-bungee px-4 py-2 rounded-full shadow-2xl animate-pop z-10 text-xs flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {isRed ? 'WINNING' : 'MAMBA!'}
        </div>
      )}

      {/* Header Stats */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className={`text-4xl font-bungee ${accentColor} tracking-tighter flex items-center gap-3`}>
            {user.name}
          </h2>
          <div className="flex gap-6 mt-3">
            <div className="relative group">
              <p className="text-[9px] uppercase text-slate-500 font-black tracking-widest mb-1">Current Streak</p>
              <p className={`text-4xl font-bungee transition-transform duration-300 ${isComplete ? 'scale-110' : ''}`}>
                {user.streak}
              </p>
            </div>
            <div className="border-l border-slate-800 pl-6">
              <p className="text-[9px] uppercase text-slate-500 font-black tracking-widest mb-1">Max Power</p>
              <p className="text-xl font-bungee text-slate-400">{user.bestStreak}</p>
            </div>
          </div>
        </div>
        <div className={`w-20 h-20 rounded-full border-4 ${borderColor} bg-slate-900/50 flex items-center justify-center flex-col shadow-inner shrink-0`}>
             <span className={`text-2xl font-bungee transition-all ${isComplete ? 'text-green-400' : ''}`}>{completedCount}</span>
             <span className="text-[9px] uppercase opacity-40 font-black tracking-widest">OF 5</span>
        </div>
      </div>

      {/* Challenge Goal Countdown */}
      <div className="mb-8 p-3 bg-black/30 rounded-2xl border border-white/5">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2 px-1">
          <span className="text-slate-400">Challenge Progress</span>
          <span className={accentColor}>{daysToGo} Days to Win</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${isRed ? 'bg-red-500' : 'bg-cyan-500'}`} 
            style={{ width: `${challengeProgress}%` }}
          />
        </div>
      </div>

      {/* Task Progress Bar */}
      <div className="w-full h-3 bg-slate-800 rounded-full mb-10 overflow-hidden p-[2px]">
        <div 
          className={`h-full rounded-full transition-all duration-700 ease-[cubic-bezier(0.34, 1.56, 0.64, 1)] ${isComplete ? 'bg-green-500' : btnBg}`} 
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Today's Tasks */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] uppercase tracking-widest text-slate-400 font-black flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isComplete ? 'bg-green-500' : btnBg}`}></span>
              Daily Grind
            </h3>
          </div>
          <div className="space-y-3">
            {user.tasksToday.length === 0 ? (
              <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl py-12 text-center">
                <p className="text-slate-600 italic text-sm">No tasks for today yet.</p>
              </div>
            ) : (
              user.tasksToday.map((task) => (
                <button
                  key={task.id}
                  onClick={() => onUpdateTask(task.id)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 group ${
                    task.completed 
                      ? 'bg-slate-800/20 border-slate-800/50 text-slate-600' 
                      : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${task.completed ? `${isComplete ? 'bg-green-500' : btnBg} border-transparent` : 'border-slate-600'}`}>
                    {task.completed && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`flex-1 font-bold text-sm leading-tight ${task.completed ? 'line-through opacity-50' : ''}`}>
                    {task.text}
                  </span>
                </button>
              ))
            )}
          </div>
        </section>

        {/* Plan Tomorrow */}
        <section className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800/50">
          <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-700"></span>
            Prepare Tomorrow
          </h3>
          <div className="space-y-2">
            {user.tasksTomorrow.map((text, idx) => (
              <input
                key={idx}
                type="text"
                value={text}
                onChange={(e) => onUpdateTomorrow(idx, e.target.value)}
                placeholder={`Goal #${idx + 1}...`}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-slate-600 transition-all placeholder:text-slate-800 font-medium"
              />
            ))}
          </div>
          
          <div className="mt-8">
             <button 
                onClick={onEndDay}
                className={`w-full py-4 rounded-2xl font-bungee text-lg shadow-2xl transform active:scale-95 transition-all flex items-center justify-center gap-3 ${btnBg} text-white`}
             >
                FINALIZE DAY
             </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserPanel;
