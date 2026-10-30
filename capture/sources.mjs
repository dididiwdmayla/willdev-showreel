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
