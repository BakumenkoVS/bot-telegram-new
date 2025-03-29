const { bot } = require("../../connections/token.connection.js");
const { saveUser } = require("../../common/sequelize/user-model.sequelize.js");
require("dotenv").config();

// Импортируем утилиты из общего файла
const {
  CONSTANTS,
  sendPhotoWithCaption,
  logError,
} = require("../../utils/bot-helpers.js");

// Кнопки для стартового сообщения
const startButtons = [
  [
    {
      text: "Это мне надо",
      callback_data: "second_message",
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
        "Я создала курс домашних тренировок «Стройная и сочная»\n\nЭто твои 30 минут в день, чтобы сделать живот плоским, улучшить свою осанку и почувствовать себя легкой с помощью адекватных нагрузок для тебя 🦋",
        startButtons
      );
    }
  } catch (err) {
    logError(err, "message_handler");
  }
});
