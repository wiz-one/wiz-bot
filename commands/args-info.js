module.exports = {
    name: 'args-info',
    description: 'Test argument information command',
    execute(message, args) {
        if (!args.length) {
            return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
        }
        else if (args[0] === 'nako') {
            return message.channel.send('hitomi');
        }
    
        message.channel.send(`Command name: args-info \nArguments: ${args}`);
    },
}