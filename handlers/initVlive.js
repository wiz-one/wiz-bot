const request = require('request');
const pg = require('pg');
const fs = require('fs');
var { proxiesFilePath, dbCredentials } = require('./../config.json');

dbCredentials.password = process.env.db_password;

//Base variables
const appId = '8c6cc7b45d2568fb668be6e05b6e5a3b';
const channelCode = 'C1B7AF'; //IZONE: C1B7AF 
const maxNumOfRows = 10;
const pool = new pg.Pool(dbCredentials); //Postgresql connection

//Model variables
var nonSubVid = [], liveVid = [], newVid = [], newPost = [];

//Proxies variables
var proxies = [], count;

//Channel Information variables
var channelId, channelName, channelProfileImage, channelBoardId, channelUrl;

//End Points variables
var vLiveDecodeApi, vLiveChannelApi, vliveVideoApi, vLivePostApi;

module.exports = (client = Discord.Client) => {
  initVlive = async function initVlive() {
    await startInit();
    global.vliveData = {
      appId, maxNumOfRows, pool,
      nonSubVid, liveVid, newVid, newPost,
      proxies, count,
      channelCode, channelId, channelName, channelProfileImage, channelBoardId, channelUrl,
    }
  }
}

//================================================================================= INIT FUNCTION

async function startInit() {

  console.log('Initializing Vlive data... ')

  //Initialize data from DB storage to model variables 
  readFromDb('livevideo').then((result) => liveVid = result);
  readFromDb('nonsubvideo').then((result) => nonSubVid = result);
  readFromDb('newpost').then((result) => newPost = result.map(e => e.id));
  await readFromDb('newvideo').then((result) => newVid = result.sort((a, b) => sortByDate(a, b)));

  // Read proxies and generate random start index
  await fs.readFile(proxiesFilePath, (err, data) => {
    if (err) throw err;
    proxies = data.toString().split("\n");
    proxies.splice(-1, 1);
    count = getRandomInt(proxies.length);
  });

  //Decode and get channel information based on channelCode given
  channelUrl = 'https://channels.vlive.tv/' + channelCode;
  updateApiUrl();

  await getData(vLiveDecodeApi).then(async (body) => {
    channelId = body.result.channelSeq;
    updateApiUrl();

    await getData(vLiveChannelApi).then((body) => {
      channelName = body.channel_name;
      channelProfileImage = body.channel_profile_img;
      channelBoardId = body.celeb_board.board_id;
      updateApiUrl();
    })

      .then(() => {
        printStats();
      })
  })
}

//================================================================================== OTHER FUNCTION

function printStats() {
  console.log('\n========== Vlive DATA ==========');
  console.log('\nChannel Information => ');
  console.log('Code: ' + channelCode);
  console.log('Id: ' + channelId);
  console.log('Name: ' + channelName);
  console.log('Url: ' + channelUrl);
  console.log('ProfileImg: ' + channelProfileImage);
  console.log('Board Id: ' + channelBoardId);

  console.log('\nModel/DB Information => ');
  console.log('NewVid: ' + JSON.stringify(newVid.map(e => e.id)))
  console.log('NewPost: ' + JSON.stringify(newPost))
  console.log('LiveVid: ' + JSON.stringify(liveVid.map(e => e.seq)))
  console.log('NonSubVid: ' + JSON.stringify(nonSubVid.map(e => e.seq)))

  console.log('\nProxies Information => ');
  console.log('No. of Proxies: ' + proxies.length);
  console.log('Count: ' + count);
  console.log('\n================================');
  console.log('\nDONE Initializing Vlive data!\n');
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function getData(url) {

  const options = {
    url: url,
    method: 'GET',
    json: true
  };

  return new Promise((resolve, reject) => {
    request.get(options, (err, resp, body) => {
      if (err) reject(err);
      resolve(body);
    });
  });
}

function readFromDb(table) {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT * FROM ${table}`, (err, res) => {
      if (err) reject(console.error(err));
      resolve(res.rows);
    });
  });
}

function updateApiUrl() {
  vLiveDecodeApi = `http://api.vfan.vlive.tv/vproxy/channelplus/decodeChannelCode?app_id=${appId}&channelCode=${channelCode}`;
  vLiveChannelApi = `https://api-vfan.vlive.tv/channel.${channelId}?app_id=${appId}&fields=channel_name,fan_count,channel_cover_img,channel_profile_img,representative_color,background_color,celeb_board,fan_board`;
  vliveVideoApi = `https://api-vfan.vlive.tv/vproxy/channelplus/getChannelVideoList?app_id=${appId}&channelSeq=${channelId}&maxNumOfRows=${maxNumOfRows}`;
  vLivePostApi = `https://api-vfan.vlive.tv/v2/board.${channelBoardId}/posts?app_id=${appId}&limit=1`;
}

function sortByDate(a, b) {
  const x = new Date(a.time).getTime();
  const y = new Date(b.time).getTime();
  if (x === y) return a.id - b.id; //If same upload time, sort by id
  return x - y;
}
