const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const DEFAULT_DB_FILE = path.join(__dirname, "..", "database.sqlite");
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
      { chancePct: 10, coins: 8, label: "Coin Nugget" },
      { chancePct: 2, coins: 20, label: "Rare Relic" },
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

function xpRequiredForLevel(level) {
  if (level >= MAX_LEVEL) return 0;
  if (level <= 10) return 60 + level * 18;
  if (level <= 40) return 240 + (level - 10) * 24;
  return 960 + (level - 40) * 27;
}

function levelRewardCoins(level) {
  return 40 + level * 14;
}

function createDatabase(dbFile = DEFAULT_DB_FILE) {
  return new sqlite3.Database(dbFile);
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
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
  await run(
    db,
    `CREATE TABLE IF NOT EXISTS players (
      discordUserId TEXT PRIMARY KEY,
      money INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updatedAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )`
  );

  await run(
    db,
    `CREATE TRIGGER IF NOT EXISTS players_set_updatedAt
      AFTER UPDATE ON players
      FOR EACH ROW
      WHEN NEW.updatedAt = OLD.updatedAt
    BEGIN
      UPDATE players
      SET updatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      WHERE discordUserId = OLD.discordUserId;
    END`
  );

  const tableColumns = await all(db, "PRAGMA table_info(players)");
  const existingColumns = new Set(tableColumns.map((column) => column.name));
  const requiredColumns = [
    { name: "digCooldownUntil", sqlType: "INTEGER NOT NULL DEFAULT 0" },
    { name: "fishCooldownUntil", sqlType: "INTEGER NOT NULL DEFAULT 0" },
    { name: "huntCooldownUntil", sqlType: "INTEGER NOT NULL DEFAULT 0" },
    { name: "xp", sqlType: "INTEGER NOT NULL DEFAULT 0" },
    { name: "totalXpEarned", sqlType: "INTEGER NOT NULL DEFAULT 0" },
    { name: "level", sqlType: "INTEGER NOT NULL DEFAULT 1" },
    { name: "totalCommandsUsed", sqlType: "INTEGER NOT NULL DEFAULT 0" },
    { name: "totalMoneyEarned", sqlType: "INTEGER NOT NULL DEFAULT 0" },
    { name: "digTrophyCount", sqlType: "INTEGER NOT NULL DEFAULT 0" },
    { name: "fishTrophyCount", sqlType: "INTEGER NOT NULL DEFAULT 0" },
    { name: "huntTrophyCount", sqlType: "INTEGER NOT NULL DEFAULT 0" },
    { name: "discordUsername", sqlType: "TEXT" },
    { name: "discordAvatarHash", sqlType: "TEXT" }
  ];

  for (const column of requiredColumns) {
    if (existingColumns.has(column.name)) continue;
    await run(db, `ALTER TABLE players ADD COLUMN ${column.name} ${column.sqlType}`);
  }

  const legacyPlayerTable = await get(
    db,
    `SELECT name FROM sqlite_master
     WHERE type = 'table' AND name = 'Player'`
  );

  if (legacyPlayerTable) {
    await run(
      db,
      `INSERT OR IGNORE INTO players (
         discordUserId,
         money,
         createdAt,
         updatedAt,
         digCooldownUntil,
         fishCooldownUntil,
         huntCooldownUntil,
         xp,
         totalXpEarned,
         level,
         totalCommandsUsed,
         totalMoneyEarned,
         digTrophyCount,
         fishTrophyCount,
         huntTrophyCount,
         discordUsername,
         discordAvatarHash
       )
       SELECT
         discordUserId,
         money,
         strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
         strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
         0,
         0,
         0,
         0,
         0,
         1,
         0,
         0,
         0,
         0,
         0,
         NULL,
         NULL
       FROM Player`
    );
  }
}

function getPlayerByDiscordId(db, discordUserId) {
  return get(
    db,
    `SELECT
      discordUserId,
      money,
      createdAt,
      updatedAt,
      digCooldownUntil,
      fishCooldownUntil,
      huntCooldownUntil,
      xp,
      totalXpEarned,
      level,
      totalCommandsUsed,
      totalMoneyEarned,
      digTrophyCount,
      fishTrophyCount,
      huntTrophyCount,
      discordUsername,
      discordAvatarHash
     FROM players
     WHERE discordUserId = ?`,
    [discordUserId]
  );
}

