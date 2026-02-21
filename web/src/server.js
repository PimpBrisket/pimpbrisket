require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT) || 5173;
const HOST = process.env.HOST || "0.0.0.0";
const API_BASE_URL = process.env.API_BASE_URL || "";

const publicDir = path.join(__dirname, "..", "public");

app.disable("x-powered-by");

app.use(
  express.static(publicDir, {
    etag: true,
    maxAge: "5m",
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-store");
        return;
      }
      if (/\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?)$/i.test(filePath)) {
        res.setHeader("Cache-Control", "public, max-age=86400");
        return;
      }
      if (/\.(?:js|css)$/i.test(filePath)) {
        res.setHeader("Cache-Control", "public, max-age=300");
      }
    }
  })
);

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

const server = app.listen(PORT, HOST, () => {
  console.log(`Web running on http://${HOST}:${PORT}`);
});

server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    console.error(
      `Startup failed: ${HOST}:${PORT} is already in use. Stop the existing process or change PORT in web/.env.`
    );
  } else {
    console.error("Web listen failed:", err);
  }
  process.exit(1);
});
