#!/usr/bin/env python3
"""MR LEE audio V1: inventory, validate and safely regenerate CSV-indexed MP3.

Requires: pip install edge-tts; ffmpeg available on PATH.
Examples:
 python tools/mrlee-audio-v1.py audit
 python tools/mrlee-audio-v1.py build --section 03_TOPIK --limit 20
 python tools/mrlee-audio-v1.py build --section 03_TOPIK --apply --limit 20
Only --apply replaces existing MP3; replacements are atomic and preserve paths.
"""
import argparse
import asyncio
import csv
import json
import os
import re
import shutil
import subprocess
import tempfile
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUDIO = ROOT / "MRLEE_AUDIO"
VOICES = {"male": "ko-KR-InJoonNeural", "female": "ko-KR-SunHiNeural"}
ROLE = re.compile(r"^\s*(남자|여자|남성|여성)\s*[:：]\s*")
INLINE_ROLE = re.compile(r"(?<!\S)(남자|여자|남성|여성)\s*[:：]\s*")
KOREAN = re.compile(r"[가-힣]")
BAD_SPEECH = re.compile(r"(^|\s)(남자|여자)\s*[:：]")
NUMBER = re.compile(r"listening-(\d{3})", re.I)


def clean_text(raw):
    value = raw.strip().lstrip("\ufeff")
    # A role is metadata, not something to pronounce.
    value = ROLE.sub("", value)
    value = re.sub(r"\s*=\s*", ", ", value)
    value = re.sub(r"\+\s*N\b", " 명사", value, flags=re.I)
    return value.strip()


def parse_turns(raw, default_male=False):
    """Keep all explicit speakers even in multi-turn dialogue."""
    turns = []
    speaker = "male" if default_male else "female"
    chunks = re.split(r"(?=(?<!\S)(?:남자|여자|남성|여성)\s*[:：])", raw.strip())
    for chunk in chunks:
        if not chunk.strip():
            continue
        m = ROLE.match(chunk)
        if m:
            speaker = "male" if m.group(1) in ("남자", "남성") else "female"
        content = clean_text(chunk)
        if content:
            turns.append((speaker, content))
    return turns


def bool_male(value):
    return str(value).strip().lower() in ("true", "1", "yes", "male", "nam")


def preferred_male(row):
    """Use metadata for TOPIK; alternate neutral lesson items to cover both voices."""
    if bool_male(row.get("male")):
        return True
    if ROLE.match((row.get("text") or "").strip()):
        return False
    if row["file"].startswith(("01_HOC_TIENG_HAN/", "02_", "04_")):
        match = re.search(r"(?:^|/)[a-zA-Z](\d{3,5})_", row["file"])
        if match:
            return int(match.group(1)) % 2 == 0
    return False


def is_exam(row):
    return row["file"].startswith("03_TOPIK/") and bool(NUMBER.search(row["file"]))


def number_of(row):
    m = NUMBER.search(row["file"])
    return int(m.group(1)) if m else None


def entries(section):
    for manifest in sorted(AUDIO.rglob("DANH_SACH.csv")):
        for row_num, row in enumerate(csv.DictReader(manifest.open(encoding="utf-8-sig", newline="")), 2):
            relative = (row.get("file") or "").replace("\\", "/")
            if not relative or not relative.endswith(".mp3"):
                continue
            if section and not relative.startswith(section + "/"):
                continue
            target = (AUDIO / relative).resolve()
            if not target.is_relative_to(AUDIO.resolve()):
                raise ValueError(f"Unsafe path {manifest}:{row_num}: {relative}")
            yield dict(row, file=relative, manifest=str(manifest.relative_to(ROOT)), row_num=row_num, target=target)


def audit(section):
    count = Counter()
    issues = []
    for row in entries(section):
        count["indexed"] += 1
        if row["target"].is_file() and row["target"].stat().st_size > 1000:
            count["existing_mp3"] += 1
        else:
            count["missing_or_small"] += 1
        raw = (row.get("text") or "").strip()
        turns = parse_turns(raw, preferred_male(row))
        if not turns or any(not KOREAN.search(t) for _, t in turns):
            count["invalid_text"] += 1
            issues.append(f'{row["file"]}: no Korean text')
        if ROLE.search(raw) or INLINE_ROLE.search(raw):
            count["role_labels_in_source"] += 1
        if turns:
            count["male_turns"] += sum(v == "male" for v, _ in turns)
            count["female_turns"] += sum(v == "female" for v, _ in turns)
        if is_exam(row):
            count["numbered_exam_tracks"] += 1
        if len(issues) < 30 and any(BAD_SPEECH.search(t) for _, t in turns):
            issues.append(f'{row["file"]}: role leaked into output')
    print(json.dumps({"summary": dict(count), "sample_errors": issues}, ensure_ascii=False, indent=2))
    if issues or count["missing_or_small"]:
        return 1
    return 0


