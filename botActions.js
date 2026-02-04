import {} from "discord.js";

export function getMember(interaction, isSelf) {
  const arg = interaction.options.getString("accion");
  const userId = arg.split("<")[1].split(">")[0].replace("@", "");
  const member = interaction.guild.members.cache.get(userId);
  const me = interaction.user.id;

  if (isSelf) return me;

  return member;
}

export async function disconnectMember(interaction) {
  const member = getMember(interaction);

  if (!member.voice.channel) {
    return;
  }

  await member.voice.disconnect();
}

export async function muteMember(interaction) {
  const member = getMember(interaction);
  const isMemberMuted = member.voice.serverMute;

  if (!member.voice.channel) {
    return;
  }

  await member.voice.setMute(!isMemberMuted);
}

export async function timeOutMember(interaction) {
  const member = getMember(interaction);

  try {
    await member.timeout(20000);
  } catch (err) {
    const errorBody = err.rawError;
    const errorCode = errorBody.code;
    const errorMessage = errorBody.message;
    console.log(errorMessage);
    if (errorCode === 50013) {
      await interaction.editReply(
        "El bot no tiene permiso para ejecutar esta acción a la persona solicitada",
      );
    }
  }
}

export async function exileMember() {}
