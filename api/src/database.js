const { Pool } = require("pg");

const ACTION_COOLDOWN_MS = 5000;
const MAX_LEVEL = 100;
const MAX_BET_COINS = 1_000_000;
const DAILY_BASE_REWARD = 250;
const DAILY_CHALLENGE_BASE_REWARD = 700;
const DAILY_CHALLENGE_INTERACTIONS_REQUIRED = 100;

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
    rewards: [300, 1200, 2600, 4200, 6000, 18000, 50000],
    progressValue: (player) => Number(player.digTrophyCount || 0)
  },
  {
    key: "midnightOcean",
    label: "Midnight Ocean",
    thresholds: [1, 5, 10, 15, 20, 50, 100],
    rewards: [300, 1200, 2600, 4200, 6000, 18000, 50000],
    progressValue: (player) => Number(player.fishTrophyCount || 0)
  },
  {
    key: "manyHeads",
    label: "Many Heads",
    thresholds: [1, 5, 10, 15, 20, 50, 100],
    rewards: [300, 1200, 2600, 4200, 6000, 18000, 50000],
    progressValue: (player) => Number(player.huntTrophyCount || 0)
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
    xpMax: 20,
    payoutTiers: [
      { chancePct: 45, min: 6, max: 12, label: "Small Pouch" },
      { chancePct: 32, min: 13, max: 20, label: "Good Find" },
      { chancePct: 18, min: 21, max: 34, label: "Lucky Find" },
      { chancePct: 5, min: 35, max: 52, label: "Jackpot Vein" }
    ],
    bonusTiers: [
      { chancePct: 87, coins: 0, label: "No extra drop" },
      { chancePct: 10, coins: 8, label: "Gold Coin" },
      { chancePct: 2, coins: 20, label: "Da Bone" },
      {
        chancePct: 1,
        coins: 0,
        label: "Collectors Greed",
        itemKey: "dig_trophy",
        itemImage: "/assets/dig-trophy.png"
      }
    ]
  },
  fish: {
    cooldownColumn: "fishCooldownUntil",
    xpMin: 14,
    xpMax: 22,
    payoutTiers: [
      { chancePct: 42, min: 8, max: 14, label: "Common Catch" },
      { chancePct: 34, min: 15, max: 24, label: "Fresh Catch" },
      { chancePct: 19, min: 25, max: 38, label: "Big Catch" },
      { chancePct: 5, min: 39, max: 58, label: "Legend Catch" }
    ],
    bonusTiers: [
      { chancePct: 85, coins: 0, label: "No extra drop" },
      { chancePct: 11, coins: 10, label: "Treasure Scale" },
      { chancePct: 3, coins: 24, label: "Ancient Chest Key" },
      {
        chancePct: 1,
        coins: 0,
        label: "Midnight Ocean",
        itemKey: "fish_trophy",
        itemImage: "/assets/fish-trophy.png"
      }
    ]
  },
  hunt: {
    cooldownColumn: "huntCooldownUntil",
    xpMin: 16,
    xpMax: 25,
    payoutTiers: [
      { chancePct: 40, min: 10, max: 18, label: "Small Trophy" },
      { chancePct: 35, min: 19, max: 30, label: "Strong Trophy" },
      { chancePct: 20, min: 31, max: 46, label: "Prime Trophy" },
      { chancePct: 5, min: 47, max: 68, label: "Elite Trophy" }
    ],
    bonusTiers: [
      { chancePct: 84, coins: 0, label: "No extra drop" },
      { chancePct: 12, coins: 12, label: "Pelt Bonus" },
      { chancePct: 3, coins: 30, label: "Rare Antler Set" },
      {
        chancePct: 1,
        coins: 0,
        label: "Many Heads",
        itemKey: "hunt_trophy",
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
  "achievementState",
  upgrades
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
      const parsed = Math.max(0, Math.floor(Number(sourceAction[upgradeKey]) || 0));
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

function xpRequiredForLevel(level) {
  if (level >= MAX_LEVEL) return 0;
  if (level <= 10) return 60 + level * 18;
  if (level <= 40) return 240 + (level - 10) * 24;
  return 960 + (level - 40) * 27;
}

function levelRewardCoins(level) {
  return 40 + level * 14;
}

function createDatabase(connectionString) {
  return new Pool({
    connectionString,
    ssl: connectionString.includes("localhost")
      ? false
      : { rejectUnauthorized: false }
  });
}

async function getPlayerByDiscordId(db, discordUserId, client = db) {
  const result = await client.query(PLAYER_SELECT_SQL, [discordUserId]);
  const row = result.rows[0] || null;
  if (!row) return null;
  return {
    ...row,
    timezone: row.timezone ? safeTimeZone(row.timezone) : null,
    devConfig: sanitizeDevConfig(row.devConfig || {}),
    upgrades: sanitizeUpgrades(row.upgrades || {}),
    achievementState: sanitizeAchievementState(row.achievementState || {})
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
  const baseByKey = {
    cash: 220,
    xp: 260,
    drop: 3200
  };
  const growthByKey = {
    cash: 1.33,
    xp: 1.38,
    drop: 1.72
  };
  const base = baseByKey[upgradeKey] || 500;
  const growth = growthByKey[upgradeKey] || 1.4;
  const actionBias = action === "hunt" ? 1.08 : action === "fish" ? 1.03 : 1;
  const level = Math.max(0, Math.floor(Number(currentLevel) || 0));
  return Math.max(1, Math.floor(base * Math.pow(growth, level) * actionBias));
}

function getUpgradeEffects(upgrades, action) {
  const actionUpgrades = sanitizeUpgrades(upgrades)[action] || DEFAULT_UPGRADES[action];
  return {
    cashMultiplier: 1 + actionUpgrades.cash * 0.05,
    xpMultiplier: 1 + actionUpgrades.xp * 0.05,
    dropReductionFactor: Math.min(0.5, actionUpgrades.drop * 0.015)
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
      summary[actionKey][upgradeKey] = {
        level: currentLevel,
        nextCost: getUpgradeCost(actionKey, upgradeKey, currentLevel)
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

  await client.query(
    `UPDATE players
     SET money = money + $1,
         "totalMoneyEarned" = "totalMoneyEarned" + $1,
         "achievementState" = $2::jsonb,
         "updatedAt" = NOW()
     WHERE "discordUserId" = $3`,
    [totalGranted, JSON.stringify(state), player.discordUserId]
  );

  const updated = await getPlayerByDiscordId(client, player.discordUserId, client);
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

    const currentPlayerResult = await client.query(
      `${PLAYER_SELECT_SQL} FOR UPDATE`,
      [discordUserId]
    );
    const playerBefore = currentPlayerResult.rows[0];
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
    await client.query(
      `UPDATE players
       SET "${actionConfig.cooldownColumn}" = $1,
           "updatedAt" = NOW()
       WHERE "discordUserId" = $2`,
      [nextCooldownUntil, discordUserId]
    );
    const playerAfter = await getPlayerByDiscordId(db, discordUserId, client);
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
    cashMultiplier = 1
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

    const currentPlayerResult = await client.query(
      `${PLAYER_SELECT_SQL} FOR UPDATE`,
      [discordUserId]
    );
    const playerBefore = await getPlayerByDiscordId(client, discordUserId, client);
    const actionConfig = getEffectiveActionConfigForPlayer(playerBefore, action);
    const upgrades = sanitizeUpgrades(playerBefore.upgrades || {});
    const upgradeEffects = getUpgradeEffects(upgrades, action);
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

    const payoutTier = rollWeightedTier(actionConfig.payoutTiers);
    const baseRewardRaw = randomInt(payoutTier.min, payoutTier.max);
    const boostedBonusTiers = applyDropBoostToBonusTiers(
      actionConfig.bonusTiers,
      upgradeEffects.dropReductionFactor
    );
    const bonusTier = rollWeightedTier(boostedBonusTiers);
    const bonusCoinsRaw = bonusTier.coins;
    const xpGained = Math.max(
      1,
      Math.round(randomInt(actionConfig.xpMin, actionConfig.xpMax) * upgradeEffects.xpMultiplier)
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
        levelRewardRaw * cashMultiplier * upgradeEffects.cashMultiplier
      );
      levelRewardTotal += levelReward;
      levelUps.push({ level: nextLevel, rewardCoins: levelReward });
    }

    if (nextLevel >= MAX_LEVEL) {
      nextLevel = MAX_LEVEL;
      nextXp = 0;
    }

    const effectiveCashMultiplier = cashMultiplier * upgradeEffects.cashMultiplier;
    const baseReward = Math.round(baseRewardRaw * effectiveCashMultiplier);
    const bonusCoins = Math.round(bonusCoinsRaw * effectiveCashMultiplier);
    const totalRewardCoins = baseReward + bonusCoins + levelRewardTotal;
    const appliedRewardCoins = freezeMoney ? 0 : totalRewardCoins;
    const digTrophyGain = bonusTier.itemKey === "dig_trophy" ? 1 : 0;
    const fishTrophyGain = bonusTier.itemKey === "fish_trophy" ? 1 : 0;
    const huntTrophyGain = bonusTier.itemKey === "hunt_trophy" ? 1 : 0;
    const bonusRewardCountGain = bonusTier.coins > 0 || bonusTier.itemKey ? 1 : 0;

    const dailyState = buildDailyState(playerBefore, now);
    const nextDailyTaskInteractions = dailyState.challenge.interactions + 1;

    const nextCooldownUntil =
      preserveExistingCooldown && cooldownUntil > now
        ? cooldownUntil
        : now + ACTION_COOLDOWN_MS;

    await client.query(
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
           "updatedAt" = NOW()
       WHERE "discordUserId" = $13`,
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
        discordUserId
      ]
    );

    const playerAfterRaw = await getPlayerByDiscordId(db, discordUserId, client);
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
        bonusItemKey: bonusTier.itemKey || null,
        bonusItemImage: bonusTier.itemImage || null,
        bonusChancePct:
          boostedBonusTiers.find((tier) => tier.label === bonusTier.label)?.chancePct ||
          bonusTier.chancePct,
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

    const player = await getPlayerByDiscordId(client, discordUserId, client);
    if (player?.timezone && player.timezone !== safeTz) {
      throw new Error("Timezone already set and cannot be changed");
    }

    if (!player?.timezone) {
      await client.query(
        `UPDATE players
         SET timezone = $1,
             "updatedAt" = NOW()
         WHERE "discordUserId" = $2`,
        [safeTz, discordUserId]
      );
    }

    const updated = await getPlayerByDiscordId(client, discordUserId, client);
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

    const currentPlayerResult = await client.query(
      `${PLAYER_SELECT_SQL} FOR UPDATE`,
      [discordUserId]
    );
    const playerBefore = await getPlayerByDiscordId(client, discordUserId, client);
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

    await client.query(
      `UPDATE players
       SET money = money + $1,
           "totalMoneyEarned" = "totalMoneyEarned" + $1,
           "dailyClaimDay" = $2,
           "dailyStreak" = $3,
           "updatedAt" = NOW()
       WHERE "discordUserId" = $4`,
      [appliedRewardCoins, dailyState.currentDay, nextStreak, discordUserId]
    );

    const playerAfterDaily = await getPlayerByDiscordId(client, discordUserId, client);
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

    const currentPlayerResult = await client.query(
      `${PLAYER_SELECT_SQL} FOR UPDATE`,
      [discordUserId]
    );
    const playerBefore = await getPlayerByDiscordId(client, discordUserId, client);
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

    await client.query(
      `UPDATE players
       SET money = money + $1,
           "totalMoneyEarned" = "totalMoneyEarned" + $1,
           "dailyTaskClaimDay" = $2,
           "dailyTaskStreak" = $3,
           "dailyTaskDay" = $2,
           "updatedAt" = NOW()
       WHERE "discordUserId" = $4`,
      [appliedRewardCoins, dailyState.currentDay, nextStreak, discordUserId]
    );

    const playerAfterClaim = await getPlayerByDiscordId(client, discordUserId, client);
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

    await client.query(`${PLAYER_SELECT_SQL} FOR UPDATE`, [discordUserId]);
    const playerBefore = await getPlayerByDiscordId(client, discordUserId, client);
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

    await client.query(
      `UPDATE players
       SET money = GREATEST(0, money + $1),
           "totalMoneyEarned" = "totalMoneyEarned" + $2,
           "totalCommandsUsed" = "totalCommandsUsed" + $3,
           "totalGamblingPlays" = "totalGamblingPlays" + $4,
           "totalGamblingWins" = "totalGamblingWins" + $5,
           "dailyTaskDay" = $6,
           "dailyTaskInteractions" = $7,
           "updatedAt" = NOW()
       WHERE "discordUserId" = $8`,
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

    const playerAfterResult = await getPlayerByDiscordId(client, discordUserId, client);
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

    await client.query(`${PLAYER_SELECT_SQL} FOR UPDATE`, [discordUserId]);
    const playerBefore = await getPlayerByDiscordId(client, discordUserId, client);
    const freezeMoney = isMoneyFrozen(playerBefore);
    const upgrades = sanitizeUpgrades(playerBefore.upgrades || {});
    const currentLevel = upgrades[action][upgradeKey];
    const cost = getUpgradeCost(action, upgradeKey, currentLevel);

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
    await client.query(
      `UPDATE players
       SET money = money - $1,
           upgrades = $2::jsonb,
           "updatedAt" = NOW()
       WHERE "discordUserId" = $3`,
      [freezeMoney ? 0 : cost, JSON.stringify(upgrades), discordUserId]
    );

    const playerAfter = await getPlayerByDiscordId(client, discordUserId, client);
    await client.query("COMMIT");
    return {
      ok: true,
      cost,
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
  xpRequiredForLevel,
  levelRewardCoins
};
