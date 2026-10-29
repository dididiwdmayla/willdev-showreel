import React from 'react';
import { measureText } from '@remotion/layout-utils';
import { brand } from '../config/branding';
import { NeonPath } from '../src/components/NeonPath';
import { Browser, Canvas, Headline, Phone, Tag, WMark } from './components';
import { galleryCopy, type GalleryLocale } from './copy';
import { GALLERY } from './layout';

/** Edit positions here. All values in pixels of the 1280 × 769 canvas. */
const L = {
  mark: { x: GALLERY.safe, y: GALLERY.safe, size: 30 },
  headline: { x: GALLERY.safe - 3, y: 312, size: 80, maxWidth: 500 },
  /** Hard Eletric row (top): home hero on desktop + services list on the phone. */
  he: {
    browser: { x: 610, y: GALLERY.safe, width: 420, contentHeight: 263 },
    phone: { x: 1066, y: GALLERY.safe, width: 144, height: 300 },
    tagY: 196,
  },
  /** VG Construção row (bottom): services grid on the phone + home hero on desktop. */
  vg: {
    phone: { x: 610, y: 399, width: 144, height: 300 },
    browser: { x: 790, width: 420, contentHeight: 226 },
    tagY: 560,
  },
  /** Where the connector lines from the tags end, just before each row. */
  connectorEnd: 588,
};

const TAG_FONT = { fontFamily: brand.fonts.label, fontWeight: '600', fontSize: 18, letterSpacing: '0.12em' } as const;

/** Width of a Tag (dash + gap + caps text + kind + arrow), for the connector lines. */
function tagWidth(name: string, kind: string) {
  const m = (t: string) => measureText({ text: t.toUpperCase(), ...TAG_FONT, validateFontIsLoaded: false }).width;
  return 26 + 12 + m(name) + 10 + m(kind) + 8 + m('↗');
}

/** Image 2 — credibility: two sites in use by real businesses, desktop and phone, side by side in contrast. */
export const BusinessProjects: React.FC<{ locale: GalleryLocale }> = ({ locale }) => {
  const c = galleryCopy[locale].businessProjects;
  const vgBrowserH = Math.round(L.vg.browser.contentHeight / (1 - 0.052));
  const vgBrowserY = GALLERY.height - GALLERY.safe - vgBrowserH;
  const rows = [
    { tag: c.hardEletric, y: L.he.tagY },
    { tag: c.vg, y: L.vg.tagY },
  ];
  return (
    <Canvas glow={{ x: 900, y: 390, color: '#0E1C38', size: 700 }}>
      <WMark size={L.mark.size} style={{ left: L.mark.x, top: L.mark.y }} />
      <Headline lines={c.headline} size={L.headline.size} maxWidth={L.headline.maxWidth} underline={c.headlineKey} style={{ left: L.headline.x, top: L.headline.y }} />

      {rows.map(({ tag, y }) => (
        <React.Fragment key={tag.name}>
          <Tag text={tag.name} sub={tag.kind} style={{ left: GALLERY.safe, top: y }} />
          <NeonPath
            d={`M ${GALLERY.safe + tagWidth(tag.name, tag.kind) + 16} ${y + 12} L ${L.connectorEnd} ${y + 12}`}
            progress={1}
            head={false}
            width={1.6}
            opacity={0.75}
          />
        </React.Fragment>
      ))}

      <Browser {...L.he.browser} shot={{ name: 'he-desktop' }} />
      <Phone {...L.he.phone} shot={{ name: 'he-mobile' }} />

      <Phone {...L.vg.phone} shot={{ name: 'vg-mobile' }} />
      <Browser x={L.vg.browser.x} y={vgBrowserY} width={L.vg.browser.width} contentHeight={L.vg.browser.contentHeight} shot={{ name: 'vg-desktop' }} />
    </Canvas>
  );
};
