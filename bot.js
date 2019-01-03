const express = require('express');
const Discord = require('discord.js');

const token = process.env.token || require("./config.json").token;
const PORT = process.env.PORT || 5000;

const client = new Discord.Client();
const server = express()
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

require("./handlers/handleMessage.js")(client);
require("./handlers/initialise.js")(client);
require('./modules/getCommandFiles.js')(client);
require("./newrelic");

client.commands = getCommandFiles('./commands','.js');
console.log("Successfully initialize commands");

client.once('ready', () => {
    client.user.setActivity('IZ*ONE', {type: "WATCHING"});
    initialise();
    console.log('Ready!');
});

client.on('message', message => {
  handleMessage(message);
});

client.login(token); 
