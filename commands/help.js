const Discord = require('discord.js');
const { prefix } = require('../config.json');

module.exports = {
    name: 'help',
    description: 'List all of my commands or info about a specific command.',
    aliases: ['commands'],
    usage: '[command name]',
    dm: true,
    cooldown: 5,
    execute(message, args) {
        const data = [];
        const { commands } = message.client;

        if (!args.length) {
            data.push(commands.map(command => `\` ${command.name} \``).join('\n'));
            data.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);
            
            const dataEmbed = new Discord.RichEmbed()
            .setColor('#000000')
            .setTitle(`**Wiz-Bot**`)
            .setURL('https://github.com/wiz-one/wiz-bot')
            .setThumbnail('https://i.imgur.com/CZqkT5u.png')
            .addField('List of all commands by Wiz-Bot', data)

            return message.author.send(dataEmbed)
                .then(() => {
                    if (message.channel.type === 'dm') return;
                    message.reply('I\'ve sent you a DM with all my commands!');
                })
                .catch(error => {
                    console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                    message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
                });
        }

        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            return message.reply('that\'s not a valid command!');
        }

        const dataEmbed = new Discord.RichEmbed()
        .setColor('#ffffff')
        .addField('Command name', command.name, true);

        if (command.aliases) dataEmbed.addField('Aliases',command.aliases.join('\n'),true); 
        if (command.description) dataEmbed.addField('Description', command.description);
        if (command.usage) dataEmbed.addField('Usage', `${prefix}${command.name} ${command.usage}`);

        dataEmbed.addField('Cooldown', `${command.cooldown || 3} second(s)`);

        message.channel.send(dataEmbed);
    },
};