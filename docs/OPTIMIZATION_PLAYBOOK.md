# Optimization Playbook

Last updated: 2026-02-21

## Purpose

This file is the handoff anchor for future agents with zero prior context.
If you optimize or change performance behavior, update this file in the same commit.

## Architecture (Performance-Relevant)

- `api/`: Express + Postgres (`pg`) on Render.
- `web/`: Static UI + tiny Express config/static server.
- `bot/`: Discord client that calls `api/`.
- Main user latency path: browser -> Render API -> Render Postgres.

## Implemented Optimizations

### 1) Lightweight profile sync endpoint

- File: `api/src/database.js`
  - Added `PLAYER_SYNC_SELECT_SQL`.
  - Added `getPlayerSyncByDiscordId(...)` for a reduced-column query.
- File: `api/src/server.js`
  - Added `toSyncPlayer(...)`.
  - Added `GET /players/:discordUserId/sync`.
  - Supports `?since=<updatedAtMs>` and returns `204` when unchanged.

Why: avoids rebuilding/sending full profile payload for every periodic poll.

### 2) Frontend switched to delta sync polling

- File: `web/public/play.js`
  - Added `loadProfileSync()` and `applyPlayerSyncSnapshot(...)`.
  - Profile interval now prefers `/players/:id/sync` and falls back to full profile only when detail panels are open.
  - Added in-flight guards (`profileSyncInFlight`, `loadProfileInFlight`) to reduce overlap/race churn.

Why: reduces network payload, API CPU, DB pressure, and DOM churn.

### 3) Reduced hidden-panel rendering work

- File: `web/public/play.js`
  - `applyPlayerSnapshot(...)` now only renders profile/trophy panel content when those panels are visible.

Why: avoids expensive DOM work during normal action gameplay.

### 4) Database pool tuning via env

- File: `api/src/database.js`
  - Added env-controlled pool knobs:
    - `DB_POOL_MAX`
    - `DB_POOL_IDLE_TIMEOUT_MS`
    - `DB_POOL_CONNECTION_TIMEOUT_MS`
- File: `api/.env.example`
  - Added template entries for the above.

Why: lets you tune connection behavior for Render/Postgres limits.

### 5) Static asset cache policy

- File: `web/src/server.js`
  - Added cache headers by file type:
    - HTML: `no-store`
    - JS/CSS: `max-age=300`
    - images/fonts: `max-age=86400`
  - Disabled `x-powered-by`.

Why: faster repeat loads with low staleness risk.

### 6) Transaction query count reduction (DB hot paths)

- File: `api/src/database.js`
  - Added `hydratePlayerRow(...)` and `getPlayerByDiscordIdForUpdate(...)`.
  - Replaced double-read pattern:
    - Before: `SELECT ... FOR UPDATE` + second `SELECT` for parsed player.
    - Now: single locked read with parsed object.
  - Replaced many `UPDATE + SELECT` pairs with `UPDATE ... RETURNING *` then `hydratePlayerRow(...)`.
  - `grantPendingAchievements(...)` now uses `RETURNING *` (removed extra read when grants occur).

Why: reduces DB round-trips on the highest-frequency routes (`actions`, `gambling`, `daily`, `upgrades`), which lowers latency and DB load.

### 7) Built-in HTTP latency instrumentation (p50/p95/p99)

- File: `api/src/server.js`
  - Added in-memory per-route latency tracker (sampled ring buffers).
  - Tracks: request count, avg, min, p50, p95, p99, max, status class counts.
  - Periodic summary logs enabled via:
    - `METRICS_ENABLED`
    - `METRICS_LOG_INTERVAL_MS`
    - `METRICS_SAMPLE_SIZE`
    - `METRICS_MAX_ROUTES`
  - Health endpoint supports metrics snapshot:
    - `GET /health?metrics=1`
  - Optional exposed endpoints (disabled by default):
    - `GET /metrics/http?limit=30`
    - `POST /metrics/http/reset`
    - controlled by `METRICS_EXPOSE_ENDPOINT=true`.
- File: `api/.env.example`
  - Added all metrics env templates.

Why: gives immediate p50/p95 visibility without adding external tooling.

## Runtime Knobs

### API (`api/.env`)

- `ENABLE_REQUEST_LOGS=false` in production.
- `DB_POOL_MAX=10` (start here).
- `DB_POOL_IDLE_TIMEOUT_MS=30000`.
- `DB_POOL_CONNECTION_TIMEOUT_MS=10000`.
- Keep `RATE_LIMIT_*` realistic for your expected concurrency.

### Web (`web/.env`)

- `API_BASE_URL` must point to your deployed API.

## Guardrails For Future Agents

1. Do not switch polling back to full `GET /players/:id` unless required.
2. If UI needs new live-updating fields, add them to `/players/:id/sync` first.
3. Preserve `?since=` + `204` behavior for unchanged sync requests.
4. Avoid forcing panel renders when those panels are hidden.
5. Keep secrets out git history (`.env` values must never be committed).

## Known Remaining Bottlenecks (Next Highest ROI)

1. Transaction paths in `api/src/database.js` still do repeated read patterns in some flows.
2. Render cold starts/variable network latency still affect first-hit UX.
3. Very large inventory/showcase payloads can still inflate full profile responses.

## Suggested Next Optimizations

1. Add DB-step metrics (query timings inside transactions), not only route-level.
2. Add profile payload field projection flags (request only needed sections).
3. Add periodic synthetic warm check for Render if cold starts are frequent.
4. Persist route metrics to external monitoring (Grafana/Datadog/Render logs parsing).
