// Contra service cover: text and the real captures each variant uses.
// Contra shows service covers at 4:3; the cover is laid out at 1600 × 1200.

export const CONTRA = { width: 1600, height: 1200, safe: 96 } as const;

export type Capture = { src: string; css: readonly [number, number] };

export const captures = {
  /** Lancheria Meia-Noite raio-x, wide screen: exploded stack with every callout. */
  lancheriaRaiox: { src: 'gallery/lancheria-raiox.png', css: [1440, 1200] },
  /** Lancheria Meia-Noite raio-x on a phone. */
  lancheriaRaioxPhone: { src: 'portfolio/lm-raiox.png', css: [390, 844] },
  /** Hard Eletric home hero, desktop and phone (client site). */
  hardEletricHome: { src: 'portfolio/he-home.png', css: [1440, 900] },
  hardEletricPhone: { src: 'portfolio/he-mobile.png', css: [390, 844] },
} as const satisfies Record<string, Capture>;

export const contraCopy = {
  /** Main cover: the interaction leads, a real client site on the phone. */
  main: {
    file: 'contra-service-cover-willdev',
    headline: ['Custom', 'Websites'],
    secondary: ['Premium design &', 'interactive animations'],
    /** Tail of the secondary line drawn with the pink underline. */
    secondaryKey: 'interactive animations',
  },
  /** Alternate: the business site leads, the interaction on the phone. */
  alt: {
    file: 'contra-service-cover-willdev-alt',
    headline: ['Custom Websites'],
    secondary: ['Built to make your business stand out.'],
    secondaryKey: 'stand out.',
  },
  brand: 'WillDev',
};

export type ContraVariant = 'main' | 'alt';
