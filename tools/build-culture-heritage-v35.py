#!/usr/bin/env python3
"""Create five landscape Korean history and heritage documentary photos, accurately credited.
No upscale, no montage, no blurred side padding. Never publish a partial set.
"""
import hashlib
import io
import json
import pathlib
import time
import urllib.error
import urllib.parse
import urllib.request
from PIL import Image, ImageOps

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCES = json.loads((ROOT / "assets/culture/heritage-v35-sources.json").read_text(encoding="utf-8"))["photos"]
DEST = ROOT / "images/culture-v35-photo/lich-su"
DEST.mkdir(parents=True, exist_ok=True)
ARTIFACTS = []

def download(entry):
    filename = entry["filename"].replace(" ", "_")
    digest = hashlib.md5(filename.encode("utf-8")).hexdigest()
    img_path = urllib.parse.quote(filename, safe="-_().")
    urls = [
      f"https://upload.wikimedia.org/wikipedia/commons/{digest[0]}/{digest[:2]}/{img_path}",
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/" + img_path
    ]
    last = None
    for url in urls:
      for attempt in range(2):
        try:
          print(f"Fetch source {entry['index']} using {url}", flush=True)
          request = urllib.request.Request(url, headers={
            "User-Agent": "MRLeeEducationCulture/1.0 (https://github.com/jeongjunlee10x/tienghanmrlee.github.io; licensed Wikimedia educational imagery)",
            "Accept": "image/jpeg,image/png,image/*;q=0.8",
          })
          with urllib.request.urlopen(request, timeout=60) as response:
            data = response.read(30_000_000)
          with Image.open(io.BytesIO(data)) as im:
            im.verify()
          return data
        except Exception as error:
          last=error
          print(f"Download failed: {error}", flush=True)
          time.sleep(3)
    raise RuntimeError(f"Could not download {entry['filename']}: {last}")

for entry in SOURCES:
  raw=download(entry)
  with Image.open(io.BytesIO(raw)) as image:
    image=ImageOps.exif_transpose(image).convert("RGB")
    w,h=image.size
    assert w>=1536 and h>=1024, f"Source too small: {w}x{h}"
    assert w>=entry["original_width"]-4 and h>=entry["original_height"]-4, "Source was unexpectedly downscaled"
    out=ImageOps.fit(image, (1536,1024), method=Image.Resampling.LANCZOS, centering=(0.5,0.5))
    output=DEST / (str(entry["index"]).zfill(2)+".webp")
    out.save(output, format="WEBP", quality=91, method=6)
    data=output.read_bytes()
    assert data[:4]==b"RIFF" and data[8:12]==b"WEBP"
    assert len(data)>100_000, f"Suspiciously small output {output}: {len(data)}"
    item={**entry,"file":output.relative_to(ROOT).as_posix(),"bytes":len(data),"width":1536,"height":1024,"sha256":hashlib.sha256(data).hexdigest(),"source_dimensions":[w,h],"credit_required":True}
    ARTIFACTS.append(item)
    print(f"Generated {output}: {len(data)} bytes, from {w}x{h}", flush=True)

assert len(ARTIFACTS)==5
assert len({a["sha256"] for a in ARTIFACTS})==5, "Duplicate photo detected"
published=ROOT / "assets/culture/heritage-v35-published.json"
published.write_text(json.dumps({"version":"35.0","topic":"lich-su","photos":ARTIFACTS},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("PASS: five landscape images are ready and local.",flush=True)
