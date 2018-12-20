module.exports = {
  name: 'pause',
  description: 'Request the bot to pause the current playing song in the voice channel.',
  async execute(message, args) {

    if (!message.member.voiceChannel) {
      return message.reply('You need to join a voice channel first!');
    }

    connection = message.guild.voiceConnection;

    if (!connection) {
      message.reply('I am not connected to the channel!');
    }

    if (connection.dispatcher) {
      connection.dispatcher.pause();
      message.reply('Music Paused!');
    } else {
      message.reply('There isn\'t any music to pause!');
    }
  }
}
