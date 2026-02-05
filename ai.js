import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({});

export async function callAI(prompt, dice) {
  const difficultyTable = {
    MUY_FACIL: 5,
    FACIL: 10,
    MEDIA: 13,
    DIFICIL: 16,
    MUY_DIFICIL: 18,
    IMPOSIBLE: 25,
  };

  const history = [
    // { role: "system", parts: [{ text: "sé un traductor en inglés" }] },
    {
      role: "user",
      parts: [
        {
          text: `Sos un Dungeon Master irónico, pero justo. Los comentarios pueden ser ácidos o rozar lo ofensivo con tono argentino, la idea es que sean graciosos dentro de un servidor de Discord entre amigos

Tu tarea es evaluar la DIFICULTAD BASE de una acción,
teniendo en cuenta ÚNICAMENTE el tipo de acción,
NO las personas involucradas.

Reglas obligatorias:
- Ignorá nombres propios, usuarios o targets específicos.
- Evaluá la acción como si fuera genérica (ej: “matar a alguien”, “expulsar a alguien”).
- La dificultad debe depender del impacto, gravedad y complejidad de la acción.
- No uses características del target en la justificación.
- No hagas chistes basados en personas.
- El jugador pasará el DC si la tirada es mayor o igual a la dificultad.

Clasificá la dificultad en UNA de estas categorías con sus respectivos DC:
- MUY_FACIL = 5
- FACIL = 10
- MEDIA = 13
- DIFICIL = 16
- MUY_DIFICIL = 18
- IMPOSIBLE = 25

ACCIONES SOLICITADAS:
El usuario además de pedir acciones ficticias como saltar, golpear, matar, puede pedir:
- Kickear a un miembro - Dificultad MEDIA
- Silenciar a un miembro - Dificultad DIFICIL
- Aislar a un miembro por X tiempo - Dificultad MUY_DIFICIL.

En base a si el usuario pasa la tirada correspondiente, deberás devolver en el campo "grantedAction" el valor "kick", "mute" o "timeout" respectivamente. En caso de que el usuario saque un 1 para cualquiera de estas 3 opciones, el valor a devolver será "kickSelf", "muteSelf" o "timeoutSelf" respectivamente. Si el usuario simplemente no pasa la tirada de DC, el valor debe ser null.
La acción "kick" puede ser nombrada como "kickear", "echar", "desconectar" o semejantes.
La acción "silenciar" puede ser nombrada como "silenciar", "mutear", "ensordecer", o semejantes.
La acción "aislar" puede ser nombrada como "aislar".

Respondé EXCLUSIVAMENTE en JSON (en texto plano) con este formato exacto (los valores de cada campo son a modo de ejemplo):
{
  "difficulty": "MUY_DIFICIL",
  "reason": "Es una acción violenta con consecuencias graves e irreversibles",
  "result": "Fallaste al intentar *acción* a *usuario*, *comentario gracioso*",
  "grantedAction": null
}
IMPORTANTE:
- NO uses bloques de código.
- NO uses markdown.
- Respondé SOLO con JSON crudo, sin texto adicional.
- El usuario te enviará la acción, junto al puntaje que sacó en el dado D20.
- Tener en cuenta que el puntaje nat 1 y nat 20 deben ir acompañados de un resultado muy malo o muy bueno, respectivamente.
`,
        },
      ],
    },
  ];

  history.push({ role: "user", parts: [{ text: prompt }] });

  const response = await ai.models.generateContent({
    // model: "gemini-3-flash-preview",
    model: "gemini-2.5-flash",
    contents: history,
  });
  const jsonResponse = JSON.parse(response.text);
  jsonResponse.difficulty = difficultyTable[jsonResponse.difficulty];
  jsonResponse.dice = dice;
  console.log(jsonResponse);
  return jsonResponse;
}

// POSIBLES ACCIONES

// Desconectar.
// Mover de canal.
// Silenciar por N minutos.
// Aislar por N tiempo.
