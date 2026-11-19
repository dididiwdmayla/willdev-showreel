import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { brand } from '../../../config/branding';
import { cues } from '../../../config/timing';
import { Footage } from '../../components/Footage';
import { BrowserFrame, PhoneFrame } from '../../components/Frames';
import { fitSize, ProjectTag } from '../../components/Type';
import { useShow } from '../../context';
import { ease, mix, ramp } from '../../lib/anim';
import type { SceneProps } from '../shared';
import { SIDE, useFormat } from './format';

const C = brand.colors;
const RAIL_OPENS = 14;
const RAIOX_PRESS = 62;

/**
 * Vertical Lancheria: the layered headline on top; under it the menu rail in a
 * full-width browser, which hands over to the phone (raio-x and the press),
 * brought up large in the middle of the frame.
 */
export const LancheriaVertical: React.FC<SceneProps> = ({ cue, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { messages } = useShow();
  const { pick, safe } = useFormat();
  const m = messages.lancheria;
  const phoneAt = cue(cues.lancheria.phone);
  const pressAt = cue(cues.lancheria.press);
  const railStart = 2;
  const raioxStart = pressAt - RAIOX_PRESS;

  const open = ramp(frame, railStart + RAIL_OPENS, 34, ease.inOut);
  const press = ramp(frame, pressAt, 10, ease.snap);
  const gap = mix(0, 0.22, open) * (1 - press) + -0.06 * press;
  const squash = 1 - 0.1 * press + 0.1 * ramp(frame, pressAt + 10, 8, ease.out);

  const swap = ramp(frame, phoneAt - 14, 12, ease.in);
  const phoneIn = ramp(frame, Math.max(phoneAt - 4, raioxStart), 20, ease.out);

  // The stacked words take the left column; the browser runs full width under them,
  // then the phone rises in the right column, level with the words.
  const size = Math.min(...m.headline.map((w) => fitSize(w, pick(112, 100), 480)));
  const headTop = pick(safe.top + 90, safe.top + 4);
  const browser = pick({ x: 40, y: 790, w: 1000, h: 596 }, { x: 60, y: 480, w: 960, h: 572 });
  const phone = pick({ x: 556, y: 470, w: 480, h: 1006 }, { x: 576, y: 176, w: 430, h: 900 });
  const tag = pick({ x: SIDE + 2, y: 712 }, { x: SIDE + 2, y: 1112 });

  return (
    <AbsoluteFill style={{ background: C.black }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% ${pick(62, 58)}%, #2A1A12 0%, ${C.black} 62%)` }} />
      {swap < 1 && (
        <BrowserFrame
          width={browser.w}
          height={browser.h}
          style={{
            left: browser.x,
            top: browser.y,
            opacity: 1 - swap,
            translate: `${-140 * swap}px 0px`,
            scale: String(mix(1, 0.94, swap) * mix(0.96, 1, ramp(frame, 0, 40, ease.out))),
          }}
        >
          {/* Closer still than on desktop: on a phone the sandwiches must read. */}
          <AbsoluteFill style={{ scale: '1.42', transformOrigin: '50% 80%' }}>
            <Sequence from={railStart} layout="none">
              <Footage clip="lancheria-trilho" />
            </Sequence>
          </AbsoluteFill>
        </BrowserFrame>
      )}
      {phoneIn > 0 && (
        <PhoneFrame
          width={phone.w}
          height={phone.h}
          style={{ left: phone.x, top: phone.y, opacity: phoneIn, translate: `0 ${(1 - phoneIn) * 140}px`, filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.6))' }}
        >
          <Sequence from={raioxStart} layout="none">
            <Footage clip="lancheria-raiox" />
          </Sequence>
        </PhoneFrame>
      )}
      <div style={{ position: 'absolute', left: SIDE, top: headTop, scale: `1 ${squash}`, transformOrigin: '0 60%' }}>
        {m.headline.map((w, i) => {
          const t = ramp(frame, 4 + i * 4, 16, ease.out);
          const pink = i === m.headline.length - 1;
          return (
            <div key={w} style={{ overflow: 'hidden', paddingBottom: 12, marginBottom: `${gap - 0.1}em`, fontSize: size }}>
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
                  whiteSpace: 'nowrap',
                }}
              >
                {w}
              </div>
            </div>
          );
        })}
      </div>
      <ProjectTag label={m.label} kind={m.kind} at={12} out={durationInFrames - 8} style={{ left: tag.x, top: tag.y }} />
    </AbsoluteFill>
  );
};
