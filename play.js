const statusEl = document.getElementById("status");
const walletEl = document.getElementById("wallet-amount");
const levelValueEl = document.getElementById("level-value");
const xpTextEl = document.getElementById("xp-text");
const xpFillEl = document.getElementById("xp-fill");
const levelRewardEl = document.getElementById("level-reward");
const mainTitleEl = document.getElementById("main-title");
const userMenuButton = document.getElementById("user-menu-button");
const userDropdown = document.getElementById("user-dropdown");
const openProfileButton = document.getElementById("open-profile-button");
const profilePanel = document.getElementById("profile-panel");
const closeProfileButton = document.getElementById("close-profile-button");
const openDailyButton = document.getElementById("open-daily-button");
const dailyPanel = document.getElementById("daily-panel");
const closeDailyButton = document.getElementById("close-daily-button");
const dailyTimezoneDisplayEl = document.getElementById("daily-timezone-display");
const dailyRewardStatusEl = document.getElementById("daily-reward-status");
const dailyRewardDetailEl = document.getElementById("daily-reward-detail");
const claimDailyButton = document.getElementById("claim-daily-button");
const dailyChallengeStatusEl = document.getElementById("daily-challenge-status");
const dailyChallengeDetailEl = document.getElementById("daily-challenge-detail");
const claimDailyChallengeButton = document.getElementById("claim-daily-challenge-button");
const openAchievementsButton = document.getElementById("open-achievements-button");
const openShowcaseButton = document.getElementById("open-showcase-button");
const achievementsPanel = document.getElementById("achievements-panel");
const closeAchievementsButton = document.getElementById("close-achievements-button");
const achievementsListEl = document.getElementById("achievements-list");
const openInventoryButton = document.getElementById("open-inventory-button");
const inventoryPanel = document.getElementById("inventory-panel");
const closeInventoryButton = document.getElementById("close-inventory-button");
const inventoryListEl = document.getElementById("inventory-list");
const openUpgradeButton = document.getElementById("open-upgrade-button");
const upgradePanel = document.getElementById("upgrade-panel");
const closeUpgradeButton = document.getElementById("close-upgrade-button");
const upgradesListEl = document.getElementById("upgrades-list");
const shopPanel = document.getElementById("shop-panel");
const closeShopButton = document.getElementById("close-shop-button");
const shopShowcaseCardEl = document.getElementById("shop-showcase-card");
const shopEmptyCardEl = document.getElementById("shop-empty-card");
const shopEmptyMessageEl = document.getElementById("shop-empty-message");
const shopStatusEl = document.getElementById("shop-status");
const shopBuyShowcaseButton = document.getElementById("shop-buy-showcase-button");
const showcasePanel = document.getElementById("showcase-panel");
const closeShowcaseButton = document.getElementById("close-showcase-button");
const showcaseSummaryEl = document.getElementById("showcase-summary");
const showcaseSlotsEl = document.getElementById("showcase-slots");
const saveShowcaseButton = document.getElementById("save-showcase-button");
const openTrophiesButton = document.getElementById("open-trophies-button");
const trophyPanel = document.getElementById("trophy-panel");
const closeTrophiesButton = document.getElementById("close-trophies-button");
const openDevModeButton = document.getElementById("open-dev-mode-button");
const devPanel = document.getElementById("dev-panel");
const closeDevModeButton = document.getElementById("close-dev-mode-button");
const devLevelInput = document.getElementById("dev-level-input");
const devSetLevelButton = document.getElementById("dev-set-level-button");
const devMaxLevelButton = document.getElementById("dev-max-level-button");
const devTriggerDigButton = document.getElementById("dev-trigger-dig-button");
const devTriggerFishButton = document.getElementById("dev-trigger-fish-button");
const devTriggerHuntButton = document.getElementById("dev-trigger-hunt-button");
const devTriggerDigSelect = document.getElementById("dev-trigger-dig-select");
const devTriggerFishSelect = document.getElementById("dev-trigger-fish-select");
const devTriggerHuntSelect = document.getElementById("dev-trigger-hunt-select");
const devUpgradeActionSelect = document.getElementById("dev-upgrade-action-select");
const devUpgradeKeySelect = document.getElementById("dev-upgrade-key-select");
const devUpgradeLevelInput = document.getElementById("dev-upgrade-level-input");
const devSetUpgradeLevelButton = document.getElementById("dev-set-upgrade-level-button");
const devResetConfigButton = document.getElementById("dev-reset-config-button");
const devLootControls = document.getElementById("dev-loot-controls");
const devMoneyInput = document.getElementById("dev-money-input");
const devSetMoneyButton = document.getElementById("dev-set-money-button");
const devResetProgressButton = document.getElementById("dev-reset-progress-button");
const devFreezeMoneyToggle = document.getElementById("dev-freeze-money-toggle");
const devActionTools = document.getElementById("dev-action-tools");
const devGamblingTools = document.getElementById("dev-gambling-tools");
const devGambleGameSelect = document.getElementById("dev-gamble-game-select");
const devGambleOutcomeSelect = document.getElementById("dev-gamble-outcome-select");
const devGambleRiskInput = document.getElementById("dev-gamble-risk-input");
const devGambleRewardInput = document.getElementById("dev-gamble-reward-input");
const devApplyGambleSettingsButton = document.getElementById("dev-apply-gamble-settings-button");
const devRunGambleButton = document.getElementById("dev-run-gamble-button");
const userAvatarEl = document.getElementById("user-avatar");
const profileAvatarEl = document.getElementById("profile-avatar");

const profileNameEl = document.getElementById("profile-name");
const profileIdEl = document.getElementById("profile-id");
const profileWalletEl = document.getElementById("profile-wallet");
const profileLevelEl = document.getElementById("profile-level");
const profileXpEl = document.getElementById("profile-xp");
const profileCommandsEl = document.getElementById("profile-commands");
const profileEarnedEl = document.getElementById("profile-earned");
const profileTrophiesEl = document.getElementById("profile-trophies");
const profileJoinedEl = document.getElementById("profile-joined");
const profileShowcaseSummaryEl = document.getElementById("profile-showcase-summary");
const profileShowcaseItemsEl = document.getElementById("profile-showcase-items");
const trophyDigImageEl = document.getElementById("trophy-dig-image");
const trophyFishImageEl = document.getElementById("trophy-fish-image");
const trophyHuntImageEl = document.getElementById("trophy-hunt-image");
const trophyDigCountEl = document.getElementById("trophy-dig-count");
const trophyFishCountEl = document.getElementById("trophy-fish-count");
const trophyHuntCountEl = document.getElementById("trophy-hunt-count");

const chanceTitleEl = document.getElementById("chance-title");
const chanceXpEl = document.getElementById("chance-xp");
const chanceWinningsEl = document.getElementById("chance-winnings");
const chanceBonusEl = document.getElementById("chance-bonus");
const shopButton = document.getElementById("shop-button");
const modeMenu = document.getElementById("mode-menu");
const modeActionsButton = document.getElementById("mode-actions-button");
const modeGamblingButton = document.getElementById("mode-gambling-button");
const regularActionsSection = document.getElementById("regular-actions");
const gamblingActionsSection = document.getElementById("gambling-actions");
const gamblingPanel = document.getElementById("gambling-panel");
const actionStageEl = document.getElementById("action-stage");
const gamblingStatusEl = document.getElementById("gambling-status");
const gamblingResultTextEl = document.getElementById("gambling-result-text");
const slotsPayoutsEl = document.getElementById("slots-payouts");
const coinflipControlsEl = document.getElementById("coinflip-controls");
const coinflipAnimEl = document.getElementById("coinflip-anim");
const coinflipCoinEl = document.getElementById("coinflip-coin");
const blackjackControlsEl = document.getElementById("blackjack-controls");
const slotsControlsEl = document.getElementById("slots-controls");
const coinflipHeadsButton = document.getElementById("coinflip-heads-button");
const coinflipTailsButton = document.getElementById("coinflip-tails-button");
const blackjackDealButton = document.getElementById("blackjack-deal-button");
const blackjackHitButton = document.getElementById("blackjack-hit-button");
const blackjackStandButton = document.getElementById("blackjack-stand-button");
const slotsSpinButton = document.getElementById("slots-spin-button");
const riskSliderEl = document.getElementById("risk-slider");
const riskCurrentEl = document.getElementById("risk-current");
const riskRewardEl = document.getElementById("risk-reward");
const betAmountInputEl = document.getElementById("bet-amount-input");
const betParsedDisplayEl = document.getElementById("bet-parsed-display");
const gambleGameButtons = Array.from(document.querySelectorAll(".gambling-action-card"));
const chanceWinningsTableEl = chanceWinningsEl ? chanceWinningsEl.closest("table") : null;
const chanceBonusTableEl = chanceBonusEl ? chanceBonusEl.closest("table") : null;
const chanceCoinHeadingEl = chanceWinningsTableEl ? chanceWinningsTableEl.previousElementSibling : null;
const chanceBonusHeadingEl = chanceBonusTableEl ? chanceBonusTableEl.previousElementSibling : null;

const actionButtons = Array.from(document.querySelectorAll(".action-card[data-action]"));
const animByAction = {
  dig: document.getElementById("anim-dig"),
  fish: document.getElementById("anim-fish"),
  hunt: document.getElementById("anim-hunt")
};

const cooldownUntilByAction = { dig: 0, fish: 0, hunt: 0 };

