import { getMembers } from "./controllers/users.js";

export function getVictim(interaction, isSelf) {
  const arg = interaction.options.getString("accion");
  const userId = arg.split("<")[1]?.split(">")[0]?.replace("@", "");
  const myId = interaction.user.id;
  if (!userId) {
    return false;
  }

  const member = interaction.guild.members.cache.get(userId);
  const me = interaction.guild.members.cache.get(myId);

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
      return {
        error:
          "El bot no tiene permiso para ejecutar esta acción a la persona solicitada",
        code: "50013",
      };
    }
  }
}

export async function exileMember() {}

export async function nukeChannel(interaction) {
  const channel = interaction.member.voice.channel;
  const executorId = interaction.user.id;

  const membersInVoice = channel.members.filter(
    (member) => member.id !== executorId,
  );

  if (membersInVoice.size < 1) {
    return { message: "No hay personas en el canal para nukear.", error: 400 };
  }

  await Promise.all(membersInVoice.map((member) => member.voice.disconnect()));
}
