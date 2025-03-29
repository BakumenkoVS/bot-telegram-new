const db = require("../../connections/db.connection");
const UserModel = require("../../models/user.model");

exports.saveUser = async (login, username) => {
  await db.sync();

  const textAfterSaving = `User ${login}-${username} is saved`;
  const textAfterUpdate = `User ${login}-${username} has been updated`;

  const foundUser = await UserModel.findOne({ where: { login } });
  console.log("Юзер найден");

  if (!foundUser) {
    console.log("Создается новый пользователь");
    await UserModel.create({
      login,
      username,
    });
    return textAfterSaving;
  }

  if (foundUser.username !== username) {
    console.log("Имя изменено");
    await UserModel.update({ username }, { where: { login } });
  }

  return textAfterUpdate;
};

exports.getUser = async () =>
  UserModel.findAll({
    raw: true,
  });

exports.getUsersByDelivered = async (value = false) =>
  UserModel.findAll({
    raw: true,
    attributes: {
      exclude: [
        "id",
        "username",
        "privileged",
        "createdAt",
        "updatedAt",
        "privileged",
        "delivered",
        "dead",
      ],
    },
    where: {
      delivered: value,
    },
  });

exports.updateUsersByDelivered = async (login) =>
  UserModel.update({ delivered: true }, { where: { login } });

exports.updateUserByDead = async (login) => UserModel.update({ dead: true }, { where: { login } });

exports.updateUserByPaid = async (login) => UserModel.update({ paid: true }, { where: { login } });

exports.updateUserByPaidDiscount = async (login) =>
  UserModel.update({ paidDiscount: true }, { where: { login } });

/**
 * Получает пользователя по ID
 * @param {String} login - ID пользователя в Telegram
 */
exports.getUserById = async (login) => {
  return UserModel.findOne({ where: { login }, raw: true });
};
