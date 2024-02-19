require("dotenv").config();
const Sequelize = require("sequelize");

module.exports = new Sequelize("bot", "postgres", "postgres", {
   host: "localhost",
   port: "5432",
   dialect: "postgres",
});
