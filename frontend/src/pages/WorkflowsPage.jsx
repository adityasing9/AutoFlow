import React, { useState, useEffect } from 'react';
import { Workflow as WorkflowIcon, CheckCircle2, Play, Eye, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { api } from '../api/client';

export default function WorkflowsPage({ onSelectWorkflow, onSimulate, onRefreshStats }) {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [executingId, setExecutingId] = useState(null);
  const [execResult, setExecResult] = useState(null);

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const data = await api.getWorkflows();
      setWorkflows(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const handleExecute = async (wf) => {
    setExecutingId(wf.id);
    setExecResult(null);
    try {
      const res = await api.runWorkflow(wf.id, {
        filename: "lecture_notes_dbms_unit1.pdf",
        subject: "DBMS",
        date: "20260928"
      });
      setExecResult(res);
      onRefreshStats();
    } catch (err) {
      alert(`Execution error: ${err.message}`);
    } finally {
      setExecutingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Automated Workflows</h1>
          <p className="text-xs text-slate-400">
            Review approved automations, inspect tool steps and post-execution verification checks.
          </p>
        </div>
      </div>

      {execResult && (
        <div className={`p-4 rounded-xl border text-xs ${
          execResult.status === 'SUCCESS'
            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
            : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Execution Result: {execResult.status}</span>
            </span>
            <span className="font-mono text-[11px]">{new Date(execResult.started_at).toLocaleTimeString()}</span>
          </div>
          <p className="text-slate-300">
            Executed {execResult.steps.length} controlled steps with {execResult.verifications.length} verified post-conditions on disk.
          </p>
        </div>
      )}

      {workflows.length === 0 ? (
        <div className="p-12 text-center bg-slate-800/30 border border-slate-700/80 rounded-2xl text-slate-400">
          <WorkflowIcon className="w-10 h-10 mx-auto text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">No workflows active</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Approve an AI suggestion to activate a workflow.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {workflows.map((wf) => {
            const isApproved = wf.status === 'APPROVED';
            return (
              <div
                key={wf.id}
                className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-5 hover:border-slate-600 transition-colors shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-white">{wf.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                        isApproved
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {wf.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{wf.description}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onSimulate(wf.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
                    >
                      Simulate
                    </button>
                    {isApproved && (
                      <button
                        onClick={() => handleExecute(wf)}
                        disabled={executingId === wf.id}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center space-x-1.5 disabled:opacity-50"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>{executingId === wf.id ? 'Running & Verifying...' : 'Execute Now'}</span>
                      </button>
                    )}
                    <button
                      onClick={() => onSelectWorkflow(wf.id)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-medium flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Details</span>
                    </button>
                  </div>
                </div>

                {/* Steps preview */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800">
                  {wf.actions.map((act, idx) => (
                    <div key={idx} className="p-2.5 rounded bg-slate-900 border border-slate-800/80 text-xs">
                      <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono mb-1">
                        <span>STEP {act.step_order}</span>
                        <span className="text-emerald-400">{act.risk_level}</span>
                      </div>
                      <span className="font-semibold text-slate-200 block">{act.tool_name}</span>
                      <span className="text-[11px] text-slate-400 line-clamp-1">{act.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
