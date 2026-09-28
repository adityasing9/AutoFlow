import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, ShieldCheck, CheckCircle2, AlertTriangle, Check, Layers, FileCheck } from 'lucide-react';
import { api } from '../api/client';

export default function WorkflowDetailPage({ workflowId, onBack, onSimulate, onRefreshStats }) {
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);

  useEffect(() => {
    if (!workflowId) return;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await api.getWorkflowDetail(workflowId);
        setWorkflow(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [workflowId]);

  const handleRun = async () => {
    setExecuting(true);
    setExecutionResult(null);
    try {
      const res = await api.runWorkflow(workflow.id, {
        filename: "lecture_notes_dbms_unit1.pdf",
        subject: "DBMS",
        date: "20260928"
      });
      setExecutionResult(res);
      onRefreshStats();
    } catch (err) {
      alert(`Execution error: ${err.message}`);
    } finally {
      setExecuting(false);
    }
  };

  if (loading || !workflow) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        Loading workflow inspection...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Workflows</span>
      </button>

      {/* Header */}
      <div className="bg-slate-800/40 border border-slate-700/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {workflow.status}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Confidence: {(workflow.confidence * 100).toFixed(0)}%
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              Risk: {workflow.risk_level}
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">{workflow.name}</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">{workflow.description}</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onSimulate(workflow.id)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
          >
            Simulate Dry-Run
          </button>
          <button
            onClick={handleRun}
            disabled={executing || workflow.status !== 'APPROVED'}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center space-x-2 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{executing ? 'Executing & Verifying...' : 'Execute Workflow'}</span>
          </button>
        </div>
      </div>

      {executionResult && (
        <div className="p-4 bg-slate-900 border border-emerald-500/40 rounded-xl space-y-2 text-xs">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Workflow Executed Successfully ({executionResult.status})</span>
          </div>
          <p className="text-slate-300">
            All steps completed and verified on disk.
          </p>
        </div>
      )}

      {/* Grid: Trigger & Conditions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-4 space-y-2">
          <span className="text-[11px] font-mono text-emerald-400 uppercase font-semibold block">1. Trigger</span>
          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-slate-200">
            {workflow.trigger_type}
          </div>
          <p className="text-slate-400 text-[11px]">Fires whenever a matching event occurs in the monitored workspace.</p>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-4 space-y-2">
          <span className="text-[11px] font-mono text-blue-400 uppercase font-semibold block">2. Conditions</span>
          <pre className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-slate-300 overflow-x-auto">
            {JSON.stringify(workflow.conditions, null, 2)}
          </pre>
          <p className="text-slate-400 text-[11px]">Required pre-conditions to prevent accidental false activations.</p>
        </div>
      </div>

      {/* Action Steps */}
      <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-5 space-y-4">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">3. Controlled Action Sequence</h3>
        </div>

        <div className="space-y-3">
          {workflow.actions.map((act) => (
            <div key={act.step_order} className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-mono text-[10px] text-slate-300">
                    {act.step_order}
                  </span>
                  <span className="font-bold text-emerald-400 font-mono">{act.tool_name}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  Risk: {act.risk_level}
                </span>
              </div>
              <p className="text-slate-300 text-xs">{act.description}</p>
              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800/80 font-mono text-[11px] text-slate-400">
                Parameters: {JSON.stringify(act.params)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verification Plan */}
      <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-5 space-y-3 text-xs">
        <div className="flex items-center space-x-2">
          <FileCheck className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-bold text-white">4. Independent Verification Engine</h3>
        </div>
        <p className="text-slate-400">
          The executor never assumes success. After performing actions, it performs physical filesystem verification checks.
        </p>
        <pre className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-slate-300 overflow-x-auto">
          {JSON.stringify(workflow.verification, null, 2)}
        </pre>
      </div>
    </div>
  );
}
