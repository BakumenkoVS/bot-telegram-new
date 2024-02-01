const { bot } = require("../../connections/token.connection.js");
const { CronJob } = require("cron");
const {
   saveUser,
   getUser,
} = require("../../common/sequelize/user-model.sequelize.js");



module.exports = bot.on("message", async (ctx) => {
   try {
      const users = await getUser();
    //   console.log(users);
    //   const usersId = users.map(({ login }) => String(login));
    //   console.log(usersId);
    //   const send = [];
    //   const job = new CronJob(
    //      "*/4 * * * * *",
    //      function () {
    //         console.log("--------");
    //         ctx.telegram.sendMessage(Number(usersId[0]), "Приходит что то ?");
    //         send.push(usersId[2]);
    //         // if (send.length) {
    //         //    job.stop();
    //         // }
    //      },
    //      null,
    //      true
    //   );
   } catch (err) {
      console.log(err);
   }

});
