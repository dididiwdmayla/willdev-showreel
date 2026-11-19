// Ingarandi Burger — the real ordering flow, in an isolated sandbox.
//
// The site runs from a disposable copy of lancheriademonstracao whose only
// changes are environmental: Firestore points to the local emulator (project
// "demo-ingarandi"), the server talks to Mercado Pago with a TEST seller
// account (token injected by the network proxy, never in this repository) and
// the payer e-mail is a Mercado Pago test buyer. No production data, no real
// money. See capture/README.md.
//
// Two passes:
//  1. `ingarandi-pedido` (virtual time): menu → customise sheet → bag toast →
//     cart → checkout → "Pagar online / Cartão de crédito / Ir para pagamento".
//  2. `ingarandi-compra` (real time, as a customer would): a whole test
//     purchase on Mercado Pago Checkout Pro with the test card, then the order
//     page before and after the payment notification. The notification is
//     delivered to the local webhook, which reads the payment back from the
//     Mercado Pago API: the order only turns "Pago!" because Mercado Pago says
//     the payment is approved.
import fs from 'node:fs';
import path from 'node:path';
import { openPage, FrameClock, FrameWriter, encode, hideContactText, ROOT } from '../lib.mjs';
import { sources } from '../sources.mjs';
import { saveMeta } from './chapa.mjs';

const { origin: ORIGIN, local: LOCAL } = sources.ingarandi;
const STILLS = path.join(ROOT, 'footage', 'stills');

/** The .test origin is the local server; Firestore stays on the emulator. Production Firebase is unreachable by construction. */
const ROUTES = [
  {
    match: `${ORIGIN}/**`,
    handler: async (route) => {
      const url = route.request().url().replace(ORIGIN, LOCAL);
      try {
        const res = await route.fetch({ url, maxRedirects: 0 });
        await route.fulfill({ response: res });
      } catch {
        await route.abort();
      }
    },
  },
  { match: /firestore\.googleapis\.com|firebaseinstallations\.googleapis\.com|identitytoolkit\.googleapis\.com/, handler: (r) => r.abort() },
];

const CSS = `
  /* Upsell toast stays: it is part of the real flow. Dev/analytics chrome never shows. */
  [aria-label="Open Next.js Dev Tools"] { display: none !important; }
`;

const PHONE = { viewport: { width: 390, height: 844 }, scale: 3, isMobile: true, timezoneId: 'America/Sao_Paulo', locale: 'pt-BR' };

const rect = (page, js) => page.evaluate(js);
const center = (r) => ({ x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) });

/** Finds the first visible button whose text matches, returns its viewport box. */
const buttonBox = (page, re, pick = 'last') =>
  rect(page, `(() => {
    const re = new RegExp(${JSON.stringify(re.source)}, ${JSON.stringify(re.flags)});
    const inView = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth; };
    const all = [...document.querySelectorAll('button, a')].filter((e) => e.offsetParent !== null && inView(e) && re.test((e.innerText || e.getAttribute('aria-label') || '').trim()));
    const el = ${JSON.stringify(pick)} === 'first' ? all[0] : all.pop();
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, width: r.width, height: r.height };
  })()`);

/** Clicks the element under a point (React handlers run; no actionability wait while rAF is frozen). */
const clickAt = (page, { x, y }) =>
  page.evaluate(([px, py]) => {
    const el = document.elementFromPoint(px, py);
    (el.closest('button, a') ?? el).click();
  }, [x, y]);

/** React-friendly value set (native setter + input event), no actionability wait. */
const typeInto = (page, placeholder, value) =>
  page.evaluate(([ph, v]) => {
    const el = [...document.querySelectorAll('input, textarea')].find((e) => (e.placeholder || '').startsWith(ph));
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, [placeholder, value]);

export async function ingarandiPedido(browser) {
  const name = 'ingarandi-pedido';
  const page = await openPage(browser, { url: `${ORIGIN}/`, ...PHONE, routes: ROUTES, css: CSS, idle: false });
  await page.waitForTimeout(3500);
  // Park on the first burger card, ESCOLHER in reach.
  const cardTop = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((e) => e.innerText.trim() === 'ESCOLHER');
    const card = b.closest('div[class*="rounded"]') ?? b.parentElement;
    return card.getBoundingClientRect().top + scrollY;
  });
  await page.evaluate((y) => window.scrollTo(0, y), cardTop - 150);
  await page.waitForTimeout(1200);

  const clock = new FrameClock(page);
  await clock.freeze();
  await clock.step(2);
  const w = new FrameWriter(name);
  const taps = [];
  const shoot = async (n) => {
    for (let i = 0; i < n; i++) {
      await clock.step();
      await w.shoot(page);
    }
  };
  const tap = async (re, pick) => {
    const box = await buttonBox(page, re, pick);
    if (!box) throw new Error(`no button ${re}`);
    const c = center(box);
    taps.push({ frame: w.count, ...c, label: re.source });
    await clickAt(page, c);
  };

  await shoot(12);
  await tap(/^ESCOLHER$/, 'first'); // customise sheet rises
  await shoot(30);
  await tap(/^ADICIONAR/); // into the bag: "Na sacola!" + upsell
  await shoot(26);
  await tap(/^1$|Abrir carrinho/); // cart drawer
  await shoot(22);
  await tap(/^FINALIZAR/); // checkout modal
  await shoot(14);
  const cutAt = w.count;
  // Customer data is typed off camera (no phone or address ever on screen).
  await typeInto(page, 'Seu nome', 'Cliente Teste');
  await typeInto(page, '(44)', '44900000000');
  await typeInto(page, 'Rua, Número', 'Endereço de teste');
  await clock.step(2);
  const cont = center(await buttonBox(page, /^CONTINUAR$/));
  await clickAt(page, cont);
  await clock.step(10);
  await shoot(8);
  await tap(/^PAGAR ONLINE$/);
  await shoot(12);
  await tap(/CARTÃO DE CRÉDITO/);
  await shoot(14);
  await tap(/IR PARA PAGAMENTO/);
  await shoot(8);
  w.report();
  saveMeta({ name, device: 'm', total: w.count, scale: 3, taps, cutAt });
  encode(name, { crf: 14 });
  await page.context().close();
}

