const loginButton = document.getElementById("discord-login");
const result = document.getElementById("result");

let apiBaseUrl = "https://pimpbrisket.onrender.com";

function showResult(message) {
  result.textContent = message;
}

function setLoginHref() {
  loginButton.href = `${apiBaseUrl}/auth/discord/login`;
}

async function loadConfig() {
  if (window.location.hostname.endsWith("github.io")) return;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1500);
  try {
    const response = await fetch("/config", { signal: controller.signal });
    if (!response.ok) return;
    const config = await response.json();
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

async function init() {
  setLoginHref();
  await loadConfig();
  setLoginHref();
  handleAuthError();
}

init();
