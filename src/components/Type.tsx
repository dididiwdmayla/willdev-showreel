import React from 'react';
import { useCurrentFrame } from 'remotion';
import { fitText } from '@remotion/layout-utils';
import { brand } from '../../config/branding';
import { ease, ramp } from '../lib/anim';

const C = brand.colors;

/** Largest size ≤ `size` at which `text` fits `maxWidth` — keeps longer locales inside the layout. */
export function fitSize(text: string, size: number, maxWidth: number, weight: number | string = 700, family = brand.fonts.display) {
  try {
    const { fontSize } = fitText({ text, withinWidth: maxWidth, fontFamily: family, fontWeight: weight, validateFontIsLoaded: false });
    return Math.min(size, fontSize);
  } catch {
    return size;
  }
}

type LineProps = {
  text: string;
  /** Frame (relative to the enclosing Sequence) where the line starts rising. */
  at: number;
  size: number;
  color?: string;
  weight?: number;
  /** Max width for responsive sizing; defaults to no limit. */
  maxWidth?: number;
  align?: 'left' | 'right' | 'center';
  glow?: boolean;
  /** Word to underline in pink (brand pattern for the secondary phrase). */
  underline?: string;
  underlineColor?: string;
  /** Frame where the line slides back down and out; omit to keep it. */
  out?: number;
  /** Words rise one after another, `stagger` frames apart. */
  stagger?: number;
  letterSpacing?: string;
  style?: React.CSSProperties;
};

/** A line revealed through a mask, word by word, with the optional pink underline drawing under its keyword. */
export const Line: React.FC<LineProps> = ({
  text,
  at,
  size,
  color = C.lime,
  weight = 700,
  maxWidth,
  align = 'left',
  glow = true,
  underline,
  underlineColor = C.pink,
  out,
  stagger = 3,
  letterSpacing = '-0.035em',
  style,
}) => {
  const frame = useCurrentFrame();
  const fs = maxWidth ? fitSize(text, size, maxWidth, weight) : size;
  const words = text.split(' ');
  const leave = out === undefined ? 0 : ramp(frame, out, 10, ease.in);
  return (
    <div
      style={{
        fontFamily: brand.fonts.display,
        fontWeight: weight,
        fontSize: fs,
        lineHeight: 1.04,
        letterSpacing,
        color,
        textAlign: align,
        whiteSpace: 'nowrap',
        textShadow: glow ? `0 0 ${fs * 0.28}px ${color === C.pink ? C.pinkGlow : C.limeGlow}` : undefined,
        ...style,
      }}
    >
      {words.map((w, i) => {
        const t = ramp(frame, at + i * stagger, 16, ease.out);
        const key = underline && w.replace(/[.,!?]/g, '').toLowerCase() === underline.toLowerCase();
        const u = key ? ramp(frame, at + i * stagger + 8, 14, ease.inOut) : 0;
        return (
          <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: fs * 0.16, marginBottom: -fs * 0.16, paddingRight: fs * 0.06, marginRight: -fs * 0.06 }}>
            <span style={{ display: 'inline-block', translate: `0 ${(1 - t) * 105 + leave * 105}%`, position: 'relative' }}>
              {w}
              {key && (
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    bottom: -fs * 0.07,
                    height: Math.max(4, fs * 0.075),
                    width: '100%',
                    background: underlineColor,
                    boxShadow: `0 0 ${fs * 0.2}px ${C.pinkGlow}`,
                    scale: `${u} 1`,
                    transformOrigin: 'left center',
                  }}
                />
              )}
            </span>
            {i < words.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </div>
  );
};

type TagProps = { label: string; kind: string; at: number; out?: number; style?: React.CSSProperties };

/** Small project tag: lime square label + white caps line with the ↗ arrow, as in the brand posts. */
export const ProjectTag: React.FC<TagProps> = ({ label, kind, at, out, style }) => {
  const frame = useCurrentFrame();
  const t = ramp(frame, at, 14, ease.out);
  const o = out === undefined ? 1 : 1 - ramp(frame, out, 8, ease.in);
  const bar = ramp(frame, at, 20, ease.inOut);
  return (
    <div style={{ position: 'absolute', opacity: t * o, translate: `${(1 - t) * -24}px 0`, ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 34 * bar, height: 3, background: C.pink, boxShadow: `0 0 10px ${C.pinkGlow}` }} />
        <div style={{ fontFamily: brand.fonts.label, fontWeight: 600, fontSize: 30, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.lime }}>
          {label}
        </div>
      </div>
      <div
        style={{
          marginTop: 6,
          marginLeft: 48,
          fontFamily: brand.fonts.label,
          fontWeight: 500,
          fontSize: 21,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: C.white,
          opacity: 0.86,
        }}
      >
        {kind} <span style={{ color: C.lime }}>↗</span>
      </div>
    </div>
  );
};
