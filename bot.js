const express = require('express');
const Discord = require('discord.js');

const { prefix, token } = require("./config.json");
const PORT = process.env.PORT || 5000;

const client = new Discord.Client();
const server = express()
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

require("./newrelic");
const hm = require("./handlers/handleMessage.js");

client.once('ready', () => {
    console.log('Ready!');
    client.user.setActivity('https://github.com/darren96/wiz-bot', {type: "PLAYING"});
});

client.on('message', message => {
  hm.handleMessage(message);
});

client.login(token);