const FALLBACK_META = {
  cooldownMs: 5000,
  maxLevel: 100,
  actions: {
    dig: {
      xpMin: 12,
      xpMax: 19,
      payoutTiers: [
        { chancePct: 45, min: 7, max: 12, label: "Small Pouch" },
        { chancePct: 32, min: 13, max: 20, label: "Good Find" },
        { chancePct: 18, min: 21, max: 32, label: "Lucky Find" },
        { chancePct: 5, min: 33, max: 50, label: "Jackpot Vein" }
      ],
      bonusTiers: [
        { chancePct: 87, coins: 0, label: "No extra drop", itemKey: null, itemImage: null },
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
      xpMin: 13,
      xpMax: 21,
      payoutTiers: [
        { chancePct: 45, min: 7, max: 12, label: "Common Catch" },
        { chancePct: 32, min: 13, max: 20, label: "Fresh Catch" },
        { chancePct: 18, min: 21, max: 32, label: "Big Catch" },
        { chancePct: 5, min: 33, max: 50, label: "Legend Catch" }
      ],
      bonusTiers: [
        { chancePct: 87, coins: 0, label: "No extra drop", itemKey: null, itemImage: null },
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
      xpMin: 14,
      xpMax: 23,
      payoutTiers: [
        { chancePct: 45, min: 7, max: 12, label: "Small Trophy" },
        { chancePct: 32, min: 13, max: 20, label: "Strong Trophy" },
        { chancePct: 18, min: 21, max: 32, label: "Prime Trophy" },
        { chancePct: 5, min: 33, max: 50, label: "Elite Trophy" }
      ],
      bonusTiers: [
        { chancePct: 87, coins: 0, label: "No extra drop", itemKey: null, itemImage: null },
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
  }
};

let apiBaseUrl = "https://pimpbrisket.onrender.com";
let discordUserId = "";
let actionMeta = FALLBACK_META;
let cooldownTimer = null;
let profileSyncTimer = null;
let currentProfile = null;
const appBasePath = window.location.pathname.replace(/\/(?:play(?:\.html)?|index\.html)?$/, "");
const digAnimationImageEl = document.getElementById("anim-dig-image");
const DEV_OWNER_DISCORD_USER_ID = "931015893377482854";
const GAMBLING_UNLOCK_LEVEL = 5;
let isDevOwner = false;
let isDevModeActive = false;
let selectedChanceAction = "dig";
let devSaveTimer = null;
let digAnimationVersion = 0;
let currentMode = "actions";
let selectedGambleGame = "";
let sessionWalletDelta = 0;
let showcaseDraftSelections = [];
let showcaseDraftDirty = false;
let coinflipInProgress = false;
let slotsSpinInProgress = false;
let blackjackState = {
  active: false,
  player: [],
  dealer: [],
  bet: 0,
  risk: 0,
  rewardMultiplier: 1
};
const SLOT_SYMBOLS = ["Cherry", "Bell", "BAR", "Diamond", "7"];
const SLOT_COMBO_PAYOUTS = [
  { label: "7 | 7 | 7", matches: (reels) => reels.every((symbol) => symbol === "7"), baseMultiplier: 6.0 },
  {
    label: "Diamond | Diamond | Diamond",
    matches: (reels) => reels.every((symbol) => symbol === "Diamond"),
    baseMultiplier: 4.5
  },
  {
    label: "BAR | BAR | BAR",
    matches: (reels) => reels.every((symbol) => symbol === "BAR"),
    baseMultiplier: 3.2
  },
  {
    label: "Any other 3 of a kind",
    matches: (reels) => new Set(reels).size === 1,
    baseMultiplier: 2.4
  },
  {
    label: "Any 2 of a kind",
    matches: (reels) => new Set(reels).size === 2,
    baseMultiplier: 0.8
  }
];

async function readJsonSafely(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (_err) {
    return {};
  }
}

function getApiError(payload, fallback) {
  return payload && typeof payload.error === "string" && payload.error.trim()
    ? payload.error
    : fallback;
}

function formatPercent(value) {
  return `${Math.round(Number(value || 0))}%`;
}

function detectLocalTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch (_err) {
    return "";
  }
}

async function fetchApi(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, options);
  const payload = await readJsonSafely(response);
  if (!response.ok) {
    throw new Error(getApiError(payload, "Request failed"));
  }
  return payload;
}

function isGamblingUnlocked() {
  return Number(currentProfile?.level || 1) >= GAMBLING_UNLOCK_LEVEL;
}

function updateModeMenuAvailability() {
  if (!modeGamblingButton) return;
  const unlocked = isGamblingUnlocked();
  modeGamblingButton.disabled = !unlocked;
  modeGamblingButton.textContent = unlocked
    ? "Gambling"
    : `Gambling (Unlocks LVL ${GAMBLING_UNLOCK_LEVEL})`;
}

function cloneActionConfig(config) {
  return {
    ...config,
    payoutTiers: Array.isArray(config?.payoutTiers)
      ? config.payoutTiers.map((tier) => ({ ...tier }))
      : [],
    bonusTiers: Array.isArray(config?.bonusTiers)
      ? config.bonusTiers.map((tier) => ({ ...tier }))
      : []
  };
}

function applyDropBoostToDisplayBonusTiers(bonusTiers, dropReductionFactor) {
  if (!Array.isArray(bonusTiers) || bonusTiers.length === 0) return [];
  const noDropIndex = bonusTiers.findIndex((tier) => tier.coins === 0 && !tier.itemKey);
  if (noDropIndex < 0 || dropReductionFactor <= 0) return bonusTiers;

  const weighted = bonusTiers.map((tier, index) => {
    const baseChance = Math.max(0, Number(tier.chancePct) || 0);
    if (index === noDropIndex) {
      return { ...tier, chancePct: baseChance * (1 - dropReductionFactor) };
    }
    return { ...tier, chancePct: baseChance };
  });

  const total = weighted.reduce((sum, tier) => sum + tier.chancePct, 0);
  if (total <= 0) return bonusTiers;
  return weighted.map((tier) => ({
    ...tier,
    chancePct: (tier.chancePct / total) * 100
  }));
}

function getDisplayActionConfig(action) {
  const base = actionMeta?.actions?.[action];
  if (!base) return null;
  const config = cloneActionConfig(base);
  const upgradeEffects = currentProfile?.upgrades?.[action]?.effects || {
    cashMultiplier: 1,
    xpMultiplier: 1,
    dropReductionFactor: 0
  };
  const showcaseEffects = currentProfile?.showcase?.effectsByAction?.[action] || {
    cashMultiplier: 1,
    xpMultiplier: 1,
    cashPct: 0,
    xpPct: 0
  };
  const combinedCashMultiplier =
    Number(upgradeEffects.cashMultiplier || 1) * Number(showcaseEffects.cashMultiplier || 1);
  const combinedXpMultiplier =
    Number(upgradeEffects.xpMultiplier || 1) * Number(showcaseEffects.xpMultiplier || 1);

  config.xpMin = Math.max(1, Math.round((Number(config.xpMin) || 0) * combinedXpMultiplier));
  config.xpMax = Math.max(
    config.xpMin,
    Math.round((Number(config.xpMax) || config.xpMin) * combinedXpMultiplier)
  );

  config.payoutTiers = config.payoutTiers.map((tier) => ({
    ...tier,
    min: Math.max(0, Math.round((Number(tier.min) || 0) * combinedCashMultiplier)),
    max: Math.max(
      Math.round((Number(tier.min) || 0) * combinedCashMultiplier),
      Math.round((Number(tier.max) || 0) * combinedCashMultiplier)
    )
  }));

  config.bonusTiers = config.bonusTiers.map((tier) => ({
    ...tier,
    coins: Math.max(0, Math.round((Number(tier.coins) || 0) * combinedCashMultiplier))
  }));
  config.bonusTiers = applyDropBoostToDisplayBonusTiers(
    config.bonusTiers,
    Number(upgradeEffects.dropReductionFactor || 0)
  );
  config.boostSummary = {
    cashPct: Math.round((combinedCashMultiplier - 1) * 100),
    xpPct: Math.round((combinedXpMultiplier - 1) * 100),
    showcaseCashPct: Math.round(Number(showcaseEffects.cashPct || 0)),
    showcaseXpPct: Math.round(Number(showcaseEffects.xpPct || 0))
  };
  return config;
}

function formatChancePct(value) {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric)) return "0";
  return numeric.toFixed(2).replace(/\.?0+$/, "");
}

function updateShowcaseButtonVisibility() {
  if (!openShowcaseButton) return;
  openShowcaseButton.hidden = !(currentProfile?.showcase?.unlocked === true);
}

function setProfileFocusMode(enabled) {
  document.body.classList.toggle("profile-focus", enabled === true);
}

function closeNonProfilePanels() {
  const panels = [
    dailyPanel,
    achievementsPanel,
    inventoryPanel,
    showcasePanel,
    upgradePanel,
    shopPanel,
    devPanel,
    trophyPanel
  ];
  panels.forEach((panel) => {
    if (panel) panel.hidden = true;
  });
}

function syncShowcaseDraftFromProfile() {
  const shown = Array.isArray(currentProfile?.showcase?.showcasedItems)
    ? currentProfile.showcase.showcasedItems
    : [];
  showcaseDraftSelections = [...shown];
}

function collectShowcaseDraftFromDom() {
  if (!showcaseSlotsEl) return;
  const selects = Array.from(showcaseSlotsEl.querySelectorAll("select"));
  showcaseDraftSelections = selects.map((select) => String(select.value || "").trim());
  showcaseDraftDirty = true;
}

function formatShowcaseEffectText(item) {
  if (!item?.showcase) return "No showcase effect";
  const bits = [];
  if (Number(item.showcase.cashPct || 0) > 0) {
    bits.push(`+${item.showcase.cashPct}% ${formatActionLabel(item.showcase.action)} Coins`);
  }
  if (Number(item.showcase.xpPct || 0) > 0) {
    bits.push(`+${item.showcase.xpPct}% ${formatActionLabel(item.showcase.action)} XP`);
  }
  return bits.join(" | ") || "No showcase effect";
}

function buildInventoryShowcaseMeta(item) {
  const effectText = formatShowcaseEffectText(item);
  if (effectText === "No showcase effect") return effectText;
  return `Showcased effect: ${effectText}`;
}

function renderInventoryPanel() {
  if (!inventoryListEl) return;
  const items = Array.isArray(currentProfile?.inventory?.items) ? currentProfile.inventory.items : [];
  const showcasedKeys = new Set(
    Array.isArray(currentProfile?.showcase?.showcasedItems) ? currentProfile.showcase.showcasedItems : []
  );
  inventoryListEl.innerHTML = "";
  if (items.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No items yet. Bonus drops will stack here.";
    inventoryListEl.appendChild(empty);
    return;
  }

  items.forEach((item) => {
    const row = document.createElement("article");
    row.className = "inventory-item";

    const img = document.createElement("img");
    img.src = resolveAssetUrl(item.image || "/assets/null_trophy.png");
    img.alt = item.name || "Inventory item";

    const textWrap = document.createElement("div");
    const name = document.createElement("p");
    name.className = "name";
    name.textContent = `${item.name} x${formatCoins(item.count)}`;
    const meta = document.createElement("p");
    meta.className = "meta";
    meta.textContent = `Sell: $${formatCoins(item.sellCoins)} each | ${buildInventoryShowcaseMeta(item)}`;
    textWrap.appendChild(name);
    textWrap.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "actions";
    const sellOneButton = document.createElement("button");
    sellOneButton.className = "close-profile";
    sellOneButton.type = "button";
    sellOneButton.textContent = "Sell 1";
    const sellAllButton = document.createElement("button");
    sellAllButton.className = "close-profile";
    sellAllButton.type = "button";
    sellAllButton.textContent = "Sell All";
    const ownedCount = Math.max(0, Math.floor(Number(item.count || 0)));
    const isShowcased = showcasedKeys.has(item.key);
    const sellableCount = isShowcased ? Math.max(0, ownedCount - 1) : ownedCount;
    if (isShowcased) {
      meta.textContent = `${meta.textContent} | Showcased items keep 1 locked`;
      if (sellableCount > 0) {
        sellAllButton.textContent = "Sell All (Keep 1)";
      }
    }
    if (sellableCount <= 0) {
      sellOneButton.disabled = true;
      sellAllButton.disabled = true;
      sellOneButton.textContent = "Locked";
      sellAllButton.textContent = "Locked";
    }

    sellOneButton.addEventListener("click", () => {
      sellInventoryItem(item.key, 1).catch((err) => {
        setStatus(err.message || "Could not sell item.", "tone-error");
      });
    });
    sellAllButton.addEventListener("click", () => {
      sellInventoryItem(item.key, null).catch((err) => {
        setStatus(err.message || "Could not sell item.", "tone-error");
      });
    });
    actions.appendChild(sellOneButton);
    actions.appendChild(sellAllButton);

    row.appendChild(img);
    row.appendChild(textWrap);
    row.appendChild(actions);
    inventoryListEl.appendChild(row);
  });
}

function renderShopPanel() {
  if (!shopBuyShowcaseButton) return;
  const showcase = currentProfile?.showcase || {};
  const rawSlots = Number(showcase.slots || 0);
  const maxSlots = Number(showcase.maxSlots || 0);
  const nextCost = Number(showcase.nextSlotCost || 0);
  const slots = rawSlots > 0 ? Math.min(maxSlots, rawSlots + 1) : 0;
  const isSoldOut = rawSlots >= maxSlots && maxSlots > 0;
  if (shopShowcaseCardEl) {
    shopShowcaseCardEl.hidden = isSoldOut;
  }
  if (shopEmptyCardEl) {
    shopEmptyCardEl.hidden = !isSoldOut;
  }
  if (shopEmptyMessageEl) {
    shopEmptyMessageEl.hidden = !isSoldOut;
  }

  if (rawSlots <= 0) {
    shopBuyShowcaseButton.textContent = "Buy Showcase ($1,000)";
    shopBuyShowcaseButton.disabled = false;
    return;
  }
  if (rawSlots >= maxSlots) {
    shopBuyShowcaseButton.textContent = "Maxed";
    shopBuyShowcaseButton.disabled = true;
    return;
  }
  shopBuyShowcaseButton.textContent = `Buy Slot ${Math.min(maxSlots, slots + 1)}/${maxSlots} ($${formatCoins(nextCost)})`;
  shopBuyShowcaseButton.disabled = false;
}

function buildShowcaseOptionLabel(item) {
  return `${item.name} (x${formatCoins(item.count)}) - ${formatShowcaseEffectText(item)}`;
}

