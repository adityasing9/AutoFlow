import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const Background = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Floating ambient glow coordinates
  const orb1X = interpolate(frame, [0, durationInFrames], [20, 75], { extrapolateRight: 'clamp' });
  const orb1Y = interpolate(frame, [0, durationInFrames], [30, 70], { extrapolateRight: 'clamp' });
  const orb2X = interpolate(frame, [0, durationInFrames], [80, 25], { extrapolateRight: 'clamp' });
  const orb2Y = interpolate(frame, [0, durationInFrames], [70, 20], { extrapolateRight: 'clamp' });

  const pulse = Math.sin((frame / 30) * Math.PI) * 0.15 + 0.85;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#0a0f1d',
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      {/* Subtle grid pattern */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          opacity: 0.6,
        }}
      />

      {/* Primary Emerald Glow Orb */}
      <div
        style={{
          position: 'absolute',
          left: `${orb1X}%`,
          top: `${orb1Y}%`,
          width: 700,
          height: 700,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(16, 185, 129, 0) 70%)',
          filter: 'blur(60px)',
          opacity: pulse,
          pointerEvents: 'none',
        }}
      />

      {/* Secondary Cyan Glow Orb */}
      <div
        style={{
          position: 'absolute',
          left: `${orb2X}%`,
          top: `${orb2Y}%`,
          width: 650,
          height: 650,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.14) 0%, rgba(6, 182, 212, 0) 70%)',
          filter: 'blur(70px)',
          opacity: pulse,
          pointerEvents: 'none',
        }}
      />

      {/* Top subtle vignette */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(5, 8, 16, 0.75) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
