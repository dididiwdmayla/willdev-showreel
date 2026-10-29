// Still captures for the Fiverr gallery: PNG at deviceScaleFactor 2, taken from the
// sites running locally (see capture/README.md for how to serve them). Reuses the
// video's capture helpers, so the same CSS hides contact data, links and debug UI,
// and every capture is scanned for phone numbers, e-mails, URLs and document ids.
//
//   node gallery/capture.mjs              all captures
//   node gallery/capture.mjs vg-desktop   only the named ones

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FrameWriter, launch, openPage } from '../capture/lib.mjs';
import { dsegRoute, sources } from '../capture/sources.mjs';

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'captures');
const DESKTOP = { width: 1440, height: 900 };
const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true };
const HIDE_DEMO_BANNER = `aside.border-b { display: none !important; }`;
// VG: service cards are WhatsApp links that only name the service (kept); the scroll-progress dot is chrome.
const VG_CSS = `a.service-card { visibility: visible !important; } .scroll-progress { display: none !important; }`;

/** Screenshot + text scan. `clip` is in CSS pixels. */
async function shoot(page, name, clip) {
  const scan = new FrameWriter(`gallery-${name}`, { clip });
  await scan.scan(page);
  const ok = scan.report();
  fs.mkdirSync(OUT, { recursive: true });
  await page.screenshot({ path: path.join(OUT, `${name}.png`), clip, animations: 'allow', caret: 'hide' });
  console.log(`  -> gallery/captures/${name}.png${ok ? '' : '  (check the warnings above)'}`);
}

async function open(browser, url, opts = {}) {
  const page = await openPage(browser, { url, scale: 2, viewport: DESKTOP, ...opts });
  return page;
}

const SHOTS = {
  /** Raio-X on a wide screen: the exploded stack with every callout. */
  async 'lancheria-raiox'(b) {
    const page = await open(b, `${sources.lancheria.url}/`, { viewport: { width: 1440, height: 1200 } });
    await page.waitForTimeout(3500);
    await page.locator('[data-item-cardapio]').first().locator('button').filter({ hasText: /\+|Adicionar/ }).first().click();
    await page.waitForTimeout(900);
    await page.locator('[data-modificar]').first().click();
    await page.waitForTimeout(2000);
    await shoot(page, 'lancheria-raiox');
    await page.context().close();
  },

  /** Hard Eletric home, hero. The header WhatsApp button is hidden by the shared CSS. */
  async 'he-desktop'(b) {
    const page = await open(b, `${sources.hardeletric.url}/home.dc.html`, { routes: [dsegRoute()] });
    await page.waitForTimeout(2500);
    await shoot(page, 'he-desktop');
    await page.context().close();
  },

  /** Hard Eletric on a phone: the "distribution board" list of services (C-01, C-02…). */
  async 'he-mobile'(b) {
    // Each service row is a link to WhatsApp, but the row itself only names the service.
    const css = `#servicos a[href*="wa.me"] { visibility: visible !important; }`;
    const page = await open(b, `${sources.hardeletric.url}/home.dc.html`, { ...PHONE, css, routes: [dsegRoute()] });
    await page.waitForTimeout(1500);
    const top = await page.evaluate(() => document.querySelector('#servicos').getBoundingClientRect().top + scrollY);
    await page.evaluate((y) => window.scrollTo(0, y), top + 40);
    await page.waitForTimeout(3000);
    await shoot(page, 'he-mobile');
    await page.context().close();
  },

  /** VG Construção home on desktop: exactly the hero (it is 690 px tall), without the figures band below it. */
  async 'vg-desktop'(b) {
    const page = await open(b, `${sources.vg.url}/index.html`, { viewport: { width: 1280, height: 690 }, css: VG_CSS });
    await page.waitForTimeout(2500);
    await shoot(page, 'vg-desktop');
    await page.context().close();
  },

  /** VG Construção on a phone: the services grid. */
  async 'vg-mobile'(b) {
    const page = await open(b, `${sources.vg.url}/index.html`, { ...PHONE, css: VG_CSS });
    await page.waitForTimeout(1500);
    const top = await page.evaluate(() => document.querySelector('#servicos').getBoundingClientRect().top + scrollY);
    await page.evaluate((y) => window.scrollTo(0, y), top - 10);
    await page.waitForTimeout(2500);
    await shoot(page, 'vg-mobile');
    await page.context().close();
  },

  /** interativMind, the forest screen of the app (demo mode, banner hidden). */
  async 'im-floresta'(b) {
    const page = await open(b, `${sources.interativmind.url}/floresta`, { css: HIDE_DEMO_BANNER });
    await page.waitForTimeout(4000);
    await shoot(page, 'im-floresta');
    await page.context().close();
  },

  /** interativMind entrance painting once the intro has settled (capture-only route, see capture/README.md). */
  async 'im-entrada'(b) {
    const page = await open(b, sources.interativmind.entranceUrl, { css: HIDE_DEMO_BANNER });
    await page.waitForTimeout(9000);
    await shoot(page, 'im-entrada');
    await page.context().close();
  },

  /** Advocacia home, hero (OAB number hidden by the sensitive-text rule). */
  async 'adv-desktop'(b) {
    const page = await open(b, `${sources.advocacia.url}/index.html`);
    await page.waitForTimeout(2500);
    await shoot(page, 'adv-desktop');
    await page.context().close();
  },
};

const wanted = process.argv.slice(2);
const names = wanted.length ? wanted : Object.keys(SHOTS);
const browser = await launch();
for (const name of names) {
  if (!SHOTS[name]) throw new Error(`Unknown capture "${name}". Known: ${Object.keys(SHOTS).join(', ')}`);
  console.log(`\n▶ ${name}`);
  await SHOTS[name](browser);
}
await browser.close();
