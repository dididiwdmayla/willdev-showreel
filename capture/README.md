# Captura dos sites

Os repositórios de origem são usados **somente para leitura**: nada é commitado neles, e as capturas rodam a partir deles localmente (as URLs publicadas na Vercel não são usadas).

## 1. Subir os sites

Os caminhos padrão supõem os repositórios lado a lado com este (`../InterativMind`, `../lancheriademodois`, `../hardeletric`, `../vgconstru-o`, `../advocaciademo`); troque com `SOURCES_DIR` ou com as URLs de `capture/sources.mjs`.

| Projeto | Como sobe | URL padrão |
| :- | :- | :- |
| Hard Eletric | `python3 -m http.server 8101` na raiz do repo | `http://localhost:8101` |
| VG Construção | `python3 -m http.server 8102` | `http://localhost:8102` |
| Advocacia | `python3 -m http.server 8103` | `http://localhost:8103` |
| Lancheria Meia-Noite | em `lancheria-meia-noite-repo/`: `npm install`, `npx next build`, `npx next start -p 3001` | `http://localhost:3001` |
| InterativMind | `npm install`, `npm run build`, `npx next start -p 3000` (sem `.env.local` → modo demonstração) | `http://localhost:3000` |
| InterativMind (entrada) | cópia de captura, ver abaixo | `http://localhost:3002/captura-entrada` |

Depois de `npm install` nos apps Next, confira `git status` neles: o npm pode reescrever o `package-lock.json`, e isso deve ser descartado (`git restore package-lock.json`).

### A entrada da InterativMind

A cena de entrada (tinta abrindo a pintura, o cérebro pulando no galho, o nome escrito em ouro) é a tela de login de produção. Em modo demonstração o app pula essa tela e vai direto à floresta, e em produção ela depende do Firebase. Para capturá-la sem tocar no repositório:

1. copie o repositório para fora dele (sem `node_modules`, `.next` e `.git`), por exemplo `../sources/im-capture`, e ligue `node_modules` por symlink;
2. acrescente **só na cópia** uma rota que renderiza o componente original, sem alterá-lo:

```tsx
// src/app/captura-entrada/Entrance.tsx
"use client";
import { EntranceScene } from "@/components/scene/EntranceScene";
export function Entrance() {
  return <EntranceScene onEnter={() => {}} />;
}
```

```tsx
// src/app/captura-entrada/page.tsx
import { Entrance } from "./Entrance";
export default function CapturaEntrada() {
  return <Entrance />;
}
```

3. `npx next build --webpack` e `npx next start -p 3002` na cópia.

O que aparece é o componente, os assets e a animação reais; só o fluxo de autenticação fica de fora.

### Rede restrita

- O display do multímetro da Hard Eletric usa a fonte DSEG7 do jsDelivr; a captura a serve a partir do pacote npm `dseg` (`dsegRoute()` em `sources.mjs`).
- Se `npx playwright install chromium` falhar por rede, use um Chromium já instalado (`PLAYWRIGHT_BROWSERS_PATH`) ou o pacote `@sparticuz/chromium` como `executablePath`.

## 2. Capturar

```bash
npm run capture
```

```bash
npm run capture -- im-entrada lancheria-raiox
```

| Clipe | O que mostra | Viewport |
| :- | :- | :- |
| `im-entrada` | entrada da InterativMind: tinta, cérebro, escrita | 1600×900 @1,6 (2560×1440) |
| `im-arvore` | árvore-modelo do ateliê crescendo; dois galhos amadurecem | recorte do elemento @2 |
| `lancheria-trilho` | "Na prensa": o lanche que sai do centro abre em camadas | 960×540 @2 |
| `lancheria-raiox` | celular: Raio-X explodido → prensa na chapa → salto para o pedido | 390×844 @2 |
| `he-multimetro` | multímetro liga: flicker do LCD, contagem, ponteiro | 1280×720 @1,5 |
| `he-quadro` | "Sobre": esquema traçado sobre a foto do quadro, a lâmina fecha, a foto religa | 1280×720 @1,5 |
| `he-circuitos` | "Serviços": o eletroduto acende circuito a circuito com a rolagem (reserva) | 1280×720 @1,5 |
| `vg-desktop`, `vg-mobile` | VG Construção, mesma rolagem no computador e no celular | 1280×720 @1,5 e 390×844 @2 |

### Como cada quadro é feito

- `page.clock` substitui `Date`, timers, `requestAnimationFrame` e `performance.now`; o tempo da página só anda quando o script manda (1/30 s por quadro).
- A cada quadro, todas as animações de `document.getAnimations()` (CSS animations, CSS transitions, Web Animations) são pausadas e posicionadas no mesmo instante virtual.
- Rolagem e cliques são disparados por script entre um quadro e outro.
- O `recordVideo` do Playwright não é usado (reduz a imagem e grava em ritmo irregular).

### O que é escondido

CSS injetado esconde links de WhatsApp, `tel:`, `mailto:`, links externos, banners de cookie, overlays do Next e a faixa "modo demonstração". A cada seis quadros o texto visível é varrido; telefone, e-mail ou URL na tela aparecem como `!!` no log.
