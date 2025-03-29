const path = require("path");

/**
 * Константы для использования во всем приложении бота
 */
const CONSTANTS = {
  PARSE_MODE: "HTML",
  IMG_DIR: "img",
  CURRENCY: "RUB",
  PRICES: {
    LOW_PRICE: 4990 * 100, // в копейках
    MIDDLE_PRICE: 5990 * 100, // в копейках
    HIGH_PRICE: 14990 * 100, // в копейках
    TEST_PRICE: 65 * 100, // в копейках
  },
  URLS: {
    CONTACT: "@lidabakumenko",
  },
  TIMEOUTS: {
    REMINDER_TIMEOUT: 24 * 60 * 60 * 1000, // 24 часа
    CHOICE_REMINDER_TIMEOUT: 1 * 60 * 1000, // 1 минута для отправки напоминания о выборе
  },
  COMMANDS: {
    START_ADMIN: "/start Lida123123",
  },
};

// Хранилище для таймеров напоминаний
const reminderTimeouts = new Map();

/**
 * Отправляет фотографию с подписью и кнопками
 *
 * @param {Object} ctx - Контекст Telegram
 * @param {String} imageName - Имя файла изображения
 * @param {String} caption - Подпись к фотографии
 * @param {Array} buttons - Массив кнопок
 * @returns {Promise} Результат отправки сообщения
 */
async function sendPhotoWithCaption(ctx, imageName, caption, buttons) {
  return await ctx.replyWithPhoto(
    { source: path.join(CONSTANTS.IMG_DIR, imageName) },
    {
      caption,
      parse_mode: CONSTANTS.PARSE_MODE,
      reply_markup: {
        inline_keyboard: buttons,
      },
    }
  );
}

/**
 * Отправляет счет для оплаты
 *
 * @param {Object} ctx - Контекст Telegram
 * @param {Number} chatId - ID чата
 * @param {String} title - Название товара
 * @param {String} description - Описание товара
 * @param {String} label - Лейбл для кнопки оплаты
 * @param {Number} amount - Сумма в копейках
 * @returns {Promise} Результат отправки счета
 */
async function sendInvoice(ctx, chatId, title, description, label, amount) {
  // Преобразование суммы из копеек в рубли для receipt
  const amountInRubles = amount / 100;

  const invoiceOptions = {
    chat_id: chatId,
    provider_token: process.env.PROVIDER_TOKEN,
    start_parameter: "get_access",
    title: title,
    description: description,
    currency: CONSTANTS.CURRENCY,
    prices: [{ label: label, amount: amount }],
    payload: {
      unique_id: `${chatId}_${Number(new Date())}`,
      provider_token: process.env.PROVIDER_TOKEN,
    },
  };

  // Если включена отправка чеков, добавляем параметры для фискализации
  if (process.env.SEND_RECEIPTS === "true") {
    invoiceOptions.need_email = true;
    invoiceOptions.send_email_to_provider = true;
    invoiceOptions.provider_data = {
      receipt: {
        items: [
          {
            description: description || "Курс по осанке",
            quantity: 1,
            amount: {
              value: amountInRubles.toFixed(2),
              currency: "RUB",
            },
            vat_code: 6,
            payment_mode: "full_payment",
            payment_subject: "service",
          },
        ],
        tax_system_code: 2,
      },
    };
  }

  return await ctx.replyWithInvoice(invoiceOptions);
}

/**
 * Генерирует текущую дату и время в формате строки
 *
 * @returns {String} Отформатированная дата и время
 */
function getCurrentDateTime() {
  const now = new Date();
  return now.toISOString();
}

/**
 * Логирует ошибки с дополнительной информацией
 *
 * @param {Error} error - Объект ошибки
 * @param {String} context - Контекст, где произошла ошибка
 */
function logError(error, context = "") {
  console.error(
    `[${getCurrentDateTime()}] Ошибка ${context ? `в ${context}` : ""}: `,
    error.message
  );
  console.error(error.stack);
}

/**
 * Настраивает отправку отложенного сообщения пользователю через указанное время
 *
 * @param {Object} ctx - Контекст Telegram
 * @param {String} userId - ID пользователя
 * @param {String} message - Текст сообщения, которое будет отправлено
 * @param {Array} buttons - Массив кнопок, которые будут прикреплены к сообщению (если null, кнопки не отправляются)
 * @param {Number} timeout - Время в миллисекундах перед отправкой сообщения (по умолчанию 24 часа)
 * @param {String} reminderType - Тип напоминания (используется как ключ для хранения таймеров)
 * @param {String} photoPath - Путь к изображению (если указан, будет отправлено фото с подписью вместо текстового сообщения)
 */
async function scheduleReminder(
  ctx,
  userId,
  message = "Что хочешь изменить первым?",
  buttons = null,
  timeout = CONSTANTS.TIMEOUTS.CHOICE_REMINDER_TIMEOUT,
  reminderType = "choice",
  photoPath = null
) {
  // Создаем уникальный идентификатор для таймера
  const timeoutKey = `${userId}_${reminderType}`;

  // Если уже есть таймер для этого пользователя, очищаем его
  if (reminderTimeouts.has(timeoutKey)) {
    clearTimeout(reminderTimeouts.get(timeoutKey));
  }

  // Создаем новый таймер для отправки сообщения через указанное время
  const timeoutId = setTimeout(async () => {
    try {
      // Базовые параметры сообщения
      const messageOptions = {
        parse_mode: CONSTANTS.PARSE_MODE,
      };

      // Добавляем кнопки, только если они указаны
      if (buttons) {
        messageOptions.reply_markup = {
          inline_keyboard: buttons,
        };
      }

      // Если указан путь к фото, отправляем фото с подписью, иначе обычное текстовое сообщение
      if (photoPath) {
        // Для фото caption содержит текст подписи
        messageOptions.caption = message;

        // Формируем полный путь к изображению
        const fullPhotoPath = path.join(CONSTANTS.IMG_DIR, photoPath);

        // Отправляем фото с подписью и опциями
        await ctx.telegram.sendPhoto(userId, { source: fullPhotoPath }, messageOptions);
      } else {
        // Отправляем обычное текстовое сообщение с опциями
        await ctx.telegram.sendMessage(userId, message, messageOptions);
      }

      // Удаляем таймер из Map после отправки
      reminderTimeouts.delete(timeoutKey);
    } catch (error) {
      logError(error, `reminder_send_${reminderType}`);
    }
  }, timeout);

  // Сохраняем таймер в Map, чтобы можно было отменить его позже
  reminderTimeouts.set(timeoutKey, timeoutId);
}

/**
 * Отменяет отложенное сообщение для пользователя
 *
 * @param {String} userId - ID пользователя
 * @param {String} reminderType - Тип напоминания (должен совпадать с типом, указанным при создании)
 */
function cancelReminder(userId, reminderType = "choice") {
  const timeoutKey = `${userId}_${reminderType}`;
  if (reminderTimeouts.has(timeoutKey)) {
    clearTimeout(reminderTimeouts.get(timeoutKey));
    reminderTimeouts.delete(timeoutKey);
  }
}

// Экспортируем все утилиты
module.exports = {
  CONSTANTS,
  sendPhotoWithCaption,
  sendInvoice,
  getCurrentDateTime,
  logError,
  scheduleReminder,
  cancelReminder,
};
