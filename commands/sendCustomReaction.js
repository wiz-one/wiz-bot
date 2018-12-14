module.exports = {
  name: 'scr',
  description: 'Send custom reaction according to argument input',
  async execute(message, args) {

    let returnMessage = null;

    console.log("Argument received: " + args[0]);

    if (!args.length) {
      returnMessage = `You didn't provide any arguments, ${message.author}!`;
    } else if (args[0] === "zul") {
      returnMessage = "https://gfycat.com/DrearyMiniatureArcherfish"; 
    } else if (args[0] === "darren") {
      returnMessage = "https://imgur.com/9baOIQ3"; 
    } else if (args[0] === "ces") {
      returnMessage = "https://gfycat.com/wickedsickgalapagosdove";
    } else {
      returnMessage = "https://gfycat.com/KlutzyLikelyFlounder";
    }

    return message.channel.send(returnMessage);
  }
}