# Relatório — galeria do Gig no Fiverr (v1)

## 1. O que foi feito

Três imagens de 1280×769, PNG RGB 8 bits sem alfa, produzidas em código como `<Still>` do Remotion. Elas reaproveitam a identidade do vídeo: tokens de `config/branding.ts`, fontes Space Grotesk e Chakra Petch, o W vetorial do logo, a moldura de navegador e de celular, a linha neon e o padrão de headline lima com sublinhado rosa.

| Arquivo | Propósito |
| :- | :- |
| `gallery/out/willdev-custom-websites.png` | impacto comercial (card de busca) |
| `gallery/out/willdev-business-projects.png` | credibilidade: dois negócios reais |
| `gallery/out/willdev-creative-design.png` | direção criativa e diferenciação |
| `gallery/out/contact-sheet.png` | as três lado a lado |
| `gallery/out/thumbnails-300.png` | as três a 300 px de largura |

A mesma série saiu em pt-BR em `gallery/out/pt-BR/`.

**Estrutura**

| Arquivo | Conteúdo |
| :- | :- |
| `gallery/copy/en.ts`, `gallery/copy/pt-BR.ts` | todos os textos e a contagem de palavras |
| `gallery/layout.ts` | tamanho do canvas, margem e metadados das capturas |
| `gallery/components.tsx` | `Canvas`, `Shot` (recorte sem distorção), `Browser`, `Phone`, `Headline`, `Tag`, `WMark` |
| `gallery/CustomWebsites.tsx`, `BusinessProjects.tsx`, `CreativeDesign.tsx` | as três composições; posições editáveis no topo de cada arquivo |
| `gallery/capture.mjs` | capturas PNG @2x; reaproveita `capture/lib.mjs` |
| `gallery/render.mjs` | `npm run gallery -- --locale=en`: renderiza, gera folha de contato e teste em 300 px, e verifica |
| `gallery/verify-ocr.py` | verificação por OCR (`--ocr`) |

As imagens são renderizadas em 2× e reduzidas com Lanczos para 1280×769, para a tipografia e as capturas ficarem mais limpas do que num render direto em 1×.

## 2. Decisões visuais

**Imagem 1 — CUSTOM WEBSITES. / BUILT TO STAND OUT.**
- Composição assimétrica: tipografia grande em lima à esquerda, a oferta lida em um olhar.
- À direita, o Raio-X da Lancheria Meia-Noite em tela larga: o lanche com as dez camadas separadas e as chamadas de cada ingrediente, dentro de uma moldura de navegador com a barra de endereço vazia.
- A linha neon do vídeo sai do bloco de texto e pousa exatamente na chamada "Bacon" do Raio-X, ligando a promessa à prova.
- Subtítulo em rosa com sublinhado na palavra-chave, como nos posts. W discreto no canto. Rótulo "Restaurant concept" para não parecer cliente.
- A janela extra da Hard Eletric ficou de fora: o Raio-X sozinho equilibra melhor e dá mais impacto.

**Imagem 2 — DESIGNED FOR REAL BUSINESSES.**
- Hard Eletric e VG Construção, cada uma em computador e celular, em diagonal (Z): Hard Eletric em cima, à direita; VG embaixo, com a ordem celular/computador invertida para dar ritmo.
- O contraste entre os segmentos vem das próprias interfaces:
  - Hard Eletric: escuro e técnico, com o hero e a lista de serviços C-01…C-04 no celular.
  - VG: azul-marinho e amarelo, com o hero e a grade de serviços no celular.
- Os rótulos (nome + segmento) ficam à esquerda e se ligam a cada linha por um fio neon fino.
- Headline no centro da coluna, com sublinhado rosa em "REAL BUSINESSES."
- Nenhum número dos clientes aparece (ver seção 5).

**Imagem 3 — MORE THAN JUST A TEMPLATE.**
- Duas linguagens que nenhum template produziria juntas:
  - a pintura sumi-e da entrada da InterativMind (cerejeira, lua, veios de ouro, o nome escrito à mão), num cartão vertical sobre luz índigo;
  - o hero editorial e claro da Advocacia (gravura da Justiça, serifa clássica), numa janela de navegador.
- A headline fecha a composição embaixo, à direita.
- Os dois projetos têm rótulo de conceito: "Creative concept" e "Law firm concept". A InterativMind aparece como exemplo de direção criativa, sem sugerir que seja um recurso incluído nos pacotes.

