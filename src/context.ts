import { createContext, useContext } from 'react';
import { locales, type LocaleId, type Messages } from '../locales';
import { platforms, type Platform, type PlatformId } from '../config/platforms';

/** 16:9 is the original cut; 9:16 (Reels/Stories) and 4:5 (feed) are the Instagram cuts. */
export type ShowAspect = '16x9' | '9x16' | '4x5';
export type ShowSettings = { messages: Messages; platform: Platform; locale: LocaleId; aspect: ShowAspect };

export const ShowContext = createContext<ShowSettings>({
  messages: locales.en,
  platform: platforms.neutral,
  locale: 'en',
  aspect: '16x9',
});

export const useShow = () => useContext(ShowContext);

export function settingsFor(platform: PlatformId, locale: LocaleId, aspect: ShowAspect = '16x9'): ShowSettings {
  return { messages: locales[locale], platform: platforms[platform], locale, aspect };
}
