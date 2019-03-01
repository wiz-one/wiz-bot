const EventEmitter = require('events');
const ytdl = require('ytdl-core');
const Discord = require('discord.js');

const streamOptions = { seek: 0, volume: 1, highWaterMark: 1 };
const downloadOptions = { filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1<<25 };

let dispatcher;

class Youtube extends EventEmitter {}

youtube = new Youtube();

youtube.on("display", (url, message) => {
  message.channel.send(url);
});

youtube.on("play", (url, message) => {
      let guild_id = message.guild.id;
      let guild = global.guilds.get(guild_id);
      if (!guild.currentPlaying) {
        return module.exports.play(url, message);
      }
      module.exports.queue(url, message);
    });

youtube.on("playPlaylist", (urls, message) => {
      let guild_id = message.guild.id;
      let guild = global.guilds.get(guild_id);
      for (url of urls) {
        if (!guild.dispatcher || guild.dispatcher.destroyed) {
          module.exports.play(url, message);
          continue;
        }
        module.exports.queue(url, message, true);
      }
    });

module.exports = {
  youtube: youtube,
  play(song, message) {
    let guild_id = message.guild.id;
    let guild = global.guilds.get(guild_id);

    const stream = ytdl(song, downloadOptions);
    ytdl.getBasicInfo(song)
      .then((info) => {
        if (guild.notify) {
          var embedMessage = formEmbedMessage(message.author, info, true, guild.playlist);
          message.channel.send(embedMessage);
        }
        guild.currentPlaying = { url:song, title:info.title, author:message.author };
      })
      .catch((err) => {
        return console.log(err);
      });
    
    connection = message.guild.voiceConnection;
    guild.dispatcher = connection.playStream(stream, streamOptions);
  
    guild.dispatcher.on('end', () => {
      processQueue(message);
    });
    
    guild.dispatcher.on('error', e => {
      // Catch any errors that may arise
      console.log(e);
    });

    return dispatcher;
  },
  queue(videoUrl, message, isPlayist) {
    let guild_id = message.guild.id;
    let guild = global.guilds.get(guild_id);

    ytdl.getBasicInfo(videoUrl)
      .then((info) => {
        guild.playlist.push({ url:videoUrl, title:info.title, author:message.author });

        if (!isPlayist) {
          var embedMessage = formEmbedMessage(message.author, info, false, guild.playlist);
          message.channel.send(embedMessage);
        }
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

function processQueue(message) {
  let guild_id = message.guild.id;
  let guild = global.guilds.get(guild_id);

  if (guild.playlist.length) {
    nextSong = guild.playlist.shift();
    if (guild.loop) {
      guild.playlist.push(guild.currentPlaying);
    }
    guild.dispatcher = module.exports.play(nextSong.url, message);
  } else {
    if (guild.loop) {
      guild.dispatcher = module.exports.play(guild.currentPlaying.url, message);
      return;
    }
    guild.currentPlaying = null;
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
