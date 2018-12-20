const ytdl = require('ytdl-core');
const Discord = require('discord.js');
const streamOptions = { seek: 0, volume: 1, bitrate: 720000 };
let dispatcher;

module.exports = {
  name: 'playtop',
  description: 'Request the bot to play a song as the next song in the voice channel.',
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

    var videoUrl = args.join(' ');

    if (!connection) {
      connection = await message.member.voiceChannel.join();
      message.reply('I have successfully connected to the channel!');
    }

    dispatcher = message.guild.voiceConnection.dispatcher;

    if (dispatcher) {

      if (dispatcher.paused) {
        dispatcher.resume();
        return message.reply('Music Resumed!');
      }

      global.playlist.unshift(videoUrl);
      return ytdl.getBasicInfo(videoUrl, (err, info) => {
        if (err) {
          return console.log(err);
        }
        var embedMessage = formEmbedMessage(message.author, info, false);
        message.channel.send(embedMessage);
      });
    }

    play(videoUrl, message);
  }
}

function play(song, message) {
  const stream = ytdl(song, { quality: 'highest', filter : 'audioonly' });
  ytdl.getBasicInfo(song, (err, info) => {
    if (err) {
      return console.log(err);
    }
    var embedMessage = formEmbedMessage(message.author, info, true);
    message.channel.send(embedMessage);
  });
  dispatcher = connection.playStream(stream, streamOptions);

  dispatcher.on('end', () => {
    // The song has finished
    if (global.playlist.length) {
      nextSong = global.playlist.shift();
      dispatcher = play(nextSong, message);
    }
  });
  
  dispatcher.on('error', e => {
    // Catch any errors that may arise
    console.log(e);
  });
}

function formEmbedMessage(author, videoInfo, nowPlaying) {
  var title = "";
  var embedMessage = new Discord.RichEmbed()
  if (nowPlaying) {
    title = "Now Playing 🎵";
  } else {
    title = "Song Added 🎶";
    embedMessage.addField("Songs in Queue: ", global.playlist.length)
  }
  length_seconds = videoInfo.length_seconds;
  length = parseInt(length_seconds/60, 10) + ":" + length_seconds % 60;
  embedMessage
    .setTitle(title)
    .setDescription(`[${videoInfo.title}](${videoInfo.video_url})`)
    .setColor('#da004e')
    .setThumbnail(videoInfo.thumbnail_url)
    .setAuthor(author.username, author.avatarURL, author.avatarURL)
    .addField('Author: ', videoInfo.author.name)
    .addField('Length: ', length)
    .setTimestamp();
  
  return embedMessage;
}
