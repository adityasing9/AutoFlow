import React from 'react';
import { Img, staticFile } from 'remotion';

export const WindowFrame = ({
  src,
  title = 'AutoFlow Engine',
  width = 980,
  height = 560,
  scale = 1,
  style = {},
}) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 14,
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        backgroundColor: '#0f172a',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.75), 0 0 35px rgba(16, 185, 129, 0.15)',
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        ...style,
      }}
    >
      {/* Window Title Bar */}
      <div
        style={{
          height: 38,
          backgroundColor: '#1e293b',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          justifyContent: 'space-between',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#ef4444' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#10b981' }} />
        </div>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8', letterSpacing: '0.02em' }}>
          {title}
        </div>
        <div style={{ width: 40 }} />
      </div>

      {/* Screenshot Content */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#090d16' }}>
        <Img
          src={staticFile(src)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top left',
            display: 'block',
          }}
        />
      </div>
    </div>
  );
};
