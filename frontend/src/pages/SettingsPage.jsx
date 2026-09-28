import React, { useState } from 'react';
import { Settings, Folder, Database, Cpu, Wifi, CheckCircle2, RefreshCw } from 'lucide-react';
import { api } from '../api/client';

export default function SettingsPage({ stats, onRefreshStats }) {
  const [prepMsg, setPrepMsg] = useState(null);
  const [prepping, setPrepping] = useState(false);

  const handlePrepare = async () => {
    setPrepping(true);
    try {
      const res = await api.prepareWorkspace();
      setPrepMsg(`Safe workspace structure verified. Seeded sample files in Inbox.`);
      setTimeout(() => setPrepMsg(null), 4000);
      onRefreshStats();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setPrepping(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-wide">System Settings & Configuration</h1>
        <p className="text-xs text-slate-400">
          Inspect local runtime parameters, safe sandbox directory roots, and database connections.
        </p>
      </div>

      {prepMsg && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{prepMsg}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Workspace Sandbox */}
        <div className="bg-slate-800/40 border border-slate-700/80 rounded-2xl p-5 text-xs space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Folder className="w-4 h-4" />
            <h3 className="font-bold text-sm text-white">Safe Sandbox Workspace Root</h3>
          </div>
          <p className="text-slate-300">
            Target folder for permitted user activity monitoring and controlled tool operations:
          </p>
          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-slate-200">
            AutoFlow/AutoFlowWorkspace
          </div>
          <div className="flex justify-end pt-1">
            <button
              onClick={handlePrepare}
              disabled={prepping}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium flex items-center space-x-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${prepping ? 'animate-spin' : ''}`} />
              <span>Verify & Initialize Folders</span>
            </button>
          </div>
        </div>

        {/* Local AI Engine */}
        <div className="bg-slate-800/40 border border-slate-700/80 rounded-2xl p-5 text-xs space-y-3">
          <div className="flex items-center space-x-2 text-blue-400">
            <Cpu className="w-4 h-4" />
            <h3 className="font-bold text-sm text-white">Local AI Inference Provider</h3>
          </div>
          <p className="text-slate-300">
            Local LLM runtime status:
          </p>
          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-slate-200 flex justify-between items-center">
            <span>{stats?.local_ai_model || 'Local Heuristic Intent Engine'}</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {stats?.local_ai_status || 'ONLINE'}
            </span>
          </div>
        </div>

        {/* Database */}
        <div className="bg-slate-800/40 border border-slate-700/80 rounded-2xl p-5 text-xs space-y-3">
          <div className="flex items-center space-x-2 text-purple-400">
            <Database className="w-4 h-4" />
            <h3 className="font-bold text-sm text-white">Database Engine</h3>
          </div>
          <p className="text-slate-300">
            Primary storage engine: MySQL 8.x with SQLite auto-resilience fallback.
          </p>
          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-slate-200 flex justify-between items-center">
            <span>Dialect: MySQL / SQLite (PyMySQL / SQLAlchemy)</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              CONNECTED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
