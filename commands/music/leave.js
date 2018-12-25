module.exports = {
  name: 'leave',
  description: 'Request the bot to leave the voice channel.',
  execute(message, args) {
    if (message.guild.voiceConnection) {
      global.currentPlaying = null;
      global.playlist = new Array();
      global.loop = false;
      message.member.voiceChannel.leave();
      message.reply('I have successfully disconnected from the channel!');
    } else {
      message.reply('I am not connected to the voice channel!');
    }
  }
}
