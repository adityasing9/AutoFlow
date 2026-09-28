import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const SceneIntro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring animations
  const titleSpring = spring({ frame, fps, config: { damping: 14, stiffness: 90 } });
  const subtitleFade = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: 'clamp' });
  const cardsSlide = spring({ frame: Math.max(0, frame - 30), fps, config: { damping: 12 } });
  const badgeFade = interpolate(frame, [50, 70], [0, 1], { extrapolateRight: 'clamp' });

  // Floating bounce effect
  const float = Math.sin(frame / 20) * 6;

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
      {/* Top Tagline Pill */}
      <div
        style={{
          opacity: subtitleFade,
          transform: `translateY(${interpolate(subtitleFade, [0, 1], [15, 0])}px)`,
          padding: '8px 20px',
          borderRadius: 999,
          background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          color: '#34d399',
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 20,
          boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)',
        }}
      >
        Next-Generation Autonomous Automation
      </div>

      {/* Main Headline */}
      <div
        style={{
          transform: `scale(${titleSpring}) translateY(${float}px)`,
          textAlign: 'center',
          maxWidth: 1100,
        }}
      >
        <h1
          style={{
            fontSize: 76,
            fontWeight: 900,
            letterSpacing: '-0.03em',
            margin: 0,
            lineHeight: 1.05,
            color: '#ffffff',
            textShadow: '0 0 40px rgba(16, 185, 129, 0.3)',
          }}
        >
          Automate Without Building.
        </h1>
        <h2
          style={{
            fontSize: 52,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            margin: '12px 0 0 0',
            background: 'linear-gradient(135deg, #10b981 0%, #38bdf8 50%, #a855f7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          AutoFlow Discovers Your Workflows.
        </h2>
      </div>

      {/* Description */}
      <p
        style={{
          opacity: subtitleFade,
          fontSize: 22,
          color: '#94a3b8',
          maxWidth: 820,
          textAlign: 'center',
          marginTop: 20,
          lineHeight: 1.5,
          fontWeight: 400,
        }}
      >
        Instead of manually dragging nodes in complex builders, AutoFlow observes permitted activity, mines repeated sequences, infers intent with local AI, and executes with user permission.
      </p>

      {/* Comparison Cards */}
      <div
        style={{
          display: 'flex',
          gap: 28,
          marginTop: 40,
          opacity: cardsSlide,
          transform: `translateY(${interpolate(cardsSlide, [0, 1], [30, 0])}px)`,
        }}
      >
        {/* Legacy Manual Approach */}
        <div
          style={{
            width: 440,
            padding: '24px 28px',
            borderRadius: 16,
            backgroundColor: 'rgba(239, 68, 68, 0.06)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 22 }}>❌</span>
            <span style={{ fontSize: 17, fontWeight: 700, color: '#f87171' }}>The Manual Burden</span>
          </div>
          <div style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.6 }}>
            Users repeat manual file moving, renaming, and sorting dozens of times every week without ever writing a script.
          </div>
        </div>

        {/* AutoFlow Autonomous Approach */}
        <div
          style={{
            width: 480,
            padding: '24px 28px',
            borderRadius: 16,
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            boxShadow: '0 10px 35px rgba(16, 185, 129, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 22 }}>✨</span>
            <span style={{ fontSize: 17, fontWeight: 700, color: '#34d399' }}>AutoFlow Discovery</span>
          </div>
          <div style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.6 }}>
            Passive observation detects sequences, builds directed graphs, drafts safe automations, and asks for 1-click execution.
          </div>
        </div>
      </div>

      {/* Feature Badges */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          marginTop: 40,
          opacity: badgeFade,
        }}
      >
        {['🔒 100% Local-First', '🛡️ Privacy Guard Firewall', '📊 Sequence Mining (O(N))', '🤖 AI Intent Inference', '✅ Disk Verification'].map((item, i) => (
          <div
            key={i}
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              fontSize: 13,
              fontWeight: 600,
              color: '#e2e8f0',
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};
