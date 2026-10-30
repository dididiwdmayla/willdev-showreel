import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { brand } from '../../config/branding';
import { ease, ramp } from '../lib/anim';

export type WipeKind = 'right' | 'left' | 'down' | 'iris' | 'none';

type Props = {
  kind: WipeKind;
  /** Frames the wipe takes; it starts at frame 0 of the enclosing Sequence (on the bar line). */
  duration: number;
  /** Iris centre in px. */
  origin?: [number, number];
  children: React.ReactNode;
};

/**
 * Scene entrance: the new scene is revealed behind a travelling white neon edge —
 * the same line that connects text blocks in the brand posts.
 */
export const Wipe: React.FC<Props> = ({ kind, duration, origin = [960, 540], children }) => {
  const frame = useCurrentFrame();
  if (kind === 'none') return <AbsoluteFill>{children}</AbsoluteFill>;
  const t = ramp(frame, 0, duration, ease.inOut);
  const done = t >= 1;
  let clip = 'none';
  let edge: React.ReactNode = null;
  const glow = `0 0 18px ${brand.colors.whiteGlow}, 0 0 46px ${brand.colors.whiteGlow}`;
  if (kind === 'right' || kind === 'left') {
    const x = (kind === 'right' ? t : 1 - t) * 1920;
    clip = kind === 'right' ? `inset(0 ${1920 - x}px 0 0)` : `inset(0 0 0 ${x}px)`;
    edge = <div style={{ position: 'absolute', top: 0, bottom: 0, left: x - 2, width: 4, background: brand.colors.white, boxShadow: glow }} />;
  } else if (kind === 'down') {
    const y = t * 1080;
    clip = `inset(0 0 ${1080 - y}px 0)`;
    edge = <div style={{ position: 'absolute', left: 0, right: 0, top: y - 2, height: 4, background: brand.colors.white, boxShadow: glow }} />;
  } else if (kind === 'iris') {
    const r = t * 2300;
    clip = `circle(${r}px at ${origin[0]}px ${origin[1]}px)`;
    edge = (
      <div
        style={{
          position: 'absolute',
          left: origin[0] - r,
          top: origin[1] - r,
          width: r * 2,
          height: r * 2,
          borderRadius: '50%',
          border: `4px solid ${brand.colors.white}`,
          boxShadow: glow,
        }}
      />
    );
  }
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: done ? undefined : clip }}>{children}</AbsoluteFill>
      {!done && t > 0 && <AbsoluteFill style={{ pointerEvents: 'none' }}>{edge}</AbsoluteFill>}
    </AbsoluteFill>
  );
};
