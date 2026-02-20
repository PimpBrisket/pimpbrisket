# Bot + API + Website

This repo has 3 services:

- `api/` - Express API (OAuth, player data, cooldowns, rewards)
- `web/` - Website UI (`index.html`, `play.html`)
- `bot/` - Discord slash command bot

## What Is Synced

The bot and website both use the same API and same database.

- Actions: `dig`, `fish`, `hunt`
- Shared cooldowns
- Shared wallet, level, XP, trophies
- Same reward labels:
  - Dig bonus: `Gold Coin`, `Da Bone`, `Collectors Greed`
  - Fish trophy: `Midnight Ocean`
  - Hunt trophy: `Many Heads`

## Bot Commands

- `/start` - create account
- `/profile` - show profile
- `/wallet` - show wallet
- `/play` - get website URL
- `/dig` `/fish` `/hunt` - play minigame in Discord
- `/loottable action:<dig|fish|hunt>` - show drop chances

`/loottable` footer confirms bot cash bonus: bot commands yield 5% more cash.

## Local Setup

## 1) API

```bash
cd api
npm install
npm start
```

Copy `api/.env.example` to `api/.env` and fill values.

Required:

- `DATABASE_URL` (Postgres)
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_REDIRECT_URI`

Useful:

- `ALLOWED_ORIGIN` (example: `http://localhost:5173`)
- `WEB_BASE_URL` (example: `http://localhost:5173`)
- `WEB_PLAY_PATH` (local: `/play`)
- `DEV_OWNER_DISCORD_USER_ID`

## 2) Website

```bash
cd web
npm install
npm start
```

Copy `web/.env.example` to `web/.env`.

## 3) Bot

```bash
cd bot
npm install
npm start
```

Copy `bot/.env.example` to `bot/.env`.

Required:

- `DISCORD_TOKEN`
- `DISCORD_CLIENT_ID`
- `API_BASE_URL`

Optional:

- `WEB_PLAY_URL` (fallback for `/play`)

## Production (GitHub Pages + Render)

- Website (GitHub Pages): `https://pimpbrisket.github.io/pimpbrisket/`
- API (Render): `https://pimpbrisket.onrender.com`

Recommended API env (Render):

- `DATABASE_URL=<Render Postgres URL>`
- `ALLOWED_ORIGIN=https://pimpbrisket.github.io`
- `WEB_BASE_URL=https://pimpbrisket.github.io/pimpbrisket`
- `WEB_PLAY_PATH=/play.html`
- `PUBLIC_API_BASE_URL=https://pimpbrisket.onrender.com`
- `DISCORD_REDIRECT_URI=https://pimpbrisket.onrender.com/auth/discord/callback`
- `DISCORD_CLIENT_ID=<set>`
- `DISCORD_CLIENT_SECRET=<set>`

Discord Developer Portal redirect URI:

- `https://pimpbrisket.onrender.com/auth/discord/callback`

## Deploy Website (gh-pages)

From repo root:

```bash
git add .
git commit -m "Update site"
git push origin main
git branch -D gh-pages
git subtree split --prefix=web/public -b gh-pages
git push -u origin gh-pages --force
```

If `git` is not on PATH in terminal:

```bash
"C:\Program Files\Git\cmd\git.exe" add .
"C:\Program Files\Git\cmd\git.exe" commit -m "Update site"
"C:\Program Files\Git\cmd\git.exe" push origin main
"C:\Program Files\Git\cmd\git.exe" branch -D gh-pages
"C:\Program Files\Git\cmd\git.exe" subtree split --prefix=web/public -b gh-pages
"C:\Program Files\Git\cmd\git.exe" push -u origin gh-pages --force
```

## Health Check

- `https://pimpbrisket.onrender.com/health`

Expected shape:

```json
{"ok":true,"timestamp":"...","uptimeSec":123,"db":{"ok":true}}
```
