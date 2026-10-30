import React from 'react';
import { brand } from '../../config/branding';
import { logoPaths } from '../brand/logo-paths';

type Props = {
  size: number;
  /** 0→1: the two grey rings draw themselves. */
  rings?: number;
  /** 0→1: the pink arc fills up to its resting sweep (used as a progress reveal). */
  arc?: number;
  /** 0→1: the W rises into its window. */
  mark?: number;
  /** 0→1: the wordmark rises out of a mask. */
  word?: number;
  /** 0→1: the grey rule and its pink segment draw from the centre. */
  rule?: number;
  /** Disc opacity. */
  disc?: number;
  glow?: number;
  style?: React.CSSProperties;
};

const C = brand.colors;

/** The WillDev seal, rebuilt as vectors (scripts/build-logo.mjs). Every part animatable. */
export const Logo: React.FC<Props> = ({ size, rings = 1, arc = 1, mark = 1, word = 1, rule = 1, disc = 1, glow = 0.35, style }) => {
  const g = logoPaths;
  const circ = (r: number) => 2 * Math.PI * r;
  const sweep = ((brand.logo.arcSweep * Math.PI) / 180) * arc;
  const r = g.arcRadius;
  const ex = 500 + r * Math.sin(sweep);
  const ey = 500 - r * Math.cos(sweep);
  const u = g.underline;
  const half = ((u.x2 - u.x1) / 2) * rule;
  const mid = (u.x1 + u.x2) / 2;
  const pinkHalf = ((u.pinkX2 - u.pinkX1) / 2) * rule;
  const pinkMid = (u.pinkX1 + u.pinkX2) / 2;
  const id = React.useId().replace(/:/g, '');

  return (
    <svg viewBox="0 0 1000 1000" width={size} height={size} style={{ overflow: 'visible', ...style }}>
      <defs>
        <clipPath id={`mark-${id}`}>
          <rect x="0" y="270" width="1000" height="345" />
        </clipPath>
        <clipPath id={`word-${id}`}>
          <rect x="0" y="615" width="1000" height="112" />
        </clipPath>
        <filter id={`glow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="10" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="500" cy="500" r={g.disc} fill={C.black} opacity={disc} />
      {[g.ringOuter, g.ringInner].map((rr, i) => (
        <circle
          key={rr}
          cx="500"
          cy="500"
          r={rr}
          fill="none"
          stroke={C.gray}
          strokeWidth="3"
          strokeDasharray={circ(rr)}
          strokeDashoffset={circ(rr) * (1 - rings)}
          transform={`rotate(${i ? 90 : -90} 500 500)`}
        />
      ))}
      {arc > 0.001 && (
        <path
          d={`M500 ${500 - r} A${r} ${r} 0 ${sweep > Math.PI ? 1 : 0} 1 ${ex} ${ey}`}
          fill="none"
          stroke={C.pink}
          strokeWidth="12"
          filter={glow > 0 ? `url(#glow-${id})` : undefined}
        />
      )}
      <g clipPath={`url(#mark-${id})`}>
        <path d={g.w} fill={C.lime} transform={`translate(0 ${345 * (1 - mark)})`} />
      </g>
      <g clipPath={`url(#word-${id})`}>
        <path d={g.word} fill={C.lime} transform={`translate(0 ${112 * (1 - word)})`} />
      </g>
      {rule > 0 && (
        <>
          <line x1={mid - half} x2={mid + half} y1={u.y} y2={u.y} stroke={C.gray} strokeWidth="3" />
          <line x1={pinkMid - pinkHalf} x2={pinkMid + pinkHalf} y1={u.y} y2={u.y} stroke={C.pink} strokeWidth="5" />
        </>
      )}
    </svg>
  );
};
