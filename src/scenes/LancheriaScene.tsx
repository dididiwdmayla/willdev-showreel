import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { brand } from '../../config/branding';
import { cues } from '../../config/timing';
import { Footage } from '../components/Footage';
import { BrowserFrame, PhoneFrame } from '../components/Frames';
import { fitSize, ProjectTag } from '../components/Type';
import { useShow } from '../context';
import { ease, mix, ramp } from '../lib/anim';
import type { SceneProps } from './shared';

const C = brand.colors;
/** lancheria-trilho: frame where "Prensado Completo" starts leaving the centre and opens. */
const RAIL_OPENS = 14;
/** lancheria-raiox: frame where the griddle press starts (tap at 60 + 60 ms). */
const RAIOX_PRESS = 62;

/**
 * 07–13 s: the sandwich opens into its layers. The headline words stack like
 * layers too: they separate when the sandwich opens and snap shut with the press.
 */
export const LancheriaScene: React.FC<SceneProps> = ({ cue, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { messages } = useShow();
  const m = messages.lancheria;
  const phoneAt = cue(cues.lancheria.phone);
  const pressAt = cue(cues.lancheria.press);
  const railStart = 2;
  const raioxStart = pressAt - RAIOX_PRESS;

  // Layered headline: open with the rail, pressed with the griddle.
  const open = ramp(frame, railStart + RAIL_OPENS, 34, ease.inOut);
  const press = ramp(frame, pressAt, 10, ease.snap);
  const gap = mix(0, 0.34, open) * (1 - press) + -0.06 * press;
  const squash = 1 - 0.1 * press + 0.1 * ramp(frame, pressAt + 10, 8, ease.out);

  // Browser leaves as the phone arrives.
  const swap = ramp(frame, phoneAt - 14, 12, ease.in);
  const phoneIn = ramp(frame, Math.max(phoneAt - 4, raioxStart), 20, ease.out);
  const size = Math.min(...m.headline.map((w) => fitSize(w, 132, 560)));

  return (
    <AbsoluteFill style={{ background: C.black }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 72% 50%, #2A1A12 0%, ${C.black} 62%)` }} />
      {swap < 1 && (
        <BrowserFrame
          width={1160}
          height={692}
          style={{
            left: 680,
            top: 196,
            opacity: 1 - swap,
            translate: `${-160 * swap}px 0px`,
            scale: String(mix(1, 0.94, swap) * mix(0.97, 1, ramp(frame, 0, 40, ease.out))),
          }}
        >
          {/* Closer on the cards: the rail is what matters, not the section title. */}
          <AbsoluteFill style={{ scale: '1.32', transformOrigin: '50% 82%' }}>
            <Sequence from={railStart} layout="none">
              <Footage clip="lancheria-trilho" />
            </Sequence>
          </AbsoluteFill>
        </BrowserFrame>
      )}
      {phoneIn > 0 && (
        <PhoneFrame
          width={420}
          height={880}
          style={{ left: 1150, top: 100, opacity: phoneIn, translate: `0 ${(1 - phoneIn) * 120}px` }}
        >
          <Sequence from={raioxStart} layout="none">
            <Footage clip="lancheria-raiox" />
          </Sequence>
        </PhoneFrame>
      )}
      <div style={{ position: 'absolute', left: 112, top: 300, scale: `1 ${squash}`, transformOrigin: '0 60%' }}>
        {m.headline.map((w, i) => {
          const t = ramp(frame, 4 + i * 4, 16, ease.out);
          const pink = i === m.headline.length - 1;
          return (
            <div key={w} style={{ overflow: 'hidden', paddingBottom: 14, marginBottom: `${gap - 0.1}em`, fontSize: size }}>
              <div
                style={{
                  fontFamily: brand.fonts.display,
                  fontWeight: 700,
                  fontSize: size,
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                  color: pink ? C.pink : C.lime,
                  textShadow: `0 0 ${size * 0.28}px ${pink ? C.pinkGlow : C.limeGlow}`,
                  translate: `0 ${(1 - t) * 110}%`,
                }}
              >
                {w}
              </div>
            </div>
          );
        })}
      </div>
      <ProjectTag label={m.label} kind={m.kind} at={12} out={durationInFrames - 8} style={{ left: 112, top: 940 }} />
    </AbsoluteFill>
  );
};
