import React, { useMemo } from 'react';
import { Audio } from '@remotion/media';
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { brand } from '../config/branding';
import { platforms, type PlatformId } from '../config/platforms';
import { audio, bar, buildTimeline, DURATION_FRAMES, TRANSITION_FRAMES, type SceneId, type TimelineEntry } from '../config/timing';
import { locales, type LocaleId } from '../locales';
import { Logo } from './components/Logo';
import { Wipe, type WipeKind } from './components/Wipe';
import { ShowContext, settingsFor } from './context';
import { ease, ramp } from './lib/anim';
import { ClosingScene } from './scenes/ClosingScene';
import { HardEletricScene } from './scenes/HardEletricScene';
import { InterativMindScene } from './scenes/InterativMindScene';
import { LancheriaScene } from './scenes/LancheriaScene';
import { OpeningScene } from './scenes/OpeningScene';
import type { SceneProps } from './scenes/shared';
import { VgScene } from './scenes/VgScene';
import './fonts';

export const showreelSchema = z.object({
  platform: z.enum(Object.keys(platforms) as [PlatformId, ...PlatformId[]]),
  locale: z.enum(Object.keys(locales) as [LocaleId, ...LocaleId[]]),
  /** Render without the soundtrack. */
  mute: z.boolean(),
});
export type ShowreelProps = z.infer<typeof showreelSchema>;

const SCENES: Record<SceneId, React.FC<SceneProps>> = {
  opening: OpeningScene,
  lancheria: LancheriaScene,
  hardeletric: HardEletricScene,
  vg: VgScene,
  interativmind: InterativMindScene,
  closing: ClosingScene,
};

/** How each scene enters. Varied on purpose; the white edge is the brand's neon line. */
const ENTRANCE: Record<SceneId, { kind: WipeKind; origin?: [number, number] }> = {
  opening: { kind: 'none' },
  lancheria: { kind: 'right' },
  hardeletric: { kind: 'down' },
  vg: { kind: 'left' },
  interativmind: { kind: 'iris', origin: [1360, 560] },
  closing: { kind: 'none' },
};

/** Bar index where a timeline entry starts (for scene cues). */
function startBar(entry: TimelineEntry): number {
  for (let i = 0; i < 64; i++) if (bar(i) >= entry.from) return i;
  return 0;
}

const Soundtrack: React.FC = () => {
  const { fps } = useVideoConfig();
  if (!audio.file) return null;
  const fadeStart = DURATION_FRAMES - audio.fadeOutSeconds * fps;
  return (
    <Audio
      src={staticFile(`audio/${audio.file}`)}
      trimBefore={Math.round(audio.startSeconds * fps)}
      volume={(f) =>
        audio.volume *
        interpolate(f, [0, 3, fadeStart, DURATION_FRAMES - 1], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      }
    />
  );
};

/** Small seal in the corner while the work is on screen; it hands over to the big one at the end. */
const CornerSeal: React.FC<{ until: number }> = ({ until }) => {
  const frame = useCurrentFrame();
  const t = ramp(frame, 18, 30, ease.out);
  const out = ramp(frame, until - 10, 10, ease.in);
  if (frame > until) return null;
  return (
    <div style={{ position: 'absolute', right: 46, top: 38, opacity: 1 - out, filter: `drop-shadow(0 6px 18px rgba(0,0,0,0.6))` }}>
      <Logo size={112} rings={t} mark={ramp(frame, 26, 16, ease.out)} word={ramp(frame, 32, 16, ease.out)} rule={ramp(frame, 36, 16)} arc={ramp(frame, 34, 40, ease.inOut)} glow={0.25} />
    </div>
  );
};

export const Showreel: React.FC<ShowreelProps> = ({ platform, locale, mute }) => {
  const settings = useMemo(() => settingsFor(platform, locale), [platform, locale]);
  const timeline = useMemo(() => buildTimeline(settings.platform.order, settings.platform.bars), [settings]);
  const closing = timeline.find((t) => t.id === 'closing')!;
  return (
    <ShowContext.Provider value={settings}>
      <AbsoluteFill style={{ background: brand.colors.black }}>
        {timeline.map((entry, i) => {
          const Scene = SCENES[entry.id];
          const isLast = i === timeline.length - 1;
          const sb = startBar(entry);
          const cue = (n: number) => bar(sb + n) - entry.from;
          const enter = ENTRANCE[entry.id];
          return (
            <Sequence
              key={entry.id}
              name={entry.id}
              from={entry.from}
              durationInFrames={entry.durationInFrames + (isLast ? 0 : TRANSITION_FRAMES)}
            >
              <Wipe kind={i === 0 ? 'none' : enter.kind} origin={enter.origin} duration={TRANSITION_FRAMES}>
                <Scene durationInFrames={entry.durationInFrames} cue={entry.id === 'opening' ? (n) => bar(n) : cue} />
              </Wipe>
            </Sequence>
          );
        })}
        <CornerSeal until={closing.from + 8} />
        {!mute && <Soundtrack />}
      </AbsoluteFill>
    </ShowContext.Provider>
  );
};
