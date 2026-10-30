import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { brand } from '../../config/branding';
import { cues } from '../../config/timing';
import { Footage, type ClipName } from '../components/Footage';
import { Logo } from '../components/Logo';
import { NeonPath } from '../components/NeonPath';
import { Line, fitSize } from '../components/Type';
import { useShow } from '../context';
import { fill } from '../../locales';
import { ease, ramp } from '../lib/anim';
import type { SceneProps } from './shared';

const C = brand.colors;
const LOGO = { cx: 560, cy: 540, size: 640 };

const FEATURED: Record<string, { clip: ClipName; trimBefore: number }> = {
  interativmind: { clip: 'im-entrada', trimBefore: 200 },
  lancheria: { clip: 'lancheria-trilho', trimBefore: 140 },
  hardeletric: { clip: 'he-quadro', trimBefore: 120 },
  vg: { clip: 'vg-desktop', trimBefore: 10 },
};

/** 29–35 s: the neon line closes into the seal, the arc fills like a progress ring, the offer. */
export const ClosingScene: React.FC<SceneProps> = ({ cue }) => {
  const frame = useCurrentFrame();
  const { messages, platform } = useShow();
  const m = messages.closing;
  const lineAt = cue(cues.closing.line);
  const ctaAt = cue(cues.closing.cta);
  const bg = ramp(frame, 0, 12, ease.out);
  // Neon circle → rings of the seal.
  const r = (LOGO.size / 1000) * 385;
  const circle = `M ${LOGO.cx} ${LOGO.cy - r} A ${r} ${r} 0 1 1 ${LOGO.cx - 0.01} ${LOGO.cy - r}`;
  const draw = ramp(frame, 4, 26, ease.inOut);
  const neonFade = 1 - ramp(frame, 34, 14, ease.inOut);
  const rings = ramp(frame, 22, 18, ease.out);
  const disc = ramp(frame, 18, 20, ease.out);
  const mark = ramp(frame, 28, 16, ease.out);
  const word = ramp(frame, 36, 16, ease.out);
  const rule = ramp(frame, 44, 18, ease.inOut);
  const arc = ramp(frame, 40, 40, ease.inOut);
  const featured = FEATURED[platform.featured];
  const cta = platform.cta === 'platform' && platform.displayName ? fill(m.ctaPlatform, { platform: platform.displayName }) : m.ctaNeutral;
  const ctaT = ramp(frame, ctaAt, 16, ease.out);
  const servicesT = (i: number) => ramp(frame, lineAt + 26 + i * 5, 14, ease.out);
  const ctaSize = fitSize(cta, 40, 700, 700);

  return (
    <AbsoluteFill style={{ opacity: bg }}>
      <AbsoluteFill style={{ background: C.black }} />
      <AbsoluteFill style={{ opacity: 0.14, filter: 'blur(26px) saturate(0.6)', scale: '1.1' }}>
        <Footage clip={featured.clip} trimBefore={featured.trimBefore} playbackRate={0.35} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${LOGO.cx}px ${LOGO.cy}px, ${C.graphite}00 20%, ${C.black} 75%)` }} />
      <NeonPath d={circle} progress={draw} opacity={neonFade} width={4} />
      <div style={{ position: 'absolute', left: LOGO.cx - LOGO.size / 2, top: LOGO.cy - LOGO.size / 2 }}>
        <Logo size={LOGO.size} rings={rings} disc={disc} mark={mark} word={word} rule={rule} arc={arc} glow={0.4} />
      </div>
      <div style={{ position: 'absolute', left: 1000, top: 236, width: 820 }}>
        <Line text={m.line1} at={lineAt} size={120} maxWidth={820} />
        <Line text={m.line2} at={lineAt + 6} size={120} maxWidth={820} color={C.pink} underline={m.line2Key} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 40 }}>
          {m.services.map((service, i) => (
            <div key={service} style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: servicesT(i), translate: `${(1 - servicesT(i)) * -18}px 0` }}>
              <span style={{ width: 9, height: 9, background: C.pink, boxShadow: `0 0 10px ${C.pinkGlow}` }} />
              <span
                style={{
                  fontFamily: brand.fonts.label,
                  fontWeight: 600,
                  fontSize: 27,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: C.white,
                  whiteSpace: 'nowrap',
                }}
              >
                {service}
              </span>
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 48,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 22,
            padding: '20px 34px',
            borderRadius: 999,
            border: `2px solid ${C.lime}`,
            boxShadow: `0 0 26px ${C.limeGlow}, inset 0 0 18px rgba(194,247,12,0.12)`,
            opacity: ctaT,
            translate: `0 ${(1 - ctaT) * 20}px`,
            clipPath: `inset(0 ${(1 - ramp(frame, ctaAt, 20, ease.inOut)) * 100}% 0 0 round 999px)`,
          }}
        >
          <span style={{ fontFamily: brand.fonts.display, fontWeight: 700, fontSize: ctaSize, color: C.lime, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>{cta}</span>
          <span style={{ fontFamily: brand.fonts.display, fontWeight: 700, fontSize: ctaSize * 1.1, color: C.pink }}>↗</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
