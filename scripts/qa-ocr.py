"""Frame-by-frame check that a render shows no contact data.

    python3 scripts/qa-ocr.py renders/willdev-showreel-fiverr-en.mp4 [--every 1] [--jobs 3]

Decodes every frame (or every Nth), reads all text with OCR (RapidOCR) and
flags phone numbers, e-mail addresses, URLs and words that point to an outside
channel (WhatsApp, Instagram, e-mail…). Exit code 1 if anything is found.

Requires: pip install rapidocr-onnxruntime pillow (and ffmpeg on PATH).
"""

import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
from concurrent.futures import ProcessPoolExecutor

PATTERNS = {
    "phone": re.compile(r"\(?\b\d{2}\)?\s?9?\d{4}[-\s]?\d{4}\b"),
    "email": re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+"),
    "url": re.compile(r"(https?://|www\.|\.vercel\.app|\.com\b|\.com\.br\b|\.net\b|\.io\b)", re.I),
    "contact-word": re.compile(r"whats\s?app|instagram|e-?mail|telefone|wa\.me|linkedin|gmail", re.I),
}

_ocr = None


def ocr_file(path):
    global _ocr
    if _ocr is None:
        from rapidocr_onnxruntime import RapidOCR

        _ocr = RapidOCR()
    result, _ = _ocr(path)
    return [r[1] for r in (result or [])]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--every", type=int, default=1)
    ap.add_argument("--jobs", type=int, default=3)
    args = ap.parse_args()

    with tempfile.TemporaryDirectory() as tmp:
        vf = f"select=not(mod(n\\,{args.every}))" if args.every > 1 else "null"
        subprocess.run(
            ["ffmpeg", "-v", "error", "-i", args.video, "-vf", vf, "-vsync", "0", "-q:v", "2", os.path.join(tmp, "%05d.jpg")],
            check=True,
        )
        files = sorted(f for f in os.listdir(tmp) if f.endswith(".jpg"))
        paths = [os.path.join(tmp, f) for f in files]
        with ProcessPoolExecutor(max_workers=args.jobs) as pool:
            texts = list(pool.map(ocr_file, paths, chunksize=8))

    hits = []
    seen = set()
    for i, lines in enumerate(texts):
        frame = i * args.every
        for line in lines:
            for kind, rx in PATTERNS.items():
                if rx.search(line):
                    hits.append({"frame": frame, "time": round(frame / 30, 2), "kind": kind, "text": line})
        seen.update(lines)

    report = {
        "video": args.video,
        "framesChecked": len(texts),
        "every": args.every,
        "hits": hits,
        "distinctTextLines": sorted(seen),
    }
    out = os.path.splitext(args.video)[0] + ".ocr.json"
    with open(out, "w") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    print(f"{len(texts)} frames checked, {len(hits)} hit(s) -> {out}")
    for h in hits[:40]:
        print(f"  frame {h['frame']} ({h['time']} s) {h['kind']}: {h['text']}")
    return 1 if hits else 0


if __name__ == "__main__":
    sys.exit(main())
