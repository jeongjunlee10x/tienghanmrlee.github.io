#!/usr/bin/env python3
"""Reproducible health-topic gallery from licensed Wikimedia Commons originals, no upscaling or unlabeled facilities."""
import hashlib, io, json, pathlib, time, urllib.parse, urllib.request
from PIL import Image, ImageOps
ROOT=pathlib.Path(__file__).resolve().parents[1]
source=json.loads((ROOT/"assets/culture/medical-v41-sources.json").read_text(encoding="utf-8"))["photos"]
DEST=ROOT/"images/culture-v41-photo/benh-vien"
DEST.mkdir(parents=True,exist_ok=True)
result=[]
def fetch(item):
    filename=item["filename"].replace(" ","_")
    md5=hashlib.md5(filename.encode("utf-8")).hexdigest()
    quoted=urllib.parse.quote(filename,safe="-_().")
    targets=[
      f"https://upload.wikimedia.org/wikipedia/commons/{md5[0]}/{md5[:2]}/{quoted}",
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/"+quoted
    ]
    err=None
    for url in targets:
      for attempt in range(3):
        try:
          req=urllib.request.Request(url,headers={
            "User-Agent":"MRLeeEducationCulture/1.0 (https://github.com/jeongjunlee10x/tienghanmrlee.github.io; licensed educational imagery)",
            "Accept":"image/jpeg,image/png,image/*;q=0.8"
          })
          with urllib.request.urlopen(req,timeout=70) as stream: raw=stream.read(30000000)
          with Image.open(io.BytesIO(raw)) as im: im.verify()
          return raw
        except Exception as ex:
          err=ex
          print(f"Source {item['index']} fetch attempt failed: {ex}",flush=True)
          time.sleep(2)
    raise RuntimeError(f"Unable to obtain original {item['filename']}: {err}")
assert len(source)==5
for entry in source:
    raw=fetch(entry)
    with Image.open(io.BytesIO(raw)) as im:
      im=ImageOps.exif_transpose(im).convert("RGB")
      w,h=im.size
      assert w>=1536 and h>=1024, f"Original too small {w}x{h}"
      assert w>=entry["original_width"]-4 and h>=entry["original_height"]-4, f"Original unexpectedly downscaled {w}x{h}"
      rendered=ImageOps.fit(im,(1536,1024),method=Image.Resampling.LANCZOS,centering=(0.5,0.5))
      path=DEST/f"{entry['index']:02d}.webp"
      rendered.save(path,"WEBP",quality=91,method=6)
      bs=path.read_bytes()
      assert bs[:4]==b"RIFF" and bs[8:12]==b"WEBP"
      assert len(bs)>100000, f"Suspiciously small {path}"
      result.append({**entry,"file":path.relative_to(ROOT).as_posix(),"bytes":len(bs),"width":1536,"height":1024,"sha256":hashlib.sha256(bs).hexdigest(),"source_dimensions":[w,h],"modified":"cropped to 3:2 and downscaled; WebP conversion","credit_required":True})
      print(f"READY {path}: {len(bs)} bytes",flush=True)
assert len(result)==5 and len({x["sha256"] for x in result})==5
(ROOT/"assets/culture/medical-v41-published.json").write_text(json.dumps({"version":"41.0","topic":"benh-vien","photos":result},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("PASS: five licensed, distinct landscape medical scenes; metadata recorded",flush=True)
