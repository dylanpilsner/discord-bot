import "dotenv/config";
// const { Client, GatewayIntentBits, Events } = require("discord.js");
import { Client, GatewayIntentBits } from "discord.js";
import { callAI } from "./ai.js";
import { rollDice } from "./dice.js";
import { disconnectMember, muteMember, timeOutMember } from "./botActions.js";
import fs from "fs";
import { getMembersCommand, rolCommand } from "./utils/index.js";

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
    await getMembersCommand(interaction);
  }

  if (interaction.commandName === "rolear") {
    rolCommand(interaction);
  }
});

client.login(process.env.DISCORD_TOKEN);
