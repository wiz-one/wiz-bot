module.exports = {
    name: 'kick',
    description: 'Kick user by mentioning them',
    execute(message, args) {
        if (!message.mentions.users.size) {
            return message.reply('you need to tag a user in order to kick them!');
        }
        const taggedUser = message.mentions.users;
        taggedUser.forEach(user => {
            message.channel.send(`You wanted to kick: ${user.username}`);
        });
    },
}