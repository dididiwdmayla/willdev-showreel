// Timing of the whole piece, derived from the beat grid in config/track.ts.
// Scenes start on bar lines; changing the track only means re-running
// scripts/analyze-audio.py — nothing in the scenes needs to change.

import { track } from './track';

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
/** Hard limit of the deliverable. */
export const DURATION_SECONDS = 35;
export const DURATION_FRAMES = DURATION_SECONDS * FPS;

export const audio = {
  /** File inside assets/audio/ (served to Remotion as public/audio/). */
  file: track.file as string | null,
  /** Where the 35 s window starts inside the source track, in seconds. */
  startSeconds: track.windowStart,
  fadeOutSeconds: 1.5,
  volume: 0.9,
};

/** Beat times in video seconds (0 = first frame). */
export const beatSeconds: number[] = track.beats.map((b) => b - track.windowStart);
export const beatFrames: number[] = beatSeconds.map((s) => Math.round(s * FPS));
const BEATS_PER_BAR = 4;
/** First beat of every bar, in frames. Bar 0 is the drop. */
export const barFrames: number[] = beatFrames.filter((_, i) => i % BEATS_PER_BAR === 0);

/** Frame of bar `n` (fractional bars allowed, e.g. 2.5), extrapolated past the analysed grid. */
export function bar(n: number): number {
  const whole = Math.floor(n);
  const frac = n - whole;
  const barLen = (60 / track.bpm) * BEATS_PER_BAR * FPS;
  const at = (i: number) => (i < barFrames.length ? barFrames[i] : barFrames[barFrames.length - 1] + (i - barFrames.length + 1) * barLen);
  return Math.round(at(whole) + frac * (at(whole + 1) - at(whole)));
}

/** Frame of beat `n` (0 = the drop). */
export function beat(n: number): number {
  const beatLen = (60 / track.bpm) * FPS;
  return n < beatFrames.length ? beatFrames[n] : Math.round(beatFrames[beatFrames.length - 1] + (n - beatFrames.length + 1) * beatLen);
}

export type SceneId = 'opening' | 'lancheria' | 'hardeletric' | 'vg' | 'interativmind' | 'closing';

/**
 * Length of each scene in bars. The opening also owns the half-second before the drop.
 * Default order adds up to 14 bars + lead-in ≈ 29 s, leaving ~6 s for the closing.
 */
export const sceneBars: Record<Exclude<SceneId, 'closing'>, number> = {
  opening: 3,
  lancheria: 3,
  hardeletric: 3,
  vg: 2,
  interativmind: 3,
};

/** Moments inside scenes, in bars from the scene start. */
export const cues = {
  opening: { firstLine: 1, secondLine: 2 },
  lancheria: { phone: 1.25, press: 2.25 },
  /** In the default order this lands on the one-bar break in the track, and the relight on its return. */
  hardeletric: { board: 1, relight: 2 },
  vg: { phone: 0.5 },
  interativmind: { mature: 2 },
  closing: { line: 0.5, cta: 1.5 },
};

export type TimelineEntry = { id: SceneId; from: number; durationInFrames: number };

/** Lays the scenes end to end on bar lines, in the given order; the closing takes what is left. */
export function buildTimeline(order: SceneId[], bars: Partial<Record<SceneId, number>> = {}): TimelineEntry[] {
  const out: TimelineEntry[] = [];
  let barCursor = 0;
  let from = 0;
  for (const id of order) {
    if (id === 'closing') continue;
    const len = bars[id] ?? sceneBars[id as keyof typeof sceneBars];
    const end = bar(barCursor + len);
    out.push({ id, from, durationInFrames: end - from });
    from = end;
    barCursor += len;
  }
  out.push({ id: 'closing', from, durationInFrames: DURATION_FRAMES - from });
  return out;
}

/** Transition overlap at every cut, in frames. */
export const TRANSITION_FRAMES = 12;
