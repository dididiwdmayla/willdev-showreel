import React from 'react';
import { Audio } from '@remotion/media';
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { z } from 'zod';
import { brand } from '../config/branding';
import { locales, type LocaleId } from '../locales';
import { Line, ProjectTag, fitSize } from '../src/components/Type';
import { ease, mix, ramp } from '../src/lib/anim';
import '../src/fonts';
import {
  DURATION,
  FPS,
  MUSIC_FADE_FROM,
  MUSIC_START,
  ORDER_STEPS,
  PAID_CHECK,
  SCENES,
  SIZES,
  desktopMeta,
  mobileMeta,
  orderTaps,
  purchase,
  type Aspect,
  type Variant,
} from './config';
import { Coin, Cursor, LensWipe, Shade, StepRail, Take, TapRing, TestBadge, camera, screenOf, type Box, type Cam, type Pt } from './parts';

const C = brand.colors;

export const restaurantSchema = z.object({
  locale: z.enum(Object.keys(locales) as [LocaleId, ...LocaleId[]]),
  aspect: z.enum(['16x9', '1x1', '9x16']),
  mute: z.boolean(),
});
export type RestaurantProps = z.infer<typeof restaurantSchema>;

/** Proper names of the four variants (they are names, so they stay as they are in every language). */
const NAMES: Record<Variant, string> = { chapa: 'Chapa', balcao: 'Balcão', sala: 'Sala', praca: 'Praça' };

const desktop = (a: Aspect) => a !== '9x16';
/** Where the Chapa takes play: full bleed in 16:9; a 16:10 window in 1:1; a tall window under a caption band in 9:16. */
const CHAPA_BOX: Record<Aspect, Box> = {
  '16x9': { x: 0, y: 0, w: 1920, h: 1080 },
  '1x1': { x: 0, y: 90, w: 1080, h: 675 },
  '9x16': { x: 0, y: 400, w: 1080, h: 1520 },
};

// ─── Shots of the Chapa takes ────────────────────────────────────────────────

/** Opening + lens (0–107): one continuous take, the camera travels from the poster to the burger. */
function openingCam(a: Aspect, f: number): Cam {
  if (desktop(a)) {
    const m = desktopMeta('chapa');
    const push = ramp(f, 0, 46, ease.out);
    const go = ramp(f, 46, 30, ease.inOut);
    const drift = ramp(f, 76, 31, ease.inOut);
    const target = a === '16x9' ? { cx: m.A.x + 70, cy: m.A.y + 4, zoom: 2.1 } : { cx: m.A.x + 46, cy: m.A.y + 8, zoom: 1.95 };
    return {
      cx: mix(640, target.cx, go),
      cy: mix(400, target.cy, go),
      zoom: mix(1 + 0.05 * push, target.zoom, go) + 0.1 * drift,
    };
  }
  const m = mobileMeta('chapa');
  const go = ramp(f, 46, 24, ease.inOut);
  const tapA = m.pointer[0];
  return { cx: 195, cy: mix(422, tapA.y, go * 0.5), zoom: 1 + 0.04 * ramp(f, 0, 46, ease.out) + 0.08 * go };
}

/** Variant shots (desktop from the frame the cursor heads for burger A; mobile from just before the tap). */
const VARIANT_TRIM = { desktop: 58, mobile: 46 };

/** Per variant: how close the camera goes (the praça mural and the sala photos are already large). */
const VARIANT_ZOOM: Record<Variant, { d16: number; d1: number; dx: number }> = {
  chapa: { d16: 1.25, d1: 1.5, dx: 220 },
  balcao: { d16: 1.3, d1: 1.55, dx: 260 },
  sala: { d16: 1.06, d1: 1.25, dx: 200 },
  praca: { d16: 1.0, d1: 1.15, dx: 160 },
};

function variantCam(a: Aspect, v: Variant, f: number): Cam {
  const t = ramp(f, 0, 40, ease.out);
  if (desktop(a)) {
    const m = desktopMeta(v);
    const z = VARIANT_ZOOM[v];
    return a === '16x9'
      ? { cx: mix(640, m.A.x + z.dx, 0.55), cy: mix(400, m.A.y, 0.5), zoom: z.d16 + 0.08 * t }
      : { cx: m.A.x + z.dx * 0.5, cy: m.A.y + 20, zoom: z.d1 + 0.08 * t };
  }
  const m = mobileMeta(v);
  return { cx: 195, cy: mix(422, m.pointer[0].y, 0.3), zoom: 1.02 + 0.05 * t };
}

