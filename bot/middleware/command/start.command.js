const { bot } = require("../../connections/token.connection.js");
const { saveUser } = require("../../common/sequelize/saveUser.sequelize");

module.exports = bot.start(async (ctx) => {
   try {
      const login = String(ctx.chat.id);
      const username = ctx.chat.username ?? "anon";

      const result = await saveUser(login, username);
      console.log(result);

      return;
   } catch (err) {
      console.log(err);
   }
});
