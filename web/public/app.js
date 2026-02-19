const loginButton = document.getElementById("discord-login");
const result = document.getElementById("result");

let apiBaseUrl = `${window.location.protocol}//${window.location.hostname}:3000`;

function showResult(message) {
  result.textContent = message;
}

function setLoginHref() {
  loginButton.href = `${apiBaseUrl}/auth/discord/login`;
}

async function loadConfig() {
  try {
    const response = await fetch("/config");
    if (!response.ok) return;
    const config = await response.json();
    if (config.apiBaseUrl) apiBaseUrl = config.apiBaseUrl;
  } catch (_err) {
    // Keep local default.
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
  await loadConfig();
  setLoginHref();
  handleAuthError();
}

init();
