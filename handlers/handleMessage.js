const Discord = require("discord.js");

module.exports = (client = Discord.Client) => {

  require("./command.js")(client);
  require("./../modules/adblock.js")(client);

  handleMessage = async function handleMessage(message) {
    console.log("Handling messages: " + message.content);
  
    adblocker(message);
    command(message);
  };
};