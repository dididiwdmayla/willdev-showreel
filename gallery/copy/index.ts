import { en, type GalleryCopy } from './en.ts';
import { ptBR } from './pt-BR.ts';

export const galleryCopy = { en, 'pt-BR': ptBR } satisfies Record<string, GalleryCopy>;
export type GalleryLocale = keyof typeof galleryCopy;
export type { GalleryCopy };

const words = (s: string) => s.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w));

/** Words added on top of the captures, per image (Fiverr gallery budget: 10). */
export function wordCounts(c: GalleryCopy) {
  const count = (parts: string[]) => parts.reduce((n, p) => n + words(p).length, 0);
  return {
    'willdev-custom-websites': count([...c.customWebsites.headline, ...c.customWebsites.sub, c.customWebsites.tag]),
    'willdev-business-projects': count([
      ...c.businessProjects.headline,
      c.businessProjects.hardEletric.name,
      c.businessProjects.hardEletric.kind,
      c.businessProjects.vg.name,
      c.businessProjects.vg.kind,
    ]),
    'willdev-creative-design': count([...c.creativeDesign.headline, c.creativeDesign.interativMind, c.creativeDesign.advocacia]),
  };
}
