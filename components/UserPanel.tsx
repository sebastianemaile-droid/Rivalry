
import React, { useState } from 'react';
import { UserData } from '../types.ts';

interface UserPanelProps {
  user: UserData;
  color: 'cyan' | 'red';
  onUpdateTask: (id: string) => void;
  onUpdateName: (name: string) => void;
  onUpdateTomorrow: (index: number, value: string) => void;
  onEndDay: () => void;
}

const UserPanel: React.FC<UserPanelProps> = ({ user, color, onUpdateTask, onUpdateName, onUpdateTomorrow, onEndDay }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const isRed = color === 'red';
  const accentColor = isRed ? 'text-red-500' : 'text-cyan-400';
  const accentBg = isRed ? 'bg-red-600' : 'bg-cyan-500';
  const accentBorder = isRed ? 'border-red-500/30' : 'border-cyan-500/30';
  
  const completedCount = user.tasksToday.filter(t => t.completed).length;
  const isAllDone = completedCount === 5;
  const sprintProgress = (user.streak / 30) * 100;
  const daysLeft = 30 - user.streak;

  return (
    <div className={`relative bg-slate-900 border-2 ${accentBorder} rounded-[2.5rem] p-8 shadow-2xl overflow-hidden group transition-all duration-500 ${isAllDone ? 'sprint-active' : ''}`}>
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] track-gradient"></div>
      
      <div className="relative z-10 mb-8">
        <div className="flex justify-between items-end mb-4">
          <div className="flex-1">
            {isEditingName ? (
              <input
                autoFocus
                className={`bg-slate-800 text-3xl font-bungee ${accentColor} border-none rounded-lg w-full focus:ring-0 px-2`}
                value={user.name}
                onChange={(e) => onUpdateName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
              />
            ) : (
              <div className="flex items-center gap-2 group/name cursor-pointer" onClick={() => setIsEditingName(true)}>
                <h2 className={`text-4xl font-bungee ${accentColor} tracking-tighter`}>{user.name}</h2>
                <svg className="w-4 h-4 text-slate-700 opacity-0 group-hover/name:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sprint Milestone</span>
              <span className={`text-sm font-bungee ${accentColor}`}>{user.streak} / 30</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Razor Distance</p>
            <p className="text-2xl font-bungee text-white">{daysLeft}d</p>
          </div>
        </div>
        
        <div className="relative h-4 bg-black/40 rounded-full border border-white/5 p-1 flex items-center">
          <div 
            className={`h-full rounded-full ${accentBg} transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(34,211,238,0.4)]`}
            style={{ width: `${Math.min(100, sprintProgress)}%` }}
          ></div>
          <div className="absolute right-2 top-0 bottom-0 flex items-center">
            <div className="h-6 w-1 bg-white/20 rounded-full"></div>
          </div>
          <div 
            className="absolute transition-all duration-1000 ease-out text-2xl" 
            style={{ left: `calc(${Math.min(100, sprintProgress)}% - 12px)` }}
          >
            {isRed ? '🐼' : '🦁'}
          </div>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Today's Loadout</h3>
             <span className={`text-xs font-bungee ${isAllDone ? 'text-green-400' : 'text-slate-700'}`}>{completedCount}/5</span>
          </div>
          <div className="space-y-3">
            {user.tasksToday.length === 0 ? (
               <div className="bg-black/20 border-2 border-dashed border-slate-800 rounded-3xl p-10 text-center">
                  <p className="text-xs text-slate-600 uppercase font-black">Ready for activation</p>
               </div>
            ) : (
              user.tasksToday.map((task) => (
                <button
                  key={task.id}
                  onClick={() => onUpdateTask(task.id)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4 group ${
                    task.completed 
                      ? 'bg-slate-800/20 border-slate-800/50 text-slate-600' 
                      : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${task.completed ? `${accentBg} border-transparent` : 'border-slate-600'}`}>
                    {task.completed && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className={`text-sm font-bold flex-1 ${task.completed ? 'line-through opacity-50' : ''}`}>
                    {task.text}
                  </span>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="bg-black/20 p-6 rounded-[2rem] border border-white/5">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Plan Tomorrow</h3>
          <div className="space-y-2">
            {user.tasksTomorrow.map((text, idx) => (
              <input
                key={idx}
                type="text"
                value={text}
                onChange={(e) => onUpdateTomorrow(idx, e.target.value)}
                placeholder={`Task ${idx + 1}`}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-600 transition-all placeholder:text-slate-800 text-white"
              />
            ))}
          </div>
          <button 
            onClick={onEndDay}
            className={`w-full mt-6 py-4 rounded-2xl font-bungee text-lg shadow-xl transition-all active:scale-95 ${accentBg} text-white`}
          >
            END DAY
          </button>
        </section>
      </div>
      
      <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
        <span>Best Streak: {user.bestStreak}d</span>
        <span>Status: {user.streak > 15 ? (isRed ? 'Alpha Panda' : 'King Lion') : 'Recruit'}</span>
      </div>
    </div>
  );
};

export default UserPanel;
