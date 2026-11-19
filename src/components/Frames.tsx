import React from 'react';
import { brand } from '../../config/branding';

const C = brand.colors;

type FrameProps = { width: number; height: number; children: React.ReactNode; style?: React.CSSProperties };

/**
 * Browser window. The address bar is deliberately blank: no URL ever
 * appears on screen (marketplace rule), only the three dots and an empty pill.
 */
export const BrowserFrame: React.FC<FrameProps> = ({ width, height, children, style }) => {
  const bar = Math.round(height * 0.052);
  return (
    <div
      style={{
        position: 'absolute',
        width,
        height,
        borderRadius: 18,
        overflow: 'hidden',
        background: C.graphite,
        border: `1px solid rgba(255,255,255,0.09)`,
        boxShadow: '0 40px 120px rgba(0,0,0,0.65), 0 0 0 1px rgba(0,0,0,0.6)',
        ...style,
      }}
    >
      <div style={{ height: bar, display: 'flex', alignItems: 'center', gap: bar * 0.24, padding: `0 ${bar * 0.5}px`, background: C.graphiteLight, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: bar * 0.26, height: bar * 0.26, borderRadius: '50%', background: i === 0 ? C.pink : 'rgba(255,255,255,0.18)' }} />
        ))}
        <div style={{ marginLeft: bar * 0.6, height: bar * 0.5, width: '34%', borderRadius: bar, background: 'rgba(255,255,255,0.06)' }} />
      </div>
      <div style={{ position: 'absolute', top: bar, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>{children}</div>
    </div>
  );
};

/** Phone body: dark bezel, rounded screen, a hint of the side glass. */
export const PhoneFrame: React.FC<FrameProps> = ({ width, height, children, style }) => {
  const bezel = Math.round(width * 0.04);
  return (
    <div
      style={{
        position: 'absolute',
        width,
        height,
        borderRadius: width * 0.15,
        background: '#07080A',
        padding: bezel,
        boxShadow: `0 50px 120px rgba(0,0,0,0.7), inset 0 0 0 2px rgba(255,255,255,0.10), 0 0 0 1px rgba(255,255,255,0.05)`,
        ...style,
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: width * 0.115, overflow: 'hidden', background: '#000' }}>{children}</div>
    </div>
  );
};
