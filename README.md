# Bot Project Structure

This project has three services:

- `api/`: Express API (OAuth + player data)
- `web/`: website frontend
- `bot/`: Discord bot client

## Prerequisites

- Node.js 18+
- npm

## Local Development

### 1) API

```bash
cd api
npm install
npm start
```

Create `api/.env` from `api/.env.example`.

Key API env vars:

- `HOST` (default `0.0.0.0`)
- `PORT` (default `3000`)
- `ALLOWED_ORIGIN` (local: `http://localhost:5173`)
- `WEB_BASE_URL` (local: `http://localhost:5173`)
- `WEB_PLAY_PATH` (local: `/play`)
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_REDIRECT_URI` (local: `http://localhost:3000/auth/discord/callback`)

Optional hardening env vars:

- `ENABLE_REQUEST_LOGS=true`
- `RATE_LIMIT_WINDOW_MS=10000`
- `RATE_LIMIT_MAX_REQUESTS_PER_IP=120`
- `RATE_LIMIT_MAX_ACTIONS_PER_USER=8`

### 2) Website

```bash
cd web
npm install
npm start
```

Create `web/.env` from `web/.env.example`.

Key web env vars:

- `HOST` (default `0.0.0.0`)
- `PORT` (default `5173`)
- `API_BASE_URL` (local: `http://localhost:3000`)

### 3) Discord Bot

```bash
cd bot
npm install
npm start
```

Create `bot/.env` from `bot/.env.example`.

Required bot env vars:

- `DISCORD_TOKEN`
- `DISCORD_CLIENT_ID`
- `API_BASE_URL` (usually `http://localhost:3000`)

## Production Flow (Current Working Setup)

Frontend is hosted on GitHub Pages and API is hosted on Render.

- Website: `https://pimpbrisket.github.io/pimpbrisket/`
- API: `https://pimpbrisket.onrender.com`

### Render API env values

- `ALLOWED_ORIGIN=https://pimpbrisket.github.io`
- `WEB_BASE_URL=https://pimpbrisket.github.io/pimpbrisket`
- `WEB_PLAY_PATH=/play.html`
- `DISCORD_REDIRECT_URI=https://pimpbrisket.onrender.com/auth/discord/callback`
- `DISCORD_CLIENT_ID=<set>`
- `DISCORD_CLIENT_SECRET=<set>`

### Discord Developer Portal

Add redirect URI:

- `https://pimpbrisket.onrender.com/auth/discord/callback`

## Deploy Website To GitHub Pages

Run from repo root:

```bash
git add .
git commit -m "Update site"
git push origin main
git branch -D gh-pages
git subtree split --prefix=web/public -b gh-pages
git push -u origin gh-pages --force
```

GitHub repo settings:

1. `Settings`
2. `Pages`
3. Source: `Deploy from a branch`
4. Branch: `gh-pages` and folder `/ (root)`

## API Quick Test

- `https://pimpbrisket.onrender.com/health`

Expected response shape:

```json
{"ok":true,"timestamp":"...","uptimeSec":123,"db":{"ok":true}}
```

## App Flow

1. User opens website and clicks Discord login.
2. Website sends user to API `/auth/discord/login`.
3. API completes OAuth, registers user, redirects to website `play.html`.
4. Web and bot both call the same API actions (`dig`, `fish`, `hunt`) and share cooldowns.