/** Output position of the lens (cursor or finger) in a Chapa shot, for the next lens wipe. */
function lensPoint(a: Aspect, v: Variant, clipFrame: number, cam: Cam, box: Box): Pt {
  if (desktop(a)) {
    const p = desktopMeta(v).pointer[Math.min(clipFrame, desktopMeta(v).pointer.length - 1)];
    const c = camera('desktop', box, cam);
    return p ? c.map({ x: p[0], y: p[1] }) : { x: box.w / 2, y: box.h / 2 };
  }
  const m = mobileMeta(v);
  const tap = [...m.pointer].reverse().find((t) => t.frame <= clipFrame) ?? m.pointer[0];
  return camera('mobile', box, cam).map(tap);
}

const ChapaShot: React.FC<{ a: Aspect; v: Variant; trim: number; cam: (f: number) => Cam; box?: Box; showPointer?: boolean }> = ({ a, v, trim, cam, box, showPointer = true }) => {
  const f = useCurrentFrame();
  const b = box ?? CHAPA_BOX[a];
  const kind = desktop(a) ? 'desktop' : 'mobile';
  const c = cam(f);
  const clipFrame = trim + f;
  const cm = camera(kind, b, c);
  let pointer: React.ReactNode = null;
  if (showPointer && desktop(a)) {
    const p = desktopMeta(v).pointer[clipFrame];
    pointer = <Cursor at={p ? cm.map({ x: p[0], y: p[1] }) : null} size={Math.max(22, cm.unit * 15)} opacity={ramp(clipFrame, 56, 6)} />;
  } else if (showPointer) {
    pointer = mobileMeta(v).pointer.map((t) => <TapRing key={t.frame} at={cm.map(t)} since={clipFrame - t.frame} size={Math.max(46, cm.unit * 26)} />);
  }
  return (
    <>
      <Take src={`footage/chapa-${v}-${desktop(a) ? 'd' : 'm'}.mp4`} kind={kind} box={b} cam={c} trimBefore={trim} />
      {pointer}
    </>
  );
};

// ─── Captions ────────────────────────────────────────────────────────────────

type Caption = { x: number; y: number; size: number; max: number; align?: 'left' | 'center' };
const CAPTIONS: Record<Aspect, { hook: Caption; tag: Pt; title: Caption; variantTag: Pt; bridge: Caption; bridgeTag: Pt }> = {
  '16x9': {
    hook: { x: 110, y: 800, size: 92, max: 1500 },
    tag: { x: 112, y: 936 },
    title: { x: 110, y: 838, size: 70, max: 1500 },
    variantTag: { x: 112, y: 946 },
    bridge: { x: 110, y: 430, size: 96, max: 900 },
    bridgeTag: { x: 112, y: 560 },
  },
  '1x1': {
    hook: { x: 64, y: 806, size: 60, max: 950 },
    tag: { x: 66, y: 918 },
    title: { x: 64, y: 806, size: 56, max: 950 },
    variantTag: { x: 66, y: 918 },
    bridge: { x: 64, y: 180, size: 72, max: 950 },
    bridgeTag: { x: 66, y: 290 },
  },
  '9x16': {
    hook: { x: 64, y: 150, size: 76, max: 960 },
    tag: { x: 66, y: 282 },
    title: { x: 64, y: 150, size: 70, max: 960 },
    variantTag: { x: 66, y: 282 },
    bridge: { x: 0, y: 470, size: 84, max: 960, align: 'center' },
    bridgeTag: { x: 330, y: 600 },
  },
};

const Caption: React.FC<{ cap: Caption; text: string; at: number; out?: number; underline?: string; color?: string; width: number }> = ({ cap, text, at, out, underline, color, width }) => (
  <div style={{ position: 'absolute', left: cap.align === 'center' ? 0 : cap.x, top: cap.y, width: cap.align === 'center' ? width : undefined }}>
    <Line text={text} at={at} out={out} size={cap.size} maxWidth={cap.max} underline={underline} color={color} align={cap.align ?? 'left'} />
  </div>
);

