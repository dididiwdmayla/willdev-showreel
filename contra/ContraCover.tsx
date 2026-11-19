import React from 'react';
import { z } from 'zod';
import { brand } from '../config/branding';
import { Browser, Canvas, Headline, Phone, WMark } from '../gallery/components';
import { NeonPath, roundedPath } from '../src/components/NeonPath';
import { captures, CONTRA, contraCopy } from './config';

export const contraSchema = z.object({ variant: z.enum(['main', 'alt']) });

const S = CONTRA.safe;
const R = CONTRA.width - S;
const B = CONTRA.height - S;

/** Brand signature: the W and the name, small. */
const Signature: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <>
    <WMark size={26} style={{ left: x, top: y }} />
    <div
      style={{
        position: 'absolute',
        left: x + 52,
        top: y + 1,
        fontFamily: brand.fonts.label,
        fontWeight: 600,
        fontSize: 22,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: brand.colors.white,
        opacity: 0.8,
      }}
    >
      {contraCopy.brand}
    </div>
  </>
);

/** Positions for the main variant (pixels of the 1600 × 1200 canvas). */
const MAIN = {
  headline: { x: S - 6, y: 276, size: 156, maxWidth: 640 },
  secondary: { x: S - 2, y: 620, size: 48, maxWidth: 520 },
  browser: { x: 800, y: 200, width: R - 800, contentHeight: 698, crop: { x: 0, y: 0, w: 1152, h: 1156 } },
  phone: { x: 676, y: 616, width: 232 },
  /** Neon line from the text into the window, landing on the "Bacon" callout of the raio-x. */
  line: [
    [S, 812],
    [636, 812],
    [636, 584],
    [796, 584],
  ] as [number, number][],
};

/** Main cover: big type on the left; the raio-x of Lancheria Meia-Noite and a real client site on the phone. */
const Main: React.FC = () => {
  const c = contraCopy.main;
  const L = MAIN;
  return (
    <Canvas glow={{ x: 1180, y: 560, color: '#2A1A12', size: 820 }}>
      <Headline lines={c.headline} size={L.headline.size} maxWidth={L.headline.maxWidth} lineHeight={0.96} style={{ left: L.headline.x, top: L.headline.y }} />
      <Headline
        lines={c.secondary}
        size={L.secondary.size}
        maxWidth={L.secondary.maxWidth}
        pinkFrom={0}
        underline={c.secondaryKey}
        lineHeight={1.14}
        style={{ left: L.secondary.x, top: L.secondary.y, letterSpacing: '-0.015em' }}
      />
      <NeonPath d={roundedPath(L.line, 28)} progress={1} head={false} width={2.6} opacity={0.85} />
      <Browser x={L.browser.x} y={L.browser.y} width={L.browser.width} contentHeight={L.browser.contentHeight} shot={{ image: captures.lancheriaRaiox, crop: L.browser.crop }} />
      <Phone x={L.phone.x} y={L.phone.y} width={L.phone.width} height={Math.round(L.phone.width * 2.1)} shot={{ image: captures.hardEletricPhone }} />
      <Signature x={S} y={B - 26} />
    </Canvas>
  );
};

/** Positions for the alternate variant. */
const ALT = {
  headline: { x: S - 8, y: 168, size: 176, maxWidth: R - S },
  secondary: { y: 372, size: 46, maxWidth: 900 },
  browser: { x: S, y: 486, width: 900, contentHeight: 562 },
  phone: { x: 960, y: 452, width: 300 },
};

/** Alternate cover: one-line headline across the top; a real client site leads, the interaction on the phone. */
const Alt: React.FC = () => {
  const c = contraCopy.alt;
  const L = ALT;
  return (
    <Canvas glow={{ x: 820, y: 820, color: '#0E1C38', size: 900 }}>
      <Signature x={S} y={S} />
      <Headline lines={c.headline} size={L.headline.size} maxWidth={L.headline.maxWidth} style={{ left: L.headline.x, top: L.headline.y }} />
      <Headline
        lines={c.secondary}
        size={L.secondary.size}
        maxWidth={L.secondary.maxWidth}
        pinkFrom={0}
        underline={c.secondaryKey}
        style={{ right: S, top: L.secondary.y, textAlign: 'right', letterSpacing: '-0.015em' }}
      />
      <Browser x={L.browser.x} y={L.browser.y} width={L.browser.width} contentHeight={L.browser.contentHeight} shot={{ image: captures.hardEletricHome }} />
      <Phone x={L.phone.x} y={L.phone.y} width={L.phone.width} height={Math.round(L.phone.width * 2.1)} shot={{ image: captures.lancheriaRaioxPhone }} />
    </Canvas>
  );
};

export const ContraCover: React.FC<z.infer<typeof contraSchema>> = ({ variant }) => (variant === 'alt' ? <Alt /> : <Main />);
