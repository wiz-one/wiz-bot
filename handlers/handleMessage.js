const fs = require('fs');
const Discord = require("discord.js");
const { prefix, customReactionPrefix } = require("./../config.json");

const client = new Discord.Client();
client.commands = new Discord.Collection();

//Get all the command name in the command folder and store in commandFiles array
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

//for each of the file in commandFiles, add it to client.commands as a map collection
for (const file of commandFiles) {
  const command = require(`./../commands/${file}`);
  client.commands.set(command.name, command);
}

module.exports = {
  async handleMessage(message) {
    console.log("Handling messages: " + message.content);
    console.log(!message.content.startsWith(customReactionPrefix));
    
    if ((!message.content.startsWith(prefix) && !message.content.startsWith(customReactionPrefix))
        || message.author.bot || message.system || message.channel.type === 'dm') {
      return;
    }
    
    if(message.content.startsWith(customReactionPrefix)) {
      console.log("Handling Custom Reactions");
      client.commands.get("scr").execute(message, message.content);
      return;
    }

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (!client.commands.has(command)) return;

    try {
        client.commands.get(command).execute(message, args);
    }
    catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
  }
}