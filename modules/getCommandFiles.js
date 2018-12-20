/** Returns a discord collection of commands,
 *  with the command name as its identifier and the command information as the body.
 * 
 *  dir: path of the directory you want to search the files for
 *  fileTypes: array of file types you are search files, ex: ['.txt', '.jpg']
 */

const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');

module.exports = (client = Discord.Client) => {
  getCommandFiles = function getCommandFiles(dir, fileTypes) {
    const cmd = new Discord.Collection();

    //Recursive function
    function walkDir(currentPath) {
      const files = fs.readdirSync(currentPath);
      for (let i in files) {
        const curFile = path.join(currentPath, files[i]);    
        if (fs.statSync(curFile).isFile() && fileTypes.indexOf(path.extname(curFile)) != -1) {
        const command = require(`./../${curFile.replace('\\','/')}`);
        cmd.set(command.name, command);
        } else if (fs.statSync(curFile).isDirectory()) {
         walkDir(curFile);
        }
      }
    };

    walkDir(dir);

    return cmd; 
  };
};