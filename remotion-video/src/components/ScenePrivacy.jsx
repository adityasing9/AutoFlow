import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { WindowFrame } from './WindowFrame';

export const ScenePrivacy = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame, fps, config: { damping: 14 } });
  const cardSlide = spring({ frame: Math.max(0, frame - 20), fps, config: { damping: 13 } });
  const zoom = interpolate(frame, [0, 190], [1, 1.05], { extrapolateRight: 'clamp' });

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
      {/* Left Column: Text & Privacy Pillars */}
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
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            fontSize: 13,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 16,
          }}
        >
          <span>🛡️</span> Step 01: Zero Surveillance Ingestion
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
          Privacy-First Event Observation
        </h2>

        <p
          style={{
            fontSize: 18,
            color: '#94a3b8',
            lineHeight: 1.55,
            margin: '0 0 28px 0',
          }}
        >
          AutoFlow observes filesystem events exclusively inside authorized workspace directories. Sensitive user telemetry is blocked before it reaches the pipeline.
        </p>

        {/* 3 Privacy Guard Pillars */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            opacity: cardSlide,
          }}
        >
          {[
            {
              icon: '🚫',
              title: 'No Keylogging or Screen Capture',
              desc: 'Never records keystrokes, active window titles, or monitor pixels.',
            },
            {
              icon: '🔑',
              title: 'SHA-256 Hash Anonymization',
              desc: 'File paths are normalized and hashed to protect personal directory names.',
            },
            {
              icon: '📁',
              title: 'Strict Workspace Scoping',
              desc: 'Restricted to `AutoFlowWorkspace/Inbox` — OS system files remain untouched.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                padding: '14px 18px',
                borderRadius: 12,
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              }}
            >
              <span style={{ fontSize: 22, marginTop: 2 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>{item.title}</div>
                <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Live App Screenshot */}
      <div
        style={{
          width: '50%',
          display: 'flex',
          justifyContent: 'center',
          transform: `scale(${zoom})`,
        }}
      >
        <WindowFrame
          src="07_privacy_dashboard.png"
          title="AutoFlow — Privacy Architecture & Ingestion Guard"
          width={860}
          height={520}
        />
      </div>
    </div>
  );
};
