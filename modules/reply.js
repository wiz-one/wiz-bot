const Discord = require("discord.js");
const { prefix, customReactionPrefix } = require("./../config.json");

module.exports = (client = Discord.Client) => {

  reply = async function reply(message) {

    var content = message.content.split(/\r?\n/);
    const nameAndTime = content.shift(); //Get first line
    content = content.join('\n');

    const members = message.guild.members.map(m => {
      return {
        name: m.user.username,
        nickname: m.nickname,
        dp: m.user.avatarURL
      }
    });

    const regDate1 = /^Last (Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday) at (1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/;
    const regDate2 = /^(Yesterday|Today) at (1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/;
    const regDate3 = /^\d{1,2}\/\d{1,2}\/\d{4}$/;

    var fTime, fChannel, fmember, isDateCorrect;

    for (m of members) {
      const regName = new RegExp(`^${m.nickname || m.name}`);

      if (regName.test(nameAndTime)) {
        fmember = m;
        fmember.displayName = m.nickname || m.name;

        fTime = nameAndTime.slice(fmember.displayName.length);
        if ((/^BOT/).test(fTime)) fTime = fTime.slice(3);
        if (regDate1.test(fTime) || regDate2.test(fTime) || regDate3.test(fTime)) {
          isDateCorrect = true;
          break;
        }
      }
    }

    if (!fmember || !content.length || !isDateCorrect) return; //if no member mentioned or no content or date is in wrong format 

    const allTxtChannels = await message.guild.channels.filter(c => c.type === 'text'); //get all text channels
    const promisesToAwait = [];

    for (var c of allTxtChannels.values()) {
      promisesToAwait.push(loopChannel(c));
    }

    Promise.all(promisesToAwait).then(async () => {

      const aNickname = await message.guild.fetchMember(message.author).then((u) => u.nickname);
      const aName = aNickname || message.author.username;
      const msgEmbed = new Discord.RichEmbed().setAuthor(fmember.displayName, fmember.dp);

      if (fChannel) {
        content += `\n\n\`${fTime} in \`<#${fChannel}>\` | ${aName}\``;
      }
      else {
        msgEmbed.setThumbnail('https://imgur.com/qviVML1.png');
        content += `\n\n\`${fTime} | ${aName}\``;
      }

      message.delete();

      msgEmbed.setDescription(content);
      message.channel.send(msgEmbed);
    });


    function loopChannel(c) {
      return new Promise(async (resolve, reject) => {

        let lastMsg = message;

        do {
          //Check whether the content is in every channel
          var fetched = await c.fetchMessages({ limit: 100, before: lastMsg.id });
          var allMsg = Array.from(fetched.values());
          lastMsg = allMsg[allMsg.length - 1];

          allMsg = allMsg.filter(msg => msg.author.username === fmember.name);
          allMsg.reverse(); //Sort by msg sent first
          allMsg = allMsg.join('\n'); //Default will join content together

          if (allMsg.includes(content)) fChannel = c.id;
          if (fChannel) break; //Complete promise if channel holding the content is found                    

        } while (fetched.size == 100) //Check if there are still anymore msg to get

        resolve();
      });
    }
  };
};
