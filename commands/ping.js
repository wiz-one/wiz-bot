module.exports = {
    name: 'ping',
    description: 'The bot will response with a \`Pong.\` upon receiving ping',
    cooldown: 5,
    execute(message, args) {
        message.channel.send('Pong.');
    },
};