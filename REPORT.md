# Relatório — showreel WillDev (v4)

## 1. O que foi feito

- Projeto Remotion completo (React + TypeScript) com seis cenas, tipografia cinética, logo animado e transições próprias, tudo parametrizado por idioma, plataforma e timing.
- Captura quadro a quadro, em tempo virtual, das interações reais de quatro sites rodando localmente (9 clipes em `footage/`, 22 MB no total, H.264 CRF 15, 30 fps).
- Logo reconstruído em vetor (`assets/brand/willdev-logo.svg`), com cada parte animável no vídeo.
- Trilha analisada (BPM, grade de batidas, presença do bumbo); cortes e momentos-chave presos a linhas de compasso e exportados em `config/track.ts` + `config/timing.ts`.
- Entregáveis renderizados e verificados:

| Arquivo | Duração | Tamanho |
| :- | :- | :- |
| `renders/willdev-showreel-neutral-en.mp4` | 35,000 s | 17,3 MB |
| `renders/willdev-showreel-fiverr-en.mp4` | 35,000 s | 17,3 MB |
| `renders/thumbnail-1920x1080.png`, `renders/thumbnail-1280x720.png` | — | — |

1920×1080, 30 fps, 1050 quadros, H.264 High (yuv420p, BT.709, faixa TV) + AAC 192 kbps estéreo 48 kHz, MP4 com `+faststart`.

- Skills oficiais do Remotion instaladas em `.claude/skills/` (via `npx skills add remotion-dev/skills`, sem precisar do caminho manual).
- Scripts: `npm run render` (qualquer plataforma × idioma), `npm run capture`, `npm run logo`, `scripts/analyze-audio.py`, `scripts/qa-ocr.py`.

## 2. Decisões criativas

**Um fio condutor.** A linha branca neon dos posts é o elemento de ligação: conecta as duas frases da abertura, é a borda de todas as transições (varredura para a direita, cortina descendo, varredura para a esquerda, íris), entra pela borda e vira a linha de alimentação azul do esquema elétrico da Hard Eletric, e no fim se fecha num círculo que vira o anel do logo.

**A música manda no corte.** Faixa a ~117,5 BPM; janela de 35 s escolhida para o drop cair aos 0,5 s do vídeo. Todas as cenas começam em linha de compasso. A faixa tem um compasso de pausa (14,76–16,78 s do vídeo): ele cai exatamente quando o esquema da Hard Eletric está sendo traçado, e a foto do quadro "religa" na batida em que o bumbo volta. O breakdown da faixa (29,0 s) coincide com o encerramento.

| Tempo | Cena | Momento |
| :- | :- | :- |
| 0,0–6,6 s | InterativMind, entrada | a tinta abre a pintura no drop; câmera recua até o rolo inteiro; "Not just a website." / "An experience." |
| 6,6–12,7 s | Lancheria Meia-Noite | o lanche que sai do centro do trilho se abre em camadas; no celular, Raio-X explodido → prensa na chapa → salto das camadas até o pedido |
| 12,7–18,8 s | Hard Eletric | multímetro liga (LCD, contagem, ponteiro) → esquema traçado sobre o quadro real → religa na batida |
| 18,8–22,9 s | VG Construção | o mesmo site no computador e no celular, rolando juntos |
| 22,9–29,0 s | InterativMind, árvore | a árvore cresce do chão; dois galhos jovens amadurecem e florescem |
| 29,0–35,0 s | Encerramento | o neon fecha o anel; o logo se monta e o arco rosa enche como progresso; serviços e CTA |

**Tipografia que reage.** "Made / to / interact." é empilhada como camadas: as palavras se afastam quando o lanche abre e se comprimem no instante da prensa (340 ms, como no site). Títulos em verde-lima com brilho; a segunda frase em rosa, com sublinhado rosa desenhado sob a palavra-chave — o padrão dos posts. Rótulos pequenos em fonte quadrada, com ↗.

**Abrir com o projeto mais autoral.** A revelação de tinta da InterativMind é o primeiro quadro com imagem (0,5 s), e a cena de maior liberdade artística (a árvore) vem perto do fim, antes da marca.

