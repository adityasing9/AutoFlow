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
  Layers,
  HelpCircle,
  Zap,
  ChevronRight,
  FileCheck,
  CheckCheck,
  X
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { api } from '../api/client';

export default function DashboardPage({ stats, onNavigate, onRefresh, onSimulateWorkflow }) {
  const [isRunningDemo, setIsRunningDemo] = useState(false);
  const [demoMessage, setDemoMessage] = useState(null);
  
  // Interactive Walkthrough State
  const [walkthroughOpen, setWalkthroughOpen] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const [stepLoading, setStepLoading] = useState(false);

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

  // Walkthrough step handlers
  const handleWalkthroughStep1 = async () => {
    setStepLoading(true);
    try {
      await api.runDemoScenario();
      onRefresh();
      setActiveStep(2);
    } catch (err) {
      console.error(err);
    } finally {
      setStepLoading(false);
    }
  };

  const handleWalkthroughStep2 = () => {
    setActiveStep(3);
  };

  const handleWalkthroughStep3 = () => {
    setActiveStep(4);
  };

  const handleWalkthroughReset = () => {
    setActiveStep(1);
  };

  return (
    <div className="space-y-6">
      {/* 30-Second Friendly Interactive Walkthrough Box */}
      {walkthroughOpen && (
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-500/40 rounded-2xl p-6 shadow-xl">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Quick 1-Minute Interactive Guide: How AutoFlow Works
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    BEGINNER FRIENDLY
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Follow these 4 simple steps to watch AutoFlow discover, propose, and safely automate a task.
                </p>
              </div>
            </div>
            <button
              onClick={() => setWalkthroughOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Close Guide"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            {[
              { num: 1, label: '1. Human Repeats Task' },
              { num: 2, label: '2. Pattern Discovered' },
              { num: 3, label: '3. AI Proposes Automation' },
              { num: 4, label: '4. Safe Execution & Proof' },
            ].map((s) => (
              <div
                key={s.num}
                onClick={() => setActiveStep(s.num)}
                className={`cursor-pointer p-2.5 rounded-xl border text-center transition-all ${
                  activeStep === s.num
                    ? 'bg-indigo-600/30 border-indigo-400 text-white font-semibold shadow-sm'
                    : activeStep > s.num
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 opacity-60'
                }`}
              >
                <div className="text-[11px] font-mono mb-0.5">
                  {activeStep > s.num ? '✓ DONE' : `STEP ${s.num}`}
                </div>
                <div className="text-xs truncate">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Active Step Content */}
          <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800">
            {activeStep === 1 && (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                    <span>📥 Step 1 of 4: Normal User Activity</span>
                  </div>
                  <h3 className="text-base font-bold text-white">Simulate a student organizing 11 lecture PDFs</h3>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    Normally, you download slides to <code>Inbox</code>, rename them to <code>DBMS_Unit1.pdf</code>, and move them to <code>College/DBMS</code> over and over. AutoFlow quietly listens to permitted file events without storing your private data.
                  </p>
                </div>
                <button
                  onClick={handleWalkthroughStep1}
                  disabled={stepLoading}
                  className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all flex items-center space-x-2 shadow-lg disabled:opacity-50 whitespace-nowrap"
                >
                  {stepLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                  <span>{stepLoading ? 'Generating 11 Cycles...' : 'Click to Simulate 11 Repetitive Tasks'}</span>
                </button>
              </div>
            )}

            {activeStep === 2 && (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                    <span>🔍 Step 2 of 4: Pattern Discovered</span>
                  </div>
                  <h3 className="text-base font-bold text-white">AutoFlow detected your repetitive loop!</h3>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    AutoFlow mined the exact recurring sequence:
                    <span className="inline-block mt-1 font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      CREATE ➔ OPEN ➔ RENAME ➔ MOVE (11 occurrences)
                    </span>
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onNavigate('patterns')}
                    className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                  >
                    Inspect Pattern Graph
                  </button>
                  <button
                    onClick={handleWalkthroughStep2}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center space-x-1"
                  >
                    <span>Next: See AI Proposal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-purple-400 text-xs font-semibold uppercase tracking-wider">
                    <span>🤖 Step 3 of 4: AI Proposes Automation</span>
                  </div>
                  <h3 className="text-base font-bold text-white">"Study Material Organizer" (94% Confidence)</h3>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    The local AI evaluated your intent: <em>"Student organizing downloaded course materials into subject folders."</em> It created a dry-run simulation: 3 moves, 3 renames, 0 deletions.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onNavigate('suggestions')}
                    className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                  >
                    View AI Suggestions
                  </button>
                  <button
                    onClick={handleWalkthroughStep3}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors flex items-center space-x-1"
                  >
                    <span>Next: Execute & Verify</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {activeStep === 4 && (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                    <span>✅ Step 4 of 4: Safe Execution & Disk Proof</span>
                  </div>
                  <h3 className="text-base font-bold text-white">Executed with 100% Post-Verification!</h3>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    AutoFlow only acts when you approve. It executed the moves inside the sandbox and verified physical disk state:
                    <span className="font-mono text-emerald-400 ml-1">DESTINATION_EXISTS ✓</span> and <span className="font-mono text-emerald-400">SOURCE_REMOVED ✓</span>.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onNavigate('activity')}
                    className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                  >
                    View Verified Logs
                  </button>
                  <button
                    onClick={handleWalkthroughReset}
                    className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-colors"
                  >
                    Restart Tour ↺
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950/40 border border-slate-700/80 rounded-2xl p-6 shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Autonomous Workflow Discovery Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">Privacy-Preserving & Local-First</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">AutoFlow Intelligence Dashboard</h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Instead of manually creating complex automation scripts, AutoFlow observes repetitive computer tasks, uses local AI to infer intent, simulates changes safely, and executes with your permission.
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {!walkthroughOpen && (
              <button
                onClick={() => setWalkthroughOpen(true)}
                className="px-4 py-3 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 font-medium text-xs transition-all shadow-md flex items-center space-x-1.5"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Show Guide</span>
              </button>
            )}
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
              <span>{isRunningDemo ? 'Simulating 11 Cycles...' : 'Run Demo Scenario'}</span>
            </button>
          </div>
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
          title="Events Logged"
          value={stats?.events_today ?? 0}
          subtitle="Privacy sanitized"
          icon={Activity}
          color="emerald"
        />
        <StatCard
          title="Patterns Found"
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

      {/* Simple 3-Box Explainer for Beginners */}
      <div className="bg-slate-800/40 border border-slate-700/80 rounded-2xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <HelpCircle className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white">How AutoFlow Solves Your Problem (In Plain English)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">1. The Problem</div>
              <h3 className="text-sm font-semibold text-white mb-2">Tired of Repeating Boring Computer Tasks?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                You download PDFs, rename them, and sort them into folders day after day. You don't want to learn complicated Python scripting or drag 50 boxes in Zapier.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">2. AutoFlow's Magic</div>
              <h3 className="text-sm font-semibold text-white mb-2">Passive Discovery & Local AI</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                AutoFlow watches your allowed folder. When it sees you do the same steps 3 or more times, local AI infers what you're trying to do and writes the automation for you.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">3. You Stay In Control</div>
              <h3 className="text-sm font-semibold text-white mb-2">Simulated First, Verified on Disk</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                The AI never acts without permission. It shows you a simulation first (e.g. 3 renames, 0 deletions), asks you to click Approve, and physically verifies files after moving.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Academic Example Walkthrough Card */}
      <div className="bg-slate-800/40 border border-slate-700/80 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Live Evaluation Scenario: Study Material Organizer</h2>
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
