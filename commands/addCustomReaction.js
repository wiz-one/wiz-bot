const Discord = require("discord.js");
const fs = require("fs");
const { prefix, reactionFilePath } = require("../config.json");

module.exports = {
  name: 'acr',
  description: 'Add custom reaction according to argument input',
  async execute(message, args) {
    const args = message.content.slice(prefix.length).split(' ');

    console.log("Arguments received: " + args.join(" "));

    if (!args.length) {
      return message.channel.reply("You didn't provide any arguments");
    }

    var trigger = args[1];
    var reaction = args[2];
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

function save(reactionObj) {
  var file = __dirname + "/../" + reactionFilePath;
  console.log(file);
  fs.readFile(file, 'utf8', function readFileCallback(err, data){
    if (err){
        console.log(err);
        throw err;
    }
    obj = JSON.parse(data);
    if (obj.length > 0) {
      obj.push(reactionObj);
    } else {
      obj[0] = reactionObj;
    }
    
    var json = JSON.stringify(obj);
    fs.writeFile(file, json, 'utf8', function callback(err, data) {
      if (err){
        console.log(err);
        throw err;
      }
    });
});
}
