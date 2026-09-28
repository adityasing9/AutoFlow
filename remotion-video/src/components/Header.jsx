import React from 'react';
import { useCurrentFrame } from 'remotion';

export const Header = () => {
  const frame = useCurrentFrame();

  const stages = [
    { name: 'DISCOVERY', start: 0, end: 190 },
    { name: 'PRIVACY FIREWALL', start: 190, end: 380 },
    { name: 'GRAPH MINING', start: 380, end: 570 },
    { name: 'AI INTENT', start: 570, end: 760 },
    { name: 'VERIFICATION', start: 760, end: 950 },
    { name: 'ARCHITECTURE', start: 950, end: 1140 },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 72,
        padding: '0 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: 'rgba(10, 15, 29, 0.75)',
        backdropFilter: 'blur(16px)',
        zIndex: 50,
        boxSizing: 'border-box',
        fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Brand & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        </div>
        <div>
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
            AutoFlow
          </span>
          <span style={{ fontSize: 12, marginLeft: 8, padding: '2px 8px', borderRadius: 999, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 600 }}>
            v1.0.0 Live
          </span>
        </div>
      </div>

      {/* Stage indicators */}
      <div style={{ display: 'flex', gap: 8 }}>
        {stages.map((stage, idx) => {
          const isActive = frame >= stage.start && frame < stage.end;
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#34d399' : 'rgba(255, 255, 255, 0.45)',
                backgroundColor: isActive ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                transition: 'all 0.3s ease',
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: isActive ? '#10b981' : 'rgba(255, 255, 255, 0.25)',
                  boxShadow: isActive ? '0 0 8px #10b981' : 'none',
                }}
              />
              {stage.name}
            </div>
          );
        })}
      </div>

      {/* Live Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#94a3b8' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }} />
          Local-First Engine
        </div>
      </div>
    </div>
  );
};
