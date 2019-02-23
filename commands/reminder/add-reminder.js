const Discord = require("discord.js");
const { dbCredentials } = require("../../config.json");
const pg = require('pg');
const util = require('util');

dbCredentials.password = process.env.db_password;
const pool = new pg.Pool(dbCredentials);
const ONE_MIN = 60000;
const insertQuery = "INSERT INTO reminders (title, time, requested_by, mention, channel_id, guild_id)" + 
    " VALUES ('%s', '%s', '%s', '%s', '%s', '%s') RETURNING id";

module.exports = {
  name: 'remind',
  description: 'Add a reminder to notify the members in the channnel.\n'
    + 'Format: /remind <yyyy-MM-dd hh:mm> <timezone> (mention:@role) <title>\n'
    + 'Arguments in <> are compulsory and () are optional\n'
    + 'Note: without specifying mention, @everyone will be tagged\n',
  usage: 'remind 2020-01-01 22:00 mention:@admin do something',
  async execute(message, args) {

    console.log("Arguments received: " + args.join(" "));

    if (!args.length) {
      return message.channel.send("You didn't provide any arguments");
    }

    if (args.length < 3) {
      return message.channel.send("You didn't provide either the date," 
          + " time or the title of the reminder.");
    }
    
    var time = new Date(args[0] + " " + args[1] + " " + args[2]);
    var requester = message.author.username;
    var author = message.author;
    var titleBegin = 3;
    var mention = "@everyone";

    if (args[3].match(/mention:/g)) {
      titleBegin = 4;
      mention = args[3].split(":")[1];
    }

    var title = args.slice(titleBegin).join(" ");

    if (time == "Invalid Date") {
      return message.channel.send("Invalid time set. " 
          + "Time format must be `yyyy-mm-dd hh:MM <your timezone>` (Timezone Example: GMT+8).")
    }

    if (Date.parse(time) - Date.now() < 0) {
      return message.channel.send("Invalid time set. Time must be set after the current time.");
    }

    var obj = formJsonObj(title, time, requester, mention,
        message.channel.id, message.channel.guild.id);

    reminder = await save(obj);
        
    var embedMessage = formEmbedMessage(reminder, author);
    message.channel.send(embedMessage)

    if (Date.parse(time) - Date.now() <= 30 * ONE_MIN) {
      return setReminder(obj, message);
    }
  }
}

function formJsonObj(title, time, requester, mention, channel_id, 
      guild_id) {
  var data = {
    id: 0,
    title: title,
    time: time,
    requested_by: requester,
    mention: mention,
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
  notification = setTimeout(() => {
    var embedMessage = formReminder(reminder, message.guild.roles);
    message.channel.send(reminder.mention, embedMessage);
    var index = global.reminders.indexOf(reminder);
    global.notifications.delete(reminder.id);
    global.reminders.splice(index, 1);
   }, timeout);
  global.notifications.set(reminder.id, notification);
}

async function save(reminder) {
  var queryStr = util.format(insertQuery, reminder.title, reminder.time,
        reminder.requested_by, reminder.mention, reminder.channel_id, 
        reminder.guild_id);
  await pool.query(queryStr).then((results) => {
      reminder.id = results.rows[0].id;
  });
  global.reminders.push(reminder);
  return reminder;
}
