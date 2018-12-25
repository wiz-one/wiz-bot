const Discord = require('discord.js');

module.exports = {
  name: 'queue',
  description: 'Request the bot to display the playlist.',
  async execute(message, args) {

    if (!message.member.voiceChannel) {
      return message.reply('You need to join a voice channel first!');
    }

    const permissions = message.member.voiceChannel.permissionsFor(message.client.user);
		if (!permissions.has('CONNECT')) {
			return message.channel.send('I cannot connect to your voice channel, make sure I have the proper permissions!');
		}
		if (!permissions.has('SPEAK')) {
			return message.channel.send('I cannot speak in this voice channel, make sure I have the proper permissions!');
		}

    connection = message.guild.voiceConnection;

    if (!connection) {
      connection = await message.member.voiceChannel.join();
      message.reply('I have successfully connected to the channel!');
    }

    dispatcher = message.guild.voiceConnection.dispatcher;

    if (global.playlist.length || global.currentPlaying) {
      var embedMessage = formEmbedMessage();
      return message.channel.send(embedMessage);
    }

    message.channel.send("There isn't any music in the queue now.");

  }
}

function formEmbedMessage() {
  var embedMessage = new Discord.RichEmbed();
  var string = "";

  embedMessage
    .setTitle("Queue")
    .addField("Now Playing", 
        `[${global.currentPlaying.title}](${global.currentPlaying.url}) | Requested by: ${global.currentPlaying.author}`);

  if (global.playlist.length) {
    var i = 1;
    for (song of global.playlist) {
      string += `\n${i++}. [${song.title}](${song.video_url}) | Requested by: ${song.author.username}\n`;
    }
  
    embedMessage.addField("Coming up: ", string);
  }
    
  embedMessage.addField("Songs in Queue: ", global.playlist.length)
    .setTimestamp();
  
  return embedMessage;
}
