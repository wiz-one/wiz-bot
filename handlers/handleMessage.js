const Discord = require("discord.js");
const { prefix } = require("./../config.json");

module.exports = (client = Discord.Client) => {
  require("../commands/sendCustomReaction.js")(client);
  require("../commands/addCustomReaction.js")(client);

  handleMessage = async function handleMessage(message) {
    console.log("Handling messages: " + message.content);
    
    if (message.content.startsWith === `${prefix}`) {
      return;
    }

		const args = message.content.slice(prefix.length).split(' ');
    const command = args.shift().toLowerCase();
    
    //TODO command list
    switch(command) {
      case "scr":
        sendCustomReaction(message);
        break;
      case "acr":
        addCustomReaction(message);
        break;
      default:
        break;
    }
  }
}