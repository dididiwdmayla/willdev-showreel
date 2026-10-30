import React from 'react';
import { brand } from '../config/branding';
import { Browser, Phone, Shot } from '../gallery/components';
import { fitSize } from '../src/components/Type';
import type { Capture, Project } from './projects';

/** Same proportions as the Fiverr gallery (1280 × 769); rendered at 2×. */
export const COVER = { width: 1280, height: 769, margin: 64, headerY: 52 } as const;

/** Title block: project name (editorial grotesk) and descriptor (square caps with the pink dash). */
export const Title: React.FC<{ project: Project; x: number; y: number; maxWidth: number; size?: number; align?: 'left' | 'right' }> = ({
  project,
  x,
  y,
  maxWidth,
  size = 60,
  align = 'left',
}) => {
  const t = project.theme;
  const words = project.name.split(' ');
  // Long names break into two balanced lines instead of shrinking too far.
  const lines = fitSize(project.name, size, maxWidth, 600) >= size * 0.86 || words.length < 2 ? [project.name] : [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')];
  const fs = Math.min(...lines.map((l) => fitSize(l, size, maxWidth, 600)));
  return (
    <div style={{ position: 'absolute', left: align === 'left' ? x : undefined, right: align === 'right' ? COVER.width - x : undefined, top: y, textAlign: align }}>
      {lines.map((l) => (
        <div key={l} style={{ fontFamily: brand.fonts.display, fontWeight: 600, fontSize: fs, lineHeight: 1.02, letterSpacing: '-0.035em', color: t.ink, whiteSpace: 'nowrap' }}>
          {l}
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18, justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
        <span style={{ width: 24, height: 3, background: brand.colors.pink }} />
        <span style={{ fontFamily: brand.fonts.label, fontWeight: 600, fontSize: 17, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.label }}>{project.descriptor}</span>
      </div>
    </div>
  );
};

type Crop = { x: number; y: number; w: number; h: number };

/** Real captures placed on the cover: browser window, phone, or a plain card (a detail). */
export const put = {
  browser: (x: number, y: number, width: number, contentHeight: number, image: Capture, crop?: Crop, style?: React.CSSProperties) => (
    <Browser x={x} y={y} width={width} contentHeight={contentHeight} shot={{ image, crop }} style={style} />
  ),
  phone: (x: number, y: number, width: number, image: Capture, style?: React.CSSProperties) => (
    <Phone x={x} y={y} width={width} height={Math.round(width * 2.1)} shot={{ image }} style={style} />
  ),
  card: (x: number, y: number, width: number, height: number, image: Capture, crop?: Crop, style?: React.CSSProperties) => (
    <Shot
      image={image}
      crop={crop}
      width={width}
      height={height}
      style={{ position: 'absolute', left: x, top: y, borderRadius: 12, boxShadow: '0 30px 80px rgba(0,0,0,0.55)', ...style }}
    />
  ),
};
