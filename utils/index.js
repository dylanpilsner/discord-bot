import fs from "fs/promises";
import {
  disconnectMember,
  getMember,
  muteMember,
  timeOutMember,
} from "../botActions.js";
import { isEqual, format } from "date-fns";
import { rollDice } from "../dice.js";
import { callAI } from "../ai.js";
import { createOrUpdateUsers, getMembers } from "../controllers/users.js";

export async function iaReplies(
  action,
  difficulty,
  diceNumber,
  result,
  interaction,
) {
  await interaction.editReply(
    `🎲 #Tirada de D20
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      🗡️ **Acción:** ${action}
      ⚖️ **Dificultad:** ${difficulty}
      🎲 **Dado:** ${diceNumber}

      ✨ **Resultado**

      ${result}`,
  );
}

export async function executeAction(grantedAction, interaction, victim) {
  if (
    (grantedAction === "kick" ||
      grantedAction === "kickSelf" ||
      grantedAction === "mute" ||
      grantedAction === "muteSelf") &&
    !victim.voice.channel
  ) {
    await interaction.editReply("❌ El usuario no está en un canal de voz");
    return { error: 400 };
  }

  if (!victim) return false;

  if (grantedAction === "kick" || grantedAction === "kickSelf") {
    await disconnectMember(victim);
  }
  if (grantedAction === "mute" || grantedAction === "muteSelf") {
    await muteMember(victim);
  }
  if (grantedAction === "timeout" || grantedAction === "timeoutSelf") {
    await timeOutMember(interaction, victim);
  }

  return 200;
}

export async function getMembersCommand(interaction) {
  const members = await interaction.guild.members.fetch();

  const mappedMembers = members.map((member) => {
    return {
      id: member.id,
      name: member.user.username,
      date: format(new Date(), "dd-MM-yyyy"),
      attemptsAtDate: 0,
      dFour: false,
      victim: null,
    };
  });

  for (let index = 0; index < mappedMembers.length; index++) {
    const element = mappedMembers[index];

    await createOrUpdateUsers(element);
  }

  return interaction.reply("Base de datos actualizada");
}

// ------------

function isSelf(action) {
  if (
    action === "kickSelf" ||
    action === "muteSelf" ||
    action === "timeoutSelf"
  ) {
    return true;
  }
  return false;
}

export async function rolCommand(interaction) {
  const userId = interaction.user.id;
  const members = await getMembers();
  const member = members.find((i) => i.id === userId);
  let victim = await getMember(interaction);
  const today = format(new Date(), "dd-MM-yyyy");
  const didDayChanged = isEqual(today, member.date);

  if (!victim) return;

  if (!didDayChanged) {
    member.attemptsAtDate = 0;
  }

  if (member.attemptsAtDate >= 5) {
    interaction.reply("Ya no tenés más roleos por hoy campeón");
    return;
  }

  const diceNumber = rollDice();

  await interaction.deferReply();

  const action = interaction.options.getString("accion");
  const response = await callAI(`${action}. Saqué un ${diceNumber}`);
  const grantedAction = response.grantedAction;

  const self = isSelf(grantedAction);
  const realVictim = self ? userId : victim.id;
  victim = await interaction.guild.members.cache.get(realVictim);

  const actionResponse = await executeAction(
    grantedAction,
    interaction,
    victim,
  );

  if (actionResponse === 200) {
    await iaReplies(
      action,
      response.difficulty,
      diceNumber,
      response.result,
      interaction,
    );
  }
  member.attemptsAtDate++;
  createOrUpdateUsers(member);
}
