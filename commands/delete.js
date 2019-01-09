const Discord = require('discord.js');

var count = 0;
var botOnly = false;
var userOnly = false;

module.exports = {
    name: 'delete',
    aliases: ['deletemsg'],
    description: 'Deletes messages in the given channel by the given amount in the argument and message type (Optional second args) : bot or user ',
    usage: ' [amount] or \n delete bot [amount] or \n delete user [amount]',
    cooldown: 1,
    args: true,
    async execute(message, args) {

        if (!message.member.roles.some(r => ["Admin"].includes(r.name)))
            return message.reply("Sorry, you don't have permissions to use this!");

        try {
            await message.delete();
            var amtToDelete = args[0];

            if (args[0] == 'bot' || args[0] == 'user') {
                if (isNaN(args[1])) {
                    return message.reply('Please provide a number!');
                }

                if (args[0] == 'bot') botOnly = true;
                if (args[0] == 'user') userOnly = true;

                amtToDelete = args[1];

            } else if (isNaN(amtToDelete)) {
                return message.reply('Please provide a number!');
            }

            if (amtToDelete > 100)
                return message.reply('Can only delete maximum of 100 messages at every request!')

            if (botOnly || userOnly) {
                var fetched = await message.channel.fetchMessages();

                if (botOnly) fetched = await fetched.filter(msg => msg.author.bot);
                if (userOnly) fetched = await fetched.filter(msg => !msg.author.bot);

                var iterator = await fetched.entries();

                if (!fetched.size) return message.reply('No message found!').then((msg) => msg.delete(1000));
                if (amtToDelete > fetched.size) amtToDelete = fetched.size;

                console.log(fetched);

                for (let i = 0; i < amtToDelete; i++) {
                    const msgToDelete = iterator.next().value[1];
                    msgToDelete.delete().then(() => {
                        count++;
                        if (count == amtToDelete) sendByeMsg(message);
                    })
                }
            }
            else {
                var fetched = await message.channel.fetchMessages({ limit: amtToDelete });
                if (!fetched.size) return message.reply('No message found!').then((msg) => msg.delete(1000));
                console.log(fetched.size + ' messages found, deleting..');

                for (const msgToDelete of fetched.values()) {
                    msgToDelete.delete().then(() => {
                        count++;
                        if (count == amtToDelete) sendByeMsg(message);
                    })
                }
            }
        } catch (e) {
            message.channel.send('Error :' + e);
        }
    },
}

function sendByeMsg(message) {

    var botString = '';
    var userString = '';

    if (botOnly) botString = ' **BOTS ONLY**';
    if (userOnly) userString = ' **USERS ONLY**';

    const toSend = `Deleted **${count}**${botString + userString} Messages!`;

    count = 0;
    botOnly = false;
    userOnly = false;

    message.channel.send(toSend).then((msg) => {
        setTimeout(() => {
            msg.edit('Hyewon ftw!');
            msg.delete(1000);
        }, 2000);
    })
}