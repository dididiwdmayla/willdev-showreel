// Chapa Burger scenes: the opening with the lens, the variant shots and the grid.
// Reusable in other cuts: every scene takes the aspect and reads its takes from footage/.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { brand } from '../../config/branding';
import { ProjectTag } from '../../src/components/Type';
import { ease, mix, ramp } from '../../src/lib/anim';
import { SCENES, SIZES, desktopMeta, mobileMeta, type Aspect, type Variant } from '../config';
import { Cursor, LensWipe, Shade, Take, TapRing, camera, type Box, type Cam, type Pt } from '../parts';
import { C, CAPTIONS, Caption, NAMES, desktop, useMessages } from '../shared';

/** Where the Chapa takes play: full bleed in 16:9; a 16:10 window in 1:1; a tall window under a caption band in 9:16. */
export const CHAPA_BOX: Record<Aspect, Box> = {
  '16x9': { x: 0, y: 0, w: 1920, h: 1080 },
  '1x1': { x: 0, y: 90, w: 1080, h: 675 },
  '9x16': { x: 0, y: 400, w: 1080, h: 1520 },
};

/** Opening + lens (0–107): one continuous take, the camera travels from the poster to the burger. */
export function openingCam(a: Aspect, f: number): Cam {
  if (desktop(a)) {
    const m = desktopMeta('chapa');
    const L = SCENES.lens;
    const push = ramp(f, 0, L.from, ease.out);
    const go = ramp(f, L.from, 30, ease.inOut);
    const drift = ramp(f, L.from + 30, L.to - L.from - 30, ease.inOut);
    const target = a === '16x9' ? { cx: m.A.x + 70, cy: m.A.y + 64, zoom: 2.1 } : { cx: m.A.x + 46, cy: m.A.y + 8, zoom: 1.95 };
    return {
      cx: mix(640, target.cx, go),
      cy: mix(400, target.cy, go),
      zoom: mix(1 + 0.05 * push, target.zoom, go) + 0.1 * drift,
    };
  }
  const m = mobileMeta('chapa');
  const go = ramp(f, SCENES.lens.from, 24, ease.inOut);
  const tapA = m.pointer[0];
  return { cx: 195, cy: mix(422, tapA.y, go * 0.5), zoom: 1 + 0.04 * ramp(f, 0, SCENES.lens.from, ease.out) + 0.08 * go };
}

/** Variant shots (desktop from the frame the cursor heads for burger A; mobile from just before the tap). */
export const VARIANT_TRIM = { desktop: 58, mobile: 46 };

/** Per variant: how close the camera goes (the praça mural and the sala photos are already large). */
const VARIANT_ZOOM: Record<Variant, { d16: number; d1: number; dx: number }> = {
  chapa: { d16: 1.25, d1: 1.5, dx: 220 },
  balcao: { d16: 1.3, d1: 1.55, dx: 260 },
  sala: { d16: 1.06, d1: 1.25, dx: 200 },
  praca: { d16: 1.0, d1: 1.15, dx: 160 },
};

export function variantCam(a: Aspect, v: Variant, f: number): Cam {
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
export function lensPoint(a: Aspect, v: Variant, clipFrame: number, cam: Cam, box: Box): Pt {
  if (desktop(a)) {
    const p = desktopMeta(v).pointer[Math.min(clipFrame, desktopMeta(v).pointer.length - 1)];
    const c = camera('desktop', box, cam);
    return p ? c.map({ x: p[0], y: p[1] }) : { x: box.w / 2, y: box.h / 2 };
  }
  const m = mobileMeta(v);
  const tap = [...m.pointer].reverse().find((t) => t.frame <= clipFrame) ?? m.pointer[0];
  return camera('mobile', box, cam).map(tap);
}

export const ChapaShot: React.FC<{ a: Aspect; v: Variant; trim: number; cam: (f: number) => Cam; box?: Box; showPointer?: boolean }> = ({ a, v, trim, cam, box, showPointer = true }) => {
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


export const Opening: React.FC<{ a: Aspect }> = ({ a }) => {
  const f = useCurrentFrame();
  const r = useMessages();
  const cap = CAPTIONS[a];
  const { width } = SIZES[a];
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <ChapaShot a={a} v="chapa" trim={0} cam={(ff) => openingCam(a, ff)} />
      <AbsoluteFill style={{ opacity: ramp(f, 4, 14) * (1 - ramp(f, SCENES.lens.to - 11, 10)) }}>
        {a === '16x9' && <Shade from="bottom" size={480} />}
      </AbsoluteFill>
      <Caption cap={cap.hook} text={r.hook} underline={r.hookKey} at={8} out={SCENES.lens.to - 9} width={width} />
      <ProjectTag label={r.chapaLabel} kind={r.chapaKind} at={SCENES.lens.from + 12} out={SCENES.lens.to - 9} style={{ left: cap.tag.x, top: cap.tag.y }} />
    </AbsoluteFill>
  );
};

export const VariantShot: React.FC<{ a: Aspect; v: Variant; center: Pt; label: boolean }> = ({ a, v, center, label }) => {
  const r = useMessages();
  const cap = CAPTIONS[a];
  const { width, height } = SIZES[a];
  const trim = desktop(a) ? VARIANT_TRIM.desktop : VARIANT_TRIM.mobile;
  return (
    <LensWipe center={center} width={width} height={height}>
      <AbsoluteFill style={{ background: C.black }}>
        <ChapaShot a={a} v={v} trim={trim} cam={(ff) => variantCam(a, v, ff)} />
        {a === '16x9' && <Shade from="bottom" size={470} strength={0.92} />}
        {label && <ProjectTag label={NAMES[v]} kind={r.variants[v]} at={4} out={SCENES[v as 'balcao'].to - SCENES[v as 'balcao'].from - 4} style={{ left: cap.variantTag.x, top: cap.variantTag.y }} />}
      </AbsoluteFill>
    </LensWipe>
  );
};

export const GRID: Record<Aspect, Box[]> = {
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

export const Grid: React.FC<{ a: Aspect; center: Pt }> = ({ a, center }) => {
  const f = useCurrentFrame();
  const { width, height } = SIZES[a];
  const out = ramp(f, SCENES.grid.to - SCENES.grid.from, 10, ease.in);
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
export const VariantsTitle: React.FC<{ a: Aspect }> = ({ a }) => {
  const r = useMessages();
  return <Caption cap={CAPTIONS[a].title} text={r.variantsTitle} at={4} out={SCENES.bridge.from - SCENES.balcao.from - 10} width={SIZES[a].width} />;
};

