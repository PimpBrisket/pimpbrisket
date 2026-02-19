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

let apiBaseUrl = `${window.location.protocol}//${window.location.hostname}:3000`;
let discordUserId = "";
let actionMeta = FALLBACK_META;
let cooldownTimer = null;
let profileSyncTimer = null;
let currentProfile = null;
const appBasePath = window.location.pathname.replace(/\/(?:play(?:\.html)?|index\.html)?$/, "");

function resolveAssetUrl(url) {
  if (typeof url !== "string") return url;
  if (url.startsWith("/assets/")) return `${appBasePath}${url}`;
  return url;
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

function renderChanceTable(action) {
  const config = actionMeta.actions[action];
  if (!config) return;

  chanceTitleEl.textContent = `${action.toUpperCase()} Chances`;
  chanceXpEl.textContent = `XP: ${config.xpMin}-${config.xpMax}`;

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
  try {
    const response = await fetch("/config");
    if (!response.ok) return;
    const config = await response.json();
    if (config.apiBaseUrl) apiBaseUrl = config.apiBaseUrl;
  } catch (_err) {
    // Keep default API base URL.
  }
}

async function loadActionMeta() {
  try {
    const response = await fetch(`${apiBaseUrl}/meta/actions`);
    if (!response.ok) return;
    const payload = await response.json();
    if (payload && payload.actions) actionMeta = payload;
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

async function playAnimation(action) {
  const target = animByAction[action];
  if (!target) return;
  Object.values(animByAction).forEach((node) => {
    node.hidden = true;
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
      `${action.toUpperCase()} is cooling down (${formatSeconds(cooldownRemaining)}s).`,
      "tone-error"
    );
    return;
  }

  actionButtons.forEach((button) => {
    button.disabled = true;
  });
  setStatus(`${action.toUpperCase()} action started...`);

  try {
    const [apiResponse] = await Promise.all([
      fetch(`${apiBaseUrl}/players/${discordUserId}/actions/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      }),
      playAnimation(action)
    ]);

    const payload = await apiResponse.json();
    if (apiResponse.status === 429) {
      const remaining = Number(payload.cooldownRemainingMs || 0);
      cooldownUntilByAction[action] = Number(payload.cooldownUntil || 0);
      if (payload.player) {
        setWallet(payload.player.money);
        setLevelBar(payload.player);
      }
      setStatus(
        `${action.toUpperCase()} cooldown: ${formatSeconds(remaining)}s.`,
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
        `You earned $${payload.reward} and ${xpGain} XP from ${action.toUpperCase()}.${
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
  await loadActionMeta();
  renderChanceTable("dig");

  discordUserId = resolveUserId();
  if (!discordUserId) {
    setStatus("Login required. Return to home and sign in with Discord.", "tone-error");
    actionButtons.forEach((button) => {
      button.disabled = true;
    });
    return;
  }

  bindActions();
  bindUserMenu();
  startCooldownTicker();
  startProfileSync();
  await loadProfile();
  setStatus("Choose Dig, Fish, or Hunt.");
}

init();
