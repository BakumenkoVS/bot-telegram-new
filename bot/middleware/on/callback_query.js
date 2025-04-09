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
        text: "Выбрать тариф",
        callback_data: "Tariff_selection",
      },
    ],
  ],

  programCourseButtons1: [
    [
      {
        text: "Выбрать тариф",
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
        text: "Выбрать тариф",
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
        text: "Выбрать тариф",
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
        text: "Выбрать тариф",
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
        text: "Выбрать тариф",
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
        text: "Выбрать тариф",
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
        text: `Посмотреть тариф 'попробовать')`,
        callback_data: "Low_tariff",
      },
    ],
    [
      {
        text: `Посмотреть тариф 'врываюсь'`,
        callback_data: "Middle_tariff",
      },
    ],
    [
      {
        text: `Посмотреть тариф 'с Лидой'`,
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

  testSelectionButtons: [
    [
      {
        text: "1",
        callback_data: "test_1_stomach",
      },
    ],
    [
      {
        text: "2",
        callback_data: "test_2_stomach",
      },
    ],
  ],

  test1StomachButtons: [
    [
      {
        text: "Расскажи подробнее",
        callback_data: "test_1_stomach_info",
      },
    ],
  ],

  testStomachInfoButtons: [
    [
      {
        text: "С чего начать?",
        callback_data: "program_course1",
      },
    ],
  ],

  test2StomachButtons: [
    [
      {
        text: "Расскажи подробнее",
        callback_data: "test_2_stomach_info",
      },
    ],
  ],

  testSmmButtons: [
    [
      {
        text: "Пройти тест",
        callback_data: "test_selection",
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
        await ctx.reply("Чтобы ознакомиться с описанием тарифа нажмите на кнопку:", {
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
          `Тариф <b>'Попробовать'</b>

Для тех, кто только начинает путь к своей идеальной форме

<b>Цена: ${CONSTANTS.PRICES.LOW_PRICE / 100}₽</b>

<i>Идеально подходит для девушек, которые хотят начать работать над телом, но не готовы сразу инвестировать большую сумму. Это ваш первый шаг к улучшению фигуры и уверенности в себе!</i>

<b>Что включено:</b>

<b>• 10 видео-тренировок</b> (из 16), которые помогут построить красивую и стройную фигуру дома

<b>• Диагностика на старте:</b> посмотрим вашу фигуру, увидим причины проблемных зон и вы поймете, на что делать акцент в тренировках именно вам

<b>• Теория и фишки от Лиды</b> для поддержания стройной фигуры. У вас будет вся необходимая информация для начала пути

<b>• Без чата и обратной связи</b> — вы работаете в своем ритме

<b>• Доступ к курсу - 3 месяца</b>`,
          {
            parse_mode: CONSTANTS.PARSE_MODE,
            reply_markup: {
              inline_keyboard: getButtons.lowTariffButtons,
            },
          }
        );
        break;

      case "Middle_tariff":
        await ctx.reply(
          `Тариф <b>'Врываюсь'</b>

Для тех, кто уверен в своих силах и готов к настоящим изменениям

<b>Цена: ${CONSTANTS.PRICES.MIDDLE_PRICE / 100}₽</b>

<i>Этот тариф для тех, кто настроен серьезно! Вы хотите изменений и готовы к более глубокой работе. Мы будем тренироваться вместе, чтобы достигнуть вашей цели — стройного тела и уверенности в себе.</i>

<b>Что включено:</b>

<b>• 16 видео-тренировок,</b> которые помогут построить красивую и стройную фигуру дома

<b>• 4 тренировки</b> для снижения отечности в теле и гибкости вашей спины

<b>• Диагностика на старте:</b> посмотрим вашу фигуру, увидим причины проблемных зон и вы поймете, на что делать акцент в тренировках именно вам

<b>• Доступ к общему чату участниц</b> — для поддержки и мотивации друг друга

<b>• Проверка техники упражнений</b> и возможность задать вопросы Лиде в общем чате — вы получите рекомендации, которые ускорят ваши результаты

<b>• Доступ к курсу - 3 месяца</b>`,
          {
            parse_mode: CONSTANTS.PARSE_MODE,
            reply_markup: {
              inline_keyboard: getButtons.middleTariffButtons,
            },
          }
        );
        break;

      case "High_tariff":
        await ctx.reply(
          `Тариф <b>'С Лидой'</b>

Для тех, кто хочет работать индивидуально с тренером

<b>Цена: ${CONSTANTS.PRICES.HIGH_PRICE / 100}₽</b>

<i>Если вы хотите персональную поддержку и гарантированный результат, этот тариф для вас! Полный контроль (в хорошем смысле слова) и помощь на каждом этапе курса, чтобы быть уверенным в своем прогрессе и результатах.</i>

<b>Что включено:</b>

<b>• 16 видео-тренировок,</b> которые помогут построить красивую и стройную фигуру дома

<b>• 4 тренировки</b> для снижения отечности в теле и гибкости вашей спины

<b>• Диагностика на старте:</b> посмотрим вашу фигуру, увидим причины проблемных зон и вы поймете, на что делать акцент в тренировках именно вам

<b>• Доступ к общему чату</b> с участницами курса

<b>• Личный чат с Лидой:</b> индивидуальные рекомендации для вас, поддержка 24/7 на каждом этапе курса и возможность получить ответы на все ваши вопросы касаемо тренировок и построения тела

<b>• Доступ к курсу - 6 месяцев</b>`,
          {
            parse_mode: CONSTANTS.PARSE_MODE,
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
          `Курс домашних тренировок для девушек
<b>'Стройная и сочная'</b>

<i>Старт курса - 14 апреля</i>
<i>Длительность - 4 недели</i>

Тренировки направлены на <b>улучшение осанки и мобильности позвоночника</b>, укрепление мышц <b>пресса и ягодиц</b>.

Перед стартом курса каждая участница получает от меня <b>краткую диагностику осанки</b>. 

Вас ждет <b>16+4 тренировок</b>, которые можно выполнять дома, они будут выходить <b>4 раза в неделю</b> в записи, заниматься можно в любое удобное для вас время.

В чате участниц вы сможете <b>задать вопрос</b> мне, получить <b>обратную связь по технике упражнений</b> и общаться с другими девушками. 

<b>Доступ к тренировкам - 3 месяца</b>.`,
          getButtons.programCourseButtons
        );
        break;

      case "program_course1":
        await sendPhotoWithCaption(
          ctx,
          "program.jpg",
          `Курс домашних тренировок для девушек
<b>'Стройная и сочная'</b>

<i>Старт курса - 14 апреля</i>
<i>Длительность - 4 недели</i>

Тренировки направлены на <b>улучшение осанки и мобильности позвоночника</b>, укрепление мышц <b>пресса и ягодиц</b>.

Перед стартом курса каждая участница получает от меня <b>краткую диагностику осанки</b>. 

Вас ждет <b>16+4 тренировок</b>, которые можно выполнять дома, они будут выходить <b>4 раза в неделю</b> в записи, заниматься можно в любое удобное для вас время.

В чате участниц вы сможете <b>задать вопрос</b> мне, получить <b>обратную связь по технике упражнений</b> и общаться с другими девушками. 

<b>Доступ к тренировкам - 3 месяца</b>.`,
          getButtons.programCourseButtons1
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
• Острые состояния, связанные с заболеванием внутренних органов

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
          `Старт курса - 14 апреля 
Длительность - 4 недели

Все тренировки будут выходить 4 раза в неделю в записи на ютубе и рутубе, длительность каждой тренировки до 30 минут, формат «смотри и делай вместе со мной», вы сможете заниматься в любое удобное время, включив тренировку на телефоне или компьютере. Вся полезная информация будет выходить в закрытом тг канале, а в чате фитнес курса вы сможете получить от меня обратную связь по технике, задать вопрос и общаться с другими участницами`,
          getButtons.formatButtons
        );
        break;

      case "test_selection":
        await sendPhotoWithCaption(
          ctx,
          "test_selection.jpg",
          `Как выглядит твой живот?

1 - меня путают с беременной, живот выглядит как надутый шар в течение всего дня

2 - плоский верх живота и сильный валик внизу в районе пупка`,
          getButtons.testSelectionButtons
        );
        break;

      case "test_1_stomach":
        await sendPhotoWithCaption(
          ctx,
          "test_1_stomach.jpg",
          `Если твой живот выглядит как на первых месяцах беременности, то у тебя передний наклон таза (или гиперлордоз), такое нарушение осанки является неочевидной причиной выпирающего живота, которая НЕ связана с лишним весом`,
          getButtons.test1StomachButtons
        );
        break;

      case "test_1_stomach_info":
        await sendPhotoWithCaption(
          ctx,
          "test_1_stomach_info.jpg",
          `*на фото - результат моей клиентки <b>за 4 недели на фитнес-курсе</b>

При таком нарушении осанки, сколько бы ты ни старалась — хоть с диетой, хоть с упражнениями на пресс — живот всё равно будет выпирать. Почему? Потому что <b>дело не в лишнем весе, а в положении тела</b>.

Здесь важно делать <b>упражнения</b>, которые снижают <b>нагрузку с поясничного отдела</b>; вернуть <b>таз в нейтраль</b> и укреплять <b>глубокие мышцы пресса</b>.`,
          getButtons.testStomachInfoButtons
        );
        break;

      case "test_2_stomach":
        await sendPhotoWithCaption(
          ctx,
          "test_2_stomach.jpg",
          `Если твой живот сверху плоский, а внизу около пупка есть "валик", то у тебя задний наклон таза.

Такое нарушение осанки приводит к отечности и запасам жира именно в нижней части живота.`,
          getButtons.test2StomachButtons
        );
        break;

      case "test_2_stomach_info":
        await sendPhotoWithCaption(
          ctx,
          "test_2_stomach_info.jpg",
          `*на фото - <b>результат моей клиентки за 4 недели</b> на курсе

Даже если ты сбросишь вес и будешь качать пресс до посинения, этот упрямый "валик" внизу живота никуда не денется.

Здесь <b>важно работать с осанкой</b> и делать упражнения, которые вернут <b>таз в нейтральное положение</b> и укрепят <b>мышцы тазового дня</b>.`,
          getButtons.testStomachInfoButtons
        );
        break;

      case "tests":
        await sendPhotoWithCaption(
          ctx,
          "test_smm.jpg",
          `Думаешь, плоский живот — это только про «меньше есть и худеть»? А вот и нет!

Всё дело в осанке, которая незаметно саботирует твои усилия. 

<b>Пройди тест "Какой у тебя тип живота?"</b> — и я подскажу, что мешает сделать живот плоским.`,
          getButtons.testSmmButtons
        );
        break;
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
