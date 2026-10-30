// Renders one variant of the showreel (and optionally the thumbnails).
//
//   npm run render -- --platform=fiverr --locale=en
//   npm run render -- --platform=neutral --locale=pt-BR
//   npm run render -- --platform=fiverr-business --locale=en --crf=20
//   npm run render -- --thumbnails --locale=en
//   npm run render -- --all            (the default deliverables)
//
// Output: renders/willdev-showreel-<platform>-<locale>.mp4 — H.264 + AAC, +faststart,
// checked against the 40 MB budget. Platforms live in config/platforms.ts, copy in locales/.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { platforms } from '../config/platforms.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'renders');
const MAX_MB = 40;
const locales = Object.fromEntries(
  fs.readdirSync(path.join(ROOT, 'locales')).filter((f) => f.endsWith('.ts') && f !== 'index.ts').map((f) => [f.replace(/\.ts$/, ''), true]),
);

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);

function run(cmd, list) {
  const r = spawnSync(cmd, list, { stdio: 'inherit', cwd: ROOT });
  if (r.status !== 0) throw new Error(`${cmd} ${list.join(' ')} failed`);
}

function ffmpeg() {
  const r = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  return r.status === 0 ? ['ffmpeg', []] : ['npx', ['remotion', 'ffmpeg']];
}

function renderVideo(platform, locale, crf) {
  if (!platforms[platform]) throw new Error(`Unknown platform "${platform}". Known: ${Object.keys(platforms).join(', ')}`);
  if (!locales[locale]) throw new Error(`Unknown locale "${locale}". Known: ${Object.keys(locales).join(', ')}`);
  fs.mkdirSync(OUT, { recursive: true });
  const name = `willdev-showreel-${platform}-${locale}.mp4`;
  const tmp = path.join(OUT, `.tmp-${name}`);
  const final = path.join(OUT, name);
  const props = JSON.stringify({ platform, locale, mute: Boolean(args.mute) });
  console.log(`\n▶ ${name}`);
  run('npx', [
    'remotion', 'render', 'src/index.ts', 'Showreel', tmp,
    `--props=${props}`,
    '--codec=h264', `--crf=${crf}`, '--pixel-format=yuv420p', '--color-space=bt709',
    '--audio-codec=aac', '--audio-bitrate=192k',
    '--x264-preset=slow',
  ]);
  // Video copied as is; audio trimmed a hair short of 35 s so the container never
  // reports more than 35.000 s (AAC padding), then moov moved to the front.
  const [cmd, pre] = ffmpeg();
  const audio = args.mute ? ['-an'] : ['-af', 'atrim=0:34.98', '-c:a', 'aac', '-b:a', '192k'];
  run(cmd, [...pre, '-y', '-v', 'error', '-i', tmp, '-c:v', 'copy', ...audio, '-movflags', '+faststart', final]);
  fs.rmSync(tmp, { force: true });
  const mb = fs.statSync(final).size / 1e6;
  console.log(`  ${path.relative(ROOT, final)}: ${mb.toFixed(1)} MB${mb > MAX_MB ? `  !! over ${MAX_MB} MB — raise --crf` : ''}`);
  return final;
}

/** Frames used by the thumbnail, taken from the clips (a still render cannot seek a video exactly). */
const STILLS = [
  ['im-entrada', 215],
  ['lancheria-raiox', 40],
];

export function extractStills() {
  const dir = path.join(ROOT, 'public', 'stills');
  fs.mkdirSync(dir, { recursive: true });
  const [cmd, pre] = ffmpeg();
  for (const [clip, frame] of STILLS) {
    const file = path.join(dir, `${clip}-${frame}.jpg`);
    run(cmd, [...pre, '-y', '-v', 'error', '-i', path.join(ROOT, 'footage', `${clip}.mp4`), '-vf', `select=eq(n\\,${frame})`, '-vframes', '1', '-q:v', '2', file]);
  }
}

function renderThumbnails(locale) {
  fs.mkdirSync(OUT, { recursive: true });
  extractStills();
  const suffix = locale === 'en' ? '' : `-${locale}`;
  const props = JSON.stringify({ locale });
  for (const [id, size] of [['Thumbnail', '1920x1080'], ['Thumbnail-720', '1280x720']]) {
    const file = path.join(OUT, `thumbnail-${size}${suffix}.png`);
    run('npx', ['remotion', 'still', 'src/index.ts', id, file, `--props=${props}`, '--image-format=png']);
    console.log(`  ${path.relative(ROOT, file)}`);
  }
}

const crf = Number(args.crf ?? 18);
if (args.all) {
  renderVideo('neutral', 'en', crf);
  renderVideo('fiverr', 'en', crf);
  renderThumbnails('en');
} else if (args.thumbnails) {
  renderThumbnails(args.locale ?? 'en');
} else {
  renderVideo(args.platform ?? 'neutral', args.locale ?? 'en', crf);
}
