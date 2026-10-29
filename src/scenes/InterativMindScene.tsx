import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { brand } from '../../config/branding';
import { cues } from '../../config/timing';
import { Footage } from '../components/Footage';
import { Line, ProjectTag } from '../components/Type';
import { useShow } from '../context';
import { ease, mix, ramp } from '../lib/anim';
import { balance, type SceneProps } from './shared';

const C = brand.colors;
/** im-arvore: frame where the first young branch is set to mature (ink transition, blossoms). */
const MATURE = 150;
/** im-arvore capture size (tree element at 2×). */
const CLIP = { w: 1184, h: 1390 };
/** InterativMind's own indigo, used only as light around the tree. */
const INDIGO = '#1C2A48';

/** 23–29 s: the knowledge tree grows from the ground, and two young branches mature into blossom. */
export const InterativMindScene: React.FC<SceneProps> = ({ cue, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { messages } = useShow();
  const m = messages.interativmind;
  const matureAt = cue(cues.interativmind.mature);
  const rate = MATURE / Math.max(1, matureAt);
  const h = 1000;
  const w = (CLIP.w / CLIP.h) * h;
  const rise = ramp(frame, 0, 30, ease.out);
  const zoom = mix(1, 1.05, ramp(frame, 0, durationInFrames, ease.inOut));
  const [a, b] = balance(m.headline);
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 55% 75% at 71% 55%, ${INDIGO} 0%, ${INDIGO}99 38%, ${C.black} 78%)` }} />
      <div
        style={{
          position: 'absolute',
          left: 1360 - w / 2,
          top: 60,
          width: w,
          height: h,
          scale: String(zoom),
          translate: `0 ${(1 - rise) * 30}px`,
          maskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 62%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 62%, transparent 100%)',
        }}
      >
        <Footage clip="im-arvore" playbackRate={rate} />
      </div>
      <div style={{ position: 'absolute', left: 112, top: 380 }}>
        <Line text={a} at={8} size={112} maxWidth={720} />
        {b && <Line text={b} at={12} size={112} maxWidth={720} color={C.pink} underline={b.split(' ').pop()?.replace(/[.,!?]/g, '')} />}
      </div>
      <ProjectTag label={m.label} kind={m.kind} at={18} out={durationInFrames - 6} style={{ left: 112, top: 700 }} />
    </AbsoluteFill>
  );
};
