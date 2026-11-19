// Restaurant commercial: Chapa Burger (concept, its four real variants) + Ingarandi
// Burger (client, the real ordering flow on Mercado Pago's test environment).
// Scenes live in restaurant/scenes/, sound in restaurant/sound.tsx, timing in
// restaurant/config.ts. See restaurant/README.md.
import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { z } from 'zod';
import { locales, type LocaleId } from '../locales';
import { DURATION, MUSIC, SCENES, type Variant } from './config';
import type { Pt } from './parts';
import { CHAPA_BOX, Grid, Opening, VARIANT_TRIM, VariantShot, VariantsTitle, lensPoint, openingCam, variantCam } from './scenes/chapa';
import { Closing } from './scenes/closing';
import { Bridge, Order } from './scenes/ingarandi';
import { C, MessagesContext, desktop } from './shared';
import { Soundtrack } from './sound';
import '../src/fonts';

export const restaurantSchema = z.object({
  locale: z.enum(Object.keys(locales) as [LocaleId, ...LocaleId[]]),
  aspect: z.enum(['16x9', '1x1', '9x16']),
  mute: z.boolean(),
  /** Music file under public/ (e.g. audio/my-track.m4a); defaults to MUSIC.file. */
  music: z.string().optional(),
  /** Seconds into the music file where the commercial starts. */
  musicStart: z.number().optional(),
});
export type RestaurantProps = z.infer<typeof restaurantSchema>;

export const RESTAURANT_DEFAULT_MUSIC = MUSIC;

export const Restaurant: React.FC<RestaurantProps> = ({ locale, aspect: a, mute, music, musicStart }) => {
  const S = SCENES;
  const transitionPoint = (prev: Variant, scene: { from: number; to: number }, prevFrom: number, trimmed: boolean): Pt => {
    const f = scene.from - prevFrom;
    if (!trimmed) return lensPoint(a, prev, f, openingCam(a, f), CHAPA_BOX[a]);
    const trim = desktop(a) ? VARIANT_TRIM.desktop : VARIANT_TRIM.mobile;
    return lensPoint(a, prev, trim + f, variantCam(a, prev, f), CHAPA_BOX[a]);
  };
  const toBalcao = transitionPoint('chapa', S.balcao, 0, false);
  const toSala = transitionPoint('balcao', S.sala, S.balcao.from, true);
  const toPraca = transitionPoint('sala', S.praca, S.sala.from, true);
  const toGrid = transitionPoint('praca', S.grid, S.praca.from, true);
  const OVER = 14; // each shot keeps playing under the next one's lens wipe
  return (
    <MessagesContext.Provider value={locales[locale].restaurant}>
      <AbsoluteFill style={{ background: C.black, overflow: 'hidden' }}>
        <Sequence from={S.hero.from} durationInFrames={S.lens.to - S.hero.from + OVER}>
          <Opening a={a} />
        </Sequence>
        <Sequence from={S.balcao.from} durationInFrames={S.balcao.to - S.balcao.from + OVER}>
          <VariantShot a={a} v="balcao" center={toBalcao} label />
        </Sequence>
        <Sequence from={S.sala.from} durationInFrames={S.sala.to - S.sala.from + OVER}>
          <VariantShot a={a} v="sala" center={toSala} label />
        </Sequence>
        <Sequence from={S.praca.from} durationInFrames={S.praca.to - S.praca.from + OVER}>
          <VariantShot a={a} v="praca" center={toPraca} label />
        </Sequence>
        <Sequence from={S.grid.from} durationInFrames={S.grid.to - S.grid.from + 12}>
          <Grid a={a} center={toGrid} />
        </Sequence>
        <Sequence from={S.balcao.from} durationInFrames={S.bridge.from - S.balcao.from + 6}>
          <VariantsTitle a={a} />
        </Sequence>
        <Sequence from={S.bridge.from} durationInFrames={40}>
          <Bridge a={a} />
        </Sequence>
        <Sequence from={S.order.from} durationInFrames={S.coin.from - S.order.from + 18}>
          <Order a={a} />
        </Sequence>
        <Sequence from={S.coin.from} durationInFrames={DURATION - S.coin.from}>
          <Closing a={a} />
        </Sequence>
        {!mute && <Soundtrack a={a} music={music} musicStart={musicStart} />}
      </AbsoluteFill>
    </MessagesContext.Provider>
  );
};
