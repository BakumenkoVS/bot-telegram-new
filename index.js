const express = require("express");
//const { smm } = require("./bot/middleware/on/message.on");
const { bot } = require("./bot/connections/token.connection.js");
const { CronJob } = require("cron");
const {
   updateUsersByDelivered,
   updateUserByDead,
} = require("./bot/common/sequelize/user-model.sequelize.js");
require("dotenv").config();
const path = require("path");

const PORT = 8888;

const app = express();

app.use(express.json());

const smm = async (ctx, text) => {
   try {
      console.log("РАБОТАЕТ", ctx);
      const users = await getUser();
      let userIds = users.map(({ login }) => login);
      // let userIds = [
      //    "385874539",
      //    "555715489",
      //    "123124124",
      //    "214124124",
      //    "214521412",
      //    "123124124",
      //    "214124124",
      //    "124124452",
      //    "214521412",
      //    "123124124",
      //    "214124124",
      //    "124124452",
      //    "214521412",
      //    "123124124",
      //    "214124124",
      //    "124124452",
      //    "214521412",
      //    "123124124",
      //    "214124124",
      //    "124124452",
      //    "214521412",
      //    "123124124",
      //    "214124124",
      //    "124124452",
      //    "214521412",
      //    "123124124",
      //    "214124124",
      //    "124124452",
      //    "214521412",
      //    "123124124",
      //    "214124124",
      //    "124124452",
      //    "214521412",
      //    "123124124",
      //    "214124124",
      //    "124124452",
      //    "214521412",
      //    "123124124",
      //    "214124124",
      //    "124124452",
      //    "214521412",
      //    "123124124",
      //    "214124124",
      //    "124124452",
      //    "214521412",
      //    "123124124",
      //    "214124124",
      //    "124124452",
      //    "214521412",
      //    "214124124",
      //    "124124452",
      //    "214521412",
      //    "123124124",
      //    "214124124",
      //    "124124452",
      //    "214521412",
      //    "123124124",
      //    "214124124",
      //    "124124452",
      //    "214521412",
      //    "123124124",
      //    "214124124",
      //    "124124452",
      //    "214521412",
      //    "123124124",
      //    "214124124",
      //    "124124452",
      //    "214521412",
      //    "123124124",
      //    "214124124",
      //    "124124452",
      //    "214521412",
      //    "123124124",
      //    "214124124",
      //    "124124452",
      //    "214521412",
      //    "123124124",
      //    "214124124",
      //    "124124452",
      //    "214521412",
      //    "123124124",
      //    "214124124",
      //    "124124452",
      //    "214521412",
      //    "123124124",
      //    "214124124",
      //    "124124452",
      //    "214521412",
      //    "123124124",
      //    "214124124",
      //    "124124452",
      //    "214521412",
      // ];
      //const send = [];
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
                           reply_markup: {
                              inline_keyboard: [
                                 [
                                    {
                                       text: "Записаться на интенсив",
                                       callback_data: "buyFile",
                                    },
                                 ],
                              ],
                           },
                        });
                        console.log(
                           `Сообщение отправлено этому пользователю ${userId}`
                        );
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

app.post("/", (req, res) => {
   console.log(req.body, smm);
   smm(bot, req.body.text);
   res.status(200).json("Сервер работает");
});

app.listen(PORT, () => console.log("Server started "));

// Commands
require("./bot/middleware/command/start.command");

//ON

require("./bot/middleware/on/message.on");
require("./bot/middleware/on/callback_query.js");

// CONNECTION
require("./bot/connections/local.connection");

bot.on("pre_checkout_query", (ctx) => ctx.answerPreCheckoutQuery(true)); // ответ на предварительный запрос по оплате

bot.on("successful_payment", async (ctx) => {
   // ответ в случае положительной оплаты
   await ctx.replyWithPhoto(
      { source: path.resolve("/root/bot-telegram-new/img/cat.jpg") },
      {
         caption:
            "Благодарю тебя за доверие)\n\nПоздравляю, ты присоединилась к моему интенсиву 🥳\n\nИнтенсив начнется 4 марта, не забудь подписаться на закрытый канал, там будет вся полезная информация по интенсиву и анонсу тренировок. Там же я расскажу про необходимое оборудование, которое нужно заказать до начала интенсива.\n\nhttps://t.me/+_XKrCDhGfSYwNDBi \n\nПока интенсив не начался, попробуй эти бесплатные тренировки.\n\nhttps://youtube.com/playlist?list=PLIg2IFzDwpNKPILc3-RnRdDyep1HCEmTD&si=DHjikkSv7BBH61K1\n\nДо встречи ❤️",
      }
   );
});
