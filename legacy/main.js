require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DB_FILE = process.env.DB_FILE || "./database.sqlite";

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error("Failed to open database:", err.message);
    process.exit(1);
  }
});

db.run(
  `CREATE TABLE IF NOT EXISTS Player (
    discordUserId TEXT PRIMARY KEY,
    money INTEGER NOT NULL DEFAULT 0
  )`,
  (err) => {
    if (err) {
      console.error("Failed to create Player table:", err.message);
      process.exit(1);
    }
  }
);

function getPlayer(discordUserId) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT discordUserId, money FROM Player WHERE discordUserId = ?",
      [discordUserId],
      (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      }
    );
  });
}

function runSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/players/:discordUserId", async (req, res) => {
  try {
    const player = await getPlayer(req.params.discordUserId);
    if (!player) return res.status(404).json({ error: "Player not found" });
    return res.json(player);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.patch("/players/:discordUserId/money", async (req, res) => {
  try {
    const { amount } = req.body;
    if (!Number.isInteger(amount)) {
      return res.status(400).json({ error: "amount must be an integer" });
    }

    const discordUserId = req.params.discordUserId;
    await runSql(
      `INSERT INTO Player (discordUserId, money)
       VALUES (?, 0)
       ON CONFLICT(discordUserId) DO NOTHING`,
      [discordUserId]
    );
    await runSql(
      "UPDATE Player SET money = money + ? WHERE discordUserId = ?",
      [amount, discordUserId]
    );

    const updated = await getPlayer(discordUserId);
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
