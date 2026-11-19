// Fiverr gallery: renders the three images, then the contact sheet and the 300 px test.
//
//   npm run gallery -- --locale=en
//   npm run gallery -- --locale=pt-BR
//   npm run gallery -- --locale=en --ocr      (also reads every image with OCR)
//
// Output: gallery/out/ (en) or gallery/out/<locale>/ — exactly 1280 × 769, PNG RGB 8-bit, no alpha.
// Texts come from gallery/copy/, so changing a headline or the language never needs a recapture.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { galleryCopy, wordCounts } from './copy/index.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const W = 1280;
const H = 769;
const MAX_WORDS = 10;

const IMAGES = [
  ['Gallery-CustomWebsites', 'willdev-custom-websites'],
  ['Gallery-BusinessProjects', 'willdev-business-projects'],
  ['Gallery-CreativeDesign', 'willdev-creative-design'],
];

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);
const locale = args.locale ?? 'en';
if (!galleryCopy[locale]) throw new Error(`Unknown locale "${locale}". Known: ${Object.keys(galleryCopy).join(', ')}`);
const OUT = path.join(ROOT, 'gallery', 'out', locale === 'en' ? '' : locale);
const TMP = path.join(OUT, '.tmp');

function run(cmd, list, opts = {}) {
  const r = spawnSync(cmd, list, { cwd: ROOT, encoding: 'utf8', ...opts });
  if (r.status !== 0) throw new Error(`${cmd} ${list.join(' ')} failed\n${r.stderr ?? ''}`);
  return r.stdout ?? '';
}
const ffmpeg = () => (spawnSync('ffmpeg', ['-version']).status === 0 ? ['ffmpeg', []] : ['npx', ['remotion', 'ffmpeg']]);
const ffprobe = () => (spawnSync('ffprobe', ['-version']).status === 0 ? ['ffprobe', []] : ['npx', ['remotion', 'ffprobe']]);

fs.mkdirSync(TMP, { recursive: true });
const [ff, ffPre] = ffmpeg();
const files = [];

for (const [id, name] of IMAGES) {
  const big = path.join(TMP, `${name}@2x.png`);
  const final = path.join(OUT, `${name}.png`);
  // Rendered at 2× and reduced with Lanczos: cleaner type and captures than a 1× render.
  run('npx', ['remotion', 'still', 'src/index.ts', id, big, `--props=${JSON.stringify({ locale })}`, '--scale=2', '--image-format=png'], { stdio: 'inherit' });
  run(ff, [...ffPre, '-y', '-v', 'error', '-i', big, '-vf', `scale=${W}:${H}:flags=lanczos,format=rgb24`, '-pix_fmt', 'rgb24', final]);
  files.push(final);
  console.log(`  ${path.relative(ROOT, final)}`);
}

// Contact sheet: the three side by side on graphite, and the same at 300 px wide.
const sheet = (inputs, scaleW, gap, out) => {
  const h = Math.round((H * scaleW) / W);
  const pads = inputs.map((_, i) => `[${i}:v]scale=${scaleW}:${h}:flags=lanczos,pad=${scaleW + gap}:${h + gap * 2}:${gap}:${gap}:color=0x0D1015[p${i}]`);
  const stack = `${inputs.map((_, i) => `[p${i}]`).join('')}hstack=inputs=${inputs.length},pad=iw+${gap}:ih:0:0:color=0x0D1015,format=rgb24`;
  run(ff, [...ffPre, '-y', '-v', 'error', ...inputs.flatMap((f) => ['-i', f]), '-filter_complex', `${pads.join(';')};${stack}`, '-frames:v', '1', out]);
  console.log(`  ${path.relative(ROOT, out)}`);
};
sheet(files, W, 40, path.join(OUT, 'contact-sheet.png'));
sheet(files, 300, 20, path.join(OUT, 'thumbnails-300.png'));
fs.rmSync(TMP, { recursive: true, force: true });

// Checks: exact size, RGB 8-bit without alpha, word budget.
const [fp, fpPre] = ffprobe();
const counts = wordCounts(galleryCopy[locale]);
let ok = true;
console.log('\nChecks');
for (const [, name] of IMAGES) {
  const f = path.join(OUT, `${name}.png`);
  const [w, h, pix] = run(fp, [...fpPre, '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,pix_fmt', '-of', 'csv=p=0', f]).trim().split(',');
  const words = counts[name];
  const pass = Number(w) === W && Number(h) === H && pix === 'rgb24' && words <= MAX_WORDS;
  ok &&= pass;
  console.log(`  ${pass ? 'ok' : '!!'} ${name}.png  ${w}×${h}  ${pix}${pix === 'rgb24' ? ' (RGB 8-bit, no alpha)' : ''}  ${words} words`);
}

if (args.ocr) {
  const r = spawnSync('python3', [path.join(ROOT, 'gallery', 'verify-ocr.py'), ...IMAGES.map(([, n]) => path.join(OUT, `${n}.png`))], { stdio: 'inherit' });
  ok &&= r.status === 0;
}
if (!ok) process.exit(1);
