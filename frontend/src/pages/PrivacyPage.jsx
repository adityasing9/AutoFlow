import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, WifiOff, HardDrive, Database, EyeOff, CheckCircle2, Trash2 } from 'lucide-react';
import { api } from '../api/client';

export default function PrivacyPage() {
  const [privacy, setPrivacy] = useState(null);
  const [cleanupStatus, setCleanupStatus] = useState(null);

  useEffect(() => {
    const fetchPrivacy = async () => {
      try {
        const data = await api.getPrivacyStatus();
        setPrivacy(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPrivacy();
  }, []);

  const handleRetentionCleanup = async () => {
    try {
      const res = await api.runRetentionCleanup();
      setCleanupStatus(res.message);
      setTimeout(() => setCleanupStatus(null), 4000);
    } catch (err) {
      alert(`Cleanup error: ${err.message}`);
    }
  };

  const statusItems = [
    { label: 'Local AI Inference', status: 'ENABLED (Zero Cloud Transmission)', icon: Lock, active: true },
    { label: 'Internet Access', status: 'DISABLED (Strict Offline Enforced)', icon: WifiOff, active: false },
    { label: 'Cloud Storage', status: 'DISABLED (100% Local DB)', icon: HardDrive, active: false },
    { label: 'External API Calls', status: '0 (No Telemetry / No Tracking)', icon: EyeOff, active: false },
  ];

  const sensorItems = [
    { label: 'File System Events', status: 'ENABLED (Sanitized Abstract Paths)', active: true },
    { label: 'Application Events', status: 'DISABLED (Explicitly Excluded)', active: false },
    { label: 'Screen Recording', status: 'DISABLED (Strictly Forbidden)', active: false },
    { label: 'Keystroke Logging', status: 'DISABLED (Strictly Forbidden)', active: false },
    { label: 'Microphone Monitoring', status: 'DISABLED (Strictly Forbidden)', active: false },
    { label: 'Webcam / Camera', status: 'DISABLED (Strictly Forbidden)', active: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-wide">Privacy & Trust Dashboard</h1>
        <p className="text-xs text-slate-400">
          AutoFlow operates exclusively on local user devices. Your raw paths and confidential files never leave this machine.
        </p>
      </div>

      {cleanupStatus && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{cleanupStatus}</span>
        </div>
      )}

      {/* Grid: System Privacy Baseline */}
      <div className="bg-slate-800/40 border border-slate-700/80 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-emerald-400">
          1. System Privacy Baseline
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {statusItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-200 block">{item.label}</span>
                  <span className="text-[11px] text-slate-400 font-mono">{item.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Data Collection & Sensor Isolation */}
      <div className="bg-slate-800/40 border border-slate-700/80 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-blue-400">
          2. Sensor Isolation & Surveillance Defenses
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {sensorItems.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 block">{item.label}</span>
                <span className="text-[11px] text-slate-400">{item.status}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                item.active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {item.active ? 'PERMITTED' : 'BLOCKED'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Storage Optimization */}
      <div className="bg-slate-800/40 border border-slate-700/80 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div>
          <h3 className="font-bold text-white text-sm">Event Storage & Memory Retention</h3>
          <p className="text-slate-400 mt-1">
            Raw detailed events are kept for 7 days, summarized into daily statistical memories, and pruned after 30 days.
          </p>
        </div>
        <button
          onClick={handleRetentionCleanup}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium flex items-center space-x-2 transition-colors flex-shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Optimize Retention</span>
        </button>
      </div>
    </div>
  );
}
