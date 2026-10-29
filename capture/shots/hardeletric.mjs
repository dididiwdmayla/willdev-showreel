// Hard Eletric — static site, served from the repository root.
import { openPage, FrameClock, FrameWriter, encode, progress, ease } from '../lib.mjs';
import { sources, dsegRoute } from '../sources.mjs';

const BASE = sources.hardeletric.url;
const VIEW = { viewport: { width: 1280, height: 720 }, scale: 1.5, routes: [dsegRoute()] };
// The fixed header carries the WhatsApp button; the nav links stay.
const CSS = `header a[href*="wa.me"] { visibility: hidden !important; }`;

/** "Sobre": the schematic is traced over the distribution-board photo, the blade closes, the photo relights. */
export async function heQuadro(browser) {
  const page = await openPage(browser, { ...VIEW, url: `${BASE}/sobre.dc.html`, css: CSS });
  const clock = new FrameClock(page);
  await clock.freeze();
  const target = await page.evaluate(() => {
    const q = document.querySelector('[data-quadro]');
    const r = q.getBoundingClientRect();
    return r.top + scrollY - (innerHeight - r.height) / 2;
  });
  // Jump straight to the board: it switches on as soon as it sits in the band,
  // so the clip starts on the first stroke of the schematic.
  await page.evaluate((v) => window.scrollTo(0, v), target);
  const w = new FrameWriter('he-quadro');
  const TOTAL = 150;
  for (let f = 0; f < TOTAL; f++) {
    await clock.step();
    await w.shoot(page);
  }
  w.report();
  encode('he-quadro');
  await page.context().close();
}

/** "Serviços": the conduit on the left lights up circuit by circuit while the page scrolls. */
export async function heCircuitos(browser) {
  const page = await openPage(browser, { ...VIEW, url: `${BASE}/servicos.dc.html`, css: CSS });
  const clock = new FrameClock(page);
  await clock.freeze();
  const tops = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-circuito]')).map((el) => el.getBoundingClientRect().top + scrollY),
  );
  const from = tops[0] - 520;
  const to = tops[2] + 60;
  const w = new FrameWriter('he-circuitos');
  const TOTAL = 150;
  for (let f = 0; f < TOTAL; f++) {
    const y = from + (to - from) * progress(f, 6, TOTAL - 20, ease.inOutSine);
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await clock.step();
    await w.shoot(page);
  }
  w.report();
  encode('he-circuitos');
  await page.context().close();
}

/** Home: the multimeter powers on — LCD flicker, count-up, needle swing. */
export async function heMultimetro(browser) {
  const page = await openPage(browser, { ...VIEW, url: `${BASE}/home.dc.html`, css: CSS });
  const clock = new FrameClock(page);
  await clock.freeze();
  const top = await page.evaluate(() => document.querySelector('#em-campo').getBoundingClientRect().top + scrollY);
  // Section in place before the first frame: the meter powers on from frame 0.
  await page.evaluate((v) => window.scrollTo(0, v), top - 100);
  const w = new FrameWriter('he-multimetro');
  const TOTAL = 105;
  for (let f = 0; f < TOTAL; f++) {
    await clock.step();
    await w.shoot(page);
  }
  w.report();
  encode('he-multimetro');
  await page.context().close();
}
