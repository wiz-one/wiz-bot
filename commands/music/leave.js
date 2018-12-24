module.exports = {
  name: 'leave',
  description: 'Request the bot to leave the voice channel.',
  execute(message, args) {
    if (message.guild.voiceConnection) {
      message.member.voiceChannel.leave();
      message.reply('I have successfully disconnected from the channel!');
      global.playlist = new Array();
    } else {
      message.reply('I am not connected to the voice channel!');
    }
  }
}
