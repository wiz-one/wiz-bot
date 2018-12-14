module.exports = {
    name: 'server',
    description: 'Shows the server name and total number of members',
    execute(message, args) {
        message.channel.send(`This server's name is: ${message.guild.name}\nTotal members: ${message.guild.memberCount}`);
    },
}