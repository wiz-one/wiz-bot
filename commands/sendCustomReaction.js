module.exports = {
  name: 'scr',
  args: true,
  description: 'Send custom reaction according to argument input',
  async execute(message, args) {

    let returnMessage = null;

    console.log("Argument received: " + args[0]);

    if (args[0] === "zul") {
      returnMessage = "https://gfycat.com/DrearyMiniatureArcherfish"; 
    } else if (args[0] === "darren") {
      returnMessage = "https://imgur.com/9baOIQ3"; 
    } else if (args[0] === "ces") {
      returnMessage = "https://gfycat.com/HeavySillyBlackbuck";
    } else {
      returnMessage = "https://gfycat.com/KlutzyLikelyFlounder";
    }

    return message.channel.send(returnMessage);
  }
}