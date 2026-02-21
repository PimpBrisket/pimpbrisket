const { Pool } = require("pg");

const ACTION_COOLDOWN_MS = 5000;
const MAX_LEVEL = 100;
const MAX_UPGRADE_LEVEL = 1000;
const MAX_BET_COINS = 1_000_000;
const DAILY_BASE_REWARD = 250;
const DAILY_CHALLENGE_BASE_REWARD = 700;
const DAILY_CHALLENGE_INTERACTIONS_REQUIRED = 100;
const SHOWCASE_SLOT_COSTS = [1000, 10000, 50000, 100000, 200000];

const ITEM_DEFS = {
  gold_coin: {
    key: "gold_coin",
    name: "Gold Coin",
    image: "/assets/Gold%20coin.png",
    sellCoins: 20,
    showcase: { action: "dig", cashPct: 5, xpPct: 0 }
  },
  da_bone: {
    key: "da_bone",
    name: "Da Bone",
    image: "/assets/Da%20bone.png",
    sellCoins: 75,
    showcase: { action: "dig", cashPct: 0, xpPct: 5 }
  },
  collectors_greed: {
    key: "collectors_greed",
    name: "Collector's Greed",
    image: "/assets/dig-trophy.png",
    sellCoins: 350,
    showcase: { action: "dig", cashPct: 10, xpPct: 10 }
  },
  treasure_scale: {
    key: "treasure_scale",
    name: "Treasure Scale",
    image: "/assets/null_trophy.png",
    sellCoins: 20,
    showcase: { action: "fish", cashPct: 0, xpPct: 5 }
  },
  ancient_chest_key: {
    key: "ancient_chest_key",
    name: "Ancient Chest Key",
    image: "/assets/null_trophy.png",
    sellCoins: 75,
    showcase: { action: "fish", cashPct: 5, xpPct: 0 }
  },
  midnight_ocean: {
    key: "midnight_ocean",
    name: "Midnight Ocean",
    image: "/assets/fish-trophy.png",
    sellCoins: 350,
    showcase: { action: "fish", cashPct: 10, xpPct: 10 }
  },
  pelt_bonus: {
    key: "pelt_bonus",
    name: "Pelt Bonus",
    image: "/assets/null_trophy.png",
    sellCoins: 20,
    showcase: { action: "hunt", cashPct: 5, xpPct: 0 }
  },
  rare_antler_set: {
    key: "rare_antler_set",
    name: "Rare Antler Set",
    image: "/assets/null_trophy.png",
    sellCoins: 75,
    showcase: { action: "hunt", cashPct: 0, xpPct: 5 }
  },
  many_heads: {
    key: "many_heads",
    name: "Many Heads",
    image: "/assets/hunt-trophy.png",
    sellCoins: 350,
    showcase: { action: "hunt", cashPct: 10, xpPct: 10 }
  }
};

const DEFAULT_UPGRADES = {
  dig: { cash: 0, xp: 0, drop: 0 },
  fish: { cash: 0, xp: 0, drop: 0 },
  hunt: { cash: 0, xp: 0, drop: 0 }
};

const UPGRADE_KEYS = ["cash", "xp", "drop"];

const ACHIEVEMENT_CHAINS = [
  {
    key: "interactions",
    label: "Interactions",
    thresholds: [100, 1000, 10000],
    rewards: [120, 900, 12500],
    progressValue: (player) => Number(player.totalCommandsUsed || 0)
  },
  {
    key: "level",
    label: "Reach Level",
    thresholds: [5, 10, 25, 50, 75, 100],
    rewards: [180, 320, 950, 2600, 6000, 14000],
    progressValue: (player) => Number(player.level || 1)
  },
  {
    key: "bonusRewards",
    label: "Bonus Rewards",
    thresholds: [100, 200, 500, 1000, 2000, 5000, 10000],
    rewards: [250, 420, 1200, 2600, 5500, 15000, 35000],
    progressValue: (player) => Number(player.totalBonusRewards || 0)
  },
  {
    key: "gamblingWins",
    label: "Gambling Wins",
    thresholds: [10, 20, 50, 100, 200, 500, 1000],
    rewards: [220, 420, 1200, 3000, 7000, 18000, 42000],
    progressValue: (player) => Number(player.totalGamblingWins || 0)
  },
  {
    key: "collectorsGreed",
    label: "Collector's Greed",
    thresholds: [1, 5, 10, 15, 20, 50, 100],
    rewards: [450, 1800, 3900, 6300, 9000, 27000, 75000],
    progressValue: (player) => Number(player.digTrophyCount || 0)
  },
  {
    key: "midnightOcean",
    label: "Midnight Ocean",
    thresholds: [1, 5, 10, 15, 20, 50, 100],
    rewards: [450, 1800, 3900, 6300, 9000, 27000, 75000],
    progressValue: (player) => Number(player.fishTrophyCount || 0)
  },
  {
    key: "manyHeads",
    label: "Many Heads",
    thresholds: [1, 5, 10, 15, 20, 50, 100],
    rewards: [450, 1800, 3900, 6300, 9000, 27000, 75000],
    progressValue: (player) => Number(player.huntTrophyCount || 0)
  },
  {
    key: "digUpgrades",
    label: "Buy Upgrades for Dig",
    thresholds: [1, 10, 20, 50, 75, 100, 150, 200, 300, 500, 750, 1000],
    rewards: [80, 160, 320, 650, 1000, 1400, 2100, 3000, 4500, 8000, 13000, 22000],
    progressValue: (player) => Number(player.totalDigUpgradesPurchased || 0)
  },
  {
    key: "fishUpgrades",
    label: "Buy Upgrades for Fish",
    thresholds: [1, 10, 20, 50, 75, 100, 150, 200, 300, 500, 750, 1000],
    rewards: [80, 160, 320, 650, 1000, 1400, 2100, 3000, 4500, 8000, 13000, 22000],
    progressValue: (player) => Number(player.totalFishUpgradesPurchased || 0)
  },
  {
    key: "huntUpgrades",
    label: "Buy Upgrades for Hunt",
    thresholds: [1, 10, 20, 50, 75, 100, 150, 200, 300, 500, 750, 1000],
    rewards: [80, 160, 320, 650, 1000, 1400, 2100, 3000, 4500, 8000, 13000, 22000],
    progressValue: (player) => Number(player.totalHuntUpgradesPurchased || 0)
  },
  {
    key: "unlockGambling",
    label: "Unlock Gambling",
    thresholds: [1],
    rewards: [600],
    progressValue: (player) => (Number(player.level || 1) >= 5 ? 1 : 0)
  },
  {
    key: "completeAchievements",
    label: "Complete Achievements",
    thresholds: [1, 5, 10, 15, 20],
    rewards: [550, 2500, 7000, 15500, 30000],
    progressValue: (_player, achievementState) => {
      const cloned = { ...(achievementState || {}) };
      delete cloned.completeAchievements;
      return Object.values(cloned).reduce(
        (sum, chainState) => sum + (chainState?.claimedCount || 0),
        0
      );
    }
  }
];

const ACTIONS = {
  dig: {
    cooldownColumn: "digCooldownUntil",
    xpMin: 12,
    xpMax: 19,
    payoutTiers: [
      { chancePct: 45, min: 7, max: 12, label: "Small Pouch" },
      { chancePct: 32, min: 13, max: 20, label: "Good Find" },
      { chancePct: 18, min: 21, max: 32, label: "Lucky Find" },
      { chancePct: 5, min: 33, max: 50, label: "Jackpot Vein" }
    ],
    bonusTiers: [
      { chancePct: 87, coins: 0, label: "No extra drop" },
      {
        chancePct: 11,
        coins: 10,
        label: "Gold Coin",
        itemKey: "gold_coin",
        itemImage: "/assets/Gold%20coin.png"
      },
      {
        chancePct: 3,
        coins: 35,
        label: "Da Bone",
        itemKey: "da_bone",
        itemImage: "/assets/Da%20bone.png"
      },
      {
        chancePct: 1,
        coins: 120,
        label: "Collectors Greed",
        itemKey: "collectors_greed",
        itemImage: "/assets/dig-trophy.png"
      }
    ]
  },
  fish: {
    cooldownColumn: "fishCooldownUntil",
    xpMin: 13,
    xpMax: 21,
    payoutTiers: [
      { chancePct: 45, min: 7, max: 12, label: "Common Catch" },
      { chancePct: 32, min: 13, max: 20, label: "Fresh Catch" },
      { chancePct: 18, min: 21, max: 32, label: "Big Catch" },
      { chancePct: 5, min: 33, max: 50, label: "Legend Catch" }
    ],
    bonusTiers: [
      { chancePct: 87, coins: 0, label: "No extra drop" },
      {
        chancePct: 11,
        coins: 10,
        label: "Treasure Scale",
        itemKey: "treasure_scale",
        itemImage: "/assets/null_trophy.png"
      },
      {
        chancePct: 3,
        coins: 35,
        label: "Ancient Chest Key",
        itemKey: "ancient_chest_key",
        itemImage: "/assets/null_trophy.png"
      },
      {
        chancePct: 1,
        coins: 120,
        label: "Midnight Ocean",
        itemKey: "midnight_ocean",
        itemImage: "/assets/fish-trophy.png"
      }
    ]
  },
  hunt: {
    cooldownColumn: "huntCooldownUntil",
    xpMin: 14,
    xpMax: 23,
    payoutTiers: [
      { chancePct: 45, min: 7, max: 12, label: "Small Trophy" },
      { chancePct: 32, min: 13, max: 20, label: "Strong Trophy" },
      { chancePct: 18, min: 21, max: 32, label: "Prime Trophy" },
      { chancePct: 5, min: 33, max: 50, label: "Elite Trophy" }
    ],
    bonusTiers: [
      { chancePct: 87, coins: 0, label: "No extra drop" },
      {
        chancePct: 11,
        coins: 10,
        label: "Pelt Bonus",
        itemKey: "pelt_bonus",
        itemImage: "/assets/null_trophy.png"
      },
      {
        chancePct: 3,
        coins: 35,
        label: "Rare Antler Set",
        itemKey: "rare_antler_set",
        itemImage: "/assets/null_trophy.png"
      },
      {
        chancePct: 1,
        coins: 120,
        label: "Many Heads",
        itemKey: "many_heads",
        itemImage: "/assets/hunt-trophy.png"
      }
    ]
  }
};

