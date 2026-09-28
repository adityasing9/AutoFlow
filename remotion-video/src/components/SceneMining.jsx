import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { WindowFrame } from './WindowFrame';

export const SceneMining = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame, fps, config: { damping: 14 } });
  const graphSpring = spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 12 } });

  // Floating transition sequence
  const sequenceSteps = [
    { label: 'CREATE', color: '#10b981', time: 't₀' },
    { label: 'OPEN', color: '#06b6d4', time: 't₁' },
    { label: 'RENAME', color: '#8b5cf6', time: 't₂' },
    { label: 'MOVE', color: '#f59e0b', time: 't₃' },
  ];

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
      {/* Left Column: Algorithm Explanation & Transition Pipeline */}
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
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: '#38bdf8',
            fontSize: 13,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 16,
          }}
        >
          <span>📊</span> Step 02: Pattern Mining & Graph Construction
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
          Sliding-Window Sequence Mining
        </h2>

        <p
          style={{
            fontSize: 18,
            color: '#94a3b8',
            lineHeight: 1.55,
            margin: '0 0 28px 0',
          }}
        >
          AutoFlow converts raw filesystem streams into contiguous action sequences. An O(N) sliding-window miner detects recurring loops where frequency P ≥ 3, mapping transitions into a directed state graph.
        </p>

        {/* Visual sequence flow pill bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '16px 20px',
            borderRadius: 14,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: 24,
          }}
        >
          {sequenceSteps.map((step, idx) => (
            <React.Fragment key={idx}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <div
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    backgroundColor: `${step.color}22`,
                    border: `1px solid ${step.color}66`,
                    color: step.color,
                    fontSize: 13,
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                  }}
                >
                  {step.label}
                </div>
                <span style={{ fontSize: 10, color: '#64748b' }}>{step.time}</span>
              </div>
              {idx < sequenceSteps.length - 1 && (
                <div style={{ color: '#475569', fontSize: 18, fontWeight: 'bold' }}>➔</div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 12,
              backgroundColor: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase' }}>Discovered Cycle</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981', marginTop: 4 }}>3 Repeated Sets</div>
          </div>
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 12,
              backgroundColor: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase' }}>State Transitions</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>Directed Graph</div>
          </div>
        </div>
      </div>

      {/* Right Column: Screenshot of Directed Graph Modal */}
      <div
        style={{
          width: '50%',
          display: 'flex',
          justifyContent: 'center',
          opacity: graphSpring,
          transform: `scale(${interpolate(graphSpring, [0, 1], [0.92, 1])})`,
        }}
      >
        <WindowFrame
          src="04_directed_graph_modal.png"
          title="AutoFlow — Discovered State Transition Graph"
          width={860}
          height={520}
        />
      </div>
    </div>
  );
};
