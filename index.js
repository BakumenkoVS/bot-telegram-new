const express = require("express");
const WebSocket = require("ws");
const http = require("http");
const { bot } = require("./bot/connections/token.connection.js");
const { CronJob } = require("cron");
const {
  updateUsersByDelivered,
  updateUserByDead,
  getUser,
  updateUserByPaid,
  updateUserByPaidDiscount,
} = require("./bot/common/sequelize/user-model.sequelize.js");
require("dotenv").config();
const cors = require("cors");
const path = require("path");

//Убрать конект к серверу в папку с подключениями

const PORT = 9090;

const app = express();

app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(
  cors({
    origin: ["http://localhost:8080"],
  })
);

const smm = async (ctx, text) => {
  try {
    const users = await getUser();
    let userIds = users.map(({ login }) => login);

    count = 0;
    //2 минуты отдых 1 минута рассылка
    const job = new CronJob(
      "*/3 * * * *",
      async function () {
        if (!userIds.length) {
          console.log("Массив пользователей закончился");
          job.stop();
          return;
        }

        const shortJob = new CronJob(
          //Всю минуту по 20 записей
          "*/1 * * * * *",
          async function () {
            const rangeUserIds = userIds.splice(0, 20);
            count++;
            for await (userId of rangeUserIds) {
              try {
                await ctx.telegram.sendMessage(userId, text, {
                  parse_mode: "HTML",
                  reply_markup: {
                    inline_keyboard: [
                      [
                        {
                          text: "Узнать про курс",
                          callback_data: "InformationAboutIntensive",
                        },
                      ],
                      [
                        {
                          text: "Записаться на курс",
                          callback_data: "buyFile",
                        },
                      ],
                    ],
                  },
                });
                console.log(`Сообщение отправлено этому пользователю ${userId}`);
                await updateUsersByDelivered(userId);
              } catch (err) {
                console.log(`Сообщение не отправлено - ${userId}`);
                await updateUserByDead(userId);
              }
            }

            if (count == 60 || !userIds.length) {
              shortJob.stop();
              count = 0;
              console.log("Отправка закончена!!");

              return;
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
    console.log(err);
  }
};

wss.on("connection", (ws) => {
  console.log("New client connected");

  // Обработка сообщений от клиента
  ws.on("message", async (message) => {
    const data = JSON.parse(message);
    if (data.type === "text") {
      console.log(data.text);
      smm(bot, data.text);
      ws.send(JSON.stringify({ status: "Text message received and processed" }));
    } else if (data.type === "getUser") {
      try {
        const user = await getUser();
        ws.send(JSON.stringify({ type: "user", user }));
      } catch (error) {
        ws.send(JSON.stringify({ type: "error", message: "Something went wrong" }));
      }
    }
  });

  // Обработка закрытия соединения
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

//Создать папку с запросами и убрать туда все запросы
// app.post("/", (req, res) => {
//    console.log(req.body.text);
//    smm(bot, req.body.text);
//    res.status(200).json("Post запрос на рассылку прошел успешно");
// });

// app.get("/users", async (req, res) => {
//    const user = await getUser();
//    res.status(200).json(user);
// });

//app.listen(PORT, () => console.log("Server started "));

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
// Commands
require("./bot/middleware/command/start.command");

//ON

require("./bot/middleware/on/message.on");
require("./bot/middleware/on/callback_query.js");

// CONNECTION
require("./bot/connections/local.connection");

//Убрать оплату в другой файл

const pendingPayments = new Map();
const PAYMENT_TIMEOUT = 4 * 60 * 1000;

// Функция для отправки уведомления о незавершенном платеже
async function notifyIncompletePayment(userId) {
  await bot.telegram.sendPhoto(
    userId,
    {
      source: path.join("img", "!.WEBP"),
    },
    {
      caption:
        "Оплата не прошла.\n\nЧтобы оплатить переводом или картой иностранного банка, напиши мне, пожалуйста, я помогу сделать это.\n\nhttps://t.me/lidabakumenko",
    }
  );
}

bot.on("pre_checkout_query", async (ctx) => {
  const userId = ctx.from.id;
  console.log("Оплата");
  const paymentAmount = ctx.preCheckoutQuery.total_amount;

  if (paymentAmount !== 5999 * 100) {
    // Отклонить платёж, если сумма не соответствует ожидаемой
    await ctx.answerPreCheckoutQuery(false, "Неверная сумма платежа. Попробуйте снова.");
    return;
  }

  ctx.answerPreCheckoutQuery(true);

  // Устанавливаем таймер на уведомление о незавершенном платеже
  const timeoutId = setTimeout(() => {
    if (pendingPayments.has(userId)) {
      notifyIncompletePayment(userId);
      pendingPayments.delete(userId);
    }
  }, PAYMENT_TIMEOUT);

  pendingPayments.set(userId, { timeoutId });
}); // ответ на предварительный запрос по оплате

bot.on("successful_payment", async (ctx) => {
  if (ctx.message.successful_payment.total_amount === 5999 * 100) {
    updateUserByPaid(ctx.message.from.id);
  }
  if (ctx.message.successful_payment.total_amount === 6500) {
    updateUserByPaidDiscount(ctx.message.from.id);
  }
  // ответ в случае положительной оплаты
  const userId = ctx.from.id;

  // Если платеж завершен успешно, сбрасываем таймер
  if (pendingPayments.has(userId)) {
    clearTimeout(pendingPayments.get(userId).timeoutId);
    pendingPayments.delete(userId);

    // Отправляем сообщение об успешной оплате
    await ctx.replyWithPhoto(
      { source: path.join("img", "hert.PNG") },
      {
        caption: "Оплата прошла успешно\n\nБлагодарю тебя за доверие и поздравляю с тем, что ты сделала первый шаг к стройной и подтянутой фигуре ❤️\n\nДобавляйся в чат, вся полезная информация будет там: https://t.me/+qL7alPUCOUoxNzgy",
      }
    );
  }
});
