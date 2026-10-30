import React from 'react';
import { NeonPath, roundedPath } from '../src/components/NeonPath';
import { Browser, Canvas, Headline, Tag, WMark } from './components';
import { galleryCopy, type GalleryLocale } from './copy';
import { GALLERY } from './layout';

/** Edit positions here. All values in pixels of the 1280 × 769 canvas. */
const L = {
  mark: { x: GALLERY.safe, y: GALLERY.safe, size: 30 },
  headline: { x: GALLERY.safe - 4, y: 196, size: 118, maxWidth: 480 },
  sub: { x: GALLERY.safe - 2, y: 448, size: 44, maxWidth: 470 },
  tag: { x: GALLERY.safe, y: 676 },
  /** Lancheria Meia-Noite raio-x, wide layout: title bar, exploded stack and callouts. */
  demo: { x: 590, y: 64, width: 620, contentHeight: 600, crop: { x: 0, y: 0, w: 1152, h: 1156 } },
  /** Neon rule from the text block into the window, landing on the "Bacon" callout of the raio-x. */
  line: [
    [GALLERY.safe, 600],
    [520, 600],
    [520, 400],
    [582, 400],
  ] as [number, number][],
};

/** Image 1 — impact: the offer in two seconds, proven by the most striking interaction. */
export const CustomWebsites: React.FC<{ locale: GalleryLocale }> = ({ locale }) => {
  const c = galleryCopy[locale].customWebsites;
  return (
    <Canvas glow={{ x: 930, y: 420, color: '#2A1A12', size: 640 }}>
      <WMark size={L.mark.size} style={{ left: L.mark.x, top: L.mark.y }} />
      <Headline lines={c.headline} size={L.headline.size} maxWidth={L.headline.maxWidth} style={{ left: L.headline.x, top: L.headline.y }} />
      <Headline
        lines={c.sub}
        size={L.sub.size}
        maxWidth={L.sub.maxWidth}
        pinkFrom={0}
        underline={c.subKey}
        lineHeight={1.12}
        style={{ left: L.sub.x, top: L.sub.y, letterSpacing: '-0.01em' }}
      />
      <NeonPath d={roundedPath(L.line, 22)} progress={1} head={false} width={2} opacity={0.85} />
      <Browser x={L.demo.x} y={L.demo.y} width={L.demo.width} contentHeight={L.demo.contentHeight} shot={{ name: 'lancheria-raiox', crop: L.demo.crop }} />
      <Tag text={c.tag} style={{ left: L.tag.x, top: L.tag.y }} />
    </Canvas>
  );
};