async function registerPlayer(db, discordUserId, profile = null) {
  const insertResult = await run(
    db,
    `INSERT OR IGNORE INTO players (discordUserId, money)
     VALUES (?, 0)`,
    [discordUserId]
  );

  if (profile && (profile.discordUsername || profile.discordAvatarHash)) {
    await run(
      db,
      `UPDATE players
       SET discordUsername = COALESCE(?, discordUsername),
           discordAvatarHash = COALESCE(?, discordAvatarHash)
       WHERE discordUserId = ?`,
      [profile.discordUsername || null, profile.discordAvatarHash || null, discordUserId]
    );
  }

  const player = await getPlayerByDiscordId(db, discordUserId);
  return { player, created: insertResult.changes === 1 };
}

async function adjustMoney(db, discordUserId, amount) {
  await run(
    db,
    `INSERT OR IGNORE INTO players (discordUserId, money)
     VALUES (?, 0)`,
    [discordUserId]
  );

  await run(
    db,
    `UPDATE players
     SET money = money + ?
     WHERE discordUserId = ?`,
    [amount, discordUserId]
  );

  return getPlayerByDiscordId(db, discordUserId);
}

async function lockActionCooldown(db, discordUserId, action) {
  const actionConfig = getActionConfig(action);
  if (!actionConfig) throw new Error("Unsupported action");

  await run(
    db,
    `INSERT OR IGNORE INTO players (discordUserId, money)
     VALUES (?, 0)`,
    [discordUserId]
  );

  const playerBefore = await getPlayerByDiscordId(db, discordUserId);
  const now = Date.now();
  const cooldownUntil = Number(playerBefore[actionConfig.cooldownColumn]) || 0;
  if (cooldownUntil > now) {
    return {
      ok: false,
      cooldownUntil,
      cooldownRemainingMs: cooldownUntil - now,
      player: playerBefore
    };
  }

  const nextCooldownUntil = now + ACTION_COOLDOWN_MS;
  await run(
    db,
    `UPDATE players
     SET ${actionConfig.cooldownColumn} = ?
     WHERE discordUserId = ?`,
    [nextCooldownUntil, discordUserId]
  );

  const playerAfter = await getPlayerByDiscordId(db, discordUserId);
  return {
    ok: true,
    cooldownUntil: nextCooldownUntil,
    cooldownRemainingMs: ACTION_COOLDOWN_MS,
    player: playerAfter
  };
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

async function performAction(db, discordUserId, action, options = {}) {
  const actionConfig = getActionConfig(action);
  if (!actionConfig) throw new Error("Unsupported action");
  const {
    ignoreCooldown = false,
    preserveExistingCooldown = false,
    cashMultiplier = 1
  } = options;

  await run(
    db,
    `INSERT OR IGNORE INTO players (discordUserId, money)
     VALUES (?, 0)`,
    [discordUserId]
  );

  const playerBefore = await getPlayerByDiscordId(db, discordUserId);
  const now = Date.now();
  const cooldownUntil = Number(playerBefore[actionConfig.cooldownColumn]) || 0;
  if (!ignoreCooldown && cooldownUntil > now) {
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

  await run(
    db,
    `UPDATE players
     SET money = money + ?,
         xp = ?,
         totalXpEarned = totalXpEarned + ?,
         level = ?,
         totalCommandsUsed = totalCommandsUsed + 1,
         totalMoneyEarned = totalMoneyEarned + ?,
         digTrophyCount = digTrophyCount + ?,
         fishTrophyCount = fishTrophyCount + ?,
         huntTrophyCount = huntTrophyCount + ?,
         ${actionConfig.cooldownColumn} = ?
     WHERE discordUserId = ?`,
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

  const playerAfter = await getPlayerByDiscordId(db, discordUserId);
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
}

module.exports = {
  ACTION_COOLDOWN_MS,
  MAX_LEVEL,
  createDatabase,
  initDatabase,
  getPlayerByDiscordId,
  registerPlayer,
  adjustMoney,
  lockActionCooldown,
  performAction,
  getActionConfig,
  getActionMetadata,
  xpRequiredForLevel,
  levelRewardCoins
};
