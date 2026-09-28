import React, { useState, useEffect } from 'react';
import { History, CheckCircle2, XCircle, ChevronDown, ChevronRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '../api/client';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await api.getExecutionHistory();
        setHistory(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white tracking-wide">Automation Audit History</h1>
        <p className="text-xs text-slate-400">
          Every automated execution is recorded with full step parameters and physical verification post-conditions.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="p-12 text-center bg-slate-800/30 border border-slate-700/80 rounded-2xl text-slate-400">
          <History className="w-10 h-10 mx-auto text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">No execution history recorded yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Execute an approved workflow to view execution audit traces.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((exc) => {
            const isSuccess = exc.status === 'SUCCESS';
            const isExpanded = expandedId === exc.id;

            return (
              <div
                key={exc.id}
                className="bg-slate-800/40 border border-slate-700/80 rounded-xl overflow-hidden shadow-sm"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : exc.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {isSuccess ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm text-white">Execution #{exc.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                          isSuccess
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}>
                          {exc.status}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        Started: {new Date(exc.started_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-slate-400">
                    <span>{exc.steps.length} steps executed</span>
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-4 text-xs">
                    {exc.error_message && (
                      <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-lg text-rose-300 flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>Failure Reason: {exc.error_message}</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase">Step Verification Audit:</span>
                      {exc.steps.map((st) => (
                        <div key={st.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1.5 font-mono">
                          <div className="flex items-center justify-between">
                            <span className="text-emerald-400 font-bold">Step {st.step_order}: {st.tool_name}</span>
                            <span className="text-slate-400 text-[10px]">{st.status}</span>
                          </div>
                          <div className="text-slate-300 text-[11px]">Inputs: {JSON.stringify(st.input_data)}</div>
                          <div className="text-slate-400 text-[11px]">Outputs: {JSON.stringify(st.output_data)}</div>
                        </div>
                      ))}
                    </div>

                    {exc.verifications.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-mono font-semibold text-blue-400 uppercase">Verifier Affirmations:</span>
                        {exc.verifications.map((v) => (
                          <div key={v.id} className="p-2.5 rounded bg-blue-950/20 border border-blue-500/20 text-[11px] text-blue-300 flex items-center space-x-2">
                            <ShieldCheck className="w-4 h-4 flex-shrink-0 text-blue-400" />
                            <span>[{v.verification_type}] {v.details?.message || v.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
