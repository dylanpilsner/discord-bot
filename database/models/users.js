import { Model, DataTypes } from "sequelize";
import { sequelize } from "../connection.js";
import "dotenv/config";

export class User extends Model {}

User.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    name: DataTypes.STRING,
    date: DataTypes.STRING,
    attemptsAtDate: DataTypes.INTEGER,
    dFour: DataTypes.BOOLEAN,
    victim: DataTypes.STRING,
    bonus: DataTypes.INTEGER,
  },
  { sequelize, modelName: "user" },
);

// "imports":{"#/*":"./*"},
