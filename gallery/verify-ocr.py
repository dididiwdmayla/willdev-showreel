"""Reads every gallery image with OCR and flags contact data or document numbers.

    python3 gallery/verify-ocr.py gallery/out/*.png

Looks for phone numbers, e-mails, URLs, outside channels (WhatsApp, Instagram…)
and Brazilian document ids (OAB, CNPJ, CPF). Exit code 1 if anything is found.
The image is also read at 2× so small interface text is not skipped.

Requires: pip install rapidocr-onnxruntime pillow
"""

import re
import sys

from PIL import Image
from rapidocr_onnxruntime import RapidOCR

PATTERNS = {
    "phone": re.compile(r"\(?\b\d{2}\)?\s?9?\d{4}[-\s]?\d{4}\b"),
    "email": re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+"),
    "url": re.compile(r"(https?://|www\.|\.vercel\.app|\.com\b|\.com\.br\b|\.net\b|\.io\b)", re.I),
    "contact-word": re.compile(r"whats\s?app|instagram|e-?mail|telefone|wa\.me|linkedin|gmail", re.I),
    "document": re.compile(r"\bOAB\b|CNPJ|\bCPF\b|\d{2}\.\d{3}\.\d{3}/\d{4}", re.I),
    "fiverr-metric": re.compile(r"fiverr|level\s*\d|top rated|★|\d\.\d\s*\(\d+\)", re.I),
}


def main(paths):
    ocr = RapidOCR()
    found = 0
    for path in paths:
        im = Image.open(path).convert("RGB")
        big = im.resize((im.width * 2, im.height * 2), Image.LANCZOS)
        tmp = path + ".ocr.png"
        big.save(tmp)
        result, _ = ocr(tmp)
        import os

        os.remove(tmp)
        lines = [r[1] for r in (result or [])]
        hits = [(k, line) for line in lines for k, rx in PATTERNS.items() if rx.search(line)]
        found += len(hits)
        status = "ok" if not hits else "!!"
        print(f"  {status} OCR {path.split('/')[-1]}: {len(lines)} text lines read, {len(hits)} hit(s)")
        for k, line in hits:
            print(f"       {k}: {line}")
    return 1 if found else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
