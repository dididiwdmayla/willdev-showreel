/** Every scene gets its length and a cue function: bars from the scene start → local frame. */
export type SceneProps = {
  durationInFrames: number;
  cue: (bars: number) => number;
};

/** Splits a phrase into two lines of similar length (one line if it is short). */
export function balance(text: string, maxSingle = 12): [string, string | null] {
  if (text.length <= maxSingle) return [text, null];
  const words = text.split(' ');
  if (words.length < 2) return [text, null];
  let best = 1;
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ').length;
    const b = words.slice(i).join(' ').length;
    // Ties go to the longer second line, which reads better on screen.
    const diff = Math.abs(a - b) + (b >= a ? 0 : 0.5);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  }
  return [words.slice(0, best).join(' '), words.slice(best).join(' ')];
}
