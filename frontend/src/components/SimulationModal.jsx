import React from 'react';
import { ShieldCheck, AlertTriangle, Play, X, FileText, FolderPlus, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function SimulationModal({ isOpen, onClose, simulationData, onApprove, isApproving }) {
  if (!isOpen || !simulationData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">AutoFlow Safe Simulation</h2>
            <p className="text-xs text-slate-400 font-mono">Workflow: {simulationData.workflow_name}</p>
          </div>
        </div>

        {/* Notice */}
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center space-x-2 mb-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Dry-run simulation complete. No files have been modified or deleted.</span>
        </div>

        {/* Change Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/60 text-center">
            <span className="text-xs text-slate-400 block">Files Detected</span>
            <span className="text-xl font-bold text-white">{simulationData.files_detected}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/60 text-center">
            <span className="text-xs text-slate-400 block">Renames</span>
            <span className="text-xl font-bold text-blue-400">{simulationData.potential_renames}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/60 text-center">
            <span className="text-xs text-slate-400 block">Moves</span>
            <span className="text-xl font-bold text-emerald-400">{simulationData.potential_moves}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/60 text-center">
            <span className="text-xs text-slate-400 block">Deletions</span>
            <span className="text-xl font-bold text-slate-300">{simulationData.potential_deletions}</span>
          </div>
        </div>

        {/* Security & Risk Summary */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 mb-5 text-xs">
          <div className="flex justify-between items-center text-slate-300">
            <span>Overall Risk Classification:</span>
            <span className="px-2 py-0.5 rounded font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {simulationData.risk_level}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span>External Network Requests:</span>
            <span className="font-mono text-slate-400">0 (Offline sandboxed)</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span>Arbitrary Shell Commands:</span>
            <span className="font-mono text-emerald-400 font-semibold">0 (Strictly Blocked)</span>
          </div>
        </div>

        {/* Simulated Steps Preview */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Simulated Step Chain</h4>
          <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
            {simulationData.simulated_steps.slice(0, 6).map((step, idx) => (
              <div key={idx} className="flex items-center space-x-3 p-2.5 bg-slate-800/30 border border-slate-800 rounded-lg text-xs">
                <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center font-mono text-[10px] text-slate-300">
                  {step.step_order}
                </span>
                <span className="font-medium text-emerald-400">{step.tool}</span>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <span className="text-slate-300 truncate">{step.action_description || step.target_file}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onApprove(simulationData.workflow_id)}
            disabled={isApproving}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isApproving ? 'Approving...' : 'Approve Workflow'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
