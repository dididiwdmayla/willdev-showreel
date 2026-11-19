import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COVER, put, Title } from './parts';
import { shots, type LayoutId, type Project } from './projects';

// One arrangement per project, on the shared 1280 × 769 grid (64 px margins).
// Same system — header, title block, real captures — with a different composition
// and one quiet support graphic in the project's own colour.

const M = COVER.margin;
const R = COVER.width - M;

type LayoutProps = { project: Project };

/** Hard Eletric: technical. Desktop hero, and the switched-on board with its schematic as a close-up. */
const HardEletric: React.FC<LayoutProps> = ({ project }) => {
  const a = project.theme.accent;
  return (
    <>
      {/* Blueprint grid in the site's instrument blue, fading out to the left. */}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${a}22 1px, transparent 1px), linear-gradient(90deg, ${a}22 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'linear-gradient(90deg, transparent 20%, #000 75%)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent 20%, #000 75%)',
          opacity: 0.6,
        }}
      />
      <Title project={project} x={M} y={112} maxWidth={360} size={60} />
      {/* Home hero, without the empty band of the next section. */}
      {put.browser(452, 118, R - 452, 440, shots.heHome, { x: 0, y: 0, w: 1440, h: 830 })}
      {/* The board photo of the "Sobre" page: schematic traced, blade closed, light on. */}
      {put.card(M, 364, 432, 324, shots.heQuadro, { x: 100, y: 152, w: 757, h: 568 }, { border: `1px solid ${a}66` })}
    </>
  );
};

/** VG Construção: solid and structured. Three pages of the site in cascade, the phone in front. */
const Vg: React.FC<LayoutProps> = ({ project }) => {
  const a = project.theme.accent;
  const w = 560;
  return (
    <>
      {put.browser(404, 96, w, 302, shots.vgHome)}
      {put.browser(506, 200, w, 350, shots.vgServicos)}
      {put.browser(608, 304, w, 350, shots.vgGaleria, undefined, { width: w })}
      {put.phone(R - 150, 356, 150, shots.vgMobile)}
      <Title project={project} x={M} y={548} maxWidth={420} size={58} />
      {/* Safety-tape stripe, the site's own motif. */}
      <div
        style={{
          position: 'absolute',
          left: M,
          top: 506,
          width: 120,
          height: 8,
          backgroundImage: `repeating-linear-gradient(135deg, ${a} 0 10px, transparent 10px 20px)`,
          opacity: 0.9,
        }}
      />
    </>
  );
};

/** Lancheria Meia-Noite: appetite and play. The home and menu, and the raio-x opening the sandwich on the phone. */
const Lancheria: React.FC<LayoutProps> = ({ project }) => {
  const a = project.theme.accent;
  return (
    <>
      <Title project={project} x={M} y={112} maxWidth={330} size={58} />
      {/* "Na prensa": the centre sandwich pressed, its neighbours open in layers. */}
      {put.browser(504, 96, 420, 197, shots.lmTrilho, { x: 0, y: 0, w: 1280, h: 600 })}
      {/* Home: sign, hero and menu. */}
      {put.browser(M, 340, 656, 342, shots.lmHome, { x: 0, y: 0, w: 1440, h: 750 })}
      {/* Phone: the raio-x, every ingredient separated. */}
      {put.phone(R - 268, 128, 268, shots.lmRaiox, { boxShadow: `0 50px 120px rgba(0,0,0,0.75), 0 0 0 1px ${a}66` })}
    </>
  );
};

/** interativMind: art direction first. The painted entrance as a hanging scroll, the knowledge tree in the app. */
const InterativMind: React.FC<LayoutProps> = ({ project }) => {
  const a = project.theme.accent;
  return (
    <>
      {/* Moonlight behind the painting. */}
      <div
        style={{
          position: 'absolute',
          left: 930,
          top: 120,
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${a}26 0%, transparent 70%)`,
        }}
      />
      {put.browser(M, 104, 740, 462, shots.imArvore, { x: 96, y: 0, w: 1344, h: 840 })}
      {put.card(R - 330, 96, 330, 482, shots.imEntrada, { x: 470, y: 82, w: 498, h: 728 }, { border: `1px solid ${a}55` })}
      <Title project={project} x={R} y={604} maxWidth={420} size={58} align="right" />
    </>
  );
};

/** Advocacia Demo: sober and editorial. Home and an article page, on paper, with a double rule. */
const Advocacia: React.FC<LayoutProps> = ({ project }) => {
  const a = project.theme.accent;
  const shadow = { boxShadow: '0 30px 70px rgba(30,40,30,0.22), 0 0 0 1px rgba(23,33,28,0.10)' };
  return (
    <>
      <Title project={project} x={M} y={112} maxWidth={340} size={58} />
      <div style={{ position: 'absolute', left: M, top: 300, width: 300, borderTop: `1px solid ${a}`, borderBottom: `1px solid ${a}`, height: 5, opacity: 0.55 }} />
      {put.browser(560, 92, R - 560, 410, shots.advArtigo, undefined, shadow)}
      {put.browser(420, 300, 600, 375, shots.advHome, undefined, shadow)}
      {put.phone(1040, 400, 140, shots.advMobile, { boxShadow: '0 30px 70px rgba(30,40,30,0.3)' })}
    </>
  );
};

export const LAYOUTS: Record<LayoutId, React.FC<LayoutProps>> = {
  hardEletric: HardEletric,
  vg: Vg,
  lancheria: Lancheria,
  interativMind: InterativMind,
  advocacia: Advocacia,
};
