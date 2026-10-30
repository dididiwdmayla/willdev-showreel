import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { brand } from '../../config/branding';
import { cues } from '../../config/timing';
import { Footage } from '../components/Footage';
import { NeonPath } from '../components/NeonPath';
import { Line, ProjectTag } from '../components/Type';
import { useShow } from '../context';
import { ease, mix, ramp } from '../lib/anim';
import { balance, type SceneProps } from './shared';

const C = brand.colors;
/** he-quadro: frame where the blade closes and the photo relights. */
const RELIGHT = 29;
/** he-quadro: the board photo inside the 1920×1080 capture. */
const BOARD = { x: 32, y: 115, w: 1132, h: 849 };
/** he-quadro: height of the blue feed line of the schematic, in capture pixels. */
const FEED_Y = 540;

/** he-multimetro: the meter's display and dial, right of the section title. */
const METER = { x: 1100, y: 122, w: 820, h: 615 };

const PANEL = { x: 90, y: 130, w: 1080, h: 810 };

/** Shows one region of a capture inside the panel, with a slow push-in. */
const Crop: React.FC<{ region: typeof BOARD; push: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ region, push, children, style }) => {
  const k = PANEL.w / region.w;
  return (
    <div
      style={{
        position: 'absolute',
        left: PANEL.x,
        top: PANEL.y,
        width: PANEL.w,
        height: PANEL.h,
        borderRadius: 18,
        overflow: 'hidden',
        background: '#080A0D',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 40px 120px rgba(0,0,0,0.7)',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: -region.x * k,
          top: -region.y * k,
          width: 1920 * k,
          height: 1080 * k,
          scale: String(push),
          transformOrigin: `${((region.x + region.w / 2) / 1920) * 100}% ${((region.y + region.h / 2) / 1080) * 100}%`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * 13–19 s: the multimeter powers on (HUD count-up over the photo); then the board:
 * during the track's one-bar break the schematic is traced, and the photo relights
 * on the beat that brings the kick back.
 */
export const HardEletricScene: React.FC<SceneProps> = ({ cue, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { messages } = useShow();
  const m = messages.hardeletric;
  const boardAt = cue(cues.hardeletric.board);
  const relightAt = cue(cues.hardeletric.relight);
  const k = PANEL.w / BOARD.w;
  const swap = ramp(frame, boardAt - 4, 14, ease.inOut);
  const push = mix(1, 1.07, ramp(frame, boardAt, durationInFrames - boardAt, ease.inOut));
  const feedY = PANEL.y + (FEED_Y - BOARD.y) * k;
  const [a, b] = balance(m.headline);
  // Before the relight the clip is slowed so its trace fills the break exactly.
  const slow = RELIGHT / Math.max(1, relightAt - boardAt);

  return (
    <AbsoluteFill style={{ background: C.black }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 30% 50%, #0B1A2C 0%, ${C.black} 60%)` }} />
      {swap < 1 && (
        <Crop region={METER} push={mix(1.04, 1, ramp(frame, 0, boardAt, ease.out))} style={{ opacity: 1 - swap }}>
          {/* The meter is drawn faint on the site; lifted a little so the HUD reads at video size. */}
          <AbsoluteFill style={{ filter: 'brightness(1.45) contrast(1.05)' }}>
            <Footage clip="he-multimetro" />
          </AbsoluteFill>
        </Crop>
      )}
      {swap > 0 && (
        <Crop region={BOARD} push={push} style={{ opacity: swap }}>
          <Sequence from={boardAt} durationInFrames={relightAt - boardAt} layout="none">
            <Footage clip="he-quadro" playbackRate={slow} />
          </Sequence>
          <Sequence from={relightAt} layout="none">
            <Footage clip="he-quadro" trimBefore={RELIGHT} />
          </Sequence>
        </Crop>
      )}
      {/* The brand line arrives from the edge and hands over to the board's own feed line. */}
      <NeonPath d={`M -20 ${feedY} L ${PANEL.x + 70} ${feedY}`} progress={ramp(frame, boardAt + 2, 14, ease.out)} width={4} />
      <div style={{ position: 'absolute', left: 1250, top: 400 }}>
        <Line text={a} at={6} size={104} maxWidth={600} />
        {b && <Line text={b} at={10} size={104} maxWidth={600} color={C.lime} />}
      </div>
      <ProjectTag label={m.label} kind={m.kind} at={14} out={durationInFrames - 8} style={{ left: 1254, top: 660 }} />
    </AbsoluteFill>
  );
};
