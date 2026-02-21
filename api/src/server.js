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
  getPlayerSyncByDiscordId,
  registerPlayer,
  adjustMoney,
  setPlayerMoneyExact,
  getPlayerDevConfig,
  setPlayerDevConfig,
  resetPlayerDevConfig,
  resetPlayerProgress,
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
  buildInventorySummary,
  buildShowcaseSummary,
  setPlayerTimezone,
  getDailySummary,
  claimDailyReward,
  claimDailyChallengeReward,
  getAchievementSummary,
  settleGamblingResult,
  purchaseUpgrade,
  purchaseUpgradeMax,
  sellInventoryItem,
  purchaseShowcaseSlot,
  setShowcasedItems,
  setPlayerUpgradeLevel
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

function percentileFromSorted(sortedValues, percentile) {
  if (sortedValues.length <= 0) return 0;
  const index = Math.max(
    0,
    Math.min(
      sortedValues.length - 1,
      Math.ceil((percentile / 100) * sortedValues.length) - 1
    )
  );
  return sortedValues[index];
}

function toFixedMs(value) {
  return Number(value.toFixed(1));
}

function normalizeRoutePath(req) {
  const routePath = req.route?.path;
  if (typeof routePath === "string") return routePath;
  if (Array.isArray(routePath)) return routePath.join("|");
  const path = typeof req.path === "string" ? req.path : "";
  if (path) return path;
  return String(req.originalUrl || "/").split("?")[0] || "/";
}

function getRouteLabel(req) {
  const baseUrl = typeof req.baseUrl === "string" ? req.baseUrl : "";
  return `${req.method} ${baseUrl}${normalizeRoutePath(req)}`;
}

function createRouteStats(sampleSize) {
  return {
    requests: 0,
    totalMs: 0,
    minMs: Number.POSITIVE_INFINITY,
    maxMs: 0,
    samples: new Array(sampleSize),
    sampleCount: 0,
    sampleIndex: 0,
    status2xx: 0,
    status3xx: 0,
    status4xx: 0,
    status5xx: 0
  };
}

