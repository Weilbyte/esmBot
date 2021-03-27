const client = require("../utils/client.js");
const logger = require("../utils/logger.js");
const messages = require("../messages.json");
const misc = require("../utils/misc.js");

// run when ready
module.exports = async () => {
  // set activity (a.k.a. the gamer code)
  (async function activityChanger() {
    client.editStatus("dnd", {
      name: `${misc.random(messages)} | @${client.user.username} help`,
    });
    setTimeout(activityChanger, 900000);
  })();

  logger.log(`Successfully started ${client.user.username}#${client.user.discriminator} with ${client.users.size} users in ${client.guilds.size} servers.`);
};