function renderShowcasePanel() {
  if (!showcaseSlotsEl || !showcaseSummaryEl) return;
  const showcase = currentProfile?.showcase || {};
  const items = Array.isArray(currentProfile?.inventory?.items) ? currentProfile.inventory.items : [];
  const slots = Number(showcase.slots || 0);
  const maxSlots = Number(showcase.maxSlots || 0);
  if (!showcaseDraftDirty) {
    syncShowcaseDraftFromProfile();
  }
  const shown = showcaseDraftSelections;
  const effects = showcase.effectsByAction || {};

  showcaseSummaryEl.textContent =
    `Slots: ${slots}/${maxSlots} | Dig +${Math.round(effects.dig?.cashPct || 0)}% Coins +${Math.round(effects.dig?.xpPct || 0)}% XP | Fish +${Math.round(effects.fish?.cashPct || 0)}% Coins +${Math.round(effects.fish?.xpPct || 0)}% XP | Hunt +${Math.round(effects.hunt?.cashPct || 0)}% Coins +${Math.round(effects.hunt?.xpPct || 0)}% XP`;
  showcaseSlotsEl.innerHTML = "";
  if (slots <= 0) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "Buy Showcase in shop first.";
    showcaseSlotsEl.appendChild(empty);
    if (saveShowcaseButton) saveShowcaseButton.disabled = true;
    return;
  }
  if (saveShowcaseButton) saveShowcaseButton.disabled = false;

  for (let index = 0; index < slots; index += 1) {
    const row = document.createElement("label");
    row.className = "showcase-slot";
    row.dataset.slotIndex = String(index);
    const label = document.createElement("span");
    label.textContent = `Slot ${index + 1}`;
    const select = document.createElement("select");
    select.dataset.slotIndex = String(index);

    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "Empty";
    select.appendChild(emptyOption);

    items.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.key;
      option.textContent = buildShowcaseOptionLabel(item);
      select.appendChild(option);
    });
    select.value = shown[index] || "";
    select.addEventListener("change", collectShowcaseDraftFromDom);
    row.appendChild(label);
    row.appendChild(select);
    showcaseSlotsEl.appendChild(row);
  }
}

function getEffectiveRiskForGame() {
  const rawRisk = Number(devGambleRiskInput?.value || riskSliderEl?.value || 0);
  return Math.max(0, rawRisk);
}

function getEffectiveRewardMultiplierForGame() {
  const raw = Number(devGambleRewardInput?.value || 1);
  if (!Number.isFinite(raw) || raw <= 0) return 1;
  return raw;
}

function refreshDevPanelForMode() {
  if (!devPanel || devPanel.hidden) return;
  const inGambling = currentMode === "gambling";
  setNodeVisible(devActionTools, !inGambling, "block");
  setNodeVisible(devGamblingTools, inGambling, "block");
  if (devLootControls) devLootControls.hidden = inGambling;
}

async function setDevMoneyValue(value) {
  const payload = await fetchApi(`/dev/${discordUserId}/money`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ money: Math.max(0, Math.floor(Number(value) || 0)) })
  });
  applyPlayerSnapshot(payload.player);
  if (devMoneyInput) devMoneyInput.value = String(Math.floor(Number(payload.player.money || 0)));
}

async function resetDevProgress() {
  const payload = await fetchApi(`/dev/${discordUserId}/progress-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  applyPlayerSnapshot(payload.player);
  showcaseDraftDirty = false;
  syncShowcaseDraftFromProfile();
  renderInventoryPanel();
  renderShowcasePanel();
  renderShopPanel();
  renderChanceTable(selectedChanceAction);
}

async function setDevFreezeMoney(enabled) {
  const payload = await fetchApi(`/dev/${discordUserId}/freeze-money`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled: enabled === true })
  });
  applyPlayerSnapshot(payload.player);
  if (devFreezeMoneyToggle) devFreezeMoneyToggle.checked = payload.player?.dev?.freezeMoney === true;
}

async function setDevUpgradeLevel(action, upgradeKey, level) {
  const payload = await fetchApi(`/dev/${discordUserId}/upgrades/${action}/${upgradeKey}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      level: Math.max(0, Math.min(1000, Math.floor(Number(level) || 0)))
    })
  });
  applyPlayerSnapshot(payload.player);
  if (payload.upgrades) renderUpgrades(payload.upgrades);
}

async function triggerDevAction(action, rewardLabel) {
  const payload = await fetchApi(`/dev/${discordUserId}/actions/${action}/trigger`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rewardLabel: rewardLabel || "" })
  });
  applyPlayerSnapshot(payload.player);
  await playAnimation(action, payload.rewardBreakdown?.bonusLabel || "");
  await loadDailySummary().catch(() => {});
  await loadAchievements().catch(() => {});
  renderChanceTable(selectedChanceAction);
  return payload;
}

async function loadInventoryData() {
  const payload = await fetchApi(`/players/${discordUserId}/inventory`);
  if (payload.player) applyPlayerSnapshot(payload.player);
  showcaseDraftDirty = false;
  syncShowcaseDraftFromProfile();
  renderInventoryPanel();
  renderShowcasePanel();
  return payload;
}

async function sellInventoryItem(itemKey, quantity = null) {
  const payload = await fetchApi(`/players/${discordUserId}/inventory/sell`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemKey, quantity })
  });
  applyPlayerSnapshot(payload.player);
  showcaseDraftDirty = false;
  syncShowcaseDraftFromProfile();
  renderInventoryPanel();
  renderShowcasePanel();
  renderShopPanel();
  renderChanceTable(selectedChanceAction);
  setStatus(
    `Sold ${payload.soldQuantity} item(s) for $${formatCoins(payload.coinsEarned)}.`,
    "tone-success"
  );
}

async function purchaseShowcaseSlotFromShop() {
  const payload = await fetchApi(`/players/${discordUserId}/shop/showcase-slot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  applyPlayerSnapshot(payload.player);
  showcaseDraftDirty = false;
  syncShowcaseDraftFromProfile();
  renderShopPanel();
  renderShowcasePanel();
  setStatus("Showcase slot purchased.", "tone-success");
}

async function saveShowcaseSelection() {
  const itemKeys = showcaseDraftSelections.filter(Boolean);
  const payload = await fetchApi(`/players/${discordUserId}/showcase`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemKeys })
  });
  applyPlayerSnapshot(payload.player);
  showcaseDraftDirty = false;
  syncShowcaseDraftFromProfile();
  renderShowcasePanel();
  renderChanceTable(selectedChanceAction);
  setStatus("Showcase saved.", "tone-success");
}

function resolveAssetUrl(url) {
  if (typeof url !== "string") return url;
  if (url.startsWith("/assets/")) return `${appBasePath}${url}`;
  return url;
}

function formatActionLabel(action) {
  if (!action) return "";
  return action.charAt(0).toUpperCase() + action.slice(1).toLowerCase();
}

function setNodeVisible(node, visible, shownDisplay = "") {
  if (!node) return;
  node.hidden = !visible;
  node.style.display = visible ? shownDisplay : "none";
}

function formatCoins(value) {
  return Math.floor(Number(value || 0)).toLocaleString("en-US");
}

function getBaseWallet() {
  return Number(currentProfile?.money || 0);
}

function getDisplayWallet() {
  return Math.max(0, getBaseWallet() + sessionWalletDelta);
}

function applyWalletDelta(deltaCoins) {
  sessionWalletDelta += Math.floor(deltaCoins);
  setWallet(getDisplayWallet());
  if (profileWalletEl) {
    profileWalletEl.textContent = `$${formatCoins(getDisplayWallet())}`;
  }
}

function parseBetAmount(rawValue) {
  if (typeof rawValue !== "string") return NaN;
  let normalized = rawValue.trim().toLowerCase();
  if (!normalized) return NaN;
  normalized = normalized.replace(/\$/g, "").replace(/,/g, "").replace(/_/g, "").replace(/\s+/g, "");

  const match = normalized.match(/^(\d+(?:\.\d+)?)([kmb])?$/i);
  if (!match) return NaN;

  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) return NaN;

  const suffix = (match[2] || "").toLowerCase();
  const multiplierBySuffix = { "": 1, k: 1000, m: 1000000, b: 1000000000 };
  const multiplier = multiplierBySuffix[suffix];
  const scaled = Math.floor(amount * multiplier);
  if (!Number.isFinite(scaled) || scaled < 0) return NaN;

  return Math.min(1000000, scaled);
}

function getRiskPercent() {
  return Number(riskSliderEl?.value || 0);
}

function getRiskRewardMultiplier(riskPercent) {
  return 1 + riskPercent * 0.015;
}

function updateRiskUi() {
  const riskPercent = getRiskPercent();
  const inDevGambling = isDevModeActive && currentMode === "gambling";
  const effectiveRisk = inDevGambling ? getEffectiveRiskForGame() : riskPercent;
  const rewardMultiplier = inDevGambling
    ? getEffectiveRewardMultiplierForGame()
    : getRiskRewardMultiplier(effectiveRisk);
  const rewardIncreasePct = Math.round((rewardMultiplier - 1) * 100);
  const riskLabel = Math.round(effectiveRisk * 10) / 10;
  if (riskCurrentEl) riskCurrentEl.textContent = `Current Risk: ${riskPercent}%`;
  if (inDevGambling && riskCurrentEl) {
    riskCurrentEl.textContent = `Current Risk: ${riskLabel}% (Dev Override)`;
  }
  if (riskRewardEl) {
    riskRewardEl.textContent = inDevGambling
      ? `Reward Increase: +${rewardIncreasePct}% (Dev Override)`
      : `Reward Increase: +${rewardIncreasePct}%`;
  }
}

function updateBetParsedUi() {
  if (!betParsedDisplayEl || !betAmountInputEl) return;
  const parsed = parseBetAmount(betAmountInputEl.value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    betParsedDisplayEl.textContent = "Parsed bet: $0 (Max: $1,000,000)";
    return;
  }
  betParsedDisplayEl.textContent = `Parsed bet: $${formatCoins(parsed)} (Max: $1,000,000)`;
}

function readBetOrSetError() {
  const parsedBet = parseBetAmount(betAmountInputEl?.value || "");
  if (!Number.isFinite(parsedBet) || parsedBet <= 0) {
    setStatus("Enter a valid bet amount first.", "tone-error");
    if (gamblingStatusEl) gamblingStatusEl.textContent = "Enter a valid bet amount.";
    return 0;
  }
  if (isDevModeActive && currentMode === "gambling") {
    return parsedBet;
  }
  if (parsedBet > getDisplayWallet()) {
    setStatus("Not enough coins for that bet.", "tone-error");
    if (gamblingStatusEl) gamblingStatusEl.textContent = "Insufficient wallet for this bet.";
    return 0;
  }
  return parsedBet;
}

function applyPlayerSnapshot(player) {
  if (!player) return;
  currentProfile = player;
  sessionWalletDelta = 0;
  setWallet(player.money);
  setLevelBar(player);
  setUserAvatar(player.discordAvatarUrl);
  populateProfilePanel(player);
  updateModeMenuAvailability();
  updateShowcaseButtonVisibility();
  if (currentMode === "gambling" && !isGamblingUnlocked()) {
    setMode("actions");
  } else {
    renderChanceTable(selectedChanceAction);
  }
  if (inventoryPanel && !inventoryPanel.hidden) renderInventoryPanel();
  if (showcasePanel && !showcasePanel.hidden && !showcaseDraftDirty) renderShowcasePanel();
  if (shopPanel && !shopPanel.hidden) renderShopPanel();
}

function formatResetCountdown(timestamp) {
  const targetMs = Number(timestamp || 0);
  if (!Number.isFinite(targetMs) || targetMs <= 0) return "-";
  const remainingMs = Math.max(0, targetMs - Date.now());
  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
}

async function loadDailySummary() {
  if (!discordUserId) return;
  const summary = await fetchApi(`/players/${discordUserId}/daily`);
  if (dailyTimezoneDisplayEl) {
    const timezoneText = summary.timezoneConfigured ? summary.timezone : "Not set";
    dailyTimezoneDisplayEl.textContent = timezoneText;
  }

  if (dailyRewardStatusEl) {
    dailyRewardStatusEl.textContent = !summary.timezoneConfigured
      ? "Timezone required before claiming"
      : summary.daily.ready
      ? `Ready: +$${formatCoins(summary.daily.rewardCoins)}`
      : "Already claimed for today";
  }
  if (dailyRewardDetailEl) {
    dailyRewardDetailEl.textContent =
      `Streak: ${summary.daily.streak} | Next claim streak: ${summary.daily.nextStreak} | Boost: +${formatPercent(summary.daily.bonusPct)} | Resets in: ${formatResetCountdown(summary.nextResetAt)}`;
  }
  if (claimDailyButton) claimDailyButton.disabled = !summary.timezoneConfigured || !summary.daily.ready;

  if (dailyChallengeStatusEl) {
    const readyText = !summary.timezoneConfigured
      ? "Timezone required before claiming"
      : summary.challenge.ready
      ? `Ready: +$${formatCoins(summary.challenge.rewardCoins)}`
      : `${summary.challenge.interactions}/${summary.challenge.requiredInteractions} interactions`;
    dailyChallengeStatusEl.textContent = readyText;
  }
  if (dailyChallengeDetailEl) {
    dailyChallengeDetailEl.textContent =
      `Streak: ${summary.challenge.streak} | Next claim streak: ${summary.challenge.nextStreak} | Boost: +${formatPercent(summary.challenge.bonusPct)} | Resets in: ${formatResetCountdown(summary.nextResetAt)}`;
  }
  if (claimDailyChallengeButton) {
    claimDailyChallengeButton.disabled = !summary.timezoneConfigured || !summary.challenge.ready;
  }
}

async function ensurePlayerTimezone() {
  if (!currentProfile || currentProfile.timezoneConfigured) return;
  const timezone = detectLocalTimezone();
  if (!timezone) return;
  try {
    const payload = await fetchApi(`/players/${discordUserId}/timezone`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timezone })
    });
    applyPlayerSnapshot(payload.player);
  } catch (_err) {
    // Keep UTC fallback when detection cannot be persisted.
  }
}

function renderAchievements(achievementSummary) {
  if (!achievementsListEl) return;
  achievementsListEl.innerHTML = "";
  (achievementSummary?.chains || []).forEach((chain) => {
    const row = document.createElement("article");
    row.className = "achievement-row";

    const top = document.createElement("div");
    top.className = "achievement-row-top";
    const name = document.createElement("span");
    name.className = "name";
    const nextReward = chain.nextReward ? `+$${formatCoins(chain.nextReward)}` : "Completed";
    name.textContent = chain.label;
    const reward = document.createElement("span");
    reward.className = "reward";
    reward.textContent = nextReward;
    top.appendChild(name);
    top.appendChild(reward);

    const meta = document.createElement("p");
    meta.className = "meta";
    const maxTarget = Array.isArray(chain.thresholds) && chain.thresholds.length > 0
      ? chain.thresholds[chain.thresholds.length - 1]
      : chain.progress;
    const target = chain.nextTarget || maxTarget;
    meta.textContent = `Progress: ${formatCoins(chain.progress)}/${formatCoins(target)} | Stage: ${chain.currentStage}/${chain.totalStages} | Claimed: ${chain.claimedStages}/${chain.totalStages}`;

    row.appendChild(top);
    row.appendChild(meta);
    achievementsListEl.appendChild(row);
  });
}

async function loadAchievements() {
  if (!discordUserId) return;
  const summary = await fetchApi(`/players/${discordUserId}/achievements`);
  renderAchievements(summary);
}

function upgradeActionLabel(action) {
  return action.charAt(0).toUpperCase() + action.slice(1);
}

function renderUpgrades(upgradeSummary) {
  if (!upgradesListEl) return;
  upgradesListEl.innerHTML = "";
  const actions = ["dig", "fish", "hunt"];
  actions.forEach((action) => {
    const card = document.createElement("article");
    card.className = "upgrade-card";
    const title = document.createElement("h3");
    title.textContent = upgradeActionLabel(action);
    card.appendChild(title);

    const rows = [
      { key: "cash", label: "Cash Per Interaction", effect: "+5% per level" },
      { key: "xp", label: "XP Per Interaction", effect: "+5% per level" },
      { key: "drop", label: "Drop Chance", effect: "Slightly lowers no-drop chance" }
    ];
    rows.forEach((entry) => {
      const row = document.createElement("div");
      row.className = "upgrade-row";
      const meta = document.createElement("div");
      meta.className = "meta";
      const details = upgradeSummary?.[action]?.[entry.key] || {};
      const level = Number(details.level || 0);
      const atMax = details.atMax === true;
      const cost = Number(details.nextCost || 0);
      meta.textContent = `${entry.label} | Lvl ${level} | ${entry.effect}`;

      const actionsWrap = document.createElement("div");
      actionsWrap.className = "upgrade-actions";

      const buyButton = document.createElement("button");
      buyButton.className = "close-profile";
      buyButton.type = "button";
      buyButton.textContent = atMax ? "MAX" : `Buy $${formatCoins(cost)}`;
      buyButton.disabled = atMax;

      const maxButton = document.createElement("button");
      maxButton.className = "close-profile";
      maxButton.type = "button";
      maxButton.textContent = "Max";
      maxButton.disabled = atMax;

      buyButton.addEventListener("click", async () => {
        try {
          buyButton.disabled = true;
          maxButton.disabled = true;
          const payload = await fetchApi(
            `/players/${discordUserId}/upgrades/${action}/${entry.key}`,
            { method: "POST", headers: { "Content-Type": "application/json" } }
          );
          applyPlayerSnapshot(payload.player);
          renderUpgrades(payload.upgrades);
          renderChanceTable(selectedChanceAction);
          await loadAchievements().catch(() => {});
          setStatus(`${upgradeActionLabel(action)} ${entry.label} upgraded.`, "tone-success");
        } catch (err) {
          setStatus(err.message || "Upgrade failed.", "tone-error");
        } finally {
          if (!atMax) {
            buyButton.disabled = false;
            maxButton.disabled = false;
          }
        }
      });

      maxButton.addEventListener("click", async () => {
        try {
          buyButton.disabled = true;
          maxButton.disabled = true;
          const payload = await fetchApi(
            `/players/${discordUserId}/upgrades/${action}/${entry.key}/max`,
            { method: "POST", headers: { "Content-Type": "application/json" } }
          );
          applyPlayerSnapshot(payload.player);
          renderUpgrades(payload.upgrades);
          renderChanceTable(selectedChanceAction);
          await loadAchievements().catch(() => {});
          setStatus(
            `${upgradeActionLabel(action)} ${entry.label} bought ${payload.purchasedLevels || 0} levels.`,
            "tone-success"
          );
        } catch (err) {
          setStatus(err.message || "Max upgrade failed.", "tone-error");
        } finally {
          if (!atMax) {
            buyButton.disabled = false;
            maxButton.disabled = false;
          }
        }
      });

      row.appendChild(meta);
      actionsWrap.appendChild(buyButton);
      actionsWrap.appendChild(maxButton);
      row.appendChild(actionsWrap);
      card.appendChild(row);
    });

    upgradesListEl.appendChild(card);
  });
}

async function loadUpgrades() {
  if (!discordUserId) return;
  const payload = await fetchApi(`/players/${discordUserId}/upgrades`);
  if (payload.player) applyPlayerSnapshot(payload.player);
  renderUpgrades(payload.upgrades);
}

async function settleGamblingRound(game, coinDelta, won) {
  const payload = await fetchApi(`/players/${discordUserId}/gambling/settle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ game, coinDelta, won })
  });
  applyPlayerSnapshot(payload.player);
  await loadDailySummary().catch(() => {});
  await loadAchievements().catch(() => {});
  return payload;
}

