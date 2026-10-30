#!/usr/bin/env python3
"""MR LEE CULTURE V20: high-fidelity 22 x 5 photo-illustration mastering.

Input: 110 existing locally-owned AI WebP images in images/culture-v18-hd/.
Output: 110 *remastered*, higher resolution, visually sharpened WebP files.
No remote/licensed media and no fabricated documentary imagery.
Do not confuse enlargement with new photographic detail: we preserve the source art.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "images" / "culture-v18-hd"
TARGET = ROOT / "images" / "culture-v20-hd"
SLUGS = [
    "le-hoi", "am-thuc", "truyen-thong", "doi-song", "phe-lich-su",
    "giao-duc", "du-lich", "kpop", "cong-so", "tro-choi",
    "lich-su", "hien-dai", "so-cap-cuu", "goi-cuu-ho",
    "lac-duong", "mat-vi", "tau-dien-ngam", "xe-buyt",
    "benh-vien", "hoa-hoan", "mat-dien-thoai", "an-toan-giao-thong"
]
OUTPUT = (2040, 1360)  # exact 3:2; clear on 2x desktop images
MANIFEST = ROOT / "assets" / "culture" / "culture-v20-manifest.json"

def master(src: Path, dst: Path) -> tuple[str, int]:
    with Image.open(src) as original:
        if original.width < 1000 or original.height < 660:
            raise ValueError(f"Source is too low-resolution: {src} {original.size}")
        im = ImageOps.exif_transpose(original).convert("RGB")
        if im.width / im.height < 1.47 or im.width / im.height > 1.53:
            raise ValueError(f"Unexpected thumbnail aspect ratio: {src} {im.size}")
        # Conservative editorial corrections without destroying unique AI features.
        im = ImageEnhance.Contrast(im).enhance(1.055)
        im = ImageEnhance.Color(im).enhance(1.035)
        im = im.resize(OUTPUT, Image.Resampling.LANCZOS)
        im = im.filter(ImageFilter.UnsharpMask(radius=1.45, percent=125, threshold=3))
        dst.parent.mkdir(parents=True, exist_ok=True)
        im.save(dst, format="WEBP", quality=92, method=5, exact=True)
    with Image.open(dst) as verified:
        verified.load()
        if verified.size != OUTPUT or verified.format != "WEBP":
            raise ValueError(f"Export verification failed: {dst}")
    digest = hashlib.sha256(dst.read_bytes()).hexdigest()
    return digest, dst.stat().st_size

def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"Missing original images: {SOURCE}")
    records = []
    input_digests = set()
    for slug in SLUGS:
        for number in range(1, 6):
            name = f"{number:02d}.webp"
            src = SOURCE / slug / name
            if not src.is_file():
                raise FileNotFoundError(f"Missing original culture illustration: {src}")
            data = src.read_bytes()
            original_sha = hashlib.sha256(data).hexdigest()
            if original_sha in input_digests:
                raise ValueError(f"Duplicate original image detected: {src}")
            input_digests.add(original_sha)
            dst = TARGET / slug / name
            digest, size = master(src, dst)
            records.append({
                "topic": slug, "index": number, "file": str(dst.relative_to(ROOT)),
                "source": str(src.relative_to(ROOT)), "width": OUTPUT[0],
                "height": OUTPUT[1], "sha256": digest, "bytes": size,
                "label": "AI illustration remaster, not a documentary photo"
            })
    assert len(records) == 110, len(records)
    assert len({r["sha256"] for r in records}) == 110, "Duplicate remastered outputs"
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps({
        "version": "20.0", "mode": "source-art remaster",
        "disclaimer": "Upscaling and sharpening do not reconstruct unavailable real-world details.",
        "subjects": len(SLUGS), "imageCount": len(records),
        "images": records
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"V20 PASS: {len(SLUGS)} topics / {len(records)} unique verified WebP files, {OUTPUT[0]}×{OUTPUT[1]} px.")

if __name__ == "__main__":
    main()
