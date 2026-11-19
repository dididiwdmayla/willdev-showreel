"""Sound effects for the restaurant commercial, synthesised from scratch.

    python3 scripts/sfx.py

Writes 48 kHz mono WAV files to assets/sfx/. No samples from anywhere else:
every sound is built here from sines, noise and envelopes, so the set can be
regenerated (and tweaked) like the rest of the video.
"""

import os
import wave

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "sfx")
SR = 48000
rng = np.random.default_rng(7)


def t(seconds):
    return np.arange(int(SR * seconds)) / SR


def env(n, attack, decay_tau):
    x = np.arange(n) / SR
    a = np.clip(x / max(attack, 1e-4), 0, 1)
    return a * np.exp(-np.maximum(x - attack, 0) / decay_tau)


def lowpass(x, cutoff):
    """One-pole low-pass; cutoff may be an array (sweeps)."""
    cutoff = np.broadcast_to(cutoff, x.shape)
    y = np.zeros_like(x)
    acc = 0.0
    k = 1 - np.exp(-2 * np.pi * cutoff / SR)
    for i in range(len(x)):
        acc += k[i] * (x[i] - acc)
        y[i] = acc
    return y


def highpass(x, cutoff):
    return x - lowpass(x, cutoff)


def save(name, x, peak=0.89):
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    fade = min(len(x), int(SR * 0.004))
    x[-fade:] *= np.linspace(1, 0, fade)
    data = (x * 32767).astype(np.int16)
    os.makedirs(OUT, exist_ok=True)
    with wave.open(os.path.join(OUT, f"{name}.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())
    print(f"  assets/sfx/{name}.wav  {len(x) / SR:.2f} s")


def whoosh(duration=0.5, lo=300, hi=5000, rise=0.6):
    """Filtered noise whose cutoff and level swell then fall: a camera move."""
    n = int(SR * duration)
    x = np.linspace(0, 1, n)
    shape = np.where(x < rise, (x / rise) ** 2, ((1 - x) / (1 - rise)) ** 1.5)
    cutoff = lo + (hi - lo) * shape
    noise = rng.standard_normal(n)
    y = lowpass(highpass(noise, 120), cutoff) * shape
    return y


def tap():
    """Soft UI tap: a short damped click with a little body."""
    x = t(0.09)
    body = np.sin(2 * np.pi * 1800 * x) * env(len(x), 0.0006, 0.012)
    thump = np.sin(2 * np.pi * 220 * x) * env(len(x), 0.001, 0.03) * 0.6
    click = highpass(rng.standard_normal(len(x)), 3000) * env(len(x), 0.0002, 0.004) * 0.5
    return body + thump + click


def lens():
    """The lens opening: a rounded rising 'bloop' with a glassy top."""
    x = t(0.32)
    f = 260 + 520 * (1 - np.exp(-x / 0.05))
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sin(ph) * env(len(x), 0.004, 0.09)
    glass = np.sin(2 * ph * 2.01) * env(len(x), 0.002, 0.05) * 0.25
    return tone + glass


def swipe():
    return whoosh(0.34, 600, 9000, 0.35) * 0.9


def impact():
    """Low punch for the opening and the logo: sine drop + noise transient."""
    x = t(0.7)
    f = 40 + 110 * np.exp(-x / 0.05)
    ph = 2 * np.pi * np.cumsum(f) / SR
    sub = np.sin(ph) * env(len(x), 0.002, 0.22)
    crack = lowpass(rng.standard_normal(len(x)), 2500) * env(len(x), 0.0005, 0.02) * 0.6
    return sub + crack


def confirm():
    """Payment confirmed: two bright bell tones, a fourth apart."""
    x = t(0.9)
    out = np.zeros(len(x))
    for start, freq in ((0.0, 1318.5), (0.09, 1760.0)):
        s = int(start * SR)
        xx = x[: len(x) - s]
        bell = sum(a * np.sin(2 * np.pi * freq * r * xx) for r, a in ((1, 1), (2.0, 0.35), (3.01, 0.12)))
        out[s:] += bell * env(len(xx), 0.002, 0.22)
    return out


def coin():
    """The WillDev coin: metallic inharmonic partials, a ring that shimmers."""
    x = t(1.6)
    base = 2093.0
    partials = ((1.0, 1.0, 0.35), (2.756, 0.6, 0.22), (5.404, 0.35, 0.12), (8.933, 0.2, 0.07), (1.503, 0.25, 0.5))
    out = sum(a * np.sin(2 * np.pi * base * r * x + 0.3 * np.sin(2 * np.pi * 6 * x)) * env(len(x), 0.001, tau) for r, a, tau in partials)
    tick = highpass(rng.standard_normal(len(x)), 5000) * env(len(x), 0.0002, 0.003) * 0.8
    return out + tick


def spin():
    """The coin flipping in the air: a fast tremolo shimmer."""
    x = t(0.55)
    trem = 0.5 + 0.5 * np.sin(2 * np.pi * (14 + 10 * x) * x)
    tone = sum(np.sin(2 * np.pi * f * x) for f in (3520, 4870)) * trem
    shape = np.sin(np.pi * np.clip(x / 0.55, 0, 1))
    return tone * shape * 0.5 + whoosh(0.55, 1500, 9000, 0.5) * 0.4


def main():
    save("whoosh", whoosh())
    save("swipe", swipe())
    save("tap", tap(), 0.7)
    save("lens", lens(), 0.75)
    save("impact", impact())
    save("confirm", confirm(), 0.8)
    save("coin", coin(), 0.85)
    save("spin", spin(), 0.6)


if __name__ == "__main__":
    main()