function setDigAnimationVariant(bonusLabel) {
  if (!digAnimationImageEl) return;
  const isMobile = window.matchMedia("(max-width: 760px)").matches;
  let assetName = isMobile ? "DugDugM.png" : "DugDug.png";
  if (bonusLabel === "Gold Coin") {
    assetName = isMobile ? "DugDugCoinM.png" : "DugDugCoin.png";
  }
  if (bonusLabel === "Da Bone") {
    assetName = isMobile ? "DugDugBoneM.png" : "DugDugBone.png";
  }
  digAnimationVersion += 1;
  digAnimationImageEl.src = `./assets/${assetName}?v=${digAnimationVersion}`;
}

function setStatus(message, tone = "") {
  statusEl.textContent = message;
  statusEl.className = tone ? tone : "";
}

function setWallet(value) {
  walletEl.textContent = `$${formatCoins(value)}`;
}

function setLevelBar(profile) {
  const level = Number(profile.level || 1);
  const xp = Number(profile.xp || 0);
  const xpToNext = Number(profile.xpToNextLevel || 0);
  const maxLevel = Number(profile.maxLevel || 100);
  const nextReward = Number(profile.nextLevelRewardCoins || 0);

  levelValueEl.textContent = `${level}`;
  levelRewardEl.textContent = `+${nextReward} coins`;

  if (level >= maxLevel || xpToNext <= 0) {
    xpTextEl.textContent = "MAX LEVEL";
    xpFillEl.style.width = "100%";
    levelRewardEl.textContent = "MAX";
    return;
  }

  xpTextEl.textContent = `${xp}/${xpToNext} XP`;
  const pct = Math.max(0, Math.min(100, (xp / xpToNext) * 100));
  xpFillEl.style.width = `${pct}%`;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function setUserAvatar(url) {
  if (!url) return;
  if (!userAvatarEl || !profileAvatarEl) return;
  userAvatarEl.src = url;
  profileAvatarEl.src = url;
}

function buildProfileShowcaseSummary(profile) {
  const showcase = profile?.showcase || {};
  const slots = Number(showcase.slots || 0);
  const maxSlots = Number(showcase.maxSlots || 0);
  const shown = Array.isArray(showcase.showcasedItems) ? showcase.showcasedItems : [];
  const items = Array.isArray(profile?.inventory?.items) ? profile.inventory.items : [];
  const nameByKey = new Map(items.map((item) => [item.key, item.name]));
  const shownNames = shown.map((key) => nameByKey.get(key) || key);
  if (slots <= 0) return "No showcase unlocked";
  if (shownNames.length <= 0) return `Slots ${slots}/${maxSlots} | No items showcased`;
  return `Slots ${slots}/${maxSlots} | ${shownNames.join(", ")}`;
}

function renderProfileShowcaseItems(profile) {
  if (!profileShowcaseItemsEl) return;
  const items = Array.isArray(profile?.inventory?.items) ? profile.inventory.items : [];
  const showcased = Array.isArray(profile?.showcase?.showcasedItems)
    ? profile.showcase.showcasedItems
    : [];
  const showcasedSet = new Set(showcased);
  const showcaseable = items.filter((item) => item?.showcase && Number(item.count || 0) > 0);

  profileShowcaseItemsEl.innerHTML = "";
  if (showcaseable.length <= 0) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No showcaseable inventory items yet.";
    profileShowcaseItemsEl.appendChild(empty);
    return;
  }

  showcaseable.forEach((item) => {
    const row = document.createElement("div");
    row.className = "profile-showcase-item";
    if (showcasedSet.has(item.key)) {
      row.classList.add("is-active");
    }

    const image = document.createElement("img");
    image.src = resolveAssetUrl(item.image || "/assets/null_trophy.png");
    image.alt = item.name || "Showcase item";

    const text = document.createElement("div");
    const name = document.createElement("p");
    name.className = "name";
    name.textContent = `${item.name} x${formatCoins(item.count)}`;
    const meta = document.createElement("p");
    meta.className = "meta";
    meta.textContent = buildInventoryShowcaseMeta(item);
    text.appendChild(name);
    text.appendChild(meta);

    const state = document.createElement("span");
    state.className = "state";
    state.textContent = showcasedSet.has(item.key) ? "Showcased" : "Available";

    row.appendChild(image);
    row.appendChild(text);
    row.appendChild(state);
    profileShowcaseItemsEl.appendChild(row);
  });
}

function populateProfilePanel(profile) {
  if (!profile) return;
  if (
    !profileNameEl ||
    !profileIdEl ||
    !profileWalletEl ||
    !profileLevelEl ||
    !profileXpEl ||
    !profileCommandsEl ||
    !profileEarnedEl ||
    !profileTrophiesEl ||
    !profileJoinedEl
  ) {
    return;
  }

  const lifetimeXp = Number(profile.totalXpEarned || 0);
  const digCount = Number(profile.trophyCollection?.dig?.count || 0);
  const fishCount = Number(profile.trophyCollection?.fish?.count || 0);
  const huntCount = Number(profile.trophyCollection?.hunt?.count || 0);

  profileNameEl.textContent = profile.discordUsername || "Player Profile";
  profileIdEl.textContent = `Discord ID: ${profile.discordUserId}`;
  profileWalletEl.textContent = `$${formatCoins(getDisplayWallet())}`;
  profileLevelEl.textContent = `${profile.level}`;
  profileXpEl.textContent = `${lifetimeXp}`;
  profileCommandsEl.textContent = `${profile.totalCommandsUsed || 0}`;
  profileEarnedEl.textContent = `$${formatCoins(profile.totalMoneyEarned || 0)}`;
  profileTrophiesEl.textContent = `${formatCoins(digCount + fishCount + huntCount)}`;
  profileJoinedEl.textContent = formatDate(profile.createdAt);
  if (profileShowcaseSummaryEl) {
    profileShowcaseSummaryEl.textContent = buildProfileShowcaseSummary(profile);
  }
  renderProfileShowcaseItems(profile);
  populateTrophyPanel(profile);
}

