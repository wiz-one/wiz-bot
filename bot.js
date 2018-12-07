const express = require('express');
const Discord = require('discord.js');

const { prefix, token } = require("./config.json");
const PORT = process.env.PORT || 3000;

const client = new Discord.Client();
const server = express()
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

client.once('ready', () => {
    console.log('Ready!');
});

client.on('message', message => {
  if (message.content === `${prefix}ping`) {
    // send back "Pong." to the channel the message was sent in
    message.channel.send('Pong.');
  }
});

client.login(token);
