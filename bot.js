const Discord = require('discord.js');
const client = new Discord.Client();

client.once('ready', () => {
    console.log('Ready!');
});
client.on('message', message => {
  if (message.content === '!ping') {
    // send back "Pong." to the channel the message was sent in
    message.channel.send('Pong.');
  }
});

client.login('NTE5OTAyNzM4MzkwMzE5MTI2.DutbUw.GuJC9aRHgeO7W2xnggdMlCYRlo8');