**Comercial, não só experimental.** Cada projeto tem rótulo de setor e tipo (cliente ou conceito); a cena da VG mostra um site empresarial convencional e responsivo; o encerramento lista serviços (sites sob medida, landing pages, experiências interativas).

**Marca.** Paleta final em `config/branding.ts`: lima `#C2F70C` (entre o lima do logo e o mais amarelado dos posts), rosa `#FF1F78`, grafite `#0D1015`, preto `#030102`. Fontes OFL via `@fontsource`: Space Grotesk (títulos), Chakra Petch (rótulos técnicos), Lexend (logo, convertida em contornos). O anel de tecnologias do logo foi omitido, como preferido no briefing. Um selo pequeno fica no canto superior direito enquanto os trabalhos estão em tela e passa o lugar ao selo grande no fim.

## 3. Projetos usados

| Projeto | Tipo | No vídeo |
| :- | :- | :- |
| Hard Eletric | **negócio real** (serviços elétricos) | multímetro (home) e quadro de distribuição (Sobre) |
| VG Construção | **negócio real** (construtora) | home no computador e no celular |
| InterativMind | conceito autoral | entrada (tinta, pintura, escrita) e árvore-modelo do ateliê |
| Lancheria Meia-Noite | conceito autoral | trilho "Na prensa" e Raio-X no celular |
| Advocacia (Coutinho & Sarmento) | conceito | **não usado** — ver seção 4 |

O vídeo não afirma nenhum resultado comercial. Números que aparecem dentro das telas capturadas (o "500" do multímetro da Hard Eletric, os contadores da VG) são o conteúdo publicado pelos próprios clientes, mostrados de passagem.

O site da VG se identifica como "VG Construção" (singular); foi usado esse nome nos rótulos.

## 4. O que ficou faltando ou foi adiado

- **Advocacia não entrou.** É sóbria e bem resolvida, mas estática perto das outras; num corte de 35 s ela tiraria tempo de uma cena mais forte. Está pronta para captura (servidor em `capture/sources.mjs`) se um Gig de sites institucionais pedir.
- **Versões em pt-BR não foram renderizadas como entregáveis.** O idioma está completo em `locales/pt-BR.ts` e conferido quadro a quadro em amostras (todas as frases cabem); para gerar: `npm run render -- --platform=neutral --locale=pt-BR`.
- **Um Gig extra do Fiverr** existe só como exemplo de configuração (`fiverr-business` em `config/platforms.ts`), não renderizado.
- **Clipe reserva `he-circuitos`** (o eletroduto da página Serviços acendendo com a rolagem) foi capturado e versionado, mas saiu do corte: em vídeo, a linha azul fina lê pouco; o multímetro e o quadro contam a mesma ideia com mais força.
- Sem efeitos sonoros: o vídeo funciona sem áudio e a trilha já marca os cortes.

## 5. Material substituto ou adaptado

- **Entrada da InterativMind.** Em modo demonstração o app pula a tela de entrada (vai direto à floresta), e em produção ela depende do login do Firebase. Para capturá-la sem alterar o repositório, foi feita uma cópia **fora** dele (`../sources/im-capture`) com uma rota extra que só renderiza o componente original `EntranceScene`. Componente, assets e animação são os reais; só o fluxo de autenticação ficou de fora. O passo a passo está em `capture/README.md`.
- **Multímetro da Hard Eletric** recebeu um leve aumento de brilho (+45%) no vídeo: no site ele é desenhado de propósito em baixa opacidade, e sem isso o HUD não lia em tamanho de vídeo.
- **Ritmo do quadro elétrico.** O trecho antes do religamento roda a ~0,5× para preencher o compasso de pausa da música; o religamento e o resto rodam em velocidade real.
- **Árvore da InterativMind** roda a ~1,2× para caber em três compassos.
- **Thumbnail** usa quadros extraídos dos clipes (o render de imagem fixa do Remotion não posiciona o vídeo no quadro exato).
- Nenhuma funcionalidade foi simulada: todo movimento de interface vem de captura real.

## 6. Limitações de ambiente

