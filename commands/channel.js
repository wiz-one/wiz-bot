const Discord = require('discord.js');

module.exports = {
    name: 'channel-info',
    aliases: ['channels'],
    description: 'Return all the channels in the server along with its ID',
    execute(message, args) {
        const data = [];

        data.push(message.guild.channels.map((element,value) => 
            `\nChannel name: **${element.name}** \n ID: ${value}`
        ).join('\n'));

        const dataEmbed = new Discord.RichEmbed()
        .setColor('#011100')
        .addField(`List of all channels in ${message.guild.name}`, data)

        message.channel.send(dataEmbed);
    },
}