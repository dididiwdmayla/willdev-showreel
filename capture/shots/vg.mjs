// VG Construção — static site. The same page on desktop and on a phone, scrolled in step.
import { openPage, FrameClock, FrameWriter, encode, progress, ease } from '../lib.mjs';
import { sources } from '../sources.mjs';

const URL = `${sources.vg.url}/index.html`;
const FRAMES = 165;

/** Scroll stops: hero, then the services grid. Same rhythm on both devices. */
async function scrollPlan(page) {
  return page.evaluate(() => {
    const pick = (sel) => {
      const el = document.querySelector(sel);
      return el ? el.getBoundingClientRect().top + scrollY : null;
    };
    const servicos = pick('#servicos') ?? pick('[id*="servic"]') ?? 1400;
    return { servicos };
  });
}

// Each service card is a link that opens WhatsApp, but the card itself only shows
// the service; keep it and hide just the generic WhatsApp buttons.
const CSS = `a.service-card { visibility: visible !important; }`;

async function run(browser, name, opts, offset) {
  const page = await openPage(browser, { url: URL, css: CSS, ...opts });
  await page.waitForTimeout(1500);
  const plan = await scrollPlan(page);
  const target = plan.servicos - offset;
  const clock = new FrameClock(page);
  await clock.freeze();
  const w = new FrameWriter(name);
  for (let f = 0; f < FRAMES; f++) {
    const y = target * progress(f, 24, FRAMES - 18, ease.inOutSine);
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await clock.step();
    await w.shoot(page);
  }
  w.report();
  encode(name);
  await page.context().close();
}

export const vgDesktop = (browser) =>
  run(browser, 'vg-desktop', { viewport: { width: 1280, height: 720 }, scale: 1.5 }, 40);

export const vgMobile = (browser) =>
  run(browser, 'vg-mobile', { viewport: { width: 390, height: 844 }, scale: 2, isMobile: true }, 20);