async def synthesize(text, voice, output):
    import edge_tts
    await edge_tts.Communicate(text, voice, rate="-8%").save(str(output))


def concat(inputs, output, gap_seconds):
    with tempfile.TemporaryDirectory(prefix="mrlee_join_") as d:
        temp = Path(d)
        segments = []
        for i, (voice_file, pause_after) in enumerate(inputs):
            segments.append(voice_file)
            if pause_after > 0:
                silence = temp / f"silence_{i}.mp3"
                subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                                "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono",
                                "-t", str(pause_after), "-codec:a", "libmp3lame",
                                "-b:a", "64k", str(silence)], check=True)
                segments.append(silence)
        listing = temp / "inputs.txt"
        listing.write_text("".join("file '" + str(p).replace("'", "'\\''") + "'\n" for p in segments), encoding="utf-8")
        subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                        "-f", "concat", "-safe", "0", "-i", str(listing),
                        "-ar", "24000", "-ac", "1", "-codec:a", "libmp3lame",
                        "-b:a", "96k", str(output)], check=True)


async def build_one(row, apply, repeat_exam):
    turns = parse_turns(row.get("text") or "", preferred_male(row))
    if not turns or any(not KOREAN.search(t) for _, t in turns):
        raise ValueError("Missing Korean dialogue")
    if not apply:
        return "preview"
    target = row["target"]
    target.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="mrlee_voice_") as work:
        work = Path(work)
        parts = []
        if repeat_exam and is_exam(row):
            index = number_of(row)
            intro = work / "intro.mp3"
            await synthesize(f"{index}번", VOICES["female"], intro)
            parts.append((intro, 0.75))
        repeat = 2 if repeat_exam and is_exam(row) else 1
        for loop in range(repeat):
            for i, (speaker, text) in enumerate(turns):
                track = work / f"turn_{loop}_{i}.mp3"
                await synthesize(text, VOICES[speaker], track)
                parts.append((track, 0.55 if i < len(turns)-1 else (1.5 if loop < repeat-1 else 0)))
        candidate = work / "candidate.mp3"
        concat(parts, candidate, 1.5)
        if candidate.stat().st_size < 1000:
            raise RuntimeError("Candidate MP3 too small")
        # ffprobe catches empty/corrupt streams before touching live files.
        subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "default=noprint_wrappers=1:nokey=1", str(candidate)],
                       check=True, stdout=subprocess.DEVNULL)
        staging = target.with_suffix(".mrlee-new.mp3")
        shutil.copyfile(candidate, staging)
        os.replace(staging, target)
    return "replaced"


async def run_build(args):
    if args.apply and not shutil.which("ffmpeg"):
        raise SystemExit("ffmpeg is required for audio generation")
    if args.apply and not shutil.which("ffprobe"):
        raise SystemExit("ffprobe is required for audio validation")
    rows = list(entries(args.section))
    if args.limit:
        rows = rows[:args.limit]
    print(f"Selected {len(rows)} files; apply={args.apply}; exam_repeat={not args.no_exam_repeat}")
    if not args.apply:
        for row in rows[:8]:
            print(row["file"], parse_turns(row.get("text") or "", preferred_male(row)))
        print("DRY RUN: no audio files changed. Add --apply to regenerate.")
        return
    if not args.confirm_replace:
        raise SystemExit("Specify --confirm-replace after backing up MP3 files")
    failed = 0
    for i, row in enumerate(rows, 1):
        try:
            await build_one(row, True, not args.no_exam_repeat)
            print(f"[{i}/{len(rows)}] OK {row['file']}", flush=True)
        except Exception as exc:
            failed += 1
            print(f"[{i}/{len(rows)}] FAILED {row['file']}: {exc}", flush=True)
    if failed:
        raise SystemExit(f"{failed} file(s) failed; successful replacements retained")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["audit", "build"])
    parser.add_argument("--section", help="e.g. 03_TOPIK or 01_HOC_TIENG_HAN")
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--confirm-replace", action="store_true")
    parser.add_argument("--no-exam-repeat", action="store_true")
    args = parser.parse_args()
    if args.command == "audit":
        raise SystemExit(audit(args.section))
    asyncio.run(run_build(args))


if __name__ == "__main__":
    main()
