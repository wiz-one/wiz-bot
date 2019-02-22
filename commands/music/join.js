module.exports = {
  name: 'join',
  description: 'Request the bot to join the voice channel.',
  async execute(message, args) {
    if (!message.member.voiceChannel) {
      return message.reply('You need to join a voice channel first!');
    }
    
    message.member.voiceChannel.join().then(connection => {
      message.reply('I have successfully connected to the channel!');
    })
    .catch(console.log);
  }
}
