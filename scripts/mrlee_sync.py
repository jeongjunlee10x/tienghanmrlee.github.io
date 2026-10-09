#!/usr/bin/env python3
"""One-way, idempotent sync of Firebase Auth/Firestore to private Supabase admin tables.

Runs only on a trusted backend (GitHub Actions). Never embed service credentials in HTML.
Firebase remains the system of record. Client-side quiz marks are NOT official marks.
"""
from __future__ import annotations

import base64
import json
import logging
import os
import sys
import time
from datetime import datetime, timedelta, timezone
from typing import Any
from urllib.parse import quote
from zoneinfo import ZoneInfo

import requests

LOG = logging.getLogger("mrlee.sync")
PROJECT_ID = "tieng-han-mr-lee"
SUPABASE_PROJECT_ID = "pkxqsboyotlyoizzxizb"
PAGE_SIZE = 500
BATCH_SIZE = 75
LOCAL_TZ = ZoneInfo("Asia/Ho_Chi_Minh")


class SyncError(Exception):
    pass


def required(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise SyncError(f"Missing required GitHub Actions secret/environment variable: {name}")
    return value


def date_time(value: Any) -> datetime | None:
    """Handle Firebase timestamps, ISO strings, and datetimes; return aware UTC."""
    if value is None:
        return None
    if isinstance(value, datetime):
        result = value
    elif isinstance(value, str):
        try:
            result = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return None
    else:
        return None
    if result.tzinfo is None:
        result = result.replace(tzinfo=timezone.utc)
    return result.astimezone(timezone.utc)


def iso(value: Any) -> str | None:
    timestamp = date_time(value)
    return timestamp.isoformat(timespec="seconds") if timestamp else None


def auth_timestamp(value: Any) -> datetime | None:
    """Firebase auth user metadata uses milliseconds since epoch in SDK."""
    if value in (None, 0, ""):
        return None
    if isinstance(value, (int, float)):
        return datetime.fromtimestamp(float(value) / 1000, tz=timezone.utc)
    return date_time(value)


def clip(value: Any, length: int) -> str:
    return str(value or "").strip()[:length]


def maybe_level(data: dict[str, Any]) -> str | None:
    level = str(data.get("level", "")).lower()
    if level == "sc1":
        return "Sơ cấp 1"
    if level == "sc2":
        return "Sơ cấp 2"
    if level in ("topik i", "topik1"):
        return "TOPIK I"
    if level in ("topik ii", "topik2"):
        return "TOPIK II"
    return None


def sort_latest(*timestamps: Any) -> datetime | None:
    valid = [dt for dt in map(date_time, timestamps) if dt is not None]
    return max(valid) if valid else None


class SupabaseRest:
    def __init__(self, base: str, secret: str, session: requests.Session | None = None) -> None:
        base = base.rstrip("/")
        if base != f"https://{SUPABASE_PROJECT_ID}.supabase.co":
            raise SyncError("SUPABASE_URL does not match the verified Mr Lee admin project.")
        if secret.startswith("sb_publishable_"):
            raise SyncError("Never use a publishable/anon key for server synchronization.")
        if not (secret.startswith("sb_secret_") or secret.count(".") == 2):
            raise SyncError("SUPABASE_SECRET_KEY must be a backend sb_secret_ key (or legacy service_role JWT).")
        if secret.count(".") == 2:
            try:
                raw = secret.split(".")[1]
                payload = json.loads(base64.urlsafe_b64decode(raw + "=" * (-len(raw) % 4)))
            except (ValueError, json.JSONDecodeError):
                raise SyncError("Legacy Supabase key JWT is malformed") from None
            if payload.get("role") != "service_role":
                raise SyncError("Wrong Supabase key: legacy JWT is not a service_role key")
        self.base = f"{base}/rest/v1"
        self.http = session or requests.Session()
        # New sb_secret_ keys are not JWTs: send via apikey, not Authorization: Bearer.
        self.headers = {
            "apikey": secret,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        if secret.count(".") == 2:
            self.headers["Authorization"] = f"Bearer {secret}"

    def request(self, method: str, table: str, *, params: dict[str, Any] | None = None,
                rows: list[dict[str, Any]] | dict[str, Any] | None = None,
                prefer: str | None = None) -> list[dict[str, Any]]:
        if table not in {"mrlee_students", "mrlee_scores", "mrlee_learning_events", "mrlee_sync_runs"}:
            raise ValueError("Unexpected Supabase table")
        headers = dict(self.headers)
        if prefer:
            headers["Prefer"] = prefer
        url = f"{self.base}/{table}"
        for attempt in range(4):
            try:
                response = self.http.request(
                    method, url, params=params, json=rows, headers=headers, timeout=35
                )
            except requests.RequestException as error:
                if attempt >= 3:
                    raise SyncError(f"Supabase connection failed for table {table}: {type(error).__name__}") from error
                time.sleep(min(2 ** attempt, 8))
                continue
            if response.status_code in (429, 500, 502, 503, 504) and attempt < 3:
                time.sleep(min(2 ** attempt, 8))
                continue
            if not response.ok:
                # Do not print headers or credentials. Restrict error text length.
                raise SyncError(f"Supabase {table} {method} HTTP {response.status_code}: {response.text[:400]}")
            if not response.content:
                return []
            try:
                data = response.json()
            except ValueError:
                return []
            return data if isinstance(data, list) else [data]
        raise SyncError(f"Supabase request failed after retries for table {table}")

    def all_students(self) -> dict[str, dict[str, Any]]:
        result = {}
        offset = 0
        while True:
            records = self.request("GET", "mrlee_students", params={
                "select": "id,firebase_uid,email,last_activity_at,full_name,level",
                "firebase_uid": "not.is.null", "order": "id.asc", "limit": PAGE_SIZE, "offset": offset,
            })
            for row in records:
                result[row["firebase_uid"]] = row
            if len(records) < PAGE_SIZE:
                break
            offset += PAGE_SIZE
        return result

    def last_success(self) -> datetime | None:
        result = self.request("GET", "mrlee_sync_runs", params={
            "select": "finished_at", "status": "eq.success", "order": "finished_at.desc", "limit": 1
        })
        return date_time(result[0]["finished_at"]) if result else None

    def insert_student(self, data: dict[str, Any]) -> dict[str, Any]:
        # Only inserts new records. Manual admin fields are not reset on later sync runs.
        rows = self.request("POST", "mrlee_students", rows=data,
                            prefer="return=representation")
        if len(rows) != 1:
            raise SyncError("Supabase failed to return the newly created student")
        return rows[0]

    def update_student(self, student_id: str, data: dict[str, Any]) -> None:
        if data:
            self.request("PATCH", "mrlee_students", params={"id": f"eq.{student_id}"}, rows=data,
                         prefer="return=minimal")

    def insert_only(self, table: str, rows: list[dict[str, Any]], conflict: str) -> None:
        for start in range(0, len(rows), BATCH_SIZE):
            self.request("POST", table,
                         params={"on_conflict": conflict}, rows=rows[start:start+BATCH_SIZE],
                         prefer="resolution=ignore-duplicates,return=minimal")

    def log_success(self, data: dict[str, Any]) -> None:
        self.request("POST", "mrlee_sync_runs", rows=data, prefer="return=minimal")


def read_firestore_collection(db: Any, uid: str, kind: str, since: datetime | None) -> list[Any]:
    """Read nested Firestore collections; incremental based on serverTimestamp createdAt."""
    from google.cloud.firestore_v1.base_query import FieldFilter
    col = db.collection("users").document(uid).collection(kind)
    if since:
        col = col.where(filter=FieldFilter("createdAt", ">=", since))
    return list(col.stream())


def build_event(uid: str, student_id: str, document: Any) -> tuple[dict[str, Any] | None, datetime | None]:
    src = document.to_dict() or {}
    happened = date_time(src.get("createdAt"))
    if not happened:
        return None, None
    path = f"users/{uid}/learningEvents/{document.id}"
    return {
        "student_id": student_id,
        "firebase_event_id": path,
        "kind": clip(src.get("kind"), 25) or "visit",
        "page": clip(src.get("page"), 110),
        "title": clip(src.get("title"), 200) or "Học tập",
        "detail": clip(src.get("detail"), 200),
        "happened_at": iso(happened),
    }, happened


def build_attempt(uid: str, student_id: str, document: Any) -> tuple[dict[str, Any] | None, datetime | None]:
    src = document.to_dict() or {}
    happened = date_time(src.get("createdAt"))
    if not happened:
        return None, None
    try:
        score, maximum = float(src.get("score")), float(src.get("total"))
    except (TypeError, ValueError):
        LOG.warning("Skipped invalid practice attempt for Firebase uid prefix %.6s", uid)
        return None, None
    if not (0 <= score <= maximum <= 1000 and maximum > 0):
        LOG.warning("Skipped practice attempt with invalid score for uid prefix %.6s", uid)
        return None, None
    title = clip(src.get("examTitle"), 200) or "Bài luyện tập"
    return {
        "student_id": student_id,
        "firebase_attempt_id": f"users/{uid}/practiceAttempts/{document.id}",
        "exam_title": title,
        "score": score,
        "max_score": maximum,
        "exam_date": happened.astimezone(LOCAL_TZ).date().isoformat(),
        "firebase_created_at": iso(happened),
        "source_kind": "firebase_practice",
        "notes": "Điểm luyện tập tự chấm trên trình duyệt; không phải điểm thi chính thức.",
    }, happened


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    start = datetime.now(timezone.utc)
    url = required("SUPABASE_URL")
    secret = required("SUPABASE_SECRET_KEY")
    credentials_raw = required("FIREBASE_SERVICE_ACCOUNT_JSON")
    try:
        service_account = json.loads(credentials_raw)
    except json.JSONDecodeError as err:
        raise SyncError("FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON") from err
    if service_account.get("project_id") != PROJECT_ID or service_account.get("type") != "service_account":
        raise SyncError("Firebase service account belongs to a different project or is invalid")

    from firebase_admin import auth, credentials, firestore, initialize_app
    initialize_app(credentials.Certificate(service_account), {"projectId": PROJECT_ID})
    db = firestore.client()
    sb = SupabaseRest(url, secret)
    students = sb.all_students()
    last_success = sb.last_success()
    # Five-minute overlap makes scheduled retries idempotent and resilient to clock drift.
    since = last_success - timedelta(minutes=5) if last_success else None
    LOG.info("Sync mode: %s", "INCREMENTAL" if since else "INITIAL FULL")

    counts = {"students_seen": 0, "students_created": 0, "events_seen": 0, "attempts_seen": 0}
    for auth_user in auth.list_users().iterate_all():
        uid = auth_user.uid
        counts["students_seen"] += 1
        profile_doc = db.collection("users").document(uid).get()
        profile = profile_doc.to_dict() if profile_doc.exists else {}
        profile = profile or {}
        email = clip(auth_user.email, 254).lower()
        full_name = (clip(profile.get("displayName"), 150) or
                     clip(auth_user.display_name, 150) or
                     clip(email.partition("@")[0], 150) or "Học viên")
        created_at = auth_timestamp(getattr(auth_user.user_metadata, "creation_timestamp", None))
        joined = created_at.astimezone(LOCAL_TZ).date().isoformat() if created_at else start.date().isoformat()
        existing = students.get(uid)
        if existing:
            student_id = existing["id"]
            patch = {"firebase_synced_at": iso(start),
                     "firebase_email_verified": bool(auth_user.email_verified)}
            if existing.get("email") != email:
                patch["email"] = email
            sb.update_student(student_id, patch)
        else:
            row = sb.insert_student({
                "firebase_uid": uid,
                "full_name": full_name,
                "email": email,
                "level": "Khác",  # Not inferred from merely signing up.
                "status": "Đang học",
                "joined_at": joined,
                "firebase_synced_at": iso(start),
                "firebase_email_verified": bool(auth_user.email_verified),
            })
            students[uid] = row
            student_id = row["id"]
            counts["students_created"] += 1

        event_rows: list[dict[str, Any]] = []
        score_rows: list[dict[str, Any]] = []
        timestamps: list[datetime] = []
        detected_level: str | None = None
        for doc in read_firestore_collection(db, uid, "learningEvents", since):
            row, happened = build_event(uid, student_id, doc)
            if row and happened:
                event_rows.append(row)
                timestamps.append(happened)
                if row["page"] == "so-cap-2.html":
                    detected_level = "Sơ cấp 2"
                elif row["page"] == "so-cap-1.html" and not detected_level:
                    detected_level = "Sơ cấp 1"
        for doc in read_firestore_collection(db, uid, "practiceAttempts", since):
            row, happened = build_attempt(uid, student_id, doc)
            if row and happened:
                score_rows.append(row)
                timestamps.append(happened)
                source = doc.to_dict() or {}
                detected_level = maybe_level(source) or detected_level
        if event_rows:
            sb.insert_only("mrlee_learning_events", event_rows, "firebase_event_id")
        if score_rows:
            sb.insert_only("mrlee_scores", score_rows, "firebase_attempt_id")
        counts["events_seen"] += len(event_rows)
        counts["attempts_seen"] += len(score_rows)

        latest = max(timestamps) if timestamps else None
        old_last = date_time(existing.get("last_activity_at")) if existing else None
        patch = {}
        if latest and (not old_last or latest > old_last):
            patch["last_activity_at"] = iso(latest)
        if detected_level:
            patch["firebase_learning_level"] = detected_level
            if not existing or existing.get("level") in ("Khác", ""):
                patch["level"] = detected_level
        if patch:
            sb.update_student(student_id, patch)

    finished = datetime.now(timezone.utc)
    sb.log_success({"status": "success", "started_at": iso(start), "finished_at": iso(finished), **counts})
    LOG.info("Sync success: %s students (%s newly linked), %s activities, %s attempts examined; %.1f seconds",
             counts["students_seen"], counts["students_created"],
             counts["events_seen"], counts["attempts_seen"], (finished - start).total_seconds())
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (SyncError, Exception) as error:
        # Credential contents and individual student documents are never logged.
        LOG.error("Sync stopped: %s", str(error)[:450])
        sys.exit(1)
