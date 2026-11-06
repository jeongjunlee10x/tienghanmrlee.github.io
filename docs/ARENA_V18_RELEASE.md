# MR LEE GAME ARENA V18 — release notes

**Date:** 2026-11-07 (ICT)  
**Source:** GitHub `main`; Cloudflare Pages production branch `main`.  
**Scope:** original local bot games, room interfaces, animation/touch interaction and static browser assets.

## Shipped

| Game | Changes |
| --- | --- |
| Cờ Vua | Bot AI runs in a module Web Worker to avoid blocking the board; existing three levels, clock presets, promotions, undo and legal move validation remain. Worker cancellation on exit/restart, legal-move check on reply and timed safe fallback. |
| Cờ Tướng / Cờ Úp | Independent module AI worker, easy/normal/hard tactics; Cờ Úp hidden-piece variant retained. |
| Tiến Lên | Fixed a concrete drag bug: real card IDs are strings such as `3-0`; no conversion to `Number`. CSS now permits pointer hit-testing over the central pile that previously had `pointer-events:none`. Both local bot and PvP gesture paths corrected. Bot AI easy/normal/hard. |
| Bài Màu | Three distinct legal bot strategies, including stronger choice of counter cards and preservation of special cards. |
| Cờ Cá Ngựa | Three bot modes using legal next-move scoring (release, capture, endgame and exposure), retaining 2/3/4 participants. |
| Địa Ốc | Three bot modes with property purchases, cash reserves and rent-yield-driven upgrades, retaining 8/16/24 round lengths. |
| All six | Independent responsive game look via `assets/arena/game-ux-v18.css`, accessible AI selectors, locally persisted UI difficulty, preserved mouse/touch drag, reduced-motion styling. Removed stale/unreachable three-ticket limit from local bot logic. |

## Safety / limits

- **Only Cờ Vua, Tiến Lên and Bài Màu have server-authoritative real PvP rooms.** Do not present Cờ Tướng, Cờ Cá Ngựa or Địa Ốc as live G games until their server-side engines and wallet settlements are developed and verified.
- This release intentionally does **not** change the Supabase Edge Function, verified wallet, G exchange rate, settlement, Firebase authentication or Cloudflare settings.
- Demo-gold and local EXP are not official learning points or PvP G.
- Static Cloudflare export copies `.js` and `.css` assets from `assets/arena`, so both worker files are included. Node test files and docs are excluded from public output.
- Public Cloudflare deployment and actual user-device interaction are **not automatically confirmed** by GitHub commits. Confirm the latest Production commit and test desktop/Android/iOS if needed.

## QA performed / added

- Executed 45 in-memory checks covering legal chess and Xiangqi responses, two variants of Cờ Tướng, Ludo 2–4 players, Estate 8/16/24 rounds, and easy/normal/hard decisions in local card/board engines.
- Executed sample complete game simulations: Tiến Lên, Bài Màu, two-player Cờ Cá Ngựa and eight-round Địa Ốc; each reached a winner within a bounded number of turns.
- Checked JavaScript syntax and the root HTML/css/module dependency paths; verified CSS brace balance and that the new AI controls are present.
- Added `tools/test-arena-v18.mjs` and CI workflow checks to ensure future releases detect regressions.
- Chromium UI tests are included in CI but their successful execution has not been verified from this chat.

## How to test manually

1. Open a standalone game page in a fresh tab; use hard reload if old assets are cached.
2. Choose Đấu với máy, verify the board renders and a new game can restart repeatedly.
3. Switch AI levels, move by click and by drag, confirm no illegal move can execute.
4. On mobile, check that the board remains inside the viewport, the hand is readable and cards can be dropped on the center.
5. For the three online games, use two separate authenticated accounts and check correct seat updates, timer and G settlement.
