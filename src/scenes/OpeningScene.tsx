import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { brand } from '../../config/branding';
import { cues } from '../../config/timing';
import { Footage } from '../components/Footage';
import { NeonPath, roundedPath } from '../components/NeonPath';
import { Line } from '../components/Type';
import { useShow } from '../context';
import { ease, mix, ramp } from '../lib/anim';
import { balance, type SceneProps } from './shared';

const C = brand.colors;
/** The InterativMind entrance clip: ink starts ~7 frames in; start it so the ink meets the drop. */
const INK_LEAD = 7;

/** 00–07 s: ink opens the interativMind scroll painting on the drop; the first two lines frame it. */
export const OpeningScene: React.FC<SceneProps> = ({ cue }) => {
  const frame = useCurrentFrame();
  const { messages } = useShow();
  const m = messages.opening;
  const drop = cue(0);
  const l1 = cue(cues.opening.firstLine);
  const l2 = cue(cues.opening.secondLine);
  const clipStart = drop - INK_LEAD;
  // Camera: tight on the painting while the ink spreads, then it pulls back to the whole scroll.
  const pull = ramp(frame, l1 - 20, 90, ease.inOut);
  const scale = mix(1.3, 1, pull);
  const fadeIn = ramp(frame, clipStart, drop - clipStart, ease.out);
  const [a1, b1] = balance(m.line1);
  const [a2, b2] = balance(m.line2);
  const link = roundedPath(
    [
      [112, 742],
      [380, 742],
      [380, 985],
      [1540, 985],
      [1540, 760],
      [1808, 760],
    ],
    46,
  );
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <Sequence from={clipStart} layout="none">
        <AbsoluteFill style={{ opacity: fadeIn, scale: String(scale), transformOrigin: '50% 47%' }}>
          <Footage clip="im-entrada" />
        </AbsoluteFill>
      </Sequence>
      {/* Brand black frames the indigo painting and carries the type. */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(90deg, ${C.black}F2 0%, ${C.black}B0 22%, ${C.black}00 37%, ${C.black}00 63%, ${C.black}B0 78%, ${C.black}F2 100%)`,
        }}
      />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, transparent 55%, ${C.black}AA 100%)` }} />
      <NeonPath d={link} progress={ramp(frame, l1 + 16, l2 - l1 + 4, ease.inOut)} width={3.5} />
      <div style={{ position: 'absolute', left: 112, top: 440 }}>
        <Line text={a1} at={l1} size={116} maxWidth={620} />
        {b1 && <Line text={b1} at={l1 + 5} size={116} maxWidth={620} />}
      </div>
      <div style={{ position: 'absolute', right: 112, top: 470, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        {b2 ? (
          <>
            <Line text={a2} at={l2} size={108} color={C.pink} align="right" maxWidth={620} underline={m.line2Key} />
            <Line text={b2} at={l2 + 4} size={108} color={C.pink} align="right" maxWidth={620} underline={m.line2Key} />
          </>
        ) : (
          <Line text={a2} at={l2} size={108} color={C.pink} align="right" maxWidth={620} underline={m.line2Key} />
        )}
      </div>
    </AbsoluteFill>
  );
};
