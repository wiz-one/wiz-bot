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
  client.channels.get(reminder.channel_id)
      .send(reminder.mention, embedMessage);
}

async function setReminder(client) {
  for (reminder of global.reminders) {
    let timeout = Date.parse(reminder.time) - Date.now();
    if (timeout <= 30 * ONE_MIN && timeout > 0) {
      notification = setTimeout((reminder) => {
        console.log(reminder);
        sendEmbedMessage(reminder, client);
        global.notifications.delete(reminder.id);
        save(reminder.id);
        let i = findReminderIndex(reminder.id);
        global.reminders.splice(i, 1);
      }, timeout, reminder);
      global.notifications.set(reminder.id, notification);
    }
  }
}

function findReminderIndex(id) {
  let removingReminder = global.reminders.find(reminder => reminder.id == id);
  let removingReminderIndex = global.reminders.indexOf(removingReminder);
  return removingReminderIndex;
}

async function save(id) {
  pool.query(deleteQuery + id);
}
