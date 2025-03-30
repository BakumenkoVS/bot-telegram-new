const { bot } = require("../../connections/token.connection.js");
const path = require("path");
// Импортируем утилиты из общего файла
const {
  CONSTANTS,
  sendPhotoWithCaption,
  sendInvoice,
  logError,
  scheduleReminder,
  cancelReminder,
} = require("../../utils/bot-helpers.js");

// Кнопки для телеграм бота
const getButtons = {
  secondMessageButtons: [
    [
      {
        text: "Хочу такой результат",
        callback_data: "third_message",
      },
    ],
  ],

  // Информационные кнопки курса
  programCourseButtons: [
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
        callback_data: "format",
      },
    ],
    [
      {
        text: "Посмотреть тарифы",
        callback_data: "Tariff_selection",
      },
    ],
  ],

  contraindicationsButtons: [
    [
      {
        text: "Оборудование",
        callback_data: "equipment",
      },
    ],
    [
      {
        text: "Формат занятий",
        callback_data: "format",
      },
    ],
    [
      {
        text: "Вернуться к выбору тарифа",
        callback_data: "Tariff_selection",
      },
    ],
  ],

  equipmentButtons: [
    [
      {
        text: "Противопоказания",
        callback_data: "contraindications",
      },
    ],
    [
      {
        text: "Формат занятий",
        callback_data: "format",
      },
    ],
    [
      {
        text: "Посмотреть тарифы",
        callback_data: "Tariff_selection",
      },
    ],
  ],

  formatButtons: [
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
        text: "Посмотреть тарифы",
        callback_data: "Tariff_selection",
      },
    ],
  ],

  lowTariffButtons: [
    [
      {
        text: "Купить этот тариф",
        callback_data: "buy_low",
      },
    ],
    [
      {
        text: "Посмотреть тарифы",
        callback_data: "Tariff_selection",
      },
    ],
  ],

  middleTariffButtons: [
    [
      {
        text: "Купить этот тариф",
        callback_data: "buy_middle",
      },
    ],
    [
      {
        text: "Посмотреть тарифы",
        callback_data: "Tariff_selection",
      },
    ],
  ],

  highTariffButtons: [
    [
      {
        text: "Купить этот тариф",
        callback_data: "buy_high",
      },
    ],
    [
      {
        text: "Посмотреть тарифы",
        callback_data: "Tariff_selection",
      },
    ],
  ],

  thirdWorkoutButtons: [
    [
      {
        text: "Я в деле!",
        callback_data: "Tariff_selection",
      },
    ],
    [
      {
        text: "Посмотреть программу",
        callback_data: "program_course",
      },
    ],
    [
      {
        text: "Задать вопрос",
        url: "http://t.me/mursova_k",
      },
    ],
  ],

  // Добавляем кнопки для выбора тарифа
  priceSelectionButtons: [
    [
      {
        text: `Тариф 'попробовать' (${CONSTANTS.PRICES.LOW_PRICE / 100}₽)`,
        callback_data: "Low_tariff",
      },
    ],
    [
      {
        text: `Тариф 'врываюсь' (${CONSTANTS.PRICES.MIDDLE_PRICE / 100}₽)`,
        callback_data: "Middle_tariff",
      },
    ],
    [
      {
        text: `Тариф 'с Лидой' (${CONSTANTS.PRICES.HIGH_PRICE / 100}₽)`,
        callback_data: "High_tariff",
      },
    ],
  ],

  // Кнопки с вариантами выбора для отложенного сообщения
  choiceButtons: [
    [{ text: "👙 Убрать выпирающий живот", callback_data: "choice_belly" }],
    [{ text: "🍑 Подтянуть ноги и ягодицы", callback_data: "choice_booty" }],
    [{ text: "🐈 Улучшить свою осанку", callback_data: "choice_posture" }],
  ],

  bootyButtons: [[{ text: "Расскажи подробнее", callback_data: "info_booty" }]],

  bellyButtons: [[{ text: "Расскажи подробнее", callback_data: "info_belly" }]],

  postureButtons: [[{ text: "Расскажи подробнее", callback_data: "info_posture" }]],

  infoButtons: [
    [
      {
        text: "Я в деле!",
        callback_data: "Tariff_selection",
      },
    ],
    [
      {
        text: "Посмотреть программу",
        callback_data: "program_course",
      },
    ],
  ],
};

