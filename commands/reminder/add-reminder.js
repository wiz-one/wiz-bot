const Discord = require("discord.js");
const { dbCredentials } = require("../../config.json");
const pg = require('pg');

dbCredentials.password = process.env.db_password;
const pool = new pg.Pool(dbCredentials);
const ONE_MIN = 60000;
const insertQuery = "INSERT INTO reminders (title, time, requested_by, channel_id, guild_id) VALUES ";

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
    
    var title = args.slice(3).join(" ");
    var time = new Date(args[0] + " " + args[1] + " " + args[2]);
    var requester = message.author.username;
    var author = message.author;

    if (time == "Invalid Date") {
      return message.channel.send("Invalid time set. " 
          + "Time format must be `yyyy-mm-dd hh:MM <your timezone>` (Timezone Example: GMT+8).")
    }

    if (Date.parse(time) - Date.now() < 0) {
      return message.channel.send("Invalid time set. Time must be set after the current time.");
    }

    var obj = formJsonObj(title, time, requester, message.channel.id, message.channel.guild.id);
    var embedMessage = formEmbedMessage(obj, author);
    message.channel.send(embedMessage)

    if (Date.parse(time) - Date.now() <= 30 * ONE_MIN) {
      return setReminder(obj, message);
    }

    save(obj);
  }
}

function formJsonObj(title, time, requester, channel_id, guild_id) {
  var id = 1;

  if (global.reminders.length) {
    id = global.reminders[global.reminders.length - 1].id + 1;
  }

  var data = {
    id: id,
    title: title,
    time: time,
    requested_by: requester,
    channel_id: channel_id,
    guild_id: guild_id
  };
  return data;
}

function formEmbedMessage(reminder, author) {
  var date = new Date(reminder.time);
  const embedMessage = new Discord.RichEmbed()
    .setColor('#da004e')
    .setTitle("Reminder Added")
    .setDescription(reminder.title)
    .setAuthor(author.username, author.avatarURL, author.avatarURL)
    .addField('ID', reminder.id)
    .addField('Time', date.toString())
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
  notification = setTimeout(() => {
    var embedMessage = formReminder(reminder, message.guild.roles);
    message.channel.send("@everyone", embedMessage);
    var index = global.reminders.indexOf(reminder);
    global.reminders.splice(index, 1);
   }, timeout);
  global.reminders.push(reminder);
  global.notifications.set(reminder.id, notification);
}

async function save(reminder) {
  var queryStr = `('${ reminder.title }', '${ reminder.time }', '${ reminder.requested_by }',`
  + `'${ reminder.channel_id }', '${ reminder.guild_id }')`;
  global.reminders.push(reminder);
  pool.query(insertQuery + queryStr);
}
