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
        dp: m.user.avatarURL
      }
    });

    var fName;
    var fDp;
    var fTime;
    var fChannel;
    var isFakeNews = true;

    for (m of members) {
      if (nameAndTime.includes(m.name)) {
        fName = m.name;
        fDp = m.dp;
        fTime = nameAndTime.slice(m.name.length);

        if (fTime.includes('BOT'))
          fTime = fTime.slice(3);
        break;
      }
    }

    if (!fName && !content) return;

    await message.delete();

    const aName = message.author.username;
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

          //check if it can be retrieved in the last 500 messages in every text channel
          for (let x = 0; x < 5; x++) {
            fetched = await c.fetchMessages({ limit: 100, before: lastMsg.id });
            allMsg = await allMsg.concat(Array.from(fetched.values()));
            lastMsg = allMsg[allMsg.length - 1];
          }

          allMsg = await allMsg.filter(msg => msg.author.username === fName);
          await allMsg.reverse();
          allMsg = await allMsg.join('\n');

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
