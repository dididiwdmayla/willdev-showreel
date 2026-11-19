// Canvas and capture metadata shared by the three gallery images.

/** Fiverr gallery image size. */
export const GALLERY = { width: 1280, height: 769, safe: 70 } as const;

/**
 * Captures in gallery/captures/ (served to Remotion as public/gallery/).
 * `css` is the page size in CSS pixels; the PNGs are 2× that.
 * Crops below are given in CSS pixels of these pages.
 */
export const captures = {
  'lancheria-raiox': { css: [1440, 1200] },
  'he-desktop': { css: [1440, 900] },
  'he-mobile': { css: [390, 844] },
  'vg-desktop': { css: [1280, 690] },
  'vg-mobile': { css: [390, 844] },
  'im-floresta': { css: [1440, 900] },
  'im-entrada': { css: [1440, 900] },
  'adv-desktop': { css: [1440, 900] },
} as const;

export type CaptureName = keyof typeof captures;
export type Crop = { x: number; y: number; w: number; h: number };
