import React from 'react';
import {
  LayoutDashboard,
  Activity,
  GitBranch,
  Sparkles,
  Workflow,
  Lock,
  History,
  ShieldCheck,
  Settings
} from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage, suggestionsCount = 0 }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'activity', label: 'Activity Log', icon: Activity },
    { id: 'patterns', label: 'Detected Patterns', icon: GitBranch },
    { id: 'suggestions', label: 'AI Suggestions', icon: Sparkles, badge: suggestionsCount },
    { id: 'workflows', label: 'Workflows', icon: Workflow },
    { id: 'permissions', label: 'Permissions & Risk', icon: Lock },
    { id: 'history', label: 'Automation History', icon: History },
    { id: 'privacy', label: 'Privacy Dashboard', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-semibold border border-emerald-500/30">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-400">
        <div className="font-semibold text-slate-300 mb-1 flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Core Principle</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400">
          "The AI proposes. The permission engine decides. The executor acts. The verifier confirms."
        </p>
      </div>
    </aside>
  );
}
