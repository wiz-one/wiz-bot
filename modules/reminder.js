const Discord = require("discord.js");
const { dbCredentials } = require("./../config.json");
const pg = require('pg');

dbCredentials.password = process.env.db_password;
const pool = new pg.Pool(dbCredentials);
const deleteQuery = "DELETE FROM reminders WHERE id = ";

const ONE_MIN = 60000;

module.exports = (client = Discord.Client) => {
  reminder = async function reminder() {
    setReminder(client);
  }
}

async function sendEmbedMessage(reminder, client) {
  var date = new Date(reminder.time);
  const embedMessage = new Discord.RichEmbed()
    .setColor('#da004e')
    .setTitle('Reminder')
    .setDescription(reminder.title)
    .addField('Time', date.toString())
    .setTimestamp();
  client.channels.find("id", reminder.channel_id)
      .send(reminder.mention, embedMessage);
}

async function setReminder(client) {
  for (reminder of global.reminders) {
    let timeout = Date.parse(reminder.time) - Date.now();
    if (timeout <= 30 * ONE_MIN && timeout > 0) {
      notification = setTimeout(() => {
        var index = global.reminders.indexOf(reminder);
        sendEmbedMessage(reminder, client);
        global.notifications.delete(reminder.id);
        save(reminder.id);
        global.reminders.splice(index, 1);
      }, timeout);
      global.notifications.set(reminder.id, notification);
    }
  }
}

async function save(id) {
  pool.query(deleteQuery + id);
}
