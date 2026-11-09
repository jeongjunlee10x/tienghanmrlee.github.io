#!/usr/bin/env python3
"""MR LEE image decode audit: load actual pixels, preserve all original files.

This is a read-only audit. It does not resize, strip metadata, crop or re-encode.
Pillow 11.3.0+; run from repo root: python tools/check-image-decoding.py
"""
from __future__ import annotations
import json
from collections import Counter
from pathlib import Path

try:
    from PIL import Image, ImageFile
except ImportError as exc:
    raise SystemExit("Install Pillow to decode PNG, JPEG and WebP files") from exc

ROOT = Path(__file__).resolve().parents[1]
IGNORE = {".git", ".github", "archive", "node_modules", "dist",
          "docs", "scripts", "tools", "artifacts", "coverage"}
EXT = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"}
ImageFile.LOAD_TRUNCATED_IMAGES = False


def image_paths(folder: Path):
    for candidate in sorted(folder.iterdir(), key=lambda f: f.name):
        if candidate.name.startswith(".") or candidate.name in IGNORE:
            continue
        if candidate.is_symlink():
            raise RuntimeError(f"Unexpected symlink: {candidate}")
        if candidate.is_dir():
            yield from image_paths(candidate)
        elif candidate.is_file() and candidate.suffix.lower() in EXT:
            yield candidate


def main():
    counters = Counter()
    failures = []
    dimensions = []
    files = list(image_paths(ROOT))
    for item in files:
        rel = item.relative_to(ROOT).as_posix()
        try:
            with Image.open(item) as source:
                width, height, fmt = source.width, source.height, source.format
                source.verify()  # Check encoded chunk structure.
            with Image.open(item) as decoded:
                decoded.load()  # Actually decode all pixels, not just magic bytes.
                assert decoded.size == (width, height)
            if not 1 <= width <= 40000 or not 1 <= height <= 40000:
                raise ValueError(f"Pixel dimensions outside safe range: {width}x{height}")
            counters[f"format_{fmt or 'unknown'}"] += 1
            counters["decoded"] += 1
            if item.stat().st_size > 450_000:
                dimensions.append({"file": rel, "width": width, "height": height,
                                   "kb": round(item.stat().st_size / 1024)})
        except Exception as exc:
            failures.append({"file": rel, "error": str(exc)[:180]})
    data = {"count": len(files), "decoded": counters["decoded"],
            "formats": dict(counters), "largeImages": sorted(
                dimensions, key=lambda x: x["kb"], reverse=True
            )[:90], "failures": failures}
    folder = ROOT / "artifacts" / "media-integrity"
    folder.mkdir(parents=True, exist_ok=True)
    (folder / "image-decoding.json").write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"MR LEE IMAGE PIXEL DECODE: {data['decoded']}/{data['count']} "
          f"success; {len(failures)} failures; {len(dimensions)} large files")
    for fail in failures[:20]:
        print("IMAGE DECODE FAIL", fail["file"], fail["error"])
    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
