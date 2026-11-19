// InterativMind — Next.js app in demo mode (no Firebase variables), production build.
import { openPage, FrameClock, FrameWriter, encode } from '../lib.mjs';
import { sources } from '../sources.mjs';

const HIDE_DEMO_BANNER = `aside.border-b { display: none !important; }`;

/**
 * The entrance: ink opens the scroll painting, the guide hops along the branch,
 * the name writes itself in gold. Real component, real assets; the page loads
 * with time frozen, so the first step() is the first instant of the intro.
 */
export async function imEntrada(browser) {
  const page = await openPage(browser, {
    url: sources.interativmind.entranceUrl,
    viewport: { width: 1600, height: 900 },
    scale: 1.6,
    frozen: true,
    css: HIDE_DEMO_BANNER,
  });
  const clock = new FrameClock(page);
  await clock.start();
  const w = new FrameWriter('im-entrada');
  for (let f = 0; f < 240; f++) {
    await w.shoot(page);
    await clock.step();
  }
  w.report();
  encode('im-entrada');
  await page.context().close();
}

/** The model tree grows from the ground, then two young branches mature into blossom. */
export async function imArvore(browser) {
  const page = await openPage(browser, {
    url: `${sources.interativmind.url}/atelier`,
    viewport: { width: 1280, height: 900 },
    scale: 2,
    css: HIDE_DEMO_BANNER + ` header, nav { visibility: hidden !important; }`,
  });
  await page.waitForTimeout(2500);
  const box = await page.evaluate(() => {
    const section = document.querySelector('#arvore');
    const tree = section.querySelector('.max-w-\\[34rem\\]');
    tree.scrollIntoView({ block: 'center' });
    const r = tree.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });
  await page.waitForTimeout(1500);
  const pad = 24;
  const clip = {
    x: Math.max(0, Math.round(box.x - pad)),
    y: Math.max(0, Math.round(box.y - pad)),
    width: Math.round(box.width + pad * 2),
    height: Math.round(box.height + pad * 2),
  };
  console.log('  tree clip', clip);
  const clock = new FrameClock(page);
  await clock.freeze();
  const clickText = (text, nth) =>
    page.evaluate(([t, i]) => {
      const buttons = [...document.querySelectorAll('#arvore button')].filter((b) => b.textContent.trim() === t);
      buttons[i].click();
    }, [text, nth]);
  const w = new FrameWriter('im-arvore', { clip });
  await clickText('Crescer de novo', 0);
  for (let f = 0; f < 270; f++) {
    if (f === 150) await clickText('Maduro', 4); // Controle de constitucionalidade
    if (f === 168) await clickText('Maduro', 5); // Ordem social
    await clock.step();
    await w.shoot(page);
  }
  w.report();
  encode('im-arvore');
  await page.context().close();
}
