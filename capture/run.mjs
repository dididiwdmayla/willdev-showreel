// Captures every shot (or the ones named on the command line) into footage/.
//   node capture/run.mjs                 all shots
//   node capture/run.mjs he-quadro lancheria-trilho
import { launch } from './lib.mjs';
import { heQuadro, heCircuitos, heMultimetro } from './shots/hardeletric.mjs';
import { lancheriaTrilho, lancheriaRaioX } from './shots/lancheria.mjs';
import { vgDesktop, vgMobile } from './shots/vg.mjs';
import { imEntrada, imArvore } from './shots/interativmind.mjs';

const SHOTS = {
  'im-entrada': imEntrada,
  'im-arvore': imArvore,
  'lancheria-trilho': lancheriaTrilho,
  'lancheria-raiox': lancheriaRaioX,
  'he-quadro': heQuadro,
  'he-circuitos': heCircuitos,
  'he-multimetro': heMultimetro,
  'vg-desktop': vgDesktop,
  'vg-mobile': vgMobile,
};

const wanted = process.argv.slice(2);
const names = wanted.length ? wanted : Object.keys(SHOTS);
const browser = await launch();
for (const name of names) {
  if (!SHOTS[name]) throw new Error(`Unknown shot "${name}". Known: ${Object.keys(SHOTS).join(', ')}`);
  console.log(`\n▶ ${name}`);
  const t = Date.now();
  await SHOTS[name](browser);
  console.log(`  (${((Date.now() - t) / 1000).toFixed(1)} s)`);
}
await browser.close();
