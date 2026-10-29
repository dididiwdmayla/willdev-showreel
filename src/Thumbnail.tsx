import React from 'react';
import { AbsoluteFill, Img, staticFile, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { brand } from '../config/branding';
import { locales, type LocaleId } from '../locales';
import { BrowserFrame, PhoneFrame } from './components/Frames';
import { Logo } from './components/Logo';
import { NeonPath, roundedPath } from './components/NeonPath';
import { Line } from './components/Type';
import './fonts';

const C = brand.colors;

export const thumbnailSchema = z.object({
  locale: z.enum(Object.keys(locales) as [LocaleId, ...LocaleId[]]),
});

/** 16:9 cover: the seal, one big line, and two real interfaces. Laid out at 1920×1080 and scaled. */
export const Thumbnail: React.FC<z.infer<typeof thumbnailSchema>> = ({ locale }) => {
  const { width } = useVideoConfig();
  const m = locales[locale].thumbnail;
  const s = width / 1920;
  return (
    <AbsoluteFill style={{ background: C.black, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: 1920, height: 1080, scale: String(s), transformOrigin: '0 0' }}>
        <AbsoluteFill style={{ background: `radial-gradient(circle at 74% 52%, #2A1A12 0%, ${C.black} 58%)` }} />
        <BrowserFrame width={900} height={536} style={{ left: 800, top: 110, rotate: '-3deg', opacity: 0.95 }}>
          {/* Frames extracted from footage/ by scripts/render.mjs (public/stills). */}
          <Img src={staticFile('stills/im-entrada-215.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </BrowserFrame>
        <PhoneFrame width={380} height={800} style={{ left: 1440, top: 230, rotate: '4deg' }}>
          <Img src={staticFile('stills/lancheria-raiox-40.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </PhoneFrame>
        <NeonPath
          d={roundedPath(
            [
              [96, 828],
              [760, 828],
              [760, 990],
              [1340, 990],
            ],
            40,
          )}
          progress={1}
          head={false}
          width={4}
        />
        <div style={{ position: 'absolute', left: 84, top: 70 }}>
          <Logo size={250} glow={0.45} />
        </div>
        <div style={{ position: 'absolute', left: 96, top: 380 }}>
          <Line text={m.line1} at={-100} size={150} maxWidth={860} />
          <Line text={m.line2} at={-100} size={150} maxWidth={860} color={C.pink} underline={m.line2Key} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
