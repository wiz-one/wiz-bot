const Discord = require("discord.js");
const { prefix, customReactionPrefix } = require("./../config.json");

module.exports = (client = Discord.Client) => {

  reply = async function reply(message) {

    if (message.channel.type === "dm" || message.author.bot || message.system) return;
    if (message.content.startsWith(prefix) || message.content.startsWith(customReactionPrefix)) return;
    
    var content = message.content.split(/\r?\n/);
    const nameAndTime = content.shift();
    content = content.join('\n');

    var members = message.guild.members;
    members = members.map(m => {
      return {
        name: m.user.username,
        nickname: m.nickname,
        dp: m.user.avatarURL
      }
    });

    const regDate1 = /^Last (Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday) at (1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/;
    const regDate2 = /^(Yesterday|Today) at (1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/;
    const regDate3 = /^\d{1,2}\/\d{1,2}\/\d{4}$/;

    var fName, fDp, fTime, fChannel;
    var isFakeNews = true;

    for (m of members) {

      const regName1 = new RegExp(`^${m.name}`);
      const regName2 = new RegExp(`^${m.nickname}`);

      if (regName1.test(nameAndTime) || regName2.test(nameAndTime)) {

        var displayName;

        if (regName1.test(nameAndTime)) displayName = m.name;
        if (regName2.test(nameAndTime)) displayName = m.nickname;

        fTime = nameAndTime.slice(displayName.length);
        if (fTime.includes('BOT'))
          fTime = fTime.slice(3);

        if (regDate1.test(fTime) || regDate2.test(fTime) || regDate3.test(fTime)) {
          fName = displayName;
          fDp = m.dp;
          break;
        }
      }
    }

    if (!fName || !content.length || !fTime) return;

    message.delete();

    var aName = message.author.username;

    const aNickname = await message.guild.fetchMember(message.author).then((u) => u.nickname);
    if (aNickname) aName = aNickname;

    var toSend = content + `\n\n\`${fTime} | ${aName}\``;

    const msgEmbed = new Discord.RichEmbed()
      .setAuthor(fName, fDp)
      .setDescription(toSend)

    message.channel.send(msgEmbed).then(async (msgToEdit) => {

      const allTxtChannels = await message.guild.channels.filter(c => c.type === 'text');
      const promises = [];

      for (var c of allTxtChannels.values()) {

        const promise = await new Promise(async (resolve, reject) => {

          let allMsg = [];
          let fetched;
          let lastMsg = message;

          for (let x = 0; x < 5; x++) {
            fetched = await c.fetchMessages({ limit: 100, before: lastMsg.id });
            allMsg = await allMsg.concat(Array.from(fetched.values()));
            lastMsg = allMsg[allMsg.length - 1];
          }

          allMsg = allMsg.filter(msg => msg.author.username === fName);
          allMsg.reverse();
          allMsg = allMsg.join('\n');

          if (allMsg.includes(content)) {
            fChannel = c.id;
            isFakeNews = false;
          }

          resolve();
        })

        promises.push(promise);
      }

      Promise.all(promises).then(() => {
        if (isFakeNews) return;

        toSend = content + `\n\n\`${fTime} in \`<#${fChannel}>\` | ${aName}\``;
        msgEmbed.setDescription(toSend);
        msgToEdit.edit(msgEmbed);
      })
    });
  };
};
