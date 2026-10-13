-- MRLEE stage D1: one grading attempt per verified Firebase UID / exam / VN day.
-- Run in Cloudflare D1 database Console, not in Firestore and not in a public website.
CREATE TABLE IF NOT EXISTS topik_attempts (
  uid TEXT NOT NULL,
  level TEXT NOT NULL CHECK(level IN ('I','II')),
  exam INTEGER NOT NULL,
  day_vn TEXT NOT NULL,
  answers_sha256 TEXT NOT NULL,
  result_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY(uid, level, exam, day_vn)
);
