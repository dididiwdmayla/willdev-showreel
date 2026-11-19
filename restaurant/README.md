# Comercial de restaurante: Chapa Burger + Ingarandi

Comercial de 13,6 s em três formatos (16:9, 1:1, 9:16) e três idiomas (EN, PT-BR, DE). A Chapa Burger (conceito, as quatro variantes reais da skin) é a protagonista; o Ingarandi Burger (cliente) aparece no fim com a compra real, feita no ambiente de teste do Mercado Pago; o encerramento é a moeda WillDev.

```bash
npm run render -- --restaurant
```

Saída: `renders/restaurant/willdev-chapa-ingarandi-<formato>-<idioma>.mp4` (9 arquivos). Só um formato ou idioma: `--aspect=9x16 --locale=de`.

## Módulos (reaproveitáveis em outras montagens)

| Arquivo | O que tem |
| :- | :- |
| `config.ts` | duração, grade de batidas, cenas, tamanhos, música, etapas da compra, metadados das tomadas |
| `parts.tsx` | câmera sobre uma tomada (`Take`, `camera`), cursor, toque, transição pela lente (`LensWipe`), celular, selo de teste, trilho de etapas, moeda (`Coin`) |
| `shared.tsx` | textos do idioma atual (`useMessages`), legendas e posições por formato |
| `scenes/chapa.tsx` | abertura + lente, cenas das variantes, grade das quatro |
| `scenes/ingarandi.tsx` | ponte para o Ingarandi e a compra no celular |
| `scenes/closing.tsx` | moeda nascendo do check de "Pago!", frase e CTA |
| `sound.tsx` | música e efeitos (`Soundtrack`, `soundtrack(aspect)`) |
| `Restaurant.tsx` | a montagem: só encadeia as cenas acima |

Cada cena recebe o formato (`a`) e lê suas tomadas de `footage/`; nenhuma depende de outra para funcionar. Uma montagem nova (por exemplo, a Lancheria Meia-Noite intercalada com a Chapa) importa as cenas e as tomadas que quiser.

## Trocar a música

A trilha atual é "WillDev Burger Funk" (`assets/audio/willdev-burger-funk.wav`, 13,6 s, ~141 BPM), feita para este corte; os cortes estão na grade dela (`BEAT`, `SCENES` em `config.ts`). A música baixa 3 dB durante a compra (`MUSIC.duck`), e a finalização normaliza a mixagem a −14 LUFS.

Para usar outra, sem reconstruir nada:

1. Coloque o arquivo em `assets/audio/` (aparece em `public/audio/`).
2. Renderize apontando para ele e para o segundo em que deve começar:

```bash
npm run render -- --restaurant --music=audio/nova-faixa.m4a --music-start=12.5
```

Ou mude `MUSIC.file`/`MUSIC.start` em `config.ts` para torná-la o padrão. Com outra faixa, os cortes continuam onde estão. Para que voltem a cair nas batidas da nova, ajuste o BPM e a primeira batida de `beat()` em `config.ts` e, se quiser, os quadros de `SCENES`.

Os efeitos sonoros são gerados por `python3 scripts/sfx.py` (`assets/sfx/`, sintetizados no próprio script) e posicionados por `sound.tsx`.

## Capturas

As tomadas estão versionadas em `footage/` (`chapa-<variante>-d|m.mp4`, `ingarandi-*.mp4`, `stills/mp-review.png`) e as posições do cursor e dos toques em `footage/capture-meta.json`. Para refazer:

```bash
npm run capture -- chapa-chapa-d chapa-sala-m
```

```bash
npm run capture -- ingarandi-pedido ingarandi-compra
```

Chapa Burger: build de produção do Radar (`creatingmk1`) rodando em `CHAPA_URL` (padrão `http://localhost:3200`) com o mesmo `APP_PASSWORD` de `CHAPA_APP_PASSWORD`; a rota usada é a interna de QA (`/interno/demo-qa?skin=lancheria-chapa-burger&preset=<variante>&intro=0`).

Ingarandi: uma cópia descartável de `lancheriademonstracao`, nunca o repositório nem a produção:
- Firestore no emulador local (`firebase emulators:start --only firestore`, projeto `demo-ingarandi`), com `lib/firebase.ts` e `firebase-admin.ts` apontando para ele;
- servidor com `MP_ACCESS_TOKEN` de uma conta vendedora de TESTE do Mercado Pago (injetado pelo proxy, nunca escrito em arquivo) e `SANDBOX_PAYER_EMAIL` de um comprador de teste;
- `NEXT_PUBLIC_BASE_URL=https://ingarandi-sandbox.test`: o Mercado Pago não aceita `localhost` como retorno; o navegador da captura mapeia esse domínio para o servidor local.

`ingarandi-compra` faz uma compra de teste completa no Checkout Pro (cartão de teste Visa, titular `APRO`), volta para a página do pedido e entrega a notificação ao webhook local, que lê o pagamento na API do Mercado Pago antes de marcar o pedido como pago.
