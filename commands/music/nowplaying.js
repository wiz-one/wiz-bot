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
    let guild_id = message.guild.id;
    let guild = global.guilds.get(guild_id);

    if (!connection) {
      message.reply('I am not connected to the channel!');
    }

    if (guild.currentPlaying) {
      sendInfo(guild, message);
    } else {
      message.reply('There isn\'t any music playing!');
    }
  }
}

function sendInfo(guild, message) {
  let videoUrl = guild.currentPlaying.url;
  ytdl(videoUrl);
  ytdl.getBasicInfo(videoUrl)
      .then((info) => {
        var embedMessage = formEmbedMessage(guild, info);
        message.channel.send(embedMessage);
        return info.title;
      })
      .catch((err) => {
        return console.log(err);
      });
}

function formEmbedMessage(guild, videoInfo) {
  var embedMessage = new Discord.RichEmbed();
  length_seconds = videoInfo.length_seconds;
  length = parseInt(length_seconds/60, 10) + ":" + ("0" + (length_seconds % 60)).slice(-2);
  let thumbnail = getThumbnail(videoInfo);
  console.log(thumbnail);
  embedMessage
    .setTitle("Now Playing!")
    .setDescription(`[${videoInfo.title}](${videoInfo.video_url})`)
    .setColor('#da004e')
    .setThumbnail(thumbnail)
    .addField('Author: ', videoInfo.author.name)
    .addField('Length: ', length)
    .addField("Songs in Queue: ", guild.playlist.length)
    .setTimestamp();
  
  return embedMessage;
}

function getThumbnail(videoInfo) {
  var regex = /default/gi;
  let thumbnail = videoInfo.thumbnail_url.replace(regex, "hqdefault");
  console.log(thumbnail);
  return thumbnail;
}