- **Rede.** `remotion.media` (download do Chrome do Remotion), `cdn.jsdelivr.net` e `unpkg.com` bloqueados; npm, GitHub e Google Fonts funcionaram. Os sites foram capturados localmente, nunca pelas URLs da Vercel.
- **Navegador.** Já havia Chromium e Playwright 1.63 instalados (`/opt/pw-browsers`), então `@sparticuz/chromium` não foi necessário. O Remotion usa o headless shell do Playwright (`remotion.config.ts` detecta sozinho; `REMOTION_BROWSER` sobrescreve).
- **Fonte do multímetro.** A DSEG7 da Hard Eletric vem do jsDelivr (bloqueado); a captura serve a mesma fonte a partir do pacote npm `dseg`.
- **Repositórios de origem.** Os seis estavam anexados à sessão, inclusive o InterativMind (privado). Foram usados só para leitura. O `npm install` reescreveu o `package-lock.json` da InterativMind; a alteração foi desfeita (`git restore`) e nenhum repositório de origem tem mudança, commit ou push.
- **Push.** ~61 MB adicionados (clipes 22 MB, dois MP4 de 17,3 MB, thumbnails, skills); nenhum arquivo passa de 10 MB e o push foi aceito sem deixar nada de fora.
- **Imagem fixa no Remotion.** O render de still não posiciona `<Video>` no quadro exato (cai no keyframe mais próximo); a thumbnail usa quadros extraídos com FFmpeg (`public/stills/`).
- **Faixa.** Havia um único arquivo em `assets/audio/` ("Lucky Draw", Suno), renomeado para `lucky-draw.m4a`. O plano do Suno com direito comercial é informação do usuário, não verificada aqui.

## 7. Verificação

Feita no material renderizado, não só no build.

- **Quadros examinados.** Quadros extraídos com FFmpeg no meio de cada cena e durante cada transição (0,5 s, 6,6 s, 12,7 s, 18,8 s, 22,9 s, 29 s…) e revisados um a um: legibilidade, margens seguras (texto a ≥ 112 px das bordas laterais), nada cortado, cada transição completa sem quadro preto ou vazio. Foram corrigidos nessa revisão: máscara do logo vazando no primeiro quadro, Raio-X e trilho pequenos demais, a seção anterior aparecendo no início do quadro elétrico, a faixa do cabeçalho no recorte do multímetro, a lista de serviços estourando a margem direita e os cards de serviço da VG sumindo (eram links de WhatsApp e a regra de captura os escondia inteiros).
- **Sincronia.** Envelope de áudio medido no MP4: drop aos 0,50 s, pausa da faixa de 14,8 a 16,8 s (o quadro elétrico religa aos 16,78 s, na volta do bumbo), breakdown aos 29 s com o encerramento, fade-out de 1,5 s até o silêncio no último quadro.
- **Especificações.** `ffprobe`: 1920×1080, 30/1 fps, 1050 quadros de vídeo, duração do contêiner 35,000 s, `moov` antes de `mdat` (faststart), 17,3 MB por arquivo (limite pedido: 40 MB; Fiverr: 50 MB, 75 s).
- **Contato na versão Fiverr, quadro a quadro.** `scripts/qa-ocr.py` decodifica os **1050 quadros** e lê todo o texto por OCR, procurando telefone, e-mail, URL e menções a WhatsApp/Instagram/e-mail: **0 ocorrências** na versão Fiverr e 0 também nos 1050 quadros da neutra (relatórios em `renders/*.ocr.json`, com todas as linhas lidas). O mesmo teste encontrou, numa versão anterior, o parágrafo "Peça o orçamento direto pelo WhatsApp" da VG; a captura passou a esconder textos que citam canais de contato. Durante as capturas o texto visível de cada página também é varrido (telefone, e-mail, URL, canais), sem ocorrências. A moldura de navegador tem a barra de endereço vazia.
- **Sem métricas do Fiverr.** Nenhum selo de nível, estrela ou avaliação; o nome da plataforma só aparece no CTA final da versão Fiverr ("Message me here on Fiverr"), que mantém a conversa dentro dela.
- **Serviços comerciais.** O vídeo nomeia setor e tipo de cada trabalho (dois clientes reais), mostra um site empresarial responsivo e termina com a lista de serviços e o convite.
- **Código.** `tsc --noEmit` e ESLint (config do Remotion) sem erros nem avisos.
- **Repositórios de origem.** `git status` limpo nos cinco, sem commits novos.
