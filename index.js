const express = require("express");
const WebSocket = require("ws");
const http = require("http");
const path = require("path");
const cors = require("cors");
const { CronJob } = require("cron");
require("dotenv").config();

// Импорты из проекта
const { bot } = require("./bot/connections/token.connection.js");
const {
  updateUsersByDelivered,
  updateUserByDead,
  getUser,
  updateUserByPaid,
  updateUserByPaidDiscount,
} = require("./bot/common/sequelize/user-model.sequelize.js");

// Импортируем наши утилиты
const { CONSTANTS, logError } = require("./bot/utils/bot-helpers.js");

// Константы для сервера и бизнес-логики
const SERVER_CONFIG = {
  PORT: 9090,
  ALLOWED_ORIGINS: ["http://localhost:8080"],
  PAYMENT_TIMEOUT: 4 * 60 * 1000, // 4 минуты
  BROADCAST_BATCH_SIZE: 20, // количество сообщений в одном пакете
  BROADCAST_INTERVAL: "*/3 * * * *", // каждые 3 минуты
  BROADCAST_BATCH_INTERVAL: "*/1 * * * * *", // каждую секунду
  WS_SECRET_KEY: process.env.WS_SECRET_KEY, // Ключ для WebSocket аутентификации
};

// Инициализация Express и WebSocket
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: SERVER_CONFIG.ALLOWED_ORIGINS,
  })
);

const server = http.createServer(app);
const wss = new WebSocket.Server({
  server,
  verifyClient: (info, callback) => {
    // Получаем токен из URL запроса
    const url = new URL(info.req.url, `http://${info.req.headers.host}`);
    const token = url.searchParams.get("token");

    // Проверяем, есть ли токен и совпадает ли он с нашим секретным ключом
    if (token && token === SERVER_CONFIG.WS_SECRET_KEY) {
      console.log("WebSocket авторизация успешна");
      callback(true);
    } else {
      console.log("WebSocket подключение отклонено: неверный токен");
      callback(false, 401, "Unauthorized");
    }
  },
});

// Map для отслеживания незавершенных платежей
const pendingPayments = new Map();

/**
 * Отправка массовой рассылки пользователям с конфигурируемыми кнопками
 * @param {Object} ctx - Контекст Telegram
 * @param {String} text - Текст сообщения для рассылки
 * @param {Array} buttons - Массив объектов кнопок {text, callback_data}
 * @param {String} photoUrl - URL изображения для отправки (опционально)
 * @param {String} photoPath - Путь к изображению на сервере (опционально, имеет приоритет над photoUrl)
 */
const broadcastMessage = async (ctx, text, buttons = [], photoUrl = null, photoPath = null) => {
  try {
    const users = await getUser();
    let userIds = users.map(({ login }) => login);
    let count = 0;

    // Подготавливаем опции для отправки сообщения
    const messageOptions = {
      parse_mode: CONSTANTS.PARSE_MODE,
    };

    // Добавляем кнопки только если они есть
    if (buttons && buttons.length > 0) {
      const inlineKeyboard = [];

      // Каждая кнопка в отдельном ряду
      buttons.forEach((button) => {
        inlineKeyboard.push([
          {
            text: button.text,
            callback_data: button.callback_data,
          },
        ]);
      });

      // Добавляем клавиатуру к опциям сообщения
      messageOptions.reply_markup = {
        inline_keyboard: inlineKeyboard,
      };
    }

    // Определяем, есть ли фото для отправки
    const hasPhoto = photoUrl || photoPath;

    // Подготавливаем фото для отправки (приоритет у локального файла)
    let photoSource = null;
    if (photoPath) {
      photoSource = { source: path.join(CONSTANTS.IMG_DIR, photoPath) };
    } else if (photoUrl) {
      photoSource = photoUrl;
    }

    // Запускаем задачу по расписанию (каждые 3 минуты)
    const job = new CronJob(
      SERVER_CONFIG.BROADCAST_INTERVAL,
      async function () {
        if (!userIds.length) {
          console.log("Массив пользователей закончился");
          job.stop();
          return;
        }

        // Подзадача, запускающаяся каждую секунду для отправки небольших пакетов сообщений
        const shortJob = new CronJob(
          SERVER_CONFIG.BROADCAST_BATCH_INTERVAL,
          async function () {
            const rangeUserIds = userIds.splice(0, SERVER_CONFIG.BROADCAST_BATCH_SIZE);
            count++;

            let successCount = 0;
            let errorCount = 0;
            let notFoundCount = 0;

            for await (const userId of rangeUserIds) {
              try {
                // В зависимости от наличия фото, отправляем разные типы сообщений
                if (hasPhoto) {
                  // Если есть фото, отправляем фото с подписью
                  await ctx.telegram.sendPhoto(userId, photoSource, {
                    caption: text,
                    ...messageOptions,
                  });
                } else {
                  // Если фото нет, отправляем обычное текстовое сообщение
                  await ctx.telegram.sendMessage(userId, text, messageOptions);
                }

                console.log(`Сообщение отправлено пользователю ${userId}`);
                await updateUsersByDelivered(userId);
                successCount++;
              } catch (err) {
                if (err.message.includes("chat not found")) {
                  console.log(`Сообщение не отправлено - ${userId} (чат не найден)`);
                  await updateUserByDead(userId);
                  notFoundCount++;
                } else {
                  console.log(`Сообщение не отправлено - ${userId} (другая ошибка)`);
                  errorCount++;
                }
                logError(err, `broadcast_message_to_${userId}`);
              }
            }

            console.log(
              `Статистика пакета: успешно - ${successCount}, не найдено - ${notFoundCount}, другие ошибки - ${errorCount}`
            );

            // Останавливаем подзадачу, если достигли лимита или закончились пользователи
            if (count == 60 || !userIds.length) {
              shortJob.stop();
              count = 0;
              console.log("Отправка закончена!");
            }
          },
          null,
          true
        );
      },
      null,
      true
    );
  } catch (err) {
    logError(err, "broadcast_message");
  }
};