// ─── Scenes ──────────────────────────────────────────────────────────────────

const Opening: React.FC<{ a: Aspect }> = ({ a }) => {
  const f = useCurrentFrame();
  const r = useMessages();
  const cap = CAPTIONS[a];
  const { width } = SIZES[a];
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <ChapaShot a={a} v="chapa" trim={0} cam={(ff) => openingCam(a, ff)} />
      <AbsoluteFill style={{ opacity: ramp(f, 4, 14) * (1 - ramp(f, 96, 10)) }}>
        {a === '16x9' && <Shade from="bottom" size={480} />}
      </AbsoluteFill>
      <Caption cap={cap.hook} text={r.hook} underline={r.hookKey} at={8} out={98} width={width} />
      <ProjectTag label={r.chapaLabel} kind={r.chapaKind} at={60} out={98} style={{ left: cap.tag.x, top: cap.tag.y }} />
    </AbsoluteFill>
  );
};

const VariantShot: React.FC<{ a: Aspect; v: Variant; center: Pt; label: boolean }> = ({ a, v, center, label }) => {
  const r = useMessages();
  const cap = CAPTIONS[a];
  const { width, height } = SIZES[a];
  const trim = desktop(a) ? VARIANT_TRIM.desktop : VARIANT_TRIM.mobile;
  return (
    <LensWipe center={center} width={width} height={height}>
      <AbsoluteFill style={{ background: C.black }}>
        <ChapaShot a={a} v={v} trim={trim} cam={(ff) => variantCam(a, v, ff)} />
        {a === '16x9' && <Shade from="bottom" size={470} strength={0.92} />}
        {label && <ProjectTag label={NAMES[v]} kind={r.variants[v]} at={6} out={30} style={{ left: cap.variantTag.x, top: cap.variantTag.y }} />}
      </AbsoluteFill>
    </LensWipe>
  );
};

const GRID: Record<Aspect, Box[]> = {
  '16x9': [
    { x: 24, y: 24, w: 924, h: 384 },
    { x: 972, y: 24, w: 924, h: 384 },
    { x: 24, y: 420, w: 924, h: 384 },
    { x: 972, y: 420, w: 924, h: 384 },
  ],
  '1x1': [
    { x: 20, y: 24, w: 512, h: 372 },
    { x: 548, y: 24, w: 512, h: 372 },
    { x: 20, y: 408, w: 512, h: 372 },
    { x: 548, y: 408, w: 512, h: 372 },
  ],
  '9x16': [
    { x: 24, y: 400, w: 508, h: 752 },
    { x: 548, y: 400, w: 508, h: 752 },
    { x: 24, y: 1166, w: 508, h: 752 },
    { x: 548, y: 1166, w: 508, h: 752 },
  ],
};

