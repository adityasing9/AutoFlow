import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const SceneOutro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame, fps, config: { damping: 14 } });
  const creedFade = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: 'clamp' });
  const linksSlide = spring({ frame: Math.max(0, frame - 35), fps, config: { damping: 12 } });

  const creedLines = [
    { text: 'The AI proposes.', color: '#38bdf8' },
    { text: 'The permission engine decides.', color: '#fbbf24' },
    { text: 'The executor acts.', color: '#10b981' },
    { text: 'The verifier confirms.', color: '#a855f7' },
  ];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
        boxSizing: 'border-box',
        fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Title */}
      <div
        style={{
          opacity: entrance,
          transform: `scale(${entrance})`,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 999,
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#34d399',
            fontSize: 13,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 20,
          }}
        >
          Core Architecture Principle
        </div>
      </div>

      {/* The 4-Line Principle Creed */}
      <div
        style={{
          opacity: creedFade,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
          margin: '10px 0 35px 0',
        }}
      >
        {creedLines.map((line, idx) => (
          <div
            key={idx}
            style={{
              fontSize: 48,
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: line.color,
              textShadow: `0 0 30px ${line.color}44`,
            }}
          >
            "{line.text}"
          </div>
        ))}
      </div>

      {/* Call to Action and Links */}
      <div
        style={{
          opacity: linksSlide,
          transform: `translateY(${interpolate(linksSlide, [0, 1], [30, 0])}px)`,
          display: 'flex',
          gap: 24,
          alignItems: 'center',
        }}
      >
        {/* Live Vercel Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '16px 28px',
            borderRadius: 14,
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.2)',
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              backgroundColor: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: 20,
            }}
          >
            🌐
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#34d399', fontWeight: 700, textTransform: 'uppercase' }}>
              Live Deployment
            </div>
            <div style={{ fontSize: 17, color: '#ffffff', fontWeight: 800 }}>
              autoflow-three-pearl.vercel.app
            </div>
          </div>
        </div>

        {/* GitHub Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '16px 28px',
            borderRadius: 14,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              backgroundColor: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: 20,
            }}
          >
            🐙
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
              Open Source Repository
            </div>
            <div style={{ fontSize: 17, color: '#ffffff', fontWeight: 800 }}>
              github.com/adityasing9/AutoFlow
            </div>
          </div>
        </div>
      </div>

      {/* Stack summary line */}
      <div
        style={{
          marginTop: 40,
          opacity: linksSlide,
          fontSize: 14,
          color: '#64748b',
          fontWeight: 500,
          letterSpacing: '0.04em',
        }}
      >
        Built with FastAPI • React 19 • NetworkX • SQLite • Tailwind CSS
      </div>
    </div>
  );
};
