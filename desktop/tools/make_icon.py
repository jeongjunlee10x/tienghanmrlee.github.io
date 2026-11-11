#!/usr/bin/env python3
"""Prepare the original MR LEE brand logo for the Windows desktop application.

Usage:
  python desktop/tools/make_icon.py assets/branding/logo-mrlee.png desktop/build
"""
from pathlib import Path
import sys
from PIL import Image

if len(sys.argv) != 3:
    raise SystemExit("Expected SOURCE_LOGO OUTPUT_DIRECTORY")

source = Path(sys.argv[1])
output = Path(sys.argv[2])
if not source.is_file():
    raise SystemExit(f"Official MR LEE logo not found: {source}")
output.mkdir(parents=True, exist_ok=True)

with Image.open(source) as image:
    logo = image.convert("RGBA")
    logo.thumbnail((256, 256), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    canvas.alpha_composite(logo, ((256 - logo.width) // 2, (256 - logo.height) // 2))
    canvas.save(output / "icon.png", format="PNG")
    canvas.save(
        output / "icon.ico",
        format="ICO",
        sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
    )
print(f"MR LEE Windows icons created using official logo: {output}")
