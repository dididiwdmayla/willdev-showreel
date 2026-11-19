// Ingarandi Burger scenes: the bridge from the Chapa and the real purchase on the phone.
import React from 'react';
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { brand } from '../../config/branding';
import { ProjectTag, fitSize } from '../../src/components/Type';
import { ease, mix, ramp } from '../../src/lib/anim';
import { ORDER_STEPS, SIZES, orderTaps, purchase, type Aspect } from '../config';
import { StepRail, Take, TapRing, TestBadge, camera, screenOf, type Box, type Cam, type Pt } from '../parts';
import { C, CAPTIONS, Caption, useMessages } from '../shared';

export const PHONE: Record<Aspect, Box> = {
  '16x9': { x: 1190, y: 40, w: 466, h: 1000 },
  '1x1': { x: 594, y: 64, w: 444, h: 952 },
  '9x16': { x: 170, y: 330, w: 740, h: 1540 },
};
export const MOBILE_CAM: Cam = { cx: 195, cy: 422, zoom: 1 };

export const Bridge: React.FC<{ a: Aspect }> = ({ a }) => {
  const f = useCurrentFrame();
  const r = useMessages();
  const cap = CAPTIONS[a];
  const { width, height } = SIZES[a];
  const fly = ramp(f, 0, 16, ease.out);
  const phone = PHONE[a];
  // The Ingarandi burger (its own transparent asset) flies in, then settles behind the phone.
  const end = { x: phone.x + phone.w * 0.5, y: phone.y + phone.h * 0.55 };
  const mid = a === '9x16' ? { x: width * 0.5, y: height * 0.62 } : { x: width * 0.66, y: height * 0.52 };
  const settle = ramp(f, 21, 14, ease.inOut);
  const pos = { x: mix(width + 500, mid.x, fly), y: mix(height * 0.75, mid.y, fly) };
  const px = mix(pos.x, end.x, settle);
  const py = mix(pos.y, end.y, settle);
  const size = (a === '9x16' ? 860 : a === '1x1' ? 620 : 820) * mix(0.7 + 0.3 * fly, 1.25, settle);
  const opacity = 1 - ramp(f, 30, 10);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${mid.x}px ${mid.y}px, rgba(255,99,33,0.22) 0%, ${C.black} 58%)`, opacity: ramp(f, 0, 8) }} />
      <Img
        src={staticFile('ingarandi/smash-ingarandi.png')}
        style={{
          position: 'absolute',
          left: px - size / 2,
          top: py - (size * 814) / 938 / 2,
          width: size,
          rotate: `${mix(24, -6, fly) + 6 * settle}deg`,
          opacity,
          filter: `drop-shadow(0 40px 60px rgba(0,0,0,0.6)) blur(${settle * 6}px)`,
        }}
      />
      <Caption cap={cap.bridge} text={r.bridge} underline={r.bridgeKey} at={1} out={17} width={width} />
    </AbsoluteFill>
  );
};

/** Cumulative start of each purchase step inside the order scene. */
export const STEP_STARTS = ORDER_STEPS.reduce<number[]>((acc, s, i) => [...acc, i ? acc[i - 1] + ORDER_STEPS[i - 1].frames : 0], []);
export const ORDER_FRAMES = ORDER_STEPS.reduce((n, s) => n + s.frames, 0);

export function stepAt(f: number) {
  let i = 0;
  while (i < ORDER_STEPS.length - 1 && f >= STEP_STARTS[i + 1]) i++;
  return i;
}

/** Global frames (inside the order scene) of every tap, for the overlay and the tap sounds. */
export function orderTapFrames(): number[] {
  const out: number[] = [];
  ORDER_STEPS.forEach((s, i) => {
    if (s.take === 'ingarandi-pedido') {
      const rate = (s.to - s.from) / s.frames;
      for (const t of orderTaps) if (t.frame >= s.from && t.frame <= s.to) out.push(STEP_STARTS[i] + Math.round((t.frame - s.from) / rate));
    }
    if (s.take === 'mp-review') out.push(STEP_STARTS[i] + 9);
  });
  return out;
}

export const PhoneScreen: React.FC<{ a: Aspect; f: number }> = ({ a, f }) => {
  const scr = screenOf(PHONE[a]);
  const box: Box = { x: 0, y: 0, w: scr.w, h: scr.h };
  const i = stepAt(f);
  const s = ORDER_STEPS[i];
  const local = f - STEP_STARTS[i];
  const rate = s.frames ? (s.to - s.from) / s.frames : 1;
  const cm = camera('mobile', box, MOBILE_CAM);
  const taps: React.ReactNode[] = [];
  if (s.take === 'ingarandi-pedido') {
    for (const t of orderTaps) {
      if (t.frame < s.from - 2 || t.frame > s.to) continue;
      const at = (t.frame - s.from) / rate;
      taps.push(<TapRing key={t.frame} at={cm.map(t)} since={local - at} size={cm.unit * 22} />);
    }
  }
  if (s.take === 'mp-review') taps.push(<TapRing key="pay" at={cm.map(purchase.pay)} since={local - 9} size={cm.unit * 22} />);
  return (
    <div style={{ position: 'absolute', left: scr.x, top: scr.y, width: scr.w, height: scr.h, overflow: 'hidden', borderRadius: PHONE[a].w * 0.115 }}>
      {ORDER_STEPS.map((st, k) => (
        <Sequence key={k} from={STEP_STARTS[k]} durationInFrames={k === ORDER_STEPS.length - 1 ? st.frames + 40 : st.frames} layout="none">
          <Take
            src={st.take === 'mp-review' ? 'footage/stills/mp-review.png' : `footage/${st.take}.mp4`}
            still={st.take === 'mp-review'}
            kind="mobile"
            box={box}
            cam={MOBILE_CAM}
            trimBefore={st.from}
            playbackRate={st.frames ? Math.max(1, (st.to - st.from) / st.frames) : 1}
          />
        </Sequence>
      ))}
      {taps}
    </div>
  );
};

/** The current step's name, rolling up when the step changes (one line, masked). */
export const StepLabel: React.FC<{ cap: Caption; width: number; f: number; segments: { start: number; end: number; text: string; color: string }[] }> = ({ cap, width, f, segments }) => {
  const size = Math.min(...segments.map((sg) => fitSize(sg.text, cap.size, cap.max)));
  const box: React.CSSProperties =
    cap.align === 'center' ? { left: 0, width, textAlign: 'center' } : { left: cap.x, width: cap.max + 40 };
  return (
    <div style={{ position: 'absolute', top: cap.y, height: size * 1.22, overflow: 'hidden', ...box }}>
      {segments.map((sg) => {
        if (f < sg.start - 1 || f > sg.end + 9) return null;
        const enter = ramp(f, sg.start, 9, ease.out);
        const exit = ramp(f, sg.end - 3, 9, ease.inOut);
        return (
          <div
            key={sg.start}
            style={{
              position: 'absolute',
              inset: 0,
              translate: `0 ${(1 - enter) * 105 - exit * 105}%`,
              fontFamily: brand.fonts.display,
              fontWeight: 700,
              fontSize: size,
              lineHeight: 1.1,
              letterSpacing: '-0.035em',
              color: sg.color,
              whiteSpace: 'nowrap',
              textShadow: `0 0 ${size * 0.25}px ${sg.color === C.lime ? C.limeGlow : 'rgba(244,244,239,0.35)'}`,
            }}
          >
            {sg.text}
          </div>
        );
      })}
    </div>
  );
};

export const ORDER_TEXT: Record<Aspect, { step: Caption; rail: Pt & { size: number; gap: number } | null; badge: Pt & { size: number; align?: 'left' | 'center' }; tag: Pt }> = {
  '16x9': { step: { x: 110, y: 330, size: 110, max: 1000 }, rail: { x: 114, y: 520, size: 30, gap: 18 }, badge: { x: 112, y: 950, size: 22 }, tag: { x: 112, y: 120 } },
  '1x1': { step: { x: 64, y: 260, size: 64, max: 500 }, rail: { x: 66, y: 400, size: 24, gap: 14 }, badge: { x: 64, y: 978, size: 17 }, tag: { x: 66, y: 96 } },
  '9x16': { step: { x: 0, y: 150, size: 80, max: 960, align: 'center' }, rail: null, badge: { x: 540, y: 1885 - 28, size: 20, align: 'center' }, tag: { x: 330, y: 64 } },
};

export const Order: React.FC<{ a: Aspect }> = ({ a }) => {
  const f = useCurrentFrame();
  const r = useMessages();
  const lay = ORDER_TEXT[a];
  const { width } = SIZES[a];
  const phone = PHONE[a];
  const enter = ramp(f, 0, 12, ease.out);
  const exit = ramp(f, ORDER_FRAMES + 2, 14, ease.inOut);
  const i = stepAt(Math.min(f, ORDER_FRAMES - 1));
  const stepIdx = ORDER_STEPS[i].step;
  // One label per step; it changes with the step, rising like the other lines.
  // The first label waits for the bridge line to leave.
  const labelStarts = ORDER_STEPS.map((s, k) => (k === 0 ? 6 : s.step !== ORDER_STEPS[k - 1].step ? STEP_STARTS[k] : null));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: 1 - exit, scale: `${1 - 0.05 * exit}`, filter: exit > 0 ? `blur(${exit * 8}px)` : undefined }}>
        <div style={{ position: 'absolute', inset: 0, translate: `0 ${(1 - enter) * 80}px`, opacity: enter }}>
          <div style={{ position: 'absolute', left: phone.x, top: phone.y, width: phone.w, height: phone.h, borderRadius: phone.w * 0.15, background: '#07080A', boxShadow: `0 50px 120px rgba(0,0,0,0.7), inset 0 0 0 2px rgba(255,255,255,0.10), 0 0 0 1px rgba(255,255,255,0.05)` }} />
          <PhoneScreen a={a} f={f} />
        </div>
        <StepLabel cap={lay.step} width={width} f={f} segments={labelStarts.flatMap((start, k) => {
          if (start === null) return [];
          const next = labelStarts.findIndex((x, j) => j > k && x !== null);
          const step = ORDER_STEPS[k].step;
          return [{ start, end: next < 0 ? 100000 : (labelStarts[next] as number), text: r.steps[step], color: step === 5 ? C.lime : C.white }];
        })} />
        {lay.rail && <StepRail steps={r.steps} current={stepIdx} x={lay.rail.x} y={lay.rail.y} size={lay.rail.size} gap={lay.rail.gap} opacity={ramp(f, 6, 10)} />}
        <TestBadge text={r.testBadge} x={lay.badge.x} y={lay.badge.y} size={lay.badge.size} align={lay.badge.align} opacity={ramp(f, 10, 10)} />
        <ProjectTag label={r.ingarandiLabel} kind={r.ingarandiKind} at={-8} style={{ left: lay.tag.x, top: lay.tag.y }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

