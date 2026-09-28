import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, XCircle, Play, Eye, ShieldAlert, Cpu, ArrowRight } from 'lucide-react';
import { api } from '../api/client';

export default function SuggestionsPage({ onSimulate, onRefreshStats }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState(null);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const data = await api.getSuggestions();
      setSuggestions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  const handleApprove = async (workflowId) => {
    if (!workflowId) return;
    try {
      await api.approveWorkflow(workflowId);
      setActionStatus(`Workflow #${workflowId} successfully APPROVED!`);
      loadSuggestions();
      onRefreshStats();
    } catch (err) {
      alert(`Approval error: ${err.message}`);
    }
  };

  const handleIgnore = async (workflowId) => {
    if (!workflowId) return;
    try {
      await api.ignoreWorkflow(workflowId);
      setActionStatus(`Suggestion ignored.`);
      loadSuggestions();
      onRefreshStats();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleTriggerGenerate = async (patternId) => {
    try {
      await api.generateSuggestion(patternId);
      loadSuggestions();
      onRefreshStats();
    } catch (err) {
      alert(`Generation error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white tracking-wide">AI Automation Suggestions</h1>
        <p className="text-xs text-slate-400">
          The local AI interprets detected repetitive patterns and proposes verified workflows for your review.
        </p>
      </div>

      {actionStatus && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{actionStatus}</span>
        </div>
      )}

      {suggestions.length === 0 ? (
        <div className="p-12 text-center bg-slate-800/30 border border-slate-700/80 rounded-2xl text-slate-400">
          <Sparkles className="w-10 h-10 mx-auto text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">No suggestions pending review</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Run the Academic Demo Scenario on the Dashboard to automatically generate workflow proposals.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {suggestions.map((sug) => (
            <div
              key={sug.pattern_id}
              className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-5 shadow-sm"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {sug.pattern_code}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Confidence: {(sug.confidence * 100).toFixed(0)}%
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      Risk: {sug.risk_level}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight">{sug.workflow_name}</h2>
                </div>

                <div className="flex items-center space-x-2">
                  {sug.workflow_id ? (
                    <>
                      <button
                        onClick={() => onSimulate(sug.workflow_id)}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-medium transition-colors flex items-center space-x-1.5"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Simulate</span>
                      </button>
                      <button
                        onClick={() => handleApprove(sug.workflow_id)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors flex items-center space-x-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleIgnore(sug.workflow_id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
                      >
                        <span>Ignore</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleTriggerGenerate(sug.pattern_id)}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center space-x-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Synthesize Proposal</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Rationale & Explanation (Requirement 24) */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-2.5">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
                  Why is AutoFlow suggesting this?
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {sug.description}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Observed Occurrences</span>
                    <span className="text-base font-bold text-white">{sug.occurrences} times</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Est. Manual Steps Saved</span>
                    <span className="text-base font-bold text-blue-400">~{sug.estimated_manual_actions_per_week} actions / week</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Automated Steps per Run</span>
                    <span className="text-base font-bold text-emerald-400">{sug.estimated_automated_actions_per_workflow} safe actions</span>
                  </div>
                </div>
              </div>

              {/* Sequence Flow */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                  Proposed Action Pipeline:
                </span>
                <div className="flex items-center flex-wrap gap-2">
                  {sug.sequence.map((step, idx) => (
                    <React.Fragment key={idx}>
                      <div className="px-3 py-1 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300">
                        {step.replace(':PDF', '')}
                      </div>
                      {idx < sug.sequence.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
