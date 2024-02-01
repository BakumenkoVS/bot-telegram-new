const { bot } = require("../../connections/token.connection.js");
const {
   saveUser,
   getUser,
} = require("../../common/sequelize/user-model.sequelize.js");
const { CronJob } = require("cron");

module.exports = bot.start(async (ctx) => {
   try {
      const login = String(ctx.chat.id);
      const username = ctx.chat.username ?? "anon";

      const result = await saveUser(login, username);

      return;
   } catch (err) {
      console.log(err);
   }
});


