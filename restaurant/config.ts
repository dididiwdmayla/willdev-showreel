// Restaurant commercial: Chapa Burger (concept, four real variants) + Ingarandi
// Burger (client, real ordering flow on Mercado Pago's test environment).
//
// Timing: 30 fps, 408 frames (13.6 s). The soundtrack is the brand track
// (assets/audio/lucky-draw.m4a) from its second drop at 97.65 s, 117.45 BPM:
// one beat = 15.33 frames. Every cut below sits on a beat (see BEATS).

import meta from '../footage/capture-meta.json';

export const FPS = 30;
export const DURATION = 408;
/**
 * Music bed. Replaceable without touching any scene: drop the file in
 * assets/audio/ (served as audio/<file>) and change `file`/`start` here, or
 * pass the props `music` / `musicStart` (render.mjs: --music= --music-start=).
 * The cuts follow the beat grid of this track (BEAT); a new track at another
 * tempo keeps the same cuts, they just stop landing exactly on its beats.
 */
export const MUSIC = {
  /** Brand track "Lucky Draw" (Suno), the same one as the institutional commercial. */
  file: 'audio/lucky-draw.m4a',
  /** Seconds into the file where the commercial starts: its second drop. */
  start: 97.65,
  gain: 0.9,
  /** Frames of fade-out at the end. */
  fadeOut: 30,
} as const;

export const BEAT = (60 / 117.45) * FPS;
/** Beat n → frame. */
export const beat = (n: number) => Math.round(n * BEAT);

export const SCENES = {
  hero: { from: 0, to: beat(3) }, // 0–46: the Chapa opening
  lens: { from: beat(3), to: beat(7) }, // 46–107: the lens on a burger
  balcao: { from: beat(7), to: beat(9) }, // 107–138
  sala: { from: beat(9), to: beat(11) }, // 138–169
  praca: { from: beat(11), to: beat(13) }, // 169–199
  grid: { from: beat(13), to: beat(15) }, // 199–230: the four side by side
  bridge: { from: beat(15), to: beat(16) }, // 230–245: to Ingarandi
  order: { from: beat(16), to: beat(23) }, // 245–352: the purchase ("Pago!" lands on beat 22, frame 337)
  coin: { from: beat(23), to: DURATION }, // 352–408: coin + signature
} as const;

export type Aspect = '16x9' | '1x1' | '9x16';
export const SIZES: Record<Aspect, { width: number; height: number }> = {
  '16x9': { width: 1920, height: 1080 },
  '1x1': { width: 1080, height: 1080 },
  '9x16': { width: 1080, height: 1920 },
};

/** Captured takes (footage/), with their pixel size. */
export const TAKES = {
  desktop: { width: 2560, height: 1600, css: 2 },
  mobile: { width: 1170, height: 2532, css: 3 },
} as const;

export type Variant = 'chapa' | 'balcao' | 'sala' | 'praca';
export const VARIANTS: Variant[] = ['chapa', 'balcao', 'sala', 'praca'];

type Pt = { x: number; y: number };
type DesktopMeta = { A: Pt; B: Pt; menuY: number; pointer: ([number, number] | null)[] };
type MobileMeta = { A: Pt; B: Pt; pointer: { frame: number; x: number; y: number }[] };
type Tap = { frame: number; x: number; y: number; label: string };

const M = meta as unknown as Record<string, unknown>;
export const desktopMeta = (v: Variant) => M[`chapa-${v}-d`] as DesktopMeta;
export const mobileMeta = (v: Variant) => M[`chapa-${v}-m`] as MobileMeta;
export const orderTaps = (M['ingarandi-pedido'] as { taps: Tap[] }).taps;
export const purchase = M['ingarandi-compra'] as { order: string; pay: Pt };

/**
 * The purchase, cut into steps. Each step plays [from, to] of a take inside
 * `frames` output frames (so the take is sped up a little, never slowed).
 * `step` indexes the localized step labels.
 */
export const ORDER_STEPS = [
  { take: 'ingarandi-pedido', from: 8, to: 38, frames: 15, step: 0 }, // ESCOLHER → customise sheet
  { take: 'ingarandi-pedido', from: 40, to: 64, frames: 18, step: 1 }, // ADICIONAR → "Na sacola!"
  { take: 'ingarandi-pedido', from: 66, to: 92, frames: 15, step: 2 }, // cart drawer → FINALIZAR
  { take: 'ingarandi-pedido', from: 106, to: 141, frames: 20, step: 3 }, // Pagar online → Cartão → Ir para pagamento
  { take: 'mp-review', from: 0, to: 0, frames: 16, step: 4 }, // Mercado Pago Checkout Pro (test), "Pagar"
  { take: 'ingarandi-aguardando', from: 0, to: 8, frames: 8, step: 4 }, // order page: still waiting for Mercado Pago's confirmation
  { take: 'ingarandi-pago', from: 0, to: 15, frames: 15, step: 5 }, // order page: Pago!
] as const;

/** Where the "Pago!" check sits on the order page (css px of the 390-wide phone), the coin's birthplace. */
export const PAID_CHECK = { x: 89, y: 273 };
