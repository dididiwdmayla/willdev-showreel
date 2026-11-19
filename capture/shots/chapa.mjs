// Chapa Burger — the four real variants of the `lancheria-chapa-burger` skin
// (Radar / Forja de Demos), each one scrolled from its opening to its menu and
// then played with: the lens follows the pointer over a burger photo and
// reveals the empty plate underneath, then jumps to the next burger.
//
// Desktop: mouse (pointerenter/move/leave, as on a real cursor).
// Mobile: touch taps (the real touch path: the lens opens for 800 ms).
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { openPage, FrameClock, FrameWriter, encode, progress, ease, FOOTAGE_DIR } from '../lib.mjs';
import { sources } from '../sources.mjs';

export const CHAPA_VARIANTS = ['chapa', 'balcao', 'sala', 'praca'];

const { url: BASE, password } = sources.chapa;

/** Same signature as src/lib/auth.ts#criarSessaoToken in the Radar app. */
function sessionToken() {
  const payload = 'qa.admin.1';
  const sig = crypto.createHmac('sha256', `radar-session:${password}`).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

/** Math.random seeded per variant: the lens phrase is random on the site; this makes each take repeatable. */
const SEEDED_RANDOM = (seed) => `(() => {
  let a = ${seed} >>> 0;
  Math.random = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
})();`;

// The order buttons are wa.me links on this demo (its neutral CTA). Their
// label is "ESCOLHER", no number is ever printed, so they stay visible.
const CSS = `
  a[href*="wa.me"] { visibility: visible !important; }
  [data-d-secao="contato"] a[href*="wa.me"] { visibility: hidden !important; }
`;

const SEEDS = { chapa: 7, balcao: 11, sala: 5, praca: 3 };

async function open(browser, variant, device) {
  const mobile = device === 'm';
  return openPage(browser, {
    url: `${BASE}/interno/demo-qa?skin=lancheria-chapa-burger&preset=${variant}&intro=0`,
    viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 800 },
    scale: mobile ? 3 : 2,
    isMobile: mobile,
    css: CSS,
    beforeGoto: async (page) => {
      await page.context().addCookies([{ name: 'radar_session', value: sessionToken(), url: BASE }]);
      await page.addInitScript(SEEDED_RANDOM(SEEDS[variant]));
    },
  });
}

/** Geometry measured once with the page parked on the menu. */
async function measure(page) {
  return page.evaluate(() => {
    const menu = document.querySelector('[data-d-secao="cardapio"]');
    const top = menu.getBoundingClientRect().top + scrollY;
    const fotos = [...document.querySelectorAll('[data-d-secao="cardapio"] .ch-prato-foto')].map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + scrollY + r.height / 2, w: r.width, h: r.height };
    });
    return { top, fotos, vh: innerHeight };
  });
}

/** Piecewise eased keyframes → value at frame f. */
function track(keys, f, fn = ease.inOut) {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, v0] = keys[i];
    const [f1, v1] = keys[i + 1];
    if (f <= f1) return v0 + (v1 - v0) * progress(f, f0, f1, fn);
  }
  return keys.at(-1)[1];
}

