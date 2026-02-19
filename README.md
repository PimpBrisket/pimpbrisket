# Bot Project Structure

This project is split into three services:

- `api/`: Express API and the only service allowed to access SQLite
- `bot/`: Discord bot that talks to the API
- `web/`: Landing page for player registration that talks to the API

## Prerequisites

- Node.js 18+
- npm

## 1) Run API

```bash
cd api
npm install
npm start
```

Create `api/.env` from `api/.env.example` before starting.

Default API URL: `http://localhost:3000`

Required API env vars for Discord website login:

- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_REDIRECT_URI` (for local: `http://localhost:3000/auth/discord/callback`)
- `WEB_BASE_URL` (for local: `http://localhost:5173`)

In Discord Developer Portal, add this redirect URI to your application OAuth2 settings:

- `http://localhost:3000/auth/discord/callback`

## 2) Run Website

```bash
cd web
npm install
npm start
```

Create `web/.env` from `web/.env.example` before starting.

Default website URL: `http://localhost:5173`

Set `API_BASE_URL` in `web/.env` if your API is not on port 3000.

## Access From Other Devices (Phone/Tablets)

- Both services now bind to `0.0.0.0` by default, so they can be reached on your local network.
- Open the site from another device using your computer's LAN IP, not `localhost`.
- Example: `http://192.168.1.50:5173`
- If needed, allow Node.js through Windows Firewall for private networks.

## 3) Run Discord Bot

```bash
cd bot
npm install
npm start
```

Create `bot/.env` from `bot/.env.example` before starting.

Required bot env vars:

- `DISCORD_TOKEN`
- `DISCORD_CLIENT_ID`
- `API_BASE_URL` (usually `http://localhost:3000`)

Optional:

- `DISCORD_GUILD_ID` (register slash command instantly in a single guild)

## Registration Flow

1. User clicks `Enter With Discord` on the website.
2. Website redirects to API `/auth/discord/login`.
3. API completes Discord OAuth, registers the user ID in SQLite, then redirects to `/play`.
4. User can run `Dig`, `Fish`, and `Hunt` on web with shared 5-second cooldowns.
5. Bot `/start` also registers the user through API.
6. Bot `/dig`, `/fish`, `/hunt` use the same API actions and same shared cooldowns.
7. Bot `/profile` reads profile data from API and responds with an embed.

## Bot Commands

- `/start`
- `/profile`
- `/wallet`
- `/dig`
- `/fish`
- `/hunt`
"# pimpbrisket" 
"# pimpbrisket" 
"# pimpbrisket" 
