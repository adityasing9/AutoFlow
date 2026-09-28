import React from 'react';
import { Shield, ShieldCheck, Activity, Cpu, WifiOff } from 'lucide-react';

export default function Navbar({ monitoringActive, onToggleMonitoring, localAiStatus }) {
  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-lg text-white tracking-wide">AutoFlow</span>
          <span className="text-xs text-slate-400 block -mt-1 font-mono">Academic Privacy-First AI Automation</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Offline Badge */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
          <WifiOff className="w-3.5 h-3.5 text-amber-400" />
          <span>Local-First (Offline)</span>
        </div>

        {/* Local AI Runtime Badge */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
          <span>{localAiStatus || 'Local AI Engine'}</span>
        </div>

        {/* Monitoring Toggle */}
        <button
          onClick={onToggleMonitoring}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            monitoringActive
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700/60'
          }`}
        >
          <span className={`w-2.5 h-2.5 rounded-full ${monitoringActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
          <span>Monitoring: {monitoringActive ? 'ACTIVE' : 'INACTIVE'}</span>
        </button>
      </div>
    </header>
  );
}
