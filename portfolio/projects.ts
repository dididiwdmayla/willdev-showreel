// Portfolio covers: one entry per project. Text, colours and captures live here;
// the arrangement of each cover lives in portfolio/layouts.tsx.
//
// Captures are in portfolio/captures/ (served to Remotion as public/portfolio/),
// PNG at 2× of the CSS size given here.

export type Capture = { src: string; css: readonly [number, number] };

const cap = (name: string, css: readonly [number, number]): Capture => ({ src: `portfolio/${name}.png`, css });

export const shots = {
  heHome: cap('he-home', [1440, 900]),
  heQuadro: cap('he-quadro', [1440, 900]),
  heMobile: cap('he-mobile', [390, 844]),
  vgHome: cap('vg-home', [1280, 690]),
  vgServicos: cap('vg-servicos', [1280, 800]),
  vgGaleria: cap('vg-galeria', [1280, 800]),
  vgMobile: cap('vg-mobile', [390, 844]),
  lmHome: cap('lm-home', [1440, 900]),
  lmRaiox: cap('lm-raiox', [390, 844]),
  lmTrilho: cap('lm-trilho', [1280, 720]),
  imEntrada: cap('im-entrada', [1440, 900]),
  imArvore: cap('im-arvore', [1440, 900]),
  imFloresta: cap('im-floresta', [1440, 900]),
  advHome: cap('adv-home', [1440, 900]),
  advArtigo: cap('adv-artigo', [1440, 900]),
  advMobile: cap('adv-mobile', [390, 844]),
} as const;

export type Theme = {
  /** Background, and the soft light behind the work. */
  bg: string;
  glow: string;
  /** Project name and header rule. */
  ink: string;
  /** Descriptor caps. */
  label: string;
  /** The project's own signature colour, for the thin support graphics. */
  accent: string;
  /** Colour of the W in the header (lime unless the background is light). */
  mark?: string;
};

export type LayoutId = 'hardEletric' | 'vg' | 'lancheria' | 'interativMind' | 'advocacia';

export type Project = {
  /** Output file name (without .png). */
  file: string;
  name: string;
  descriptor: string;
  /** Honest provenance, shown small in the header. */
  kind: 'Client project' | 'Concept project' | 'Personal project';
  layout: LayoutId;
  theme: Theme;
};

const LIME = '#C2F70C';
const WHITE = '#F4F4EF';

export const projects: Project[] = [
  {
    file: 'portfolio-hard-eletric',
    name: 'Hard Eletric',
    descriptor: 'Custom Business Website',
    kind: 'Client project',
    layout: 'hardEletric',
    // The site's own near-black and instrument blue.
    theme: { bg: '#07090C', glow: '#0C2238', ink: WHITE, label: LIME, accent: '#2B8CE8' },
  },
  {
    // The client's site and logo read "VG Construção".
    file: 'portfolio-vg-construcoes',
    name: 'VG Construção',
    descriptor: 'Business Website',
    kind: 'Client project',
    layout: 'vg',
    // The site's navy and safety yellow.
    theme: { bg: '#081127', glow: '#16305F', ink: WHITE, label: LIME, accent: '#F5C518' },
  },
  {
    file: 'portfolio-lancheria-meia-noite',
    name: 'Lancheria Meia-Noite',
    descriptor: 'Interactive Restaurant Website',
    kind: 'Concept project',
    layout: 'lancheria',
    // The site's "borra" brown and brass.
    theme: { bg: '#0F0A08', glow: '#3B2414', ink: WHITE, label: LIME, accent: '#A9762F' },
  },
  {
    file: 'portfolio-interativmind',
    // The product writes its name with a lowercase i.
    name: 'interativMind',
    descriptor: 'Creative Learning Platform',
    kind: 'Personal project',
    layout: 'interativMind',
    // Night indigo and the gold of the kintsugi veins.
    theme: { bg: '#0C1428', glow: '#22345C', ink: WHITE, label: LIME, accent: '#DDAA4C' },
  },
  {
    file: 'portfolio-advocacia-demo',
    name: 'Advocacia Demo',
    descriptor: 'Editorial Law Website',
    kind: 'Concept project',
    layout: 'advocacia',
    // The site's paper and deep green; the only light cover of the set.
    theme: { bg: '#EFEBE2', glow: '#FBF9F4', ink: '#17211C', label: '#1F4A36', accent: '#1F4A36', mark: '#17211C' },
  },
];
