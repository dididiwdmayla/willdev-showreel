// Instagram cuts of the commercial: 9:16 (Reels/Stories, 1080×1920) and 4:5 (feed, 1080×1350).
// The vertical scenes are composed for the phone, not cropped from 16:9:
// work is stacked (headline on top, then the screen), screens get closer,
// and type stays inside Instagram's safe area.
import { useShow } from '../../context';

export const W = 1080;
/** Margin from the frame edges for type (Instagram's own UI hugs the sides). */
export const SIDE = 64;

/**
 * Reels/Stories draw the account name, caption and buttons over the bottom
 * ~20 % and the "Reels" bar over the top ~10 %. Text lives between these lines.
 */
export const SAFE = {
  tall: { top: 210, bottom: 1560 },
  feed: { top: 56, bottom: 1300 },
};

export function useFormat() {
  const { aspect } = useShow();
  const tall = aspect === '9x16';
  return {
    tall,
    H: tall ? 1920 : 1350,
    safe: tall ? SAFE.tall : SAFE.feed,
    /** Value for Reels/Stories, value for the feed. */
    pick: <T,>(reels: T, feed: T): T => (tall ? reels : feed),
  };
}
