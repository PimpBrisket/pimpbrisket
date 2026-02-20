const loginButton = document.getElementById("discord-login");
const result = document.getElementById("result");

let apiBaseUrl = "https://pimpbrisket.onrender.com";
const appBasePath = window.location.pathname.replace(/\/(?:index\.html)?$/, "");

function showResult(message) {
  if (!result) return;
  result.textContent = message;
}

function setLoginHref() {
  if (!loginButton) return;
  loginButton.href = `${apiBaseUrl}/auth/discord/login`;
}

function isLikelyDiscordId(value) {
  return typeof value === "string" && /^\d{17,20}$/.test(value);
}

async function readJsonSafely(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (_err) {
    return {};
  }
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
    // Keep local default.
  } finally {
    clearTimeout(timeoutId);
  }
}

function handleAuthError() {
  const params = new URLSearchParams(window.location.search);
  const auth = params.get("auth");
  if (auth !== "error") return;
  const reason = params.get("reason") || "Discord login failed.";
  showResult(reason);
}

async function canAutoLoginWithRememberedDevice() {
  const rememberedId = localStorage.getItem("discordUserId");
  if (!isLikelyDiscordId(rememberedId)) return false;

  showResult("Checking remembered device...");
  try {
    const response = await fetch(`${apiBaseUrl}/players/${rememberedId}`);
    if (!response.ok) {
      localStorage.removeItem("discordUserId");
      return false;
    }
    return true;
  } catch (_err) {
    return false;
  }
}

function bindLoginButton() {
  if (!loginButton) return;
  loginButton.addEventListener("click", async (event) => {
    event.preventDefault();
    const canSkipDiscordLogin = await canAutoLoginWithRememberedDevice();
    if (canSkipDiscordLogin) {
      showResult("Welcome back. Opening your account...");
      window.location.href = `${appBasePath}/play`;
      return;
    }
    showResult("Redirecting to Discord sign in...");
    window.location.href = loginButton.href;
  });
}

async function init() {
  setLoginHref();
  if (!window.location.hostname.includes("github.io")) {
    await loadConfig();
    setLoginHref();
  }
  handleAuthError();
  bindLoginButton();
}

init().catch(() => {
  showResult("Could not initialize login.");
});
