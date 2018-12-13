const Discord = require("discord.js");
const fs = require("fs");
const { reactionFilePath } = require("../config.json");

module.exports = (bot = Discord.Client) => {
  addCustomReaction = async function addCustomReaction(message) {
    const args = message.content.slice(prefix.length).split(' ');
    let returnMessage = null;

    console.log("Argument received: " + args[1]);

    if (!args.length) {
      return message.channel.reply("You didn't provide any arguments");
    }

    var trigger = args[1];
    var reaction = args[2];
    var author = message.author;
    var obj = formJsonObj(trigger, reaction);
    var message = formEmbedMessage(trigger, reaction, author);
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
    .setDescription('Some description here')
    .setThumbnail('https://i.imgur.com/wSTFkRM.png')
    .addField('Custom Reaction Added', 'Some value here')
    .addField('Trigger', trigger)
    .addField('Response', reaction)
    .setTimestamp();
  return embedMessage;
}

function save(reactionObj) {
  fs.readFile(reactionFilePath, 'utf8', function readFileCallback(err, data){
    if (err){
        console.log(err);
        throw err;
    }
    var obj = JSON.parse(data);
    obj.table.push(reactionObj);
    json = JSON.stringify(obj);
    fs.writeFile(reactionFilePath, json, 'utf8', callback); // write it back 
});
}
