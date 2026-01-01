
import React from 'react';
import { HistoryEntry } from '../types';

interface HistorySectionProps {
  name: string;
  history: HistoryEntry[];
  color: 'cyan' | 'red';
}

const HistorySection: React.FC<HistorySectionProps> = ({ name, history, color }) => {
  const isRed = color === 'red';
  const accentBorder = isRed ? 'border-red-900/30' : 'border-cyan-900/30';
  const textAccent = isRed ? 'text-red-500' : 'text-cyan-500';

  if (history.length === 0) return null;

  return (
    <div className={`bg-slate-900/40 rounded-3xl border ${accentBorder} p-6 shadow-xl`}>
      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-6 flex items-center justify-between">
        <span className="flex items-center gap-2">
          {isRed ? <span>🐼</span> : <span>🐍</span>}
          {name}'s History Log
        </span>
        <span className="bg-slate-800 px-2 py-1 rounded text-[10px]">{history.length} Days tracked</span>
      </h3>
      
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {history.map((entry, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 transition-all hover:border-slate-700">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{entry.date}</p>
                <div className="flex items-center gap-2 mt-1">
                   <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${entry.success ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                      {entry.success ? 'Success' : 'Failed'}
                   </span>
                   <span className="text-[10px] text-slate-400 font-bold">Streak: {entry.streak}</span>
                </div>
              </div>
              <div className="flex -space-x-1">
                {entry.tasks.map((t, i) => (
                  <div 
                    key={i} 
                    title={t.text}
                    className={`w-3 h-3 rounded-full border border-slate-950 ${t.completed ? 'bg-green-500' : 'bg-slate-700'}`}
                  ></div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-1 border-t border-slate-800 pt-3">
              {entry.tasks.map((task, tidx) => (
                <div key={tidx} className="flex items-center gap-2 text-[11px]">
                  <span className={task.completed ? 'text-green-500/70' : 'text-red-500/50'}>
                    {task.completed ? '✓' : '✕'}
                  </span>
                  <span className={`truncate ${task.completed ? 'text-slate-400' : 'text-slate-600 line-through decoration-slate-700'}`}>
                    {task.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #020617;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #1e293b;
        }
      `}</style>
    </div>
  );
};

export default HistorySection;
