import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { WindowFrame } from './WindowFrame';

export const SceneSimulation = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame, fps, config: { damping: 14 } });
  const simSpring = spring({ frame: Math.max(0, frame - 20), fps, config: { damping: 13 } });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '100px 90px 40px 90px',
        boxSizing: 'border-box',
        fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Left Column: AI Intent & Dry Run Specs */}
      <div
        style={{
          width: '45%',
          opacity: entrance,
          transform: `translateX(${interpolate(entrance, [0, 1], [-40, 0])}px)`,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 999,
            backgroundColor: 'rgba(168, 85, 247, 0.15)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            color: '#c084fc',
            fontSize: 13,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 16,
          }}
        >
          <span>🤖</span> Step 03: Intent Inference & Dry-Run Simulation
        </div>

        <h2
          style={{
            fontSize: 44,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#ffffff',
            lineHeight: 1.15,
            margin: '0 0 16px 0',
          }}
        >
          AI Proposes. Simulation Validates.
        </h2>

        <p
          style={{
            fontSize: 18,
            color: '#94a3b8',
            lineHeight: 1.55,
            margin: '0 0 24px 0',
          }}
        >
          The local AI interprets the pattern as <strong>"Study Material Organizer"</strong> with <strong>94% confidence</strong> and assesses a <strong>LOW risk rating</strong>.
        </p>

        {/* AI Intent Discovery Card */}
        <div
          style={{
            padding: '20px 24px',
            borderRadius: 14,
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(168, 85, 247, 0.15)',
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Study Material Organizer</span>
            <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 999, backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontWeight: 700 }}>
              Confidence 94% • Risk: LOW
            </span>
          </div>
          <div style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.5 }}>
            Automates the repetitive cycle of renaming course slides, moving lecture notes into categorized folders, and standardizing study materials.
          </div>
        </div>

        {/* Dry-run stats */}
        <div style={{ display: 'flex', gap: 14 }}>
          {[
            { label: 'Renames Planned', val: '3 Operations', color: '#38bdf8' },
            { label: 'Moves Planned', val: '3 Operations', color: '#10b981' },
            { label: 'Deletions Planned', val: '0 (Safe)', color: '#a855f7' },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                padding: '12px 14px',
                borderRadius: 10,
                backgroundColor: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ fontSize: 11, color: '#94a3b8' }}>{stat.label}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: stat.color, marginTop: 4 }}>{stat.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Screenshot of Simulation Modal */}
      <div
        style={{
          width: '50%',
          display: 'flex',
          justifyContent: 'center',
          opacity: simSpring,
          transform: `scale(${interpolate(simSpring, [0, 1], [0.92, 1])})`,
        }}
      >
        <WindowFrame
          src="06_simulation_modal.png"
          title="AutoFlow — Dry-Run Workflow Simulation Modal"
          width={860}
          height={520}
        />
      </div>
    </div>
  );
};