const Grid: React.FC<{ a: Aspect; center: Pt }> = ({ a, center }) => {
  const f = useCurrentFrame();
  const { width, height } = SIZES[a];
  const out = ramp(f, 31, 10, ease.in);
  return (
    <LensWipe center={center} width={width} height={height} duration={11}>
      <AbsoluteFill style={{ background: C.black, opacity: 1 - out, scale: `${1 - 0.06 * out}` }}>
        {(['chapa', 'balcao', 'sala', 'praca'] as Variant[]).map((v, i) => {
          const box = GRID[a][i];
          const t = ramp(f, 2 + i * 2, 12, ease.out);
          const dm = desktopMeta(v);
          const cam: Cam = desktop(a) ? { cx: dm.A.x + 260, cy: dm.A.y + 30, zoom: a === '16x9' ? 1.12 : 1.35 } : { cx: 195, cy: mobileMeta(v).pointer[1].y, zoom: 1.0 };
          return (
            <div key={v} style={{ position: 'absolute', inset: 0, opacity: t, scale: `${0.94 + 0.06 * t}`, transformOrigin: `${box.x + box.w / 2}px ${box.y + box.h / 2}px` }}>
              <ChapaShot a={a} v={v} trim={desktop(a) ? 104 : 92} box={box} cam={() => cam} showPointer={false} />
              <div style={{ position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h, borderRadius: 14, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)' }} />
              <div
                style={{
                  position: 'absolute',
                  left: box.x + 16,
                  top: box.y + box.h - 52,
                  padding: '6px 14px',
                  borderRadius: 6,
                  background: 'rgba(3,1,2,0.82)',
                  fontFamily: brand.fonts.label,
                  fontWeight: 600,
                  fontSize: a === '9x16' ? 26 : 24,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: C.lime,
                }}
              >
                {NAMES[v]}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </LensWipe>
  );
};

/** Title over the variants and the grid: "Four layouts. One menu." */
const VariantsTitle: React.FC<{ a: Aspect }> = ({ a }) => {
  const r = useMessages();
  return <Caption cap={CAPTIONS[a].title} text={r.variantsTitle} at={4} out={118} width={SIZES[a].width} />;
};

// ─── Ingarandi ───────────────────────────────────────────────────────────────

const PHONE: Record<Aspect, Box> = {
  '16x9': { x: 1190, y: 40, w: 466, h: 1000 },
  '1x1': { x: 594, y: 64, w: 444, h: 952 },
  '9x16': { x: 170, y: 330, w: 740, h: 1540 },
};
const MOBILE_CAM: Cam = { cx: 195, cy: 422, zoom: 1 };

const Bridge: React.FC<{ a: Aspect }> = ({ a }) => {
  const f = useCurrentFrame();
  const r = useMessages();
  const cap = CAPTIONS[a];
  const { width, height } = SIZES[a];
  const fly = ramp(f, 0, 16, ease.out);
  const phone = PHONE[a];
  // The Ingarandi burger (its own transparent asset) flies in, then settles behind the phone.
  const end = { x: phone.x + phone.w * 0.5, y: phone.y + phone.h * 0.55 };
  const mid = a === '9x16' ? { x: width * 0.5, y: height * 0.62 } : { x: width * 0.66, y: height * 0.52 };
  const settle = ramp(f, 15, 14, ease.inOut);
  const pos = { x: mix(width + 500, mid.x, fly), y: mix(height * 0.75, mid.y, fly) };
  const px = mix(pos.x, end.x, settle);
  const py = mix(pos.y, end.y, settle);
  const size = (a === '9x16' ? 860 : a === '1x1' ? 620 : 820) * mix(0.7 + 0.3 * fly, 1.25, settle);
  const opacity = 1 - ramp(f, 22, 10);
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
      <Caption cap={cap.bridge} text={r.bridge} underline={r.bridgeKey} at={1} out={11} width={width} />
    </AbsoluteFill>
  );
};

/** Cumulative start of each purchase step inside the order scene. */
const STEP_STARTS = ORDER_STEPS.reduce<number[]>((acc, s, i) => [...acc, i ? acc[i - 1] + ORDER_STEPS[i - 1].frames : 0], []);
export const ORDER_FRAMES = ORDER_STEPS.reduce((n, s) => n + s.frames, 0);

function stepAt(f: number) {
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

const PhoneScreen: React.FC<{ a: Aspect; f: number }> = ({ a, f }) => {
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
const StepLabel: React.FC<{ cap: Caption; width: number; f: number; segments: { start: number; end: number; text: string; color: string }[] }> = ({ cap, width, f, segments }) => {
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

const ORDER_TEXT: Record<Aspect, { step: Caption; rail: Pt & { size: number; gap: number } | null; badge: Pt & { size: number; align?: 'left' | 'center' }; tag: Pt }> = {
  '16x9': { step: { x: 110, y: 330, size: 110, max: 1000 }, rail: { x: 114, y: 520, size: 30, gap: 18 }, badge: { x: 112, y: 950, size: 22 }, tag: { x: 112, y: 120 } },
  '1x1': { step: { x: 64, y: 260, size: 64, max: 500 }, rail: { x: 66, y: 400, size: 24, gap: 14 }, badge: { x: 64, y: 978, size: 17 }, tag: { x: 66, y: 96 } },
  '9x16': { step: { x: 0, y: 150, size: 80, max: 960, align: 'center' }, rail: null, badge: { x: 540, y: 1885 - 28, size: 20, align: 'center' }, tag: { x: 330, y: 64 } },
};

const Order: React.FC<{ a: Aspect }> = ({ a }) => {
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
  const labelStarts = ORDER_STEPS.map((s, k) => (k === 0 || s.step !== ORDER_STEPS[k - 1].step ? STEP_STARTS[k] : null));
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

// ─── Closing: the coin is struck from the "Pago!" check ──────────────────────

const COIN: Record<Aspect, { c: Pt; size: number; line: Caption; cta: Caption }> = {
  '16x9': { c: { x: 640, y: 540 }, size: 500, line: { x: 1000, y: 410, size: 104, max: 840 }, cta: { x: 1004, y: 560, size: 44, max: 820 } },
  '1x1': { c: { x: 540, y: 410 }, size: 430, line: { x: 0, y: 690, size: 76, max: 980, align: 'center' }, cta: { x: 0, y: 800, size: 38, max: 960, align: 'center' } },
  '9x16': { c: { x: 540, y: 760 }, size: 620, line: { x: 0, y: 1190, size: 92, max: 980, align: 'center' }, cta: { x: 0, y: 1330, size: 44, max: 960, align: 'center' } },
};

const Closing: React.FC<{ a: Aspect }> = ({ a }) => {
  const f = useCurrentFrame();
  const r = useMessages();
  const k = COIN[a];
  const { width } = SIZES[a];
  const scr = screenOf(PHONE[a]);
  const cm = camera('mobile', { x: scr.x, y: scr.y, w: scr.w, h: scr.h }, MOBILE_CAM);
  const birth = cm.map(PAID_CHECK);
  const fly = ramp(f, 2, 22, ease.inOut);
  const spin = ramp(f, 2, 26, ease.out);
  const land = ramp(f, 24, 10, ease.out);
  const size = mix(cm.unit * 18, k.size, ramp(f, 0, 24, ease.inOut));
  const cx = mix(birth.x, k.c.x, fly);
  const cy = mix(birth.y, k.c.y, fly) - Math.sin(fly * Math.PI) * (a === '9x16' ? 120 : 90);
  const angle = 1080 * spin;
  const arc = ramp(f, 28, 22, ease.inOut);
  const glow = 0.25 + 0.6 * (1 - ramp(f, 28, 20)) * land;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${k.c.x}px ${k.c.y}px, rgba(194,247,12,${0.16 * land}) 0%, rgba(3,1,2,0) 50%)` }} />
      <Coin size={size} angle={angle} arc={arc} glow={glow} style={{ left: cx - size / 2, top: cy - size / 2, scale: `${1 + 0.04 * Math.sin(land * Math.PI)}` }} />
      <Caption cap={k.line} text={r.closing} underline={r.closingKey} at={30} width={width} />
      <Caption cap={k.cta} text={r.cta} at={38} color={C.white} width={width} />
    </AbsoluteFill>
  );
};

// ─── Sound ───────────────────────────────────────────────────────────────────

type Hit = { at: number; sfx: string; gain: number };

function soundtrack(a: Aspect): Hit[] {
  const lensOpen = (v: Variant, trim: number) => {
    if (desktop(a)) {
      const ptr = desktopMeta(v).pointer;
      const enter = ptr.findIndex((p, i) => i >= trim && p !== null && Math.abs(p[0] - desktopMeta(v).A.x) < 60 && Math.abs(p[1] - desktopMeta(v).A.y) < 60);
      return enter >= 0 ? enter - trim : 12;
    }
    return mobileMeta(v).pointer[0].frame - trim;
  };
  const hits: Hit[] = [
    { at: 0, sfx: 'impact', gain: 0.55 },
    { at: 40, sfx: 'whoosh', gain: 0.35 },
    { at: lensOpen('chapa', 0), sfx: 'lens', gain: 0.5 },
  ];
  if (!desktop(a)) hits.push({ at: mobileMeta('chapa').pointer[1].frame, sfx: 'lens', gain: 0.4 });
  const trim = desktop(a) ? VARIANT_TRIM.desktop : VARIANT_TRIM.mobile;
  for (const v of ['balcao', 'sala', 'praca'] as const) {
    hits.push({ at: SCENES[v].from - 2, sfx: 'swipe', gain: 0.45 });
    const lo = lensOpen(v, trim);
    if (lo > 0 && lo < 30) hits.push({ at: SCENES[v].from + lo, sfx: 'lens', gain: 0.3 });
  }
  hits.push({ at: SCENES.grid.from - 2, sfx: 'whoosh', gain: 0.4 });
  hits.push({ at: SCENES.bridge.from - 3, sfx: 'whoosh', gain: 0.55 });
  for (const t of orderTapFrames()) hits.push({ at: SCENES.order.from + t, sfx: 'tap', gain: 0.6 });
  const paid = STEP_STARTS[ORDER_STEPS.length - 1];
  hits.push({ at: SCENES.order.from + paid, sfx: 'confirm', gain: 0.6 });
  hits.push({ at: SCENES.coin.from + 2, sfx: 'spin', gain: 0.45 });
  hits.push({ at: SCENES.coin.from + 24, sfx: 'coin', gain: 0.75 });
  hits.push({ at: SCENES.coin.from + 30, sfx: 'impact', gain: 0.3 });
  return hits;
}

// ─── Composition ─────────────────────────────────────────────────────────────

const MessagesContext = React.createContext(locales.en.restaurant);
const useMessages = () => React.useContext(MessagesContext);

export const Restaurant: React.FC<RestaurantProps> = ({ locale, aspect: a, mute }) => {
  const S = SCENES;
  const transitionPoint = (prev: Variant, scene: { from: number; to: number }, prevFrom: number, trimmed: boolean): Pt => {
    const f = scene.from - prevFrom;
    if (!trimmed) return lensPoint(a, prev, f, openingCam(a, f), CHAPA_BOX[a]);
    const trim = desktop(a) ? VARIANT_TRIM.desktop : VARIANT_TRIM.mobile;
    return lensPoint(a, prev, trim + f, variantCam(a, prev, f), CHAPA_BOX[a]);
  };
  const toBalcao = transitionPoint('chapa', S.balcao, 0, false);
  const toSala = transitionPoint('balcao', S.sala, S.balcao.from, true);
  const toPraca = transitionPoint('sala', S.praca, S.sala.from, true);
  const toGrid = transitionPoint('praca', S.grid, S.praca.from, true);
  const OVER = 14; // each shot keeps playing under the next one's lens wipe
  return (
    <MessagesContext.Provider value={locales[locale].restaurant}>
      <AbsoluteFill style={{ background: C.black, overflow: 'hidden' }}>
        <Sequence from={S.hero.from} durationInFrames={S.lens.to - S.hero.from + OVER}>
          <Opening a={a} />
        </Sequence>
        <Sequence from={S.balcao.from} durationInFrames={S.balcao.to - S.balcao.from + OVER}>
          <VariantShot a={a} v="balcao" center={toBalcao} label />
        </Sequence>
        <Sequence from={S.sala.from} durationInFrames={S.sala.to - S.sala.from + OVER}>
          <VariantShot a={a} v="sala" center={toSala} label />
        </Sequence>
        <Sequence from={S.praca.from} durationInFrames={S.praca.to - S.praca.from + OVER}>
          <VariantShot a={a} v="praca" center={toPraca} label />
        </Sequence>
        <Sequence from={S.grid.from} durationInFrames={S.grid.to - S.grid.from + 12}>
          <Grid a={a} center={toGrid} />
        </Sequence>
        <Sequence from={S.balcao.from} durationInFrames={S.bridge.from - S.balcao.from + 6}>
          <VariantsTitle a={a} />
        </Sequence>
        <Sequence from={S.bridge.from} durationInFrames={40}>
          <Bridge a={a} />
        </Sequence>
        <Sequence from={S.order.from} durationInFrames={S.coin.from - S.order.from + 18}>
          <Order a={a} />
        </Sequence>
        <Sequence from={S.coin.from} durationInFrames={DURATION - S.coin.from}>
          <Closing a={a} />
        </Sequence>
        {!mute && (
          <>
            <Audio
              src={staticFile('audio/lucky-draw.m4a')}
              trimBefore={Math.round(MUSIC_START * FPS)}
              volume={(f) => interpolate(f, [0, 2, MUSIC_FADE_FROM, DURATION], [0, 0.9, 0.9, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
            />
            {soundtrack(a).map((h, i) => (
              <Sequence key={i} from={Math.max(0, h.at)} durationInFrames={60} layout="none">
                <Audio src={staticFile(`sfx/${h.sfx}.wav`)} volume={h.gain} />
              </Sequence>
            ))}
          </>
        )}
      </AbsoluteFill>
    </MessagesContext.Provider>
  );
};
