// Português do Brasil. Mesma estrutura de gallery/copy/en.ts (no máximo 10 palavras por imagem).
import type { GalleryCopy } from './en.ts';

export const ptBR: GalleryCopy = {
  customWebsites: {
    headline: ['SITES SOB', 'MEDIDA.'],
    sub: ['FEITOS PARA', 'SE DESTACAR.'],
    subKey: 'SE DESTACAR.',
    tag: 'Conceito de lanchonete',
  },
  businessProjects: {
    headline: ['PENSADO PARA', 'NEGÓCIOS REAIS.'],
    headlineKey: 'NEGÓCIOS REAIS.',
    hardEletric: { name: 'Hard Eletric', kind: 'Elétrica' },
    vg: { name: 'VG Construção', kind: 'Construção' },
  },
  creativeDesign: {
    headline: ['MUITO ALÉM DE', 'UM TEMPLATE.'],
    headlineKey: 'TEMPLATE.',
    interativMind: 'Conceito criativo',
    advocacia: 'Conceito jurídico',
  },
};
