const express = require('express');
const Discord = require('discord.js');
const fs = require('fs');

const { token } = require("./config.json");
const PORT = process.env.PORT || 5000;

const client = new Discord.Client();
const server = express()
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

require("./handlers/handleMessage.js")(client);
require("./newrelic");

client.once('ready', () => {
    console.log('Ready!');
    client.user.setActivity('IZ*ONE', {type: "WATCHING"});
});

client.commands = new Discord.Collection();

//Get all the command name in the command folder and store in commandFiles array
var commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

//Get all the music command name in the command/music folder and store in concatenate array
commandFiles = commandFiles.concat(fs.readdirSync('./commands/music')
    .filter(file => file.endsWith('.js'))
    .map(file => "music/" + file));

//for each of the file in commandFiles, add it to client.commands as a map collection
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}
console.log("Successfully initialize commands");


client.on('message', message => {
  handleMessage(message);
});

client.login(token);
