const music = require('./../modules/music');

let { searchYoutube } = require('./../modules/youtube.js');

module.exports = {
  name: 'youtube',
  description: 'Request the bot to search a video in Youtube.',
  async execute(message, args) {

    connection = message.guild.voiceConnection;

    var queryString = args.join(' ');

    music.youtube.on("display", (url) => {
      message.channel.send(url);
    });

    searchYoutube(queryString, youtube, "display");
  }
}