/**
 * Отправка уведомления о незавершенном платеже
 * @param {String} userId - ID пользователя
 */
async function notifyIncompletePayment(userId) {
  try {
    await bot.telegram.sendPhoto(
      userId,
      { source: path.join(CONSTANTS.IMG_DIR, "!.WEBP") },
      {
        caption:
          "Оплата не прошла.\n\nЧтобы оплатить переводом или картой иностранного банка, напиши мне, пожалуйста, я помогу сделать это.\n\n" +
          CONSTANTS.URLS.CONTACT,
        parse_mode: CONSTANTS.PARSE_MODE,
      }
    );
  } catch (err) {
    logError(err, `notify_incomplete_payment_to_${userId}`);
  }
}

// Обработчики WebSocket соединений
wss.on("connection", (ws) => {
  console.log("Новое клиентское подключение");

  // Обработка сообщений от клиента
  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === "text") {
        console.log("Получен текст для рассылки:", data.text);
        // Передаем параметры фото, если они есть
        broadcastMessage(bot, data.text, data.buttons, data.photoUrl, data.photoPath);
        ws.send(JSON.stringify({ status: "Сообщение получено и обработано" }));
      } else if (data.type === "getUser") {
        try {
          const user = await getUser();
          ws.send(JSON.stringify({ type: "user", user }));
        } catch (error) {
          ws.send(JSON.stringify({ type: "error", message: "Что-то пошло не так" }));
          logError(error, "ws_get_user");
        }
      }
    } catch (err) {
      logError(err, "ws_message_parse");
      ws.send(JSON.stringify({ type: "error", message: "Ошибка обработки сообщения" }));
    }
  });

  // Обработка закрытия соединения
  ws.on("close", () => {
    console.log("Клиент отключился");
  });

  // Обработка ошибок соединения
  ws.on("error", (err) => {
    logError(err, "ws_connection");
  });
});

// Обработчики платежей Telegram
bot.on("pre_checkout_query", async (ctx) => {
  try {
    const userId = ctx.from.id;
    console.log("Начат процесс оплаты");
    const paymentAmount = ctx.preCheckoutQuery.total_amount;

    if (
      paymentAmount !== CONSTANTS.PRICES.LOW_PRICE &&
      paymentAmount !== CONSTANTS.PRICES.MIDDLE_PRICE &&
      paymentAmount !== CONSTANTS.PRICES.HIGH_PRICE
    ) {
      // Отклонить платёж, если сумма не соответствует ожидаемой
      await ctx.answerPreCheckoutQuery(false, "Неверная сумма платежа. Попробуйте снова.");
      return;
    }

    // Подтверждаем платеж
    await ctx.answerPreCheckoutQuery(true);

    // Устанавливаем таймер на уведомление о незавершенном платеже
    const timeoutId = setTimeout(() => {
      if (pendingPayments.has(userId)) {
        notifyIncompletePayment(userId);
        pendingPayments.delete(userId);
      }
    }, SERVER_CONFIG.PAYMENT_TIMEOUT);

    pendingPayments.set(userId, { timeoutId });
  } catch (err) {
    logError(err, "pre_checkout_query");
    // Пытаемся корректно завершить запрос, даже если произошла ошибка
    try {
      await ctx.answerPreCheckoutQuery(false, "Произошла ошибка. Попробуйте позже.");
    } catch (respondErr) {
      logError(respondErr, "pre_checkout_query_error_respond");
    }
  }
});

