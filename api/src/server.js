require("dotenv").config();

const cors = require("cors");
const crypto = require("crypto");
const express = require("express");
const {
  ACTION_COOLDOWN_MS,
  MAX_LEVEL,
  createDatabase,
  initDatabase,
  getPlayerByDiscordId,
  registerPlayer,
  adjustMoney,
  setPlayerMoneyExact,
  getPlayerDevConfig,
  setPlayerDevConfig,
  resetPlayerDevConfig,
  setDevFreezeMoney,
  setPlayerLevel,
  lockActionCooldown,
  performAction,
  getActionConfig,
  getActionMetadata,
  xpRequiredForLevel,
  levelRewardCoins,
  DAILY_CHALLENGE_INTERACTIONS_REQUIRED,
  buildAchievementProgress,
  buildDailyState,
  buildUpgradeSummary,
  setPlayerTimezone,
  getDailySummary,
  claimDailyReward,
  claimDailyChallengeReward,
  getAchievementSummary,
  settleGamblingResult,
  purchaseUpgrade,
  purchaseUpgradeMax
} = require("./database");

function parsePositiveIntEnv(name, fallback) {
  const rawValue = process.env[name];
  if (rawValue === undefined || rawValue === "") return fallback;

  const parsed = Number(rawValue);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return parsed;
}

function isValidUrl(value) {
  try {
    // eslint-disable-next-line no-new
    new URL(value);
    return true;
  } catch (_err) {
    return false;
  }
}

function validateStartupConfig(config) {
  const errors = [];

  if (!Number.isInteger(config.PORT) || config.PORT <= 0 || config.PORT > 65535) {
    errors.push("PORT must be an integer from 1 to 65535");
  }
  if (!config.HOST || typeof config.HOST !== "string") {
    errors.push("HOST must be a non-empty string");
  }
  if (!config.DATABASE_URL || !isValidUrl(config.DATABASE_URL)) {
    errors.push("DATABASE_URL must be a valid Postgres connection URL");
  }
  if (config.WEB_BASE_URL && !isValidUrl(config.WEB_BASE_URL)) {
    errors.push("WEB_BASE_URL must be a valid URL");
  }
  if (config.DISCORD_REDIRECT_URI && !isValidUrl(config.DISCORD_REDIRECT_URI)) {
    errors.push("DISCORD_REDIRECT_URI must be a valid URL");
  }

  if (errors.length > 0) {
    throw new Error(`Startup config invalid:\n- ${errors.join("\n- ")}`);
  }
}

function getClientIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp.trim()) {
    return realIp.trim();
  }

  const cfIp = req.headers["cf-connecting-ip"];
  if (typeof cfIp === "string" && cfIp.trim()) {
    return cfIp.trim();
  }

  return req.ip || req.socket?.remoteAddress || "unknown";
}

function maybeCleanupLimiterStore(store, now) {
  if (store.size < 5000) return;
  for (const [key, value] of store.entries()) {
    if (value.resetAt <= now) store.delete(key);
  }
}

