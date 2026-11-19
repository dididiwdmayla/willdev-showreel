import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { brand } from '../../../config/branding';
import { cues } from '../../../config/timing';
import { Footage } from '../../components/Footage';
import { Line, ProjectTag } from '../../components/Type';
import { useShow } from '../../context';
import { ease, mix, ramp } from '../../lib/anim';
import { balance, type SceneProps } from '../shared';
import { SIDE, W, useFormat } from './format';

const C = brand.colors;
const MATURE = 150;
const CLIP = { w: 1184, h: 1390 };
const INDIGO = '#1C2A48';

/** Vertical interativMind: the tree is a portrait subject, so it grows large under the headline. */
export const InterativMindVertical: React.FC<SceneProps> = ({ cue, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { messages } = useShow();
  const { pick, safe } = useFormat();
  const m = messages.interativmind;
  const matureAt = cue(cues.interativmind.mature);
  const rate = MATURE / Math.max(1, matureAt);
  const h = pick(1240, 980);
  const w = (CLIP.w / CLIP.h) * h;
  const top = pick(560, 352);
  const rise = ramp(frame, 0, 30, ease.out);
  const zoom = mix(1, 1.05, ramp(frame, 0, durationInFrames, ease.inOut));
  const [a, b] = balance(m.headline);
  const size = pick(108, 90);
  const headTop = pick(safe.top + 90, safe.top + 8);
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 52% at 50% ${((top + h / 2) / pick(1920, 1350)) * 100}%, ${INDIGO} 0%, ${INDIGO}99 38%, ${C.black} 80%)` }} />
      <div
        style={{
          position: 'absolute',
          left: W / 2 - w / 2,
          top,
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
      <div style={{ position: 'absolute', left: SIDE, top: headTop }}>
        <Line text={a} at={8} size={size} maxWidth={W - SIDE * 2} />
        {b && <Line text={b} at={12} size={size} maxWidth={W - SIDE * 2} color={C.pink} underline={b.split(' ').pop()?.replace(/[.,!?]/g, '')} />}
      </div>
      <ProjectTag label={m.label} kind={m.kind} at={18} out={durationInFrames - 6} style={{ left: SIDE + 2, top: headTop + size * 1.05 * (b ? 2 : 1) + pick(26, 18) }} />
    </AbsoluteFill>
  );
};
