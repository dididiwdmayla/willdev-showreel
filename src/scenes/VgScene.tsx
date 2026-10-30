import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { brand } from '../../config/branding';
import { cues } from '../../config/timing';
import { Footage } from '../components/Footage';
import { BrowserFrame, PhoneFrame } from '../components/Frames';
import { Line, ProjectTag } from '../components/Type';
import { useShow } from '../context';
import { ease, mix, ramp } from '../lib/anim';
import type { SceneProps } from './shared';

const C = brand.colors;

/** 19–23 s: a conventional business site, the same page on desktop and phone, scrolling together. */
export const VgScene: React.FC<SceneProps> = ({ cue, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { messages } = useShow();
  const m = messages.vg;
  const phoneAt = cue(cues.vg.phone);
  const enter = ramp(frame, 0, 24, ease.out);
  const phoneIn = ramp(frame, phoneAt - 8, 20, ease.out);
  const drift = mix(0, -18, ramp(frame, 0, durationInFrames, ease.inOut));
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 45% 60%, #0E1C38 0%, ${C.black} 65%)` }} />
      <div style={{ position: 'absolute', left: 112, top: 74 }}>
        <Line text={m.headline} at={4} size={84} maxWidth={1300} />
      </div>
      <BrowserFrame
        width={1220}
        height={727}
        style={{ left: 112, top: 214, scale: String(mix(0.96, 1, enter)), opacity: enter, translate: `${drift}px 0` }}
      >
        <Footage clip="vg-desktop" trimBefore={16} />
      </BrowserFrame>
      <PhoneFrame
        width={372}
        height={780}
        style={{ left: 1420, top: 176, opacity: phoneIn, translate: `${(1 - phoneIn) * 80 - drift * 0.6}px 0`, rotate: `${mix(4, 0, phoneIn)}deg` }}
      >
        <Footage clip="vg-mobile" trimBefore={16} />
      </PhoneFrame>
      <ProjectTag label={m.label} kind={m.kind} at={14} out={durationInFrames - 8} style={{ left: 112, top: 966 }} />
    </AbsoluteFill>
  );
};
