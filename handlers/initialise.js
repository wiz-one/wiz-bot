const fs = require("fs");
const Discord = require("discord.js");

const { reminderFilePath } = require("./../config.json");

const ONE_MIN = 60000;

module.exports = (client = Discord.Client) => {
  initialise = function initialise() {
    require("./../modules/reminder.js")(client);

    console.log("Initialising");

    global.reminders = readReminders();

    setInterval(reminder, 3 * ONE_MIN);
    reminder();
  }
}

function readReminders() {
  var file = __dirname + "/../" + reminderFilePath;
  obj = JSON.parse(fs.readFileSync(file, 'utf8'));
  return obj.reminders;
}
