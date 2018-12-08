const Discord = require("discord.js");
const { prefix, token } = require("./../config.json");

module.exports = (client = Discord.Client) => {
  sendCustomReaction = async function sendCustomReaction(message) {
    if (message.system) {
      return;
    }
    if (message.author.bot) {
      return;
    }
    if (message.channel.type === 'dm') {
      return;
    }

    const args = message.content.slice(prefix.length).split(' ');
    let returnMessage = null;

    console.log("Argument received: " + args[0]);

    if (!args.length) {
      returnMessage = `You didn't provide any arguments, ${message.author}!`;
    } else if (args[1] === "zul") {
      returnMessage = "https://gfycat.com/DrearyMiniatureArcherfish"; 
    } else if (args[1] === "darren") {
      returnMessage = "https://imgur.com/9baOIQ3"; 
    } else if (args[1] === "ces") {
      returnMessage = "https://gfycat.com/HeavySillyBlackbuck";
    } else {
      returnMessage = "https://gfycat.com/KlutzyLikelyFlounder";
    }

    return message.channel.send(returnMessage);
  }
}