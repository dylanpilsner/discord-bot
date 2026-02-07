import {
  disconnectMember,
  getVictim,
  muteMember,
  nukeChannel,
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
  bonus,
) {
  await interaction.editReply(
    `🎲 #Tirada de D20
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      🗡️ **Acción:** ${action}
      ⚖️ **Dificultad:** ${difficulty}
      🎲 **Dado:** ${diceNumber > 1 ? diceNumber - bonus || 0 : diceNumber}
      ${bonus && diceNumber > 1 ? "🍀 ***Bonus***: " + bonus : ""}
      ✨ **Resultado**

      ${result}`,
  );
}

export async function executeAction(grantedAction, interaction, victim) {
  const membersInVoice = interaction?.member?.voice?.channel?.members?.filter(
    (member) => member.id !== interaction.user.id,
  );

  const me = await getVictim(interaction, true);

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

  if (grantedAction === "nukeSelf" && !me.voice.channel) {
    await interaction.editReply("❌ El usuario no está en un canal de voz");
    return { error: 400 };
  }

  if (grantedAction === "nuke" && membersInVoice.size < 1) {
    await interaction.editReply("No hay personas en el canal para nukear 💀");
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
    const response = await timeOutMember(interaction, victim);
    if (response?.code === "50013") {
      await interaction.editReply(response.error);
      return { error: response.code };
    }
  }

  if (grantedAction === "nuke") {
    await nukeChannel(interaction);
  }

  if (grantedAction === "nukeSelf") {
    await disconnectMember(interaction.member);
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
    const DayChanged = await didDayChanged(member.date);
    let bonus = member.bonus;
    let newBonus = false;
    let diceNumber = rollDice(20);

    if (!victim) return interaction.reply("Tenés que arrobar a alguien capo");

    if (DayChanged) {
      member.attemptsAtDate = 0;
      member.date = format(new Date(), "yyyy-MM-dd");
    }

    if (member.attemptsAtDate >= 5) {
      return interaction.reply("Ya no tenés más roleos por hoy campeón");
    }
    if (diceNumber === 20 && bonus === 0) {
      member.bonus = rollDice(6);
      newBonus = true;
    }

    if (diceNumber > 1 && !newBonus) {
      diceNumber = diceNumber + bonus;
      member.bonus = 0;
    }

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

    if (newBonus) {
      response.result =
        response.result +
        ` Bien ahí troesma, como sos una fiera en tu próximo tiro vas a tener un ***+${member.bonus}***`;
    }

    if (actionResponse === 200) {
      await iaReplies(
        action,
        response.difficulty,
        diceNumber,
        response.result,
        interaction,
        bonus,
      );
      member.attemptsAtDate++;
    }

    await createOrUpdateUsers(member);
  } catch (err) {
    return console.log(err);
  }
}

export async function triesCommand(interaction) {
  const id = interaction.user.id;
  try {
    const me = await getUser(id);
    const DayChanged = await didDayChanged(me.date);
    if (DayChanged) {
      me.attemptsAtDate = 0;
      await createOrUpdateUsers({
        id,
        attemptsAtDate: 0,
        date: format(new Date(), "yyyy-MM-dd"),
      });
    }

    const remainingAttempts = 5 - me.attemptsAtDate;
    return interaction.reply(
      `Te queda(n) ${remainingAttempts} intento(s) máquina.`,
    );
  } catch (err) {
    return interaction.reply("test");
  }
}

export async function bonusCommand(interaction) {
  const userId = interaction.user.id;
  await interaction.deferReply();
  const user = await getUser(userId);

  if (user.bonus > 0) {
    return interaction.editReply(
      `Mortal loco, en tu próxima tirada tenés un +${user.bonus}`,
    );
  }

  return interaction.editReply("No tenés ningún bonus, petón");
}

export async function helpCommand(interaction) {
  return interaction.reply(
    `## 👋 Qué hacés, capo. Bienvenido al quilombo.

El comando **más importante de este antro** es **` /
      rolear`**.  
Te explico cómo funciona antes de que hagas cagadas:

---

## 🎲 Cómo usar ` /
      rolear`
Tenés que escribir **` /
      rolear`** seguido de **la acción que querés hacer**.  
**Para TODA acción**, sí o sí tenés que **arrobar a alguien del servidor** (no seas pillo).

Una vez hecho eso, el bot:
1. Tira un **dado de 20 caras** 🎲  
2. Decide si **la rompiste** o si **te salió como el orto**  
3. Te cuenta el resultado con lujo de detalles

---

## 🔥 Acciones disponibles
Podés intentar cosas como:

- 👢 **Kickear** a alguien del canal de voz  
- 🔇 **Mutear** a una persona  
- 🚪 **Aislar** a alguien  
- ☢️ **Nukear** un canal entero (sí, caos total)

Y también podés flashear acciones **triviales o falopa**, tipo:
> *"Quiero convencer a @fulano de que se bañe"*

---

## 🧠 Importante
No hace falta que uses palabras exactas.  
Si decís *"silenciar"*, *"callar"*, *"mandar a mimir"*, **te voy a entender igual**.

👉 En el caso de **nukear**, aunque afecte a todo el canal, **igual tenés que arrobar a alguien**. Es por contrato cósmico, no preguntes.

---

## 📜 Otros comandos útiles
- **` /
      intentos`** → te dice cuántos intentos te quedan hoy (administralos, ludópata)  
- **` /
      bonus`** → te avisa si tenés algún bonus guardado para la próxima tirada  

### 🎁 Sobre los bonus
Si sacás un **20 natural** (sí, el glorioso), el bot tira un **dado de 6 caras** y te suma eso como bonus para la próxima.  
⚠️ **No se acumulan**: gastalo o perdelo, como la vida misma.

---

Listo. Ahora andá, roleá con responsabilidad…  
o no 😈🎲`,
  );
}
