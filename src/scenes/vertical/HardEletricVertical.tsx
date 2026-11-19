import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { brand } from '../../../config/branding';
import { cues } from '../../../config/timing';
import { Footage } from '../../components/Footage';
import { NeonPath } from '../../components/NeonPath';
import { Line, ProjectTag } from '../../components/Type';
import { useShow } from '../../context';
import { ease, mix, ramp } from '../../lib/anim';
import { balance, type SceneProps } from '../shared';
import { SIDE, W, useFormat } from './format';

const C = brand.colors;
const RELIGHT = 29;
const BOARD = { x: 32, y: 115, w: 1132, h: 849 };
const FEED_Y = 540;
const METER = { x: 1100, y: 122, w: 820, h: 615 };

type Rect = { x: number; y: number; w: number; h: number };

/** One region of a 1920×1080 capture inside a panel, with a slow push-in. */
const Crop: React.FC<{ panel: Rect; region: Rect; push: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ panel, region, push, children, style }) => {
  const k = panel.w / region.w;
  return (
    <div
      style={{
        position: 'absolute',
        left: panel.x,
        top: panel.y,
        width: panel.w,
        height: panel.h,
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
 * Vertical Hard Eletric: headline on top, then the multimeter and the board in a
 * near full-width 4:3 panel (the board photo is 4:3), tag under it. The neon line
 * still enters from the edge and becomes the schematic's feed line.
 */
export const HardEletricVertical: React.FC<SceneProps> = ({ cue, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { messages } = useShow();
  const { pick, safe } = useFormat();
  const m = messages.hardeletric;
  const boardAt = cue(cues.hardeletric.board);
  const relightAt = cue(cues.hardeletric.relight);
  const panel = pick({ x: 28, y: 700, w: 1024, h: 768 }, { x: 60, y: 372, w: 960, h: 720 });
  const k = panel.w / BOARD.w;
  const swap = ramp(frame, boardAt - 4, 14, ease.inOut);
  const push = mix(1, 1.07, ramp(frame, boardAt, durationInFrames - boardAt, ease.inOut));
  const feedY = panel.y + (FEED_Y - BOARD.y) * k;
  const [a, b] = balance(m.headline);
  const slow = RELIGHT / Math.max(1, relightAt - boardAt);
  const size = pick(108, 92);
  const headTop = pick(safe.top + 170, safe.top + 20);

  return (
    <AbsoluteFill style={{ background: C.black }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% ${pick(55, 58)}%, #0B1A2C 0%, ${C.black} 62%)` }} />
      {swap < 1 && (
        <Crop panel={panel} region={METER} push={mix(1.04, 1, ramp(frame, 0, boardAt, ease.out))} style={{ opacity: 1 - swap }}>
          <AbsoluteFill style={{ filter: 'brightness(1.45) contrast(1.05)' }}>
            <Footage clip="he-multimetro" />
          </AbsoluteFill>
        </Crop>
      )}
      {swap > 0 && (
        <Crop panel={panel} region={BOARD} push={push} style={{ opacity: swap }}>
          <Sequence from={boardAt} durationInFrames={relightAt - boardAt} layout="none">
            <Footage clip="he-quadro" playbackRate={slow} />
          </Sequence>
          <Sequence from={relightAt} layout="none">
            <Footage clip="he-quadro" trimBefore={RELIGHT} />
          </Sequence>
        </Crop>
      )}
      <NeonPath d={`M -20 ${feedY} L ${panel.x + 60} ${feedY}`} progress={ramp(frame, boardAt + 2, 14, ease.out)} width={4} />
      <div style={{ position: 'absolute', left: SIDE, top: headTop }}>
        <Line text={a} at={6} size={size} maxWidth={W - SIDE * 2} />
        {b && <Line text={b} at={10} size={size} maxWidth={W - SIDE * 2} />}
      </div>
      <ProjectTag label={m.label} kind={m.kind} at={14} out={durationInFrames - 8} style={{ left: SIDE + 2, top: panel.y + panel.h + pick(44, 30) }} />
    </AbsoluteFill>
  );
};
