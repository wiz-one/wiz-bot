module.exports = {
    name: 'args-info',
    args: true,
    usage: '<any arguments>',
    description: 'Test argument information command',
    execute(message, args) {
    
        if (args[0] === 'nako') {
            return message.channel.send('hitomi');
        }
    
        message.channel.send(`Command name: args-info \nArguments: ${args}`);
    },
}