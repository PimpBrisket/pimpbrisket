const path = require("path");
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  ComponentType,
  EmbedBuilder,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder
} = require("discord.js");

const ENV_PATH = path.join(__dirname, "..", ".env");
require("dotenv").config({ path: ENV_PATH });

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";
const WEB_PLAY_URL = process.env.WEB_PLAY_URL || "";
const TROPHY_EMOJIS = {
  null: "<:null:1413005824745279558>",
  dig: "<:CollectorsGreed:1474080690692686091>",
  fish: "<:MidnightOcean:1474080767851233443>",
  hunt: "<:ManyHeads:1474080855617179679>"
};

const ACTIONS = {
  dig: {
    label: "Dig",
    title: "Go Digging!"
  },
  fish: {
    label: "Fish",
    title: "Go Fishing!"
  },
  hunt: {
    label: "Hunt",
    title: "Go Hunting!"
  }
};

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
  console.error(`Missing DISCORD_TOKEN or DISCORD_CLIENT_ID in ${ENV_PATH}`);
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function formatSeconds(ms) {
  return Math.max(1, Math.ceil(ms / 1000));
}

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
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

async function registerCommands() {
  const commands = [
    new SlashCommandBuilder().setName("start").setDescription("Create your player account").toJSON(),
    new SlashCommandBuilder().setName("profile").setDescription("Show your player profile").toJSON(),
    new SlashCommandBuilder().setName("wallet").setDescription("Show your current wallet balance").toJSON(),
    new SlashCommandBuilder()
      .setName("play")
      .setDescription("Get the website link to log in and play")
      .toJSON(),
    new SlashCommandBuilder().setName("dig").setDescription("Play the digging action minigame").toJSON(),
    new SlashCommandBuilder().setName("fish").setDescription("Play the fishing action minigame").toJSON(),
    new SlashCommandBuilder().setName("hunt").setDescription("Play the hunting action minigame").toJSON(),
    new SlashCommandBuilder()
      .setName("loottable")
      .setDescription("Show current loot probabilities for an action")
      .addStringOption((option) =>
        option
          .setName("action")
          .setDescription("Action type")
          .setRequired(true)
          .addChoices(
            { name: "Dig", value: "dig" },
            { name: "Fish", value: "fish" },
            { name: "Hunt", value: "hunt" }
          )
      )
      .toJSON()
  ];

  const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);
  if (DISCORD_GUILD_ID) {
    await rest.put(
      Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID),
      { body: commands }
    );
    console.log(`Registered commands in guild ${DISCORD_GUILD_ID}`);
    return;
  }

  await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body: commands });
  console.log("Registered commands globally");
}

async function registerAccount(user) {
  const discordUserId = user.id;
  const response = await fetch(`${API_BASE_URL}/players/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      discordUserId,
      discordUsername: user.username,
      discordAvatarHash: user.avatar || null
    })
  });
  const payload = await readJsonSafely(response);
  if (!response.ok) {
    throw new Error(payload.error || `API request failed: ${response.status}`);
  }
  return payload;
}

async function fetchProfile(discordUserId) {
  const response = await fetch(`${API_BASE_URL}/players/${discordUserId}`);
  if (response.status === 404) return null;
  const payload = await readJsonSafely(response);
  if (!response.ok) throw new Error(payload.error || `API request failed: ${response.status}`);
  return payload;
}

async function runAction(discordUserId, action, actionToken) {
  const response = await fetch(`${API_BASE_URL}/players/${discordUserId}/actions/${action}/bot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ actionToken })
  });
  const payload = await readJsonSafely(response);
  if (response.status === 429) return { ok: false, cooldown: true, payload };
  if (response.status === 409) return { ok: false, invalidToken: true, payload };
  if (!response.ok) throw new Error(payload.error || `API request failed: ${response.status}`);
  return { ok: true, payload };
}

