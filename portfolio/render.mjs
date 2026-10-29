// Fiverr portfolio covers: renders every cover in portfolio/projects.ts.
//
//   npm run portfolio                       all covers + contact sheet
//   npm run portfolio -- --only=portfolio-hard-eletric
//   npm run portfolio -- --ocr              also reads each cover with OCR
//
// Output (PNG RGB 8-bit, no alpha, 1280 × 769 proportions — Fiverr's recommended gig image ratio):
//   portfolio/out/<file>.png          2560 × 1538, for upload (Fiverr accepts up to 4000 × 2416)
//   portfolio/out/1280/<file>.png     1280 × 769
//   portfolio/out/contact-sheet.png   all covers together

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { projects } from './projects.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'portfolio', 'out');
const SMALL = path.join(OUT, '1280');

/** Remotion composition id for each cover (registered in src/Root.tsx). */
const IDS = {
  'portfolio-hard-eletric': 'Portfolio-HardEletric',
  'portfolio-vg-construcoes': 'Portfolio-VG',
  'portfolio-lancheria-meia-noite': 'Portfolio-Lancheria',
  'portfolio-interativmind': 'Portfolio-InterativMind',
  'portfolio-advocacia-demo': 'Portfolio-Advocacia',
};

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);

function run(cmd, list, opts = {}) {
  const r = spawnSync(cmd, list, { cwd: ROOT, encoding: 'utf8', ...opts });
  if (r.status !== 0) throw new Error(`${cmd} ${list.join(' ')} failed\n${r.stderr ?? ''}`);
  return r.stdout ?? '';
}
const [ff, ffPre] = spawnSync('ffmpeg', ['-version']).status === 0 ? ['ffmpeg', []] : ['npx', ['remotion', 'ffmpeg']];
const [fp, fpPre] = spawnSync('ffprobe', ['-version']).status === 0 ? ['ffprobe', []] : ['npx', ['remotion', 'ffprobe']];

fs.mkdirSync(SMALL, { recursive: true });
const selected = projects.filter((p) => !args.only || p.file === args.only);
for (const p of selected) {
  const id = IDS[p.file];
  if (!id) throw new Error(`No composition registered for ${p.file}`);
  const raw = path.join(OUT, `.${p.file}.raw.png`);
  const big = path.join(OUT, `${p.file}.png`);
  const small = path.join(SMALL, `${p.file}.png`);
  run('npx', ['remotion', 'still', 'src/index.ts', id, raw, `--props=${JSON.stringify({ file: p.file })}`, '--scale=2', '--image-format=png'], { stdio: 'inherit' });
  run(ff, [...ffPre, '-y', '-v', 'error', '-i', raw, '-vf', 'format=rgb24', big]);
  run(ff, [...ffPre, '-y', '-v', 'error', '-i', raw, '-vf', 'scale=1280:769:flags=lanczos,format=rgb24', small]);
  fs.rmSync(raw, { force: true });
  console.log(`  ${path.relative(ROOT, big)}  +  ${path.relative(ROOT, small)}`);
}

// Contact sheet: three on top, two below, on graphite.
const all = projects.map((p) => path.join(SMALL, `${p.file}.png`)).filter((f) => fs.existsSync(f));
if (all.length) {
  const w = 640;
  const h = Math.round((769 * w) / 1280);
  const g = 24;
  const cols = 3;
  const pads = all.map((_, i) => `[${i}:v]scale=${w}:${h}:flags=lanczos,pad=${w + g}:${h + g}:${g}:${g}:color=0x0D1015[p${i}]`);
  const layout = all.map((_, i) => `${(i % cols) * (w + g)}_${Math.floor(i / cols) * (h + g)}`).join('|');
  const rows = Math.ceil(all.length / cols);
  const sheet = path.join(OUT, 'contact-sheet.png');
  const filter = `${pads.join(';')};${all.map((_, i) => `[p${i}]`).join('')}xstack=inputs=${all.length}:layout=${layout}:fill=0x0D1015,pad=${cols * (w + g) + g}:${rows * (h + g) + g}:0:0:color=0x0D1015,format=rgb24`;
  run(ff, [...ffPre, '-y', '-v', 'error', ...all.flatMap((f) => ['-i', f]), '-filter_complex', filter, '-frames:v', '1', sheet]);
  console.log(`  ${path.relative(ROOT, sheet)}`);
}

// Checks: size and RGB without alpha.
let ok = true;
console.log('\nChecks');
for (const p of selected) {
  for (const [f, W, H] of [
    [path.join(OUT, `${p.file}.png`), 2560, 1538],
    [path.join(SMALL, `${p.file}.png`), 1280, 769],
  ]) {
    const [w, h, pix] = run(fp, [...fpPre, '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,pix_fmt', '-of', 'csv=p=0', f]).trim().split(',');
    const pass = Number(w) === W && Number(h) === H && pix === 'rgb24';
    ok &&= pass;
    console.log(`  ${pass ? 'ok' : '!!'} ${path.relative(ROOT, f)}  ${w}×${h}  ${pix}`);
  }
}
if (args.ocr) {
  const r = spawnSync('python3', [path.join(ROOT, 'gallery', 'verify-ocr.py'), ...selected.map((p) => path.join(OUT, `${p.file}.png`))], { stdio: 'inherit' });
  ok &&= r.status === 0;
}
if (!ok) process.exit(1);
