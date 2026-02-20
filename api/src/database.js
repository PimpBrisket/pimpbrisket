const { Pool } = require("pg");

const ACTION_COOLDOWN_MS = 5000;
const MAX_LEVEL = 100;

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
  "devConfig"
 FROM players
 WHERE "discordUserId" = $1`;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
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
  return result.rows[0] || null;
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
    "devConfig" JSONB
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
    `"devConfig" JSONB`
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
  const output = { actions: {} };
  if (!input || typeof input !== "object") return output;
  const incomingActions = input.actions && typeof input.actions === "object" ? input.actions : {};
  for (const actionKey of Object.keys(ACTIONS)) {
    output.actions[actionKey] = sanitizeActionOverride(ACTIONS[actionKey], incomingActions[actionKey]);
  }
  return output;
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
    const playerBefore = currentPlayerResult.rows[0];
    const actionConfig = getEffectiveActionConfigForPlayer(playerBefore, action);

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
    const bonusTier = rollWeightedTier(actionConfig.bonusTiers);
    const bonusCoinsRaw = bonusTier.coins;
    const xpGained = randomInt(actionConfig.xpMin, actionConfig.xpMax);

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
      const levelReward = Math.round(levelRewardRaw * cashMultiplier);
      levelRewardTotal += levelReward;
      levelUps.push({ level: nextLevel, rewardCoins: levelReward });
    }

    if (nextLevel >= MAX_LEVEL) {
      nextLevel = MAX_LEVEL;
      nextXp = 0;
    }

    const baseReward = Math.round(baseRewardRaw * cashMultiplier);
    const bonusCoins = Math.round(bonusCoinsRaw * cashMultiplier);
    const totalRewardCoins = baseReward + bonusCoins + levelRewardTotal;
    const digTrophyGain = bonusTier.itemKey === "dig_trophy" ? 1 : 0;
    const fishTrophyGain = bonusTier.itemKey === "fish_trophy" ? 1 : 0;
    const huntTrophyGain = bonusTier.itemKey === "hunt_trophy" ? 1 : 0;

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
           "updatedAt" = NOW()
       WHERE "discordUserId" = $10`,
      [
        totalRewardCoins,
        nextXp,
        xpGained,
        nextLevel,
        totalRewardCoins,
        digTrophyGain,
        fishTrophyGain,
        huntTrophyGain,
        nextCooldownUntil,
        discordUserId
      ]
    );

    const playerAfter = await getPlayerByDiscordId(db, discordUserId, client);
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
        xpGained,
        levelRewardCoins: levelRewardTotal,
        levelUps
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

module.exports = {
  ACTION_COOLDOWN_MS,
  MAX_LEVEL,
  createDatabase,
  initDatabase,
  getPlayerByDiscordId,
  registerPlayer,
  adjustMoney,
  getPlayerDevConfig,
  setPlayerDevConfig,
  resetPlayerDevConfig,
  setPlayerLevel,
  lockActionCooldown,
  performAction,
  getActionConfig,
  getActionMetadata,
  xpRequiredForLevel,
  levelRewardCoins
};
