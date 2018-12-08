const express = require('express');
const Discord = require('discord.js');

const { prefix, token } = require("./config.json");
const PORT = process.env.PORT || 5000;

const client = new Discord.Client();
const server = express()
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

require("./handlers/handleMessage.js")(client);

client.once('ready', () => {
    console.log('Ready!');
});

client.on('message', message => {
  handleMessage(message);
});

client.login(token);
