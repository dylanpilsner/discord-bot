import {
  disconnectMember,
  getVictim,
  muteMember,
  timeOutMember,
} from "../botActions.js";
import { isEqual, format } from "date-fns";
import { rollDice } from "../dice.js";
import { callAI } from "../ai.js";
import { createOrUpdateUsers, getUser } from "../controllers/users.js";

async function didDayChanged(date) {
  const today = format(new Date(), "yyyy-MM-dd");
  const didDayChanged = !isEqual(today, date);

  return didDayChanged;
}

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

export async function refreshMembers(interaction) {
  const members = await interaction.guild.members.fetch();

  const mappedMembers = members.map((member) => {
    return {
      id: member.id,
      name: member.user.username,
      date: format(new Date(), "yyyy-MM-dd"),
      dFour: false,
      victim: null,
    };
  });

  await interaction.deferReply();

  for (let index = 0; index < mappedMembers.length; index++) {
    const element = mappedMembers[index];

    await createOrUpdateUsers(element);
  }

  return interaction.editReply("Base de datos actualizada");
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
  try {
    const member = await getUser(userId);
    let victim = getVictim(interaction);
    const DayChanged = didDayChanged(member.date);

    if (!victim) return interaction.reply("Tenés que arrobar a alguien capo");

    if (DayChanged) {
      member.attemptsAtDate = 0;
      member.date = today;
    }

    if (member.attemptsAtDate >= 5) {
      return interaction.reply("Ya no tenés más roleos por hoy campeón");
    }

    const diceNumber = rollDice();

    const action = interaction.options.getString("accion");

    await interaction.deferReply();
    const response = await callAI(
      `${action}. Saqué un ${diceNumber}`,
      diceNumber,
    );
    const grantedAction = response.grantedAction;

    victim = isSelf(grantedAction) ? getVictim(interaction, true) : victim;

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
  } catch (err) {
    return console.log(err);
  }
}

export async function triesCommand(interaction) {
  const id = interaction.user.id;
  try {
    const me = await getUser(id);
    const DayChanged = didDayChanged(me.date);
    if (DayChanged) createOrUpdateUsers({ id, attemptsAtDate: 0 });

    const remainingAttempts = 5 - me.attemptsAtDate;
    return interaction.reply(
      `Te quedan ${remainingAttempts} intentos máquina.`,
    );
  } catch (err) {
    return interaction.reply("test");
  }
}
