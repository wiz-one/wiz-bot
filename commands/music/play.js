const Music = require('../../modules/music.js');

let { searchVideo, getPlaylist } = require('../../modules/youtube.js');

let dispatcher, videoUrl, youtube;

module.exports = {
  name: 'play',
  description: 'Request the bot to play a song in the voice channel.',
  usage: '<song name or youtube video link>\n'
    + '**Examples**:\n'
    + 'IZ*ONE Violeta\n'
    + 'https://www.youtube.com/watch?v=6eEZ7DJMzuk\n',
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
    let guild_id = message.guild.id;
    let guild = global.guilds.get(guild_id);

    var queryString = args.join(' ');

    if (!connection) {
      connection = await message.member.voiceChannel.join();
      message.reply('I have successfully connected to the channel!');
    }

    dispatcher = message.guild.voiceConnection.dispatcher;

    if (!guild.playlist) {
      guild.playlist = new Array();
    }

    videoUrl = queryString;
    youtube = Music.youtube;

    if (queryString.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
      let playlistId = queryString.split("=")[1];
      await getPlaylist(playlistId, message, "playPlaylist");
      return message.channel.send(`✅ Playlist has been added to the queue!`);
		}

    if (!queryString.match(/^https?:\/\/(www.youtube.com|youtube.com)/)) {
      return searchVideo(queryString, message, "play");
    }

    if (!dispatcher) {
      return Music.play(videoUrl, message);
    }

    if (dispatcher.paused) {
      dispatcher.resume();
      return message.reply('Music Resumed!');
    }

    Music.queue(videoUrl, message);
  }
}
