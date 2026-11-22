# MR LEE V3 — post-merge CI recovery and bot-room exit safety

2026-11-22. Base: `main` at `007396d8c6b3eaa3afb450577d341d0b630544f6`.

## Evidence from the first production-branch run after global UI PR #85

Four workflows were run only on `push: main` and failed despite 22/22 UI PR checks passing. The new UI style was implemented on 89/89 root pages, and 52/52 Chromium UI checks passed with no horizontal overflow. The failures uncovered stale tests and a room-exit hang:

- `tools/test-arena-v19.mjs`: did not accept current Xiangqi `20261117-xq-board-v2` app and PvP module cache keys.
- `tools/test-arena-v20.mjs`: still expected old Xiangqi `game-room-shell.js` `20261107-approved-v20` instead of released `20261111-xq-pvp-v1`.
- `tools/test-arena-v22.mjs`: still expected older `app.js` cache key, despite approved Xiangqi update.
- `tools/test-arena-game-modes.mjs`: searched for a removed textual invocation `chessDeadline(state)`, not the actual function definition plus call; real server still computes deadline from elapsed time.
- `tools/browser-arena-discovery.mjs`: expected three online games instead of four (includes Xiangqi).
- `tools/browser-game-rooms.mjs`: still marked Xiangqi online=false; all six bot exits now checked to return in 3.5s. The old browser suite could strand mobile Ludo on `#roomLobby` after pressing Exit.
- `tools/check-lesson-typography-browser.mjs`: expected removed old TTS button and 15 direct links. Modern lesson speaking uses one `.mr-lesson-play` MP3/TTS fallback button plus one pronunciation recording/grading control; Workbook now nests 15 actual links in 3 `details` groups.
- `assets/arena/game-room-shell.js`: local bot exit now resets the sandbox iframe synchronously; PvP exit still posts leave to the server-authoritative embedded board and waits for approval. No G escrow or player data touched.

## Protective workflow changes

`mrlee-arena-social-qa.yml`, `mrlee-discovery-qa.yml`, `mrlee-game-rooms-qa.yml`, and `mrlee-lesson-typography.yml` now have `pull_request` gates. They also run whenever shared V3 CSS/runtime changes, so global interface upgrades cannot bypass UI/game/lesson checks.

## Merge gates

- Four previously failing workflows must pass on the *same final head commit*.
- CI must cover 18 bot room variations (6 games × 3 layouts), friends/public tables, gameplay timers, and the three Korean lesson samples × Fresh/Future × desktop/mobile.
- Do not change game rules, item balances, student points, MP3, Korean course content or Firebase/Supabase.
- Keep PR separate, 0 file removals, no production merge until verified. Following merge, check `main` runs and Cloudflare deployment separately.