function createHttpLatencyTracker({ sampleSize, maxRoutes }) {
  const startedAtMs = Date.now();
  const routes = new Map();
  const overflowRouteLabel = "__overflow__";

  function getOrCreateRouteStats(routeLabel) {
    if (routes.has(routeLabel)) return routes.get(routeLabel);
    if (routes.size >= maxRoutes) {
      if (routes.has(overflowRouteLabel)) return routes.get(overflowRouteLabel);
      const overflowStats = createRouteStats(sampleSize);
      routes.set(overflowRouteLabel, overflowStats);
      return overflowStats;
    }
    const stats = createRouteStats(sampleSize);
    routes.set(routeLabel, stats);
    return stats;
  }

  function record(routeLabel, durationMs, statusCode) {
    const stats = getOrCreateRouteStats(routeLabel);
    const value = Number.isFinite(durationMs) && durationMs >= 0 ? durationMs : 0;

    stats.requests += 1;
    stats.totalMs += value;
    if (value < stats.minMs) stats.minMs = value;
    if (value > stats.maxMs) stats.maxMs = value;

    stats.samples[stats.sampleIndex] = value;
    stats.sampleIndex = (stats.sampleIndex + 1) % sampleSize;
    if (stats.sampleCount < sampleSize) stats.sampleCount += 1;

    if (statusCode >= 500) stats.status5xx += 1;
    else if (statusCode >= 400) stats.status4xx += 1;
    else if (statusCode >= 300) stats.status3xx += 1;
    else stats.status2xx += 1;
  }

  function summarizeRoute(routeLabel, stats) {
    const sampleValues = stats.samples
      .slice(0, stats.sampleCount)
      .sort((a, b) => a - b);
    const avgMs = stats.requests > 0 ? stats.totalMs / stats.requests : 0;
    return {
      route: routeLabel,
      requests: stats.requests,
      avgMs: toFixedMs(avgMs),
      minMs: stats.requests > 0 ? toFixedMs(stats.minMs) : 0,
      p50Ms: toFixedMs(percentileFromSorted(sampleValues, 50)),
      p95Ms: toFixedMs(percentileFromSorted(sampleValues, 95)),
      p99Ms: toFixedMs(percentileFromSorted(sampleValues, 99)),
      maxMs: toFixedMs(stats.maxMs),
      status2xx: stats.status2xx,
      status3xx: stats.status3xx,
      status4xx: stats.status4xx,
      status5xx: stats.status5xx
    };
  }

  function snapshot({ limit = 20 } = {}) {
    const rows = Array.from(routes.entries()).map(([routeLabel, stats]) =>
      summarizeRoute(routeLabel, stats)
    );
    rows.sort((a, b) => b.requests - a.requests || b.p95Ms - a.p95Ms);
    const safeLimit = Math.max(1, Math.min(500, Number(limit) || 20));
    const totalRequests = rows.reduce((sum, row) => sum + row.requests, 0);
    return {
      since: new Date(startedAtMs).toISOString(),
      uptimeSec: Math.floor((Date.now() - startedAtMs) / 1000),
      routeCount: rows.length,
      totalRequests,
      routes: rows.slice(0, safeLimit)
    };
  }

  function reset() {
    routes.clear();
  }

  return {
    record,
    snapshot,
    reset
  };
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const NODE_ENV = (process.env.NODE_ENV || "development").toLowerCase();
const DATABASE_URL = process.env.DATABASE_URL || "";
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || "";
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || "";
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || "";
const WEB_BASE_URL = process.env.WEB_BASE_URL || "http://localhost:5173";
const WEB_PLAY_PATH = process.env.WEB_PLAY_PATH || "/play";
const ENABLE_REQUEST_LOGS =
  process.env.ENABLE_REQUEST_LOGS !== undefined
    ? process.env.ENABLE_REQUEST_LOGS === "true"
    : NODE_ENV !== "production";
const RATE_LIMIT_WINDOW_MS = parsePositiveIntEnv("RATE_LIMIT_WINDOW_MS", 10_000);
const RATE_LIMIT_MAX_REQUESTS_PER_IP = parsePositiveIntEnv(
  "RATE_LIMIT_MAX_REQUESTS_PER_IP",
  120
);
const RATE_LIMIT_MAX_ACTIONS_PER_USER = parsePositiveIntEnv(
  "RATE_LIMIT_MAX_ACTIONS_PER_USER",
  8
);
const METRICS_ENABLED = process.env.METRICS_ENABLED !== "false";
const METRICS_LOG_INTERVAL_MS = parsePositiveIntEnv("METRICS_LOG_INTERVAL_MS", 60_000);
const METRICS_SAMPLE_SIZE = parsePositiveIntEnv("METRICS_SAMPLE_SIZE", 256);
const METRICS_MAX_ROUTES = parsePositiveIntEnv("METRICS_MAX_ROUTES", 200);
const METRICS_EXPOSE_ENDPOINT = process.env.METRICS_EXPOSE_ENDPOINT === "true";
const DEV_OWNER_DISCORD_USER_ID = process.env.DEV_OWNER_DISCORD_USER_ID || "931015893377482854";
const oauthStateStore = new Map();
const actionLockTokenStore = new Map();
const httpMetrics = METRICS_ENABLED
  ? createHttpLatencyTracker({
      sampleSize: METRICS_SAMPLE_SIZE,
      maxRoutes: METRICS_MAX_ROUTES
    })
  : null;
let metricsLogTimer = null;

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

app.disable("x-powered-by");
app.use(cors({ origin: corsOriginOption }));
app.use(express.json({ limit: "1mb" }));

if (httpMetrics) {
  app.use((req, res, next) => {
    const startedAt = process.hrtime.bigint();
    res.on("finish", () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
      httpMetrics.record(getRouteLabel(req), durationMs, res.statusCode);
    });
    next();
  });
}

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

