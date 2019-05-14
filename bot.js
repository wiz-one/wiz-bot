const express = require('express');
const Discord = require('discord.js');

const token = process.env.token || require("./config.json").token;
const PORT = process.env.PORT || 5000;

const client = new Discord.Client();
const server = express()
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

require("./handlers/handleMessage.js")(client);
require("./handlers/initialise.js")(client);
require('./handlers/initVlive.js')(client);
require('./modules/getCommandFiles.js')(client);

client.commands = getCommandFiles('./commands', '.js');

client.once('ready', async () => {
  client.user.setActivity('IZ*ONE', { type: "WATCHING" });
  initialise();

  const VLIVE_CHANNEL = client.channels.find(channel => channel.name === 'vlive');

  if (VLIVE_CHANNEL) {
    await initVlive();
    require('./modules/vlive.js')(client);
    setInterval(() => vlive(VLIVE_CHANNEL), 5000);
  } 

  console.log('Ready!');
});

client.on('message', message => {
  handleMessage(message);
});

client.login(token); 
