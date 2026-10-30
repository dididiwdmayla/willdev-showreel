// Single-image captures (gallery, portfolio): PNG at deviceScaleFactor 2 with the same
// hiding rules and text scan as the video captures.

import fs from 'node:fs';
import path from 'node:path';
import { FrameWriter, launch, openPage } from './lib.mjs';

export const DESKTOP = { width: 1440, height: 900 };
export const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true };
export const HIDE_DEMO_BANNER = `aside.border-b { display: none !important; }`;
/** VG: service cards are WhatsApp links that only name the service (kept); the scroll-progress dot is chrome. */
export const VG_CSS = `a.service-card { visibility: visible !important; } .scroll-progress { display: none !important; }`;

export function openStill(browser, url, opts = {}) {
  return openPage(browser, { url, scale: 2, viewport: DESKTOP, ...opts });
}

/** Screenshot + text scan into `dir/<name>.png`. `clip` is in CSS pixels. */
export async function shoot(page, dir, name, clip) {
  const scan = new FrameWriter(`still-${name}`, { clip });
  await scan.scan(page);
  const ok = scan.report();
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${name}.png`);
  await page.screenshot({ path: file, clip, animations: 'allow', caret: 'hide' });
  console.log(`  -> ${path.relative(process.cwd(), file)}${ok ? '' : '  (check the warnings above)'}`);
}

/** Runs the named shots (or all of them) from a { name: async (browser) => {} } table. */
export async function runShots(shots, wanted) {
  const names = wanted.length ? wanted : Object.keys(shots);
  const browser = await launch();
  for (const name of names) {
    if (!shots[name]) throw new Error(`Unknown capture "${name}". Known: ${Object.keys(shots).join(', ')}`);
    console.log(`\n▶ ${name}`);
    await shots[name](browser);
  }
  await browser.close();
}
