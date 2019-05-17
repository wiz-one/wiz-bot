const ytdl = require('ytdl-core');
const Discord = require("discord.js");

module.exports = {
  name: 'remove',
  description: 'Request the bot to remove a song with given position in the playlist.',
  usage: '<index of the song in the queue>\n'
  + '**Example**: 4\n',
  async execute(message, args) {

    if (!message.member.voiceChannel) {
      return message.reply('You need to join a voice channel first!');
    }

    connection = message.guild.voiceConnection;
    let guild_id = message.guild.id;
    let guild = global.guilds.get(guild_id);
    let index = args[0] - 1;

    if (!connection) {
      message.reply('I am not connected to the channel!');
    }

    if (index < guild.playlist.length && index >= 0) {
      removeMusic(guild, index, message);
    } else {
      message.reply('Invalid index provided! Index must be existed in the playlist.');
    }
  }
}

function removeMusic(guild, index, message) {
  let removedMusic = guild.playlist[index];
  let videoUrl = removedMusic.url;
  guild.playlist.splice(index, 1);

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
  let thumbnail = getThumbnail(videoInfo);
  length_seconds = videoInfo.length_seconds;
  length = parseInt(length_seconds/60, 10) + ":" + ("0" + (length_seconds % 60)).slice(-2);
  embedMessage
    .setTitle("Song Removed!")
    .setDescription(`[${videoInfo.title}](${videoInfo.video_url})`)
    .setColor('#da004e')
    .setThumbnail(thumbnail)
    .setAuthor(author.username, author.avatarURL, author.avatarURL)
    .setTimestamp();
  
  return embedMessage;
}

function getThumbnail(videoInfo) {
  var regex = /default/gi;
  let thumbnail = videoInfo.thumbnail_url.replace(regex, "hqdefault");
  return thumbnail;
}
