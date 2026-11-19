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

## 8. Localização do comercial (EN · PT-BR · DE)

O comercial agora existe em inglês, português do Brasil e alemão, a partir das mesmas composições, sem cena nova nem mudança de identidade. Os três usam a variante neutra (CTA sem marketplace), própria para Facebook e outras redes; com `--platform=fiverr`, o CTA volta a ser o da plataforma.

| Arquivo | Duração | Resolução | FPS | Tamanho |
| :- | :- | :- | :- | :- |
| `renders/willdev-commercial-en.mp4` | 35,000 s | 1920×1080 | 30 | 17,2 MB |
| `renders/willdev-commercial-pt-br.mp4` | 35,000 s | 1920×1080 | 30 | 17,4 MB |
| `renders/willdev-commercial-de.mp4` | 35,000 s | 1920×1080 | 30 | 17,3 MB |

Os três saem em H.264 yuv420p BT.709, CRF 16, AAC 192 kbps e `+faststart`, com as mesmas 1050 imagens e a mesma trilha do original.

**Como funciona.** Todo texto visível vem de `locales/<idioma>.ts`; as cenas leem do contexto e nenhuma tem texto fixo. O alemão é um arquivo novo (`locales/de.ts`, registrado em `locales/index.ts`). `npm run render -- --commercials` gera um arquivo por idioma registrado.

### Textos

| Momento | EN | PT-BR | DE |
| :- | :- | :- | :- |
| Abertura | Not just a website. / An experience. | Não é só um site. / É uma experiência. | Nicht nur eine Website. / Ein Erlebnis. |
| Lancheria | Made to interact. | Feito para interagir. | Gemacht zum Anfassen. |
| Hard Eletric | Built with precision. | Desenvolvido com precisão. | Präzise umgesetzt. |
| VG Construção | Designed for real businesses. | Pensado para negócios reais. | Für echte Unternehmen entwickelt. |
| interativMind | Driven by imagination. | Movido pela imaginação. | Gestaltet mit Fantasie. |
| Encerramento | Your vision. / Made real. | Sua marca / em destaque. | Ihre Vision. / Wird Realität. |
| Serviços | Custom websites · Landing pages · Interactive experiences | Sites personalizados · Landing pages · Experiências interativas | Individuelle Websites · Landingpages · Interaktive Erlebnisse |
| CTA | Let’s build something memorable. | Vamos tirar sua ideia do papel. | Starten wir Ihr Projekt. |

Rótulos dos projetos:

| Projeto | EN | PT-BR | DE |
| :- | :- | :- | :- |
| Lancheria | Restaurant menu · Concept | Cardápio de lanchonete · Conceito | Speisekarte · Konzept |
| Hard Eletric | Electrical services · Client | Serviços elétricos · Cliente | Elektroinstallation · Kundenprojekt |
| VG | Construction company · Client | Construtora · Cliente | Bauunternehmen · Kundenprojekt |
| interativMind | Learning hub · Concept | Plataforma de estudos · Conceito | Lernplattform · Konzept |

CTA da variante de marketplace: "Fale comigo aqui no {platform}" e "Schreiben Sie mir hier auf {platform}".

**Escolhas de tradução** (adaptadas, não literais):
- **"Gemacht zum Anfassen"** ("feito para tocar") é a forma idiomática alemã para algo interativo; "Interaktion" ficaria longo e técnico.
- **"Präzise umgesetzt"** soa mais natural para um site do que "mit Präzision gebaut".
- **Alemão formal:** "Ihre", "Sie" e "Starten wir Ihr Projekt", sem regionalismos, legível na Alemanha, Áustria e Suíça.
- **Encerramento em pt-BR:** "Sua marca em destaque" segue a direção do briefing ("sua marca merece se destacar") e cabe no tamanho original da fonte (ver ajustes).
- **Revisão do pt-BR que já existia:**
  - "Construído" → "Desenvolvido";
  - "Hub de estudos" → "Plataforma de estudos";
  - "Sites sob medida" → "Sites personalizados";
  - "Feita de verdade" → "Sua marca em destaque";
  - "Vamos criar algo memorável" → "Vamos tirar sua ideia do papel";
  - "Me chame" → "Fale comigo".

Nenhuma versão promete resultado, venda ou experiência que o portfólio não mostra.

### Ajustes de composição

- **Nenhuma cena precisou mudar posição, tempo ou duração.** As linhas medem o próprio texto (`fitSize`) e as frases longas quebram em duas linhas equilibradas (`balance`). A duração total continua 35,000 s e os cortes seguem nos mesmos compassos.
- **Encerramento em pt-BR.** A primeira proposta, "Sua marca merece / se destacar.", obrigava a fonte a cair cerca de 20% (de 120 para ~95 px). Em vez de reduzir a fonte, a frase foi encurtada para "Sua marca / em destaque.", que cabe nos 120 px originais.
- **Título da VG em alemão.** "Für echte Unternehmen entwickelt." é o mais longo da série e fica ~14% menor que o inglês, numa linha só e longe do selo do canto; a leitura não muda.
- **Correção no componente de linha** (`src/components/Type.tsx`). O acento de maiúsculas como o "É" de "É uma experiência" aparecia sobre a máscara antes de a palavra subir. Agora a palavra fica oculta até começar a subir e depois de sair; o movimento é o mesmo.

### Verificação

