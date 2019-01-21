const Discord = require('discord.js');
let guild_id, guild;

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
    guild_id = message.guild.id;

    guild = global.guilds.get(guild_id);

    if (!connection) {
      connection = await message.member.voiceChannel.join();
      message.reply('I have successfully connected to the channel!');
    }

    dispatcher = message.guild.voiceConnection.dispatcher;

    if (guild.playlist.length || guild.currentPlaying) {
      var embedMessage = formEmbedMessage(guild);
      return message.channel.send(embedMessage);
    }

    message.channel.send("There isn't any music in the queue now.");

  }
}

function formEmbedMessage(guild) {
  var embedMessage = new Discord.RichEmbed();
  var string = "";

  embedMessage
    .setTitle("Queue")
    .addField("Now Playing", 
        `[${guild.currentPlaying.title}](${guild.currentPlaying.url}) | ` 
        + `Requested by: ${guild.currentPlaying.author}`);

  if (guild.playlist.length) {
    var i = 1;
    for (song of guild.playlist) {
      string += `\n${i++}. [${song.title}](${song.video_url}) | ` 
          + `Requested by: ${song.author.username}\n`;
    }
  
    embedMessage.addField("Coming up: ", string);
  }
    
  embedMessage.addField("Songs in Queue: ", guild.playlist.length)
    .setTimestamp();
  
  return embedMessage;
}
