module.exports = {
  name: 'leave',
  description: 'Request the bot to leave the voice channel.',
  execute(message, args) {

    if (!message.member.voiceChannel) {
      return message.reply('You need to join a voice channel first!');
    }

    if (!message.guild.voiceConnection) {
      return message.reply('I am not connected to the voice channel!');
    }

    let guild_id = message.guild.id;
    let guild = global.guilds.get(guild_id)

    guild.currentPlaying = null;
    guild.playlist = new Array();
    guild.loop = false;
    message.member.voiceChannel.leave();
    message.reply('I have successfully disconnected from the channel!');
  }
}