function populateTrophyPanel(profile) {
  if (!profile?.trophyCollection) return;

  const fallback = resolveAssetUrl(
    profile.trophyCollection.placeholderImage || "/assets/null_trophy.png"
  );
  const dig = profile.trophyCollection.dig;
  const fish = profile.trophyCollection.fish;
  const hunt = profile.trophyCollection.hunt;

  const applyTrophy = (imageEl, countEl, entry) => {
    if (!imageEl || !countEl || !entry) return;
    const count = Number(entry.count || 0);
    imageEl.src = count > 0 ? resolveAssetUrl(entry.image) : fallback;
    countEl.textContent = `x${count}`;
  };

  applyTrophy(trophyDigImageEl, trophyDigCountEl, dig);
  applyTrophy(trophyFishImageEl, trophyFishCountEl, fish);
  applyTrophy(trophyHuntImageEl, trophyHuntCountEl, hunt);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatSeconds(ms) {
  return Math.max(1, Math.ceil(ms / 1000));
}

function updateButtonsByCooldown() {
  const now = Date.now();
  actionButtons.forEach((button) => {
    const action = button.dataset.action;
    const remaining = (cooldownUntilByAction[action] || 0) - now;
    button.disabled = remaining > 0;
  });
}

function startCooldownTicker() {
  if (cooldownTimer) clearInterval(cooldownTimer);
  cooldownTimer = setInterval(() => {
    updateButtonsByCooldown();
  }, 250);
}

function startProfileSync() {
  if (profileSyncTimer) clearInterval(profileSyncTimer);
  profileSyncTimer = setInterval(async () => {
    if (showcasePanel && !showcasePanel.hidden && showcaseDraftDirty) return;
    try {
      await loadProfile();
    } catch (_err) {
      // Keep last-known values if polling fails.
    }
  }, 3000);
}

function renderChanceRows(tbodyEl, rows, mapFn) {
  tbodyEl.innerHTML = "";
  rows.forEach((row) => {
    const { left, right } = mapFn(row);
    const tr = document.createElement("tr");
    const leftCell = document.createElement("td");
    const rightCell = document.createElement("td");
    leftCell.textContent = left;
    rightCell.textContent = right;
    tr.appendChild(leftCell);
    tr.appendChild(rightCell);
    tbodyEl.appendChild(tr);
  });
}

function queueDevConfigSave() {
  if (!isDevOwner || !isDevModeActive) return;
  if (devSaveTimer) clearTimeout(devSaveTimer);
  devSaveTimer = setTimeout(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/dev/${discordUserId}/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: {
            actions: actionMeta.actions,
            freezeMoney: devFreezeMoneyToggle?.checked === true
          }
        })
      });
      if (!response.ok) {
        const payload = await readJsonSafely(response);
        setStatus(getApiError(payload, "Could not save dev changes."), "tone-error");
      }
    } catch (_err) {
      setStatus("Could not save dev changes.", "tone-error");
    }
  }, 300);
}

function buildRewardOptions(selectEl, action) {
  if (!selectEl) return;
  const config = actionMeta.actions[action];
  if (!config) return;
  selectEl.innerHTML = "";
  const options = [
    ...config.payoutTiers.map((tier) => tier.label),
    ...config.bonusTiers.map((tier) => tier.label)
  ];
  options.forEach((label) => {
    const option = document.createElement("option");
    option.value = label;
    option.textContent = label;
    selectEl.appendChild(option);
  });
}

function renderDevEditableChanceTable(action) {
  const config = actionMeta.actions[action];
  if (!config) return;
  selectedChanceAction = action;
  chanceWinningsEl.innerHTML = "";
  chanceBonusEl.innerHTML = "";

  config.payoutTiers.forEach((tier, index) => {
    const tr = document.createElement("tr");
    const leftCell = document.createElement("td");
    const rightCell = document.createElement("td");

    const minInput = document.createElement("input");
    minInput.type = "number";
    minInput.className = "chance-input";
    minInput.value = String(tier.min);
    minInput.addEventListener("change", () => {
      tier.min = Math.max(0, Number(minInput.value || 0));
      tier.max = Math.max(tier.min, tier.max);
      queueDevConfigSave();
      renderDevEditableChanceTable(action);
    });

    const maxInput = document.createElement("input");
    maxInput.type = "number";
    maxInput.className = "chance-input";
    maxInput.value = String(tier.max);
    maxInput.addEventListener("change", () => {
      tier.max = Math.max(tier.min, Number(maxInput.value || tier.min));
      queueDevConfigSave();
      renderDevEditableChanceTable(action);
    });

    const chanceInput = document.createElement("input");
    chanceInput.type = "number";
    chanceInput.step = "0.1";
    chanceInput.className = "chance-input";
    chanceInput.value = String(tier.chancePct);
    chanceInput.addEventListener("change", () => {
      tier.chancePct = Math.max(0, Number(chanceInput.value || 0));
      queueDevConfigSave();
    });

    const labelEl = document.createElement("div");
    labelEl.className = "chance-edit-label";
    labelEl.textContent = tier.label;

    const rangeWrap = document.createElement("div");
    rangeWrap.className = "chance-edit-range";
    rangeWrap.appendChild(minInput);
    rangeWrap.appendChild(document.createTextNode(" - "));
    rangeWrap.appendChild(maxInput);

    leftCell.appendChild(labelEl);
    leftCell.appendChild(rangeWrap);

    rightCell.className = "chance-edit-right";
    rightCell.appendChild(chanceInput);
    tr.appendChild(leftCell);
    tr.appendChild(rightCell);
    chanceWinningsEl.appendChild(tr);
  });

  config.bonusTiers.forEach((tier) => {
    const tr = document.createElement("tr");
    const leftCell = document.createElement("td");
    const rightCell = document.createElement("td");

    const labelEl = document.createElement("div");
    labelEl.className = "chance-edit-label";
    labelEl.textContent = tier.label;
    leftCell.appendChild(labelEl);
    if (tier.coins > 0) {
      const coinsInput = document.createElement("input");
      coinsInput.type = "number";
      coinsInput.className = "chance-input";
      coinsInput.value = String(tier.coins);
      coinsInput.addEventListener("change", () => {
        tier.coins = Math.max(0, Number(coinsInput.value || 0));
        queueDevConfigSave();
      });
      const coinsWrap = document.createElement("div");
      coinsWrap.className = "chance-edit-range";
      coinsWrap.appendChild(document.createTextNode("+$"));
      coinsWrap.appendChild(coinsInput);
      leftCell.appendChild(coinsWrap);
    }

    const chanceInput = document.createElement("input");
    chanceInput.type = "number";
    chanceInput.step = "0.1";
    chanceInput.className = "chance-input";
    chanceInput.value = String(tier.chancePct);
    chanceInput.addEventListener("change", () => {
      tier.chancePct = Math.max(0, Number(chanceInput.value || 0));
      queueDevConfigSave();
    });
    rightCell.className = "chance-edit-right";
    rightCell.appendChild(chanceInput);

    tr.appendChild(leftCell);
    tr.appendChild(rightCell);
    chanceBonusEl.appendChild(tr);
  });
}

function renderChanceTable(action) {
  const config = actionMeta.actions[action];
  if (!config) return;
  selectedChanceAction = action;

  if (currentMode !== "actions") {
    updateChancePanelForMode();
    return;
  }

  if (isDevOwner && isDevModeActive) {
    chanceTitleEl.textContent = `${formatActionLabel(action)} Chances`;
    chanceXpEl.textContent = `XP: ${config.xpMin}-${config.xpMax}`;
    renderDevEditableChanceTable(action);
    return;
  }

  const displayConfig = getDisplayActionConfig(action);
  if (!displayConfig) return;

  chanceTitleEl.textContent = `${formatActionLabel(action)} Chances`;
  chanceXpEl.textContent = `XP: ${displayConfig.xpMin}-${displayConfig.xpMax} | Boosts: Coins +${displayConfig.boostSummary?.cashPct || 0}% XP +${displayConfig.boostSummary?.xpPct || 0}%`;

  const totalCashBoostPct = Math.max(0, Number(displayConfig.boostSummary?.cashPct || 0));
  const cashBoostMultiplier = 1 + totalCashBoostPct / 100;
  const normalizedPayoutTiers = (config.payoutTiers || []).map((tier) => ({
    chancePct: Number(tier.chancePct || 0),
    min: Math.max(0, Math.ceil(Number(tier.min || 0) * cashBoostMultiplier)),
    max: Math.max(0, Math.ceil(Number(tier.max || 0) * cashBoostMultiplier))
  }));
  for (let i = 1; i < normalizedPayoutTiers.length; i += 1) {
    const prev = normalizedPayoutTiers[i - 1];
    const current = normalizedPayoutTiers[i];
    const minAllowed = prev.max + 1;
    if (current.min < minAllowed) {
      current.min = minAllowed;
    }
    if (current.max < current.min) {
      current.max = current.min;
    }
  }

  renderChanceRows(chanceWinningsEl, normalizedPayoutTiers, (tier) => ({
    left: `$${tier.min} - $${tier.max}`,
    right: `${formatChancePct(tier.chancePct)}%`
  }));

  renderChanceRows(chanceBonusEl, displayConfig.bonusTiers, (tier) => ({
    left: tier.coins > 0 ? `${tier.label} (+$${tier.coins})` : tier.label,
    right: `${formatChancePct(tier.chancePct)}%`
  }));
}

async function loadConfig() {
  if (window.location.hostname.includes("github.io")) return;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1500);
  try {
    const response = await fetch("/config", { signal: controller.signal });
    if (!response.ok) return;
    const config = await readJsonSafely(response);
    if (config.apiBaseUrl) apiBaseUrl = config.apiBaseUrl;
  } catch (_err) {
    // Keep default API base URL.
  } finally {
    clearTimeout(timeoutId);
  }
}

async function loadActionMeta() {
  try {
    if (isDevOwner && discordUserId) {
      const response = await fetch(`${apiBaseUrl}/dev/${discordUserId}/config`);
      if (response.ok) {
        const payload = await readJsonSafely(response);
        if (payload?.defaults?.actions) {
          actionMeta = payload.defaults;
          if (payload?.config?.actions) {
            actionMeta.actions = payload.config.actions;
          }
          return;
        }
      }
    }

    const fallbackResponse = await fetch(`${apiBaseUrl}/meta/actions`);
    if (!fallbackResponse.ok) return;
    const fallbackPayload = await readJsonSafely(fallbackResponse);
    if (fallbackPayload && fallbackPayload.actions) actionMeta = fallbackPayload;
  } catch (_err) {
    // Use fallback action metadata when endpoint is unavailable.
  }
}

function resolveUserId() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("discordUserId");
  if (fromQuery && /^\d{17,20}$/.test(fromQuery)) {
    localStorage.setItem("discordUserId", fromQuery);
    const cleanUrl = `${window.location.origin}${window.location.pathname}`;
    window.history.replaceState({}, "", cleanUrl);
    return fromQuery;
  }

  const fromStorage = localStorage.getItem("discordUserId");
  if (fromStorage && /^\d{17,20}$/.test(fromStorage)) return fromStorage;
  return "";
}

async function loadProfile() {
  const response = await fetch(`${apiBaseUrl}/players/${discordUserId}`);
  const payload = await readJsonSafely(response);
  if (!response.ok) throw new Error(getApiError(payload, "Could not load profile"));

  const profile = payload;
  applyPlayerSnapshot(profile);

  cooldownUntilByAction.dig = Number(profile.digCooldownUntil || 0);
  cooldownUntilByAction.fish = Number(profile.fishCooldownUntil || 0);
  cooldownUntilByAction.hunt = Number(profile.huntCooldownUntil || 0);
  updateButtonsByCooldown();
}