const PLAYER_SELECT_SQL = `SELECT
  "discordUserId",
  money,
  "createdAt",
  "updatedAt",
  "digCooldownUntil",
  "fishCooldownUntil",
  "huntCooldownUntil",
  xp,
  "totalXpEarned",
  level,
  "totalCommandsUsed",
  "totalMoneyEarned",
  "digTrophyCount",
  "fishTrophyCount",
  "huntTrophyCount",
  "discordUsername",
  "discordAvatarHash",
  "devConfig",
  timezone,
  "dailyClaimDay",
  "dailyStreak",
  "dailyTaskDay",
  "dailyTaskInteractions",
  "dailyTaskClaimDay",
  "dailyTaskStreak",
  "totalBonusRewards",
  "totalGamblingWins",
  "totalGamblingPlays",
  "totalDigUpgradesPurchased",
  "totalFishUpgradesPurchased",
  "totalHuntUpgradesPurchased",
  inventory,
  "showcaseSlots",
  "showcasedItems",
  "achievementState",
  upgrades
 FROM players
 WHERE "discordUserId" = $1`;

const PLAYER_SYNC_SELECT_SQL = `SELECT
  "discordUserId",
  money,
  "createdAt",
  "updatedAt",
  "digCooldownUntil",
  "fishCooldownUntil",
  "huntCooldownUntil",
  xp,
  "totalXpEarned",
  level,
  "totalCommandsUsed",
  "totalMoneyEarned",
  "digTrophyCount",
  "fishTrophyCount",
  "huntTrophyCount",
  "discordUsername",
  "discordAvatarHash"
 FROM players
 WHERE "discordUserId" = $1`;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function safeTimeZone(input) {
  if (typeof input !== "string" || !input.trim()) return "UTC";
  const trimmed = input.trim();
  try {
    // eslint-disable-next-line no-new
    new Intl.DateTimeFormat("en-US", { timeZone: trimmed });
    return trimmed;
  } catch (_err) {
    return "UTC";
  }
}

function getDayKey(timestampMs, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: safeTimeZone(timeZone),
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const parts = formatter.formatToParts(new Date(timestampMs));
  const year = parts.find((part) => part.type === "year")?.value || "1970";
  const month = parts.find((part) => part.type === "month")?.value || "01";
  const day = parts.find((part) => part.type === "day")?.value || "01";
  return `${year}-${month}-${day}`;
}

function getNextMidnightUtcMs(timestampMs, timeZone) {
  const tz = safeTimeZone(timeZone);
  const startKey = getDayKey(timestampMs, tz);
  let probe = timestampMs + 60 * 1000;
  for (let i = 0; i < 48 * 60; i += 1) {
    if (getDayKey(probe, tz) !== startKey) return probe;
    probe += 60 * 1000;
  }
  return timestampMs + 24 * 60 * 60 * 1000;
}

function previousDayKey(currentDayKey, timeZone) {
  const midnight = Date.parse(`${currentDayKey}T00:00:00.000Z`);
  return getDayKey(midnight - 12 * 60 * 60 * 1000, timeZone);
}

function getStreakBonusPct(streakCount) {
  const streak = Math.max(0, Number(streakCount) || 0);
  return Math.min(50, Math.floor(streak / 2));
}

function sanitizeUpgrades(input) {
  const next = clone(DEFAULT_UPGRADES);
  if (!input || typeof input !== "object") return next;
  for (const actionKey of Object.keys(DEFAULT_UPGRADES)) {
    const sourceAction = input[actionKey];
    if (!sourceAction || typeof sourceAction !== "object") continue;
    for (const upgradeKey of UPGRADE_KEYS) {
      const parsed = Math.max(
        0,
        Math.min(MAX_UPGRADE_LEVEL, Math.floor(Number(sourceAction[upgradeKey]) || 0))
      );
      next[actionKey][upgradeKey] = parsed;
    }
  }
  return next;
}

function sanitizeAchievementState(input) {
  const state = {};
  if (!input || typeof input !== "object") return state;
  for (const chain of ACHIEVEMENT_CHAINS) {
    const claimedCount = Math.max(
      0,
      Math.floor(Number(input?.[chain.key]?.claimedCount) || 0)
    );
    state[chain.key] = {
      claimedCount: Math.min(chain.thresholds.length, claimedCount)
    };
  }
  return state;
}

function sanitizeShowcaseSlots(value) {
  return Math.max(
    0,
    Math.min(SHOWCASE_SLOT_COSTS.length, Math.floor(Number(value) || 0))
  );
}

function sanitizeInventory(input) {
  const inventory = {};
  if (!input || typeof input !== "object") return inventory;
  for (const key of Object.keys(ITEM_DEFS)) {
    const count = Math.max(0, Math.floor(Number(input[key]) || 0));
    if (count > 0) inventory[key] = count;
  }
  return inventory;
}

function sanitizeShowcasedItems(input, slots, inventory) {
  if (!Array.isArray(input) || slots <= 0) return [];
  const next = [];
  const available = new Set(Object.keys(ITEM_DEFS));
  const usedByKey = {};
  for (const rawKey of input) {
    if (next.length >= slots) break;
    if (typeof rawKey !== "string") continue;
    const key = rawKey.trim();
    if (!available.has(key)) continue;
    const ownedCount = Math.max(0, Math.floor(Number(inventory[key]) || 0));
    if (ownedCount <= 0) continue;
    const currentlyUsed = Math.max(0, Math.floor(Number(usedByKey[key]) || 0));
    if (currentlyUsed >= ownedCount) continue;
    next.push(key);
    usedByKey[key] = currentlyUsed + 1;
  }
  return next;
}

function getNextShowcaseSlotCost(showcaseSlots) {
  const slots = sanitizeShowcaseSlots(showcaseSlots);
  if (slots >= SHOWCASE_SLOT_COSTS.length) return null;
  return SHOWCASE_SLOT_COSTS[slots];
}

function getShowcaseEffects(player) {
  const result = {
    dig: { cashPct: 0, xpPct: 0, cashMultiplier: 1, xpMultiplier: 1 },
    fish: { cashPct: 0, xpPct: 0, cashMultiplier: 1, xpMultiplier: 1 },
    hunt: { cashPct: 0, xpPct: 0, cashMultiplier: 1, xpMultiplier: 1 }
  };
  const inventory = sanitizeInventory(player?.inventory || {});
  const slots = sanitizeShowcaseSlots(player?.showcaseSlots);
  const showcasedItems = sanitizeShowcasedItems(player?.showcasedItems || [], slots, inventory);
  showcasedItems.forEach((itemKey) => {
    const item = ITEM_DEFS[itemKey];
    if (!item?.showcase?.action || !result[item.showcase.action]) return;
    result[item.showcase.action].cashPct += Number(item.showcase.cashPct || 0);
    result[item.showcase.action].xpPct += Number(item.showcase.xpPct || 0);
  });
  for (const actionKey of Object.keys(result)) {
    result[actionKey].cashMultiplier = 1 + result[actionKey].cashPct / 100;
    result[actionKey].xpMultiplier = 1 + result[actionKey].xpPct / 100;
  }
  return result;
}

