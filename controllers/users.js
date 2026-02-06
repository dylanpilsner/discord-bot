import { User } from "../database/models/users.js";

export async function createOrUpdateUsers({
  id,
  name,
  date,
  attemptsAtDate,
  dFour,
  victim,
}) {
  const user = await User.findOne({ where: { id } });
  const userId = await user?.get("id");
  const userAttempts = await user?.get("attemptsAtdate");

  if (userId) {
    return await User.update(
      {
        id,
        name,
        date,
        attemptsAtDate: attemptsAtDate ?? userAttempts,
        victim,
        dFour,
      },
      {
        where: { id },
      },
    );
  }

  return await User.create({
    id,
    name,
    date,
    attemptsAtDate: 0,
    victim,
    dFour,
  });
}

export async function getMembers() {
  const members = await User.findAll();
  return members.map((i) => i.dataValues);
}

export async function getUser(id) {
  const user = await User.findOne({
    where: {
      id,
    },
  });

  if (!user) {
    throw { message: "El usuario no existe en la base de datos" };
  }

  return user;
}
