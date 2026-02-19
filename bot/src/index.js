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

async function registerCommands() {
  const commands = [
    new SlashCommandBuilder().setName("start").setDescription("Create your player account").toJSON(),
    new SlashCommandBuilder().setName("profile").setDescription("Show your player profile").toJSON(),
    new SlashCommandBuilder().setName("wallet").setDescription("Show your current wallet balance").toJSON(),
    new SlashCommandBuilder().setName("dig").setDescription("Play the digging action minigame").toJSON(),
    new SlashCommandBuilder().setName("fish").setDescription("Play the fishing action minigame").toJSON(),
    new SlashCommandBuilder().setName("hunt").setDescription("Play the hunting action minigame").toJSON()
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
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || `API request failed: ${response.status}`);
  }
  return payload;
}

async function fetchProfile(discordUserId) {
  const response = await fetch(`${API_BASE_URL}/players/${discordUserId}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  return response.json();
}

async function runAction(discordUserId, action) {
  const response = await fetch(`${API_BASE_URL}/players/${discordUserId}/actions/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  const payload = await response.json();
  if (response.status === 429) return { ok: false, cooldown: true, payload };
  if (!response.ok) throw new Error(payload.error || `API request failed: ${response.status}`);
  return { ok: true, payload };
}

function profileEmbed(userName, profile) {
  const xpLine =
    Number(profile.level) >= Number(profile.maxLevel)
      ? "MAX"
      : `${profile.xp}/${profile.xpToNextLevel}`;

  const digCount = Number(profile.trophyCollection?.dig?.count || 0);
  const fishCount = Number(profile.trophyCollection?.fish?.count || 0);
  const huntCount = Number(profile.trophyCollection?.hunt?.count || 0);

  return new EmbedBuilder()
    .setTitle(`${userName}'s Profile`)
    .setColor(0x3ba55d)
    .addFields(
      { name: "Money", value: `$${profile.money}`, inline: true },
      { name: "Level", value: `${profile.level}`, inline: true },
      { name: "XP", value: xpLine, inline: true },
      { name: "Total Earned", value: `$${profile.totalMoneyEarned}`, inline: true },
      { name: "Commands Used", value: `${profile.totalCommandsUsed}`, inline: true },
      { name: "Trophies", value: `${profile.totalTrophies || 0}`, inline: true },
      { name: "Collectors Greed", value: `x${digCount}`, inline: true },
      { name: "Midnight Ocean", value: `x${fishCount}`, inline: true },
      { name: "Many Heads", value: `x${huntCount}`, inline: true },
      { name: "Joined", value: formatDate(profile.createdAt), inline: true },
      { name: "Updated", value: formatDate(profile.updatedAt), inline: true }
    )
    .setFooter({ text: `Discord ID: ${profile.discordUserId}` });
}

async function handleStart(interaction) {
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
  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleProfile(interaction) {
  const profile = await fetchProfile(interaction.user.id);
  if (!profile) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Profile Not Found")
          .setColor(0xffa500)
          .setDescription("Run `/start` or log in on the website first.")
      ],
      ephemeral: true
    });
    return;
  }
  await interaction.reply({ embeds: [profileEmbed(interaction.user.username, profile)] });
}

async function handleWallet(interaction) {
  const profile = await fetchProfile(interaction.user.id);
  if (!profile) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Wallet Not Found")
          .setColor(0xffa500)
          .setDescription("Run `/start` first.")
      ],
      ephemeral: true
    });
    return;
  }
  await interaction.reply({
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
    ephemeral: true
  });
}

async function handleActionGame(interaction, actionKey) {
  const action = ACTIONS[actionKey];
  await registerAccount(interaction.user);

  const requiredClicks = Math.floor(Math.random() * 3) + 2;
  const customId = `act_${actionKey}_${interaction.id}`;
  let clicks = 0;

  const button = new ButtonBuilder()
    .setCustomId(customId)
    .setStyle(ButtonStyle.Primary)
    .setLabel(`Tap ${requiredClicks}x`);
  const row = new ActionRowBuilder().addComponents(button);

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle(action.title)
        .setColor(0x5865f2)
        .setDescription(`Click the button ${requiredClicks} times in 10 seconds.`)
        .addFields({ name: "Progress", value: `0/${requiredClicks}` })
    ],
    components: [row],
    fetchReply: true
  });

  const reply = await interaction.fetchReply();
  const collector = reply.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 10000,
    filter: (i) => i.customId === customId
  });

  const completed = await new Promise((resolve) => {
    collector.on("collect", async (buttonInteraction) => {
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
    });

    collector.on("end", (_c, reason) => resolve(reason === "completed"));
  });

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

  const result = await runAction(interaction.user.id, actionKey);
  if (!result.ok && result.cooldown) {
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`${action.label} Cooldown`)
          .setColor(0xffa500)
          .setDescription(
            `Cooldown active: ${formatSeconds(result.payload.cooldownRemainingMs)}s remaining.`
          )
          .addFields({
            name: "Wallet",
            value: `$${result.payload.player?.money ?? 0}`,
            inline: true
          })
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
        .setDescription(
          `You earned $${result.payload.reward}. Gained ${xpGained} XP.${levelUpText}\nCooldown: ${formatSeconds(
            result.payload.cooldownMs
          )}s.`
        )
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
        );
      })()
    ],
    components: []
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
    if (interaction.commandName === "start") return handleStart(interaction);
    if (interaction.commandName === "profile") return handleProfile(interaction);
    if (interaction.commandName === "wallet") return handleWallet(interaction);
    if (interaction.commandName === "dig") return handleActionGame(interaction, "dig");
    if (interaction.commandName === "fish") return handleActionGame(interaction, "fish");
    if (interaction.commandName === "hunt") return handleActionGame(interaction, "hunt");
  } catch (err) {
    const message = err && err.message ? err.message : "Could not complete request.";
    const errorEmbed = new EmbedBuilder()
      .setTitle("Command Error")
      .setColor(0xed4245)
      .setDescription(message.slice(0, 300));

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
      return;
    }
    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }
});

client.login(DISCORD_TOKEN);
