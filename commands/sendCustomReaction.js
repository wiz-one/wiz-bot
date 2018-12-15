const fs = require("fs");
const { reactionFilePath } = require("../config.json");

module.exports = {
  name: 'scr',
  description: 'Send custom reaction according to argument input',
  async execute(message, args) {

    let returnMessage = null;

    console.log("Argument received: " + args);

    if (!args.length) {
      returnMessage = `You didn't provide any arguments, ${message.author}!`;
    }
    returnMessage = readReaction(args);

    return message.channel.send(returnMessage);
  }
}

function readReaction(trigger) {
  var file = __dirname + "/../" + reactionFilePath;
  var response = null;
  var obj = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (reaction of obj.reactions) {
    if (reaction.trigger == trigger) {
      response = reaction.reaction;
    }
  }
  return response;
}
