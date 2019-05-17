const Discord = require("discord.js");
const { dbCredentials } = require("../../config.json");
const pg = require('pg');
const util = require('util');

dbCredentials.password = process.env.db_password;
const pool = new pg.Pool(dbCredentials);
const ONE_MIN = 60000;
const updateQuery = "UPDATE reminders SET title = '%s', time = '%s', mention = '%s' WHERE id = %d";

module.exports = {
  name: 'edit-reminder',
  description: 'Edit a reminder to make updates in its time, title or mention.\n',
  usage: '`<id>` `<argument>` `<new value>`\n'
    + '**Example:** `1 time 2030-12-31 23:59 GMT+8`\n'
    + '**Note:** `argument` can only be either `time`, `title` or `mention`.\n',
  async execute(message, args) {

    console.log("Arguments received: " + args.join(" "));

    if (!args.length) {
      return message.channel.send("You didn't provide any arguments");
    }

    if (args.length < 3) {
      return message.channel.send("You didn't provide the correct arguments.\n"
          + "Format: /edit-reminder <id> <argument> <new value>\n"
          + "Note: argument must be either `mention`, `time` or `title`.");
    }

    var id = args[0];
    var argument = args[1];
    var time, title;
    var author = message.author;

    if (argument != "time" && argument != "title" && argument != "mention") {
      return message.channel.send("Invalid argument. Argument must be either `time`, `title` or `mention`.");
    }

    var reminder = global.reminders.find((value, index, obj) => value.id == id);
    var editedReminder = reminder;

    if (reminder == undefined) {
      return message.channel.send("Invalid ID provided.");
    }

    if (argument == "time") {
      time = new Date(args[2] + " " + args[3] + " " + args[4]);
      
      if (time == "Invalid Date") {
        return message.channel.send("Invalid time set. " 
        + "Time format must be `yyyy-mm-dd hh:MM <your timezone>` (Timezone Example: GMT+8).")
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

    if (argument == "mention") {
      mention = args.slice(2).join(" ");
      editedReminder.mention = mention;
    }

    save(editedReminder);

    var embedMessage = formEmbedMessage(editedReminder, author);
    message.channel.send(embedMessage)

    if (Date.parse(time) - Date.now() <= 30 * ONE_MIN) {
      return setReminder(editedReminder, message);
    }
  }
}

function formEmbedMessage(reminder, author) {
  var date = new Date(reminder.time);
  const embedMessage = new Discord.RichEmbed()
    .setColor('#da004e')
    .setTitle("Reminder Updated")
    .setDescription(reminder.title)
    .setAuthor(author.username, author.avatarURL, author.avatarURL)
    .addField('ID', reminder.id)
    .addField('Time', date.toString())
    .addField('Mention', reminder.mention)
    .setTimestamp();
  return embedMessage;
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
  notification = setTimeout(() => {
    var embedMessage = formReminder(reminder, message.guild.roles);
    message.channel.send(reminder.mention, embedMessage)
    var index = global.reminders.indexOf(reminder);
    global.reminders.splice(index, 1);
   }, timeout);
  var removedNotification = global.notifications.get(reminder.id);
  global.notifications.delete(reminder.id);
  clearTimeout(removedNotification);
  global.notifications.set(reminder.id, notification);
}

async function save(editedReminder) {
  var queryStr = util.format(updateQuery, editedReminder.title, editedReminder.time,
      editedReminder.mention, editedReminder.id);
  pool.query(queryStr);
}