async function lockAction(discordUserId, action) {
  const response = await fetch(`${API_BASE_URL}/players/${discordUserId}/actions/${action}/lock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  const payload = await readJsonSafely(response);
  if (response.status === 429) return { ok: false, cooldown: true, payload };
  if (!response.ok) throw new Error(payload.error || `API request failed: ${response.status}`);
  return { ok: true, payload };
}

async function fetchActionMeta() {
  const response = await fetch(`${API_BASE_URL}/meta/actions`);
  const payload = await readJsonSafely(response);
  if (!response.ok) throw new Error(payload.error || `API request failed: ${response.status}`);
  return payload;
}

async function fetchPublicMeta() {
  const response = await fetch(`${API_BASE_URL}/meta/public`);
  const payload = await readJsonSafely(response);
  if (!response.ok) throw new Error(payload.error || `API request failed: ${response.status}`);
  return payload;
}

function profileEmbed(userName, profile) {
  const lifetimeXp = Number(profile.totalXpEarned || 0);

  const digCount = Number(profile.trophyCollection?.dig?.count || 0);
  const fishCount = Number(profile.trophyCollection?.fish?.count || 0);
  const huntCount = Number(profile.trophyCollection?.hunt?.count || 0);
  const digEmoji = digCount > 0 ? TROPHY_EMOJIS.dig : TROPHY_EMOJIS.null;
  const fishEmoji = fishCount > 0 ? TROPHY_EMOJIS.fish : TROPHY_EMOJIS.null;
  const huntEmoji = huntCount > 0 ? TROPHY_EMOJIS.hunt : TROPHY_EMOJIS.null;

  return new EmbedBuilder()
    .setTitle(`${userName}'s Profile`)
    .setColor(0x3ba55d)
    .addFields(
      { name: "Money", value: `$${profile.money}`, inline: true },
      { name: "Level", value: `${profile.level}`, inline: true },
      { name: "Lifetime XP", value: `${lifetimeXp}`, inline: true },
      { name: "Total Earned", value: `$${profile.totalMoneyEarned}`, inline: true },
      { name: "Trophies", value: `${digEmoji} ${fishEmoji} ${huntEmoji}`, inline: true },
      { name: "Commands Used", value: `${profile.totalCommandsUsed}`, inline: true },
      { name: "Joined", value: formatDate(profile.createdAt), inline: true },
      { name: "Updated", value: formatDate(profile.updatedAt), inline: true }
    )
    .setFooter({ text: `Discord ID: ${profile.discordUserId}` });
}

async function handleStart(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const payload = await registerAccount(interaction.user);
  const actionText = payload.created ? "created" : "already exists";
  const embed = new EmbedBuilder()
    .setTitle("Account Ready")
    .setColor(0x5865f2)
    .setDescription(`Your account is ${actionText}.`)
    .addFields(
      { name: "Wallet", value: `$${payload.player.money}`, inline: true },
      { name: "Level", value: `${payload.player.level}`, inline: true },
      { name: "Created", value: formatDate(payload.player.createdAt), inline: true }
    );
  await interaction.editReply({ embeds: [embed] });
}

async function handleProfile(interaction) {
  await interaction.deferReply();
  const profile = await fetchProfile(interaction.user.id);
  if (!profile) {
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Profile Not Found")
          .setColor(0xffa500)
          .setDescription("Run `/start` or log in on the website first.")
      ],
      components: []
    });
    return;
  }
  await interaction.editReply({ embeds: [profileEmbed(interaction.user.username, profile)] });
}

async function handleWallet(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const profile = await fetchProfile(interaction.user.id);
  if (!profile) {
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Wallet Not Found")
          .setColor(0xffa500)
          .setDescription("Run `/start` first.")
      ],
      components: []
    });
    return;
  }
  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setTitle("Wallet")
        .setColor(0x22c55e)
        .setDescription(`Current balance: **$${profile.money}**`)
        .addFields(
          { name: "Level", value: `${profile.level}`, inline: true },
          {
            name: "XP",
            value:
              Number(profile.level) >= Number(profile.maxLevel)
                ? "MAX"
                : `${profile.xp}/${profile.xpToNextLevel}`,
            inline: true
          },
          {
            name: "Next Level Reward",
            value: `+$${profile.nextLevelRewardCoins}`,
            inline: true
          }
        )
    ],
  });
}

