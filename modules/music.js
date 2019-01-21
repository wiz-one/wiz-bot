const EventEmitter = require('events');
const ytdl = require('ytdl-core');
const Discord = require('discord.js');

const streamOptions = { seek: 0, volume: 1 };

let dispatcher;

class Youtube extends EventEmitter {}

youtube = new Youtube();

youtube.on("play", (url, message) => {
      if (!dispatcher || dispatcher.destroyed) {
        return module.exports.play(url, message);
      }
      module.exports.queue(url, message);
    });

module.exports = {
  youtube: youtube,
  play(song, message) {
    let guild_id = message.guild.id;
    let guild = global.guilds.get(guild_id);

    const stream = ytdl(song, { quality: 'highest', filter : 'audioonly' });
    ytdl.getBasicInfo(song)
      .then((info) => {
        var embedMessage = formEmbedMessage(message.author, info, true, guild.playlist);
        message.channel.send(embedMessage);
        guild.currentPlaying = { url:song, title:info.title, author:message.author };
      })
      .catch((err) => {
        return console.log(err);
      });
    
    connection = message.guild.voiceConnection;
    dispatcher = connection.playStream(stream, streamOptions);
  
    dispatcher.on('end', () => {
      let nextSong;
      if (guild.playlist.length) {
        nextSong = guild.playlist.shift();
        if (guild.loop) {
          guild.playlist.push(currentPlaying);
        }
        dispatcher = module.exports.play(nextSong.url, message);
      } else {
        if (guild.loop) {
          dispatcher = module.exports.play(guild.currentPlaying.url, message);
          return;
        }
        guild.currentPlaying = null;
      }
    });
    
    dispatcher.on('error', e => {
      // Catch any errors that may arise
      console.log(e);
    });

    return dispatcher;
  },
  queue(videoUrl, message) {
    let guild_id = message.guild.id;
    let guild = global.guilds.get(guild_id);

    ytdl.getBasicInfo(videoUrl)
      .then((info) => {
        guild.playlist.push({ url:videoUrl, title:info.title, author:message.author });
        var embedMessage = formEmbedMessage(message.author, info, false, guild.playlist);
        message.channel.send(embedMessage);
      })
      .catch((err) => {
        return console.log(err);
      });
    
  },
  queueTop(videoUrl, message) {
    let guild_id = message.guild.id;
    let guild = global.guilds.get(guild_id);

    ytdl.getBasicInfo(videoUrl)
      .then((info) => {
        guild.playlist.unshift({ url:videoUrl, title:info.title, author:message.author });
        var embedMessage = formEmbedMessage(message.author, info, false, guild.playlist);
        message.channel.send(embedMessage);
      })
      .catch((err) => {
        return console.log(err);
      });
  }
}

function formEmbedMessage(author, videoInfo, nowPlaying, playlist) {
  var title = "";
  var embedMessage = new Discord.RichEmbed();
  let thumbnail = getThumbnail(videoInfo);
  if (nowPlaying) {
    title = "Now Playing 🎵";
  } else {
    title = "Song Added 🎶";
  }
  length_seconds = videoInfo.length_seconds;
  length = parseInt(length_seconds/60, 10) + ":" + ("0" + (length_seconds % 60)).slice(-2);
  embedMessage
    .setTitle(title)
    .setDescription(`[${videoInfo.title}](${videoInfo.video_url})`)
    .setColor('#da004e')
    .setThumbnail(thumbnail)
    .setAuthor(author.username, author.avatarURL, author.avatarURL)
    .addField('Author: ', videoInfo.author.name)
    .addField('Length: ', length)
    .addField("Songs in Queue: ", playlist.length)
    .setTimestamp();
  
  return embedMessage;
}

function getThumbnail(videoInfo) {
  var regex = /default/gi;
  let thumbnail = videoInfo.thumbnail_url.replace(regex, "hqdefault");
  return thumbnail;
}
