const ytdl = require('ytdl-core');
const Discord = require("discord.js");

module.exports = {
  name: 'nowplaying',
  description: 'Request the bot to display the info of this song.',
  async execute(message, args) {

    if (!message.member.voiceChannel) {
      return message.reply('You need to join a voice channel first!');
    }

    connection = message.guild.voiceConnection;

    if (!connection) {
      message.reply('I am not connected to the channel!');
    }

    if (global.currentPlaying) {
      sendInfo(global.currentPlaying.url, message);
    } else {
      message.reply('There isn\'t any music playing!');
    }
  }
}

function sendInfo(videoUrl, message) {
  ytdl(videoUrl);
  ytdl.getBasicInfo(videoUrl)
      .then((info) => {
        var embedMessage = formEmbedMessage(message.author, info);
        message.channel.send(embedMessage);
        return info.title;
      })
      .catch((err) => {
        return console.log(err);
      });
}

function formEmbedMessage(author, videoInfo) {
  var embedMessage = new Discord.RichEmbed();
  length_seconds = videoInfo.length_seconds;
  length = parseInt(length_seconds/60, 10) + ":" + ("0" + (length_seconds % 60)).slice(-2);
  embedMessage
    .setTitle("Now Playing!")
    .setDescription(`[${videoInfo.title}](${videoInfo.video_url})`)
    .setColor('#da004e')
    .setThumbnail(videoInfo.thumbnail_url)
    .addField('Author: ', videoInfo.author.name)
    .addField('Length: ', length)
    .addField("Songs in Queue: ", global.playlist.length)
    .setTimestamp();
  
  return embedMessage;
}
