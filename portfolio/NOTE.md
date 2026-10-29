# Capas do portfólio — nota

Cinco capas para a seção "Portfolio of past projects" do Fiverr, uma por projeto, feitas em React como `<Still>` do Remotion, a partir de capturas reais e novas dos sites rodando localmente.

| Arquivo (2560×1538, para upload) | Projeto | Tipo |
| :- | :- | :- |
| `out/portfolio-hard-eletric.png` | Hard Eletric — Custom Business Website | cliente |
| `out/portfolio-vg-construcoes.png` | VG Construção — Business Website | cliente |
| `out/portfolio-lancheria-meia-noite.png` | Lancheria Meia-Noite — Interactive Restaurant Website | conceito |
| `out/portfolio-interativmind.png` | interativMind — Creative Learning Platform | projeto pessoal |
| `out/portfolio-advocacia-demo.png` | Advocacia Demo — Editorial Law Website | conceito |

Cópias em 1280×769 ficam em `out/1280/`, e as cinco juntas em `out/contact-sheet.png`.

**Tamanho.** O Fiverr não publica um tamanho específico para imagens de portfólio; para imagens de Gig ele recomenda 1280×769, com mínimo de 712×430 e máximo de 4000×2416. As capas seguem essa proporção, exportadas em 2× (2560×1538) para ficar nítidas em telas de alta densidade, dentro do máximo.

## Lógica visual

**Um sistema, cinco personalidades.**

O que é fixo em todas as capas:
- cabeçalho fino com o W da WillDev à esquerda, um fio horizontal e a procedência do projeto à direita ("Client project", "Concept project", "Personal project");
- bloco de título com o nome do projeto em grotesca editorial e a descrição em caixa-alta técnica, com o traço rosa da marca (as mesmas fontes do vídeo e da galeria);
- capturas reais em molduras de navegador e celular discretas, com a barra de endereço vazia;
- margens de 64 px.

O que muda é o fundo, que vem da paleta do próprio site, e a composição, pensada para o caráter de cada projeto:

- **Hard Eletric:** grafite quase preto, com uma grade de projeto no azul de instrumento do site. O hero no desktop e, sobreposta, a foto do quadro de distribuição com o esquema azul traçado (o "circuito primeiro, luz depois" da página Sobre). Técnico e preciso.
- **VG Construção:** azul-marinho, com a faixa listrada amarela que o site usa como motivo. Três páginas reais em cascata (início, serviços e galeria de obras) e o celular à frente, para mostrar um site de várias páginas, estruturado e responsivo. O título fica embaixo para equilibrar a diagonal.
- **Lancheria Meia-Noite:** marrom quente e latão. A home com o cardápio, o trilho "Na prensa" e, em destaque, o celular com o Raio-X: o lanche aberto em dez camadas.
- **interativMind:** índigo noturno e uma luz dourada de lua. A árvore do conhecimento dentro do app e a pintura da entrada como um rolo pendurado; o título fica embaixo à direita, deixando a arte respirar.
- **Advocacia Demo:** a única capa clara, no papel e no verde-escuro do site, com filete duplo editorial. Um artigo e a home sobrepostos e o celular. O W passa à cor de tinta, porque o lima perderia contraste no papel.

O texto é só o nome, a descrição e a procedência; o protagonista é o trabalho. Sem preço, resultados, depoimentos, contato ou marca do Fiverr.

## Honestidade

- Toda imagem é captura do site real. Nenhuma interface foi desenhada ou alterada; só o que expõe contato foi escondido na captura: botões de WhatsApp, telefones, e-mails, links externos e o número da OAB.
- A Lancheria e a Advocacia aparecem como conceito, e a interativMind como projeto pessoal; só Hard Eletric e VG aparecem como cliente.
- **VG Construção:** o site e o logo do cliente escrevem "VG Construção", no singular, e a capa segue o cliente. O nome do arquivo segue o pedido (`portfolio-vg-construcoes`). Para trocar, edite `name` em `projects.ts`.
- **interativMind:** o produto escreve o nome com "i" minúsculo, e a capa respeita isso.

## Verificação

- As dez saídas (5 × 2 tamanhos) têm o tamanho exato e saem em `rgb24` (RGB 8 bits, sem alfa).
- O OCR das cinco capas em 2560 px não encontrou telefone, e-mail, URL, OAB/CNPJ nem métrica do Fiverr.
- A versão em 1280 px da Advocacia dava um falso positivo: o OCR juntou "Sarandi e região, com" e leu ".com". A leitura em alta resolução confirmou o texto real, e o comando passou a ler a versão de 2560 px.
- Nomes legíveis com a capa reduzida a 300 px.

## Editar e regenerar

| O que mudar | Onde |
| :- | :- |
| Textos, cores e capturas de cada projeto | `projects.ts` |
| Composição de cada capa | `layouts.tsx` |
| Cabeçalho e título comuns | `Cover.tsx` e `parts.tsx` |

Para gerar as capas, a folha de contato e as verificações:

```bash
npm run portfolio -- --ocr
```

Para refazer as capturas (com os sites rodando localmente, ver `capture/README.md`):

```bash
npm run portfolio:capture
```
