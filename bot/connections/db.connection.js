require("dotenv").config();
const Sequelize = require("sequelize");

module.exports = new Sequelize("bot", "vlad", "tiny", {
   host: "localhost",
   port: "5432",
   dialect: "postgres",
});
