const Discord = require("discord.js");
const { prefix, token } = require("./../config.json");
const cooldowns = new Discord.Collection();

module.exports = {
  async handleMessage(message) {
    console.log("Handling messages: " + message.content);
    
    if (!message.content.startsWith(prefix) || message.author.bot || message.system) {
      return;
    }

    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = message.client.commands.get(commandName)
    || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    //Check if the command can be responeded in direct message
    if (!command.dm && message.channel.type === 'dm') return;

    //Check if user enters a command that requires some arguments
    if (command.args && !args.length) {
      let reply = `You didn't provide any arguments, ${message.author}!`;
      
      if (command.usage) {
          reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
      }
      
      return message.channel.send(reply);
    }

    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Discord.Collection());
    }
  
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
  
      if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
      }
    } else {
      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }

    try {
        command.execute(message, args);
    }
    catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
  }
}