function createFixedWindowRateLimiter({
  windowMs,
  maxRequests,
  keyFn,
  label
}) {
  const store = new Map();

  return (req, res, next) => {
    const key = keyFn(req);
    if (!key) return next();

    const now = Date.now();
    maybeCleanupLimiterStore(store, now);

    const existing = store.get(key);
    if (!existing || existing.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    existing.count += 1;
    if (existing.count <= maxRequests) return next();

    const retryAfterSec = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    res.set("Retry-After", String(retryAfterSec));
    return res.status(429).json({
      error: `Too many requests for ${label}. Retry in ${retryAfterSec}s.`,
      retryAfterSec
    });
  };
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const DATABASE_URL = process.env.DATABASE_URL || "";
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || "";
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || "";
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || "";
const WEB_BASE_URL = process.env.WEB_BASE_URL || "http://localhost:5173";
const WEB_PLAY_PATH = process.env.WEB_PLAY_PATH || "/play";
const ENABLE_REQUEST_LOGS = process.env.ENABLE_REQUEST_LOGS !== "false";
const RATE_LIMIT_WINDOW_MS = parsePositiveIntEnv("RATE_LIMIT_WINDOW_MS", 10_000);
const RATE_LIMIT_MAX_REQUESTS_PER_IP = parsePositiveIntEnv(
  "RATE_LIMIT_MAX_REQUESTS_PER_IP",
  120
);
const RATE_LIMIT_MAX_ACTIONS_PER_USER = parsePositiveIntEnv(
  "RATE_LIMIT_MAX_ACTIONS_PER_USER",
  8
);
const DEV_OWNER_DISCORD_USER_ID = process.env.DEV_OWNER_DISCORD_USER_ID || "931015893377482854";
const oauthStateStore = new Map();
const actionLockTokenStore = new Map();

validateStartupConfig({
  PORT,
  HOST,
  DATABASE_URL,
  WEB_BASE_URL,
  DISCORD_REDIRECT_URI
});

const db = createDatabase(DATABASE_URL);
const allowedOrigins = ALLOWED_ORIGIN.split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const corsOriginOption =
  allowedOrigins.length === 0 || allowedOrigins.includes("*")
    ? true
    : allowedOrigins;

app.use(cors({ origin: corsOriginOption }));
app.use(express.json({ limit: "1mb" }));

if (ENABLE_REQUEST_LOGS) {
  app.use((req, res, next) => {
    const startedAt = process.hrtime.bigint();

    res.on("finish", () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
      const ip = getClientIp(req);
      console.log(
        `[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(
          1
        )}ms ip=${ip}`
      );
    });

    next();
  });
}

const ipRateLimiter = createFixedWindowRateLimiter({
  windowMs: RATE_LIMIT_WINDOW_MS,
  maxRequests: RATE_LIMIT_MAX_REQUESTS_PER_IP,
  keyFn: (req) => getClientIp(req),
  label: "this IP"
});

const actionUserRateLimiter = createFixedWindowRateLimiter({
  windowMs: RATE_LIMIT_WINDOW_MS,
  maxRequests: RATE_LIMIT_MAX_ACTIONS_PER_USER,
  keyFn: (req) => req.params?.discordUserId || "",
  label: "this user"
});

app.use((req, res, next) => {
  if (req.path === "/health") return next();
  return ipRateLimiter(req, res, next);
});

function isValidDiscordUserId(value) {
  return typeof value === "string" && /^\d{17,20}$/.test(value);
}

function isDevOwnerId(discordUserId) {
  return discordUserId === DEV_OWNER_DISCORD_USER_ID;
}

function getDiscordAvatarUrl(discordUserId, avatarHash) {
  if (avatarHash) {
    return `https://cdn.discordapp.com/avatars/${discordUserId}/${avatarHash}.png?size=128`;
  }

  try {
    const index = Number(BigInt(discordUserId) % 5n);
    return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
  } catch (_err) {
    return "https://cdn.discordapp.com/embed/avatars/0.png";
  }
}

function toPublicPlayer(player) {
  if (!player) return null;

  const level = Math.min(MAX_LEVEL, Math.max(1, Number(player.level) || 1));
  const xp = Math.max(0, Number(player.xp) || 0);
  const xpToNextLevel = level < MAX_LEVEL ? xpRequiredForLevel(level) : 0;
  const nextLevelRewardCoins =
    level < MAX_LEVEL ? levelRewardCoins(level + 1) : 0;
  const digTrophyCount = Number(player.digTrophyCount || 0);
  const fishTrophyCount = Number(player.fishTrophyCount || 0);
  const huntTrophyCount = Number(player.huntTrophyCount || 0);
  const totalTrophies = digTrophyCount + fishTrophyCount + huntTrophyCount;
  const now = Date.now();
  const dailyState = buildDailyState(player, now);
  const achievementState = buildAchievementProgress(player);
  const upgrades = buildUpgradeSummary(player);

  return {
    ...player,
    level,
    xp,
    xpToNextLevel,
    maxLevel: MAX_LEVEL,
    nextLevelRewardCoins,
    totalTrophies,
    trophyCollection: {
      dig: {
        key: "dig_trophy",
        name: "Collectors Greed",
        image: "/assets/dig-trophy.png",
        count: digTrophyCount
      },
      fish: {
        key: "fish_trophy",
        name: "Midnight Ocean",
        image: "/assets/fish-trophy.png",
        count: fishTrophyCount
      },
      hunt: {
        key: "hunt_trophy",
        name: "Many Heads",
        image: "/assets/hunt-trophy.png",
        count: huntTrophyCount
      },
      placeholderImage: "/assets/null_trophy.png"
    },
    timezone: player.timezone || "UTC",
    timezoneConfigured: Boolean(player.timezone),
    daily: {
      now,
      nextResetAt: dailyState.nextResetAt,
      interactionsRequired: DAILY_CHALLENGE_INTERACTIONS_REQUIRED,
      ...dailyState.daily,
      challenge: dailyState.challenge
    },
    achievements: achievementState,
    upgrades,
    dev: {
      freezeMoney: Boolean(player.devConfig?.freezeMoney)
    },
    totalBonusRewards: Number(player.totalBonusRewards || 0),
    totalGamblingWins: Number(player.totalGamblingWins || 0),
    totalGamblingPlays: Number(player.totalGamblingPlays || 0),
    discordAvatarUrl: getDiscordAvatarUrl(
      player.discordUserId,
      player.discordAvatarHash
    )
  };
}

function buildUrl(baseUrl, params = {}) {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

function buildWebUrl(pathname = "/", params = {}) {
  const base = new URL(WEB_BASE_URL);
  const cleanBasePath = base.pathname.replace(/\/+$/, "");
  const cleanPath = `/${String(pathname || "/").replace(/^\/+/, "")}`;
  base.pathname = `${cleanBasePath}${cleanPath}`;
  return buildUrl(base.toString(), params);
}

function getOAuthConfigError() {
  if (!DISCORD_CLIENT_ID) return "Missing DISCORD_CLIENT_ID in api/.env";
  if (!DISCORD_CLIENT_SECRET) return "Missing DISCORD_CLIENT_SECRET in api/.env";
  if (!DISCORD_REDIRECT_URI) return "Missing DISCORD_REDIRECT_URI in api/.env";
  return null;
}

function cleanupOAuthState() {
  const now = Date.now();
  for (const [state, expiresAt] of oauthStateStore.entries()) {
    if (expiresAt <= now) oauthStateStore.delete(state);
  }
}

function cleanupActionLockTokens() {
  const now = Date.now();
  for (const [token, lockEntry] of actionLockTokenStore.entries()) {
    if (lockEntry.expiresAt <= now) actionLockTokenStore.delete(token);
  }
}

async function pingDatabase() {
  try {
    const result = await db.query("SELECT 1 AS ok");
    return { ok: result.rows?.[0]?.ok === 1 };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

app.get("/health", async (_req, res) => {
  const dbStatus = await pingDatabase();
  const payload = {
    ok: dbStatus.ok,
    timestamp: new Date().toISOString(),
    uptimeSec: Math.floor(process.uptime()),
    db: dbStatus.ok ? { ok: true } : dbStatus
  };

  if (!dbStatus.ok) return res.status(503).json(payload);
  return res.json(payload);
});

app.get("/meta/actions", (_req, res) => {
  res.json({
    ...getActionMetadata(),
    levelProgression: {
      maxLevel: MAX_LEVEL
    }
  });
});

app.get("/meta/public", (_req, res) => {
  return res.json({
    apiBaseUrl: process.env.PUBLIC_API_BASE_URL || "",
    webBaseUrl: WEB_BASE_URL,
    webPlayUrl: buildWebUrl(WEB_PLAY_PATH),
    maxLevel: MAX_LEVEL,
    cooldownMs: ACTION_COOLDOWN_MS
  });
});

app.get("/auth/discord/login", (_req, res) => {
  const oauthError = getOAuthConfigError();
  if (oauthError) return res.status(500).json({ error: oauthError });

  cleanupOAuthState();
  const state = crypto.randomBytes(16).toString("hex");
  oauthStateStore.set(state, Date.now() + 10 * 60 * 1000);

  const authUrl = buildUrl("https://discord.com/oauth2/authorize", {
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: DISCORD_REDIRECT_URI,
    response_type: "code",
    scope: "identify",
    state
  });

  return res.redirect(authUrl);
});

app.get("/auth/discord/callback", async (req, res) => {
  try {
    const oauthError = getOAuthConfigError();
    if (oauthError) {
      return res.redirect(buildWebUrl("/", { auth: "error", reason: oauthError }));
    }

    const code = req.query?.code;
    const state = req.query?.state;
    if (typeof code !== "string" || typeof state !== "string") {
      return res.redirect(
        buildWebUrl("/", {
          auth: "error",
          reason: "Missing OAuth code or state"
        })
      );
    }

    cleanupOAuthState();
    const expiresAt = oauthStateStore.get(state);
    if (!expiresAt || expiresAt <= Date.now()) {
      oauthStateStore.delete(state);
      return res.redirect(
        buildWebUrl("/", {
          auth: "error",
          reason: "Invalid or expired OAuth state"
        })
      );
    }
    oauthStateStore.delete(state);

    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: DISCORD_REDIRECT_URI
      })
    });

    const tokenPayload = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenPayload.access_token) {
      return res.redirect(
        buildWebUrl("/", {
          auth: "error",
          reason: "Discord token exchange failed"
        })
      );
    }

    const meResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenPayload.access_token}` }
    });
    const mePayload = await meResponse.json();
    if (!meResponse.ok || !isValidDiscordUserId(mePayload?.id)) {
      return res.redirect(
        buildWebUrl("/", {
          auth: "error",
          reason: "Discord user fetch failed"
        })
      );
    }

    const { player, created } = await registerPlayer(db, mePayload.id, {
      discordUsername: mePayload.username || null,
      discordAvatarHash: mePayload.avatar || null
    });
    return res.redirect(
      buildWebUrl(WEB_PLAY_PATH, {
        auth: "success",
        created: created ? "1" : "0",
        discordUserId: player.discordUserId
      })
    );
  } catch (_err) {
    return res.redirect(
      buildWebUrl("/", {
        auth: "error",
        reason: "Unexpected OAuth error"
      })
    );
  }
});

app.post("/players/register", async (req, res) => {
  try {
    const discordUserId = req.body?.discordUserId;
    const discordUsername =
      typeof req.body?.discordUsername === "string"
        ? req.body.discordUsername.trim().slice(0, 64)
        : null;
    const discordAvatarHash =
      typeof req.body?.discordAvatarHash === "string"
        ? req.body.discordAvatarHash.trim().slice(0, 128)
        : null;

    if (!isValidDiscordUserId(discordUserId)) {
      return res.status(400).json({
        error: "discordUserId must be a Discord snowflake string (17-20 digits)"
      });
    }

    const { player, created } = await registerPlayer(db, discordUserId, {
      discordUsername,
      discordAvatarHash
    });
    return res.status(created ? 201 : 200).json({
      created,
      player: toPublicPlayer(player)
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/dev/:discordUserId/config", async (req, res) => {
  try {
    const discordUserId = req.params.discordUserId;
    if (!isValidDiscordUserId(discordUserId)) {
      return res.status(400).json({
        error: "discordUserId must be a Discord snowflake string (17-20 digits)"
      });
    }
    if (!isDevOwnerId(discordUserId)) {
      return res.status(403).json({ error: "Dev mode is not available for this user" });
    }

    const config = await getPlayerDevConfig(db, discordUserId);
    return res.json({
      ownerDiscordUserId: DEV_OWNER_DISCORD_USER_ID,
      defaults: getActionMetadata(),
      config
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.put("/dev/:discordUserId/config", async (req, res) => {
  try {
    const discordUserId = req.params.discordUserId;
    if (!isValidDiscordUserId(discordUserId)) {
      return res.status(400).json({
        error: "discordUserId must be a Discord snowflake string (17-20 digits)"
      });
    }
    if (!isDevOwnerId(discordUserId)) {
      return res.status(403).json({ error: "Dev mode is not available for this user" });
    }
    const nextConfig = await setPlayerDevConfig(db, discordUserId, req.body?.config || {});
    return res.json({ ok: true, config: nextConfig });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/dev/:discordUserId/reset", async (req, res) => {
  try {
    const discordUserId = req.params.discordUserId;
    if (!isValidDiscordUserId(discordUserId)) {
      return res.status(400).json({
        error: "discordUserId must be a Discord snowflake string (17-20 digits)"
      });
    }
    if (!isDevOwnerId(discordUserId)) {
      return res.status(403).json({ error: "Dev mode is not available for this user" });
    }
    await resetPlayerDevConfig(db, discordUserId);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/dev/:discordUserId/level", async (req, res) => {
  try {
    const discordUserId = req.params.discordUserId;
    if (!isValidDiscordUserId(discordUserId)) {
      return res.status(400).json({
        error: "discordUserId must be a Discord snowflake string (17-20 digits)"
      });
    }
    if (!isDevOwnerId(discordUserId)) {
      return res.status(403).json({ error: "Dev mode is not available for this user" });
    }
    const level = Number(req.body?.level);
    if (!Number.isFinite(level)) {
      return res.status(400).json({ error: "level must be a number" });
    }
    const player = await setPlayerLevel(db, discordUserId, level);
    return res.json({ ok: true, player: toPublicPlayer(player) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/players/:discordUserId", async (req, res) => {
  try {
    const discordUserId = req.params.discordUserId;
    if (!isValidDiscordUserId(discordUserId)) {
      return res.status(400).json({
        error: "discordUserId must be a Discord snowflake string (17-20 digits)"
      });
    }

    const player = await getPlayerByDiscordId(db, discordUserId);
    if (!player) return res.status(404).json({ error: "Player not found" });

    return res.json(toPublicPlayer(player));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/dev/:discordUserId/money", async (req, res) => {
  try {
    const discordUserId = req.params.discordUserId;
    if (!isValidDiscordUserId(discordUserId)) {
      return res.status(400).json({
        error: "discordUserId must be a Discord snowflake string (17-20 digits)"
      });
    }
    if (!isDevOwnerId(discordUserId)) {
      return res.status(403).json({ error: "Dev mode is not available for this user" });
    }

    const money = Number(req.body?.money);
    if (!Number.isFinite(money)) {
      return res.status(400).json({ error: "money must be a number" });
    }

    const player = await setPlayerMoneyExact(db, discordUserId, money);
    return res.json({ ok: true, player: toPublicPlayer(player) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.put("/dev/:discordUserId/freeze-money", async (req, res) => {
  try {
    const discordUserId = req.params.discordUserId;
    if (!isValidDiscordUserId(discordUserId)) {
      return res.status(400).json({
        error: "discordUserId must be a Discord snowflake string (17-20 digits)"
      });
    }
    if (!isDevOwnerId(discordUserId)) {
      return res.status(403).json({ error: "Dev mode is not available for this user" });
    }

    const enabled = req.body?.enabled === true;
    const config = await setDevFreezeMoney(db, discordUserId, enabled);
    const player = await getPlayerByDiscordId(db, discordUserId);
    return res.json({
      ok: true,
      config,
      player: toPublicPlayer(player)
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.put("/players/:discordUserId/timezone", async (req, res) => {
  try {
    const discordUserId = req.params.discordUserId;
    const timezone = req.body?.timezone;
    if (!isValidDiscordUserId(discordUserId)) {
      return res.status(400).json({
        error: "discordUserId must be a Discord snowflake string (17-20 digits)"
      });
    }
    if (typeof timezone !== "string" || !timezone.trim()) {
      return res.status(400).json({ error: "timezone is required" });
    }

    const player = await setPlayerTimezone(db, discordUserId, timezone);
    return res.json({ ok: true, player: toPublicPlayer(player) });
  } catch (err) {
    if (typeof err.message === "string" && err.message.includes("Timezone already set")) {
      return res.status(409).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
});

app.get("/players/:discordUserId/daily", async (req, res) => {
  try {
    const discordUserId = req.params.discordUserId;
    if (!isValidDiscordUserId(discordUserId)) {
      return res.status(400).json({
        error: "discordUserId must be a Discord snowflake string (17-20 digits)"
      });
    }

    const summary = await getDailySummary(db, discordUserId);
    if (!summary) return res.status(404).json({ error: "Player not found" });
    return res.json(summary);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/players/:discordUserId/daily/claim", async (req, res) => {
  try {
    const discordUserId = req.params.discordUserId;
    if (!isValidDiscordUserId(discordUserId)) {
      return res.status(400).json({
        error: "discordUserId must be a Discord snowflake string (17-20 digits)"
      });
    }

    const result = await claimDailyReward(db, discordUserId);
    if (!result.ok) {
      return res.status(409).json({
        error: result.reason || "Daily reward is not ready",
        state: result.state,
        player: toPublicPlayer(result.player)
      });
    }

    return res.json({
      ok: true,
      rewardCoins: result.rewardCoins,
      achievementCoins: result.achievementCoins,
      state: result.state,
      player: toPublicPlayer(result.player)
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/players/:discordUserId/daily/challenge/claim", async (req, res) => {
  try {
    const discordUserId = req.params.discordUserId;
    if (!isValidDiscordUserId(discordUserId)) {
      return res.status(400).json({
        error: "discordUserId must be a Discord snowflake string (17-20 digits)"
      });
    }

    const result = await claimDailyChallengeReward(db, discordUserId);
    if (!result.ok) {
      return res.status(409).json({
        error: result.reason || "Daily challenge is not ready",
        state: result.state,
        player: toPublicPlayer(result.player)
      });
    }

    return res.json({
      ok: true,
      rewardCoins: result.rewardCoins,
      achievementCoins: result.achievementCoins,
      state: result.state,
      player: toPublicPlayer(result.player)
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/players/:discordUserId/achievements", async (req, res) => {
  try {
    const discordUserId = req.params.discordUserId;
    if (!isValidDiscordUserId(discordUserId)) {
      return res.status(400).json({
        error: "discordUserId must be a Discord snowflake string (17-20 digits)"
      });
    }

    const summary = await getAchievementSummary(db, discordUserId);
    if (!summary) return res.status(404).json({ error: "Player not found" });
    return res.json(summary);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/players/:discordUserId/gambling/settle", async (req, res) => {
  try {
    const discordUserId = req.params.discordUserId;
    const game = req.body?.game;
    const coinDelta = req.body?.coinDelta;
    const won = req.body?.won === true;
    if (!isValidDiscordUserId(discordUserId)) {
      return res.status(400).json({
        error: "discordUserId must be a Discord snowflake string (17-20 digits)"
      });
    }
    if (typeof game !== "string") {
      return res.status(400).json({ error: "game is required" });
    }
    if (!Number.isInteger(coinDelta)) {
      return res.status(400).json({ error: "coinDelta must be an integer" });
    }

    const result = await settleGamblingResult(db, discordUserId, {
      game,
      coinDelta,
      won,
      countInteraction: true
    });

    if (!result.ok) {
      return res.status(409).json({
        error: result.error || "Could not settle gambling result",
        player: toPublicPlayer(result.player)
      });
    }

    return res.json({
      ok: true,
      achievementCoins: result.achievementCoins || 0,
      player: toPublicPlayer(result.player)
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/players/:discordUserId/upgrades", async (req, res) => {
  try {
    const discordUserId = req.params.discordUserId;
    if (!isValidDiscordUserId(discordUserId)) {
      return res.status(400).json({
        error: "discordUserId must be a Discord snowflake string (17-20 digits)"
      });
    }

    const player = await getPlayerByDiscordId(db, discordUserId);
    if (!player) return res.status(404).json({ error: "Player not found" });
    return res.json({
      upgrades: buildUpgradeSummary(player),
      player: toPublicPlayer(player)
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/players/:discordUserId/upgrades/:action/:upgradeKey", async (req, res) => {
  try {
    const discordUserId = req.params.discordUserId;
    const action = req.params.action;
    const upgradeKey = req.params.upgradeKey;
    if (!isValidDiscordUserId(discordUserId)) {
      return res.status(400).json({
        error: "discordUserId must be a Discord snowflake string (17-20 digits)"
      });
    }

    const result = await purchaseUpgrade(db, discordUserId, action, upgradeKey);
    if (!result.ok) {
      return res.status(409).json({
        error: result.error || "Not enough coins",
        cost: result.cost,
        player: toPublicPlayer(result.player),
        upgrades: buildUpgradeSummary(result.player)
      });
    }

    return res.json({
      ok: true,
      cost: result.cost,
      purchasedLevels: result.purchasedLevels || 1,
      achievementCoins: result.achievementCoins || 0,
      upgrades: result.upgrades,
      player: toPublicPlayer(result.player)
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/players/:discordUserId/upgrades/:action/:upgradeKey/max", async (req, res) => {
  try {
    const discordUserId = req.params.discordUserId;
    const action = req.params.action;
    const upgradeKey = req.params.upgradeKey;
    if (!isValidDiscordUserId(discordUserId)) {
      return res.status(400).json({
        error: "discordUserId must be a Discord snowflake string (17-20 digits)"
      });
    }

    const result = await purchaseUpgradeMax(db, discordUserId, action, upgradeKey);
    if (!result.ok) {
      return res.status(409).json({
        error: result.error || "Could not buy max upgrades",
        cost: result.cost,
        purchasedLevels: result.purchasedLevels || 0,
        player: toPublicPlayer(result.player),
        upgrades: buildUpgradeSummary(result.player)
      });
    }

    return res.json({
      ok: true,
      cost: result.cost,
      purchasedLevels: result.purchasedLevels,
      achievementCoins: result.achievementCoins || 0,
      upgrades: result.upgrades,
      player: toPublicPlayer(result.player)
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.patch("/players/:discordUserId/money", async (req, res) => {
  try {
    const discordUserId = req.params.discordUserId;
    const amount = req.body?.amount;

    if (!isValidDiscordUserId(discordUserId)) {
      return res.status(400).json({
        error: "discordUserId must be a Discord snowflake string (17-20 digits)"
      });
    }
    if (!Number.isInteger(amount)) {
      return res.status(400).json({ error: "amount must be an integer" });
    }

    const player = await adjustMoney(db, discordUserId, amount);
    return res.json(toPublicPlayer(player));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post(
  "/players/:discordUserId/actions/:action/lock",
  actionUserRateLimiter,
  async (req, res) => {
    try {
      const discordUserId = req.params.discordUserId;
      const action = req.params.action;

      if (!isValidDiscordUserId(discordUserId)) {
        return res.status(400).json({
          error: "discordUserId must be a Discord snowflake string (17-20 digits)"
        });
      }
      if (!getActionConfig(action)) {
        return res.status(400).json({ error: "action must be one of: dig, fish, hunt" });
      }

      const result = await lockActionCooldown(db, discordUserId, action);
      if (!result.ok) {
        return res.status(429).json({
          error: "Action is on cooldown",
          action,
          cooldownMs: ACTION_COOLDOWN_MS,
          cooldownUntil: result.cooldownUntil,
          cooldownRemainingMs: result.cooldownRemainingMs,
          player: toPublicPlayer(result.player)
        });
      }

      cleanupActionLockTokens();
      const actionToken = crypto.randomBytes(18).toString("base64url");
      actionLockTokenStore.set(actionToken, {
        discordUserId,
        action,
        expiresAt: Date.now() + 2 * 60 * 1000
      });

      return res.json({
        ok: true,
        action,
        cooldownMs: ACTION_COOLDOWN_MS,
        cooldownUntil: result.cooldownUntil,
        actionToken,
        player: toPublicPlayer(result.player)
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
);

app.post(
  "/players/:discordUserId/actions/:action/bot",
  actionUserRateLimiter,
  async (req, res) => {
    try {
      const discordUserId = req.params.discordUserId;
      const action = req.params.action;
      const actionToken = req.body?.actionToken;

      if (!isValidDiscordUserId(discordUserId)) {
        return res.status(400).json({
          error: "discordUserId must be a Discord snowflake string (17-20 digits)"
        });
      }
      if (!getActionConfig(action)) {
        return res.status(400).json({ error: "action must be one of: dig, fish, hunt" });
      }
      if (typeof actionToken !== "string" || !actionToken.trim()) {
        return res.status(400).json({ error: "actionToken is required" });
      }

      cleanupActionLockTokens();
      const lockEntry = actionLockTokenStore.get(actionToken.trim());
      if (!lockEntry) {
        return res.status(409).json({ error: "Invalid or expired action token" });
      }
      if (lockEntry.discordUserId !== discordUserId || lockEntry.action !== action) {
        return res.status(409).json({ error: "Action token does not match request" });
      }
      actionLockTokenStore.delete(actionToken.trim());

      const result = await performAction(db, discordUserId, action, {
        ignoreCooldown: true,
        preserveExistingCooldown: true,
        cashMultiplier: 1.05
      });

      return res.json({
        ok: true,
        action,
        reward: result.reward.totalCoins,
        rewardBreakdown: result.reward,
        cooldownMs: ACTION_COOLDOWN_MS,
        cooldownUntil: result.cooldownUntil,
        player: toPublicPlayer(result.player)
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
);

app.post(
  "/players/:discordUserId/actions/:action",
  actionUserRateLimiter,
  async (req, res) => {
    try {
      const discordUserId = req.params.discordUserId;
      const action = req.params.action;

      if (!isValidDiscordUserId(discordUserId)) {
        return res.status(400).json({
          error: "discordUserId must be a Discord snowflake string (17-20 digits)"
        });
      }
      if (!getActionConfig(action)) {
        return res.status(400).json({ error: "action must be one of: dig, fish, hunt" });
      }

      const result = await performAction(db, discordUserId, action);
      if (!result.ok) {
        return res.status(429).json({
          error: "Action is on cooldown",
          action,
          cooldownMs: ACTION_COOLDOWN_MS,
          cooldownUntil: result.cooldownUntil,
          cooldownRemainingMs: result.cooldownRemainingMs,
          player: toPublicPlayer(result.player)
        });
      }

      return res.json({
        ok: true,
        action,
        reward: result.reward.totalCoins,
        rewardBreakdown: result.reward,
        cooldownMs: ACTION_COOLDOWN_MS,
        cooldownUntil: result.cooldownUntil,
        player: toPublicPlayer(result.player)
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
);

app.use((err, _req, res, next) => {
  if (!err) return next();
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON body" });
  }
  return res.status(500).json({ error: err.message || "Internal server error" });
});

app.use((_req, res) => {
  return res.status(404).json({ error: "Not found" });
});

initDatabase(db)
  .then(() => {
    app.listen(PORT, HOST, () => {
      console.log(`API running on http://${HOST}:${PORT}`);
      console.log(
        `Rate limits: ip=${RATE_LIMIT_MAX_REQUESTS_PER_IP}/${RATE_LIMIT_WINDOW_MS}ms, actions=${RATE_LIMIT_MAX_ACTIONS_PER_USER}/${RATE_LIMIT_WINDOW_MS}ms`
      );
    });
  })
  .catch((err) => {
    console.error("Database init failed:", err.message);
    process.exit(1);
  });

async function closeAndExit() {
  try {
    await db.end();
  } finally {
    process.exit(0);
  }
}

process.on("SIGINT", closeAndExit);
process.on("SIGTERM", closeAndExit);
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});
