import { Model, DataTypes } from "sequelize";
import { sequelize } from "../connection.js";

export class User extends Model {}

User.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    name: DataTypes.STRING,
    date: DataTypes.STRING,
    attemptsAtDate: DataTypes.INTEGER,
    dFour: DataTypes.BOOLEAN,
    victim: DataTypes.STRING,
  },
  { sequelize, modelName: "user" },
);
