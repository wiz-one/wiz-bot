const Discord = require("discord.js");
const { prefix, token } = require("./../config.json");

module.exports = (client = Discord.Client) => {
  require("../commands/sendCustomReaction.js")(client);

  handleMessage = async function handleMessage(message) {
    console.log("Handling messages: " + message.content);
    
    if (message.content.startsWith === `${prefix}`) {
      return;
    }

		let messageArray = message.content.split(" ");
    let command = messageArray[0];
    let args = messageArray.slice(1);

    command = command.slice(prefix.length).toLowerCase();
    
    //TODO command list
    switch(args[0]) {
      case "scr":
        sendCustomReaction(message);
        break;

      default:
        break;
    }
  }
}