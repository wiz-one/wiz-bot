const ytdl = require('ytdl-core');
const Music = require('../../modules/music.js');

let { searchYoutube } = require('./../../modules/searchYoutube.js');

let dispatcher, videoUrl, youtube;

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

    var queryString = args.join(' ');

    if (!connection) {
      connection = await message.member.voiceChannel.join();
      message.reply('I have successfully connected to the channel!');
    }

    dispatcher = message.guild.voiceConnection.dispatcher;

    if (!global.playlist) {
      global.playlist = new Array();
    }

    videoUrl = queryString;
    youtube = Music.youtube;

    if (!queryString.match(/^https?:\/\/(www.youtube.com|youtube.com)/)) {
      return searchYoutube(queryString, message, "play");
    }

    if (!dispatcher) {
      return Music.play(videoUrl, message);
    }

    if (dispatcher.paused) {
      dispatcher.resume();
      return message.reply('Music Resumed!');
    }

    Music.queueTop(videoUrl, message);
  }
}