async function loadDevConfig() {
  const response = await fetch(`${apiBaseUrl}/dev/${discordUserId}/config`);
  const payload = await readJsonSafely(response);
  if (!response.ok) throw new Error(getApiError(payload, "Could not load dev config"));
  if (payload?.defaults?.actions) {
    actionMeta = payload.defaults;
    if (payload?.config?.actions) {
      actionMeta.actions = payload.config.actions;
    }
  }
  if (devFreezeMoneyToggle) {
    devFreezeMoneyToggle.checked = payload?.config?.freezeMoney === true;
  }
  return payload;
}

async function resetDevConfig() {
  const response = await fetch(`${apiBaseUrl}/dev/${discordUserId}/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  if (!response.ok) {
    const payload = await readJsonSafely(response);
    setStatus(getApiError(payload, "Could not reset dev config."), "tone-error");
    return;
  }
  await loadDevConfig();
  renderChanceTable(selectedChanceAction);
  buildRewardOptions(devTriggerDigSelect, "dig");
  buildRewardOptions(devTriggerFishSelect, "fish");
  buildRewardOptions(devTriggerHuntSelect, "hunt");
  setStatus("Dev config reverted to defaults.", "tone-success");
}

async function setDevLevel(level) {
  const response = await fetch(`${apiBaseUrl}/dev/${discordUserId}/level`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ level })
  });
  if (!response.ok) {
    const payload = await readJsonSafely(response);
    setStatus(getApiError(payload, "Could not set level."), "tone-error");
    return;
  }
  await loadProfile();
  setStatus(`Level set to ${Math.floor(level)}.`, "tone-success");
}

async function playAnimation(action, bonusLabel = "") {
  const target = animByAction[action];
  if (!target) return;
  if (action === "dig") {
    setDigAnimationVariant(bonusLabel);
  }
  Object.values(animByAction).forEach((node) => {
    node.hidden = true;
  });
  const mediaNodes = target.querySelectorAll("img, video");
  mediaNodes.forEach((node) => {
    if (node instanceof HTMLImageElement) {
      const src = node.src;
      node.src = "";
      node.src = src;
      return;
    }
    if (node instanceof HTMLVideoElement) {
      node.currentTime = 0;
      node.play().catch(() => {});
    }
  });
  target.hidden = false;
  const durationByAction = {
    dig: 1400,
    fish: 1500,
    hunt: 1450
  };
  await sleep(durationByAction[action] || 1400);
  target.hidden = true;
}

async function performAction(action) {
  const now = Date.now();
  const cooldownRemaining = (cooldownUntilByAction[action] || 0) - now;
  if (cooldownRemaining > 0) {
    setStatus(
      `${formatActionLabel(action)} is cooling down (${formatSeconds(cooldownRemaining)}s).`,
      "tone-error"
    );
    return;
  }

  actionButtons.forEach((button) => {
    button.disabled = true;
  });
  setStatus(`${formatActionLabel(action)} action started...`);

  try {
    const apiResponse = await fetch(`${apiBaseUrl}/players/${discordUserId}/actions/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    const payload = await readJsonSafely(apiResponse);
    if (apiResponse.status === 429) {
      const remaining = Number(payload.cooldownRemainingMs || 0);
      cooldownUntilByAction[action] = Number(payload.cooldownUntil || 0);
      if (payload.player) {
        applyPlayerSnapshot(payload.player);
      }
      setStatus(
        `${formatActionLabel(action)} cooldown: ${formatSeconds(remaining)}s.`,
        "tone-error"
      );
      updateButtonsByCooldown();
      return;
    }

    if (!apiResponse.ok) {
      setStatus(getApiError(payload, "Action failed."), "tone-error");
      updateButtonsByCooldown();
      return;
    }

    await playAnimation(action, payload.rewardBreakdown?.bonusLabel || "");

    applyPlayerSnapshot(payload.player);
    cooldownUntilByAction[action] = Number(payload.cooldownUntil || 0);

    const xpGain = Number(payload.rewardBreakdown?.xpGained || 0);
    const levelUps = payload.rewardBreakdown?.levelUps || [];
    const bonusItem = payload.rewardBreakdown?.bonusItemKey;
    if (levelUps.length > 0) {
      const lastLevel = levelUps[levelUps.length - 1].level;
      setStatus(
        `You earned $${payload.reward} and ${xpGain} XP. Level up to ${lastLevel}!${
          bonusItem ? ` Bonus drop: ${payload.rewardBreakdown.bonusLabel}.` : ""
        }`,
        "tone-success"
      );
    } else {
      setStatus(
        `You earned $${payload.reward} and ${xpGain} XP from ${formatActionLabel(action)}.${
          bonusItem ? ` Bonus drop: ${payload.rewardBreakdown.bonusLabel}.` : ""
        }`,
        "tone-success"
      );
    }
    await loadDailySummary().catch(() => {});
    await loadAchievements().catch(() => {});
    updateButtonsByCooldown();
  } catch (err) {
    setStatus(err.message || "Could not reach API.", "tone-error");
    updateButtonsByCooldown();
  }
}

function hideAllGambleControls() {
  setNodeVisible(coinflipControlsEl, false);
  setNodeVisible(coinflipAnimEl, false);
  setNodeVisible(blackjackControlsEl, false);
  setNodeVisible(slotsControlsEl, false);
  setNodeVisible(slotsPayoutsEl, false);
}

function resetBlackjackState() {
  blackjackState = {
    active: false,
    player: [],
    dealer: [],
    bet: 0,
    risk: 0,
    rewardMultiplier: 1
  };
  if (blackjackHitButton) blackjackHitButton.hidden = true;
  if (blackjackStandButton) blackjackStandButton.hidden = true;
  if (blackjackDealButton) blackjackDealButton.hidden = false;
  if (blackjackHitButton) blackjackHitButton.style.display = "none";
  if (blackjackStandButton) blackjackStandButton.style.display = "none";
  if (blackjackDealButton) blackjackDealButton.style.display = "";
}

function updateChancePanelForMode() {
  const showActionChances = currentMode === "actions";
  if (chanceCoinHeadingEl) chanceCoinHeadingEl.hidden = !showActionChances;
  if (chanceWinningsTableEl) chanceWinningsTableEl.hidden = !showActionChances;
  if (chanceBonusHeadingEl) chanceBonusHeadingEl.hidden = !showActionChances;
  if (chanceBonusTableEl) chanceBonusTableEl.hidden = !showActionChances;
  if (chanceTitleEl) chanceTitleEl.textContent = showActionChances ? `${formatActionLabel(selectedChanceAction)} Chances` : "Gambling";
  if (chanceXpEl) {
    const displayConfig = getDisplayActionConfig(selectedChanceAction);
    chanceXpEl.textContent = showActionChances
      ? `XP: ${displayConfig?.xpMin || 0}-${displayConfig?.xpMax || 0} | Boosts: Coins +${displayConfig?.boostSummary?.cashPct || 0}% XP +${displayConfig?.boostSummary?.xpPct || 0}%`
      : "Use the selector below to switch sections.";
  }
}

function setMode(mode) {
  const wantsGambling = mode === "gambling";
  if (wantsGambling && !isGamblingUnlocked()) {
    setStatus(`Gambling unlocks at level ${GAMBLING_UNLOCK_LEVEL}.`, "tone-error");
  }
  currentMode = wantsGambling && isGamblingUnlocked() ? "gambling" : "actions";
  const inGambling = currentMode === "gambling";
  if (mainTitleEl) mainTitleEl.textContent = inGambling ? "Gambling Hall" : "Action Center";
  setNodeVisible(openUpgradeButton, !inGambling, "block");
  setNodeVisible(regularActionsSection, !inGambling, "grid");
  setNodeVisible(gamblingActionsSection, inGambling, "grid");
  setNodeVisible(gamblingPanel, inGambling, "block");
  setNodeVisible(actionStageEl, !inGambling, "block");
  if (inGambling && upgradePanel) upgradePanel.hidden = true;
  if (!inGambling) {
    hideAllGambleControls();
    if (gamblingResultTextEl) gamblingResultTextEl.textContent = "No bet placed yet.";
    if (gamblingStatusEl) gamblingStatusEl.textContent = "Choose Coinflip, Blackjack, or Slots.";
    selectedGambleGame = "";
    coinflipInProgress = false;
    slotsSpinInProgress = false;
    if (coinflipHeadsButton) coinflipHeadsButton.disabled = false;
    if (coinflipTailsButton) coinflipTailsButton.disabled = false;
    if (slotsSpinButton) slotsSpinButton.disabled = false;
    resetBlackjackState();
  }
  updateChancePanelForMode();
  refreshDevPanelForMode();
  updateRiskUi();
}

function setActiveGambleGame(game) {
  if (!isGamblingUnlocked()) {
    setStatus(`Gambling unlocks at level ${GAMBLING_UNLOCK_LEVEL}.`, "tone-error");
    return;
  }
  selectedGambleGame = game;
  hideAllGambleControls();
  resetBlackjackState();
  if (gamblingResultTextEl) gamblingResultTextEl.textContent = "No bet placed yet.";
  if (game === "coinflip" && coinflipControlsEl) {
    setNodeVisible(coinflipControlsEl, true, "flex");
    setNodeVisible(coinflipAnimEl, true, "flex");
    if (gamblingStatusEl) gamblingStatusEl.textContent = "Coinflip active. Choose Heads or Tails.";
  } else if (game === "blackjack" && blackjackControlsEl) {
    setNodeVisible(blackjackControlsEl, true, "flex");
    if (gamblingStatusEl) gamblingStatusEl.textContent = "Blackjack active. Press Deal to start a hand.";
  } else if (game === "slots" && slotsControlsEl) {
    setNodeVisible(slotsControlsEl, true, "flex");
    setNodeVisible(slotsPayoutsEl, true, "block");
    if (gamblingStatusEl) gamblingStatusEl.textContent = "Slots active. Press Spin.";
  }
}

function getRuntimeRiskAndReward() {
  const baseRisk = getRiskPercent();
  const isDevGambling = isDevModeActive && currentMode === "gambling";
  const risk = isDevGambling ? getEffectiveRiskForGame() : baseRisk;
  const rewardMultiplier = isDevGambling
    ? getEffectiveRewardMultiplierForGame()
    : getRiskRewardMultiplier(risk);
  return { risk, rewardMultiplier };
}

async function playCoinflipAnimation() {
  if (!coinflipCoinEl) return;
  coinflipCoinEl.classList.remove("flipping");
  void coinflipCoinEl.offsetWidth;
  coinflipCoinEl.classList.add("flipping");
  await sleep(620);
  coinflipCoinEl.classList.remove("flipping");
}

function drawCard() {
  const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  return ranks[Math.floor(Math.random() * ranks.length)];
}

function handValue(hand) {
  let total = 0;
  let aceCount = 0;
  hand.forEach((card) => {
    if (card === "A") {
      aceCount += 1;
      total += 11;
      return;
    }
    if (card === "K" || card === "Q" || card === "J") {
      total += 10;
      return;
    }
    total += Number(card);
  });
  while (total > 21 && aceCount > 0) {
    total -= 10;
    aceCount -= 1;
  }
  return total;
}

async function resolveCoinflip(call) {
  if (coinflipInProgress) return;
  const bet = readBetOrSetError();
  if (!bet) return;
  coinflipInProgress = true;
  if (coinflipHeadsButton) coinflipHeadsButton.disabled = true;
  if (coinflipTailsButton) coinflipTailsButton.disabled = true;

  try {
    const { risk, rewardMultiplier } = getRuntimeRiskAndReward();
    const winChance = Math.max(0.2, 0.5 - risk * 0.0015);
    const opposite = call === "heads" ? "tails" : "heads";
    const coin = Math.random() < winChance ? call : opposite;
    const didWin = coin === call;
    await playCoinflipAnimation();

    if (didWin) {
      const profit = Math.floor(bet * 0.95 * rewardMultiplier);
      await settleGamblingRound("coinflip", profit, true);
      if (gamblingResultTextEl) {
        gamblingResultTextEl.textContent = `Coin landed ${coin}. You won $${formatCoins(profit)}.`;
      }
      setStatus(`Coinflip win: +$${formatCoins(profit)}.`, "tone-success");
    } else {
      await settleGamblingRound("coinflip", -bet, false);
      if (gamblingResultTextEl) {
        gamblingResultTextEl.textContent = `Coin landed ${coin}. You lost $${formatCoins(bet)}.`;
      }
      setStatus(`Coinflip loss: -$${formatCoins(bet)}.`, "tone-error");
    }
  } finally {
    coinflipInProgress = false;
    if (coinflipHeadsButton) coinflipHeadsButton.disabled = false;
    if (coinflipTailsButton) coinflipTailsButton.disabled = false;
  }
}

