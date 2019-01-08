const fs = require("fs");
const Discord = require("discord.js");
const { reminderFilePath } = require("../../config.json");

const ONE_MIN = 60000;

module.exports = {
  name: 'remind',
  description: 'Add a reminder to notify the members in the channnel',
  async execute(message, args) {

    console.log("Arguments received: " + args.join(" "));

    if (!args.length) {
      return message.channel.send("You didn't provide any arguments");
    }

    if (args.length < 3) {
      return message.channel.send("You didn't provide either the date, time or the title of the reminder.");
    }

    var title = args.slice(2).join(" ");
    var time = new Date(args[0] + " " + args[1]);
    var requester = message.author.username;
    var author = message.author;

    if (time == "Invalid Date") {
      return message.channel.send("Invalid time set. Time format must be `yyyy-mm-dd hh:MM`.")
    }

    if (Date.parse(time) - Date.now() < 0) {
      return message.channel.send("Invalid time set. Time must be set after the current time.");
    }

    var obj = formJsonObj(title, time, requester, message.channel.id, message.channel.guild.id);
    var embedMessage = formEmbedMessage(title, time, author);
    message.channel.send(embedMessage)

    if (Date.parse(time) - Date.now() <= 30 * ONE_MIN) {
      return setReminder(obj, message);
    }

    save(obj);
  }
}

function formJsonObj(title, time, requester, channel_id, guild_id) {
  var data = {
    title: title,
    time: time,
    requested_by: requester,
    channel_id: channel_id,
    guild_id: guild_id
  };
  return data;
}

function formEmbedMessage(title, time, author) {
  var date = new Date(time);
  const embedMessage = new Discord.RichEmbed()
    .setColor('#da004e')
    .setTitle("Reminder Added")
    .setDescription(title)
    .setAuthor(author.username, author.avatarURL, author.avatarURL)
    .addField('Time', date.toString())
    .setTimestamp();
  return embedMessage;
}

async function save(reminder) {
  var file = __dirname + "/../../" + reminderFilePath;
  var json = {};
  var id = 1;

  if (global.reminders.length) {
    id = global.reminders[global.reminders.length - 1].id + 1;
  }

  reminder.id = id;
  global.reminders.push(reminder);
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
