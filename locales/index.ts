import { en, type Messages } from './en';
import { ptBR } from './pt-BR';

export const locales = { en, 'pt-BR': ptBR } satisfies Record<string, Messages>;
export type LocaleId = keyof typeof locales;
export type { Messages };

/** Replaces {platform} and friends. */
export function fill(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
}