function startBlackjackHand() {
  if (blackjackState.active) return;
  const bet = readBetOrSetError();
  if (!bet) return;
  const { risk, rewardMultiplier } = getRuntimeRiskAndReward();

  blackjackState.active = true;
  blackjackState.bet = bet;
  blackjackState.risk = risk;
  blackjackState.rewardMultiplier = rewardMultiplier;
  blackjackState.player = [drawCard(), drawCard()];
  blackjackState.dealer = [drawCard(), drawCard()];

  if (blackjackHitButton) {
    blackjackHitButton.hidden = false;
    blackjackHitButton.style.display = "";
  }
  if (blackjackStandButton) {
    blackjackStandButton.hidden = false;
    blackjackStandButton.style.display = "";
  }
  if (blackjackDealButton) {
    blackjackDealButton.hidden = true;
    blackjackDealButton.style.display = "none";
  }
  const playerTotal = handValue(blackjackState.player);
  if (gamblingResultTextEl) {
    gamblingResultTextEl.textContent = `Player: ${blackjackState.player.join(", ")} (${playerTotal}) | Dealer: ${blackjackState.dealer[0]}, ?`;
  }

  if (playerTotal === 21) {
    finishBlackjack("blackjack");
  } else {
    setStatus("Blackjack hand started.", "tone-success");
  }
}

function finishBlackjack(reason) {
  if (!blackjackState.active) return;
  const playerTotal = handValue(blackjackState.player);
  let dealerTotal = handValue(blackjackState.dealer);

  if (reason !== "bust" && reason !== "blackjack") {
    while (dealerTotal < 17) {
      blackjackState.dealer.push(drawCard());
      dealerTotal = handValue(blackjackState.dealer);
    }
  }

  let result = "lose";
  if (reason === "bust") {
    result = "lose";
  } else if (reason === "blackjack") {
    result = "blackjack";
  } else if (dealerTotal > 21 || playerTotal > dealerTotal) {
    result = "win";
  } else if (playerTotal === dealerTotal) {
    result = "push";
  }

  let netDelta = -blackjackState.bet;
  if (result === "blackjack") {
    netDelta = Math.floor(blackjackState.bet * 1.5 * blackjackState.rewardMultiplier);
  } else if (result === "win") {
    netDelta = Math.floor(blackjackState.bet * 0.95 * blackjackState.rewardMultiplier);
  } else if (result === "push") {
    netDelta = 0;
  }

  settleGamblingRound("blackjack", netDelta, result === "win" || result === "blackjack")
    .catch((err) => {
      setStatus(err.message || "Could not settle blackjack result.", "tone-error");
    });

  const summary = `Player ${blackjackState.player.join(", ")} (${playerTotal}) | Dealer ${blackjackState.dealer.join(", ")} (${dealerTotal})`;
  if (gamblingResultTextEl) {
    if (result === "blackjack") {
      gamblingResultTextEl.textContent = `${summary}. Blackjack! You won $${formatCoins(netDelta)}.`;
    } else if (result === "win") {
      gamblingResultTextEl.textContent = `${summary}. You won $${formatCoins(netDelta)}.`;
    } else if (result === "push") {
      gamblingResultTextEl.textContent = `${summary}. Push. Bet returned.`;
    } else {
      gamblingResultTextEl.textContent = `${summary}. You lost $${formatCoins(blackjackState.bet)}.`;
    }
  }

  if (result === "lose") {
    setStatus("Blackjack loss.", "tone-error");
  } else {
    setStatus("Blackjack resolved.", "tone-success");
  }
  resetBlackjackState();
}

function blackjackHit() {
  if (!blackjackState.active) return;
  blackjackState.player.push(drawCard());
  const total = handValue(blackjackState.player);
  if (gamblingResultTextEl) {
    gamblingResultTextEl.textContent = `Player: ${blackjackState.player.join(", ")} (${total}) | Dealer: ${blackjackState.dealer[0]}, ?`;
  }
  if (total > 21) {
    finishBlackjack("bust");
  }
}

async function spinSlots() {
  if (slotsSpinInProgress) return;
  const bet = readBetOrSetError();
  if (!bet) return;
  slotsSpinInProgress = true;
  if (slotsSpinButton) slotsSpinButton.disabled = true;

  try {
    const { rewardMultiplier } = getRuntimeRiskAndReward();
    const roll = () => SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
    if (gamblingStatusEl) gamblingStatusEl.textContent = "Spinning...";

    for (let i = 0; i < 10; i += 1) {
      const preview = [roll(), roll(), roll()];
      if (gamblingResultTextEl) gamblingResultTextEl.textContent = `${preview.join(" | ")} ...`;
      await sleep(95);
    }

    const reels = [roll(), roll(), roll()];
    const combo = SLOT_COMBO_PAYOUTS.find((entry) => entry.matches(reels));
    let netDelta = -bet;
    if (combo) {
      netDelta = Math.floor(bet * combo.baseMultiplier * rewardMultiplier);
    }

    await settleGamblingRound("slots", netDelta, !!combo);
    if (gamblingResultTextEl) {
      const reelText = reels.join(" | ");
      if (combo && netDelta >= 0) {
        gamblingResultTextEl.textContent = `${reelText} -> ${combo.label} hit! You won $${formatCoins(netDelta)}.`;
      } else {
        gamblingResultTextEl.textContent = `${reelText} -> You lost $${formatCoins(Math.abs(netDelta))}.`;
      }
    }
    if (netDelta >= 0) {
      setStatus(`Slots win: +$${formatCoins(netDelta)}.`, "tone-success");
    } else {
      setStatus(`Slots loss: -$${formatCoins(Math.abs(netDelta))}.`, "tone-error");
    }
  } catch (err) {
    setStatus(err.message || "Could not settle slots result.", "tone-error");
  } finally {
    slotsSpinInProgress = false;
    if (slotsSpinButton) slotsSpinButton.disabled = false;
    if (gamblingStatusEl && selectedGambleGame === "slots") {
      gamblingStatusEl.textContent = "Slots active. Press Spin.";
    }
  }
}

async function runDevGambleRound() {
  if (!isDevModeActive || currentMode !== "gambling") return;
  const game = devGambleGameSelect?.value || "coinflip";
  const outcome = devGambleOutcomeSelect?.value || "win";
  const bet = readBetOrSetError() || 100;
  const rewardMultiplier = getEffectiveRewardMultiplierForGame();

  await setActiveGambleGame(game);

  if (game === "coinflip") {
    const profit = Math.floor(bet * 0.95 * rewardMultiplier);
    const won = outcome !== "lose";
    const delta = won ? profit : -bet;
    await settleGamblingRound("coinflip", delta, won);
    if (gamblingResultTextEl) {
      gamblingResultTextEl.textContent = won
        ? `Dev Coinflip Win -> +$${formatCoins(delta)}`
        : `Dev Coinflip Loss -> -$${formatCoins(Math.abs(delta))}`;
    }
    setStatus(`Dev coinflip ${won ? "win" : "loss"} applied.`, won ? "tone-success" : "tone-error");
    return;
  }

  if (game === "blackjack") {
    let delta = -bet;
    let won = false;
    if (outcome === "push") {
      delta = 0;
    } else if (outcome === "win") {
      delta = Math.floor(bet * 0.95 * rewardMultiplier);
      won = true;
    }
    await settleGamblingRound("blackjack", delta, won);
    if (gamblingResultTextEl) {
      gamblingResultTextEl.textContent =
        outcome === "push"
          ? "Dev Blackjack Push -> $0"
          : won
            ? `Dev Blackjack Win -> +$${formatCoins(delta)}`
            : `Dev Blackjack Loss -> -$${formatCoins(Math.abs(delta))}`;
    }
    setStatus(`Dev blackjack ${outcome} applied.`, outcome === "lose" ? "tone-error" : "tone-success");
    return;
  }

  const combo = SLOT_COMBO_PAYOUTS[0];
  const won = outcome !== "lose";
  const delta = won ? Math.floor(bet * combo.baseMultiplier * rewardMultiplier) : -bet;
  await settleGamblingRound("slots", delta, won);
  if (gamblingResultTextEl) {
    gamblingResultTextEl.textContent = won
      ? `Dev Slots Win (${combo.label}) -> +$${formatCoins(delta)}`
      : `Dev Slots Loss -> -$${formatCoins(Math.abs(delta))}`;
  }
  setStatus(`Dev slots ${won ? "win" : "loss"} applied.`, won ? "tone-success" : "tone-error");
}

function bindActions() {
  actionButtons.forEach((button) => {
    const action = button.dataset.action;
    button.addEventListener("click", () => performAction(action));
    button.addEventListener("mouseenter", () => renderChanceTable(action));
    button.addEventListener("focus", () => renderChanceTable(action));
  });
}

function bindModeAndGambling() {
  if (shopButton) {
    shopButton.addEventListener("click", () => {
      setProfileFocusMode(false);
      profilePanel.hidden = true;
      if (shopPanel) {
        shopPanel.hidden = false;
        renderShopPanel();
      }
    });
  }

  if (modeActionsButton) {
    modeActionsButton.addEventListener("click", () => {
      setMode("actions");
      setStatus("Action Center selected.");
    });
  }

  if (modeGamblingButton) {
    modeGamblingButton.addEventListener("click", () => {
      setMode("gambling");
      if (currentMode === "gambling") {
        setStatus("Gambling section selected.");
      }
    });
  }

  gambleGameButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const game = button.dataset.gambleGame;
      if (game) setActiveGambleGame(game);
    });
  });

  if (coinflipHeadsButton) {
    coinflipHeadsButton.addEventListener("click", () => {
      resolveCoinflip("heads").catch((err) => {
        setStatus(err.message || "Coinflip failed.", "tone-error");
      });
    });
  }

  if (coinflipTailsButton) {
    coinflipTailsButton.addEventListener("click", () => {
      resolveCoinflip("tails").catch((err) => {
        setStatus(err.message || "Coinflip failed.", "tone-error");
      });
    });
  }

  if (blackjackDealButton) {
    blackjackDealButton.addEventListener("click", startBlackjackHand);
  }

  if (blackjackHitButton) {
    blackjackHitButton.addEventListener("click", blackjackHit);
  }

  if (blackjackStandButton) {
    blackjackStandButton.addEventListener("click", () => finishBlackjack("stand"));
  }

  if (slotsSpinButton) {
    slotsSpinButton.addEventListener("click", spinSlots);
  }

  if (riskSliderEl) {
    riskSliderEl.addEventListener("input", updateRiskUi);
  }

  if (betAmountInputEl) {
    betAmountInputEl.addEventListener("input", updateBetParsedUi);
    betAmountInputEl.addEventListener("blur", updateBetParsedUi);
  }

  if (claimDailyButton) {
    claimDailyButton.addEventListener("click", async () => {
      try {
        const payload = await fetchApi(`/players/${discordUserId}/daily/claim`, {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        });
        applyPlayerSnapshot(payload.player);
        await loadDailySummary();
        await loadAchievements().catch(() => {});
        setStatus(`Daily claimed: +$${formatCoins(payload.rewardCoins)}.`, "tone-success");
      } catch (err) {
        setStatus(err.message || "Daily claim failed.", "tone-error");
      }
    });
  }

  if (claimDailyChallengeButton) {
    claimDailyChallengeButton.addEventListener("click", async () => {
      try {
        const payload = await fetchApi(`/players/${discordUserId}/daily/challenge/claim`, {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        });
        applyPlayerSnapshot(payload.player);
        await loadDailySummary();
        await loadAchievements().catch(() => {});
        setStatus(
          `Daily challenge claimed: +$${formatCoins(payload.rewardCoins)}.`,
          "tone-success"
        );
      } catch (err) {
        setStatus(err.message || "Challenge claim failed.", "tone-error");
      }
    });
  }

  updateRiskUi();
  updateBetParsedUi();
}

