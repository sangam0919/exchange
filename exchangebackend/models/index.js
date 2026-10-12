require("dotenv").config();
const path = require("path");
const Sequelize = require("sequelize");

const dialect = process.env.DATABASE_DIALECT || "mysql";

const sequelize =
  dialect === "sqlite"
    ? new Sequelize({
        dialect: "sqlite",
        storage: path.resolve(__dirname, "..", process.env.SQLITE_STORAGE || "dev.sqlite"),
        logging: false,
      })
    : new Sequelize(
        process.env.DATABASE_NAME,
        process.env.DATABASE_USER,
        process.env.DATABASE_PASSWORD,
        {
          host: process.env.DATABASE_HOST,
          port: process.env.DATABASE_PORT,
          dialect: "mysql",
          logging: false,
        }
      );

const User = require("../models/user");
const Wallet = require("../models/wallet");
const Order = require("../models/order");
const Ranking = require("../models/ranking");
const Notification = require("../models/notification");

const models = {
  User: User.init(sequelize),
  Wallet: Wallet.init(sequelize),
  Order: Order.init(sequelize),
  Ranking: Ranking.init(sequelize),
  Notification: Notification.init(sequelize),
};

Object.values(models).forEach((model) => {
  if (model.associate) model.associate(models);
});

sequelize
  .sync({ force: false })
  .then(() => console.log("Database synced"))
  .catch((err) => console.error("Sync error:", err));

module.exports = {
  sequelize,
  Sequelize,
  ...models,
};
