// Lancheria Meia-Noite — Next.js app (lancheria-meia-noite-repo), production build.
import { openPage, FrameClock, FrameWriter, encode, progress, ease } from '../lib.mjs';
import { sources } from '../sources.mjs';

const BASE = sources.lancheria.url;

/** Clicks through React handlers without Playwright's actionability wait (rAF is frozen). */
const tap = (page, selector, nth = 0) =>
  page.evaluate(([s, i]) => {
    const el = document.querySelectorAll(s)[i];
    if (!el) throw new Error(`missing ${s}`);
    el.click();
  }, [selector, nth]);

/**
 * "Na prensa": the centred sandwich is pressed shut; as the rail slides, the
 * one leaving the centre opens into its layers and the next one closes.
 */
export async function lancheriaTrilho(browser) {
  const page = await openPage(browser, {
    url: `${BASE}/`,
    viewport: { width: 960, height: 540 },
    scale: 2,
    css: `
      .trilho-lanches { scroll-snap-type: none !important; scroll-behavior: auto !important; }
      [data-barra-pedido] { visibility: hidden !important; }
    `,
  });
  await page.waitForTimeout(3500); // letreiro intro, real time
  const geo = await page.evaluate(() => {
    const rail = document.querySelector('.trilho-lanches');
    const section = rail.closest('section') ?? rail.parentElement;
    const cards = [...rail.querySelectorAll('[data-item-trilho]')];
    const centre = (c) => c.offsetLeft + c.offsetWidth / 2 - rail.clientWidth / 2;
    return { top: section.getBoundingClientRect().top + scrollY, stops: cards.map(centre) };
  });
  await page.evaluate((y) => window.scrollTo(0, y), geo.top + 4);
  const setRail = (x) =>
    page.evaluate((v) => {
      const rail = document.querySelector('.trilho-lanches');
      rail.scrollLeft = v;
      rail.dispatchEvent(new Event('scroll'));
    }, x);
  await setRail(geo.stops[0]);
  await page.waitForTimeout(800);
  const clock = new FrameClock(page);
  await clock.freeze();
  await clock.step(6);

  // Completo centred (pressed) → Frango centred: Completo opens on the way out.
  const keys = [
    [0, geo.stops[0]],
    [14, geo.stops[0]],
    [62, geo.stops[1]],
    [80, geo.stops[1]],
    [128, geo.stops[2]],
    [150, geo.stops[2]],
  ];
  const at = (f) => {
    for (let i = 0; i < keys.length - 1; i++) {
      const [f0, x0] = keys[i];
      const [f1, x1] = keys[i + 1];
      if (f <= f1) return x0 + (x1 - x0) * progress(f, f0, f1, ease.inOut);
    }
    return keys.at(-1)[1];
  };
  const w = new FrameWriter('lancheria-trilho');
  for (let f = 0; f < 150; f++) {
    await setRail(at(f));
    await clock.step();
    await w.shoot(page);
  }
  w.report();
  encode('lancheria-trilho');
  await page.context().close();
}

/** Mobile raio-x: the exploded stack, "Prensar" on the griddle, then the jump to the order bar. */
export async function lancheriaRaioX(browser) {
  const page = await openPage(browser, {
    url: `${BASE}/`,
    viewport: { width: 390, height: 844 },
    scale: 2,
    isMobile: true,
  });
  await page.waitForTimeout(3500);
  // Add "Prensado Completo" from the menu, as a customer would.
  await page.locator('[data-item-cardapio]').first().locator('button').filter({ hasText: /\+|Adicionar/ }).first().click();
  await page.waitForTimeout(1200);
  const clock = new FrameClock(page);
  await clock.freeze();
  const w = new FrameWriter('lancheria-raiox');
  const shoot = async (n) => {
    for (let i = 0; i < n; i++) {
      await clock.step();
      await w.shoot(page);
    }
  };
  await shoot(6);
  await tap(page, '[data-modificar]'); // takeover grows from the tapped card
  await shoot(54);
  await tap(page, '#rx-selar'); // press, griddle marks, jump
  await shoot(60);
  w.report();
  encode('lancheria-raiox');
  await page.context().close();
}
