const ytdl = require('ytdl-core');
const Discord = require("discord.js");

module.exports = {
  name: 'remove',
  description: 'Request the bot to remove a song with given position in the playlist.',
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

    if (index < guild.playlist && index >= 0) {
      removeMusic(guild, message);
    } else {
      message.reply('Invalid index provided! Index must be existed in the playlist.');
    }
  }
}

function removeMusic(guild, index) {
  let removedMusic = guild.playlist[index];
  guild.playlist.splice(index, 1);
  let videoUrl = removedMusic.url;

  ytdl(videoUrl);
  ytdl.getBasicInfo(videoUrl)
      .then((info) => {
        var embedMessage = formEmbedMessage(info);
        message.channel.send(embedMessage);
        return info.title;
      })
      .catch((err) => {
        return console.log(err);
      });
}

function formEmbedMessage(videoInfo) {
  var embedMessage = new Discord.RichEmbed();
  length_seconds = videoInfo.length_seconds;
  length = parseInt(length_seconds/60, 10) + ":" + ("0" + (length_seconds % 60)).slice(-2);
  embedMessage
    .setTitle("Song Removed!")
    .setDescription(`[${videoInfo.title}](${videoInfo.video.url})`)
    .setColor('#da004e')
    .setThumbnail(videoInfo.thumbnail.url)
    .setTimestamp();
  
  return embedMessage;
}
