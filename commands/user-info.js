module.exports = {
    name: 'user-info',
    description: 'Shows the username and id of user',
    execute(message, args) {
        message.channel.send(`Your username: ${message.author.username}\nYour ID: ${message.author.id}`);
    },
}