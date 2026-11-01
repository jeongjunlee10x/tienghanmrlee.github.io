#!/usr/bin/env python3
"""Build five authentic licensed Korean city-bus educational photographs; never publish a partial set."""
import hashlib, io, json, pathlib, time, urllib.parse, urllib.request
from PIL import Image, ImageOps
ROOT=pathlib.Path(__file__).resolve().parents[1]
SRC=json.loads((ROOT/"assets/culture/bus-v40-sources.json").read_text(encoding="utf-8"))["photos"]
OUT=ROOT/"images/culture-v40-photo/xe-buyt"
OUT.mkdir(parents=True,exist_ok=True)
ITEMS=[]
def fetch(entry):
    filename=entry["filename"].replace(" ","_")
    md5=hashlib.md5(filename.encode("utf-8")).hexdigest()
    quoted=urllib.parse.quote(filename,safe="-_().")
    urls=[f"https://upload.wikimedia.org/wikipedia/commons/{md5[0]}/{md5[:2]}/{quoted}",
          "https://commons.wikimedia.org/wiki/Special:Redirect/file/"+quoted]
    last=None
    for url in urls:
        for retry in range(3):
            try:
                req=urllib.request.Request(url,headers={
                  "User-Agent":"MRLeeEducationCulture/1.0 (https://github.com/jeongjunlee10x/tienghanmrlee.github.io; educational Wikimedia images)",
                  "Accept":"image/jpeg,image/png,image/*;q=0.8"})
                with urllib.request.urlopen(req,timeout=75) as response:
                    b=response.read(30000000)
                with Image.open(io.BytesIO(b)) as im: im.verify()
                return b
            except Exception as e:
                last=e;print(f"WARNING photo {entry['index']}: {e}",flush=True);time.sleep(2)
    raise RuntimeError(f"Download failed: {entry['filename']}: {last}")
assert len(SRC)==5
for entry in SRC:
    data=fetch(entry)
    with Image.open(io.BytesIO(data)) as im:
        im=ImageOps.exif_transpose(im).convert("RGB")
        width,height=im.size
        assert width>=1536 and height>=1024
        assert width>=entry["original_width"]-4 and height>=entry["original_height"]-4
        rendered=ImageOps.fit(im,(1536,1024),method=Image.Resampling.LANCZOS,centering=(0.5,0.5))
        path=OUT/(f"{entry['index']:02d}.webp")
        rendered.save(path,"WEBP",quality=91,method=6)
        bs=path.read_bytes()
        assert bs[:4]==b"RIFF" and bs[8:12]==b"WEBP"
        assert len(bs)>100000,(path,len(bs))
        ITEMS.append({**entry,"file":path.relative_to(ROOT).as_posix(),"bytes":len(bs),
                      "width":1536,"height":1024,"source_dimensions":[width,height],
                      "sha256":hashlib.sha256(bs).hexdigest(),"modified":"center-cropped to 3:2, downsized, WebP conversion",
                      "credit_required":True})
        print(f"BUILT: {path} {len(bs)} bytes",flush=True)
assert len(ITEMS)==5 and len({x["sha256"] for x in ITEMS})==5
(ROOT/"assets/culture/bus-v40-published.json").write_text(
    json.dumps({"version":"40.0","topic":"xe-buyt","photos":ITEMS},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("PASS: five verified independent 1536x1024 real licensed photos",flush=True)
