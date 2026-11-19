import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { brand } from '../../../config/branding';
import { cues } from '../../../config/timing';
import { Footage } from '../../components/Footage';
import { NeonPath, roundedPath } from '../../components/NeonPath';
import { Line } from '../../components/Type';
import { useShow } from '../../context';
import { ease, mix, ramp } from '../../lib/anim';
import { balance, type SceneProps } from '../shared';
import { SIDE, W, useFormat } from './format';

const C = brand.colors;
const INK_LEAD = 7;

/**
 * Vertical opening: the interativMind scroll painting is itself vertical, so it
 * fills the frame. The first line sits above it, the second below; the neon line
 * runs down the margin and under the painting to hand over between them.
 */
export const OpeningVertical: React.FC<SceneProps> = ({ cue }) => {
  const frame = useCurrentFrame();
  const { messages } = useShow();
  const { pick, safe, tall } = useFormat();
  const m = messages.opening;
  const drop = cue(0);
  const l1 = cue(cues.opening.firstLine);
  const l2 = cue(cues.opening.secondLine);
  const clipStart = drop - INK_LEAD;
  const pull = ramp(frame, l1 - 20, 90, ease.inOut);
  const scale = mix(1.32, pick(1.04, 1.0), pull);
  const fadeIn = ramp(frame, clipStart, drop - clipStart, ease.out);
  const [a1, b1] = balance(m.line1);
  // Reels: the second line stays on one line, under the painting's own title.
  const [a2, b2] = tall ? [m.line2, null] : balance(m.line2);
  const size1 = pick(112, 96);
  const size2 = pick(98, 90);
  const top1 = safe.top + pick(20, 10);
  const top2 = pick(1440, 1050);
  const under1 = top1 + size1 * 1.05 * (b1 ? 2 : 1) + 24;
  const link = roundedPath(
    [
      [SIDE, under1],
      [SIDE + 70, under1],
      [SIDE + 70, top2 - 34],
      [W - SIDE, top2 - 34],
    ],
    40,
  );
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <Sequence from={clipStart} layout="none">
        <AbsoluteFill style={{ opacity: fadeIn, scale: String(scale), transformOrigin: '50% 45%' }}>
          {/* The painting is the middle third of the capture: it fills the phone frame by height. */}
          <Footage clip="im-entrada" />
        </AbsoluteFill>
      </Sequence>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${C.black}F2 0%, ${C.black}B8 ${pick(16, 14)}%, ${C.black}00 ${pick(30, 30)}%, ${C.black}00 ${pick(62, 66)}%, ${C.black}B8 ${pick(76, 80)}%, ${C.black}F2 100%)`,
        }}
      />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, transparent 60%, ${C.black}99 100%)` }} />
      <NeonPath d={link} progress={ramp(frame, l1 + 16, l2 - l1 + 4, ease.inOut)} width={3.5} />
      <div style={{ position: 'absolute', left: SIDE, top: top1 }}>
        <Line text={a1} at={l1} size={size1} maxWidth={W - SIDE * 2} />
        {b1 && <Line text={b1} at={l1 + 5} size={size1} maxWidth={W - SIDE * 2} />}
      </div>
      <div style={{ position: 'absolute', right: SIDE, top: top2, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <Line text={a2} at={l2} size={size2} color={C.pink} align="right" maxWidth={W - SIDE * 2} underline={m.line2Key} />
        {b2 && <Line text={b2} at={l2 + 4} size={size2} color={C.pink} align="right" maxWidth={W - SIDE * 2} underline={m.line2Key} />}
      </div>
    </AbsoluteFill>
  );
};
