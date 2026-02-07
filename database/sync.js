import "dotenv/config";
import { sequelize } from "./connection.js";
import "./models/users.js";

(async function () {
  try {
    const sync = await sequelize.sync({ alter: true });
    console.log(sync);
  } catch (err) {
    console.log({ err });
  }
})();
