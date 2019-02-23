const Discord = require("discord.js");
const { dbCredentials } = require("../../config.json");
const pg = require('pg');

dbCredentials.password = process.env.db_password;
const pool = new pg.Pool(dbCredentials);
const deleteQuery = "DELETE FROM reminders WHERE id = ";

module.exports = {
  name: 'remove-reminder',
  description: 'Remove a reminder based on the id given',
  async execute(message, args) {

    console.log("Arguments received: " + args.join(" "));

    if (!args.length) {
      return message.channel.send("You didn't provide any arguments");
    }

    var id = args[0];

    var result = removeReminder(id);

    if (result == undefined) {
      return message.channel.send("Index not found!");
    }

    save(id);

    var embedMessage = formEmbedMessage(result);
    message.channel.send(embedMessage)
  }
}

function formEmbedMessage(reminder) {
  var date = new Date(reminder.time);
  const embedMessage = new Discord.RichEmbed()
    .setColor('#da004e')
    .setTitle("Reminder Removed")
    .setDescription(reminder.title)
    .addField('Time', date.toString())
    .addField('Mention', reminder.mention)
    .setTimestamp();
  return embedMessage;
}

function removeReminder(id) {
  let removingReminder = global.reminders.find(reminder => reminder.id == id);
  let removingReminderIndex = global.reminders.indexOf(removingReminder);
  clearTimeout(global.notifications.get(removingReminder.id));
  global.notifications.delete(removingReminder.id);
  global.reminders.splice(removingReminderIndex, 1);
  return removingReminder;
}

async function save(id) {
  pool.query(deleteQuery + id);
}
