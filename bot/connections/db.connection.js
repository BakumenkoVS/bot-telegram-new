require("dotenv").config();
const Sequelize = require("sequelize");

module.exports = new Sequelize("postgres://postgres:postgres@localhost/bot", {
   host: process.env.POSTGRES_HOST,
   port: process.env.POSTGRES_PORT,
   dialect: process.env.POSTGRES_DIALECT,
});

module.exports = new Sequelize(
   `${process.env.POSTGRES_DATABASE}`,
   `${process.env.POSTGRES_USERNAME}`,
   `${process.env.postgres.POSTGRES_PASSWORD}`,
   {
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT,
      dialect: process.env.POSTGRES_DIALECT,
   }
);
