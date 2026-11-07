#!/usr/bin/env python3
"""Generate branded Android launcher icons and iOS asset catalog from official MR LEE logo.

Run from repository root:
  python mobile/tools/generate_icons.py
"""
import json
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets/branding/logo-mrlee.png"
ANDROID = ROOT / "mobile/android/app/src/main/res"
IOS = ROOT / "mobile/ios/App/Assets.xcassets"

if not SOURCE.is_file():
    raise SystemExit("Missing official logo: " + str(SOURCE))

with Image.open(SOURCE) as image:
    official = image.convert("RGBA")

def branded(size, rounded=False):
    canvas = Image.new("RGBA", (size, size), (12, 29, 66, 255))
    thumb = ImageOps.contain(official, (int(size * .92), int(size * .92)), Image.Resampling.LANCZOS)
    canvas.alpha_composite(thumb, ((size - thumb.width) // 2, (size - thumb.height) // 2))
    if rounded:
        mask = Image.new("L", (size, size), 0)
        ImageDraw.Draw(mask).ellipse((0, 0, size - 1, size - 1), fill=255)
        canvas.putalpha(mask)
    return canvas

for density, pixels in [
    ("mdpi", 48), ("hdpi", 72), ("xhdpi", 96),
    ("xxhdpi", 144), ("xxxhdpi", 192)
]:
    folder = ANDROID / ("mipmap-" + density)
    folder.mkdir(parents=True, exist_ok=True)
    branded(pixels).save(folder / "ic_launcher.png")
    branded(pixels, rounded=True).save(folder / "ic_launcher_round.png")

app_icon = IOS / "AppIcon.appiconset"
app_icon.mkdir(parents=True, exist_ok=True)
entries = []
for idiom, size, scales in [
    ("iphone", 20, [2, 3]), ("iphone", 29, [2, 3]),
    ("iphone", 40, [2, 3]), ("iphone", 60, [2, 3]),
    ("ipad", 20, [1, 2]), ("ipad", 29, [1, 2]),
    ("ipad", 40, [1, 2]), ("ipad", 76, [1, 2]),
    ("ipad", 83.5, [2]), ("ios-marketing", 1024, [1]),
]:
    for scale in scales:
        pixels = round(size * scale)
        filename = f"icon-{idiom}-{size:g}-{scale}x.png"
        branded(pixels).convert("RGB").save(app_icon / filename)
        entries.append({
            "filename": filename,
            "idiom": idiom,
            "size": f"{size:g}x{size:g}",
            "scale": f"{scale}x",
        })
(app_icon / "Contents.json").write_text(json.dumps({
    "images": entries, "info": {"author": "xcode", "version": 1}
}, ensure_ascii=False, indent=2) + "\n", encoding="utf8")

logo = IOS / "Logo.imageset"
logo.mkdir(parents=True, exist_ok=True)
images = []
for scale in [1, 2, 3]:
    filename = f"logo-{scale}x.png"
    branded(256 * scale).save(logo / filename)
    images.append({"filename": filename, "idiom": "universal", "scale": f"{scale}x"})
(logo / "Contents.json").write_text(json.dumps({
    "images": images, "info": {"author": "xcode", "version": 1}
}, ensure_ascii=False, indent=2) + "\n", encoding="utf8")

print("Branded Android icons and iOS asset catalog created from MR LEE official logo.")
