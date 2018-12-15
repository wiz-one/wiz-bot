const Discord = require("discord.js");

const { prefix, customReactionPrefix } = require("./../config.json");

module.exports = (client = Discord.Client) => {

  require("./command.js")(client);
  require("./reaction.js")(client);
  require("./../modules/adblock.js")(client);
  
  handleMessage = async function handleMessage(message) {
    console.log("Handling messages: " + message.content);

    adblocker(message);
    reaction(message);
    command(message);
  };
};