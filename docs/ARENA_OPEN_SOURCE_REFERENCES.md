# MR LEE GAME ARENA — Open-source design and rules review (2026-11-06)

This list records public projects reviewed as **technical references**. The MR LEE implementation, CSS, backend and artwork are original, rather than copied from these repositories. Do not import code or assets without checking the license of the exact upstream commit and retaining all required attribution/notices.

| Reference | Project / License | Applicable feature | Decision |
| --- | --- | --- | --- |
| Chess rules | https://github.com/jhlywa/chess.js — BSD-2-Clause | Legal chess moves, FEN, SAN, castling, draw checks | Review rules and compatibility against MR LEE's existing engine. No library source copied. |
| Chess time control | https://www.chess.com/terms/chess-time-controls | Bullet, blitz, rapid and Fischer increment terminology | Implement own server-authoritative presets: 1+0 through 30+0, plus no-clock practice. |
| Xiangqi | https://github.com/maksimKorzh/wukong-xiangqi — MIT | Xiangqi legal-move and evaluation architecture | Review rule categories. Keep MR LEE's existing independent Xiangqi/Cờ Úp engine and a parchment board. No source copied. |
| Ludo | https://github.com/kenrick/ludo.js — MIT | Turn rotation, colored players, move validation | MR LEE maintains an independent deterministic turn engine, with 2–4 seats and a distinctive toy board. No code copied. |
| Estate board game | https://github.com/intrepidcoder/monopoly — MIT | Property-event and turn state machine inspiration | Keep fictional cities, demo-only currency, original 24-cell board, 8/16/24 round modes. Do not use third-party Monopoly trademark or art. |
| General turn-based multiplayer | https://github.com/boardgameio/boardgame.io — MIT | Server-authoritative turn-based state and phase design | Compare room/turn invariants only; use existing Supabase RPC and verified Firebase authentication. No code copied. |

## Implementation boundaries

- **Cờ vua:** separate game-clock balances for both players, Fischer increment after a verified legal move, server adjudicates expiration as time loss. No forced 20-second chess move or auto-play. Bullet, Blitz, Rapid and Untimed match pools are not mixed during quick matching.
- **Tiến Lên:** original felt card table with a server-managed 20-second turn timer and five-second next-hand flow.
- **Bài Màu:** distinctive purple card game and server-owned card turn engine. It is not a chess or Tiến Lên ruleset.
- **Cờ Tướng/Cờ Úp:** independent warm-wood board, original Chinese chess rules and covered-piece variant. Online PvP is not yet server-authoritative and must not be presented as live G play.
- **Cờ Cá Ngựa:** colorful 2–4-seat local/bot mode. Online PvP not yet implemented.
- **Địa Ốc:** local/bot 8-, 16-, or 24-round modes; only demo in-game credits, not the verified G wallet.

## License hygiene

BSD-2-Clause and MIT generally permit reuse subject to their notices and conditions. This project has **not** vendored external engines or images; it uses links for research and original adaptations. If any third-party source is incorporated later, pin its revision, retain the upstream license text and notices, document source files and modifications, and review trademark and asset rights separately.