function closeDropdown() {
  if (!userDropdown) return;
  userDropdown.hidden = true;
}

function bindUserMenu() {
  if (!userMenuButton || !userDropdown || !openProfileButton || !profilePanel || !closeProfileButton) {
    return;
  }

  userMenuButton.addEventListener("click", (event) => {
    event.stopPropagation();
    userDropdown.hidden = !userDropdown.hidden;
  });

  openProfileButton.addEventListener("click", () => {
    closeNonProfilePanels();
    profilePanel.hidden = false;
    setProfileFocusMode(true);
    closeDropdown();
    if (currentProfile) {
      populateProfilePanel(currentProfile);
    }
  });

  closeProfileButton.addEventListener("click", () => {
    profilePanel.hidden = true;
    setProfileFocusMode(false);
  });

  if (openDailyButton && dailyPanel && closeDailyButton) {
    openDailyButton.addEventListener("click", async () => {
      setProfileFocusMode(false);
      profilePanel.hidden = true;
      dailyPanel.hidden = false;
      closeDropdown();
      try {
        await loadDailySummary();
      } catch (_err) {
        setStatus("Could not load daily data.", "tone-error");
      }
    });
    closeDailyButton.addEventListener("click", () => {
      dailyPanel.hidden = true;
    });
  }

  if (openAchievementsButton && achievementsPanel && closeAchievementsButton) {
    openAchievementsButton.addEventListener("click", async () => {
      setProfileFocusMode(false);
      profilePanel.hidden = true;
      achievementsPanel.hidden = false;
      closeDropdown();
      try {
        await loadAchievements();
      } catch (_err) {
        setStatus("Could not load achievements.", "tone-error");
      }
    });
    closeAchievementsButton.addEventListener("click", () => {
      achievementsPanel.hidden = true;
    });
  }

  if (openInventoryButton && inventoryPanel && closeInventoryButton) {
    openInventoryButton.addEventListener("click", async () => {
      setProfileFocusMode(false);
      inventoryPanel.hidden = false;
      try {
        await loadInventoryData();
      } catch (_err) {
        renderInventoryPanel();
      }
    });
    closeInventoryButton.addEventListener("click", () => {
      inventoryPanel.hidden = true;
    });
  }

  if (openUpgradeButton && upgradePanel && closeUpgradeButton) {
    openUpgradeButton.addEventListener("click", async () => {
      setProfileFocusMode(false);
      upgradePanel.hidden = false;
      try {
        await loadUpgrades();
      } catch (_err) {
        setStatus("Could not load upgrades.", "tone-error");
      }
    });
    closeUpgradeButton.addEventListener("click", () => {
      upgradePanel.hidden = true;
    });
  }

  if (openTrophiesButton && trophyPanel && closeTrophiesButton) {
    openTrophiesButton.addEventListener("click", () => {
      setProfileFocusMode(false);
      trophyPanel.hidden = false;
      if (currentProfile) {
        populateTrophyPanel(currentProfile);
      }
    });
    closeTrophiesButton.addEventListener("click", () => {
      trophyPanel.hidden = true;
    });
  }

  if (openShowcaseButton && showcasePanel && closeShowcaseButton) {
    openShowcaseButton.addEventListener("click", async () => {
      setProfileFocusMode(false);
      showcaseDraftDirty = false;
      showcasePanel.hidden = false;
      closeDropdown();
      try {
        await loadInventoryData();
      } catch (_err) {
        renderShowcasePanel();
      }
    });
    closeShowcaseButton.addEventListener("click", () => {
      showcasePanel.hidden = true;
      showcaseDraftDirty = false;
      syncShowcaseDraftFromProfile();
    });
  }

  if (saveShowcaseButton) {
    saveShowcaseButton.addEventListener("click", () => {
      saveShowcaseSelection().catch((err) => {
        setStatus(err.message || "Could not save showcase.", "tone-error");
      });
    });
  }

  if (closeShopButton && shopPanel) {
    closeShopButton.addEventListener("click", () => {
      shopPanel.hidden = true;
    });
  }
  if (shopBuyShowcaseButton) {
    shopBuyShowcaseButton.addEventListener("click", () => {
      purchaseShowcaseSlotFromShop().catch((err) => {
        setStatus(err.message || "Could not purchase showcase slot.", "tone-error");
      });
    });
  }

  if (isDevOwner && openDevModeButton && devPanel && closeDevModeButton) {
    openDevModeButton.hidden = false;
    openDevModeButton.addEventListener("click", async () => {
      devPanel.hidden = false;
      isDevModeActive = true;
      closeDropdown();
      try {
        await loadDevConfig();
        refreshDevPanelForMode();
        if (devMoneyInput) {
          devMoneyInput.value = String(Math.floor(Number(currentProfile?.money || 0)));
        }
        renderChanceTable(selectedChanceAction);
        buildRewardOptions(devTriggerDigSelect, "dig");
        buildRewardOptions(devTriggerFishSelect, "fish");
        buildRewardOptions(devTriggerHuntSelect, "hunt");
        if (devGambleRiskInput && riskSliderEl) {
          devGambleRiskInput.value = String(Number(riskSliderEl.value || 0));
        }
        if (devGambleRewardInput) devGambleRewardInput.value = "1";
        if (
          devUpgradeActionSelect &&
          devUpgradeKeySelect &&
          devUpgradeLevelInput &&
          currentProfile?.upgrades
        ) {
          const currentLevel =
            currentProfile.upgrades?.[devUpgradeActionSelect.value]?.[devUpgradeKeySelect.value]
              ?.level || 0;
          devUpgradeLevelInput.value = String(currentLevel);
        }
        updateRiskUi();
      } catch (_err) {
        setStatus("Could not load dev mode config.", "tone-error");
      }
    });

    closeDevModeButton.addEventListener("click", () => {
      devPanel.hidden = true;
      isDevModeActive = false;
      if (devLootControls) devLootControls.hidden = true;
      renderChanceTable(selectedChanceAction);
      updateRiskUi();
    });

    if (devSetLevelButton && devLevelInput) {
      devSetLevelButton.addEventListener("click", async () => {
        await setDevLevel(Number(devLevelInput.value || 1));
      });
    }
    if (devMaxLevelButton) {
      devMaxLevelButton.addEventListener("click", async () => {
        if (devLevelInput) devLevelInput.value = "100";
        await setDevLevel(100);
      });
    }
    if (devTriggerDigButton) {
      devTriggerDigButton.addEventListener("click", async () => {
        try {
          const payload = await triggerDevAction("dig", devTriggerDigSelect?.value || "");
          setStatus(
            `Dev Dig reward: +$${formatCoins(payload.reward || 0)}.`,
            "tone-success"
          );
        } catch (err) {
          setStatus(err.message || "Dev dig trigger failed.", "tone-error");
        }
      });
    }
    if (devTriggerFishButton) {
      devTriggerFishButton.addEventListener("click", async () => {
        try {
          const payload = await triggerDevAction("fish", devTriggerFishSelect?.value || "");
          setStatus(
            `Dev Fish reward: +$${formatCoins(payload.reward || 0)}.`,
            "tone-success"
          );
        } catch (err) {
          setStatus(err.message || "Dev fish trigger failed.", "tone-error");
        }
      });
    }
    if (devTriggerHuntButton) {
      devTriggerHuntButton.addEventListener("click", async () => {
        try {
          const payload = await triggerDevAction("hunt", devTriggerHuntSelect?.value || "");
          setStatus(
            `Dev Hunt reward: +$${formatCoins(payload.reward || 0)}.`,
            "tone-success"
          );
        } catch (err) {
          setStatus(err.message || "Dev hunt trigger failed.", "tone-error");
        }
      });
    }
    if (
      devSetUpgradeLevelButton &&
      devUpgradeActionSelect &&
      devUpgradeKeySelect &&
      devUpgradeLevelInput
    ) {
      devSetUpgradeLevelButton.addEventListener("click", async () => {
        try {
          await setDevUpgradeLevel(
            devUpgradeActionSelect.value,
            devUpgradeKeySelect.value,
            Number(devUpgradeLevelInput.value || 0)
          );
          setStatus("Dev upgrade level updated.", "tone-success");
        } catch (err) {
          setStatus(err.message || "Could not set upgrade level.", "tone-error");
        }
      });
      const syncUpgradeInput = () => {
        if (!currentProfile?.upgrades || !devUpgradeLevelInput) return;
        const currentLevel =
          currentProfile.upgrades?.[devUpgradeActionSelect.value]?.[devUpgradeKeySelect.value]
            ?.level || 0;
        devUpgradeLevelInput.value = String(currentLevel);
      };
      devUpgradeActionSelect.addEventListener("change", syncUpgradeInput);
      devUpgradeKeySelect.addEventListener("change", syncUpgradeInput);
    }
    if (devResetConfigButton) {
      devResetConfigButton.addEventListener("click", resetDevConfig);
    }
    if (devSetMoneyButton && devMoneyInput) {
      devSetMoneyButton.addEventListener("click", async () => {
        try {
          await setDevMoneyValue(devMoneyInput.value);
          setStatus("Money updated.", "tone-success");
        } catch (err) {
          setStatus(err.message || "Could not set money.", "tone-error");
        }
      });
    }
    if (devResetProgressButton) {
      devResetProgressButton.addEventListener("click", async () => {
        try {
          await resetDevProgress();
          if (devMoneyInput) devMoneyInput.value = "0";
          if (devLevelInput) devLevelInput.value = "1";
          if (devUpgradeLevelInput) devUpgradeLevelInput.value = "0";
          if (devFreezeMoneyToggle) devFreezeMoneyToggle.checked = false;
          setStatus("All progress reset to baseline.", "tone-success");
        } catch (err) {
          setStatus(err.message || "Could not reset progress.", "tone-error");
        }
      });
    }
    if (devFreezeMoneyToggle) {
      devFreezeMoneyToggle.addEventListener("change", async () => {
        try {
          await setDevFreezeMoney(devFreezeMoneyToggle.checked === true);
          queueDevConfigSave();
          setStatus(
            devFreezeMoneyToggle.checked ? "Money frozen." : "Money unfrozen.",
            "tone-success"
          );
        } catch (err) {
          setStatus(err.message || "Could not change freeze state.", "tone-error");
        }
      });
    }
    if (devApplyGambleSettingsButton) {
      devApplyGambleSettingsButton.addEventListener("click", () => {
        const nextRisk = Math.max(0, Number(devGambleRiskInput?.value || 0));
        const nextReward = Math.max(0.01, Number(devGambleRewardInput?.value || 1));
        if (devGambleRiskInput) devGambleRiskInput.value = String(nextRisk);
        if (devGambleRewardInput) devGambleRewardInput.value = String(nextReward);
        if (riskSliderEl) riskSliderEl.value = String(Math.max(0, Math.min(99, Math.round(nextRisk))));
        updateRiskUi();
        setStatus("Dev risk/reward applied.", "tone-success");
      });
    }
    if (devRunGambleButton) {
      devRunGambleButton.addEventListener("click", () => {
        runDevGambleRound().catch((err) => {
          setStatus(err.message || "Could not run dev gamble round.", "tone-error");
        });
      });
    }
  }

  document.addEventListener("click", (event) => {
    const clickTarget = event.target;
    const clickedButton =
      clickTarget instanceof Element && userMenuButton.contains(clickTarget);
    if (!userDropdown.hidden && !userDropdown.contains(clickTarget) && !clickedButton) {
      closeDropdown();
    }
  });
}

async function init() {
  await loadConfig();

  discordUserId = resolveUserId();
  if (!discordUserId) {
    setStatus("Login required. Return to home and sign in with Discord.", "tone-error");
    actionButtons.forEach((button) => {
      button.disabled = true;
    });
    return;
  }

  isDevOwner = discordUserId === DEV_OWNER_DISCORD_USER_ID;
  await loadActionMeta();
  renderChanceTable("dig");

  bindActions();
  bindModeAndGambling();
  bindUserMenu();
  updateModeMenuAvailability();
  setMode("actions");
  startCooldownTicker();
  startProfileSync();
  await loadProfile();
  await ensurePlayerTimezone();
  setStatus("Choose Dig, Fish, or Hunt.");
}

init().catch((err) => {
  actionButtons.forEach((button) => {
    button.disabled = true;
  });
  setStatus(err.message || "Failed to initialize play screen.", "tone-error");
});
