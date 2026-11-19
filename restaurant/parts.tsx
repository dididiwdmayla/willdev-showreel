import React from 'react';
import { Video } from '@remotion/media';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { brand } from '../config/branding';
import { PhoneFrame } from '../src/components/Frames';
import { Logo } from '../src/components/Logo';
import { ease, ramp } from '../src/lib/anim';
import { TAKES } from './config';

const C = brand.colors;

export type Box = { x: number; y: number; w: number; h: number };
export type Pt = { x: number; y: number };
/** Camera on a take: the CSS point (of the captured viewport) to keep centred, and zoom over "cover". */
export type Cam = { cx: number; cy: number; zoom: number };
export type TakeKind = keyof typeof TAKES;

/** Where a take sits inside a box for a camera; `map` turns a CSS point of the page into output pixels. */
export function camera(kind: TakeKind, box: Box, cam: Cam) {
  const t = TAKES[kind];
  const s = Math.max(box.w / t.width, box.h / t.height) * cam.zoom;
  const w = t.width * s;
  const h = t.height * s;
  const fx = cam.cx * t.css * s;
  const fy = cam.cy * t.css * s;
  const left = Math.min(0, Math.max(box.w - w, box.w / 2 - fx));
  const top = Math.min(0, Math.max(box.h - h, box.h / 2 - fy));
  return {
    left,
    top,
    w,
    h,
    map: (p: Pt): Pt => ({ x: box.x + left + p.x * t.css * s, y: box.y + top + p.y * t.css * s }),
    /** Output pixels per CSS pixel. */
    unit: t.css * s,
  };
}

type TakeProps = {
  src: string;
  kind: TakeKind;
  box: Box;
  cam: Cam;
  trimBefore?: number;
  playbackRate?: number;
  radius?: number;
  still?: boolean;
  style?: React.CSSProperties;
};

/** A captured take (video or still) framed by a camera inside a box. */
export const Take: React.FC<TakeProps> = ({ src, kind, box, cam, trimBefore = 0, playbackRate = 1, radius = 0, still, style }) => {
  const c = camera(kind, box, cam);
  return (
    <div style={{ position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h, overflow: 'hidden', borderRadius: radius, ...style }}>
      <div style={{ position: 'absolute', left: c.left, top: c.top, width: c.w, height: c.h }}>
        {still ? (
          <Img src={staticFile(src)} style={{ width: '100%', height: '100%' }} />
        ) : (
          <Video src={staticFile(src)} trimBefore={trimBefore} playbackRate={playbackRate} muted style={{ width: '100%', height: '100%' }} />
        )}
      </div>
    </div>
  );
};

/** Desktop pointer, drawn on top of the take (screenshots carry no OS cursor). */
export const Cursor: React.FC<{ at: Pt | null; size?: number; opacity?: number }> = ({ at, size = 34, opacity = 1 }) =>
  at ? (
    <svg
      width={size}
      height={size * 1.45}
      viewBox="0 0 24 35"
      style={{ position: 'absolute', left: at.x - size * 0.08, top: at.y - size * 0.06, opacity, filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.55))' }}
    >
      <path d="M2 2 L2 27 L8.5 21 L13 32 L17.5 30 L13 19.5 L22 19.5 Z" fill="#fff" stroke="#111" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ) : null;

/** Touch feedback: a soft dot that presses, then a lime ring that expands. Born `since` frames ago. */
export const TapRing: React.FC<{ at: Pt; since: number; size?: number }> = ({ at, since, size = 70 }) => {
  if (since < -4 || since > 18) return null;
  const press = since < 0 ? ramp(since, -4, 4, ease.out) : 1 - ramp(since, 2, 8, ease.in);
  const ring = ramp(since, 0, 16, ease.out);
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: at.x - size / 2,
          top: at.y - size / 2,
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.55)',
          boxShadow: '0 0 0 2px rgba(0,0,0,0.25)',
          opacity: press * 0.9,
          scale: `${0.7 + 0.3 * press}`,
        }}
      />
      {since >= 0 && (
        <div
          style={{
            position: 'absolute',
            left: at.x - size,
            top: at.y - size,
            width: size * 2,
            height: size * 2,
            borderRadius: '50%',
            border: `${Math.max(2, size * 0.06)}px solid ${C.lime}`,
            opacity: 1 - ring,
            scale: `${0.35 + 0.65 * ring}`,
            boxShadow: `0 0 18px ${C.limeGlow}`,
          }}
        />
      )}
    </>
  );
};

