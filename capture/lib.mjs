// Frame-by-frame capture helpers.
//
// Every frame is produced in virtual time: Playwright's fake clock drives
// Date, timers, requestAnimationFrame and performance.now, and every CSS
// animation, CSS transition and Web Animation found in the document is
// paused and seeked to the same virtual instant. Nothing depends on how fast
// the machine is, so a 1/30 s step always means 1/30 s of page time.

import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const FRAMES_DIR = path.join(ROOT, 'capture', 'frames');
export const FOOTAGE_DIR = path.join(ROOT, 'footage');
export const FPS = 30;

// Contact data, external links and debug UI never reach a frame.
export const HIDE_CONTACT_CSS = `
  a[href*="wa.me"], a[href*="whatsapp"], a[href^="tel:"], a[href^="mailto:"],
  a[href*="instagram.com"], a[href*="facebook.com"], a[href*="vercel.app"],
  [class*="whatsapp" i], [id*="whatsapp" i],
  [class*="cookie" i], [id*="cookie" i],
  nextjs-portal, [data-nextjs-toast], [data-next-badge-root] {
    visibility: hidden !important;
  }
  html { scroll-behavior: auto !important; }
  ::-webkit-scrollbar { display: none !important; }
  * { scrollbar-width: none !important; caret-color: transparent !important; }
`;

/** Text blocks that point to an outside channel are hidden too (a site paragraph saying "ask on WhatsApp"). */
const CONTACT_WORDS = /whats\s?app|instagram|e-?mail|telefone|ligue|liga pra/i;

export async function hideContactText(page) {
  await page.evaluate((src) => {
    const re = new RegExp(src, 'i');
    const blocks = document.querySelectorAll('p, li, span, small, a, button, h1, h2, h3, h4, h5, h6, label, dd, dt');
    for (const el of blocks) {
      const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(' ');
      if (re.test(own)) el.style.setProperty('visibility', 'hidden', 'important');
    }
  }, CONTACT_WORDS.source);
}

/** Patterns that must never be readable in a captured frame. */
const FORBIDDEN = [
  { name: 'contact-word', re: CONTACT_WORDS },
  { name: 'phone', re: /\(?\b\d{2}\)?\s?9?\d{4}[-\s]?\d{4}\b/ },
  { name: 'email', re: /[\w.+-]+@[\w-]+\.[\w.]+/ },
  { name: 'url', re: /(https?:\/\/|www\.|\.vercel\.app|\.com\b|\.com\.br\b)/i },
];

export async function launch() {
  return chromium.launch({ args: ['--font-render-hinting=none', '--disable-lcd-text'] });
}

/**
 * Opens a page with the fake clock installed before any page script runs.
 * `css` is injected after load on top of HIDE_CONTACT_CSS.
 */
export async function openPage(
  browser,
  { url, viewport, scale = 1, css = '', routes = [], reducedMotion = 'no-preference', frozen = false, isMobile = false, beforeGoto },
) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: scale, reducedMotion, colorScheme: 'dark', isMobile, hasTouch: isMobile });
  const page = await context.newPage();
  page.on('pageerror', (e) => console.warn('  [pageerror]', e.message.slice(0, 160)));
  for (const r of routes) await page.route(r.match, r.handler);
  const t0 = new Date('2026-10-29T21:30:00-03:00');
  await page.clock.install({ time: t0 });
  // Frozen: the page loads with time stopped, so its intro starts on our first step().
  if (frozen) await page.clock.pauseAt(new Date(t0.getTime() + 1000));
  if (beforeGoto) await beforeGoto(page);
  await page.goto(url, { waitUntil: 'load' });
  await page.addStyleTag({ content: HIDE_CONTACT_CSS + css });
  await page.waitForLoadState('networkidle').catch(() => {});
  await hideContactText(page);
  await page.evaluate(() => document.fonts.ready);
  return page;
}

/** A virtual timeline: call `step()` once per output frame. */
export class FrameClock {
  constructor(page) {
    this.page = page;
    this.frame = 0;
    this.ms = 0;
  }
  /** Freeze page time now. Everything after this happens only on step(). */
  async freeze() {
    await this.page.clock.pauseAt(new Date(await this.page.evaluate(() => Date.now() + 250)));
    await this.syncAnimations();
  }
  /** For pages opened with `frozen: true`: time is already stopped. */
  async start() {
    await this.syncAnimations();
  }
  /** Advance page time to the next frame boundary and seek every animation. */
  async step(frames = 1) {
    for (let i = 0; i < frames; i++) {
      this.frame++;
      const target = Math.round((this.frame * 1000) / FPS);
      const delta = target - this.ms;
      this.ms = target;
      await this.page.clock.runFor(delta);
      await this.syncAnimations();
    }
  }
  /** Advance by milliseconds (rounded to whole frames). */
  async wait(ms) {
    await this.step(Math.max(1, Math.round((ms * FPS) / 1000)));
  }
  async syncAnimations() {
    await this.page.evaluate((now) => {
      for (const a of document.getAnimations()) {
        if (a.__vbirth === undefined) a.__vbirth = now;
        try {
          a.pause();
          a.currentTime = now - a.__vbirth;
        } catch {
          /* detached animation */
        }
      }
    }, this.ms);
  }
}