/** One real test purchase; stills of Checkout Pro and two takes of the order page. */
export async function ingarandiCompra(browser) {
  fs.mkdirSync(STILLS, { recursive: true });
  const ctx = await browser.newContext({ viewport: PHONE.viewport, deviceScaleFactor: 3, isMobile: true, hasTouch: true, colorScheme: 'dark', timezoneId: PHONE.timezoneId, locale: PHONE.locale, userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36' });
  for (const r of ROUTES) await ctx.route(r.match, r.handler);
  const page = await ctx.newPage();
  await page.goto(`${ORIGIN}/`, { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  await page.getByRole('button', { name: 'ESCOLHER' }).first().click();
  await page.waitForTimeout(1200);
  await page.locator('button', { hasText: /ADICIONAR/ }).last().click();
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: 'Abrir carrinho' }).click().catch(() => page.getByRole('button', { name: '1' }).click());
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: 'FINALIZAR' }).click();
  await page.waitForTimeout(1200);
  await page.getByPlaceholder('Seu nome').fill('Cliente Teste');
  await page.getByPlaceholder('(44) 99999-9999').fill('44900000000');
  await page.getByPlaceholder(/Rua, Número/).fill('Endereço de teste');
  await page.getByRole('button', { name: 'CONTINUAR' }).last().click();
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'PAGAR ONLINE' }).click();
  await page.getByRole('button', { name: /Cartão de Crédito/i }).click();
  await page.waitForTimeout(500);
  const nav = page.waitForURL(/mercadopago\.com\.br/, { timeout: 60000 });
  await page.getByRole('button', { name: /IR PARA PAGAMENTO/ }).click();
  await nav;
  await page.waitForTimeout(7000);
  // Checkout Pro: guest card payment with Mercado Pago's documented test card.
  await page.getByText('Crédito ou pré-pago').click();
  await page.waitForTimeout(6000);
  const field = async (ph) => {
    for (const f of page.frames()) {
      if (!f.url().includes('secure-fields')) continue;
      const el = await f.$(`input[placeholder="${ph}"]`);
      if (el) return el;
    }
    throw new Error(`no field ${ph}`);
  };
  await (await field('0000 0000 0000 0000')).type('4235647728025682', { delay: 30 });
  await (await field('MM/AA')).type('1130', { delay: 30 });
  await (await field('000')).type('123', { delay: 30 });
  await page.fill('#cardholderName', 'APRO');
  await page.fill('#cardholderIdentificationNumber', '12345678909');
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.waitForURL(/\/review\//, { timeout: 60000 });
  await page.waitForTimeout(2500);
  // The test buyer's (masked) e-mail row is hidden; nothing else on Mercado Pago's page is touched.
  await page.evaluate(() => {
    // The largest block that holds the e-mail but not the card row: the whole e-mail row.
    const rows = [...document.querySelectorAll('li, div')].filter((el) => /@/.test(el.textContent || '') && !/Visa|5682/.test(el.textContent || ''));
    rows.sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height);
    if (rows[0]) rows[0].style.display = 'none';
  });
  await hideContactText(page);
  const order = (await page.textContent('body')).match(/Pedido\s+#+(\w{4})/)?.[1];
  await page.screenshot({ path: path.join(STILLS, 'mp-review.png') });
  const pay = await page.getByRole('button', { name: /^Pagar/ }).boundingBox();
  await page.getByRole('button', { name: /^Pagar/ }).click();
  await page.waitForURL(new RegExp(`${ORIGIN.replace(/\./g, '\\.')}/pedido/`), { timeout: 90000 });
  const ret = new URL(page.url());
  const docId = ret.pathname.split('/').pop();
  const paymentId = ret.searchParams.get('payment_id');
  const returned = ret.searchParams.get('status');
  await ctx.close();
  console.log(`  order #${order} returned from Checkout Pro with status=${returned}`);

  // The order page, as the customer sees it while Mercado Pago's notification is on its way…
  await orderTake(browser, docId, 'ingarandi-aguardando', 40);
  // …the notification reaches the webhook, which asks Mercado Pago for the payment…
  const res = await fetch(`${LOCAL}/api/webhook/mp?type=payment&data.id=${paymentId}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'payment', data: { id: paymentId } }),
  });
  console.log(`  webhook → ${res.status}`);
  await new Promise((r) => setTimeout(r, 2500));
  // …and the order is paid.
  await orderTake(browser, docId, 'ingarandi-pago', 70);
  saveMeta({ name: 'ingarandi-compra', order, returned, pay: pay && center(pay), at: new Date().toISOString() });
}

async function orderTake(browser, docId, name, frames) {
  const page = await openPage(browser, { url: `${ORIGIN}/pedido/${docId}`, ...PHONE, routes: ROUTES, css: CSS, idle: false });
  await page.waitForTimeout(4000);
  const clock = new FrameClock(page);
  await clock.freeze();
  const w = new FrameWriter(name);
  for (let f = 0; f < frames; f++) {
    await clock.step();
    await w.shoot(page);
  }
  w.report();
  encode(name, { crf: 14 });
  await page.context().close();
}

export const ingarandiShots = {
  'ingarandi-pedido': ingarandiPedido,
  'ingarandi-compra': ingarandiCompra,
};