/**
 * Transition borrowed from the site: the next shot opens inside a growing
 * circle, the same gesture as the menu lens, with a lime rim on its edge.
 */
export const LensWipe: React.FC<{ center: Pt; width: number; height: number; duration?: number; children: React.ReactNode }> = ({
  center,
  width,
  height,
  duration = 12,
  children,
}) => {
  const frame = useCurrentFrame();
  const t = ramp(frame, 0, duration, ease.inOut);
  const far = Math.hypot(Math.max(center.x, width - center.x), Math.max(center.y, height - center.y));
  const r = far * t + 1;
  const rim = 1 - ramp(frame, duration - 4, 6, ease.in);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: t >= 1 ? undefined : `circle(${r}px at ${center.x}px ${center.y}px)` }}>{children}</AbsoluteFill>
      {t < 1 && (
        <svg width={width} height={height} style={{ position: 'absolute', inset: 0, opacity: rim }}>
          <circle cx={center.x} cy={center.y} r={r} fill="none" stroke={C.lime} strokeWidth={6} style={{ filter: `drop-shadow(0 0 12px ${C.limeGlow})` }} />
        </svg>
      )}
    </AbsoluteFill>
  );
};

/** A phone whose screen shows a take or a still, with the camera on the whole 390-wide viewport. */
export const Phone: React.FC<{ box: Box; children?: React.ReactNode; style?: React.CSSProperties }> = ({ box, children, style }) => (
  <PhoneFrame width={box.w} height={box.h} style={{ left: box.x, top: box.y, ...style }}>
    {children}
  </PhoneFrame>
);

/** Screen box inside a phone frame (same bezel rule as PhoneFrame). */
export function screenOf(box: Box): Box {
  const bezel = Math.round(box.w * 0.04);
  return { x: box.x + bezel, y: box.y + bezel, w: box.w - bezel * 2, h: box.h - bezel * 2 };
}

/** Dark gradient behind captions so text never fights the site underneath. */
export const Shade: React.FC<{ from: 'top' | 'bottom' | 'left'; size: number; strength?: number }> = ({ from, size, strength = 0.85 }) => {
  const dir = from === 'top' ? 'to bottom' : from === 'bottom' ? 'to top' : 'to right';
  const pos: React.CSSProperties =
    from === 'top' ? { top: 0, left: 0, right: 0, height: size } : from === 'bottom' ? { bottom: 0, left: 0, right: 0, height: size } : { top: 0, bottom: 0, left: 0, width: size };
  return <div style={{ position: 'absolute', ...pos, background: `linear-gradient(${dir}, rgba(3,1,2,${strength}) 0%, rgba(3,1,2,${strength * 0.55}) 45%, rgba(3,1,2,0) 100%)` }} />;
};

/** Small honest label: the payment ran on Mercado Pago's test environment. */
export const TestBadge: React.FC<{ text: string; x: number; y: number; size?: number; align?: 'left' | 'center'; opacity?: number }> = ({
  text,
  x,
  y,
  size = 22,
  align = 'left',
  opacity = 1,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      translate: align === 'center' ? '-50% 0' : undefined,
      display: 'flex',
      alignItems: 'center',
      gap: size * 0.5,
      padding: `${size * 0.45}px ${size * 0.8}px`,
      borderRadius: size * 2,
      border: `1px solid rgba(244,244,239,0.28)`,
      background: 'rgba(13,16,21,0.82)',
      fontFamily: brand.fonts.label,
      fontWeight: 600,
      fontSize: size,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: C.white,
      whiteSpace: 'nowrap',
      opacity,
    }}
  >
    <svg width={size * 0.9} height={size * 0.9} viewBox="0 0 24 24">
      <path d="M7 11V8a5 5 0 0 1 10 0v3" fill="none" stroke={C.lime} strokeWidth="2.4" />
      <rect x="4.5" y="11" width="15" height="10" rx="2.5" fill={C.lime} />
    </svg>
    {text}
  </div>
);

