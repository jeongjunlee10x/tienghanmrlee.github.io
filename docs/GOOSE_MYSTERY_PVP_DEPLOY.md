# GOOSE MYSTERY — Server-authoritative PvP

This is a new independently implemented social deduction game. It does **not** use Goose Goose Duck source, characters or commercial assets.

## Components
- `game-goose-pvp.html` — dedicated lobby/game/voting UI; responsive desktop/mobile.
- `assets/arena/goose-pvp.js` — Firebase email-verified authenticated client, polling and validated actions.
- `supabase/functions/mrlee-goose-pvp/index.ts` — server-only Firebase JWT verification, room API and atomic DB mutations.
- `supabase/functions/mrlee-goose-pvp/engine.mjs` — original server rules with no privileged dependencies.
- `supabase/manual-sql/MRLEE_GOOSE_PVP_SETUP.sql` — separate RLS-locked Postgres table and CAS function.
- `tools/test-goose-pvp.mjs` — offline game-rules regression tests.
- `game-goose-mystery.html` — previous solo+bot mode; remains untouched.

## Release steps (explicit approval required)
1. Back up the live Supabase database. Review `MRLEE_GOOSE_PVP_SETUP.sql`. Run this SQL **once** using Supabase SQL Editor for project `pkxqsboyotlyoizzxizb`. Do **not** rerun any legacy schema initialization.
2. Deploy only this new Edge Function. Either use the manual **MR LEE Goose PvP - Manual Edge Function Deploy** GitHub Action after configuring the repository secret `SUPABASE_ACCESS_TOKEN` and approving the `goose-pvp-production` environment, OR run:
   ```sh
   supabase functions deploy mrlee-goose-pvp --project-ref pkxqsboyotlyoizzxizb --no-verify-jwt
   ```
   The `--no-verify-jwt` platform setting is required here because clients send **Firebase** ID tokens instead of Supabase-issued tokens. The function's `userId()` handler **does verify** Firebase RS256 signatures using Google JWKS, project audience, issuer and `email_verified` before any room action.
3. Open `https://pkxqsboyotlyoizzxizb.supabase.co/functions/v1/mrlee-goose-pvp?action=health`; it must return `{"ok":true,...}`.
4. Test two browsers and then 4+ distinct verified accounts on `https://mrlee-b6a.pages.dev/game-goose-pvp.html`: create, join code, ready, start, movement, task, kill, report, chat, vote, victory, leave and rematch. Check mobile and network disconnections.
5. Only then label the PvP mode publicly released. Until deployment, the page reports server offline; the solo game remains usable.

## Security and fairness
- No G virtual gold, no academic scores, no payouts or money transactions.
- Database table has no client RLS policies and no direct anon/authenticated access.
- Firebase ID tokens stay in Authorization headers; service-role token is **only on the server**.
- Per-player snapshots omit other players' roles and Firebase UIDs until the match has finished.
- Client submits `dx,dy`, not coordinates. Server caps movement speed, checks wall collision, task proximity, kill proximity/cooldown, voting eligibility and phase deadlines.
- SQL compare-and-swap under row lock enforces atomic updates with retry across concurrent requests.
- Meeting chat only while alive and in meeting, limited to 160 chars and rate-limited.
- Random role assignment uses crypto RNG on the Edge.
- The Supabase Edge gateway JWT check is disabled **only for mrlee-goose-pvp**, with mandatory in-function Firebase JWT validation. No service-role keys are committed.

## Operating limitations
- This implementation uses short polling + CAS, not WebSocket push. 16 concurrent players should be **load-tested** against actual Supabase limits before advertising high-capacity games. Real-time responsiveness depends on network latency and Edge quotas.
- A disconnected player may remain in the room until leaving or expiry. There is no voice chat, automatic reconnect to a different identity, moderation queue, spectator system or anti-bot attestation.
- The function and SQL are intentionally not auto-deployed by normal website pushes, because the database must be prepared first.
- This code does not assert successful production operation without a live 4-account end-to-end test.

## API actions
- `GET ?action=health` (unauthenticated readiness), `GET ?action=list` / `GET ?action=status&code=...` (Firebase required).
- `POST ?action=create|quick|join|ready|start|lock|leave|rematch` for the lobby.
- `POST ?action=move|task|answer|kill|report|emergency|vote|chat` during gameplay.
- All non-health operations require an email-verified Firebase ID token, and all room operations require membership.
