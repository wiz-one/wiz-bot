const emojis = require('emojis');
const onlyEmoji = require('emoji-aware').onlyEmoji;
const Discord = require('discord.js');
const emojiCharacters = require('./../modules/emojiCharacters.js');

module.exports = {
    name: 'react',
    description: 'React the previous message with emoji or string',
    usage: '<emoji>/<some string>',
    async execute(message, args) {

        if (!args.length) {
            return message.channel.send(`You didn't provide any emoji, ${message.author}!`)
            .then(msg => deleteLastTwoMsg(msg));
        }

        const fetched = await message.channel.fetchMessages({limit: 1, before:message.id}).catch((err) => console.log(err));
        fetched.map(async msg => {
            for(arg of args){
                await process(msg,arg);
         }
        });

        message.delete();

    },
}

async function deleteLastTwoMsg(message){
    const fetched = await message.channel.fetchMessages({limit: 2}).catch((err) => console.log(err));
    fetched.map(msg => msg.delete(700));
}

async function process(msg,arg){

    if(onlyEmoji(arg).length !== 0){
        await msg.react(emojis.unicode(arg));
    } 
    else {
        const emoji = arg.substr(2, arg.length - 1).split(":");

        if(emoji[1] == null){
          if(arg.length < 7){
           for(let i = 0; i < arg.length; i++){    
            await msg.react(emojiCharacters[arg.charAt(i).toLowerCase()]);
           }
          }
        } else {
            const emojiId = emoji[1].slice(0,emoji[1].length-1);
            if (message.guild.emojis.get(emojiId)){
                await msg.react(emojiId);
            } 
        }
    }
}