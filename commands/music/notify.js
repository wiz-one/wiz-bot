module.exports = {
  name: 'notify',
  description: 'Request the bot to notify when the next song is played.',
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

    if (!guild.notify) {
      guild.notify = true;
      message.channel.send('Notification Enabled!');
    } else {
      guild.notify = false;
      message.channel.send('Notification Disabled!');
    }
  }
}