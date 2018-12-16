module.exports = {
  name: 'emote',
  description: 'Enlarge the emoji requested',
  async execute(message, args) {
    const emojiUrl = "https://cdn.discordapp.com/emojis/";
    const requestString = "Requested by: ";

    console.log("Argument received: ", args[0]);

    if (!args.length) {
      return message.channel.reply("You didn't provide any arguments");
    }

    console.log("\\" + args[0]);

    const emoji = args[0].substring(2, args[0].length - 1).split(":");
    console.log(emoji);

    if (args.length == 0) {

    }
    const emojiName = emoji[0];
    const emojiId = emoji[1];

    console.log(message.guild.emojis.get(emojiId)); 

    message.channel.send(requestString + message.author.username + "\n" + emojiUrl + emojiId);
    return message.delete();
  }
}