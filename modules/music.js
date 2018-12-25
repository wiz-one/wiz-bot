const EventEmitter = require('events');
const ytdl = require('ytdl-core');
const Discord = require('discord.js');

const streamOptions = { seek: 0, volume: 1 };

let dispatcher;

class Youtube extends EventEmitter {}

youtube = new Youtube();

youtube.on("play", (url, message) => {
      if (!dispatcher) {
        return module.exports.play(url, message);
      }
      module.exports.queue(url, message);
    });

module.exports = {
  youtube: youtube,
  play(song, message) {
    const stream = ytdl(song, { quality: 'highest', filter : 'audioonly' });
    ytdl.getBasicInfo(song)
      .then((info) => {
        var embedMessage = formEmbedMessage(message.author, info, true);
        message.channel.send(embedMessage);
        global.currentPlaying = { url:song, title:info.title, author:message.author }
      })
      .catch((err) => {
        return console.log(err);
      });
    
    connection = message.guild.voiceConnection;
    dispatcher = connection.playStream(stream, streamOptions);
  
    dispatcher.on('end', () => {
      let nextSong;
      if (global.playlist.length) {
        nextSong = global.playlist.shift();
        dispatcher = module.exports.play(nextSong.url, message);
        if (global.loop) {
          global.playlist.push(nextSong);
        }
      } else {
        if (global.loop) {
          dispatcher = module.exports.play(global.currentPlaying.url, message);
          return;
        }
        global.currentPlaying = null;
      }
    });
    
    dispatcher.on('error', e => {
      // Catch any errors that may arise
      console.log(e);
    });

    return dispatcher;
  },
  queue(videoUrl, message) {
    ytdl.getBasicInfo(videoUrl)
      .then((info) => {
        global.playlist.push({ url:videoUrl, title:info.title, author:message.author });
        var embedMessage = formEmbedMessage(message.author, info, false);
        message.channel.send(embedMessage);
      })
      .catch((err) => {
        return console.log(err);
      });
    
  },
  queueTop(videoUrl, message) {
    ytdl.getBasicInfo(videoUrl)
      .then((info) => {
        global.playlist.unshift({ url:videoUrl, title:info.title, author:message.author });
        var embedMessage = formEmbedMessage(message.author, info, false);
        message.channel.send(embedMessage);
      })
      .catch((err) => {
        return console.log(err);
      });
  }
}

function formEmbedMessage(author, videoInfo, nowPlaying) {
  var title = "";
  var embedMessage = new Discord.RichEmbed();
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
    .setThumbnail(videoInfo.thumbnail_url)
    .setAuthor(author.username, author.avatarURL, author.avatarURL)
    .addField('Author: ', videoInfo.author.name)
    .addField('Length: ', length)
    .addField("Songs in Queue: ", global.playlist.length)
    .setTimestamp();
  
  return embedMessage;
}
