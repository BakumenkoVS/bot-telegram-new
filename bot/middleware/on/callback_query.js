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
                  text: "Записаться на интенсив",
                  callback_data: "buyFile",
                },
              ],
            ],
          },
        });

        break;

      case "Info":
        await ctx.replyWithPhoto(
          { source: path.join("img", "info.jpg") },

          {
            caption:
              "Грамотная коррекция фигуры - это подтянутое и стройное/сочное тело без проблемных зон и отеков.\n\nВсего 3 ингредиента:\n\n1️⃣ силовая нагрузка (это не только работа с весами, а любые упражнения, в которых ваше тело сопротивляется нагрузке)\n\nдает мышцам тонус, делает тело упругим и подтянутым\n\n2️⃣ техники мфр и самомассажа\n\nулучшение крово- и лимфообращения, снижение отечности в теле\n\n3️⃣ мобильность\n\nулучшение движения во всех суставах и позвоночнике\n\nВсе это уже есть в моем интенсиве: силовые нагрузки, техники мфр и мобильность. Все тренировки в видео формате, ты можешь заниматься в любое время.\n\nДля создания красивой и стройной фигуры нужно всего лишь 30 минут в день и твое сильное желание начать.\n\nНу что, ты в деле? 🔥",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Узнать про интенсив",
                    callback_data: "InformationAboutIntensive",
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

      case "InformationAboutIntensive":
        await ctx.replyWithPhoto(
          { source: path.join("img", "opisanie.jpg") },
          {
            caption:
              "Интенсив для девушек\nТаз, живот и ягодицы\n\nСтарт - 4 марта\nДлительность - 3 недели\nТренировки для девушек, направленные на выравнивание положения таза, улучшение тонуса мышц живота и ягодичных, мфр и работа с осанкой.\n\nИнтенсив будет длится 3 недели. Тренировки будут выходить каждый день в записи, заниматься можно в любое удобное для тебя время, просто открыв видео на ютубе с компьютера или телефона. Помимо тренировок ты получаешь доступ к закрытому тг каналу с полезной информацией о фигуре и чат участниц, где ты сможешь общаться с другими девушками. Доступ к тренировкам и тг каналу после интенсива - вечный.\n\nСтоимость интенсива: 3890₽\nПрисоединяйся скорее, будем тренироваться вместе, я жду тебя ❤️",
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
          { source: path.join("img", "format.jpg") },
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
