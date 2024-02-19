const { bot } = require("../../connections/token.connection.js");
const { saveUser } = require("../../common/sequelize/user-model.sequelize.js");

// module.exports = bot.on(async (ctx) => {
//    try {
//       console.log(ctx.message.from);
//       const login = String(ctx.message.from.id);
//       const username = ctx.message.from.username ?? "anon";
//       console.log(login, username);
//       const result = await saveUser(login, username);

//       return;
//    } catch (err) {
//       console.log(err);
//    }
// });
