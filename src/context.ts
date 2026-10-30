import { createContext, useContext } from 'react';
import { locales, type LocaleId, type Messages } from '../locales';
import { platforms, type Platform, type PlatformId } from '../config/platforms';

export type ShowSettings = { messages: Messages; platform: Platform; locale: LocaleId };

export const ShowContext = createContext<ShowSettings>({
  messages: locales.en,
  platform: platforms.neutral,
  locale: 'en',
});

export const useShow = () => useContext(ShowContext);

export function settingsFor(platform: PlatformId, locale: LocaleId): ShowSettings {
  return { messages: locales[locale], platform: platforms[platform], locale };
}
