// WillDev brand: the single source for name, colours, fonts and logo settings.
// Colours were sampled from assets/brand/ and tuned into one coherent set.

export const brand = {
  /** Always one word, as in the logo. */
  name: 'WillDev',
  colors: {
    /** Titles, the logo W and wordmark. Between the logo lime and the warmer lime of the posts. */
    lime: '#C2F70C',
    limeGlow: 'rgba(194, 247, 12, 0.45)',
    /** Secondary phrases, underlines, the logo arc. */
    pink: '#FF1F78',
    pinkGlow: 'rgba(255, 31, 120, 0.5)',
    graphite: '#0D1015',
    graphiteLight: '#171B22',
    black: '#030102',
    /** Neon connector line and small white labels. */
    white: '#F4F4EF',
    whiteGlow: 'rgba(244, 244, 239, 0.55)',
    /** Thin logo rings and hairlines. */
    gray: '#5B5E64',
    muted: '#9A9DA4',
  },
  fonts: {
    /** Heavy geometric grotesk for headlines (@fontsource/space-grotesk, OFL). */
    display: '"Space Grotesk", sans-serif',
    /** Square technical face for small labels (@fontsource/chakra-petch, OFL). */
    label: '"Chakra Petch", sans-serif',
    /** Logo wordmark; converted to outlines by scripts/build-logo.mjs (@fontsource/lexend, OFL). */
    logo: '"Lexend", sans-serif',
  },
  logo: {
    /** Sweep of the pink arc when the logo is at rest, in degrees (clockwise from 12 o'clock). */
    arcSweep: 77,
    /** The original outer ring of technology names is omitted on purpose (it had errors). */
    showTechRing: false,
  },
} as const;

export type Brand = typeof brand;
