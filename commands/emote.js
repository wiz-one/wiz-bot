const emojis = require('emojis');
const onlyEmoji = require('emoji-aware').onlyEmoji;
const twemoji = require('twemoji');
const Discord = require("discord.js");

module.exports = {
  name: 'emote',
  description: 'Enlarge the emoji requested',
  async execute(message, args) {
    const customEmojiUrl = "https://cdn.discordapp.com/emojis/";
    const standardEmojiUrl = "https://s3.ap-southeast-1.amazonaws.com/wiz-bot/emoji/";
    const requestString = "Requested by: ";
    var file = null;

    console.log("Argument received: ", args[0]);

    if (!args.length) {
      return message.channel.reply("You didn't provide any arguments");
    }

    if(onlyEmoji(args[0]).length !== 0){
        var emojiUnicode = emojis.unicode(args[0]);
        var emojiCodePoint = twemoji.convert.toCodePoint(emojiUnicode);
        file = standardEmojiUrl + emojiCodePoint + ".png";
        message.channel.send(requestString + message.author.username, { files: [file] });
    } else {
      const emoji = args[0].substr(2, args[0].length - 2).split(":");
      const emojiId = emoji[1].slice(0,emoji[1].length-1);

      console.log(message.guild.emojis.get(emojiId));
      if (message.guild.emojis.get(emojiId)) {
        file = customEmojiUrl + emojiId;
        message.channel.send(requestString + message.author.username + "\n" + file);
      }
    }
    message.delete();
  }
}
