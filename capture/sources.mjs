// Where each source project runs during capture. The repositories are read
// only: static sites are served as they are, the Next.js apps run from their
// own production build. Override any base URL with an environment variable.

import path from 'node:path';
import fs from 'node:fs';
import { ROOT } from './lib.mjs';

const SOURCES = process.env.SOURCES_DIR ?? path.resolve(ROOT, '..');

export const sources = {
  interativmind: {
    repo: path.join(SOURCES, 'InterativMind'),
    url: process.env.IM_URL ?? 'http://localhost:3000',
    // Capture-only copy that adds one route rendering the real <EntranceScene>
    // (the entrance is skipped in demo mode). See capture/README.md.
    entranceUrl: process.env.IM_ENTRANCE_URL ?? 'http://localhost:3002/captura-entrada',
  },
  lancheria: {
    repo: path.join(SOURCES, 'lancheriademodois', 'lancheria-meia-noite-repo'),
    url: process.env.LANCHERIA_URL ?? 'http://localhost:3001',
  },
  hardeletric: {
    repo: path.join(SOURCES, 'hardeletric'),
    url: process.env.HARDELETRIC_URL ?? 'http://localhost:8101',
  },
  vg: {
    repo: path.join(SOURCES, 'vgconstru-o'),
    url: process.env.VG_URL ?? 'http://localhost:8102',
  },
  // Chapa Burger: the Radar app (creatingmk1) from its own production build,
  // rendered by its internal QA route. The route needs the app's session
  // cookie, signed with the APP_PASSWORD the local server was started with.
  chapa: {
    repo: path.join(SOURCES, 'sources', 'scan', 'creatingmk1'),
    url: process.env.CHAPA_URL ?? 'http://localhost:3200',
    password: process.env.CHAPA_APP_PASSWORD ?? 'willdev-capture',
  },
  // Ingarandi Burger: a disposable copy of lancheriademonstracao wired to the
  // Firestore emulator and to Mercado Pago TEST accounts (see capture/README.md).
  // The browser sees it at INGARANDI_ORIGIN, mapped to the local server.
  ingarandi: {
    repo: path.join(SOURCES, 'sources', 'scan', 'lancheriademonstracao'),
    origin: process.env.INGARANDI_ORIGIN ?? 'https://ingarandi-sandbox.test',
    local: process.env.INGARANDI_LOCAL ?? 'http://localhost:3000',
  },
  advocacia: {
    repo: path.join(SOURCES, 'advocaciademo'),
    url: process.env.ADVOCACIA_URL ?? 'http://localhost:8103',
  },
};

/** The DSEG7 display font of the Hard Eletric multimeter comes from jsDelivr; serve it from npm instead. */
export function dsegRoute() {
  const candidates = [
    path.join(ROOT, 'node_modules', 'dseg', 'fonts', 'DSEG7-Classic', 'DSEG7Classic-Bold.woff2'),
  ];
  const file = candidates.find((f) => fs.existsSync(f));
  return {
    match: '**/cdn.jsdelivr.net/**',
    handler: (route) =>
      file ? route.fulfill({ body: fs.readFileSync(file), contentType: 'font/woff2' }) : route.abort(),
  };
}
