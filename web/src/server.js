require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT) || 5173;
const HOST = process.env.HOST || "0.0.0.0";
const API_BASE_URL = process.env.API_BASE_URL || "";

const publicDir = path.join(__dirname, "..", "public");

app.use(express.static(publicDir));

function normalizeHostForUrl(hostname) {
  if (hostname.includes(":") && !hostname.startsWith("[")) {
    return `[${hostname}]`;
  }
  return hostname;
}

app.get("/config", (req, res) => {
  const fallbackApiBaseUrl = `${req.protocol}://${normalizeHostForUrl(req.hostname)}:3000`;
  res.json({ apiBaseUrl: API_BASE_URL || fallbackApiBaseUrl });
});

app.get("/play", (_req, res) => {
  res.sendFile(path.join(publicDir, "play.html"));
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(PORT, HOST, () => {
  console.log(`Web running on http://${HOST}:${PORT}`);
});
