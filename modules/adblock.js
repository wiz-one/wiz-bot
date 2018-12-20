/**  
 * !DISCLAIMER! Work in progress.
 * 
 *  Credits to : https://github.com/Ravexburn/LuckyBot/blob/master/modules/modding/adblock.js
 * 
 *  Purpose of function: Checks if user post any other discord links.
 *  
 * */

const Discord = require("discord.js");

module.exports = (client = Discord.Client) => {

	adblocker = function adblocker(message) {

        //if (message.author.client) return;
        if (message.channel.type === "dm") return;

		// const serverSettings = client.getServerSettings(message.guild.id);
        // if (serverSettings.adBlocktoggle === false) return;
        // if (!serverSettings) return;
        
		let perms = ["ADMINISTRATOR", "MANAGE_GUILD", "VIEW_AUDIT_LOG"];

		if (message.content.includes("http://bit.ly/") && message.author.bot) {
			message.delete().catch(console.error);
			return;
		}

		if (message.content.includes("https://discord.gg/") && !message.member.hasPermission(perms)) {
			message.delete().catch(console.error);
			message.reply("Please do not post discord links.").catch(console.error);
			return;
		}
	};
};
