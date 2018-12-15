const Discord = require("discord.js");
const { customReactionPrefix } = require("./../config.json");

module.exports = (client = Discord.Client) => {

    reactionHnd = function reactionHnd(message){

      if (!message.content.startsWith(customReactionPrefix) || message.author.bot || message.system) {
        return;
      }

      const command = message.client.commands.get("scr");
      const args = message.content;

      try {
        command.execute(message, args);
      }
      catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
      }
    };
};
