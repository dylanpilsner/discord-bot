import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(
  `postgresql://postgres.ttlabqdjuxuhoccfkgae:${process.env.POSTGRES_PASSWORD}@aws-1-us-east-1.pooler.supabase.com:5432/postgres`,
  {
    dialect: "postgres",
    logging: false,
    define: {
      underscored: true,
      schema:
        process.env.RAILWAY_ENVIRONMENT_NAME === "development"
          ? "qa"
          : "public",
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
);

async function testDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully");
  } catch (err) {
    console.error("Unable to connect to the database: ", err);
  }
}

testDatabase();
