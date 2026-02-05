import {} from "discord.js";

export function getVictim(interaction, isSelf) {
  const arg = interaction.options.getString("accion");
  const userId = arg.split("<")[1]?.split(">")[0]?.replace("@", "");
  if (!userId) {
    return false;
  }

  const member = interaction.guild.members.cache.get(userId);
  const me = interaction.user.id;

  if (isSelf) return me;

  return member;
}

export async function disconnectMember(victim) {
  if (!victim) return;

  if (!victim.voice.channel) {
    return;
  }

  await victim.voice.disconnect();
}

export async function muteMember(victim) {
  if (!victim) return;
  const isMemberMuted = victim.voice.serverMute;

  if (!victim.voice.channel) {
    return;
  }

  await victim.voice.setMute(!isMemberMuted);
}

export async function timeOutMember(interaction, victim) {
  if (!victim) return;

  try {
    await victim.timeout(20000);
  } catch (err) {
    const errorBody = err.rawError;
    const errorCode = errorBody.code;
    const errorMessage = errorBody.message;
    console.log(errorMessage);
    if (errorCode === 50013) {
      console.log("[DEBUG ACK]", {
        command: interaction.commandName,
        replied: interaction.replied,
        deferred: interaction.deferred,
        location: "timeoutError",
      });

      await interaction.editReply(
        "El bot no tiene permiso para ejecutar esta acción a la persona solicitada",
      );
    }
  }
}

export async function exileMember() {}
