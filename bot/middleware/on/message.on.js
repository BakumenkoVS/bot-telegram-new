const { bot } = require("../../connections/token.connection.js");
const { saveUser } = require("../../common/sequelize/user-model.sequelize.js");
require("dotenv").config();

const path = require("path");

module.exports = bot.on("text", async (ctx) => {
   console.log(ctx);
   try {
      if (ctx.update.message.text == "/start") {
         const login = String(ctx.message.from.id);
         const username = ctx.message.from.username ?? "anon";
         console.log(login, username);
         const result = await saveUser(login, username);

         await ctx.replyWithPhoto(
            {
               source: "../../../img/moreInfo.jpg",
            },
            {
               caption:
                  "Если ты попала сюда, значит, ты уже на шаг ближе к здоровой и красивой фигуре, а я тебе в этом помогу.\n\nМеня зовут Лида Бакуменко, я тренер по фитнесу и осанке, почти 6 лет работаю в коррекции фигуры и помогаю женщинам стать прекраснее.",
               parse_mode: "HTML",
               reply_markup: {
                  inline_keyboard: [
                     [
                        {
                           text: "Узнать больше",
                           callback_data: "moreInformation",
                        },
                     ],
                  ],
               },
            }
         );
      }

      if (ctx.update.message.text == "/start Lida") {
         console.log(ctx.message);
         ctx.replyWithInvoice({
            chat_id: ctx.message.chat.id, // Уникальный идентификатор целевого чата или имя пользователя целевого канала
            provider_token: process.env.PROVIDER_TOKEN, // токен выданный через бот @SberbankPaymentBot
            start_parameter: "get_access", //Уникальный параметр глубинных ссылок. Если оставить поле пустым, переадресованные копии отправленного сообщения будут иметь кнопку «Оплатить», позволяющую нескольким пользователям производить оплату непосредственно из пересылаемого сообщения, используя один и тот же счет. Если не пусто, перенаправленные копии отправленного сообщения будут иметь кнопку URL с глубокой ссылкой на бота (вместо кнопки оплаты) со значением, используемым в качестве начального параметра.
            title: "Записаться на интенсив", // Название продукта, 1-32 символа
            description: "Покупка интенсива", // Описание продукта, 1-255 знаков
            currency: "RUB", // Трехбуквенный код валюты ISO 4217
            prices: [{ label: "Купить интенсив", amount: 2990 * 100 }], // Разбивка цен, сериализованный список компонентов в формате JSON 100 копеек * 100 = 100 рублей
            payload: {
               // Полезные данные счета-фактуры, определенные ботом, 1–128 байт. Это не будет отображаться пользователю, используйте его для своих внутренних процессов.
               unique_id: `${ctx.message.chat.id}_${Number(new Date())}`,
               provider_token: process.env.PROVIDER_TOKEN,
            },
         });
      }
   } catch (err) {
      console.log(err);
   }
});