**Unidade da campanha.** Fundo preto com uma luz suave na cor de cada projeto (âmbar, azul-marinho, índigo), as mesmas fontes, o mesmo rótulo com traço rosa e ↗, e o W no canto livre de cada peça. As três composições são diferentes: assimétrica, em Z e em grade editorial.

## 3. Capturas usadas

Todas novas, em PNG @2x, a partir dos sites rodando localmente (`gallery/captures/`):

| Captura | Viewport | Usada em |
| :- | :- | :- |
| `lancheria-raiox.png` | 1440×1200 | Imagem 1 (Raio-X, Prensado Completo) |
| `he-desktop.png` | 1440×900 | Imagem 2 (home, hero) |
| `he-mobile.png` | 390×844 | Imagem 2 (home, lista de serviços) |
| `vg-desktop.png` | 1280×690 (exatamente o hero) | Imagem 2 |
| `vg-mobile.png` | 390×844 | Imagem 2 (grade de serviços) |
| `im-entrada.png` | 1440×900 | Imagem 3 (pintura da entrada) |
| `adv-desktop.png` | 1440×900 | Imagem 3 (hero) |
| `im-floresta.png` | 1440×900 | reserva, não usada (tela da floresta do app) |

A entrada da InterativMind vem da cópia de captura descrita em `capture/README.md`: o componente original renderizado sem o fluxo de login, porque em modo demonstração o app pula essa tela. Nenhuma captura foi substituída por imagem gerada, e nenhum quadro foi extraído dos clipes H.264.

## 4. O que ficou faltando ou foi adiado

- **Floresta do app:** a tela `/floresta` da InterativMind foi capturada mas não entrou. Nessa sessão de demonstração a árvore estava pouco florida, e a pintura da entrada comunica melhor o refinamento.
- **Janela secundária da Hard Eletric na imagem 1:** opcional no briefing, testada no planejamento e descartada (ver seção 2).
- **Upload no Fiverr:** a ordem sugerida é 1 → 2 → 3, com a imagem 1 como capa.

## 5. Problemas encontrados no controle de qualidade e correções

- **Cards e linhas de serviço sumindo.** Os cards de serviço da VG e as linhas de serviço da Hard Eletric são links de WhatsApp, e a regra que esconde botões de WhatsApp os escondia inteiros. Como eles só nomeiam o serviço, ficam visíveis; os botões de WhatsApp continuam ocultos.
- **Número da OAB na Advocacia.** O hero mostrava "OAB/PR 00.000". A regra de texto sensível da captura passou a esconder OAB, CNPJ, CPF, CEP e endereços (também vale para futuras capturas do vídeo).
- **Métricas dos clientes.** O hero desktop da VG vinha com a faixa "3.000+ clientes / 100%" logo abaixo, e o celular da Hard Eletric com "500+ atendimentos". Numa imagem estática isso pareceria promessa da WillDev. A VG foi capturada exatamente na altura do hero (690 px), e o celular da Hard Eletric mostra a lista de serviços.
- **Ponto de progresso da VG.** O indicador amarelo de rolagem aparecia como um ponto solto no canto da captura; foi escondido.
- **Título do site competindo com a headline (imagem 2).** No teste a 300 px, "Elétrica bem feita não aparece" ficava quase do tamanho da nossa headline. A headline subiu de 66 para 80 px e as janelas encolheram cerca de 7%.
- **Fio neon solto (imagem 1).** Ele terminava entre duas chamadas; foi alinhado à chamada "Bacon".

**Verificação final**, em inglês e em pt-BR:
- As seis imagens têm 1280×769 e saem em `rgb24` (RGB 8 bits, sem alfa), conferido por `ffprobe` e PIL.
- Palavras adicionadas por imagem: 8, 10 e 10 em inglês; 10, 10 e 9 em pt-BR.
- O OCR das seis imagens não achou telefone, e-mail, URL, canal externo, OAB/CNPJ ou métrica do Fiverr.
- As headlines continuam legíveis em `thumbnails-300.png`.
- `tsc` e ESLint limpos.

## 6. O que testar numa próxima versão

- **Capa alternativa:** um teste A/B no Fiverr com a imagem 2 como capa, para comprador que busca "business website" e não "custom website". O card de busca mostra só a primeira imagem.
- **Rótulos maiores:** um corte de 1280×769 só com o celular do Raio-X, para quem navega pelo app do Fiverr, onde o card fica ainda menor.