async function handlePlay(interaction) {
  await interaction.deferReply({ ephemeral: true });

  let playUrl = WEB_PLAY_URL;
  try {
    const meta = await fetchPublicMeta();
    if (typeof meta.webPlayUrl === "string" && meta.webPlayUrl) {
      playUrl = meta.webPlayUrl;
    }
  } catch (_err) {
    // Fall back to env URL if /meta/public is unavailable.
  }

  if (!playUrl) {
    throw new Error("Website URL is not configured yet.");
  }

  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setTitle("Play On Website")
        .setColor(0x5865f2)
        .setDescription(
          `Open: ${playUrl}\n\nSign in with Discord there, then your progress stays synced with bot commands.`
        )
    ]
  });
}

async function handleActionGame(interaction, actionKey) {
  const action = ACTIONS[actionKey];
  await interaction.deferReply();
  await registerAccount(interaction.user);
  const lockResult = await lockAction(interaction.user.id, actionKey);
  if (!lockResult.ok && lockResult.cooldown) {
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`${action.label} Cooldown`)
          .setColor(0xffa500)
          .setDescription(
            `Cooldown active: ${formatSeconds(lockResult.payload.cooldownRemainingMs)}s remaining.`
          )
          .addFields({
            name: "Wallet",
            value: `$${lockResult.payload.player?.money ?? 0}`,
            inline: true
          })
      ],
      components: []
    });
    return;
  }
  const actionToken = lockResult.payload?.actionToken;
  if (typeof actionToken !== "string" || !actionToken) {
    throw new Error("Could not start action lock token.");
  }

  const requiredClicks = Math.floor(Math.random() * 3) + 2;
  const customId = `act_${actionKey}_${interaction.id}`;
  let clicks = 0;

  const button = new ButtonBuilder()
    .setCustomId(customId)
    .setStyle(ButtonStyle.Primary)
    .setLabel(`Tap ${requiredClicks}x`);
  const row = new ActionRowBuilder().addComponents(button);

  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setTitle(action.title)
        .setColor(0x5865f2)
        .setDescription(`Click the button ${requiredClicks} times in 10 seconds.`)
        .addFields({ name: "Progress", value: `0/${requiredClicks}` })
    ],
    components: [row]
  });

  const reply = await interaction.fetchReply();
  const collector = reply.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 10000,
    filter: (i) => i.customId === customId
  });

  let collectorError = null;
  const completed = await new Promise((resolve) => {
    collector.on("collect", (buttonInteraction) => {
      void (async () => {
        if (buttonInteraction.user.id !== interaction.user.id) {
          await buttonInteraction.reply({
            content: "Only the command user can play this minigame.",
            ephemeral: true
          });
          return;
        }

        clicks += 1;
        if (clicks >= requiredClicks) {
          collector.stop("completed");
          await buttonInteraction.update({
            embeds: [
              new EmbedBuilder()
                .setTitle(action.title)
                .setColor(0x22c55e)
                .setDescription("Minigame complete. Applying reward...")
            ],
            components: []
          });
          return;
        }

        await buttonInteraction.update({
          embeds: [
            new EmbedBuilder()
              .setTitle(action.title)
              .setColor(0x5865f2)
              .setDescription(`Click the button ${requiredClicks} times in 10 seconds.`)
              .addFields({ name: "Progress", value: `${clicks}/${requiredClicks}` })
          ],
          components: [row]
        });
      })().catch((err) => {
        collectorError = err;
        collector.stop("error");
      });
    });

    collector.on("end", (_c, reason) => resolve(reason === "completed"));
  });

  if (collectorError) throw collectorError;

  if (!completed) {
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`${action.label} Failed`)
          .setColor(0xed4245)
          .setDescription("You ran out of time. Try again.")
      ],
      components: []
    });
    return;
  }

  const result = await runAction(interaction.user.id, actionKey, actionToken);
  if (!result.ok && result.cooldown) {
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`${action.label} Cooldown`)
          .setColor(0xffa500)
          .setDescription(
            `Cooldown active: ${formatSeconds(result.payload.cooldownRemainingMs || 0)}s remaining.`
          )
      ],
      components: []
    });
    return;
  }
  if (!result.ok && result.invalidToken) {
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`${action.label} Expired`)
          .setColor(0xed4245)
          .setDescription("Your action session expired. Run the command again.")
      ],
      components: []
    });
    return;
  }

  await interaction.editReply({
    embeds: [
      (() => {
        const xpGained = Number(result.payload.rewardBreakdown?.xpGained || 0);
        const levelUps = result.payload.rewardBreakdown?.levelUps || [];
        const levelUpText =
          levelUps.length > 0
            ? `\nLevel Up: ${levelUps.map((entry) => `Lv ${entry.level}`).join(", ")}`
            : "";

        return new EmbedBuilder()
        .setTitle(`${action.label} Success`)
        .setColor(0x22c55e)
        .setDescription(`$${result.payload.reward}+ | ${xpGained} XP+${levelUpText}`)
        .addFields(
          { name: "Wallet", value: `$${result.payload.player.money}`, inline: true },
          { name: "Level", value: `${result.payload.player.level}`, inline: true },
          {
            name: "XP",
            value:
              Number(result.payload.player.level) >= Number(result.payload.player.maxLevel)
                ? "MAX"
                : `${result.payload.player.xp}/${result.payload.player.xpToNextLevel}`,
            inline: true
          }
        )
        .setFooter({
          text: `Cooldown: ${formatSeconds(result.payload.cooldownMs)}s`
        });
      })()
    ],
    components: []
  });
}

