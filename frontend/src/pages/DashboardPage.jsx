import React, { useState } from 'react';
import {
  Activity,
  GitBranch,
  Sparkles,
  CheckCircle2,
  Check,
  AlertCircle,
  Play,
  RotateCw,
  ArrowRight,
  Shield,
  Layers
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { api } from '../api/client';

export default function DashboardPage({ stats, onNavigate, onRefresh, onSimulateWorkflow }) {
  const [isRunningDemo, setIsRunningDemo] = useState(false);
  const [demoMessage, setDemoMessage] = useState(null);

  const handleRunDemo = async () => {
    setIsRunningDemo(true);
    setDemoMessage(null);
    try {
      const res = await api.runDemoScenario();
      setDemoMessage(`Scenario simulated successfully! Generated ${res.events_created} events, detected ${res.patterns_detected} patterns.`);
      onRefresh();
    } catch (err) {
      setDemoMessage(`Error running demo: ${err.message}`);
    } finally {
      setIsRunningDemo(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Academic Demo Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950/40 border border-slate-700/80 rounded-2xl p-6 shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                BE AIML Mini-Project Demonstration
              </span>
              <span className="text-xs text-slate-400 font-mono">Autonomous Workflow Discovery</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">AutoFlow Intelligence Engine</h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Discovers repetitive user tasks, infers intent using local AI, proposes safe automations, and executes with explicit post-condition verification.
            </p>
          </div>
          
          <button
            onClick={handleRunDemo}
            disabled={isRunningDemo}
            className="flex-shrink-0 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-md flex items-center space-x-2.5 disabled:opacity-50"
          >
            {isRunningDemo ? (
              <RotateCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            <span>{isRunningDemo ? 'Simulating 11 Cycles...' : 'Run Academic Demo Scenario'}</span>
          </button>
        </div>

        {demoMessage && (
          <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-xs text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{demoMessage}</span>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Events Today"
          value={stats?.events_today ?? 0}
          subtitle="Privacy filtered"
          icon={Activity}
          color="emerald"
        />
        <StatCard
          title="Patterns"
          value={stats?.patterns_detected ?? 0}
          subtitle="Sequences mined"
          icon={GitBranch}
          color="blue"
        />
        <StatCard
          title="AI Suggestions"
          value={stats?.suggestions_count ?? 0}
          subtitle="Intent evaluated"
          icon={Sparkles}
          color="purple"
        />
        <StatCard
          title="Approved"
          value={stats?.approved_workflows ?? 0}
          subtitle="Ready to run"
          icon={CheckCircle2}
          color="amber"
        />
        <StatCard
          title="Successful"
          value={stats?.successful_executions ?? 0}
          subtitle="Verified on disk"
          icon={Check}
          color="emerald"
        />
        <StatCard
          title="Failed"
          value={stats?.failed_executions ?? 0}
          subtitle="Audited"
          icon={AlertCircle}
          color="red"
        />
      </div>

      {/* Primary Academic Example Walkthrough Card */}
      <div className="bg-slate-800/40 border border-slate-700/80 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Primary Scenario: Intelligent Study Material Organizer</h2>
              <p className="text-xs text-slate-400">Automatic pattern detection for academic document management</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('suggestions')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center space-x-1"
          >
            <span>View Suggestions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 my-4">
          <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] font-mono text-emerald-400 block mb-1">STEP 1</span>
            <span className="text-sm font-semibold text-white block">Download PDF</span>
            <span className="text-xs text-slate-400">Arrives in Inbox</span>
          </div>
          <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] font-mono text-blue-400 block mb-1">STEP 2</span>
            <span className="text-sm font-semibold text-white block">Open Document</span>
            <span className="text-xs text-slate-400">Inspected / Read</span>
          </div>
          <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] font-mono text-purple-400 block mb-1">STEP 3</span>
            <span className="text-sm font-semibold text-white block">Rename Document</span>
            <span className="text-xs text-slate-400">Standardized Format</span>
          </div>
          <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] font-mono text-amber-400 block mb-1">STEP 4</span>
            <span className="text-sm font-semibold text-white block">Move to Subject</span>
            <span className="text-xs text-slate-400">College/DBMS, AI, OS</span>
          </div>
        </div>

        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-4">
            <span className="text-slate-400">Detection Confidence: <b className="text-emerald-400">94% - 96%</b></span>
            <span className="text-slate-400">Execution Risk: <b className="text-emerald-400">LOW</b></span>
            <span className="text-slate-400">Verification Engine: <b className="text-blue-400">Automated</b></span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigate('patterns')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              Inspect Sequence
            </button>
            <button
              onClick={() => onNavigate('suggestions')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
            >
              Simulate & Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
