#!/usr/bin/env python3
"""MR LEE V3: deterministic import + strict verification of 170 genuinely new images.

Requirements: py -3.12 -m pip install Pillow
  py -3.12 tools/mrlee-v3-assets.py --root . --source "D:\MRLEE_V3_ANH_DA_TAO"
  py -3.12 tools/mrlee-v3-assets.py --root . --strict

Input:
  SOURCE/<01_trang_chu>/<hero-fresh>.png
  or SOURCE/assets/mrlee-ai/v3/<01_trang_chu>/<hero-fresh>.png

The original logo is never replaced, no learning content or MP3 changed.
"""
from pathlib import Path
from collections import Counter
import argparse
import hashlib
import json
import sys

try:
    from PIL import Image, ImageOps, ImageStat, ImageFilter
except ImportError:
    sys.exit("Thiếu Pillow. Chạy: py -3.12 -m pip install Pillow")

parser=argparse.ArgumentParser()
parser.add_argument("--root", default=".", help="Root of your MR LEE git working tree")
parser.add_argument("--source", default="", help="Folder containing *newly generated* master images")
parser.add_argument("--strict", action="store_true", help="Require all 170 originals, no duplicate or low resolution")
parser.add_argument("--partial", action="store_true", help="Allow staged batches but never mark complete")
args=parser.parse_args()
root=Path(args.root).resolve()
base=root/"assets"/"mrlee-ai"/"v3"
manifest_path=base/"14_manifest_va_QA"/"manifest.json"
if not manifest_path.is_file(): sys.exit("Không tìm thấy manifest V3 trong repo: "+str(manifest_path))
manifest=json.loads(manifest_path.read_text(encoding="utf-8"))
records=manifest.get("records",[])
if len(records)!=170: sys.exit("Manifest không đủ 170 mục.")
source=Path(args.source).resolve() if args.source else None
if source and not source.is_dir():sys.exit("Không tìm thấy thư mục ảnh master: "+str(source))

def find_master(rec):
    if not source:return None
    folder,slug=rec["folder"],rec["slug"]
    candidates=[]
    for ext in (".png",".webp",".jpg",".jpeg"):
        candidates.extend([
            source/folder/(slug+ext),
            source/"assets"/"mrlee-ai"/"v3"/folder/(slug+ext),
            source/(slug+ext)
        ])
    found=[x for x in candidates if x.is_file()]
    # Never guess between multiple unrelated source files
    unique={x.resolve() for x in found}
    if len(unique)>1:
        raise ValueError("Nhiều ảnh cùng tên, không thể tự chọn: "+", ".join(str(x) for x in unique))
    return next(iter(unique)) if unique else None

def image_hash(p):
    h=hashlib.sha256()
    with open(p,"rb") as f:
        for chunk in iter(lambda:f.read(1<<20),b""):h.update(chunk)
    return h.hexdigest()

def perceptual_dhash(im):
    im=im.convert("L").resize((9,8),Image.Resampling.LANCZOS)
    pixels=list(im.getdata())
    value=0
    for y in range(8):
        for x in range(8):
            value=(value<<1)|int(pixels[y*9+x]>pixels[y*9+x+1])
    return value

# Block binary reuse from old gallery assets. Style examples must NOT be copied
legacy={}
for folder in ("assets/v303","assets/v306","assets/mrlee-ai/v1","assets/mrlee-ai/v2"):
    d=root/folder
    if d.is_dir():
        for f in d.rglob("*"):
            if f.is_file() and f.suffix.lower() in (".png",".jpg",".jpeg",".webp"):
                legacy.setdefault(image_hash(f),str(f.relative_to(root)))

report={"expected":170,"imported":[],"present":[],"missing":[],"low_resolution":[],
        "wrong_format":[],"legacy_reuse":[],"exact_duplicates":[],"similarity_review":[],
        "transparency_review":[],"image_review":[],"complete":False}