/** Writes numbered PNG frames for one shot. */
export class FrameWriter {
  constructor(name, { clip } = {}) {
    this.name = name;
    this.dir = path.join(FRAMES_DIR, name);
    this.clip = clip;
    this.count = 0;
    this.violations = [];
    fs.rmSync(this.dir, { recursive: true, force: true });
    fs.mkdirSync(this.dir, { recursive: true });
  }
  async shoot(page, { scan = this.count % 6 === 0 } = {}) {
    if (scan) await this.scan(page);
    const file = path.join(this.dir, String(this.count).padStart(5, '0') + '.png');
    await page.screenshot({ path: file, clip: this.clip, animations: 'allow', caret: 'hide' });
    this.count++;
  }
  /** Reads every visible text node inside the viewport (or clip) and checks for contact data. */
  async scan(page) {
    const texts = await page.evaluate((clip) => {
      const out = [];
      const vw = innerWidth;
      const vh = innerHeight;
      const box = clip ?? { x: 0, y: 0, width: vw, height: vh };
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = walker.nextNode())) {
        const t = n.textContent.trim();
        if (!t) continue;
        const el = n.parentElement;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) continue;
        let hidden = false;
        for (let p = el; p; p = p.parentElement) {
          const s = getComputedStyle(p);
          if (s.visibility === 'hidden' || s.display === 'none' || Number(s.opacity) === 0) { hidden = true; break; }
        }
        if (hidden) continue;
        const r = document.createRange();
        r.selectNodeContents(n);
        const b = r.getBoundingClientRect();
        if (b.width === 0 || b.bottom < box.y || b.top > box.y + box.height || b.right < box.x || b.left > box.x + box.width) continue;
        out.push(t);
      }
      return out;
    }, this.clip ?? null);
    for (const t of texts) {
      for (const f of FORBIDDEN) {
        if (f.re.test(t)) this.violations.push({ frame: this.count, kind: f.name, text: t.slice(0, 80) });
      }
    }
  }
  report() {
    if (this.violations.length) {
      const uniq = [...new Map(this.violations.map((v) => [v.kind + v.text, v])).values()];
      console.warn(`  !! ${this.name}: ${uniq.length} forbidden text(s) visible`);
      for (const v of uniq) console.warn(`     frame ${v.frame} ${v.kind}: ${v.text}`);
    } else {
      console.log(`  ok ${this.name}: ${this.count} frames, no contact data visible`);
    }
    return this.violations.length === 0;
  }
}

/** PNG sequence → H.264 intermediate clip (CRF 15, 30 fps). */
export function encode(name, { crf = 15, scale } = {}) {
  fs.mkdirSync(FOOTAGE_DIR, { recursive: true });
  const out = path.join(FOOTAGE_DIR, `${name}.mp4`);
  const vf = ['pad=ceil(iw/2)*2:ceil(ih/2)*2', 'format=yuv420p'];
  if (scale) vf.unshift(`scale=${scale}:flags=lanczos`);
  const [cmd, pre] = ffmpegCommand();
  execFileSync(
    cmd,
    [...pre, '-y', '-v', 'error', '-framerate', String(FPS), '-i', path.join(FRAMES_DIR, name, '%05d.png'),
      '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-tune', 'film',
      '-vf', vf.join(','), '-movflags', '+faststart', out],
    { stdio: 'inherit' },
  );
  const mb = fs.statSync(out).size / 1e6;
  console.log(`  -> footage/${name}.mp4 (${mb.toFixed(2)} MB)`);
  return out;
}

export function ffmpegCommand() {
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
    return ['ffmpeg', []];
  } catch {
    // No system FFmpeg: use the one bundled with Remotion.
    return ['npx', ['remotion', 'ffmpeg']];
  }
}

/** Smooth 0→1 easing used for scripted scrolls. */
export const ease = {
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  out: (t) => 1 - Math.pow(1 - t, 3),
  inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
};

/** Maps a frame index inside [f0, f1] to an eased 0..1 value. */
export function progress(frame, f0, f1, fn = ease.inOut) {
  if (frame <= f0) return 0;
  if (frame >= f1) return 1;
  return fn((frame - f0) / (f1 - f0));
}
