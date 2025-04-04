const { bot } = require("../../connections/token.connection.js");
const { saveUser } = require("../../common/sequelize/user-model.sequelize.js");
require("dotenv").config();

// Импортируем утилиты из общего файла
const { CONSTANTS, sendPhotoWithCaption, logError } = require("../../utils/bot-helpers.js");

// Кнопки для стартового сообщения
const startButtons = [
  [
    {
      text: "Это мне надо",
      callback_data: "second_message",
    },
  ],
  [
    {
      text: "Пройти тесты",
      callback_data: "tests",
    },
  ],
];

module.exports = bot.on("text", async (ctx) => {
  try {
    const messageText = ctx.update.message.text;

    if (messageText === "/start") {
      // Сохраняем пользователя в базу данных
      const login = String(ctx.message.from.id);
      const username = ctx.message.from.username ?? "anon";
      await saveUser(login, username);

      // Отправляем приветственное сообщение с фото
      await sendPhotoWithCaption(
        ctx,
        "onmessage.jpg",
        `Я создала курс домашних тренировок <b>'Стройная и сочная'</b>

Это твои <b>30 минут в день</b>, чтобы сделать <b>живот плоским</b>, улучшить <b>осанку</b> и почувствовать себя <b>легкой</b> с помощью адекватных нагрузок для тебя 🦋`,
        startButtons
      );
    }
  } catch (err) {
    logError(err, "message_handler");
  }
});
