#!/usr/bin/env python3
"""Build a lossless GitHub worktree backup split for downstream Google Drive upload.
Only files committed at HEAD are included; local unpublished files cannot be read.
All MP3/image/video files tracked by Git are included without transcoding.
"""
from __future__ import annotations
from pathlib import Path
import subprocess, hashlib, json, tarfile, time, io, os, math
ROOT=Path(__file__).resolve().parents[1]
DEST=ROOT/"_mrlee_backup_artifact"
DEST.mkdir(exist_ok=True)
def sh(*args):
    return subprocess.check_output(args,cwd=ROOT).decode("utf-8").strip()
commit=sh("git","rev-parse","HEAD")
raw=subprocess.check_output(["git","ls-files","-z"],cwd=ROOT)
items=sorted([Path(os.fsdecode(v)) for v in raw.split(b"\0") if v])
manifest={"project":"TIENG HAN MR LEE","repository":"jeongjunlee10x/tienghanmrlee.github.io",
          "commit":commit,"backup_type":"FULL_TRACKED_WORKTREE","scope_note":"Includes ALL tracked media; NOT uncommitted files on the Windows G: drive.",
          "created_utc":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime()),
          "files":[]}
total=0
for rel in items:
    p=ROOT/rel
    if not p.exists() and not p.is_symlink():
        raise SystemExit(f"Missing tracked item: {rel}")
    if p.is_symlink():
        data=os.readlink(p).encode()
        kind="symlink"
    elif p.is_file():
        h=hashlib.sha256()
        with p.open("rb") as f:
            for block in iter(lambda:f.read(4*1024*1024),b""): h.update(block)
        size=p.stat().st_size
        total+=size
        manifest["files"].append({"path":rel.as_posix(),"size":size,"sha256":h.hexdigest()})
        continue
    else:
        raise SystemExit(f"Tracked path not a regular file/symlink: {rel}")
    manifest["files"].append({"path":rel.as_posix(),"type":kind,"target_sha256":hashlib.sha256(data).hexdigest()})
manifest["count"]=len(items)
manifest["total_raw_bytes"]=total
manifest["by_extension"]={}
for x in manifest["files"]:
    ext=Path(x["path"]).suffix.lower() or "<none>"
    info=manifest["by_extension"].setdefault(ext,{"count":0,"bytes":0})
    info["count"]+=1;info["bytes"]+=x.get("size",0)
manifest_data=json.dumps(manifest,ensure_ascii=False,sort_keys=True,indent=2).encode("utf-8")
(DEST/"MRLEE_BACKUP_FILE_MANIFEST.json").write_bytes(manifest_data)
archive=DEST/"MRLEE_FULL_SOURCE_MEDIA.tar.gz"
with tarfile.open(archive,"w:gz",compresslevel=1,format=tarfile.PAX_FORMAT) as tf:
    for rel in items:
        tf.add(ROOT/rel,arcname="tienghanmrlee.github.io/"+rel.as_posix(),recursive=False)
    info=tarfile.TarInfo("tienghanmrlee.github.io/MRLEE_BACKUP_FILE_MANIFEST.json")
    info.size=len(manifest_data)
    info.mtime=int(time.time())
    tf.addfile(info,io.BytesIO(manifest_data))
parts=[]
size=80*1024*1024
with archive.open("rb") as r:
    i=0
    while (chunk:=r.read(size)):
        out=DEST/f"MRLEE_SOURCE_{commit[:8]}.tar.gz.part{i:02}"
        out.write_bytes(chunk)
        parts.append({"name":out.name,"size":len(chunk),"sha256":hashlib.sha256(chunk).hexdigest()})
        i+=1
archive.unlink()
if not parts or len(parts)>8:
    raise SystemExit(f"Unexpected part count {len(parts)}; increase workflow upload step count")
parts_manifest={"commit":commit,"archive_format":"tar.gz","parts":parts,
  "instructions":"Download all part files in numeric order, concatenate byte-for-byte, then tar -xzf combined.tar.gz; verify SHA256 parts and file manifest.",
  "original_files":len(items),"original_uncompressed_bytes":total,"video_files":sum(x["path"].lower().endswith((".mp4",".mov",".webm",".mkv")) for x in manifest["files"])}
(DEST/"MRLEE_BACKUP_PARTS.json").write_text(json.dumps(parts_manifest,ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps({"commit":commit,"files":len(items),"raw_bytes":total,"part_count":len(parts),"video_files":parts_manifest["video_files"],"parts":[p["name"] for p in parts]}))
