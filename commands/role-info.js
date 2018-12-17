const Discord = require('discord.js');

module.exports = {
    name: 'role-info',
    aliases: ['roles'],
    description: 'Return all the roles in the server along with its ID',
    execute(message, args) {
        const data = [];

        data.push(message.guild.roles.map((element,value) => 
            `\nRole name: **${element.name}** \n ID: ${value}`
        ).join('\n'));

        const dataEmbed = new Discord.RichEmbed()
        .setColor('#011100')
        .addField(`List of all roles in ${message.guild.name}`, data)

        message.channel.send(dataEmbed);
    },
}