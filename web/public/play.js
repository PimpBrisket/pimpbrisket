const statusEl = document.getElementById("status");
const walletEl = document.getElementById("wallet-amount");
const levelValueEl = document.getElementById("level-value");
const xpTextEl = document.getElementById("xp-text");
const xpFillEl = document.getElementById("xp-fill");
const levelRewardEl = document.getElementById("level-reward");
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

const actionButtons = Array.from(document.querySelectorAll(".action-card"));
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

function resolveAssetUrl(url) {
  if (typeof url !== "string") return url;
  if (url.startsWith("/assets/")) return `${appBasePath}${url}`;
  return url;
}

function formatActionLabel(action) {
  if (!action) return "";
  return action.charAt(0).toUpperCase() + action.slice(1).toLowerCase();
}

function setDigAnimationVariant(bonusLabel) {
  if (!digAnimationImageEl) return;
  const assetName = bonusLabel === "Gold Coin" ? "DugDugCoin.png" : "DugDug.png";
  digAnimationImageEl.src = `./assets/${assetName}?v=4`;
}

function setStatus(message, tone = "") {
  statusEl.textContent = message;
  statusEl.className = tone ? tone : "";
}

function setWallet(value) {
  walletEl.textContent = `$${value}`;
}

function setLevelBar(profile) {
  const level = Number(profile.level || 1);
  const xp = Number(profile.xp || 0);
  const xpToNext = Number(profile.xpToNextLevel || 0);
  const maxLevel = Number(profile.maxLevel || 100);
  const nextReward = Number(profile.nextLevelRewardCoins || 0);

  levelValueEl.textContent = `${level}`;
  levelRewardEl.textContent = `${nextReward}`;

  if (level >= maxLevel || xpToNext <= 0) {
    xpTextEl.textContent = "MAX LEVEL";
    xpFillEl.style.width = "100%";
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

  const xpText =
    Number(profile.level) >= Number(profile.maxLevel)
      ? "MAX"
      : `${profile.xp}/${profile.xpToNextLevel}`;

  profileNameEl.textContent = profile.discordUsername || "Player Profile";
  profileIdEl.textContent = `Discord ID: ${profile.discordUserId}`;
  profileWalletEl.textContent = `$${profile.money}`;
  profileLevelEl.textContent = `${profile.level}`;
  profileXpEl.textContent = xpText;
  profileCommandsEl.textContent = `${profile.totalCommandsUsed || 0}`;
  profileEarnedEl.textContent = `$${profile.totalMoneyEarned || 0}`;
  profileTrophiesEl.textContent = `${profile.totalTrophies || 0}`;
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
    const response = await fetch(`${apiBaseUrl}/dev/${discordUserId}/config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config: { actions: actionMeta.actions } })
    });
    if (!response.ok) {
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

    leftCell.textContent = `${tier.label} `;
    leftCell.appendChild(minInput);
    leftCell.appendChild(document.createTextNode(" - "));
    leftCell.appendChild(maxInput);
    rightCell.appendChild(chanceInput);
    tr.appendChild(leftCell);
    tr.appendChild(rightCell);
    chanceWinningsEl.appendChild(tr);
  });

  config.bonusTiers.forEach((tier) => {
    const tr = document.createElement("tr");
    const leftCell = document.createElement("td");
    const rightCell = document.createElement("td");

    leftCell.textContent = tier.label;
    if (tier.coins > 0) {
      const coinsInput = document.createElement("input");
      coinsInput.type = "number";
      coinsInput.className = "chance-input";
      coinsInput.value = String(tier.coins);
      coinsInput.addEventListener("change", () => {
        tier.coins = Math.max(0, Number(coinsInput.value || 0));
        queueDevConfigSave();
      });
      leftCell.appendChild(document.createTextNode(" +$"));
      leftCell.appendChild(coinsInput);
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
    rightCell.appendChild(chanceInput);

    tr.appendChild(leftCell);
    tr.appendChild(rightCell);
    chanceBonusEl.appendChild(tr);
  });
}

function renderChanceTable(action) {
  const config = actionMeta.actions[action];
  if (!config) return;

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
    const config = await response.json();
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
        const payload = await response.json();
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
    const fallbackPayload = await fallbackResponse.json();
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
  if (!response.ok) throw new Error("Could not load profile");

  const profile = await response.json();
  currentProfile = profile;
  setWallet(profile.money);
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
  if (!response.ok) throw new Error("Could not load dev config");
  const payload = await response.json();
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
    setStatus("Could not reset dev config.", "tone-error");
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
    setStatus("Could not set level.", "tone-error");
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
    const payload = await apiResponse.json();
    if (apiResponse.status === 429) {
      const remaining = Number(payload.cooldownRemainingMs || 0);
      cooldownUntilByAction[action] = Number(payload.cooldownUntil || 0);
      if (payload.player) {
        setWallet(payload.player.money);
        setLevelBar(payload.player);
      }
      setStatus(
        `${formatActionLabel(action)} cooldown: ${formatSeconds(remaining)}s.`,
        "tone-error"
      );
      updateButtonsByCooldown();
      return;
    }

    if (!apiResponse.ok) {
      setStatus(payload.error || "Action failed.", "tone-error");
      updateButtonsByCooldown();
      return;
    }

    await playAnimation(action, payload.rewardBreakdown?.bonusLabel || "");

    setWallet(payload.player.money);
    setLevelBar(payload.player);
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
  } catch (_err) {
    setStatus("Could not reach API.", "tone-error");
    updateButtonsByCooldown();
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
  bindUserMenu();
  startCooldownTicker();
  startProfileSync();
  await loadProfile();
  setStatus("Choose Dig, Fish, or Hunt.");
}

init();