// Обработчик callback query
const callbackQueryHandler = async (ctx) => {
  try {
    const callbackData = ctx.update.callback_query.data;
    const userId = ctx.from.id.toString();

    switch (callbackData) {
      case "Tariff_selection":
        // Вместо прямой отправки счета, показываем меню выбора тарифа
        await ctx.reply("Выберите подходящий тариф:", {
          parse_mode: CONSTANTS.PARSE_MODE,
          reply_markup: {
            inline_keyboard: getButtons.priceSelectionButtons,
          },
        });
        break;

      case "buy_low":
        await sendInvoice(
          ctx,
          ctx.update.callback_query.message.chat.id,
          "Покупка курса",
          "Фитнес курс тариф 'попробовать'",
          "Тариф попробовать",
          CONSTANTS.PRICES.LOW_PRICE
        );
        break;

      case "buy_middle":
        await sendInvoice(
          ctx,
          ctx.update.callback_query.message.chat.id,
          "Покупка курса",
          "Фитнес курс тариф 'врываюсь'",
          "Тариф врываюсь",
          CONSTANTS.PRICES.MIDDLE_PRICE
        );
        break;

      case "buy_high":
        await sendInvoice(
          ctx,
          ctx.update.callback_query.message.chat.id,
          "Покупка курса",
          "Фитнес курс тариф 'с Лидой'",
          "Тариф с Лидой",
          CONSTANTS.PRICES.HIGH_PRICE
        );
        break;

      case "second_message":
        await sendPhotoWithCaption(
          ctx,
          "second_message.jpg",
          "Представь, что через месяц:\n✔️ Ты больше не втягиваешь живот — он сам остаётся плоским.\n✔️ Ягодицы подтянулись, целлюлит и отеки ушли\n✔️ У тебя гибкая спина и красивая осанка\n\nИ это без зала и сложных схем — только 30 минут в день, занимаясь дома",
          getButtons.secondMessageButtons
        );

        await scheduleReminder(
          ctx,
          userId,
          "Какая зона в теле волнует тебя больше всего?",
          getButtons.choiceButtons,
          CONSTANTS.TIMEOUTS.CHOICE_REMINDER_TIMEOUT,
          "choice",
          "choice.jpg"
        );
        break;

      case "third_message":
        // Отменяем отложенное сообщение, т.к. пользователь нажал на кнопку "Хочу такой результат"
        cancelReminder(userId, "choice");

        await sendPhotoWithCaption(
          ctx,
          "third_message.jpg",
          "Ого, ты в шаге от того, чтобы стать той самой — с плоским животиком и красивой осанкой, у которой все спрашивают: «Как ты это сделала?»",
          getButtons.thirdWorkoutButtons
        );
        break;

      case "choice_booty":
        await sendPhotoWithCaption(
          ctx,
          "booty.jpg",
          `За упругие и стройные ноги отвечает тонус ягодичных мышц.

Если у тебя есть целлюлит, кожа бугристая и неровная, валики над коленями, рыхлые ягодицы и ушки на боковой части бедер, то нужно укреплять ягодичные мышцы.`,
          getButtons.bootyButtons
        );
        break;

      case "info_booty":
        await sendPhotoWithCaption(
          ctx,
          "info_booty.png",
          `Чтобы убрать целлюлит, дряблость и подтянуть попу, мало просто махать ногами или делать ягодичный мостик. 

Нужна правильная нагрузка на ягодицы — не переживай, зал нам не понадобиться! Я покажу тебе все эффективные упражнения, которые включают эти мышцы и делают попу упругой и сочной.`,
          getButtons.infoButtons
        );
        break;

      case "choice_belly":
        await sendPhotoWithCaption(
          ctx,
          "belly.jpg",
          "Плоский живот - это слаженная работа и хороший тонус всех трех слоев мышц пресса.\n\nЕсли у тебя животик выпирает как у беременной на первых месяцах, живот делится на две части в районе пупка или есть валик внизу живота, то нужно укреплять глубокие мышцы пресса.",
          getButtons.bellyButtons
        );
        break;

      case "info_belly":
        await sendPhotoWithCaption(
          ctx,
          "info_belly.jpg",
          `Чтобы убрать живот и сделать его плоским,  просто закачивать пресс — не поможет, это может только усилить выпирание живота. Важно работать с осанкой: положением таза, мобильностью всех отделов позвоночника и укреплять глубокие мышцы пресса и тазового дна.

В курсе из 16 тренировок мы начнем с простого: настроим дыхание, научимся включать глубокие мышцы пресса и только после освоения этих навыков перейдем к упражнениям и шаг за шагом добьемся плоского животика`,
          getButtons.infoButtons
        );
        break;

      case "choice_posture":
        await sendPhotoWithCaption(
          ctx,
          "posture.WEBP",
          `Сутулая спина и выдвинутая вперед шея - это то, что прибавляет возраст любой девушке

Если ты хочешь избавиться от холки, двойного подбородка и сутулой осанки, важно работать не только с грудном отделом, а комплексно со всем телом и всеми отделами позвоночника, именно такой подход помогает скорректировать осанку и избавиться от проблемных зон.`,
          getButtons.postureButtons
        );
        break;

      case "info_posture":
        await sendPhotoWithCaption(
          ctx,
          "info_posture.jpg",
          `Чтобы убрать сутулость, двойной подбородок и холку, недостаточно делать массаж лица и упражнения для грудного отдела.

Нужно улучшать мобильность всех отделов позвоночника — именно работа со всем телом убирает сутулость, холку и двойной подбородок, а заодно делает осанку красивой, будто тебе снова на 10 лет меньше!`,
          getButtons.infoButtons
        );
        break;
      case "Low_tariff":
        await ctx.reply(
          `Тариф «Попробовать»
Для тех, кто только начинает путь к своей фигуре
Цена: ${CONSTANTS.PRICES.LOW_PRICE / 100}₽

Идеально подходит для девушек, которые хотят начать работать над телом, но не готовы сразу инвестировать большую сумму. Это ваш первый шаг к улучшению фигуры и уверенности в себе!

Что включено:
• 10 видео-тренировок (из 16), которые помогут построить красивую и стройную фигуру дома
• Диагностика на старте: посмотрим вашу фигуру, увидим причины проблемных зон и вы поймете на что делать акцент в тренировках именно вам
• Теория и фишки от Лиды для поддержания стройной фигуры. У вас будет вся необходимая информация для начала пути.
• Без чата и обратной связи — вы работаете в своем ритме.
• Доступ к курсу - 3 месяца.`,
          {
            reply_markup: {
              inline_keyboard: getButtons.lowTariffButtons,
            },
          }
        );
        break;

      case "Middle_tariff":
        await ctx.reply(
          `Тариф «Врываюсь»
Для тех, кто уверен в своих силах и готов к настоящим изменениям
Цена: ${CONSTANTS.PRICES.MIDDLE_PRICE / 100}₽

Этот тариф для тех, кто настроен серьезно! Вы хотите изменений и готовы к более глубокой работе. Мы будем тренироваться вместе, чтобы достигнуть вашей цели — стройного тела и уверенности в себе.

Что включено:
• 16 видео-тренировок, которые помогут построить красивую и стройную фигуру дома
• 4 тренировки для снижения отечности  в теле и гибкости вашей спины
• Диагностика на старте: посмотрим вашу фигуру, увидим причины проблемных зон и вы поймете на что делать акцент в тренировках именно вам
• Доступ к общему чату участниц — для поддержки и мотивации друг друга
• Проверка техники упражнений и возможность задать вопросы Лиде в общем чате — вы получите рекомендации, которые ускорят ваши результаты.
• Доступ к курсу - 3 месяца`,
          {
            reply_markup: {
              inline_keyboard: getButtons.middleTariffButtons,
            },
          }
        );
        break;

      case "High_tariff":
        await ctx.reply(
          `Тариф «С Лидой»
Для тех, кто хочет работать индивидуально с тренером
Цена: ${CONSTANTS.PRICES.HIGH_PRICE / 100}₽

Если вы хотите персональную поддержку и гарантированный результат, этот тариф для вас! Полный контроль (в хорошем смысле слова) и помощь на каждом этапе курса, чтобы быть уверенным в своем прогрессе и результатах.

Что включено:
• 16 видео-тренировок, которые помогут построить красивую и стройную фигуру дома
• 4 тренировки для снижения отечности в теле и гибкости вашей спины
• Диагностика на старте: посмотрим вашу фигуру, увидим причины проблемных зон и вы поймете на что делать акцент в тренировках именно вам
• Доступ к общему чату с участницами курса
• Личный чат с Лидой: индивидуальные рекомендации для вас, поддержка 24/7 на каждом этапе курса и возможность получить ответы на все ваши вопросы касаемо тренировок и построения тела.
• Доступ к курсу - 6 месяцев`,
          {
            reply_markup: {
              inline_keyboard: getButtons.highTariffButtons,
            },
          }
        );
        break;

      case "program_course":
        await sendPhotoWithCaption(
          ctx,
          "program.jpg",
          `Курс тренировок для девушек 
«Стройная и сочная»

Старт курса - 14 апреля
Длительность - 4 недели

Тренировки, направленные на улучшение осанки и мобильности позвоночника, укрепление тонуса мышц пресса и ягодичных мышц.

Перед стартом курса каждая участница получает от меня краткую диагностику осанки. Вас ждет 16+4 тренировок, которые можно выполнять дома, они будут выходить 4 раза в неделю в записи, заниматься можно в любое удобное для вас время. В чате участниц вы сможете задать вопрос мне, получить обратную связь по технике упражнений и общаться общаться с другими девушками. Доступ к тренировкам - 3 месяца.`,
          getButtons.programCourseButtons
        );
        break;

      case "contraindications":
        await sendPhotoWithCaption(
          ctx,
          "contraindications.jpg",
          `• Выраженная гипертония
• ЛОР-заболевания
• Беременность
• Артрозы 3-4 степени
• Спондилолистез
• Остеопороз
• Артриты (стадии обострения)
• Острые состояния, связанные с заболеванием внутренних органов

Можно девушкам на грудном вскармливании и при диастазе 1 степени (расстояние между внутренними краями прямых мышц живота от 4 до 7 см)

Если у вас есть травма суставов или деформация позвоночного столба, вы сомневаетесь в том, что тренировки вам подойдут, то опишите мне свою ситуацию http://t.me/lidabakumenko`,
          getButtons.contraindicationsButtons
        );
        break;

      case "equipment":
        await sendPhotoWithCaption(
          ctx,
          "equipment.jpeg",
          `Для тренировок нужны будут две гантели, массажный ролл и мфр мяч.

До старта фитнес курса я подскажу, как правильно выбрать оборудование и направлю ссылки на разные маркетплейсы.`,
          getButtons.equipmentButtons
        );
        break;

      case "format":
        await sendPhotoWithCaption(
          ctx,
          "format.jpg",
          `Старт фитнес курса - 14 апреля 
Длительность проекта - 4 недели

Все тренировки будут выходить 4 раза в неделю в записи на ютубе и рутубе, длительность каждой тренировки до 30 минут, формат «смотри и делай вместе со мной», вы сможете заниматься в любое удобное время, включив тренировку на телефоне или компьютере. Вся полезная информация будет выходить в закрытом тг канале, а в чате фитнес курса вы сможете получить от меня обратную связь по технике, задать вопрос и общаться с другими участницами`,
          getButtons.formatButtons
        );
    }
  } catch (error) {
    logError(error, "callback_query_handler");
  }
};

// Экспортируем кнопки и регистрируем обработчик
module.exports = {
  getButtons,
  // Регистрируем обработчик для callback_query
  handler: bot.on("callback_query", callbackQueryHandler),
};