function toTimestampMs(value) {
  const ts = new Date(value).getTime();
  return Number.isFinite(ts) ? ts : 0;
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
  const inventory = buildInventorySummary(player);
  const showcase = buildShowcaseSummary(player);

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
        key: "collectors_greed",
        name: "Collectors Greed",
        image: "/assets/dig-trophy.png",
        count: digTrophyCount
      },
      fish: {
        key: "midnight_ocean",
        name: "Midnight Ocean",
        image: "/assets/fish-trophy.png",
        count: fishTrophyCount
      },
      hunt: {
        key: "many_heads",
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
    inventory: {
      items: inventory
    },
    showcase,
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

function toSyncPlayer(player) {
  if (!player) return null;

  const level = Math.min(MAX_LEVEL, Math.max(1, Number(player.level) || 1));
  const xp = Math.max(0, Number(player.xp) || 0);
  const xpToNextLevel = level < MAX_LEVEL ? xpRequiredForLevel(level) : 0;
  const nextLevelRewardCoins =
    level < MAX_LEVEL ? levelRewardCoins(level + 1) : 0;
  const digTrophyCount = Number(player.digTrophyCount || 0);
  const fishTrophyCount = Number(player.fishTrophyCount || 0);
  const huntTrophyCount = Number(player.huntTrophyCount || 0);

  return {
    discordUserId: player.discordUserId,
    discordUsername: player.discordUsername || null,
    discordAvatarUrl: getDiscordAvatarUrl(
      player.discordUserId,
      player.discordAvatarHash
    ),
    createdAt: player.createdAt,
    updatedAt: player.updatedAt,
    updatedAtMs: toTimestampMs(player.updatedAt),
    money: Number(player.money || 0),
    level,
    xp,
    xpToNextLevel,
    maxLevel: MAX_LEVEL,
    nextLevelRewardCoins,
    totalXpEarned: Number(player.totalXpEarned || 0),
    totalCommandsUsed: Number(player.totalCommandsUsed || 0),
    totalMoneyEarned: Number(player.totalMoneyEarned || 0),
    digCooldownUntil: Number(player.digCooldownUntil || 0),
    fishCooldownUntil: Number(player.fishCooldownUntil || 0),
    huntCooldownUntil: Number(player.huntCooldownUntil || 0),
    trophyCollection: {
      dig: {
        key: "collectors_greed",
        name: "Collectors Greed",
        image: "/assets/dig-trophy.png",
        count: digTrophyCount
      },
      fish: {
        key: "midnight_ocean",
        name: "Midnight Ocean",
        image: "/assets/fish-trophy.png",
        count: fishTrophyCount
      },
      hunt: {
        key: "many_heads",
        name: "Many Heads",
        image: "/assets/hunt-trophy.png",
        count: huntTrophyCount
      },
      placeholderImage: "/assets/null_trophy.png"
    },
    totalTrophies: digTrophyCount + fishTrophyCount + huntTrophyCount
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

function setMetadataCacheHeaders(res, maxAgeSec) {
  res.set("Cache-Control", `public, max-age=${maxAgeSec}, s-maxage=${maxAgeSec}`);
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

app.get("/health", async (req, res) => {
  const dbStatus = await pingDatabase();
  const payload = {
    ok: dbStatus.ok,
    timestamp: new Date().toISOString(),
    uptimeSec: Math.floor(process.uptime()),
    db: dbStatus.ok ? { ok: true } : dbStatus
  };
  if (httpMetrics && String(req.query?.metrics || "") === "1") {
    payload.http = httpMetrics.snapshot({ limit: 8 });
  }

  if (!dbStatus.ok) return res.status(503).json(payload);
  return res.json(payload);
});

if (METRICS_EXPOSE_ENDPOINT) {
  app.get("/metrics/http", (_req, res) => {
    if (!httpMetrics) {
      return res.status(503).json({ error: "HTTP metrics are disabled" });
    }
    const requestedLimit = Number(_req.query?.limit || 30);
    const limit =
      Number.isInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(500, requestedLimit)
        : 30;
    return res.json(httpMetrics.snapshot({ limit }));
  });

  app.post("/metrics/http/reset", (_req, res) => {
    if (!httpMetrics) {
      return res.status(503).json({ error: "HTTP metrics are disabled" });
    }
    httpMetrics.reset();
    return res.json({ ok: true });
  });
}

app.get("/meta/actions", (_req, res) => {
  setMetadataCacheHeaders(res, 300);
  res.json({
    ...getActionMetadata(),
    levelProgression: {
      maxLevel: MAX_LEVEL
    }
  });
});

app.get("/meta/public", (_req, res) => {
  setMetadataCacheHeaders(res, 60);
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

app.get("/players/:discordUserId/sync", async (req, res) => {
  try {
    const discordUserId = req.params.discordUserId;
    if (!isValidDiscordUserId(discordUserId)) {
      return res.status(400).json({
        error: "discordUserId must be a Discord snowflake string (17-20 digits)"
      });
    }

    // Lightweight poll endpoint for web profile sync loop.
    const player = await getPlayerSyncByDiscordId(db, discordUserId);
    if (!player) return res.status(404).json({ error: "Player not found" });

    const sinceParam = Number(req.query?.since || 0);
    const since = Number.isFinite(sinceParam) ? sinceParam : 0;
    const updatedAtMs = toTimestampMs(player.updatedAt);
    if (since > 0 && updatedAtMs > 0 && since >= updatedAtMs) {
      return res.status(204).end();
    }

    const payload = toSyncPlayer(player);
    res.set("Cache-Control", "no-store");
    return res.json(payload);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/dev/:discordUserId/progress-reset", async (req, res) => {
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
    const player = await resetPlayerProgress(db, discordUserId);
    return res.json({ ok: true, player: toPublicPlayer(player) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.put("/dev/:discordUserId/upgrades/:action/:upgradeKey", async (req, res) => {
  try {
    const discordUserId = req.params.discordUserId;
    const action = req.params.action;
    const upgradeKey = req.params.upgradeKey;
    const level = Number(req.body?.level);
    if (!isValidDiscordUserId(discordUserId)) {
      return res.status(400).json({
        error: "discordUserId must be a Discord snowflake string (17-20 digits)"
      });
    }
    if (!isDevOwnerId(discordUserId)) {
      return res.status(403).json({ error: "Dev mode is not available for this user" });
    }
    if (!Number.isFinite(level)) {
      return res.status(400).json({ error: "level must be a number" });
    }
    const result = await setPlayerUpgradeLevel(db, discordUserId, action, upgradeKey, level);
    return res.json({
      ok: true,
      upgrades: result.upgrades,
      player: toPublicPlayer(result.player)
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/dev/:discordUserId/actions/:action/trigger", async (req, res) => {
  try {
    const discordUserId = req.params.discordUserId;
    const action = req.params.action;
    const rewardLabel =
      typeof req.body?.rewardLabel === "string" ? req.body.rewardLabel.trim() : "";
    if (!isValidDiscordUserId(discordUserId)) {
      return res.status(400).json({
        error: "discordUserId must be a Discord snowflake string (17-20 digits)"
      });
    }
    if (!isDevOwnerId(discordUserId)) {
      return res.status(403).json({ error: "Dev mode is not available for this user" });
    }
    if (!getActionConfig(action)) {
      return res.status(400).json({ error: "action must be one of: dig, fish, hunt" });
    }

    const result = await performAction(db, discordUserId, action, {
      ignoreCooldown: true,
      preserveExistingCooldown: true,
      forcePayoutLabel: rewardLabel || null,
      forceBonusLabel: rewardLabel || null
    });

    return res.json({
      ok: true,
      action,
      reward: result.reward.totalCoins,
      rewardBreakdown: result.reward,
      player: toPublicPlayer(result.player)
    });
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

app.get("/players/:discordUserId/inventory", async (req, res) => {
  try {
    const discordUserId = req.params.discordUserId;
    if (!isValidDiscordUserId(discordUserId)) {
      return res.status(400).json({
        error: "discordUserId must be a Discord snowflake string (17-20 digits)"
      });
    }
    const player = await getPlayerByDiscordId(db, discordUserId);
    if (!player) return res.status(404).json({ error: "Player not found" });
    const publicPlayer = toPublicPlayer(player);
    return res.json({
      player: publicPlayer,
      inventory: publicPlayer.inventory,
      showcase: publicPlayer.showcase
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/players/:discordUserId/inventory/sell", async (req, res) => {
  try {
    const discordUserId = req.params.discordUserId;
    const itemKey = typeof req.body?.itemKey === "string" ? req.body.itemKey.trim() : "";
    const quantity = req.body?.quantity;
    if (!isValidDiscordUserId(discordUserId)) {
      return res.status(400).json({
        error: "discordUserId must be a Discord snowflake string (17-20 digits)"
      });
    }
    if (!itemKey) {
      return res.status(400).json({ error: "itemKey is required" });
    }

    const result = await sellInventoryItem(db, discordUserId, itemKey, quantity);
    if (!result.ok) {
      return res.status(409).json({
        error: result.error || "Could not sell item",
        player: toPublicPlayer(result.player)
      });
    }

    return res.json({
      ok: true,
      soldQuantity: result.soldQuantity,
      coinsEarned: result.coinsEarned,
      player: toPublicPlayer(result.player)
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/players/:discordUserId/shop/showcase-slot", async (req, res) => {
  try {
    const discordUserId = req.params.discordUserId;
    if (!isValidDiscordUserId(discordUserId)) {
      return res.status(400).json({
        error: "discordUserId must be a Discord snowflake string (17-20 digits)"
      });
    }

    const result = await purchaseShowcaseSlot(db, discordUserId);
    if (!result.ok) {
      return res.status(409).json({
        error: result.error || "Could not purchase showcase slot",
        cost: result.cost || 0,
        player: toPublicPlayer(result.player)
      });
    }
    return res.json({
      ok: true,
      cost: result.cost,
      player: toPublicPlayer(result.player)
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.put("/players/:discordUserId/showcase", async (req, res) => {
  try {
    const discordUserId = req.params.discordUserId;
    const itemKeys = Array.isArray(req.body?.itemKeys) ? req.body.itemKeys : [];
    if (!isValidDiscordUserId(discordUserId)) {
      return res.status(400).json({
        error: "discordUserId must be a Discord snowflake string (17-20 digits)"
      });
    }

    const result = await setShowcasedItems(db, discordUserId, itemKeys);
    return res.json({
      ok: true,
      player: toPublicPlayer(result.player)
    });
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

let server = null;

initDatabase(db)
  .then(() => {
    server = app.listen(PORT, HOST, () => {
      console.log(`API running on http://${HOST}:${PORT}`);
      console.log(
        `Rate limits: ip=${RATE_LIMIT_MAX_REQUESTS_PER_IP}/${RATE_LIMIT_WINDOW_MS}ms, actions=${RATE_LIMIT_MAX_ACTIONS_PER_USER}/${RATE_LIMIT_WINDOW_MS}ms`
      );
      if (httpMetrics && METRICS_LOG_INTERVAL_MS > 0) {
        console.log(
          `HTTP metrics enabled: sampleSize=${METRICS_SAMPLE_SIZE}, maxRoutes=${METRICS_MAX_ROUTES}, intervalMs=${METRICS_LOG_INTERVAL_MS}`
        );
        metricsLogTimer = setInterval(() => {
          const snapshot = httpMetrics.snapshot({ limit: 6 });
          if (snapshot.totalRequests <= 0) return;
          const topRoutes = snapshot.routes
            .map(
              (route) =>
                `${route.route} req=${route.requests} p50=${route.p50Ms}ms p95=${route.p95Ms}ms p99=${route.p99Ms}ms`
            )
            .join(" | ");
          console.log(
            `[HTTP_METRICS] total=${snapshot.totalRequests} routes=${snapshot.routeCount} ${topRoutes}`
          );
        }, METRICS_LOG_INTERVAL_MS);
        if (typeof metricsLogTimer.unref === "function") {
          metricsLogTimer.unref();
        }
      }
    });

    server.on("error", (err) => {
      if (err && err.code === "EADDRINUSE") {
        console.error(
          `Startup failed: ${HOST}:${PORT} is already in use. Stop the existing process or change PORT in api/.env.`
        );
      } else {
        console.error("Server listen failed:", err);
      }
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error("Database init failed:", err.message);
    process.exit(1);
  });

async function closeAndExit() {
  try {
    if (metricsLogTimer) {
      clearInterval(metricsLogTimer);
      metricsLogTimer = null;
    }
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await db.end();
  } finally {
    process.exit(0);
  }
}

process.on("SIGINT", closeAndExit);
process.on("SIGTERM", closeAndExit);
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  process.exit(1);
});
