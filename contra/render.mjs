// Contra service cover (4:3): renders both variants, a side-by-side preview and the checks.
//
//   npm run contra
//   npm run contra -- --ocr      also reads each cover with OCR (contact data, URLs)
//
// Output: contra/out/contra-service-cover-willdev.png, contra/out/contra-service-cover-willdev-alt.png
// (1600 × 1200, PNG RGB 8-bit, no alpha) and contra/out/preview.png. Text lives in contra/config.ts.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { contraCopy } from './config.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'contra', 'out');
const W = 1600;
const H = 1200;
const VARIANTS = [
  ['Contra-Cover', contraCopy.main.file],
  ['Contra-Cover-Alt', contraCopy.alt.file],
];
const ocr = process.argv.includes('--ocr');

function run(cmd, list, opts = {}) {
  const r = spawnSync(cmd, list, { cwd: ROOT, encoding: 'utf8', ...opts });
  if (r.status !== 0) throw new Error(`${cmd} ${list.join(' ')} failed\n${r.stderr ?? ''}`);
  return r.stdout ?? '';
}
const [ff, ffPre] = spawnSync('ffmpeg', ['-version']).status === 0 ? ['ffmpeg', []] : ['npx', ['remotion', 'ffmpeg']];
const [fp, fpPre] = spawnSync('ffprobe', ['-version']).status === 0 ? ['ffprobe', []] : ['npx', ['remotion', 'ffprobe']];

fs.mkdirSync(OUT, { recursive: true });
const files = [];
for (const [id, name] of VARIANTS) {
  const raw = path.join(OUT, `.${name}.raw.png`);
  const final = path.join(OUT, `${name}.png`);
  // Rendered at 2× and reduced with Lanczos for clean type and captures.
  run('npx', ['remotion', 'still', 'src/index.ts', id, raw, '--scale=2', '--image-format=png'], { stdio: 'inherit' });
  run(ff, [...ffPre, '-y', '-v', 'error', '-i', raw, '-vf', `scale=${W}:${H}:flags=lanczos,format=rgb24`, final]);
  fs.rmSync(raw, { force: true });
  files.push(final);
  console.log(`  ${path.relative(ROOT, final)}`);
}

// Preview: both variants side by side at half size.
const preview = path.join(OUT, 'preview.png');
const pads = files.map((_, i) => `[${i}:v]scale=800:600:flags=lanczos,pad=824:648:24:24:color=0x0D1015[p${i}]`);
run(ff, [...ffPre, '-y', '-v', 'error', ...files.flatMap((f) => ['-i', f]), '-filter_complex', `${pads.join(';')};${files.map((_, i) => `[p${i}]`).join('')}hstack=inputs=${files.length},pad=iw+24:ih:0:0:color=0x0D1015,format=rgb24`, '-frames:v', '1', preview]);
console.log(`  ${path.relative(ROOT, preview)}`);

let ok = true;
console.log('\nChecks');
for (const f of files) {
  const [w, h, pix] = run(fp, [...fpPre, '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,pix_fmt', '-of', 'csv=p=0', f]).trim().split(',');
  const pass = Number(w) === W && Number(h) === H && pix === 'rgb24';
  ok &&= pass;
  console.log(`  ${pass ? 'ok' : '!!'} ${path.relative(ROOT, f)}  ${w}×${h}  ${pix}`);
}
if (ocr) {
  const r = spawnSync('python3', [path.join(ROOT, 'gallery', 'verify-ocr.py'), ...files], { stdio: 'inherit' });
  ok &&= r.status === 0;
}
if (!ok) process.exit(1);
