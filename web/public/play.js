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
const devResetConfigButton = document.getElementById("dev-reset-config-button");
const devLootControls = document.getElementById("dev-loot-controls");
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
const coinflipControlsEl = document.getElementById("coinflip-controls");
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
      xpMax: 20,
      payoutTiers: [
        { chancePct: 45, min: 6, max: 12, label: "Small Pouch" },
        { chancePct: 32, min: 13, max: 20, label: "Good Find" },
        { chancePct: 18, min: 21, max: 34, label: "Lucky Find" },
        { chancePct: 5, min: 35, max: 52, label: "Jackpot Vein" }
      ],
      bonusTiers: [
        { chancePct: 87, coins: 0, label: "No extra drop", itemKey: null, itemImage: null },
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
      xpMin: 14,
      xpMax: 22,
      payoutTiers: [
        { chancePct: 42, min: 8, max: 14, label: "Common Catch" },
        { chancePct: 34, min: 15, max: 24, label: "Fresh Catch" },
        { chancePct: 19, min: 25, max: 38, label: "Big Catch" },
        { chancePct: 5, min: 39, max: 58, label: "Legend Catch" }
      ],
      bonusTiers: [
        { chancePct: 85, coins: 0, label: "No extra drop", itemKey: null, itemImage: null },
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
      xpMin: 16,
      xpMax: 25,
      payoutTiers: [
        { chancePct: 40, min: 10, max: 18, label: "Small Trophy" },
        { chancePct: 35, min: 19, max: 30, label: "Strong Trophy" },
        { chancePct: 20, min: 31, max: 46, label: "Prime Trophy" },
        { chancePct: 5, min: 47, max: 68, label: "Elite Trophy" }
      ],
      bonusTiers: [
        { chancePct: 84, coins: 0, label: "No extra drop", itemKey: null, itemImage: null },
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
let isDevOwner = false;
let isDevModeActive = false;
let selectedChanceAction = "dig";
let devSaveTimer = null;
let digAnimationVersion = 0;
let currentMode = "actions";
let selectedGambleGame = "";
let sessionWalletDelta = 0;
let blackjackState = {
  active: false,
  player: [],
  dealer: [],
  bet: 0,
  risk: 0,
  rewardMultiplier: 1
};

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
  const rewardIncreasePct = Math.round((getRiskRewardMultiplier(riskPercent) - 1) * 100);
  if (riskCurrentEl) riskCurrentEl.textContent = `Current Risk: ${riskPercent}%`;
  if (riskRewardEl) riskRewardEl.textContent = `Reward Increase: +${rewardIncreasePct}%`;
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
  if (parsedBet > getDisplayWallet()) {
    setStatus("Not enough coins for that bet.", "tone-error");
    if (gamblingStatusEl) gamblingStatusEl.textContent = "Insufficient wallet for this bet.";
    return 0;
  }
  return parsedBet;
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
  profileTrophiesEl.textContent = `${digCount > 0 ? "[X]" : "[ ]"} ${
    fishCount > 0 ? "[X]" : "[ ]"
  } ${huntCount > 0 ? "[X]" : "[ ]"}`;
  profileJoinedEl.textContent = formatDate(profile.createdAt);
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
        body: JSON.stringify({ config: { actions: actionMeta.actions } })
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

  chanceTitleEl.textContent = `${formatActionLabel(action)} Chances`;
  chanceXpEl.textContent = `XP: ${config.xpMin}-${config.xpMax}`;

  if (isDevOwner && isDevModeActive) {
    renderDevEditableChanceTable(action);
    return;
  }

  renderChanceRows(chanceWinningsEl, config.payoutTiers, (tier) => ({
    left: `$${tier.min} - $${tier.max}`,
    right: `${tier.chancePct}%`
  }));

  renderChanceRows(chanceBonusEl, config.bonusTiers, (tier) => ({
    left: tier.coins > 0 ? `${tier.label} (+$${tier.coins})` : tier.label,
    right: `${tier.chancePct}%`
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
  currentProfile = profile;
  setWallet(getDisplayWallet());
  setLevelBar(profile);
  setUserAvatar(profile.discordAvatarUrl);
  populateProfilePanel(profile);

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
        currentProfile = payload.player;
        setWallet(getDisplayWallet());
        setLevelBar(payload.player);
        populateProfilePanel(payload.player);
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

    currentProfile = payload.player;
    setWallet(getDisplayWallet());
    setLevelBar(payload.player);
    populateProfilePanel(payload.player);
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
    updateButtonsByCooldown();
  } catch (err) {
    setStatus(err.message || "Could not reach API.", "tone-error");
    updateButtonsByCooldown();
  }
}

function hideAllGambleControls() {
  setNodeVisible(coinflipControlsEl, false);
  setNodeVisible(blackjackControlsEl, false);
  setNodeVisible(slotsControlsEl, false);
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
  if (blackjackHitButton) blackjackHitButton.style.display = "none";
  if (blackjackStandButton) blackjackStandButton.style.display = "none";
}

function updateChancePanelForMode() {
  const showActionChances = currentMode === "actions";
  if (chanceCoinHeadingEl) chanceCoinHeadingEl.hidden = !showActionChances;
  if (chanceWinningsTableEl) chanceWinningsTableEl.hidden = !showActionChances;
  if (chanceBonusHeadingEl) chanceBonusHeadingEl.hidden = !showActionChances;
  if (chanceBonusTableEl) chanceBonusTableEl.hidden = !showActionChances;
  if (chanceTitleEl) chanceTitleEl.textContent = showActionChances ? `${formatActionLabel(selectedChanceAction)} Chances` : "Gambling";
  if (chanceXpEl) {
    chanceXpEl.textContent = showActionChances
      ? `XP: ${actionMeta.actions[selectedChanceAction]?.xpMin || 0}-${actionMeta.actions[selectedChanceAction]?.xpMax || 0}`
      : "Use Menu to switch sections.";
  }
}

function setMode(mode) {
  currentMode = mode === "gambling" ? "gambling" : "actions";
  const inGambling = currentMode === "gambling";
  if (mainTitleEl) mainTitleEl.textContent = inGambling ? "Gambling Hall" : "Action Center";
  setNodeVisible(regularActionsSection, !inGambling, "grid");
  setNodeVisible(gamblingActionsSection, inGambling, "grid");
  setNodeVisible(gamblingPanel, inGambling, "block");
  setNodeVisible(actionStageEl, !inGambling, "block");
  if (!inGambling) {
    hideAllGambleControls();
    if (gamblingResultTextEl) gamblingResultTextEl.textContent = "No bet placed yet.";
    if (gamblingStatusEl) gamblingStatusEl.textContent = "Choose Coinflip, Blackjack, or Slots.";
    selectedGambleGame = "";
    resetBlackjackState();
  }
  updateChancePanelForMode();
}

function setActiveGambleGame(game) {
  selectedGambleGame = game;
  hideAllGambleControls();
  resetBlackjackState();
  if (gamblingResultTextEl) gamblingResultTextEl.textContent = "No bet placed yet.";
  if (game === "coinflip" && coinflipControlsEl) {
    setNodeVisible(coinflipControlsEl, true, "flex");
    if (gamblingStatusEl) gamblingStatusEl.textContent = "Coinflip active. Choose Heads or Tails.";
  } else if (game === "blackjack" && blackjackControlsEl) {
    setNodeVisible(blackjackControlsEl, true, "flex");
    if (gamblingStatusEl) gamblingStatusEl.textContent = "Blackjack active. Press Deal to start a hand.";
  } else if (game === "slots" && slotsControlsEl) {
    setNodeVisible(slotsControlsEl, true, "flex");
    if (gamblingStatusEl) gamblingStatusEl.textContent = "Slots active. Press Spin.";
  }
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

function resolveCoinflip(call) {
  const bet = readBetOrSetError();
  if (!bet) return;

  const risk = getRiskPercent();
  const rewardMultiplier = getRiskRewardMultiplier(risk);
  const winChance = Math.max(0.2, 0.5 - risk * 0.0015);
  const opposite = call === "heads" ? "tails" : "heads";
  const coin = Math.random() < winChance ? call : opposite;
  const didWin = coin === call;

  if (didWin) {
    const profit = Math.floor(bet * 0.95 * rewardMultiplier);
    applyWalletDelta(profit);
    if (gamblingResultTextEl) {
      gamblingResultTextEl.textContent = `Coin landed ${coin}. You won $${formatCoins(profit)}.`;
    }
    setStatus(`Coinflip win: +$${formatCoins(profit)}.`, "tone-success");
  } else {
    applyWalletDelta(-bet);
    if (gamblingResultTextEl) {
      gamblingResultTextEl.textContent = `Coin landed ${coin}. You lost $${formatCoins(bet)}.`;
    }
    setStatus(`Coinflip loss: -$${formatCoins(bet)}.`, "tone-error");
  }
}

function startBlackjackHand() {
  const bet = readBetOrSetError();
  if (!bet) return;
  const risk = getRiskPercent();
  const rewardMultiplier = getRiskRewardMultiplier(risk);

  blackjackState.active = true;
  blackjackState.bet = bet;
  blackjackState.risk = risk;
  blackjackState.rewardMultiplier = rewardMultiplier;
  blackjackState.player = [drawCard(), drawCard()];
  blackjackState.dealer = [drawCard(), drawCard()];
  applyWalletDelta(-bet);

  if (blackjackHitButton) {
    blackjackHitButton.hidden = false;
    blackjackHitButton.style.display = "";
  }
  if (blackjackStandButton) {
    blackjackStandButton.hidden = false;
    blackjackStandButton.style.display = "";
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

  let change = 0;
  if (result === "blackjack") {
    const profit = Math.floor(blackjackState.bet * 1.5 * blackjackState.rewardMultiplier);
    change = blackjackState.bet + profit;
  } else if (result === "win") {
    const profit = Math.floor(blackjackState.bet * 0.95 * blackjackState.rewardMultiplier);
    change = blackjackState.bet + profit;
  } else if (result === "push") {
    change = blackjackState.bet;
  }
  applyWalletDelta(change);

  const summary = `Player ${blackjackState.player.join(", ")} (${playerTotal}) | Dealer ${blackjackState.dealer.join(", ")} (${dealerTotal})`;
  if (gamblingResultTextEl) {
    if (result === "blackjack") {
      gamblingResultTextEl.textContent = `${summary}. Blackjack! You won $${formatCoins(change - blackjackState.bet)}.`;
    } else if (result === "win") {
      gamblingResultTextEl.textContent = `${summary}. You won $${formatCoins(change - blackjackState.bet)}.`;
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

function spinSlots() {
  const bet = readBetOrSetError();
  if (!bet) return;

  const risk = getRiskPercent();
  const rewardMultiplier = getRiskRewardMultiplier(risk);
  const symbols = ["Cherry", "Bell", "BAR", "Diamond", "7"];
  const roll = () => symbols[Math.floor(Math.random() * symbols.length)];
  const reels = [roll(), roll(), roll()];

  const uniqueCount = new Set(reels).size;
  let change = -bet;
  if (uniqueCount === 1) {
    const jackpotProfit = Math.floor(bet * (2.4 + rewardMultiplier));
    change = jackpotProfit;
  } else if (uniqueCount === 2) {
    const smallProfit = Math.floor(bet * (0.55 + rewardMultiplier * 0.35));
    change = smallProfit;
  }

  applyWalletDelta(change);
  if (gamblingResultTextEl) {
    const reelText = reels.join(" | ");
    if (change >= 0) {
      gamblingResultTextEl.textContent = `${reelText} -> You won $${formatCoins(change)}.`;
    } else {
      gamblingResultTextEl.textContent = `${reelText} -> You lost $${formatCoins(Math.abs(change))}.`;
    }
  }
  if (change >= 0) {
    setStatus(`Slots win: +$${formatCoins(change)}.`, "tone-success");
  } else {
    setStatus(`Slots loss: -$${formatCoins(Math.abs(change))}.`, "tone-error");
  }
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
      setStatus("Shop is coming soon.");
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
      setStatus("Gambling section selected.");
    });
  }

  gambleGameButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const game = button.dataset.gambleGame;
      if (game) setActiveGambleGame(game);
    });
  });

  if (coinflipHeadsButton) {
    coinflipHeadsButton.addEventListener("click", () => resolveCoinflip("heads"));
  }

  if (coinflipTailsButton) {
    coinflipTailsButton.addEventListener("click", () => resolveCoinflip("tails"));
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

  updateRiskUi();
  updateBetParsedUi();
}

function closeDropdown() {
  if (!userDropdown) return;
  userDropdown.hidden = true;
}

function bindUserMenu() {
  if (
    !userMenuButton ||
    !userDropdown ||
    !openProfileButton ||
    !profilePanel ||
    !closeProfileButton ||
    !openTrophiesButton ||
    !trophyPanel ||
    !closeTrophiesButton
  ) {
    return;
  }

  userMenuButton.addEventListener("click", (event) => {
    event.stopPropagation();
    userDropdown.hidden = !userDropdown.hidden;
  });

  openProfileButton.addEventListener("click", () => {
    profilePanel.hidden = false;
    closeDropdown();
    if (currentProfile) {
      populateProfilePanel(currentProfile);
    }
  });

  closeProfileButton.addEventListener("click", () => {
    profilePanel.hidden = true;
  });

  openTrophiesButton.addEventListener("click", () => {
    trophyPanel.hidden = false;
    if (currentProfile) {
      populateTrophyPanel(currentProfile);
    }
  });

  closeTrophiesButton.addEventListener("click", () => {
    trophyPanel.hidden = true;
  });

  if (isDevOwner && openDevModeButton && devPanel && closeDevModeButton) {
    openDevModeButton.hidden = false;
    openDevModeButton.addEventListener("click", async () => {
      devPanel.hidden = false;
      isDevModeActive = true;
      if (devLootControls) devLootControls.hidden = false;
      closeDropdown();
      try {
        await loadDevConfig();
        renderChanceTable(selectedChanceAction);
        buildRewardOptions(devTriggerDigSelect, "dig");
        buildRewardOptions(devTriggerFishSelect, "fish");
        buildRewardOptions(devTriggerHuntSelect, "hunt");
      } catch (_err) {
        setStatus("Could not load dev mode config.", "tone-error");
      }
    });

    closeDevModeButton.addEventListener("click", () => {
      devPanel.hidden = true;
      isDevModeActive = false;
      if (devLootControls) devLootControls.hidden = true;
      renderChanceTable(selectedChanceAction);
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
      devTriggerDigButton.addEventListener("click", () =>
        playAnimation("dig", devTriggerDigSelect?.value || "")
      );
    }
    if (devTriggerFishButton) {
      devTriggerFishButton.addEventListener("click", () =>
        playAnimation("fish", devTriggerFishSelect?.value || "")
      );
    }
    if (devTriggerHuntButton) {
      devTriggerHuntButton.addEventListener("click", () =>
        playAnimation("hunt", devTriggerHuntSelect?.value || "")
      );
    }
    if (devResetConfigButton) {
      devResetConfigButton.addEventListener("click", resetDevConfig);
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
  setMode("actions");
  startCooldownTicker();
  startProfileSync();
  await loadProfile();
  setStatus("Choose Dig, Fish, or Hunt.");
}

init().catch((err) => {
  actionButtons.forEach((button) => {
    button.disabled = true;
  });
  setStatus(err.message || "Failed to initialize play screen.", "tone-error");
});
