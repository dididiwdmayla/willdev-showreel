# WillDev — showreel

Vídeo promocional de 35 s da WillDev, feito em código: **Remotion** (React + TypeScript) para a montagem e a tipografia, **Playwright** para capturar os sites reais quadro a quadro e **FFmpeg** para os clipes e a finalização.

| Entregável | Arquivo |
| :- | :- |
| Versão neutra (só WillDev) | `renders/willdev-showreel-neutral-en.mp4` |
| Versão Fiverr | `renders/willdev-showreel-fiverr-en.mp4` |
| Thumbnails 16:9 | `renders/thumbnail-1920x1080.png`, `renders/thumbnail-1280x720.png` |
| Relatório da produção | `REPORT.md` |

1920×1080, 30 fps, H.264 + AAC, MP4 com `+faststart`, 35,0 s.

## Gerar uma nova versão

Pré-requisito: Node 22 e `npm install` uma vez.

```bash
npm run render -- --platform=fiverr --locale=en
```

```bash
npm run render -- --platform=neutral --locale=pt-BR
```

```bash
npm run render -- --thumbnails --locale=en
```

```bash
npm run render -- --all
```

- `--platform` é qualquer chave de `config/platforms.ts` (`neutral`, `fiverr`, `fiverr-business`, `upwork`…).
- `--locale` é qualquer arquivo de `locales/` (`en`, `pt-BR`).
- `--crf=16` (padrão 18) controla qualidade × tamanho; o script avisa se o arquivo passar de 40 MB.
- `--mute` renderiza sem trilha.

A saída vai para `renders/willdev-showreel-<plataforma>-<idioma>.mp4`.

Para ver e ajustar ao vivo: `npm run dev` abre o Remotion Studio (composições `Showreel`, `Showreel-Fiverr`, `Thumbnail`, `Thumbnail-720`; as props `platform` e `locale` podem ser trocadas no painel).

## Onde mexer

| Quero mudar… | Arquivo |
| :- | :- |
| Textos de qualquer cena, em qualquer idioma | `locales/en.ts`, `locales/pt-BR.ts` |
| Um novo idioma | copie `locales/en.ts`, traduza e registre em `locales/index.ts` |
| Cores, fontes, nome da marca, arco do logo | `config/branding.ts` |
| Plataforma, ordem das cenas, ênfase, CTA final, projeto em destaque | `config/platforms.ts` |
| Duração das cenas (em compassos) e momentos-chave | `config/timing.ts` |
| Trilha (BPM, batidas, janela de 35 s) | `config/track.ts`, gerado por `scripts/analyze-audio.py` |

**Um vídeo por Gig no Fiverr.** O Fiverr não aceita o mesmo vídeo em dois Gigs. Para um Gig novo, crie uma entrada em `config/platforms.ts` mudando ordem, compassos por cena (`bars`, soma 14), projeto em destaque e CTA — `fiverr-business` é um exemplo pronto — e renderize com `--platform=<nova-chave>`. O nome da plataforma só aparece pelo marcador `{platform}` do texto final; nenhuma animação tem plataforma embutida.

Textos mais longos (pt-BR, por exemplo) são ajustados pela própria composição: cada linha mede o texto e reduz o corpo até caber na coluna, e frases longas quebram em duas linhas equilibradas.

## Trocar a trilha

1. Coloque o arquivo em `assets/audio/`.
2. `pip install librosa soundfile` (uma vez).
3. Rode a análise; ela detecta BPM, grade de batidas e a entrada do bumbo, escolhe a janela de 35 s e grava `config/track.ts`:

```bash
python3 scripts/analyze-audio.py assets/audio/nova-faixa.m4a
```

Use `--start 12.3` para forçar o início da janela. Os cortes entre cenas caem nas linhas de compasso calculadas a partir desse arquivo; nenhuma cena precisa ser reescrita. O fade-out (1,5 s) e o volume ficam em `config/timing.ts`.

## Recapturar os sites

Os clipes de `footage/` já estão versionados, então novas versões não exigem recaptura. Para refazer uma captura (site atualizado, por exemplo), veja `capture/README.md`. Resumo:

```bash
npm run capture -- he-quadro lancheria-raiox
```

Cada captura avança o relógio da página 1/30 s por quadro (relógio falso do Playwright + animações CSS/WAAPI pausadas e posicionadas), grava PNG em `capture/frames/` (ignorado pelo git) e codifica `footage/<nome>.mp4` (H.264, CRF 15, 30 fps). Durante a captura, links de WhatsApp, telefones, e-mails, links externos, banners de cookie, a faixa de demonstração e overlays de debug são escondidos por CSS injetado, e o texto visível é varrido em busca de telefone, e-mail ou URL.

## Estrutura

```
assets/brand/        referências da marca + willdev-logo.svg (logo reconstruído em vetor)
assets/audio/        trilha (Suno)
capture/             scripts Playwright de captura quadro a quadro
footage/             clipes intermediários capturados (versionados)
config/              branding, plataformas, timing e a análise da trilha
locales/             textos por idioma
scripts/             render.mjs, analyze-audio.py, build-logo.mjs
src/                 projeto Remotion (cenas, componentes, logo animado)
public/              links para footage/ e assets/audio/ + quadros fixos da thumbnail
renders/             MP4 e thumbnails finais
.claude/skills/      skills oficiais do Remotion para o Claude Code
```

## Ambiente

- Fontes: Space Grotesk, Chakra Petch e Lexend (licença OFL), via `@fontsource`. O logo usa Lexend convertida em contornos (`npm run logo`), então não depende de fonte instalada.
- Se o Remotion não conseguir baixar o Chrome Headless Shell, `remotion.config.ts` usa `REMOTION_BROWSER` ou o headless shell do Playwright, se existir.
- Sem FFmpeg no sistema, os scripts usam o FFmpeg embutido do Remotion (`npx remotion ffmpeg`).
