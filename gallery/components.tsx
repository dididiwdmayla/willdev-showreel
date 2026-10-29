import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { brand } from '../config/branding';
import { BrowserFrame, PhoneFrame } from '../src/components/Frames';
import { fitSize } from '../src/components/Type';
import { logoPaths } from '../src/brand/logo-paths';
import { captures, GALLERY, type CaptureName, type Crop } from './layout';
import '../src/fonts';

const C = brand.colors;

/** The gallery canvas: brand black with an optional soft glow behind the work. */
export const Canvas: React.FC<{ glow?: { x: number; y: number; color: string; size?: number }; children: React.ReactNode }> = ({ glow, children }) => (
  <AbsoluteFill style={{ background: C.black, overflow: 'hidden' }}>
    {glow && (
      <AbsoluteFill
        style={{ background: `radial-gradient(circle ${glow.size ?? 620}px at ${glow.x}px ${glow.y}px, ${glow.color} 0%, ${C.black} 100%)` }}
      />
    )}
    {children}
  </AbsoluteFill>
);

type ShotProps = {
  name: CaptureName;
  /** Region of the page to show, in CSS pixels; defaults to the whole capture. */
  crop?: Crop;
  width: number;
  height: number;
  style?: React.CSSProperties;
};

/**
 * A real capture, cropped like `object-fit: cover` around `crop` — never stretched.
 * The crop is centred in the box; whatever does not fit the box's ratio is trimmed evenly.
 */
export const Shot: React.FC<ShotProps> = ({ name, crop, width, height, style }) => {
  const [cw, ch] = captures[name].css;
  const r = crop ?? { x: 0, y: 0, w: cw, h: ch };
  const k = Math.max(width / r.w, height / r.h);
  const left = -r.x * k + (width - r.w * k) / 2;
  const top = -r.y * k + (height - r.h * k) / 2;
  return (
    <div style={{ position: 'relative', width, height, overflow: 'hidden', ...style }}>
      <Img src={staticFile(`gallery/${name}.png`)} style={{ position: 'absolute', left, top, width: cw * k, height: ch * k, maxWidth: 'none' }} />
    </div>
  );
};

/** Browser window (blank address bar, as in the video) whose content area is exactly `width × contentHeight`. */
export const Browser: React.FC<{ x: number; y: number; width: number; contentHeight: number; shot: Omit<ShotProps, 'width' | 'height'>; style?: React.CSSProperties }> = ({
  x,
  y,
  width,
  contentHeight,
  shot,
  style,
}) => {
  // BrowserFrame's bar is 5.2 % of its total height.
  const height = Math.round(contentHeight / (1 - 0.052));
  const bar = Math.round(height * 0.052);
  return (
    <BrowserFrame width={width} height={height} style={{ left: x, top: y, borderRadius: 12, ...style }}>
      <Shot {...shot} width={width} height={height - bar} />
    </BrowserFrame>
  );
};

/** Phone with a capture on its screen. */
export const Phone: React.FC<{ x: number; y: number; width: number; height: number; shot: Omit<ShotProps, 'width' | 'height'>; style?: React.CSSProperties }> = ({
  x,
  y,
  width,
  height,
  shot,
  style,
}) => {
  const bezel = Math.round(width * 0.04);
  return (
    <PhoneFrame width={width} height={height} style={{ left: x, top: y, ...style }}>
      <Shot {...shot} width={width - bezel * 2} height={height - bezel * 2} />
    </PhoneFrame>
  );
};

type HeadlineProps = {
  lines: string[];
  size: number;
  maxWidth: number;
  /** Text (a whole line or its tail) that gets the pink underline. */
  underline?: string;
  /** Lines from this index on are pink (the brand's secondary voice). */
  pinkFrom?: number;
  lineHeight?: number;
  style?: React.CSSProperties;
};

/** Static headline in the video's voice: heavy grotesk, lime with a soft glow, pink keyword underline. */
export const Headline: React.FC<HeadlineProps> = ({ lines, size, maxWidth, underline, pinkFrom, lineHeight = 0.98, style }) => {
  const fs = Math.min(...lines.map((l) => fitSize(l, size, maxWidth, 700)));
  return (
    <div style={{ position: 'absolute', fontFamily: brand.fonts.display, fontWeight: 700, fontSize: fs, lineHeight, letterSpacing: '-0.035em', ...style }}>
      {lines.map((line, i) => {
        const pink = pinkFrom !== undefined && i >= pinkFrom;
        const color = pink ? C.pink : C.lime;
        const glow = pink ? C.pinkGlow : C.limeGlow;
        const at = underline ? line.lastIndexOf(underline) : -1;
        return (
          <div key={i} style={{ color, textShadow: `0 0 ${fs * 0.22}px ${glow}`, whiteSpace: 'nowrap' }}>
            {at < 0 ? (
              line
            ) : (
              <>
                {line.slice(0, at)}
                <span style={{ position: 'relative', display: 'inline-block' }}>
                  {underline}
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: fs * 0.12,
                      bottom: -fs * 0.04,
                      height: Math.max(3, fs * 0.07),
                      background: C.pink,
                      boxShadow: `0 0 ${fs * 0.18}px ${C.pinkGlow}`,
                    }}
                  />
                </span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

/** Small label: pink dash + square technical caps, the video's project tag. */
export const Tag: React.FC<{ text: string; sub?: string; arrow?: boolean; style?: React.CSSProperties }> = ({ text, sub, arrow = true, style }) => (
  <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', gap: 12, ...style }}>
    <span style={{ width: 26, height: 3, background: C.pink, boxShadow: `0 0 8px ${C.pinkGlow}` }} />
    <span style={{ fontFamily: brand.fonts.label, fontWeight: 600, fontSize: 18, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.white, whiteSpace: 'nowrap' }}>
      {text}
      {sub && <span style={{ color: C.lime, marginLeft: 10 }}>{sub}</span>}
      {arrow && <span style={{ color: C.lime, marginLeft: 8 }}>↗</span>}
    </span>
  </div>
);

/** The W of the seal alone, in lime: the discreet brand signature. */
export const WMark: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => {
  // The W occupies x 266–728, y 285–593 of the 1000-unit logo box.
  const box = { x: 266, y: 285, w: 462, h: 308 };
  return (
    <svg width={(size * box.w) / box.h} height={size} viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`} style={{ position: 'absolute', overflow: 'visible', ...style }}>
      <path d={logoPaths.w} fill={C.lime} />
    </svg>
  );
};

export { GALLERY };
