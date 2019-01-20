module.exports = {
  name: 'loop',
  description: 'Request the bot to loop the song in the playlist.',
  async execute(message, args) {

    if (!message.member.voiceChannel) {
      return message.reply('You need to join a voice channel first!');
    }

    connection = message.guild.voiceConnection;
    let guild_id = message.guild.id;
    let guild = global.guilds.get(guild_id);

    if (!connection) {
      message.reply('I am not connected to the channel!');
    }

    if (!guild.loop) {
      guild.loop = true;
      message.channel.send('Loop Enabled!');
    } else {
      guild.loop = false;
      message.channel.send('Loop Disabled!');
    }
  }
}