const fs = require("fs");
const Discord = require("discord.js");
const { reactionFilePath } = require("../config.json");

module.exports = {
  name: 'acr',
  description: 'Add custom reaction according to argument input',
  async execute(message, args) {

    console.log("Arguments received: " + args.join(" "));

    if (!args.length) {
      return message.channel.reply("You didn't provide any arguments");
    }

    var trigger = args[0];
    var reaction = args[1];
    var author = message.author;
    var obj = formJsonObj(trigger, reaction);
    var embedMessage = formEmbedMessage(trigger, reaction, author);
    save(obj);

    return message.channel.send(embedMessage);
  }
}

function formJsonObj(trigger, reaction) {
  var data = {
    trigger: trigger,
    reaction: reaction
  };
  return data;
}

function formEmbedMessage(trigger, reaction, author) {
  const embedMessage = new Discord.RichEmbed()
    .setColor('#da004e')
    .setAuthor(author.username, author.avatarURL, author.avatarURL)
    .addField('Custom Reaction Added', 'Some value here')
    .addField('Trigger', trigger)
    .addField('Response', reaction)
    .setTimestamp();
  return embedMessage;
}

async function save(reactionObj) {
  var file = __dirname + "/../" + reactionFilePath;
  obj = JSON.parse(fs.readFileSync(file, 'utf8'));
  obj.reactions.push(reactionObj);
  json = JSON.stringify(obj);
  fs.writeFileSync(file, json);
}
