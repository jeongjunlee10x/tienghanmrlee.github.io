#!/usr/bin/env python3
"""Publish five actual Korean fire-safety images from licensed Commons pages. Fail closed on download or duplicate."""
import hashlib, io, json, pathlib, time, urllib.parse, urllib.request
from PIL import Image, ImageOps
ROOT=pathlib.Path(__file__).resolve().parents[1]
SOURCE=json.loads((ROOT/"assets/culture/fire-v42-sources.json").read_text(encoding="utf-8"))["photos"]
DEST=ROOT/"images/culture-v42-photo/hoa-hoan"
DEST.mkdir(parents=True,exist_ok=True)
published=[]
def get(entry):
    f=entry["filename"].replace(" ","_")
    md5=hashlib.md5(f.encode("utf-8")).hexdigest()
    quoted=urllib.parse.quote(f,safe="-_().")
    urls=[f"https://upload.wikimedia.org/wikipedia/commons/{md5[0]}/{md5[:2]}/{quoted}",
          "https://commons.wikimedia.org/wiki/Special:Redirect/file/"+quoted]
    last=None
    for url in urls:
      for attempt in range(3):
        try:
          req=urllib.request.Request(url,headers={
            "User-Agent":"MRLeeEducationCulture/1.0 (https://github.com/jeongjunlee10x/tienghanmrlee.github.io; licensed Wikimedia educational photos)",
            "Accept":"image/jpeg,image/png,image/*;q=0.8"
          })
          with urllib.request.urlopen(req,timeout=80) as resp:
            raw=resp.read(30000000)
          with Image.open(io.BytesIO(raw)) as im: im.verify()
          return raw
        except Exception as exc:
          last=exc
          print(f"Photo {entry['index']} download failed: {exc}",flush=True)
          time.sleep(2)
    raise RuntimeError(f"Cannot obtain source {f}: {last}")
assert len(SOURCE)==5 and [p["index"] for p in SOURCE]==[1,2,3,4,5]
for item in SOURCE:
    raw=get(item)
    with Image.open(io.BytesIO(raw)) as source:
      photo=ImageOps.exif_transpose(source).convert("RGB")
      w,h=photo.size
      assert w>=1536 and h>=1024, f"Insufficient resolution: {item['filename']}: {w}x{h}"
      assert w>=item["original_width"]-4 and h>=item["original_height"]-4, f"Unexpected downscaled source {w}x{h}"
      frame=ImageOps.fit(photo,(1536,1024),method=Image.Resampling.LANCZOS,centering=(0.5,0.5))
      output=DEST/(f"{item['index']:02d}.webp")
      frame.save(output,"WEBP",quality=91,method=6)
      bs=output.read_bytes()
      assert bs[:4]==b"RIFF" and bs[8:12]==b"WEBP"
      assert len(bs)>100000,(output,len(bs))
      published.append({**item,"file":output.relative_to(ROOT).as_posix(),"bytes":len(bs),
        "width":1536,"height":1024,"sha256":hashlib.sha256(bs).hexdigest(),
        "source_dimensions":[w,h],"modified":"center-cropped to 3:2 and reduced to 1536x1024 WebP","credit_required":True})
      print(f"READY {output} {len(bs)} bytes",flush=True)
assert len(published)==5 and len({x["sha256"] for x in published})==5
(ROOT/"assets/culture/fire-v42-published.json").write_text(
    json.dumps({"version":"42.0","topic":"hoa-hoan","photos":published},ensure_ascii=False,indent=2)+"\n",
    encoding="utf-8")
print("PASS 5 distinct Korean fire-safety real photographs with source credits and hashes",flush=True)