seen={}
visual=[]
for rec in records:
    rel=Path(rec["asset_path"])
    if rel.is_absolute() or ".." in rel.parts or rel.parts[:3]!=("assets","mrlee-ai","v3"):
        sys.exit("Unsafe asset path in manifest: "+str(rel))
    target=root/rel
    if source:
        try:
            master=find_master(rec)
        except ValueError as exc:
            report["image_review"].append(str(exc))
            continue
        if master:
            target.parent.mkdir(parents=True,exist_ok=True)
            try:
                with Image.open(master) as original:
                    original.load()
                    img=ImageOps.exif_transpose(original)
                    expected=(int(rec["width"]),int(rec["height"]))
                    if img.width<expected[0] or img.height<expected[1]:
                        report["low_resolution"].append({"file":str(master),"actual":img.size,"expected":expected})
                        continue
                    ratio=img.width/img.height
                    required=expected[0]/expected[1]
                    if abs(ratio-required)/required > 0.10:
                        report["image_review"].append("Tỷ lệ ảnh sai quá 10%, cần sinh/crop lại: "+str(master))
                        continue
                    # If sizes differ, crop only minimal edge excess, never upscale.
                    if img.size!=expected:
                        img=ImageOps.fit(img,expected,method=Image.Resampling.LANCZOS,centering=(.5,.5))
                    temp=target.with_name(target.stem+".mrlee_tmp"+target.suffix)
                    if target.suffix.lower()==".png":
                        img.convert("RGBA").save(temp,format="PNG",optimize=True)
                    else:
                        output=img.convert("RGBA") if "A" in img.getbands() else img.convert("RGB")
                        output.save(temp,format="WEBP",quality=90,method=6)
                    temp.replace(target)
                report["imported"].append(str(rel).replace("\\","/"))
            except Exception as exc:
                report["image_review"].append(str(master)+": "+str(exc))
                continue
    if not target.is_file():
        report["missing"].append(str(rel).replace("\\","/"))
        continue
    try:
        suffix=target.suffix.lower()
        with Image.open(target) as im:
            im.load()
            expected=(int(rec["width"]),int(rec["height"]))
            if im.width<expected[0] or im.height<expected[1]:
                report["low_resolution"].append({"file":str(rel),"actual":im.size,"expected":expected})
            if (suffix==".png" and im.format!="PNG") or (suffix==".webp" and im.format!="WEBP"):
                report["wrong_format"].append(str(rel))
            if rec["kind"] in ("logo","icon"):
                alpha=im.getchannel("A") if "A" in im.getbands() else None
                if not alpha or alpha.getextrema()[0]==255:
                    report["transparency_review"].append(str(rel))
            if rec["kind"] not in ("icon","logo"):
                dh=perceptual_dhash(im)
                for former,prior,fkind in visual:
                    distance=(dh^prior).bit_count()
                    if fkind==rec["kind"] and distance<=5:
                        report["similarity_review"].append({"a":str(rel),"b":former,"distance":distance})
                visual.append((str(rel),dh,rec["kind"]))
            # Edge variation is only a visual-review hint, not a hard blur test.
            if rec["kind"] in ("hero","card","gallery"):
                small=im.convert("L");small.thumbnail((512,512))
                score=ImageStat.Stat(small.filter(ImageFilter.FIND_EDGES)).stddev[0]
                if score<5:
                    report["image_review"].append("Ảnh ít chi tiết/có thể mờ, cần xem: "+str(rel))
        digest=image_hash(target)
        if digest in seen:report["exact_duplicates"].append([str(rel),seen[digest]])
        else:seen[digest]=str(rel)
        if digest in legacy:report["legacy_reuse"].append([str(rel),legacy[digest]])
        report["present"].append(str(rel).replace("\\","/"))
    except Exception as exc:
        report["wrong_format"].append(str(rel)+": "+str(exc))

hard=("missing","low_resolution","wrong_format","legacy_reuse","exact_duplicates","image_review")
report["complete"]=len(report["present"])==170 and not any(report[x] for x in hard)
report["status"]="COMPLETE_PENDING_VISUAL_APPROVAL" if report["complete"] else "INCOMPLETE_NOT_FOR_PUBLICATION"
report["counts"]={name:len(value) for name,value in report.items() if isinstance(value,list)}
report_path=base/"14_manifest_va_QA"/"qa-result.json"
report_path.parent.mkdir(parents=True,exist_ok=True)
report_path.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
print("MR LEE V3: "+str(len(report["present"]))+"/170 ảnh đã có.")
for key in ("imported","missing","low_resolution","wrong_format","legacy_reuse",
            "exact_duplicates","similarity_review","transparency_review","image_review"):
    print("  "+key+": "+str(len(report[key])))
print("Báo cáo: "+str(report_path))
if not report["complete"]:
    print("CHƯA THỂ XUẤT BẢN: còn thiếu hoặc chưa đạt kiểm định.")
elif report["similarity_review"] or report["transparency_review"]:
    print("ĐỦ FILE nhưng cần xem ảnh giống nhau/độ trong suốt và phê duyệt bằng mắt.")
else:print("170/170 ảnh kỹ thuật đạt; cần nghiệm thu bằng mắt trước khi kích hoạt site.")
if args.strict and (not report["complete"] or report["similarity_review"] or report["transparency_review"]):
    sys.exit(1)
if source and not args.partial and not report["complete"]:sys.exit(1)
