const fs = require("fs");
const Discord = require("discord.js");
const { reminderFilePath } = require("../../config.json");

const ONE_MIN = 60000;

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

    var embedMessage = formEmbedMessage(result);
    message.channel.send(embedMessage)

    save();
  }
}

function formEmbedMessage(reminder) {
  var date = new Date(reminder.time);
  const embedMessage = new Discord.RichEmbed()
    .setColor('#da004e')
    .setTitle("Reminder Removed")
    .setDescription(reminder.title)
    .addField('Time', date.toString())
    .setTimestamp();
  return embedMessage;
}

function removeReminder(id) {
  let removingReminder = global.reminders.find(reminder => reminder.id == id);
  let removingReminderIndex = global.reminders.indexOf(removingReminder);
  global.reminders.splice(removingReminderIndex, 1);
  console.log(removingReminderIndex);
  return removingReminder;
}

async function save() {
  var file = __dirname + "/../../" + reminderFilePath;
  obj.reminders = global.reminders;
  json = JSON.stringify(obj);
  fs.writeFileSync(file, json);
}
