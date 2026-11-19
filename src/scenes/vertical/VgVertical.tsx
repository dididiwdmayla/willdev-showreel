import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { brand } from '../../../config/branding';
import { cues } from '../../../config/timing';
import { Footage } from '../../components/Footage';
import { BrowserFrame, PhoneFrame } from '../../components/Frames';
import { Line, ProjectTag } from '../../components/Type';
import { useShow } from '../../context';
import { ease, mix, ramp } from '../../lib/anim';
import { balance, type SceneProps } from '../shared';
import { SIDE, W, useFormat } from './format';

const C = brand.colors;

/**
 * Vertical VG: the same page on desktop and phone, stacked instead of side by
 * side. The browser sits under the headline; the phone overlaps its lower right
 * corner and rises in, so both scroll together in one vertical block.
 */
export const VgVertical: React.FC<SceneProps> = ({ cue, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { messages } = useShow();
  const { pick, safe } = useFormat();
  const m = messages.vg;
  const phoneAt = cue(cues.vg.phone);
  const enter = ramp(frame, 0, 24, ease.out);
  const phoneIn = ramp(frame, phoneAt - 8, 20, ease.out);
  const drift = mix(0, -16, ramp(frame, 0, durationInFrames, ease.inOut));
  const [a, b] = balance(m.headline);
  const size = pick(92, 80);
  const headTop = pick(safe.top + 90, safe.top + 10);
  const browser = pick({ x: 40, y: 560, w: 1000, h: 596 }, { x: 40, y: 300, w: 860, h: 512 });
  const phone = pick({ x: 610, y: 880, w: 400, h: 838 }, { x: 700, y: 520, w: 330, h: 692 });
  const tag = pick({ x: SIDE + 2, y: 1220 }, { x: SIDE + 2, y: 880 });
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 60%, #0E1C38 0%, ${C.black} 65%)` }} />
      <div style={{ position: 'absolute', left: SIDE, top: headTop }}>
        <Line text={a} at={4} size={size} maxWidth={W - SIDE * 2} />
        {b && <Line text={b} at={8} size={size} maxWidth={W - SIDE * 2} />}
      </div>
      <BrowserFrame
        width={browser.w}
        height={browser.h}
        style={{ left: browser.x, top: browser.y, scale: String(mix(0.96, 1, enter)), opacity: enter, translate: `0 ${drift}px` }}
      >
        <Footage clip="vg-desktop" trimBefore={16} />
      </BrowserFrame>
      <PhoneFrame
        width={phone.w}
        height={phone.h}
        style={{
          left: phone.x,
          top: phone.y,
          opacity: phoneIn,
          translate: `0 ${(1 - phoneIn) * 120 - drift * 0.6}px`,
          rotate: `${mix(4, 0, phoneIn)}deg`,
          filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.65))',
        }}
      >
        <Footage clip="vg-mobile" trimBefore={16} />
      </PhoneFrame>
      <ProjectTag label={m.label} kind={m.kind} at={14} out={durationInFrames - 8} style={{ left: tag.x, top: tag.y }} />
    </AbsoluteFill>
  );
};
