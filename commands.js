import "dotenv/config";
import { REST, Routes } from "discord.js";

const commands = [
  {
    name: "rolear",
    description: "Rolea una acción",
    options: [
      {
        name: "accion",
        description: "Qué querés hacer?",
        type: 3,
        required: true,
      },
    ],
  },
  {
    name: "refreshmembers",
    description: "Actualizar base de datos",
  },
  {
    name: "intentos",
    description: "Ver cuántos intentos te quedan",
  },
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("⏳ Registrando comandos...");
    await rest.put(Routes.applicationCommands(process.env.APPLICATION_ID), {
      body: commands,
    });
    console.log("✅ Comandos registrados");
  } catch (error) {
    console.error(error);
  }
})();
