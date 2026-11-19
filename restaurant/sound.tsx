// Sound: the music bed (replaceable, see restaurant/README.md) and the synthesised effects.
import React from 'react';
import { Audio } from '@remotion/media';
import { Sequence, interpolate, staticFile } from 'remotion';
import { DURATION, FPS, MUSIC, ORDER_STEPS, SCENES, desktopMeta, mobileMeta, type Aspect, type Variant } from './config';
import { desktop } from './shared';
import { VARIANT_TRIM } from './scenes/chapa';
import { STEP_STARTS, orderTapFrames } from './scenes/ingarandi';

type Hit = { at: number; sfx: string; gain: number };

export function soundtrack(a: Aspect): Hit[] {
  const lensOpen = (v: Variant, trim: number) => {
    if (desktop(a)) {
      const ptr = desktopMeta(v).pointer;
      const enter = ptr.findIndex((p, i) => i >= trim && p !== null && Math.abs(p[0] - desktopMeta(v).A.x) < 60 && Math.abs(p[1] - desktopMeta(v).A.y) < 60);
      return enter >= 0 ? enter - trim : 12;
    }
    return mobileMeta(v).pointer[0].frame - trim;
  };
  const hits: Hit[] = [
    { at: 0, sfx: 'impact', gain: 0.55 },
    { at: 40, sfx: 'whoosh', gain: 0.35 },
    { at: lensOpen('chapa', 0), sfx: 'lens', gain: 0.5 },
  ];
  if (!desktop(a)) hits.push({ at: mobileMeta('chapa').pointer[1].frame, sfx: 'lens', gain: 0.4 });
  const trim = desktop(a) ? VARIANT_TRIM.desktop : VARIANT_TRIM.mobile;
  for (const v of ['balcao', 'sala', 'praca'] as const) {
    hits.push({ at: SCENES[v].from - 2, sfx: 'swipe', gain: 0.45 });
    const lo = lensOpen(v, trim);
    if (lo > 0 && lo < 30) hits.push({ at: SCENES[v].from + lo, sfx: 'lens', gain: 0.3 });
  }
  hits.push({ at: SCENES.grid.from - 2, sfx: 'whoosh', gain: 0.4 });
  hits.push({ at: SCENES.bridge.from - 3, sfx: 'whoosh', gain: 0.55 });
  for (const t of orderTapFrames()) hits.push({ at: SCENES.order.from + t, sfx: 'tap', gain: 0.6 });
  const paid = STEP_STARTS[ORDER_STEPS.length - 1];
  hits.push({ at: SCENES.order.from + paid, sfx: 'confirm', gain: 0.6 });
  hits.push({ at: SCENES.coin.from + 2, sfx: 'spin', gain: 0.45 });
  hits.push({ at: SCENES.coin.from + 24, sfx: 'coin', gain: 0.75 });
  hits.push({ at: SCENES.coin.from + 30, sfx: 'impact', gain: 0.3 });
  return hits;
}


/** Music (any file under public/, from `start` seconds) plus the effects of this aspect. */
export const Soundtrack: React.FC<{ a: Aspect; music?: string; musicStart?: number }> = ({ a, music = MUSIC.file, musicStart = MUSIC.start }) => (
  <>
    <Audio
      src={staticFile(music)}
      trimBefore={Math.round(musicStart * FPS)}
      volume={(f) =>
        interpolate(f, [0, 2, DURATION - MUSIC.fadeOut, DURATION], [0, MUSIC.gain, MUSIC.gain, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      }
    />
    {soundtrack(a).map((h, i) => (
      <Sequence key={i} from={Math.max(0, h.at)} durationInFrames={60} layout="none">
        <Audio src={staticFile(`sfx/${h.sfx}.wav`)} volume={h.gain} />
      </Sequence>
    ))}
  </>
);
