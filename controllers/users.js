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

  if (userId) {
    return await User.update(
      {
        id,
        name,
        date,
        attemptsAtDate,
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
    attemptsAtDate,
    victim,
    dFour,
  });
}

export async function getMembers() {
  const members = await User.findAll();
  return members.map((i) => i.dataValues);
}
