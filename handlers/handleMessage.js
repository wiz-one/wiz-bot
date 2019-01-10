const Discord = require("discord.js");

module.exports = (client = Discord.Client) => {

  require("./command.js")(client);
  require("./reaction.js")(client);
  require("./../modules/adblock.js")(client);
  require("./../modules/reply.js")(client);
  
  handleMessage = async function handleMessage(message) {
    console.log("Handling messages: " + message.content);

    adblocker(message);
    reactionHnd(message);
    reply(message);
    command(message);
  };
};