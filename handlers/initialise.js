const fs = require("fs");
const Discord = require("discord.js");
const { reminderFilePath, dbCredentials } = require("./../config.json");
const pg = require('pg');

dbCredentials.password = process.env.db_password;
const pool = new pg.Pool(dbCredentials);

const ONE_MIN = 60000;

let guild = { 
  playlist: new Array(), 
  currentPlaying: null,
  loop: false
};

module.exports = (client = Discord.Client) => {
  initialise = async function initialise() {
    require("./../modules/reminder.js")(client);

    console.log("Initialising");

    await readReminders().then((results) => global.reminders = results);
    global.notifications = new Map();

    setInterval(reminder, 30 * ONE_MIN);
    reminder();
    initGuildsVariables(client).then((results) => {
        global.guilds = results;
      });

  }
}

// function readReminders() {
//   var file = __dirname + "/../" + reminderFilePath;
//   obj = JSON.parse(fs.readFileSync(file, 'utf8'));
//   return obj.reminders;
// }
async function initGuildsVariables(client) {
  let guilds = new Map();
  client.guilds.forEach((value, key, arr) => {
    guilds.set(key, guild);
  })
  
  return guilds;
}

function readReminders() {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT * FROM reminders`, (err, res) => {
      if (err) {
        reject(console.error(err));
      }
      resolve(res.rows);
    });
  });
}
