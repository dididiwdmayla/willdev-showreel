import { Easing, interpolate } from 'remotion';

/** House curves: precise, quick out, soft landing. No elastic bounces. */
export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  /** Fast attack, hard stop — used for "press" moments. */
  snap: Easing.bezier(0.85, 0, 0.15, 1),
};

/** Clamped 0→1 between two frames. */
export function ramp(frame: number, start: number, duration: number, easing: (t: number) => number = ease.out) {
  return interpolate(frame, [start, start + Math.max(1, duration)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });
}

export function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