/** The steps of the purchase: done ones dim lime, the current one bright, the rest grey. */
export const StepRail: React.FC<{ steps: readonly string[]; current: number; x: number; y: number; size?: number; gap?: number; opacity?: number }> = ({
  steps,
  current,
  x,
  y,
  size = 28,
  gap = 16,
  opacity = 1,
}) => (
  <div style={{ position: 'absolute', left: x, top: y, display: 'flex', flexDirection: 'column', gap, opacity }}>
    {steps.map((s, i) => {
      const state = i < current ? 'done' : i === current ? 'now' : 'next';
      return (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: size * 0.6, fontFamily: brand.fonts.label, fontWeight: 600, fontSize: size, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          <div
            style={{
              width: size * 0.62,
              height: size * 0.62,
              borderRadius: '50%',
              border: `2px solid ${state === 'next' ? C.gray : C.lime}`,
              background: state === 'next' ? 'transparent' : state === 'now' ? C.lime : 'rgba(194,247,12,0.35)',
              boxShadow: state === 'now' ? `0 0 14px ${C.limeGlow}` : undefined,
            }}
          />
          <span style={{ color: state === 'now' ? C.white : state === 'done' ? 'rgba(194,247,12,0.75)' : C.gray }}>{s}</span>
        </div>
      );
    })}
  </div>
);

/**
 * The WillDev coin: the brand seal struck on a lime-metal coin. `angle` is the
 * flip around the vertical axis (degrees); the rim shows its thickness edge-on.
 */
export const Coin: React.FC<{ size: number; angle: number; arc?: number; glow?: number; style?: React.CSSProperties }> = ({ size, angle, arc = 1, glow = 0.5, style }) => {
  const rad = (angle * Math.PI) / 180;
  const c = Math.cos(rad);
  const sx = Math.max(0.02, Math.abs(c));
  const thick = size * 0.075;
  const slices = 14;
  const front = c >= 0;
  const shine = ((angle % 360) + 360) % 360;
  const id = React.useId().replace(/:/g, '');
  return (
    <div style={{ position: 'absolute', width: size, height: size, ...style }}>
      <svg width={size} height={size} viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} style={{ position: 'absolute', overflow: 'visible' }}>
        <defs>
          <linearGradient id={`rim-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E9FF7A" />
            <stop offset="0.5" stopColor="#A9D800" />
            <stop offset="1" stopColor="#5E7A00" />
          </linearGradient>
          <linearGradient id={`face-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F2FFB0" />
            <stop offset="0.45" stopColor={C.lime} />
            <stop offset="1" stopColor="#6E8F00" />
          </linearGradient>
          <linearGradient id={`shine-${id}`} x1="0" y1="0" x2="1" y2="0" gradientTransform={`translate(${(shine / 360) * 2 - 1} 0)`}>
            <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="0.65" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Edge: the coin's thickness, visible as it turns. */}
        {Array.from({ length: slices }, (_, k) => {
          const off = (k / (slices - 1) - 0.5) * thick * Math.sin(rad);
          return <ellipse key={k} cx={off} cy={0} rx={(size / 2) * sx} ry={size / 2} fill={`url(#rim-${id})`} />;
        })}
        <g transform={`translate(${(thick / 2) * Math.sin(rad) * (front ? -1 : 1)} 0) scale(${sx} 1)`}>
          <circle r={size / 2} fill={`url(#face-${id})`} />
          <circle r={size * 0.455} fill={C.black} />
          <circle r={size / 2} fill={`url(#shine-${id})`} opacity={0.8} />
        </g>
      </svg>
      {/* The seal on the face (front: full logo; back: the W). */}
      <div style={{ position: 'absolute', inset: 0, scale: `${sx} 1`, translate: `${(thick / 2) * Math.sin(rad) * (front ? -1 : 1)}px 0` }}>
        <Logo size={size} rings={1} disc={0} mark={1} word={front ? 1 : 0} rule={front ? 1 : 0} arc={arc} glow={glow} style={{ position: 'absolute', inset: 0, scale: '0.93' }} />
      </div>
      {glow > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: -size * 0.25,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${C.limeGlow} 0%, rgba(194,247,12,0) 62%)`,
            opacity: glow * 0.6,
            zIndex: -1,
          }}
        />
      )}
    </div>
  );
};
