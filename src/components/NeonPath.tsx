import React, { useMemo } from 'react';
import { getLength, getPointAtLength } from '@remotion/paths';
import { brand } from '../../config/branding';

type Props = {
  /** SVG path in the 1920×1080 frame. Use rounded corners (arcs/quadratics) — that is the motif. */
  d: string;
  /** Drawn portion, 0→1 from the start of the path. */
  progress: number;
  /** Erased portion from the start, 0→1 (the tail catching up). */
  tail?: number;
  color?: string;
  glowColor?: string;
  width?: number;
  /** Bright dot on the drawing head. */
  head?: boolean;
  opacity?: number;
};

/** The white neon line of the brand posts: thin core, soft glow, round caps. */
export const NeonPath: React.FC<Props> = ({
  d,
  progress,
  tail = 0,
  color = brand.colors.white,
  glowColor = brand.colors.whiteGlow,
  width = 4,
  head = true,
  opacity = 1,
}) => {
  const len = useMemo(() => getLength(d), [d]);
  const start = len * Math.min(tail, progress);
  const end = len * progress;
  const visible = Math.max(0, end - start);
  const dash = `0 ${start} ${visible} ${len + 10}`;
  const p = progress > 0 && progress < 1 && head ? getPointAtLength(d, end) : null;
  if (visible <= 0.5) return null;
  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, overflow: 'visible', opacity, pointerEvents: 'none' }}>
      <path d={d} fill="none" stroke={glowColor} strokeWidth={width * 5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} style={{ filter: `blur(${width * 2.2}px)` }} />
      <path d={d} fill="none" stroke={glowColor} strokeWidth={width * 2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} style={{ filter: `blur(${width * 0.8}px)` }} />
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} />
      {p && <circle cx={p.x} cy={p.y} r={width * 1.6} fill={color} style={{ filter: `drop-shadow(0 0 ${width * 3}px ${glowColor})` }} />}
    </svg>
  );
};

/** Rounded polyline helper: corner radius r on every joint. */
export function roundedPath(points: [number, number][], r = 40): string {
  if (points.length < 2) return '';
  let d = `M${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    const l1 = Math.hypot(x1 - x0, y1 - y0);
    const l2 = Math.hypot(x2 - x1, y2 - y1);
    const rr = Math.min(r, l1 / 2, l2 / 2);
    const ax = x1 - ((x1 - x0) / l1) * rr;
    const ay = y1 - ((y1 - y0) / l1) * rr;
    const bx = x1 + ((x2 - x1) / l2) * rr;
    const by = y1 + ((y2 - y1) / l2) * rr;
    d += ` L${ax} ${ay} Q${x1} ${y1} ${bx} ${by}`;
  }
  const last = points[points.length - 1];
  d += ` L${last[0]} ${last[1]}`;
  return d;
}
