module.exports = {
  name: 'leave',
  description: 'Request the bot to leave the voice channel.',
  execute(message, args) {
    if (message.member.voiceChannel) {
      message.member.voiceChannel.leave();
      message.reply('I have successfully disconnected from the channel!');
      playlist = new Array();
    } else {
      message.reply('You need to join a voice channel first!');
    }
  }
}