bot.on("successful_payment", async (ctx) => {
  try {
    const payment = ctx.message.successful_payment;
    const userId = ctx.from.id;

    // Обновляем статус пользователя в зависимости от суммы платежа
    if (payment.total_amount === CONSTANTS.PRICES.COURSE_PRICE) {
      await updateUserByPaid(userId);
    } else if (payment.total_amount === PAYMENT_AMOUNTS.DISCOUNT_COURSE) {
      await updateUserByPaidDiscount(userId);
    }

    // Если платеж завершен успешно, сбрасываем таймер
    if (pendingPayments.has(userId)) {
      clearTimeout(pendingPayments.get(userId).timeoutId);
      pendingPayments.delete(userId);

      // Отправляем сообщение об успешной оплате
      let successMessage = "";
      let imageFile = "start.JPG";

      // Определяем сообщение в зависимости от суммы платежа
      if (payment.total_amount === CONSTANTS.PRICES.LOW_PRICE) {
        // Сообщение для базового тарифа (4999 руб)
        successMessage =
          "Оплата прошла успешно\n\nБлагодарю тебя за доверие и поздравляю с тем, что ты сделала первый шаг к стройной и подтянутой фигуре ❤️\n\nЭто базовый тариф курса, который включает все тренировки и доступ к общему чату.\n\nДобавляйся в чат: https://t.me/+qL7alPUCOUoxNzgy";
      } else if (payment.total_amount === CONSTANTS.PRICES.MIDDLE_PRICE) {
        // Сообщение для стандартного тарифа (5999 руб)
        successMessage =
          "Оплата прошла успешно\n\nБлагодарю тебя за доверие и поздравляю с тем, что ты сделала первый шаг к стройной и подтянутой фигуре ❤️\n\nТы выбрала стандартный тариф, который включает все тренировки, индивидуальную консультацию и доступ к закрытому чату.\n\nДобавляйся в чат: https://t.me/+qL7alPUCOUoxNzgy\n\nДля получения консультации напиши мне: " +
          CONSTANTS.URLS.CONTACT;
      } else if (payment.total_amount === CONSTANTS.PRICES.HIGH_PRICE) {
        // Сообщение для премиум тарифа (6999 руб)
        imageFile = "12.PNG"; // Используем существующее изображение вместо premium.PNG
        successMessage =
          "Оплата прошла успешно\n\nБлагодарю тебя за доверие и поздравляю с выбором премиум тарифа! ❤️\n\nТы получаешь все тренировки, 3 индивидуальные консультации, персональный план питания и VIP доступ к закрытому чату.\n\nДобавляйся в чат: https://t.me/+qL7alPUCOUoxNzgy\n\nЯ свяжусь с тобой в ближайшее время для составления индивидуального плана.";
      } else {
        // Сообщение по умолчанию (если вдруг будут другие суммы)
        successMessage =
          "Оплата прошла успешно\n\nБлагодарю тебя за доверие и поздравляю с тем, что ты сделала первый шаг к стройной и подтянутой фигуре ❤️\n\nДобавляйся в чат, вся полезная информация будет там: https://t.me/+qL7alPUCOUoxNzgy";
      }

      // Отправляем сообщение с соответствующим изображением и текстом
      await ctx.replyWithPhoto(
        { source: path.join(CONSTANTS.IMG_DIR, imageFile) },
        {
          caption: successMessage,
          parse_mode: CONSTANTS.PARSE_MODE,
        }
      );
    }
  } catch (err) {
    logError(err, "successful_payment");
  }
});

// Импорт обработчиков Telegram бота
require("./bot/middleware/command/start.command");
require("./bot/middleware/on/message.on");
require("./bot/middleware/on/callback_query.js");
require("./bot/connections/local.connection");

// Запуск сервера
server.listen(SERVER_CONFIG.PORT, () => {
  console.log(`Сервер запущен на порту ${SERVER_CONFIG.PORT}`);
});