export async function chapaVariant(browser, variant, device) {
  const name = `chapa-${variant}-${device}`;
  const mobile = device === 'm';
  const page = await open(browser, variant, device);
  await page.waitForTimeout(1200);

  // Reveal every section once (whileInView, once: true), then park on the menu to measure.
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  const geo0 = await measure(page);
  const headerOffset = mobile ? 118 : 104;
  const menuY = Math.max(0, geo0.top - headerOffset);
  await page.evaluate((y) => window.scrollTo(0, y), menuY);
  await page.waitForTimeout(900);
  const geo = await measure(page);
  // Back to the opening; the menu cards stay revealed only once they enter again in the take.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);

  const scrollTo = (y) => page.evaluate((v) => { window.scrollTo(0, v); window.dispatchEvent(new Event('scroll')); }, y);
  const clock = new FrameClock(page);
  await clock.freeze();
  // The lens draws a random phrase (never the card's previous one). Fix the
  // two draws of this take: "PEDE LOGO, É UMA DELÍCIA!" then the third phrase.
  await page.evaluate(() => {
    const queue = [0.5, 0.9];
    const rest = Math.random;
    Math.random = () => (queue.length ? queue.shift() : rest());
  });
  await clock.step(2);

  const total = mobile ? 132 : 150;
  const scrollKeys = [[0, 0], [14, 0], [50, menuY], [total, menuY]];
  const visible = geo.fotos.filter((f) => f.y - menuY > 40 && f.y - menuY < geo.vh - 40);
  const a = mobile ? geo.fotos[0] : visible[0] ?? geo.fotos[0];
  const b = mobile ? geo.fotos[1] : visible[1] ?? geo.fotos[1] ?? a;
  const toView = (p) => ({ x: p.x, y: p.y - menuY });

  let pointer = null;
  const w = new FrameWriter(name);
  const A = toView(a);
  const B = toView(b);
  if (!mobile) {
    // Cursor path (viewport coordinates): parked aside, into burger A, a small
    // circle inside it, across to burger B, a drift inside B.
    const start = { x: A.x - a.w * 1.1, y: A.y + a.h * 0.9 };
    const path = (f) => {
      const k = (keys) => track(keys, f, ease.inOut);
      return {
        x: k([[0, start.x], [58, start.x], [72, A.x - a.w * 0.12], [86, A.x + a.w * 0.14], [100, A.x + a.w * 0.02], [114, A.x - a.w * 0.08], [126, B.x - b.w * 0.1], [140, B.x + b.w * 0.12], [total, B.x + b.w * 0.05]]),
        y: k([[0, start.y], [58, start.y], [72, A.y + a.h * 0.05], [86, A.y - a.h * 0.12], [100, A.y + a.h * 0.1], [114, A.y - a.h * 0.02], [126, B.y + b.h * 0.08], [140, B.y - b.h * 0.1], [total, B.y]]),
      };
    };
    let last = null;
    pointer = [];
    for (let f = 0; f < total; f++) {
      await scrollTo(track(scrollKeys, f));
      const p = path(f);
      if (f >= 56) {
        if (!last) await page.mouse.move(p.x, p.y);
        else await page.mouse.move(p.x, p.y, { steps: 2 });
        last = p;
      }
      pointer.push(f >= 56 ? [Math.round(p.x), Math.round(p.y)] : null);
      await clock.step();
      await w.shoot(page);
    }
  } else {
    // Each burger is centred before its tap; the page scrolls from one to the next.
    const yA = Math.max(0, a.y - geo.vh * 0.46);
    const yB = Math.max(0, b.y - geo.vh * 0.46);
    scrollKeys.splice(0, scrollKeys.length, [0, 0], [14, 0], [50, yA], [82, yA], [92, yB], [total, yB]);
    const At = { x: a.x, y: a.y - yA };
    const Bt = { x: b.x, y: b.y - yB };
    const taps = [[58, At], [97, Bt]];
    pointer = taps.map(([f, p]) => ({ frame: f, x: Math.round(p.x), y: Math.round(p.y) }));
    for (let f = 0; f < total; f++) {
      await scrollTo(track(scrollKeys, f));
      for (const [tf, p] of taps) if (f === tf) await page.touchscreen.tap(p.x, p.y);
      await clock.step();
      await w.shoot(page);
    }
  }
  w.report();
  // Cursor positions are part of the take: Remotion draws the pointer/tap on top.
  const meta = { name, device, variant, total, menuY, A, B, scale: mobile ? 3 : 2, pointer };
  saveMeta(meta);
  encode(name, { crf: 14 });
  await page.context().close();
  return meta;
}

/** Cursor and tap positions per take, read by the Remotion scenes (footage/capture-meta.json). */
export function saveMeta(meta) {
  const file = path.join(FOOTAGE_DIR, 'capture-meta.json');
  const all = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  all[meta.name] = meta;
  fs.mkdirSync(FOOTAGE_DIR, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(all, null, 2) + '\n');
}

export const chapaShots = Object.fromEntries(
  CHAPA_VARIANTS.flatMap((v) => ['d', 'm'].map((d) => [`chapa-${v}-${d}`, (browser) => chapaVariant(browser, v, d)])),
);
