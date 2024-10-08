const { bot } = require("../../connections/token.connection.js");
const path = require("path");

module.exports = bot.on("callback_query", async (ctx) => {
  const oneSecond = 1000; // 1000 миллисекунд = 1 секунда
  const oneMinute = 60 * oneSecond; // 60 секунд = 1 минута
  const oneHour = 60 * oneMinute; // 60 минут = 1 час
  const oneDay = 24 * oneHour; // 24 часа = 1 сутки
  try {
    switch (ctx.update.callback_query.data) {
      case "buyFile":
        await ctx.replyWithPhoto({
          source: path.join("img", "ticet.PNG"), // Замените на URL вашей картинки
        });

        await ctx.replyWithInvoice({
          chat_id: ctx.update.callback_query.message.chat.id, // Уникальный идентификатор целевого чата или имя пользователя целевого канала
          provider_token: process.env.PROVIDER_TOKEN, // токен выданный через бот @SberbankPaymentBot
          start_parameter: "get_access", //Уникальный параметр глубинных ссылок. Если оставить поле пустым, переадресованные копии отправленного сообщения будут иметь кнопку «Оплатить», позволяющую нескольким пользователям производить оплату непосредственно из пересылаемого сообщения, используя один и тот же счет. Если не пусто, перенаправленные копии отправленного сообщения будут иметь кнопку URL с глубокой ссылкой на бота (вместо кнопки оплаты) со значением, используемым в качестве начального параметра.
          title: "Купить курс", // Название продукта, 1-32 символа
          description: "Покупка курса", // Описание продукта, 1-255 знаков
          currency: "RUB", // Трехбуквенный код валюты ISO 4217
          prices: [{ label: "Записаться на курс", amount: 60 * 100 }], // Разбивка цен, сериализованный список компонентов в формате JSON 100 копеек * 100 = 100 рублей
          payload: {
            // Полезные данные счета-фактуры, определенные ботом, 1–128 байт. Это не будет отображаться пользователю, используйте его для своих внутренних процессов.
            unique_id: `${ctx.update.callback_query.message.chat.id}_${Number(new Date())}`,
            provider_token: process.env.PROVIDER_TOKEN,
          },
        });

        break;

      case "moreInformation":
        await ctx.replyWithPhoto(
          { source: path.join("img", "moreInformation.JPG") },
          {
            caption: "ТУТ МЫ РАССКАЗЫВАЕМ ПРО ЯГОДИЦЫ И ПРО ЖИВОТ",
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Сделать живот плоским",
                    callback_data: "coreWorkout",
                  },
                ],
                [
                  {
                    text: "Подтянуть ноги и ягодицы",
                    callback_data: "bootyWorkout",
                  },
                ],
                [
                  {
                    text: "Узнать про фитнес курс",
                    callback_data: "InformationAboutIntensive",
                  },
                ],
              ],
            },
          }
        );

        setTimeout(async () => {
          await ctx.replyWithPhoto(
            { source: path.join("img", "2tr.jpg") },

            {
              caption: "Слушай попробуй все таки тренировки то",

              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "Живот",
                      callback_data: "coreWorkout",
                    },
                  ],
                  [
                    {
                      text: "ЯГОДИЦЫ",
                      callback_data: "bootyWorkout",
                    },
                  ],
                  [
                    {
                      text: "Узнать про фитнес курс",
                      callback_data: "InformationAboutIntensive",
                    },
                  ],
                ],
              },
            }
          );
        }, 60 * 1000);
        break;

      case "bootyWorkout":
        await ctx.replyWithPhoto(
          { source: path.join("img", "booty.jpg") },
          {
            caption:
              "За упругие и стройные ноги отвечает тонус ягодичных мышц.\n\nЕсли у тебя есть целлюлит, кожа бугристая и неровная, валики над коленями, рыхлые ягодицы и ушки на боковой части бедер, то <b>нужно укреплять ягодичные мышцы</b>.\n\nОткрывай тренировку ниже, чтобы сделать ноги и ягодицы более подтянутыми.",
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Смотреть на YouTube",
                    url: "https://youtu.be/B94b6vk0olY?si=rK9UcdFx6twcItwJ",
                  },
                ],
                [
                  {
                    text: "Открыть в RuTube",
                    url: "https://rutube.ru/video/private/ef60df041391c5e536375bcd09c5c90c/?p=GauIeJp0H88pBeKZkE-kAA",
                  },
                ],
                [
                  {
                    text: "Узнать про фитнес курс",
                    callback_data: "InformationAboutIntensive",
                  },
                ],
              ],
            },
          }
        );
        break;

      case "coreWorkout":
        await ctx.replyWithPhoto(
          { source: path.join("img", "core.JPG") },
          {
            caption:
              "\n\nПлоский живот - это слаженная работа и хороший тонус всех трех слоев мышц пресса.\n\nЕсли у тебя животик выпирает как у беременной на первых месяцах, живот делится на две части в районе пупка или есть валик внизу живота, то <b>нужно укреплять глубокие мышцы пресса</b>.\n\nОткрывай тренировку ниже, чтобы сделать живот более плоским и подтянутым.",
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Смотреть на YouTube",
                    url: "https://youtu.be/N5w7D_p3biE?si=I299-GartCLTCOex",
                  },
                ],
                [
                  {
                    text: "Открыть в RuTube",
                    url: "https://rutube.ru/video/private/631080c53d1eff10964b64328546f102/?p=OhkkmqqAIhKYUnyTnwlebQ",
                  },
                ],
                [
                  {
                    text: "Узнать про фитнес курс",
                    callback_data: "InformationAboutIntensive",
                  },
                ],
              ],
            },
          }
        );
        break;

      case "thirdWorkout":
        await ctx.reply("https://youtu.be/bHhvXY5lHuU?si=f_GktahUohlkleVL", {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Записаться на курс",
                  callback_data: "buyFile",
                },
              ],
            ],
          },
        });

        break;

      case "InformationAboutIntensive":
        await ctx.replyWithPhoto(
          { source: path.join("img", "opisanie.jpg") },
          {
            caption:
              "Фитнес курс для девушек\nТаз, живот и ягодицы\n\nСтарт курса - 5 ноября\nДлительность - 4 недели\n\nТренировки, направленные на улучшение осанки и мобильности позвоночника, укрепление тонуса мышц пресса и ягодичных мышц.\n\nТренировки будут выходить 4 раза в неделю в записи на YouTube и RuTube, заниматься можно в любое удобное для вас время, просто открыв видео на YouTube с компьютера или телефона. Помимо тренировок каждая участница получает от меня краткую диагностику осанки, доступ к закрытому тг каналу с полезной информацией о фигуре и чат участниц, где ты сможешь общаться с другими девушками. Доступ к тренировкам и телеграм каналу после курса - вечный.\n\nСтоимость участия: 4999₽\n\nЕсли ты давно ждала какого-то знака от Вселенной, чтобы начать заниматься своим телом, то возможно стоит создать этот идеальный момент самой и сделать первый шаг навстречу к новой себе.\n\nЖду тебя на курсе!",
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
                    text: "Записаться на курс",
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
          { source: path.join("img", "pokazania.jpg") },
          {
            caption:
              "• Выраженная гипертония\n• ЛОР-заболевания\n• Беременность\n• Артрозы 3-4 степени\n• Спондилолистез\n• Остеопороз\n• Артриты (стадии обострения)\n• Острые состояния, связанные с заболеванием внутренних органов\n\nМожно девушкам на грудном вскармливании и при диастазе 1 степени (расстояние между внутренними краями прямых мышц живота от 4 до 7 см)\n\nЕсли у вас есть травма суставов или деформация позвоночного столба, вы сомневаетесь в том, что тренировки вам подойдут, то опишите мне свою ситуацию http://t.me/lidabakumenko",
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
                    text: "Записаться на курс",
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
          { source: path.join("img", "obarudovanie.jpg") },
          {
            caption:
              "\n\nДля тренировок нужны будут две гантели, массажный ролл и мфр мяч.\n\nДо старта фитнес курса я подскажу, как правильно выбрать оборудование и направлю ссылки на разные маркетплейсы.",
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
                    text: "Записаться на курс",
                    callback_data: "buyFile",
                  },
                ],
              ],
            },
          }
        );
        break;

      case "workout":
        await ctx.replyWithVideo(
          { source: path.join("img", "format.MOV") },
          {
            caption:
              "Старт фитнес курса - 5 ноября\n\nДлительность проекта - 4 недели\n\nВсе тренировки будут выходить 4 раза в неделю в записи на YouTube и RuTube, длительность каждой тренировки до 30 минут, формат «смотри и делай вместе со мной», вы сможете заниматься в любое удобное время, включив тренировку на телефоне или компьютере.\n\nВся полезная информация будет выходить в закрытом тг канале, а в чате фитнес курса вы сможете общаться с другими участницами.\n\nПопробуйте бесплатные тренировки со мной, чтобы точно определиться, подходит ли вам формат фитнес курса.",
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
                    text: "Записаться на курс",
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