async function handleLootTable(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const action = interaction.options.getString("action", true);
  const metadata = await fetchActionMeta();
  const actionConfig = metadata?.actions?.[action];
  if (!actionConfig) {
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Loot Table Error")
          .setColor(0xed4245)
          .setDescription("Could not load action metadata.")
      ],
      components: []
    });
    return;
  }

  const payoutLines = actionConfig.payoutTiers
    .map((tier) => `${tier.chancePct}% - $${tier.min} to $${tier.max} (${tier.label})`)
    .join("\n");
  const bonusLines = actionConfig.bonusTiers
    .map((tier) => {
      const rewardText = tier.coins > 0 ? `${tier.label} (+$${tier.coins})` : tier.label;
      return `${tier.chancePct}% - ${rewardText}`;
    })
    .join("\n");

  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setTitle(`${titleCase(action)} Loot Table`)
        .setColor(0x5865f2)
        .addFields(
          { name: "XP Range", value: `${actionConfig.xpMin}-${actionConfig.xpMax}`, inline: true },
          { name: "Coin Winnings", value: payoutLines || "None", inline: false },
          { name: "Bonus Rewards", value: bonusLines || "None", inline: false }
        )
        .setFooter({ text: "Bot commands yield 5% more cash." })
    ],
  });
}

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);
  try {
    await registerCommands();
  } catch (err) {
    console.error("Failed to register slash commands:", err.message);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  try {
    if (interaction.commandName === "start") return await handleStart(interaction);
    if (interaction.commandName === "profile") return await handleProfile(interaction);
    if (interaction.commandName === "wallet") return await handleWallet(interaction);
    if (interaction.commandName === "play") return await handlePlay(interaction);
    if (interaction.commandName === "dig") return await handleActionGame(interaction, "dig");
    if (interaction.commandName === "fish") return await handleActionGame(interaction, "fish");
    if (interaction.commandName === "hunt") return await handleActionGame(interaction, "hunt");
    if (interaction.commandName === "loottable") return await handleLootTable(interaction);
  } catch (err) {
    const message = err && err.message ? err.message : "Could not complete request.";
    const errorEmbed = new EmbedBuilder()
      .setTitle("Command Error")
      .setColor(0xed4245)
      .setDescription(message.slice(0, 300));

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
        return;
      }
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    } catch (responseErr) {
      console.error("Failed to send interaction error response:", responseErr);
    }
  }
});

client.on("error", (err) => {
  console.error("Discord client error:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

client.login(DISCORD_TOKEN);
