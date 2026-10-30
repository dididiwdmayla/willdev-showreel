// English copy for the three Fiverr gallery images.
// Every word added on top of the captures lives here; the total per image must
// stay at 10 or fewer (checked by gallery/render.mjs). Headlines are split into
// lines by hand so each language can break where it reads best.

export const en = {
  customWebsites: {
    headline: ['CUSTOM', 'WEBSITES.'],
    sub: ['BUILT TO', 'STAND OUT.'],
    /** Words of `sub` drawn with the pink underline. */
    subKey: 'STAND OUT.',
    /** Small tag next to the demo: it is a concept, not a client. */
    tag: 'Restaurant concept',
  },
  businessProjects: {
    headline: ['DESIGNED FOR', 'REAL BUSINESSES.'],
    headlineKey: 'REAL BUSINESSES.',
    hardEletric: { name: 'Hard Eletric', kind: 'Electrical' },
    vg: { name: 'VG Construção', kind: 'Construction' },
  },
  creativeDesign: {
    headline: ['MORE THAN JUST', 'A TEMPLATE.'],
    headlineKey: 'TEMPLATE.',
    /** interativMind is shown as an example of creative direction, not as a package feature. */
    interativMind: 'Creative concept',
    advocacia: 'Law firm concept',
  },
};

export type GalleryCopy = typeof en;
