// Platform variants. A new marketplace or a new Gig is one entry here — the
// animation components never mention a platform by name.
//
// Fiverr Gig video rules this file must respect: up to 75 s, under 50 MB, MP4,
// landscape; no phone, e-mail, URL or call to work outside Fiverr; no Fiverr
// level badges, stars or metrics; only own content; and one video per Gig —
// so every Gig gets its own variant (order, emphasis, closing text).

import type { SceneId } from './timing';

export type Platform = {
  id: string;
  /** Shown only through the {platform} placeholder in the closing CTA. Null = never named. */
  displayName: string | null;
  /** Closing call to action: neutral brand line, or "message me here on {platform}". */
  cta: 'neutral' | 'platform';
  /** Scene order. The closing is always last. */
  order: SceneId[];
  /** Optional per-scene length in bars (see sceneBars in config/timing.ts). Keep the sum at 14. */
  bars?: Partial<Record<SceneId, number>>;
  /** Project shown on the closing card behind the logo. */
  featured: 'interativmind' | 'lancheria' | 'hardeletric' | 'vg';
  /** Whether contact details may appear at all. Marketplaces: never. */
  allowContact: false;
};

const DEFAULT_ORDER: SceneId[] = ['opening', 'lancheria', 'hardeletric', 'vg', 'interativmind', 'closing'];

export const platforms = {
  /** WillDev only, no marketplace mention. */
  neutral: {
    id: 'neutral',
    displayName: null,
    cta: 'neutral',
    order: DEFAULT_ORDER,
    featured: 'interativmind',
    allowContact: false,
  },
  /** Fiverr Gig: interactive / premium websites (default Gig). */
  fiverr: {
    id: 'fiverr',
    displayName: 'Fiverr',
    cta: 'platform',
    order: DEFAULT_ORDER,
    featured: 'interativmind',
    allowContact: false,
  },
  /** Example of a second Fiverr Gig (business websites): real clients first, different closing card. */
  'fiverr-business': {
    id: 'fiverr-business',
    displayName: 'Fiverr',
    cta: 'platform',
    order: ['opening', 'hardeletric', 'vg', 'lancheria', 'interativmind', 'closing'],
    bars: { vg: 3, interativmind: 2 },
    featured: 'vg',
    allowContact: false,
  },
  /** Upwork or a portfolio page can reuse the same pieces. */
  upwork: {
    id: 'upwork',
    displayName: 'Upwork',
    cta: 'platform',
    order: DEFAULT_ORDER,
    featured: 'interativmind',
    allowContact: false,
  },
} satisfies Record<string, Platform>;

export type PlatformId = keyof typeof platforms;