- **Quadros examinados um a um** (pt-BR e DE), no meio de cada cena e em cada transição, nos MP4 finais: nenhum texto cortado, sobreposto ou ilegível; os quatro projetos aparecem como no original; as transições continuam intactas.
- **Sincronia.** O áudio de pt-BR e DE é idêntico amostra a amostra ao do inglês, com a mesma linha do tempo e os mesmos cortes.
- **Regressão do inglês.**
  - Comparação com `renders/willdev-showreel-neutral-en.mp4`: SSIM 0,998, pior quadro 47,9 dB, só ruído de compressão espalhado pelo quadro.
  - Comparação sem compressão (PNG), antes e depois da correção do acento: os quadros só diferem logo antes de uma palavra subir, onde sumiu o brilho residual da palavra ainda oculta (máximo 27/255, área pequena). Todo o resto é idêntico pixel a pixel.
- **Contato.** O OCR dos 1050 quadros de pt-BR e de DE não encontrou telefone, e-mail, URL nem menção a canal externo (`renders/willdev-commercial-*.ocr.json`). No alemão houve um falso positivo no quadro 650: "arafiato.com" era o card "Pintura" da VG ("grafiato com preparo correto") lido sem espaços. A leitura em 2× confirmou o texto real, e é o mesmo trecho de vídeo das outras versões.
- **Ortografia.** Conferida no texto-fonte e nos quadros: o OCR não lê diacríticos, então acentos, ß e tremas foram vistos nas imagens.
- **Código.** `npm run lint` (ESLint + `tsc`) passou limpo.

### Limitações

- Os sites capturados continuam em português nas três versões. São trabalhos reais para clientes brasileiros e não foram traduzidos (seria interface fictícia).
- A revisão do alemão foi feita por mim, sem falante nativo. Se possível, vale uma leitura rápida de alguém da região antes de investir em mídia paga.

## 9. Comercial de restaurante: Chapa Burger + Ingarandi

Nove vídeos em `renders/restaurant/` (`willdev-chapa-ingarandi-<16x9|1x1|9x16>-<en|pt-br|de>.mp4`): 13,6 s, 30 fps, H.264 yuv420p bt709, AAC estéreo 192 kbps. Código em `restaurant/` (módulos descritos em `restaurant/README.md`).

**Roteiro (no tempo da música, 117,45 BPM):** abertura da Chapa Burger, a câmera vai até um lanche e a lente revela o prato vazio (0–3,6 s); as variantes Balcão, Sala e Praça entram por um círculo que nasce de onde a lente estava (3,6–6,6 s); as quatro lado a lado (6,6–7,7 s); o lanche do Ingarandi faz a ponte (7,7–8,2 s); a compra no celular, etapa por etapa (8,2–11,7 s); a moeda WillDev nasce do check de "Pago!", gira e assenta, com a frase e o CTA (11,7–13,6 s). São dois projetos e o vídeo diz isso: cada um tem a sua etiqueta (conceito e cliente).

**Formatos:** 16:9 com o site em tela cheia; 1:1 com o site numa janela 16:10 e as legendas numa faixa abaixo; 9:16 com a captura do celular numa janela alta e as legendas acima. Cada formato tem enquadramento, câmera e posição de texto próprios.

**A compra é real (ambiente de teste).** Cópia descartável do site, Firestore no emulador local (projeto `demo-ingarandi`), conta vendedora e conta compradora de teste do Mercado Pago, cartão de teste Visa com titular `APRO`. O pedido #W97D foi pago no Checkout Pro e voltou ao site com `status=approved`; a notificação foi entregue ao webhook local, que consultou o pagamento na API do Mercado Pago (`approved`, `accredited`) antes de marcar o pedido como pago. Nada tocou a produção. O selo "ambiente de teste do Mercado Pago" fica na tela durante toda a compra. O e-mail mascarado do comprador de teste foi ocultado na tela de revisão do Mercado Pago.

Ajustes que só existem na cópia de captura, nunca no repositório do Ingarandi: o Firestore aponta para o emulador e o e-mail do pagador vem de `SANDBOX_PAYER_EMAIL`, porque o sandbox recusa pagador que não seja conta de teste. O Pix não estava habilitado na conta de teste, por isso a compra usa cartão.

**Som:** trilha "Lucky Draw" (Suno, a mesma do comercial institucional) a partir do segundo drop (97,65 s), com fade-out no último segundo; efeitos sintetizados em `scripts/sfx.py` (impacto, whoosh, lente, toques, confirmação, giro e moeda), posicionados nos movimentos. Limitador a −1,5 dBFS. A trilha troca por parâmetro, sem reconstruir o vídeo (`--music=`, `--music-start=`).

**Verificação:**
- `ffprobe` nos nove: 13,600 s, resolução e fps corretos, áudio AAC estéreo presente.
- Loudness integrado −13,5 LUFS, pico −1,3 dBFS em todos; trecho só de música (0,75–1,25 s) a −14,6 dB de média, ou seja, a trilha está presente e audível.
- OCR de 1 a cada 3 quadros em três vídeos (16:9 EN, 9:16 PT-BR, 1:1 DE): nenhum telefone, e-mail, URL ou menção a WhatsApp.
- Captura: a varredura de texto marcou só um quadro do pedido com o rótulo vazio "Telefone / WhatsApp" do formulário, que não entra na montagem.
- Revisão visual por folhas de contato (`renders/restaurant/review/`).

**Limitações:** as frases da lente são as do próprio site (uma delas tem emoji); o número do pedido e o cartão de teste mascarado (`**** 5682`) aparecem porque fazem parte da tela real; a etapa de dados do cliente foi digitada fora da câmera para não mostrar telefone nem endereço.
