import React, { useState, useEffect } from 'react';
import { GitBranch, RefreshCw, ArrowRight, Eye, CheckCircle2, Shield, Network, X } from 'lucide-react';
import { api } from '../api/client';

export default function PatternsPage({ onNavigate }) {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeGraph, setActiveGraph] = useState(null);
  const [graphModalOpen, setGraphModalOpen] = useState(false);

  const loadPatterns = async () => {
    setLoading(true);
    try {
      const data = await api.getPatterns();
      setPatterns(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatterns();
  }, []);

  const handleDiscover = async () => {
    setLoading(true);
    try {
      await api.discoverPatterns();
      loadPatterns();
    } catch (err) {
      alert(`Discovery error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewGraph = async (patternId) => {
    try {
      const g = await api.getPatternGraph(patternId);
      setActiveGraph(g);
      setGraphModalOpen(true);
    } catch (err) {
      alert(`Could not load graph: ${err.message}`);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Discovered Workflow Patterns</h1>
          <p className="text-xs text-slate-400">
            Mined from event sequences using sliding-window contiguous subsequence detection and directed graph traversal.
          </p>
        </div>

        <button
          onClick={handleDiscover}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors flex items-center space-x-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Scan & Mine Patterns</span>
        </button>
      </div>

      {patterns.length === 0 ? (
        <div className="p-12 text-center bg-slate-800/30 border border-slate-700/80 rounded-2xl text-slate-400">
          <GitBranch className="w-10 h-10 mx-auto text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">No patterns discovered yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Click "Scan & Mine Patterns" or run the Academic Demo Scenario from the Dashboard.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {patterns.map((p) => {
            const riskColors = {
              LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
              MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
              HIGH: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            };

            return (
              <div
                key={p.id}
                className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-5 hover:border-slate-600 transition-colors shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 font-mono text-xs font-bold text-emerald-400">
                      {p.pattern_code}
                    </span>
                    <h3 className="text-sm font-semibold text-white">
                      {p.name || `Discovered Workflow (${p.sequence.length} steps)`}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${riskColors[p.risk_level] || riskColors.LOW}`}>
                      Risk: {p.risk_level}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      Confidence: {(p.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Sequence Step Pills */}
                <div className="flex items-center flex-wrap gap-2 py-3 px-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
                  {p.sequence.map((step, idx) => (
                    <React.Fragment key={idx}>
                      <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800/90 border border-slate-700 text-xs font-mono text-slate-200">
                        <span className="text-[10px] text-slate-400">{idx + 1}.</span>
                        <span>{step.replace(':PDF', '')}</span>
                      </div>
                      {idx < p.sequence.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Metadata & Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-5 text-slate-400">
                    <span>Occurrences: <b className="text-white">{p.occurrences}</b></span>
                    <span>Average Interval: <b className="text-white">{Math.round(p.avg_interval_seconds)}s</b></span>
                    <span>Status: <b className="text-emerald-400">{p.status}</b></span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewGraph(p.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium flex items-center space-x-1.5"
                    >
                      <Network className="w-3.5 h-3.5 text-blue-400" />
                      <span>Directed Graph</span>
                    </button>
                    <button
                      onClick={() => onNavigate('suggestions')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center space-x-1.5"
                    >
                      <span>Review AI Proposal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Directed Graph Modal */}
      {graphModalOpen && activeGraph && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setGraphModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2.5 mb-4">
              <Network className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-bold text-white">Directed Graph Representation (DSA Component)</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Weighted state transition graph: vertices represent normalized event types and edges represent sequential transition frequencies.
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-mono font-semibold text-slate-300">Graph Transitions (Edges & Weights):</h4>
              <div className="space-y-2">
                {activeGraph.links.map((link, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono">
                    <div className="flex items-center space-x-2">
                      <span className="text-emerald-400">{link.source}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span className="text-blue-400">{link.target}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      weight: {link.weight}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setGraphModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
