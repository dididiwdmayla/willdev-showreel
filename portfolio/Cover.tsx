import React from 'react';
import { AbsoluteFill } from 'remotion';
import { z } from 'zod';
import { brand } from '../config/branding';
import { WMark } from '../gallery/components';
import { LAYOUTS } from './layouts';
import { COVER } from './parts';
import { projects, type Theme } from './projects';

export const coverSchema = z.object({ file: z.string() });

/** Header shared by every cover: the W, a hairline, and the project's provenance. */
const Header: React.FC<{ theme: Theme; kind: string }> = ({ theme, kind }) => (
  <>
    <WMark size={20} color={theme.mark} style={{ left: COVER.margin, top: COVER.headerY - 10 }} />
    <div
      style={{
        position: 'absolute',
        left: COVER.margin + 44,
        right: COVER.margin + 190,
        top: COVER.headerY,
        height: 1,
        background: theme.ink,
        opacity: 0.16,
      }}
    />
    <div
      style={{
        position: 'absolute',
        right: COVER.margin,
        top: COVER.headerY - 9,
        fontFamily: brand.fonts.label,
        fontWeight: 600,
        fontSize: 14,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: theme.ink,
        opacity: 0.72,
      }}
    >
      {kind}
    </div>
  </>
);

/** The cover: background in the project's own tone, shared header, then the project's layout. */
export const Cover: React.FC<z.infer<typeof coverSchema>> = ({ file }) => {
  const project = projects.find((p) => p.file === file);
  if (!project) throw new Error(`Unknown portfolio cover "${file}"`);
  const t = project.theme;
  const Layout = LAYOUTS[project.layout];
  return (
    <AbsoluteFill style={{ background: t.bg, overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 80% at 68% 52%, ${t.glow} 0%, ${t.bg} 72%)` }} />
      <Header theme={t} kind={project.kind} />
      <Layout project={project} />
    </AbsoluteFill>
  );
};