function buildInventorySummary(player) {
  const inventory = sanitizeInventory(player?.inventory || {});
  return Object.keys(inventory)
    .map((itemKey) => {
      const item = ITEM_DEFS[itemKey];
      if (!item) return null;
      return {
        key: item.key,
        name: item.name,
        image: item.image || "/assets/null_trophy.png",
        count: inventory[itemKey],
        sellCoins: item.sellCoins || 0,
        showcase: {
          action: item.showcase?.action || null,
          cashPct: Number(item.showcase?.cashPct || 0),
          xpPct: Number(item.showcase?.xpPct || 0)
        }
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function buildShowcaseSummary(player) {
  const inventory = sanitizeInventory(player?.inventory || {});
  const slots = sanitizeShowcaseSlots(player?.showcaseSlots);
  const showcasedItems = sanitizeShowcasedItems(player?.showcasedItems || [], slots, inventory);
  return {
    slots,
    maxSlots: SHOWCASE_SLOT_COSTS.length,
    unlocked: slots > 0,
    nextSlotCost: getNextShowcaseSlotCost(slots),
    showcasedItems,
    effectsByAction: getShowcaseEffects({
      inventory,
      showcasedItems,
      showcaseSlots: slots
    })
  };
}

function xpRequiredForLevel(level) {
  if (level >= MAX_LEVEL) return 0;
  if (level <= 10) return 60 + level * 18;
  if (level <= 40) return 240 + (level - 10) * 24;
  return 960 + (level - 40) * 27;
}

function levelRewardCoins(level) {
  return 30 + level * 10;
}

function readPositiveIntEnvValue(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function createDatabase(connectionString) {
  const poolMax = readPositiveIntEnvValue(process.env.DB_POOL_MAX, 10);
  const idleTimeoutMillis = readPositiveIntEnvValue(
    process.env.DB_POOL_IDLE_TIMEOUT_MS,
    30_000
  );
  const connectionTimeoutMillis = readPositiveIntEnvValue(
    process.env.DB_POOL_CONNECTION_TIMEOUT_MS,
    10_000
  );

  return new Pool({
    connectionString,
    max: poolMax,
    idleTimeoutMillis,
    connectionTimeoutMillis,
    ssl: connectionString.includes("localhost")
      ? false
      : { rejectUnauthorized: false }
  });
}

function hydratePlayerRow(row) {
  if (!row) return null;
  const inventory = sanitizeInventory(row.inventory || {});
  const showcaseSlots = sanitizeShowcaseSlots(row.showcaseSlots);
  const showcasedItems = sanitizeShowcasedItems(
    row.showcasedItems || [],
    showcaseSlots,
    inventory
  );
  return {
    ...row,
    timezone: row.timezone ? safeTimeZone(row.timezone) : null,
    devConfig: sanitizeDevConfig(row.devConfig || {}),
    upgrades: sanitizeUpgrades(row.upgrades || {}),
    achievementState: sanitizeAchievementState(row.achievementState || {}),
    inventory,
    showcaseSlots,
    showcasedItems
  };
}

async function getPlayerByDiscordId(db, discordUserId, client = db) {
  const result = await client.query(PLAYER_SELECT_SQL, [discordUserId]);
  return hydratePlayerRow(result.rows[0] || null);
}

async function getPlayerByDiscordIdForUpdate(client, discordUserId) {
  const result = await client.query(`${PLAYER_SELECT_SQL} FOR UPDATE`, [discordUserId]);
  return hydratePlayerRow(result.rows[0] || null);
}

async function getPlayerSyncByDiscordId(db, discordUserId, client = db) {
  const result = await client.query(PLAYER_SYNC_SELECT_SQL, [discordUserId]);
  const row = result.rows[0] || null;
  if (!row) return null;

  return {
    ...row,
    money: Number(row.money || 0),
    digCooldownUntil: Number(row.digCooldownUntil || 0),
    fishCooldownUntil: Number(row.fishCooldownUntil || 0),
    huntCooldownUntil: Number(row.huntCooldownUntil || 0),
    xp: Number(row.xp || 0),
    totalXpEarned: Number(row.totalXpEarned || 0),
    level: Number(row.level || 1),
    totalCommandsUsed: Number(row.totalCommandsUsed || 0),
    totalMoneyEarned: Number(row.totalMoneyEarned || 0),
    digTrophyCount: Number(row.digTrophyCount || 0),
    fishTrophyCount: Number(row.fishTrophyCount || 0),
    huntTrophyCount: Number(row.huntTrophyCount || 0)
  };
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rollWeightedTier(tiers) {
  const roll = Math.random() * 100;
  let running = 0;
  for (const tier of tiers) {
    running += tier.chancePct;
    if (roll <= running) return tier;
  }
  return tiers[tiers.length - 1];
}

async function initDatabase(db) {
  await db.query(`CREATE TABLE IF NOT EXISTS players (
    "discordUserId" TEXT PRIMARY KEY,
    money INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "digCooldownUntil" BIGINT NOT NULL DEFAULT 0,
    "fishCooldownUntil" BIGINT NOT NULL DEFAULT 0,
    "huntCooldownUntil" BIGINT NOT NULL DEFAULT 0,
    xp INTEGER NOT NULL DEFAULT 0,
    "totalXpEarned" INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    "totalCommandsUsed" INTEGER NOT NULL DEFAULT 0,
    "totalMoneyEarned" INTEGER NOT NULL DEFAULT 0,
    "digTrophyCount" INTEGER NOT NULL DEFAULT 0,
    "fishTrophyCount" INTEGER NOT NULL DEFAULT 0,
    "huntTrophyCount" INTEGER NOT NULL DEFAULT 0,
    "discordUsername" TEXT,
    "discordAvatarHash" TEXT,
    "devConfig" JSONB,
    timezone TEXT,
    "dailyClaimDay" TEXT,
    "dailyStreak" INTEGER NOT NULL DEFAULT 0,
    "dailyTaskDay" TEXT,
    "dailyTaskInteractions" INTEGER NOT NULL DEFAULT 0,
    "dailyTaskClaimDay" TEXT,
    "dailyTaskStreak" INTEGER NOT NULL DEFAULT 0,
    "totalBonusRewards" INTEGER NOT NULL DEFAULT 0,
    "totalGamblingWins" INTEGER NOT NULL DEFAULT 0,
    "totalGamblingPlays" INTEGER NOT NULL DEFAULT 0,
    "totalDigUpgradesPurchased" INTEGER NOT NULL DEFAULT 0,
    "totalFishUpgradesPurchased" INTEGER NOT NULL DEFAULT 0,
    "totalHuntUpgradesPurchased" INTEGER NOT NULL DEFAULT 0,
    inventory JSONB,
    "showcaseSlots" INTEGER NOT NULL DEFAULT 0,
    "showcasedItems" JSONB,
    "achievementState" JSONB,
    upgrades JSONB
  )`);

  const requiredColumns = [
    `"digCooldownUntil" BIGINT NOT NULL DEFAULT 0`,
    `"fishCooldownUntil" BIGINT NOT NULL DEFAULT 0`,
    `"huntCooldownUntil" BIGINT NOT NULL DEFAULT 0`,
    `xp INTEGER NOT NULL DEFAULT 0`,
    `"totalXpEarned" INTEGER NOT NULL DEFAULT 0`,
    `level INTEGER NOT NULL DEFAULT 1`,
    `"totalCommandsUsed" INTEGER NOT NULL DEFAULT 0`,
    `"totalMoneyEarned" INTEGER NOT NULL DEFAULT 0`,
    `"digTrophyCount" INTEGER NOT NULL DEFAULT 0`,
    `"fishTrophyCount" INTEGER NOT NULL DEFAULT 0`,
    `"huntTrophyCount" INTEGER NOT NULL DEFAULT 0`,
    `"discordUsername" TEXT`,
    `"discordAvatarHash" TEXT`,
    `"devConfig" JSONB`,
    `timezone TEXT`,
    `"dailyClaimDay" TEXT`,
    `"dailyStreak" INTEGER NOT NULL DEFAULT 0`,
    `"dailyTaskDay" TEXT`,
    `"dailyTaskInteractions" INTEGER NOT NULL DEFAULT 0`,
    `"dailyTaskClaimDay" TEXT`,
    `"dailyTaskStreak" INTEGER NOT NULL DEFAULT 0`,
    `"totalBonusRewards" INTEGER NOT NULL DEFAULT 0`,
    `"totalGamblingWins" INTEGER NOT NULL DEFAULT 0`,
    `"totalGamblingPlays" INTEGER NOT NULL DEFAULT 0`,
    `"totalDigUpgradesPurchased" INTEGER NOT NULL DEFAULT 0`,
    `"totalFishUpgradesPurchased" INTEGER NOT NULL DEFAULT 0`,
    `"totalHuntUpgradesPurchased" INTEGER NOT NULL DEFAULT 0`,
    `inventory JSONB`,
    `"showcaseSlots" INTEGER NOT NULL DEFAULT 0`,
    `"showcasedItems" JSONB`,
    `"achievementState" JSONB`,
    `upgrades JSONB`
  ];

  for (const colDef of requiredColumns) {
    await db.query(`ALTER TABLE players ADD COLUMN IF NOT EXISTS ${colDef}`);
  }
}

function sanitizeNumber(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function sanitizeActionOverride(defaultAction, override) {
  const result = clone(defaultAction);
  if (!override || typeof override !== "object") return result;

  result.xpMin = Math.max(0, Math.floor(sanitizeNumber(override.xpMin, result.xpMin)));
  result.xpMax = Math.max(result.xpMin, Math.floor(sanitizeNumber(override.xpMax, result.xpMax)));

  if (Array.isArray(override.payoutTiers) && override.payoutTiers.length === result.payoutTiers.length) {
    result.payoutTiers = result.payoutTiers.map((tier, index) => {
      const source = override.payoutTiers[index] || {};
      const min = Math.max(0, Math.floor(sanitizeNumber(source.min, tier.min)));
      const max = Math.max(min, Math.floor(sanitizeNumber(source.max, tier.max)));
      return {
        ...tier,
        chancePct: Math.max(0, sanitizeNumber(source.chancePct, tier.chancePct)),
        min,
        max
      };
    });
  }

  if (Array.isArray(override.bonusTiers) && override.bonusTiers.length === result.bonusTiers.length) {
    result.bonusTiers = result.bonusTiers.map((tier, index) => {
      const source = override.bonusTiers[index] || {};
      return {
        ...tier,
        chancePct: Math.max(0, sanitizeNumber(source.chancePct, tier.chancePct)),
        coins: Math.max(0, Math.floor(sanitizeNumber(source.coins, tier.coins)))
      };
    });
  }

  return result;
}

function sanitizeDevConfig(input) {
  const output = {
    actions: {},
    freezeMoney: false
  };
  if (!input || typeof input !== "object") return output;
  const incomingActions = input.actions && typeof input.actions === "object" ? input.actions : {};
  output.freezeMoney = input.freezeMoney === true;
  for (const actionKey of Object.keys(ACTIONS)) {
    output.actions[actionKey] = sanitizeActionOverride(ACTIONS[actionKey], incomingActions[actionKey]);
  }
  return output;
}

function isMoneyFrozen(player) {
  return player?.devConfig?.freezeMoney === true;
}

function getEffectiveActionConfigForPlayer(player, action) {
  const base = getActionConfig(action);
  if (!base) return null;
  const playerOverride = player?.devConfig?.actions?.[action];
  if (!playerOverride) return base;
  return sanitizeActionOverride(base, playerOverride);
}

async function registerPlayer(db, discordUserId, profile = null) {
  const insertResult = await db.query(
    `INSERT INTO players ("discordUserId", money)
     VALUES ($1, 0)
     ON CONFLICT ("discordUserId") DO NOTHING
     RETURNING "discordUserId"`,
    [discordUserId]
  );

  if (profile && (profile.discordUsername || profile.discordAvatarHash)) {
    await db.query(
      `UPDATE players
       SET "discordUsername" = COALESCE($1, "discordUsername"),
           "discordAvatarHash" = COALESCE($2, "discordAvatarHash"),
           "updatedAt" = NOW()
       WHERE "discordUserId" = $3`,
      [profile.discordUsername || null, profile.discordAvatarHash || null, discordUserId]
    );
  }

  const player = await getPlayerByDiscordId(db, discordUserId);
  return { player, created: insertResult.rowCount === 1 };
}

async function adjustMoney(db, discordUserId, amount) {
  await db.query(
    `INSERT INTO players ("discordUserId", money)
     VALUES ($1, 0)
     ON CONFLICT ("discordUserId") DO NOTHING`,
    [discordUserId]
  );

  await db.query(
    `UPDATE players
     SET money = money + $1,
         "updatedAt" = NOW()
     WHERE "discordUserId" = $2`,
    [amount, discordUserId]
  );

  return getPlayerByDiscordId(db, discordUserId);
}

async function setPlayerMoneyExact(db, discordUserId, targetMoney) {
  const money = Math.max(0, Math.floor(Number(targetMoney) || 0));
  await db.query(
    `INSERT INTO players ("discordUserId", money)
     VALUES ($1, 0)
     ON CONFLICT ("discordUserId") DO NOTHING`,
    [discordUserId]
  );

  await db.query(
    `UPDATE players
     SET money = $1,
         "updatedAt" = NOW()
     WHERE "discordUserId" = $2`,
    [money, discordUserId]
  );

  return getPlayerByDiscordId(db, discordUserId);
}

async function getPlayerDevConfig(db, discordUserId) {
  const result = await db.query(
    `SELECT "devConfig" FROM players WHERE "discordUserId" = $1`,
    [discordUserId]
  );
  if (!result.rows[0]) return sanitizeDevConfig({});
  return sanitizeDevConfig(result.rows[0].devConfig || {});
}

async function setPlayerDevConfig(db, discordUserId, config) {
  const sanitized = sanitizeDevConfig(config);
  await db.query(
    `INSERT INTO players ("discordUserId", money, "devConfig")
     VALUES ($1, 0, $2::jsonb)
     ON CONFLICT ("discordUserId")
     DO UPDATE SET "devConfig" = $2::jsonb, "updatedAt" = NOW()`,
    [discordUserId, JSON.stringify(sanitized)]
  );
  return sanitized;
}

async function resetPlayerDevConfig(db, discordUserId) {
  await db.query(
    `UPDATE players
     SET "devConfig" = NULL, "updatedAt" = NOW()
     WHERE "discordUserId" = $1`,
    [discordUserId]
  );
}

async function setPlayerLevel(db, discordUserId, level) {
  const clampedLevel = Math.min(MAX_LEVEL, Math.max(1, Math.floor(Number(level) || 1)));
  await db.query(
    `INSERT INTO players ("discordUserId", money)
     VALUES ($1, 0)
     ON CONFLICT ("discordUserId") DO NOTHING`,
    [discordUserId]
  );
  await db.query(
    `UPDATE players
     SET level = $1,
         xp = 0,
         "updatedAt" = NOW()
     WHERE "discordUserId" = $2`,
    [clampedLevel, discordUserId]
  );
  return getPlayerByDiscordId(db, discordUserId);
}

async function resetPlayerProgress(db, discordUserId) {
  await db.query(
    `INSERT INTO players ("discordUserId", money, upgrades, "achievementState")
     VALUES ($1, 0, $2::jsonb, $3::jsonb)
     ON CONFLICT ("discordUserId") DO NOTHING`,
    [discordUserId, JSON.stringify(DEFAULT_UPGRADES), JSON.stringify({})]
  );

  await db.query(
    `UPDATE players
     SET money = 0,
         "digCooldownUntil" = 0,
         "fishCooldownUntil" = 0,
         "huntCooldownUntil" = 0,
         xp = 0,
         "totalXpEarned" = 0,
         level = 1,
         "totalCommandsUsed" = 0,
         "totalMoneyEarned" = 0,
         "digTrophyCount" = 0,
         "fishTrophyCount" = 0,
         "huntTrophyCount" = 0,
         timezone = NULL,
         "dailyClaimDay" = NULL,
         "dailyStreak" = 0,
         "dailyTaskDay" = NULL,
         "dailyTaskInteractions" = 0,
         "dailyTaskClaimDay" = NULL,
         "dailyTaskStreak" = 0,
         "totalBonusRewards" = 0,
         "totalGamblingWins" = 0,
         "totalGamblingPlays" = 0,
         "totalDigUpgradesPurchased" = 0,
         "totalFishUpgradesPurchased" = 0,
         "totalHuntUpgradesPurchased" = 0,
         inventory = '{}'::jsonb,
         "showcaseSlots" = 0,
         "showcasedItems" = '[]'::jsonb,
         "achievementState" = '{}'::jsonb,
         upgrades = $1::jsonb,
         "devConfig" = NULL,
         "updatedAt" = NOW()
     WHERE "discordUserId" = $2`,
    [JSON.stringify(DEFAULT_UPGRADES), discordUserId]
  );

  return getPlayerByDiscordId(db, discordUserId);
}

function getActionConfig(action) {
  return ACTIONS[action] || null;
}

function getActionMetadata() {
  const actions = {};
  for (const [key, config] of Object.entries(ACTIONS)) {
    actions[key] = {
      xpMin: config.xpMin,
      xpMax: config.xpMax,
      payoutTiers: config.payoutTiers.map((tier) => ({
        chancePct: tier.chancePct,
        min: tier.min,
        max: tier.max,
        label: tier.label
      })),
      bonusTiers: config.bonusTiers.map((tier) => ({
        chancePct: tier.chancePct,
        coins: tier.coins,
        label: tier.label,
        itemKey: tier.itemKey || null,
        itemImage: tier.itemImage || null
      }))
    };
  }

  return {
    cooldownMs: ACTION_COOLDOWN_MS,
    maxLevel: MAX_LEVEL,
    actions
  };
}

async function setDevFreezeMoney(db, discordUserId, enabled) {
  const current = await getPlayerDevConfig(db, discordUserId);
  const next = {
    ...current,
    freezeMoney: enabled === true
  };
  return setPlayerDevConfig(db, discordUserId, next);
}

function getUpgradeCost(action, upgradeKey, currentLevel) {
  const level = Math.max(0, Math.floor(Number(currentLevel) || 0));
  if (level >= MAX_UPGRADE_LEVEL) return 0;
  const MAX_INT32 = 2147483647;
  const baseByKey = {
    cash: 130,
    xp: 140,
    drop: 1100
  };
  const growthByKey = {
    cash: 1.26,
    xp: 1.28,
    drop: 1.42
  };
  const base = baseByKey[upgradeKey] || 500;
  const growth = growthByKey[upgradeKey] || 1.4;
  const actionBias = action === "hunt" ? 1.08 : action === "fish" ? 1.03 : 1;
  const raw = base * Math.pow(growth, level) * actionBias;
  if (!Number.isFinite(raw) || raw > MAX_INT32) return MAX_INT32;
  return Math.max(1, Math.floor(raw));
}

function getUpgradeEffects(upgrades, action) {
  const actionUpgrades = sanitizeUpgrades(upgrades)[action] || DEFAULT_UPGRADES[action];
  return {
    cashMultiplier: 1 + actionUpgrades.cash * 0.025,
    xpMultiplier: 1 + actionUpgrades.xp * 0.025,
    dropReductionFactor: Math.min(0.35, actionUpgrades.drop * 0.008)
  };
}

function applyDropBoostToBonusTiers(bonusTiers, dropReductionFactor) {
  if (!Array.isArray(bonusTiers) || bonusTiers.length === 0) return [];
  const nextTiers = bonusTiers.map((tier) => ({ ...tier }));
  const noDropIndex = nextTiers.findIndex((tier) => tier.coins === 0 && !tier.itemKey);
  if (noDropIndex < 0 || dropReductionFactor <= 0) return nextTiers;

  const weighted = nextTiers.map((tier, index) => {
    const original = Math.max(0, Number(tier.chancePct) || 0);
    if (index === noDropIndex) {
      return { ...tier, chancePct: original * (1 - dropReductionFactor) };
    }
    return { ...tier, chancePct: original };
  });

  const total = weighted.reduce((sum, tier) => sum + tier.chancePct, 0);
  if (total <= 0) return nextTiers;
  return weighted.map((tier) => ({
    ...tier,
    chancePct: (tier.chancePct / total) * 100
  }));
}

function buildUpgradeSummary(player) {
  const upgrades = sanitizeUpgrades(player?.upgrades || {});
  const summary = {};
  for (const actionKey of Object.keys(DEFAULT_UPGRADES)) {
    summary[actionKey] = {};
    for (const upgradeKey of UPGRADE_KEYS) {
      const currentLevel = upgrades[actionKey][upgradeKey];
      const atMax = currentLevel >= MAX_UPGRADE_LEVEL;
      summary[actionKey][upgradeKey] = {
        level: currentLevel,
        maxLevel: MAX_UPGRADE_LEVEL,
        atMax,
        nextCost: atMax ? 0 : getUpgradeCost(actionKey, upgradeKey, currentLevel)
      };
    }
    summary[actionKey].effects = getUpgradeEffects(upgrades, actionKey);
  }
  return summary;
}

function buildAchievementProgress(player) {
  const state = sanitizeAchievementState(player?.achievementState || {});
  const chains = ACHIEVEMENT_CHAINS.map((chain) => {
    const progress = Math.max(0, Math.floor(chain.progressValue(player, state)));
    const currentStage = chain.thresholds.filter((threshold) => progress >= threshold).length;
    const claimedCount = Math.min(chain.thresholds.length, state[chain.key]?.claimedCount || 0);
    const nextTarget =
      currentStage < chain.thresholds.length ? chain.thresholds[currentStage] : null;
    const nextReward =
      claimedCount < chain.rewards.length ? chain.rewards[claimedCount] : null;
    return {
      key: chain.key,
      label: chain.label,
      progress,
      currentStage,
      totalStages: chain.thresholds.length,
      claimedStages: claimedCount,
      thresholds: chain.thresholds,
      rewards: chain.rewards,
      nextTarget,
      nextReward
    };
  });
  const completedStagesExcludingMeta = chains
    .filter((chain) => chain.key !== "completeAchievements")
    .reduce((sum, chain) => sum + chain.claimedStages, 0);
  return {
    chains,
    completedStagesExcludingMeta
  };
}

async function grantPendingAchievements(client, player) {
  const state = sanitizeAchievementState(player?.achievementState || {});
  const freezeMoney = isMoneyFrozen(player);
  const grantedByChain = {};
  let totalGranted = 0;
  let changed = false;

  for (const chain of ACHIEVEMENT_CHAINS) {
    const claimedCount = Math.min(
      chain.thresholds.length,
      Math.max(0, state[chain.key]?.claimedCount || 0)
    );
    let nextClaimedCount = claimedCount;
    const progress = Math.max(0, Math.floor(chain.progressValue(player, state)));
    const unlocked = chain.thresholds.filter((threshold) => progress >= threshold).length;
    while (nextClaimedCount < unlocked) {
      const reward = Number(chain.rewards[nextClaimedCount] || 0);
      if (reward > 0) {
        totalGranted += freezeMoney ? 0 : reward;
        grantedByChain[chain.key] = (grantedByChain[chain.key] || 0) + reward;
      }
      nextClaimedCount += 1;
      changed = true;
    }
    state[chain.key] = { claimedCount: nextClaimedCount };
  }

  if (!changed) {
    return {
      player,
      grantedCoins: 0,
      grantedByChain: {}
    };
  }

  const updateResult = await client.query(
    `UPDATE players
     SET money = money + $1,
         "totalMoneyEarned" = "totalMoneyEarned" + $1,
         "achievementState" = $2::jsonb,
         "updatedAt" = NOW()
     WHERE "discordUserId" = $3
     RETURNING *`,
    [totalGranted, JSON.stringify(state), player.discordUserId]
  );

  const updated = hydratePlayerRow(updateResult.rows[0] || null);
  if (!updated) throw new Error("Player not found after achievement grant update");
  return {
    player: updated,
    grantedCoins: totalGranted,
    grantedByChain
  };
}

function buildDailyState(player, nowMs) {
  const timezone = safeTimeZone(player?.timezone || "UTC");
  const currentDay = getDayKey(nowMs, timezone);
  const nextResetAt = getNextMidnightUtcMs(nowMs, timezone);
  const previousDay = previousDayKey(currentDay, timezone);

  const dailyClaimedToday = player?.dailyClaimDay === currentDay;
  const dailyNextStreak = dailyClaimedToday
    ? Math.max(1, Number(player?.dailyStreak || 0))
    : player?.dailyClaimDay === previousDay
      ? Number(player?.dailyStreak || 0) + 1
      : 1;
  const dailyBonusPct = getStreakBonusPct(dailyNextStreak);
  const dailyReward = Math.floor(DAILY_BASE_REWARD * (1 + dailyBonusPct / 100));

  const currentTaskDay = player?.dailyTaskDay === currentDay ? currentDay : currentDay;
  const taskInteractions =
    player?.dailyTaskDay === currentDay
      ? Math.max(0, Number(player?.dailyTaskInteractions || 0))
      : 0;
  const taskClaimedToday = player?.dailyTaskClaimDay === currentDay;
  const taskNextStreak = taskClaimedToday
    ? Math.max(1, Number(player?.dailyTaskStreak || 0))
    : player?.dailyTaskClaimDay === previousDay
      ? Number(player?.dailyTaskStreak || 0) + 1
      : 1;
  const taskBonusPct = getStreakBonusPct(taskNextStreak);
  const taskReward = Math.floor(
    DAILY_CHALLENGE_BASE_REWARD * (1 + taskBonusPct / 100)
  );

  return {
    timezone,
    currentDay,
    currentTaskDay,
    nextResetAt,
    daily: {
      ready: !dailyClaimedToday,
      claimedToday: dailyClaimedToday,
      streak: Math.max(0, Number(player?.dailyStreak || 0)),
      nextStreak: dailyNextStreak,
      bonusPct: dailyBonusPct,
      rewardCoins: dailyReward
    },
    challenge: {
      ready: taskInteractions >= DAILY_CHALLENGE_INTERACTIONS_REQUIRED && !taskClaimedToday,
      claimedToday: taskClaimedToday,
      streak: Math.max(0, Number(player?.dailyTaskStreak || 0)),
      nextStreak: taskNextStreak,
      bonusPct: taskBonusPct,
      requiredInteractions: DAILY_CHALLENGE_INTERACTIONS_REQUIRED,
      interactions: taskInteractions,
      rewardCoins: taskReward
    }
  };
}

async function lockActionCooldown(db, discordUserId, action) {
  const actionConfig = getActionConfig(action);
  if (!actionConfig) throw new Error("Unsupported action");

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO players ("discordUserId", money)
       VALUES ($1, 0)
       ON CONFLICT ("discordUserId") DO NOTHING`,
      [discordUserId]
    );

    const playerBefore = await getPlayerByDiscordIdForUpdate(client, discordUserId);
    if (!playerBefore) throw new Error("Player not found");
    const now = Date.now();
    const cooldownUntil = Number(playerBefore[actionConfig.cooldownColumn]) || 0;
    if (cooldownUntil > now) {
      await client.query("COMMIT");
      return {
        ok: false,
        cooldownUntil,
        cooldownRemainingMs: cooldownUntil - now,
        player: playerBefore
      };
    }

    const nextCooldownUntil = now + ACTION_COOLDOWN_MS;
    const updateResult = await client.query(
      `UPDATE players
       SET "${actionConfig.cooldownColumn}" = $1,
           "updatedAt" = NOW()
       WHERE "discordUserId" = $2
       RETURNING *`,
      [nextCooldownUntil, discordUserId]
    );
    const playerAfter = hydratePlayerRow(updateResult.rows[0] || null);
    if (!playerAfter) throw new Error("Player not found after cooldown lock update");
    await client.query("COMMIT");
    return {
      ok: true,
      cooldownUntil: nextCooldownUntil,
      cooldownRemainingMs: ACTION_COOLDOWN_MS,
      player: playerAfter
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function performAction(db, discordUserId, action, options = {}) {
  const baseActionConfig = getActionConfig(action);
  if (!baseActionConfig) throw new Error("Unsupported action");

  const {
    ignoreCooldown = false,
    preserveExistingCooldown = false,
    cashMultiplier = 1,
    forcePayoutLabel = null,
    forceBonusLabel = null
  } = options;

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO players ("discordUserId", money)
       VALUES ($1, 0)
       ON CONFLICT ("discordUserId") DO NOTHING`,
      [discordUserId]
    );

    const playerBefore = await getPlayerByDiscordIdForUpdate(client, discordUserId);
    if (!playerBefore) throw new Error("Player not found");
    const actionConfig = getEffectiveActionConfigForPlayer(playerBefore, action);
    const upgrades = sanitizeUpgrades(playerBefore.upgrades || {});
    const upgradeEffects = getUpgradeEffects(upgrades, action);
    const showcaseEffectsByAction = getShowcaseEffects(playerBefore);
    const showcaseEffects = showcaseEffectsByAction[action] || {
      cashPct: 0,
      xpPct: 0,
      cashMultiplier: 1,
      xpMultiplier: 1
    };
    const inventory = sanitizeInventory(playerBefore.inventory || {});
    const freezeMoney = isMoneyFrozen(playerBefore);

    const now = Date.now();
    const cooldownUntil = Number(playerBefore[actionConfig.cooldownColumn]) || 0;
    if (!ignoreCooldown && cooldownUntil > now) {
      await client.query("COMMIT");
      return {
        ok: false,
        cooldownUntil,
        cooldownRemainingMs: cooldownUntil - now,
        player: playerBefore
      };
    }

    const payoutTier = typeof forcePayoutLabel === "string" && forcePayoutLabel.trim()
      ? actionConfig.payoutTiers.find((tier) => tier.label === forcePayoutLabel.trim()) ||
        rollWeightedTier(actionConfig.payoutTiers)
      : rollWeightedTier(actionConfig.payoutTiers);
    const baseRewardRaw = randomInt(payoutTier.min, payoutTier.max);
    const boostedBonusTiers = applyDropBoostToBonusTiers(
      actionConfig.bonusTiers,
      upgradeEffects.dropReductionFactor
    );
    const bonusTier = typeof forceBonusLabel === "string" && forceBonusLabel.trim()
      ? boostedBonusTiers.find((tier) => tier.label === forceBonusLabel.trim()) ||
        rollWeightedTier(boostedBonusTiers)
      : rollWeightedTier(boostedBonusTiers);
    const bonusCoinsRaw = bonusTier.coins;
    const xpGained = Math.max(
      1,
      Math.round(
        randomInt(actionConfig.xpMin, actionConfig.xpMax) *
          upgradeEffects.xpMultiplier *
          showcaseEffects.xpMultiplier
      )
    );

    let nextLevel = Math.max(1, Number(playerBefore.level) || 1);
    let nextXp = Math.max(0, Number(playerBefore.xp) || 0) + xpGained;
    let levelRewardTotal = 0;
    const levelUps = [];

    while (nextLevel < MAX_LEVEL) {
      const neededXp = xpRequiredForLevel(nextLevel);
      if (nextXp < neededXp) break;
      nextXp -= neededXp;
      nextLevel += 1;
      const levelRewardRaw = levelRewardCoins(nextLevel);
      const levelReward = Math.round(
        levelRewardRaw *
          cashMultiplier *
          upgradeEffects.cashMultiplier *
          showcaseEffects.cashMultiplier
      );
      levelRewardTotal += levelReward;
      levelUps.push({ level: nextLevel, rewardCoins: levelReward });
    }

    if (nextLevel >= MAX_LEVEL) {
      nextLevel = MAX_LEVEL;
      nextXp = 0;
    }

    const effectiveCashMultiplier =
      cashMultiplier * upgradeEffects.cashMultiplier * showcaseEffects.cashMultiplier;
    const baseReward = Math.round(baseRewardRaw * effectiveCashMultiplier);
    const bonusCoins = Math.round(bonusCoinsRaw * effectiveCashMultiplier);
    const totalRewardCoins = baseReward + bonusCoins + levelRewardTotal;
    const appliedRewardCoins = freezeMoney ? 0 : totalRewardCoins;
    const bonusItemKey = bonusTier.itemKey || null;
    if (bonusItemKey) {
      inventory[bonusItemKey] = Math.max(0, Math.floor(Number(inventory[bonusItemKey]) || 0)) + 1;
    }
    const digTrophyGain = bonusItemKey === "collectors_greed" ? 1 : 0;
    const fishTrophyGain = bonusItemKey === "midnight_ocean" ? 1 : 0;
    const huntTrophyGain = bonusItemKey === "many_heads" ? 1 : 0;
    const bonusRewardCountGain = bonusTier.coins > 0 || bonusTier.itemKey ? 1 : 0;

    const dailyState = buildDailyState(playerBefore, now);
    const nextDailyTaskInteractions = dailyState.challenge.interactions + 1;

    const nextCooldownUntil =
      preserveExistingCooldown && cooldownUntil > now
        ? cooldownUntil
        : now + ACTION_COOLDOWN_MS;

    const updateResult = await client.query(
      `UPDATE players
       SET money = money + $1,
           xp = $2,
           "totalXpEarned" = "totalXpEarned" + $3,
           level = $4,
           "totalCommandsUsed" = "totalCommandsUsed" + 1,
           "totalMoneyEarned" = "totalMoneyEarned" + $5,
           "digTrophyCount" = "digTrophyCount" + $6,
           "fishTrophyCount" = "fishTrophyCount" + $7,
           "huntTrophyCount" = "huntTrophyCount" + $8,
           "${actionConfig.cooldownColumn}" = $9,
           "dailyTaskDay" = $10,
           "dailyTaskInteractions" = $11,
           "totalBonusRewards" = "totalBonusRewards" + $12,
           inventory = $13::jsonb,
           "updatedAt" = NOW()
       WHERE "discordUserId" = $14
       RETURNING *`,
      [
        appliedRewardCoins,
        nextXp,
        xpGained,
        nextLevel,
        appliedRewardCoins,
        digTrophyGain,
        fishTrophyGain,
        huntTrophyGain,
        nextCooldownUntil,
        dailyState.currentDay,
        nextDailyTaskInteractions,
        bonusRewardCountGain,
        JSON.stringify(inventory),
        discordUserId
      ]
    );
    const playerAfterRaw = hydratePlayerRow(updateResult.rows[0] || null);
    if (!playerAfterRaw) throw new Error("Player not found after action update");
    const achievementGrant = await grantPendingAchievements(client, playerAfterRaw);
    const playerAfter = achievementGrant.player;
    await client.query("COMMIT");
    return {
      ok: true,
      cooldownUntil: nextCooldownUntil,
      cooldownRemainingMs: ACTION_COOLDOWN_MS,
      reward: {
        totalCoins: totalRewardCoins,
        baseCoins: baseReward,
        baseLabel: payoutTier.label,
        bonusCoins,
        bonusLabel: bonusTier.label,
        bonusItemKey,
        bonusItemImage: bonusTier.itemImage || null,
        bonusChancePct:
          boostedBonusTiers.find((tier) => tier.label === bonusTier.label)?.chancePct ||
          bonusTier.chancePct,
        showcaseBoost: {
          cashPct: showcaseEffects.cashPct,
          xpPct: showcaseEffects.xpPct
        },
        xpGained,
        levelRewardCoins: levelRewardTotal,
        levelUps,
        achievementCoins: achievementGrant.grantedCoins
      },
      player: playerAfter
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function setPlayerTimezone(db, discordUserId, timezone) {
  const safeTz = safeTimeZone(timezone);
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO players ("discordUserId", money, timezone, upgrades, "achievementState")
       VALUES ($1, 0, $2, $3::jsonb, $4::jsonb)
       ON CONFLICT ("discordUserId") DO NOTHING`,
      [
        discordUserId,
        safeTz,
        JSON.stringify(DEFAULT_UPGRADES),
        JSON.stringify({})
      ]
    );

    const player = await getPlayerByDiscordIdForUpdate(client, discordUserId);
    if (!player) throw new Error("Player not found");
    if (player?.timezone && player.timezone !== safeTz) {
      throw new Error("Timezone already set and cannot be changed");
    }

    let updated = player;
    if (!player?.timezone) {
      const updateResult = await client.query(
        `UPDATE players
         SET timezone = $1,
             "updatedAt" = NOW()
         WHERE "discordUserId" = $2
         RETURNING *`,
        [safeTz, discordUserId]
      );
      updated = hydratePlayerRow(updateResult.rows[0] || null);
      if (!updated) throw new Error("Player not found after timezone update");
    }

    await client.query("COMMIT");
    return updated;
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch (_err) {
      // ignore
    }
    throw err;
  } finally {
    client.release();
  }
}

async function getDailySummary(db, discordUserId) {
  const player = await getPlayerByDiscordId(db, discordUserId);
  if (!player) return null;
  const now = Date.now();
  return {
    timezone: player.timezone || null,
    timezoneConfigured: Boolean(player.timezone),
    now,
    ...buildDailyState(player, now)
  };
}

async function claimDailyReward(db, discordUserId) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO players ("discordUserId", money, upgrades, "achievementState")
       VALUES ($1, 0, $2::jsonb, $3::jsonb)
       ON CONFLICT ("discordUserId") DO NOTHING`,
      [discordUserId, JSON.stringify(DEFAULT_UPGRADES), JSON.stringify({})]
    );

    const playerBefore = await getPlayerByDiscordIdForUpdate(client, discordUserId);
    if (!playerBefore) throw new Error("Player not found");
    const now = Date.now();
    if (!playerBefore?.timezone) {
      await client.query("COMMIT");
      return {
        ok: false,
        reason: "Set timezone before claiming daily rewards",
        state: buildDailyState(playerBefore, now),
        player: playerBefore
      };
    }
    const dailyState = buildDailyState(playerBefore, now);
    if (!dailyState.daily.ready) {
      await client.query("COMMIT");
      return {
        ok: false,
        reason: "Daily reward already claimed today",
        state: dailyState,
        player: playerBefore
      };
    }

    const previousDay = previousDayKey(dailyState.currentDay, dailyState.timezone);
    const nextStreak =
      playerBefore.dailyClaimDay === previousDay
        ? Number(playerBefore.dailyStreak || 0) + 1
        : 1;
    const rewardCoins = Math.floor(
      DAILY_BASE_REWARD * (1 + getStreakBonusPct(nextStreak) / 100)
    );
    const appliedRewardCoins = isMoneyFrozen(playerBefore) ? 0 : rewardCoins;

    const updateResult = await client.query(
      `UPDATE players
       SET money = money + $1,
           "totalMoneyEarned" = "totalMoneyEarned" + $1,
           "dailyClaimDay" = $2,
           "dailyStreak" = $3,
           "updatedAt" = NOW()
       WHERE "discordUserId" = $4
       RETURNING *`,
      [appliedRewardCoins, dailyState.currentDay, nextStreak, discordUserId]
    );
    const playerAfterDaily = hydratePlayerRow(updateResult.rows[0] || null);
    if (!playerAfterDaily) throw new Error("Player not found after daily claim update");
    const achievementGrant = await grantPendingAchievements(client, playerAfterDaily);
    await client.query("COMMIT");
    return {
      ok: true,
      rewardCoins: appliedRewardCoins,
      achievementCoins: achievementGrant.grantedCoins,
      player: achievementGrant.player,
      state: buildDailyState(achievementGrant.player, now)
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function claimDailyChallengeReward(db, discordUserId) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO players ("discordUserId", money, upgrades, "achievementState")
       VALUES ($1, 0, $2::jsonb, $3::jsonb)
       ON CONFLICT ("discordUserId") DO NOTHING`,
      [discordUserId, JSON.stringify(DEFAULT_UPGRADES), JSON.stringify({})]
    );

    const playerBefore = await getPlayerByDiscordIdForUpdate(client, discordUserId);
    if (!playerBefore) throw new Error("Player not found");
    const now = Date.now();
    if (!playerBefore?.timezone) {
      await client.query("COMMIT");
      return {
        ok: false,
        reason: "Set timezone before claiming daily rewards",
        state: buildDailyState(playerBefore, now),
        player: playerBefore
      };
    }
    const dailyState = buildDailyState(playerBefore, now);
    if (!dailyState.challenge.ready) {
      await client.query("COMMIT");
      return {
        ok: false,
        reason: "Daily challenge is not ready yet",
        state: dailyState,
        player: playerBefore
      };
    }

    const previousDay = previousDayKey(dailyState.currentDay, dailyState.timezone);
    const nextStreak =
      playerBefore.dailyTaskClaimDay === previousDay
        ? Number(playerBefore.dailyTaskStreak || 0) + 1
        : 1;
    const rewardCoins = Math.floor(
      DAILY_CHALLENGE_BASE_REWARD * (1 + getStreakBonusPct(nextStreak) / 100)
    );
    const appliedRewardCoins = isMoneyFrozen(playerBefore) ? 0 : rewardCoins;

    const updateResult = await client.query(
      `UPDATE players
       SET money = money + $1,
           "totalMoneyEarned" = "totalMoneyEarned" + $1,
           "dailyTaskClaimDay" = $2,
           "dailyTaskStreak" = $3,
           "dailyTaskDay" = $2,
           "updatedAt" = NOW()
       WHERE "discordUserId" = $4
       RETURNING *`,
      [appliedRewardCoins, dailyState.currentDay, nextStreak, discordUserId]
    );
    const playerAfterClaim = hydratePlayerRow(updateResult.rows[0] || null);
    if (!playerAfterClaim) throw new Error("Player not found after challenge claim update");
    const achievementGrant = await grantPendingAchievements(client, playerAfterClaim);
    await client.query("COMMIT");
    return {
      ok: true,
      rewardCoins: appliedRewardCoins,
      achievementCoins: achievementGrant.grantedCoins,
      player: achievementGrant.player,
      state: buildDailyState(achievementGrant.player, now)
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function getAchievementSummary(db, discordUserId) {
  const player = await getPlayerByDiscordId(db, discordUserId);
  if (!player) return null;
  return buildAchievementProgress(player);
}

async function settleGamblingResult(
  db,
  discordUserId,
  { game, coinDelta, won = false, countInteraction = true }
) {
  const allowedGames = new Set(["coinflip", "blackjack", "slots"]);
  if (!allowedGames.has(game)) throw new Error("Unsupported gambling game");
  if (!Number.isInteger(coinDelta)) throw new Error("coinDelta must be an integer");
  if (Math.abs(coinDelta) > MAX_BET_COINS * 12) {
    throw new Error("coinDelta exceeds allowed range");
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO players ("discordUserId", money, upgrades, "achievementState")
       VALUES ($1, 0, $2::jsonb, $3::jsonb)
       ON CONFLICT ("discordUserId") DO NOTHING`,
      [discordUserId, JSON.stringify(DEFAULT_UPGRADES), JSON.stringify({})]
    );

    const playerBefore = await getPlayerByDiscordIdForUpdate(client, discordUserId);
    if (!playerBefore) throw new Error("Player not found");
    if (Number(playerBefore.level || 1) < 5) {
      await client.query("COMMIT");
      return {
        ok: false,
        error: "Gambling unlocks at level 5",
        player: playerBefore
      };
    }
    const freezeMoney = isMoneyFrozen(playerBefore);
    const appliedCoinDelta = freezeMoney ? 0 : coinDelta;

    if (!freezeMoney && coinDelta < 0 && Number(playerBefore.money || 0) < Math.abs(coinDelta)) {
      await client.query("COMMIT");
      return {
        ok: false,
        error: "Insufficient funds",
        player: playerBefore
      };
    }

    const now = Date.now();
    const dailyState = buildDailyState(playerBefore, now);
    const interactionGain = countInteraction ? 1 : 0;
    const nextInteractions =
      interactionGain > 0
        ? dailyState.challenge.interactions + interactionGain
        : dailyState.challenge.interactions;
    const positiveGain = Math.max(0, appliedCoinDelta);

    const updateResult = await client.query(
      `UPDATE players
       SET money = GREATEST(0, money + $1),
           "totalMoneyEarned" = "totalMoneyEarned" + $2,
           "totalCommandsUsed" = "totalCommandsUsed" + $3,
           "totalGamblingPlays" = "totalGamblingPlays" + $4,
           "totalGamblingWins" = "totalGamblingWins" + $5,
           "dailyTaskDay" = $6,
           "dailyTaskInteractions" = $7,
           "updatedAt" = NOW()
       WHERE "discordUserId" = $8
       RETURNING *`,
      [
        appliedCoinDelta,
        positiveGain,
        interactionGain,
        interactionGain,
        won ? 1 : 0,
        dailyState.currentDay,
        nextInteractions,
        discordUserId
      ]
    );
    const playerAfterResult = hydratePlayerRow(updateResult.rows[0] || null);
    if (!playerAfterResult) throw new Error("Player not found after gambling update");
    const achievementGrant = await grantPendingAchievements(client, playerAfterResult);
    await client.query("COMMIT");
    return {
      ok: true,
      player: achievementGrant.player,
      achievementCoins: achievementGrant.grantedCoins
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function purchaseUpgrade(db, discordUserId, action, upgradeKey) {
  if (!ACTIONS[action]) throw new Error("Unsupported action");
  if (!UPGRADE_KEYS.includes(upgradeKey)) throw new Error("Unsupported upgrade type");

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO players ("discordUserId", money, upgrades, "achievementState")
       VALUES ($1, 0, $2::jsonb, $3::jsonb)
       ON CONFLICT ("discordUserId") DO NOTHING`,
      [discordUserId, JSON.stringify(DEFAULT_UPGRADES), JSON.stringify({})]
    );

    const playerBefore = await getPlayerByDiscordIdForUpdate(client, discordUserId);
    if (!playerBefore) throw new Error("Player not found");
    const freezeMoney = isMoneyFrozen(playerBefore);
    const upgrades = sanitizeUpgrades(playerBefore.upgrades || {});
    const currentLevel = upgrades[action][upgradeKey];
    if (currentLevel >= MAX_UPGRADE_LEVEL) {
      await client.query("COMMIT");
      return {
        ok: false,
        error: "Upgrade is already at max level",
        cost: 0,
        player: playerBefore
      };
    }
    const cost = getUpgradeCost(action, upgradeKey, currentLevel);
    const purchaseColumnByAction = {
      dig: "totalDigUpgradesPurchased",
      fish: "totalFishUpgradesPurchased",
      hunt: "totalHuntUpgradesPurchased"
    };
    const purchaseColumn = purchaseColumnByAction[action];

    if (!freezeMoney && Number(playerBefore.money || 0) < cost) {
      await client.query("COMMIT");
      return {
        ok: false,
        error: "Not enough coins",
        cost,
        player: playerBefore
      };
    }

    upgrades[action][upgradeKey] = currentLevel + 1;
    const updateResult = await client.query(
      `UPDATE players
       SET money = money - $1,
           upgrades = $2::jsonb,
           "${purchaseColumn}" = "${purchaseColumn}" + 1,
           "updatedAt" = NOW()
       WHERE "discordUserId" = $3
       RETURNING *`,
      [freezeMoney ? 0 : cost, JSON.stringify(upgrades), discordUserId]
    );
    const playerAfterRaw = hydratePlayerRow(updateResult.rows[0] || null);
    if (!playerAfterRaw) throw new Error("Player not found after upgrade purchase update");
    const achievementGrant = await grantPendingAchievements(client, playerAfterRaw);
    const playerAfter = achievementGrant.player;
    await client.query("COMMIT");
    return {
      ok: true,
      cost,
      purchasedLevels: 1,
      achievementCoins: achievementGrant.grantedCoins,
      player: playerAfter,
      upgrades: buildUpgradeSummary(playerAfter)
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function purchaseUpgradeMax(db, discordUserId, action, upgradeKey) {
  if (!ACTIONS[action]) throw new Error("Unsupported action");
  if (!UPGRADE_KEYS.includes(upgradeKey)) throw new Error("Unsupported upgrade type");

  const purchaseColumnByAction = {
    dig: "totalDigUpgradesPurchased",
    fish: "totalFishUpgradesPurchased",
    hunt: "totalHuntUpgradesPurchased"
  };
  const purchaseColumn = purchaseColumnByAction[action];

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO players ("discordUserId", money, upgrades, "achievementState")
       VALUES ($1, 0, $2::jsonb, $3::jsonb)
       ON CONFLICT ("discordUserId") DO NOTHING`,
      [discordUserId, JSON.stringify(DEFAULT_UPGRADES), JSON.stringify({})]
    );

    const playerBefore = await getPlayerByDiscordIdForUpdate(client, discordUserId);
    if (!playerBefore) throw new Error("Player not found");
    const freezeMoney = isMoneyFrozen(playerBefore);
    const upgrades = sanitizeUpgrades(playerBefore.upgrades || {});
    const currentLevel = upgrades[action][upgradeKey];

    if (currentLevel >= MAX_UPGRADE_LEVEL) {
      await client.query("COMMIT");
      return {
        ok: false,
        error: "Upgrade is already at max level",
        cost: 0,
        purchasedLevels: 0,
        player: playerBefore
      };
    }

    let nextLevel = currentLevel;
    let totalCost = 0;
    if (freezeMoney) {
      nextLevel = MAX_UPGRADE_LEVEL;
    } else {
      let remainingMoney = Math.max(0, Number(playerBefore.money || 0));
      while (nextLevel < MAX_UPGRADE_LEVEL) {
        const cost = getUpgradeCost(action, upgradeKey, nextLevel);
        if (cost <= 0 || remainingMoney < cost) break;
        remainingMoney -= cost;
        totalCost += cost;
        nextLevel += 1;
      }
    }

    const purchasedLevels = Math.max(0, nextLevel - currentLevel);
    if (purchasedLevels <= 0) {
      await client.query("COMMIT");
      return {
        ok: false,
        error: "Not enough coins",
        cost: getUpgradeCost(action, upgradeKey, currentLevel),
        purchasedLevels: 0,
        player: playerBefore
      };
    }

    upgrades[action][upgradeKey] = nextLevel;
    const updateResult = await client.query(
      `UPDATE players
       SET money = money - $1,
           upgrades = $2::jsonb,
           "${purchaseColumn}" = "${purchaseColumn}" + $3,
           "updatedAt" = NOW()
       WHERE "discordUserId" = $4
       RETURNING *`,
      [freezeMoney ? 0 : totalCost, JSON.stringify(upgrades), purchasedLevels, discordUserId]
    );
    const playerAfterRaw = hydratePlayerRow(updateResult.rows[0] || null);
    if (!playerAfterRaw) throw new Error("Player not found after max upgrade purchase update");
    const achievementGrant = await grantPendingAchievements(client, playerAfterRaw);
    const playerAfter = achievementGrant.player;
    await client.query("COMMIT");
    return {
      ok: true,
      cost: freezeMoney ? 0 : totalCost,
      purchasedLevels,
      achievementCoins: achievementGrant.grantedCoins,
      player: playerAfter,
      upgrades: buildUpgradeSummary(playerAfter)
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function sellInventoryItem(db, discordUserId, itemKey, quantity = null) {
  if (!ITEM_DEFS[itemKey]) throw new Error("Unsupported item");
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO players ("discordUserId", money, upgrades, "achievementState")
       VALUES ($1, 0, $2::jsonb, $3::jsonb)
       ON CONFLICT ("discordUserId") DO NOTHING`,
      [discordUserId, JSON.stringify(DEFAULT_UPGRADES), JSON.stringify({})]
    );
    const playerBefore = await getPlayerByDiscordIdForUpdate(client, discordUserId);
    if (!playerBefore) throw new Error("Player not found");
    const inventory = sanitizeInventory(playerBefore.inventory || {});
    const ownedCount = Math.max(0, Math.floor(Number(inventory[itemKey]) || 0));
    if (ownedCount <= 0) {
      await client.query("COMMIT");
      return { ok: false, error: "You do not have that item", player: playerBefore };
    }

    const showcaseSlots = sanitizeShowcaseSlots(playerBefore.showcaseSlots);
    const showcasedItemsBefore = sanitizeShowcasedItems(
      playerBefore.showcasedItems || [],
      showcaseSlots,
      inventory
    );
    const reserveCount = showcasedItemsBefore.filter((key) => key === itemKey).length;
    const maxSellable = Math.max(0, ownedCount - reserveCount);
    if (maxSellable <= 0) {
      await client.query("COMMIT");
      return {
        ok: false,
        error: `This showcased item is locked. Keep at least ${reserveCount} in inventory.`,
        player: playerBefore
      };
    }

    const requestedQty =
      quantity === null || quantity === undefined
        ? maxSellable
        : Math.max(1, Math.floor(Number(quantity) || 1));
    const sellQty = Math.max(1, Math.min(maxSellable, requestedQty));
    const def = ITEM_DEFS[itemKey];
    const grossCoins = sellQty * Math.max(0, Math.floor(Number(def.sellCoins) || 0));
    const appliedCoins = isMoneyFrozen(playerBefore) ? 0 : grossCoins;

    const remaining = ownedCount - sellQty;
    if (remaining > 0) inventory[itemKey] = remaining;
    else delete inventory[itemKey];

    const showcasedItems = sanitizeShowcasedItems(
      playerBefore.showcasedItems || [],
      showcaseSlots,
      inventory
    );

    const updateResult = await client.query(
      `UPDATE players
       SET money = money + $1,
           "totalMoneyEarned" = "totalMoneyEarned" + $1,
           inventory = $2::jsonb,
           "showcasedItems" = $3::jsonb,
           "updatedAt" = NOW()
       WHERE "discordUserId" = $4
       RETURNING *`,
      [appliedCoins, JSON.stringify(inventory), JSON.stringify(showcasedItems), discordUserId]
    );
    const playerAfter = hydratePlayerRow(updateResult.rows[0] || null);
    if (!playerAfter) throw new Error("Player not found after inventory sell update");
    await client.query("COMMIT");
    return {
      ok: true,
      soldQuantity: sellQty,
      coinsEarned: appliedCoins,
      player: playerAfter
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function purchaseShowcaseSlot(db, discordUserId) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO players ("discordUserId", money, upgrades, "achievementState")
       VALUES ($1, 0, $2::jsonb, $3::jsonb)
       ON CONFLICT ("discordUserId") DO NOTHING`,
      [discordUserId, JSON.stringify(DEFAULT_UPGRADES), JSON.stringify({})]
    );
    const playerBefore = await getPlayerByDiscordIdForUpdate(client, discordUserId);
    if (!playerBefore) throw new Error("Player not found");
    const currentSlots = sanitizeShowcaseSlots(playerBefore.showcaseSlots);
    const nextCost = getNextShowcaseSlotCost(currentSlots);
    if (nextCost === null) {
      await client.query("COMMIT");
      return { ok: false, error: "Showcase is already maxed", player: playerBefore };
    }
    const freezeMoney = isMoneyFrozen(playerBefore);
    if (!freezeMoney && Number(playerBefore.money || 0) < nextCost) {
      await client.query("COMMIT");
      return {
        ok: false,
        error: "Not enough coins",
        cost: nextCost,
        player: playerBefore
      };
    }

    const updateResult = await client.query(
      `UPDATE players
       SET money = money - $1,
           "showcaseSlots" = $2,
           "updatedAt" = NOW()
       WHERE "discordUserId" = $3
       RETURNING *`,
      [freezeMoney ? 0 : nextCost, currentSlots + 1, discordUserId]
    );
    const playerAfter = hydratePlayerRow(updateResult.rows[0] || null);
    if (!playerAfter) throw new Error("Player not found after showcase slot purchase update");
    await client.query("COMMIT");
    return {
      ok: true,
      cost: freezeMoney ? 0 : nextCost,
      player: playerAfter
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function setShowcasedItems(db, discordUserId, itemKeys = []) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO players ("discordUserId", money, upgrades, "achievementState")
       VALUES ($1, 0, $2::jsonb, $3::jsonb)
       ON CONFLICT ("discordUserId") DO NOTHING`,
      [discordUserId, JSON.stringify(DEFAULT_UPGRADES), JSON.stringify({})]
    );
    const playerBefore = await getPlayerByDiscordIdForUpdate(client, discordUserId);
    if (!playerBefore) throw new Error("Player not found");
    const slots = sanitizeShowcaseSlots(playerBefore.showcaseSlots);
    const inventory = sanitizeInventory(playerBefore.inventory || {});
    const nextItems = sanitizeShowcasedItems(itemKeys, slots, inventory);

    const updateResult = await client.query(
      `UPDATE players
       SET "showcasedItems" = $1::jsonb,
           "updatedAt" = NOW()
       WHERE "discordUserId" = $2
       RETURNING *`,
      [JSON.stringify(nextItems), discordUserId]
    );
    const playerAfter = hydratePlayerRow(updateResult.rows[0] || null);
    if (!playerAfter) throw new Error("Player not found after showcase update");
    await client.query("COMMIT");
    return { ok: true, player: playerAfter };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function setPlayerUpgradeLevel(db, discordUserId, action, upgradeKey, level) {
  if (!ACTIONS[action]) throw new Error("Unsupported action");
  if (!UPGRADE_KEYS.includes(upgradeKey)) throw new Error("Unsupported upgrade type");
  const targetLevel = Math.max(
    0,
    Math.min(MAX_UPGRADE_LEVEL, Math.floor(Number(level) || 0))
  );

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO players ("discordUserId", money, upgrades, "achievementState")
       VALUES ($1, 0, $2::jsonb, $3::jsonb)
       ON CONFLICT ("discordUserId") DO NOTHING`,
      [discordUserId, JSON.stringify(DEFAULT_UPGRADES), JSON.stringify({})]
    );
    const playerBefore = await getPlayerByDiscordIdForUpdate(client, discordUserId);
    if (!playerBefore) throw new Error("Player not found");
    const upgrades = sanitizeUpgrades(playerBefore.upgrades || {});
    upgrades[action][upgradeKey] = targetLevel;

    const updateResult = await client.query(
      `UPDATE players
       SET upgrades = $1::jsonb,
           "updatedAt" = NOW()
       WHERE "discordUserId" = $2
       RETURNING *`,
      [JSON.stringify(upgrades), discordUserId]
    );
    const playerAfter = hydratePlayerRow(updateResult.rows[0] || null);
    if (!playerAfter) throw new Error("Player not found after dev upgrade set");
    await client.query("COMMIT");
    return {
      ok: true,
      player: playerAfter,
      upgrades: buildUpgradeSummary(playerAfter)
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  ACTION_COOLDOWN_MS,
  MAX_LEVEL,
  DAILY_CHALLENGE_INTERACTIONS_REQUIRED,
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
  buildAchievementProgress,
  buildDailyState,
  buildUpgradeSummary,
  buildInventorySummary,
  buildShowcaseSummary,
  getShowcaseEffects,
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
  setPlayerUpgradeLevel,
  xpRequiredForLevel,
  levelRewardCoins
};
