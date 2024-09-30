const db = require("../connections/db.connection");
const { DataTypes } = require("sequelize");

module.exports = db.define(
   "user",
   {
      id: {
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4,
         primaryKey: true,
         unique: true,
         allowNull: false,
      },
      login: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      username: {
         type: DataTypes.STRING,
         allowNull: true,
      },
      privileged: {
         type: DataTypes.BOOLEAN,
         defaultValue: false,
         allowNull: false,
      },
      delivered: {
         type: DataTypes.BOOLEAN,
         defaultValue: false,
         allowNull: false,
      },
      dead: {
         type: DataTypes.BOOLEAN,
         defaultValue: false,
         allowNull: true,
      },
      paid: {
         type: DataTypes.BOOLEAN,
         defaultValue: false,
         allowNull: false,
      },
      paidDiscount: {
         type: DataTypes.BOOLEAN,
         defaultValue: false,
         allowNull: false,
      },
      
   },
   {
      timestamp: true,
      updateAt: false,
   }
);
