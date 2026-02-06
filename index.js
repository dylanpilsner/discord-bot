import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";
import { refreshMembers, rolCommand, triesCommand } from "./utils/index.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once("clientReady", () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "refreshmembers") {
    await refreshMembers(interaction);
  }

  if (interaction.commandName === "rolear") {
    rolCommand(interaction);
  }
  if (interaction.commandName === "intentos") {
    triesCommand(interaction);
  }
});

client.login(process.env.DISCORD_TOKEN);
