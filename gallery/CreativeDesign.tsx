import React from 'react';
import { Browser, Canvas, Headline, Shot, Tag, WMark } from './components';
import { galleryCopy, type GalleryLocale } from './copy';
import { GALLERY } from './layout';

/** InterativMind's own indigo, used only as light behind its painting. */
const INDIGO = '#1C2A48';

/** Edit positions here. All values in pixels of the 1280 × 769 canvas. */
const L = {
  /** interativMind entrance: the scroll painting (cherry tree, moon, handwritten name). */
  painting: { x: GALLERY.safe, y: GALLERY.safe, width: 380, height: 560, crop: { x: 470, y: 82, w: 498, h: 728 } },
  paintingTag: { x: GALLERY.safe, y: 664 },
  /** Advocacia home: engraved statue and editorial serif, a completely different language. */
  site: { x: 500, y: GALLERY.safe, width: 710, contentHeight: 400, crop: { x: 0, y: 0, w: 1440, h: 811 } },
  siteTag: { x: 500, y: 506 },
  headline: { x: 497, y: 552, size: 70, maxWidth: 640 },
  /** Signature in the free bottom-right corner, on the safe-area line. */
  mark: { right: GALLERY.safe, bottom: GALLERY.safe, size: 30 },
};

/** Image 3 — creative direction: two visual languages that could not come from the same template. */
export const CreativeDesign: React.FC<{ locale: GalleryLocale }> = ({ locale }) => {
  const c = galleryCopy[locale].creativeDesign;
  const p = L.painting;
  return (
    <Canvas glow={{ x: p.x + p.width / 2, y: p.y + p.height / 2, color: INDIGO, size: 420 }}>
      <Shot
        name="im-entrada"
        crop={p.crop}
        width={p.width}
        height={p.height}
        style={{
          position: 'absolute',
          left: p.x,
          top: p.y,
          borderRadius: 14,
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 30px 90px rgba(0,0,0,0.65)',
        }}
      />
      <WMark size={L.mark.size} style={{ left: GALLERY.width - L.mark.right - (L.mark.size * 462) / 308, top: GALLERY.height - L.mark.bottom - L.mark.size }} />
      <Tag text={c.interativMind} style={{ left: L.paintingTag.x, top: L.paintingTag.y }} />
      <Browser x={L.site.x} y={L.site.y} width={L.site.width} contentHeight={L.site.contentHeight} shot={{ name: 'adv-desktop', crop: L.site.crop }} />
      <Tag text={c.advocacia} style={{ left: L.siteTag.x, top: L.siteTag.y }} />
      <Headline
        lines={c.headline}
        size={L.headline.size}
        maxWidth={L.headline.maxWidth}
        underline={c.headlineKey}
        style={{ left: L.headline.x, top: L.headline.y }}
      />
    </Canvas>
  );
};
