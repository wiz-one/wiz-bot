const fs = require("fs");
const Discord = require("discord.js");
const { reminderFilePath } = require("../../config.json");

const ONE_MIN = 60000;

module.exports = {
  name: 'edit-reminder',
  description: 'Edit an existing reminder set.',
  async execute(message, args) {

    console.log("Arguments received: " + args.join(" "));

    if (!args.length) {
      return message.channel.send("You didn't provide any arguments");
    }

    if (args.length < 3) {
      return message.channel.send("You didn't provide the correct arguments.\n"
          + "Format: /edit-reminder <id> <argument> <new value>\n"
          + "Note: argument must be either `time` or `title`.");
    }

    var id = args[0];
    var argument = args[1];
    var time, title;
    var author = message.author;

    if (argument != "time" && argument != "title") {
      return message.channel.send("Invalid argument. Argument must be either `time` or `title`.");
    }

    var reminder = global.reminders.find((value, index, obj) => value.id == id);
    var editedReminder = reminder;

    if (reminder == undefined) {
      return message.channel.send("Invalid ID provided.");
    }

    if (argument == "time") {
      time = new Date(args[2] + " " + args[3]);
      
      if (time == "Invalid Date") {
        return message.channel.send("Invalid time set. Time format must be `yyyy-mm-dd hh:MM`.")
      }

      if (Date.parse(time) - Date.now() < 0) {
        return message.channel.send("Invalid time set. Time must be set after the current time.");
      }
      
      editedReminder.time = new Date(time);
    }
    
    if (argument == "title") {
      title = args.slice(2).join(" ");
      editedReminder.title = title;
    }

    var embedMessage = formEmbedMessage(editedReminder.title, editedReminder.time, author);
    message.channel.send(embedMessage)

    if (Date.parse(time) - Date.now() <= 30 * ONE_MIN) {
      return setReminder(editedReminder, message);
    }

    save(reminder, editedReminder);
  }
}

function formEmbedMessage(title, time, author) {
  var date = new Date(time);
  const embedMessage = new Discord.RichEmbed()
    .setColor('#da004e')
    .setTitle("Reminder Updated")
    .setDescription(title)
    .setAuthor(author.username, author.avatarURL, author.avatarURL)
    .addField('Time', date.toString())
    .setTimestamp();
  return embedMessage;
}

async function save(reminder, editedReminder) {
  var file = __dirname + "/../../" + reminderFilePath;
  var json = {};
  var index = -1;

  index = global.reminders.indexOf(reminder);

  global.reminders.splice(index, 1, editedReminder);
  json.reminders = global.reminders;
  fs.writeFileSync(file, JSON.stringify(json));
}

function formReminder(reminder) {
  const embedMessage = new Discord.RichEmbed()
    .setColor('#da004e')
    .setTitle(`Reminder`)
    .setDescription(reminder.title)
    .addField('Time', reminder.time)
    .setTimestamp();
  return embedMessage;
}

async function setReminder(reminder, message) {
  timeout = Date.parse(reminder.time) - Date.now();
  console.log("Timeout: " + timeout);
  setTimeout(() => {
    var embedMessage = formReminder(reminder, message.guild.roles);
    message.channel.send("@everyone", embedMessage)
   }, timeout);
}
