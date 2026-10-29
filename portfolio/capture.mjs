// Captures for the Fiverr portfolio covers: PNG @2x from the sites running locally,
// with the shared hiding rules and text scan (see capture/still.mjs).
//
//   node portfolio/capture.mjs                 all captures
//   node portfolio/capture.mjs he-quadro       only the named ones

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dsegRoute, sources } from '../capture/sources.mjs';
import { HIDE_DEMO_BANNER, openStill, PHONE, runShots, shoot as shootTo, VG_CSS } from '../capture/still.mjs';

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'captures');
const shoot = (page, name, clip) => shootTo(page, OUT, name, clip);
const HE = sources.hardeletric.url;
const VG = sources.vg.url;
const ADV = sources.advocacia.url;

/** Scrolls so `selector` sits `offset` px from the top, then waits for its reveal. */
async function scrollTo(page, selector, offset = 0, wait = 2500) {
  const top = await page.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + scrollY, selector);
  await page.evaluate((y) => window.scrollTo(0, y), top - offset);
  await page.waitForTimeout(wait);
}

const SHOTS = {
  // ── Hard Eletric ──────────────────────────────────────────────
  /** Home hero on desktop. */
  async 'he-home'(b) {
    const page = await openStill(b, `${HE}/home.dc.html`, { routes: [dsegRoute()] });
    await page.waitForTimeout(2500);
    await shoot(page, 'he-home');
    await page.context().close();
  },
  /** "Sobre": the distribution board with the blue schematic traced over it, switched on. */
  async 'he-quadro'(b) {
    const page = await openStill(b, `${HE}/sobre.dc.html`, { routes: [dsegRoute()] });
    await page.waitForTimeout(1500);
    const y = await page.evaluate(() => {
      const r = document.querySelector('[data-quadro]').getBoundingClientRect();
      return r.top + scrollY - (innerHeight - r.height) / 2;
    });
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(3500);
    await shoot(page, 'he-quadro');
    await page.context().close();
  },
  /** Phone: home hero. */
  async 'he-mobile'(b) {
    const page = await openStill(b, `${HE}/home.dc.html`, { ...PHONE, routes: [dsegRoute()] });
    await page.waitForTimeout(2500);
    await shoot(page, 'he-mobile');
    await page.context().close();
  },

  // ── VG Construção ─────────────────────────────────────────────
  /** Home on desktop: exactly the hero (690 px tall). */
  async 'vg-home'(b) {
    const page = await openStill(b, `${VG}/index.html`, { viewport: { width: 1280, height: 690 }, css: VG_CSS });
    await page.waitForTimeout(2500);
    await shoot(page, 'vg-home');
    await page.context().close();
  },
  /** "Serviços" page, top. */
  async 'vg-servicos'(b) {
    const page = await openStill(b, `${VG}/servicos.html`, { viewport: { width: 1280, height: 800 }, css: VG_CSS });
    await page.waitForTimeout(2500);
    await shoot(page, 'vg-servicos');
    await page.context().close();
  },
  /** "Galeria" page: photos of finished work. */
  async 'vg-galeria'(b) {
    const page = await openStill(b, `${VG}/galeria.html`, { viewport: { width: 1280, height: 800 }, css: VG_CSS });
    await page.waitForTimeout(2500);
    await shoot(page, 'vg-galeria');
    await page.context().close();
  },
  /** Phone: home hero. */
  async 'vg-mobile'(b) {
    const page = await openStill(b, `${VG}/index.html`, { ...PHONE, css: VG_CSS });
    await page.waitForTimeout(2500);
    await shoot(page, 'vg-mobile');
    await page.context().close();
  },

  // ── Lancheria Meia-Noite ──────────────────────────────────────
  /** Home on desktop: sign, hero and the menu grid. */
  async 'lm-home'(b) {
    const page = await openStill(b, `${sources.lancheria.url}/`);
    await page.waitForTimeout(4000);
    await shoot(page, 'lm-home');
    await page.context().close();
  },
  /** Phone: the raio-x of "Prensado Completo", every ingredient separated. */
  async 'lm-raiox'(b) {
    const page = await openStill(b, `${sources.lancheria.url}/`, PHONE);
    await page.waitForTimeout(3500);
    await page.locator('[data-item-cardapio]').first().locator('button').filter({ hasText: /\+|Adicionar/ }).first().click();
    await page.waitForTimeout(900);
    await page.locator('[data-modificar]').first().click();
    await page.waitForTimeout(2000);
    await shoot(page, 'lm-raiox');
    await page.context().close();
  },
  /** "Na prensa" rail on desktop: the centre sandwich pressed, neighbours open in layers. */
  async 'lm-trilho'(b) {
    const css = `.trilho-lanches { scroll-snap-type: none !important; scroll-behavior: auto !important; } [data-barra-pedido] { visibility: hidden !important; }`;
    const page = await openStill(b, `${sources.lancheria.url}/`, { viewport: { width: 1280, height: 720 }, css });
    await page.waitForTimeout(3500);
    await page.evaluate(() => {
      const rail = document.querySelector('.trilho-lanches');
      const section = rail.closest('section') ?? rail.parentElement;
      window.scrollTo(0, section.getBoundingClientRect().top + scrollY);
      const card = rail.querySelectorAll('[data-item-trilho]')[1];
      rail.scrollLeft = card.offsetLeft + card.offsetWidth / 2 - rail.clientWidth / 2;
      rail.dispatchEvent(new Event('scroll'));
    });
    await page.waitForTimeout(1500);
    await shoot(page, 'lm-trilho');
    await page.context().close();
  },

  // ── interativMind ─────────────────────────────────────────────
  /** Entrance painting once the intro has settled (capture-only route, see capture/README.md). */
  async 'im-entrada'(b) {
    const page = await openStill(b, sources.interativmind.entranceUrl, { css: HIDE_DEMO_BANNER });
    await page.waitForTimeout(9000);
    await shoot(page, 'im-entrada');
    await page.context().close();
  },
  /** The knowledge tree of a subject, with its six branches (demo data). */
  async 'im-arvore'(b) {
    const page = await openStill(b, `${sources.interativmind.url}/arvore/git`, { css: HIDE_DEMO_BANNER });
    await page.waitForTimeout(4000);
    await shoot(page, 'im-arvore');
    await page.context().close();
  },
  /** The forest screen: tree, moon and the guide. */
  async 'im-floresta'(b) {
    const page = await openStill(b, `${sources.interativmind.url}/floresta`, { css: HIDE_DEMO_BANNER });
    await page.waitForTimeout(4000);
    await shoot(page, 'im-floresta');
    await page.context().close();
  },

  // ── Advocacia ─────────────────────────────────────────────────
  /** Home hero (OAB number hidden by the sensitive-text rule). */
  async 'adv-home'(b) {
    const page = await openStill(b, `${ADV}/index.html`);
    await page.waitForTimeout(2500);
    await shoot(page, 'adv-home');
    await page.context().close();
  },
  /** Article page: long-form editorial typography. */
  async 'adv-artigo'(b) {
    const page = await openStill(b, `${ADV}/artigo-rescisao.html`);
    await page.waitForTimeout(2500);
    await shoot(page, 'adv-artigo');
    await page.context().close();
  },
  /** Phone: home hero. */
  async 'adv-mobile'(b) {
    const page = await openStill(b, `${ADV}/index.html`, PHONE);
    await page.waitForTimeout(2500);
    await shoot(page, 'adv-mobile');
    await page.context().close();
  },
};

export { scrollTo };
await runShots(SHOTS, process.argv.slice(2));
