// Restaurant commercial: Chapa Burger (concept, four real variants) + Ingarandi
// Burger (client, real ordering flow on Mercado Pago's test environment).
//
// Timing: 30 fps, 408 frames (13.6 s). The soundtrack is "WillDev Burger Funk"
// (assets/audio/willdev-burger-funk.wav), written for this cut: 141.2 BPM, bars
// of ~51 frames from frame 0.7. Every cut below sits on one of its beats or
// accents (see SCENES); its biggest hit (12.35 s, frame 371) lands the coin.

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
  /** "WillDev Burger Funk", instrumental made for this commercial (13.6 s). */
  file: 'audio/willdev-burger-funk.wav',
  /** Seconds into the file where the commercial starts. */
  start: 0,
  gain: 0.82,
  /** Music dips this much (linear) under the purchase, so taps and the confirmation read clearly. */
  duck: 0.7,
  /** Frames of fade-out at the end (the track already ends on its own tail). */
  fadeOut: 8,
} as const;

/** Beat grid of the music: 141.2 BPM, first beat at frame 0.7. */
export const BEAT = (60 / 141.2) * FPS;
/** Beat n → frame. */
export const beat = (n: number) => Math.round(0.7 + n * BEAT);

export const SCENES = {
  hero: { from: 0, to: beat(4) }, // 0–51: the Chapa opening (bar 1)
  lens: { from: beat(4), to: beat(8) }, // 51–103: the camera dives into the lens (bar 2)
  balcao: { from: beat(8), to: beat(10) }, // 103–128: downbeat of bar 3
  sala: { from: beat(10), to: beat(12) }, // 128–154
  praca: { from: beat(12), to: beat(14) }, // 154–179: downbeat of bar 4
  grid: { from: beat(14), to: beat(17) }, // 179–217: the four side by side
  bridge: { from: beat(17), to: beat(19) }, // 217–243: to Ingarandi (the burger crosses on the 237 accent)
  order: { from: beat(19), to: 348 }, // 243–348: the purchase, over the track's quieter break; "Pago!" on the 332 accent
  coin: { from: 348, to: DURATION }, // 348–408: coin lands on the track's biggest hit (371), line on 383
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
  { take: 'ingarandi-pedido', from: 8, to: 38, frames: 14, step: 0 }, // ESCOLHER → customise sheet
  { take: 'ingarandi-pedido', from: 40, to: 64, frames: 17, step: 1 }, // ADICIONAR → "Na sacola!"
  { take: 'ingarandi-pedido', from: 66, to: 92, frames: 14, step: 2 }, // cart drawer → FINALIZAR
  { take: 'ingarandi-pedido', from: 106, to: 141, frames: 19, step: 3 }, // Pagar online → Cartão → Ir para pagamento
  { take: 'mp-review', from: 0, to: 0, frames: 17, step: 4 }, // Mercado Pago Checkout Pro (test), "Pagar"
  { take: 'ingarandi-aguardando', from: 0, to: 8, frames: 8, step: 4 }, // order page: still waiting for Mercado Pago's confirmation
  { take: 'ingarandi-pago', from: 0, to: 16, frames: 16, step: 5 }, // order page: Pago!
] as const;

/** Where the "Pago!" check sits on the order page (css px of the 390-wide phone), the coin's birthplace. */
export const PAID_CHECK = { x: 89, y: 273 };
