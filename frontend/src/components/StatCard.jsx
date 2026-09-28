import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'emerald' }) {
  const colorMap = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    red: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    slate: 'text-slate-400 bg-slate-800 border-slate-700',
  };

  return (
    <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-5 shadow-sm hover:border-slate-600 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-lg border ${colorMap[color] || colorMap.emerald}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline space-x-2">
        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
}
