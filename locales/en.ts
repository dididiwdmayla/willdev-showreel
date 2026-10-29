// English copy. Every on-screen word lives here; components never hard-code text.
// Use {platform} where a marketplace name may appear — it comes from config/platforms.ts.

export const en = {
  opening: {
    line1: 'Not just a website.',
    line2: 'An experience.',
    /** Word of line2 that gets the pink underline. */
    line2Key: 'experience',
  },
  lancheria: {
    headline: ['Made', 'to', 'interact.'],
    label: 'Lancheria Meia-Noite',
    kind: 'Restaurant menu · Concept',
  },
  hardeletric: {
    headline: 'Built with precision.',
    label: 'Hard Eletric',
    kind: 'Electrical services · Client',
  },
  vg: {
    headline: 'Designed for real businesses.',
    sub: 'Desktop and mobile, from day one.',
    label: 'VG Construção',
    kind: 'Construction company · Client',
  },
  interativmind: {
    headline: 'Driven by imagination.',
    label: 'interativMind',
    kind: 'Learning hub · Concept',
  },
  closing: {
    line1: 'Your vision.',
    line2: 'Made real.',
    line2Key: 'real',
    services: ['Custom websites', 'Landing pages', 'Interactive experiences'],
    /** Neutral variant: no marketplace, no contact. */
    ctaNeutral: 'Let’s build something memorable.',
    /** Marketplace variant: keeps the conversation on the platform. */
    ctaPlatform: 'Message me here on {platform}',
  },
  thumbnail: {
    line1: 'Websites that',
    line2: 'feel alive.',
    line2Key: 'alive',
  },
};

export type Messages = typeof en;
