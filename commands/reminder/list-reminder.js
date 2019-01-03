const Discord = require("discord.js");

module.exports = {
  name: 'list-reminder',
  description: 'List reminders that are associated with the server.',
  async execute(message, args) {
    console.log("Arguments received: " + args.join(" "));

    var embedMessage = formEmbedMessage(global.reminders, message.channel.guild.id);
    message.channel.send(embedMessage);
  }
}

function formEmbedMessage(reminders, guild_id) {
  var message = findReminder(reminders, guild_id);
  const embedMessage = new Discord.RichEmbed()
    .setColor('#da004e')
    .setTitle("Reminders")
    .setDescription(message)
    .setTimestamp();
  return embedMessage;
}

function findReminder(reminders, guild_id) {
  var string = "id | title | time \n";
  for (reminder of reminders) {
    if (reminder.guild_id == guild_id) {
      let date = new Date(reminder.time);
      string += "\n" + reminder.id + " | " + reminder.title 
          + " | " + date.toString()  + "\n";
    }
  }
  return string;
}
