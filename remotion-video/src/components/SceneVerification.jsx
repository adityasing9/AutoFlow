import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { WindowFrame } from './WindowFrame';

export const SceneVerification = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame, fps, config: { damping: 14 } });
  const logSpring = spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 13 } });

  const checks = [
    { title: 'Explicit Human Approval', detail: 'User approves execution scope and permission boundaries.', status: 'GRANTED' },
    { title: 'Sandboxed Tool Actions', detail: 'Scoped execution strictly inside AutoFlowWorkspace.', status: 'ACTIVE' },
    { title: 'Independent Disk Verification', detail: 'Checks DESTINATION_EXISTS and SOURCE_REMOVED.', status: 'CONFIRMED' },
    { title: 'Tamper-Evident Audit Log', detail: 'Full SQLite audit trail recorded with precise timestamps.', status: 'LOGGED' },
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
      {/* Left Column: Governance & Verification Checklist */}
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
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            color: '#4ade80',
            fontSize: 13,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 16,
          }}
        >
          <span>✅</span> Step 04: Execution & Verification
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
          Executor Acts. Verifier Confirms.
        </h2>

        <p
          style={{
            fontSize: 18,
            color: '#94a3b8',
            lineHeight: 1.55,
            margin: '0 0 24px 0',
          }}
        >
          Automations are never allowed to execute in an unverified void. AutoFlow inspects the physical disk post-execution to guarantee every file landed safely.
        </p>

        {/* Verification Checkpoints */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {checks.map((chk, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                borderRadius: 12,
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: '#22c55e', fontSize: 18, fontWeight: 'bold' }}>✓</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc' }}>{chk.title}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{chk.detail}</div>
                </div>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  padding: '4px 10px',
                  borderRadius: 6,
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  color: '#4ade80',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}
              >
                {chk.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Screenshot of Audit Log */}
      <div
        style={{
          width: '50%',
          display: 'flex',
          justifyContent: 'center',
          opacity: logSpring,
          transform: `scale(${interpolate(logSpring, [0, 1], [0.92, 1])})`,
        }}
      >
        <WindowFrame
          src="08_activity_log.png"
          title="AutoFlow — Verified Execution Audit Trail"
          width={860}
          height={520}
        />
      </div>
    </div>
  );
};
