// Closing: the WillDev coin is struck from the "Pago!" check, then the line and the CTA.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ease, mix, ramp } from '../../src/lib/anim';
import { PAID_CHECK, SIZES, type Aspect } from '../config';
import { Coin, camera, screenOf, type Pt } from '../parts';
import { Caption, C, useMessages } from '../shared';
import { MOBILE_CAM, PHONE } from './ingarandi';

export const COIN: Record<Aspect, { c: Pt; size: number; line: Caption; cta: Caption }> = {
  '16x9': { c: { x: 640, y: 540 }, size: 500, line: { x: 1000, y: 410, size: 104, max: 840 }, cta: { x: 1004, y: 560, size: 44, max: 820 } },
  '1x1': { c: { x: 540, y: 410 }, size: 430, line: { x: 0, y: 690, size: 76, max: 980, align: 'center' }, cta: { x: 0, y: 800, size: 38, max: 960, align: 'center' } },
  '9x16': { c: { x: 540, y: 760 }, size: 620, line: { x: 0, y: 1190, size: 92, max: 980, align: 'center' }, cta: { x: 0, y: 1330, size: 44, max: 960, align: 'center' } },
};

export const Closing: React.FC<{ a: Aspect }> = ({ a }) => {
  const f = useCurrentFrame();
  const r = useMessages();
  const k = COIN[a];
  const { width } = SIZES[a];
  const scr = screenOf(PHONE[a]);
  const cm = camera('mobile', { x: scr.x, y: scr.y, w: scr.w, h: scr.h }, MOBILE_CAM);
  const birth = cm.map(PAID_CHECK);
  const fly = ramp(f, 2, 20, ease.inOut);
  const spin = ramp(f, 2, 21, ease.out);
  const land = ramp(f, 22, 10, ease.out); // on the music's biggest hit (frame 371)
  const size = mix(cm.unit * 18, k.size, ramp(f, 0, 22, ease.inOut));
  const cx = mix(birth.x, k.c.x, fly);
  const cy = mix(birth.y, k.c.y, fly) - Math.sin(fly * Math.PI) * (a === '9x16' ? 120 : 90);
  const angle = 1080 * spin;
  const arc = ramp(f, 25, 22, ease.inOut);
  const glow = 0.25 + 0.6 * (1 - ramp(f, 26, 20)) * land;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${k.c.x}px ${k.c.y}px, rgba(194,247,12,${0.16 * land}) 0%, rgba(3,1,2,0) 50%)` }} />
      <Coin size={size} angle={angle} arc={arc} glow={glow} style={{ left: cx - size / 2, top: cy - size / 2, scale: `${1 + 0.04 * Math.sin(land * Math.PI)}` }} />
      <Caption cap={k.line} text={r.closing} underline={r.closingKey} at={35} width={width} />
      <Caption cap={k.cta} text={r.cta} at={43} color={C.white} width={width} />
    </AbsoluteFill>
  );
};

