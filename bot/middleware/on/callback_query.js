const { bot } = require("../../connections/token.connection.js");
const path = require("path");

module.exports = bot.on("callback_query", async (ctx) => {
   try {
      console.log(ctx.update.callback_query.message.chat.id, "Пробы");
      switch (ctx.update.callback_query.data) {
         case "buyFile":
            await ctx.replyWithInvoice({
               chat_id: ctx.update.callback_query.message.chat.id, // Уникальный идентификатор целевого чата или имя пользователя целевого канала
               provider_token: process.env.PROVIDER_TOKEN, // токен выданный через бот @SberbankPaymentBot
               start_parameter: "get_access", //Уникальный параметр глубинных ссылок. Если оставить поле пустым, переадресованные копии отправленного сообщения будут иметь кнопку «Оплатить», позволяющую нескольким пользователям производить оплату непосредственно из пересылаемого сообщения, используя один и тот же счет. Если не пусто, перенаправленные копии отправленного сообщения будут иметь кнопку URL с глубокой ссылкой на бота (вместо кнопки оплаты) со значением, используемым в качестве начального параметра.
               title: "Купить интенсив", // Название продукта, 1-32 символа
               description: "Покупка интенсива", // Описание продукта, 1-255 знаков
               currency: "RUB", // Трехбуквенный код валюты ISO 4217
               prices: [{ label: "Записаться на интенсив", amount: 3890 * 100 }], // Разбивка цен, сериализованный список компонентов в формате JSON 100 копеек * 100 = 100 рублей
               payload: {
                  // Полезные данные счета-фактуры, определенные ботом, 1–128 байт. Это не будет отображаться пользователю, используйте его для своих внутренних процессов.
                  unique_id: `${
                     ctx.update.callback_query.message.chat.id
                  }_${Number(new Date())}`,
                  provider_token: process.env.PROVIDER_TOKEN,
               },
            });

            break;

         case "moreInformation":
            await ctx.replyWithPhoto(
               { source: path.resolve("./img/1tr.jpg") },
               {
                  caption:
                     "Осанка - это положение вашего тела, в котором вы находитесь большую часть дня. От нее зависит тонус мышц и то, как выглядит ваше тело.\n\nИз-за нарушений в осанке появляются такие проблемные зоны, как:\n• двойной подбородок\n• отечность на лице\n• холка на шее\n• валики около подмышек\n• дряблые руки\n• выпирающий живот\n• складки на спине\n• бока на талии\n• рыхлые ягодицы\n• целлюлит на бедрах\n• валики над коленями\n• ушки на бедрах\n• отечные икроножные\n\nВозможно ли скорректировать фигуру и избавиться от проблемных зон с помощью работы с осанкой?\n\nКонечно, да.\n\nКак это сделать?\n\nУзнаешь в 1 тренировке ⬇️",
                  parse_mode: "HTML",
                  reply_markup: {
                     inline_keyboard: [
                        [
                           {
                              text: "Открыть 1 тренировку",
                              callback_data: "firstWorkout",
                           },
                        ],
                        [
                           {
                              text: "Узнать про интенсив",
                              callback_data: "InformationAboutIntensive",
                           },
                        ],
                     ],
                  },
               }
            );
            break;

         case "firstWorkout":
            await ctx.reply(
               "https://youtu.be/hlbpFn6QJGo?si=VGo-L00ZVgYNrrCS",

               {
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
               }
            );
            setTimeout(async () => {
               await ctx.replyWithPhoto(
                  { source: path.resolve("./img/2tr.jpg") },

                  {
                     caption:
                        "Таз - это центр женского тела, от его положения напрямую зависит форма и тонус мышц пресса и ягодичных.\n\nКому нужно работать с мобильностью и положением таза:\n• если есть боли в тазу и скованность в поясничном отделе\n• не получается убрать живот, как бы вы не худели и не качали пресс\n• вообще не чувствуете ягодицы в упражнениях \n• хочется улучшить тонус и качество ягодичных мышц\n• вас волнуют складки на спине и отечность в зоне талии\n• у вас нет лишнего веса, но живот увеличен в объеме или есть валик внизу живота\n• есть подтекания при кашле или чихании, боли при половом акте\n\nЕсли тебя волнует хотя бы два пункта из списка, то открывай 2 тренировку ⬇️",

                     reply_markup: {
                        inline_keyboard: [
                           [
                              {
                                 text: "Открыть 2 тренировку",
                                 callback_data: "secondWorkout",
                              },
                           ],
                        ],
                     },
                  }
               );
            }, 86400000);
            break;

         case "secondWorkout":
            await ctx.reply(
               "https://youtu.be/bmWPbK55hzA?si=AJ3w9p27bMt3KmjZ",
               {
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
               }
            );
            setTimeout(async () => {
               await ctx.replyWithPhoto(
                  { source: path.resolve("./img/3tr.jpg") },

                  {
                     caption:
                        "Все хотят плоский живот. Это факт!\n\nНо не все знают, из чего его готовить. Недостаточно просто качать пресс, делая планку, скручивания или подьемы ног. Для подтянутого живота важна слаженная работа диафрагмы, глубоких мышц пресса и тазового дна. Все не так сложно, как кажется, давай попробуем.\n\nБери коврик и открывай 3 тренировку ⬇️",
                     reply_markup: {
                        inline_keyboard: [
                           [
                              {
                                 text: "Открыть 3 тренировку",
                                 callback_data: "thirdWorkout",
                              },
                           ],
                        ],
                     },
                  }
               );
            }, 86400000);
            break;

         case "thirdWorkout":
            await ctx.reply(
               "https://youtu.be/bHhvXY5lHuU?si=f_GktahUohlkleVL",
               {
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
               }
            );
            break;

         case "InformationAboutIntensive":
            await ctx.replyWithPhoto(
               { source: path.resolve("./img/opisanie.jpg") },
               {
                  caption:
                     "Интенсив для девушек\nТаз, живот и ягодицы\n\nСтарт - 4 марта\nДлительность - 3 недели\nТренировки для девушек, направленные для выравнивания положения таза, улучшение тонуса мышц живота и ягодичных, мфр и работа с осанкой.\n\nИнтенсив будет длится 3 недели. Тренировки будут выходить каждый день в записи, заниматься можно в любое удобное для тебя время, просто открыв видео на ютубе с компьютера или телефона. Помимо тренировок ты получаешь доступ к закрытому тг каналу с полезной информацией о фигуре и чат участниц, где ты сможешь общаться с другими девушками. Доступ к тренировкам и тг каналу после интенсива - вечный.\n\nСтоимость интенсива: 3890₽\nПрисоединяйся скорее, будем тренироваться вместе, я жду тебя ❤️",
                  parse_mode: "HTML",
                  reply_markup: {
                     inline_keyboard: [
                        [
                           {
                              text: "Противопоказания",
                              callback_data: "contraindications",
                           },
                        ],
                        [
                           {
                              text: "Оборудование",
                              callback_data: "equipment",
                           },
                        ],
                        [
                           {
                              text: "Формат занятий",
                              callback_data: "workout",
                           },
                        ],
                        [
                           {
                              text: "Записаться на интенсив",
                              callback_data: "buyFile",
                           },
                        ],
                     ],
                  },
               }
            );
            break;

         case "contraindications":
            await ctx.replyWithPhoto(
               { source: "./img/pokazania.jpg" },
               {
                  caption:
                     "Противопоказания\n\n• Выраженная гипертония\n• ЛОР-заболевания\n• Беременность\n• Артрозы 3-4 степени\n• Спондилолистез\n• Остеопороз\n• Артриты (стадии обострения)\n• Острые состояния, связанные с заболеванием внутренних органов\n\n❗️Можно девушкам на грудном вскармливании и при диастазе 1 степени (расстояние между внутренними краями прямых мышц живота от 4 до 7 см)",
                  parse_mode: "HTML",
                  reply_markup: {
                     inline_keyboard: [
                        [
                           {
                              text: "Оборудование",
                              callback_data: "equipment",
                           },
                        ],
                        [
                           {
                              text: "Формат занятий",
                              callback_data: "workout",
                           },
                        ],
                        [
                           {
                              text: "Записаться на интенсив",
                              callback_data: "buyFile",
                           },
                        ],
                     ],
                  },
               }
            );
            break;

         case "equipment":
            await ctx.replyWithPhoto(
               { source: "./img/obarudovanie.jpg" },
               {
                  caption:
                     "Оборудование\n\nДля тренировок нужен будет массажный ролл и мфр мяч, я подскажу и помогу с выбором оборудования до начала интенсива.\n\nЗдорово, если у тебя будут гантели, но это не обязательно, в качестве отягощений можно использовать книги или бутылки.",
                  parse_mode: "HTML",
                  reply_markup: {
                     inline_keyboard: [
                        [
                           {
                              text: "Противопоказания",
                              callback_data: "contraindications",
                           },
                        ],
                        [
                           {
                              text: "Формат занятий",
                              callback_data: "workout",
                           },
                        ],
                        [
                           {
                              text: "Записаться на интенсив",
                              callback_data: "buyFile",
                           },
                        ],
                     ],
                  },
               }
            );
            break;

         case "workout":
            await ctx.replyWithPhoto(
               { source: "./img/format.jpg" },
               {
                  caption:
                     "Формат\n\nИнтенсив стартует в понедельник 4 марта и будет длиться 3 недели. Все тренировки и лекции будут выходить в видео формате на ютубе, заниматься можно в любое удобное для тебя время, включив тренировку на телефоне или компьютере. Вся полезная информация и статьи будут выходить в закрытом тг канале, а в чате интенсива ты сможешь общаться с другими участницами.\n\nДля создания красивой фигуры нужно всего 2 ингредиента: твое желание и ровно 30 минут в день.",
                  parse_mode: "HTML",
                  reply_markup: {
                     inline_keyboard: [
                        [
                           {
                              text: "Противопоказания",
                              callback_data: "contraindications",
                           },
                        ],
                        [
                           {
                              text: "Оборудование",
                              callback_data: "equipment",
                           },
                        ],
                        [
                           {
                              text: "Записаться на интенсив",
                              callback_data: "buyFile",
                           },
                        ],
                     ],
                  },
               }
            );
            break;
      }
   } catch (error) {
      console.log(error);
   }
});
