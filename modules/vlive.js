const request = require('request');
const promiseRetry = require('promise-retry');
const puppeteer = require('puppeteer');
const Discord = require('discord.js');
const pg = require('pg');
const fs = require('fs');
const vliveData = global.vliveData;

//Base variables
const appId = vliveData.appId;
const maxNumOfRows = vliveData.maxNumOfRows; //Maximum no of recent videos to check at every request
const pool = vliveData.pool;

//Model variables
var nonSubVid = vliveData.nonSubVid;
var liveVid = vliveData.liveVid;
var newVid = vliveData.newVid;
var newPost = vliveData.newPost;

//Proxies variables
const proxies = vliveData.proxies;
var count = vliveData.count; //use to rotate the proxies at every request

//Channel Information variables
const channelCode = vliveData.channelCode;
const channelId = vliveData.channelId;
const channelName = vliveData.channelName;
const channelProfileImage = vliveData.channelProfileImage;
const channelBoardId = vliveData.channelBoardId;
const channelUrl = vliveData.channelUrl;

//End Points
const vLiveDecodeApi = `http://api.vfan.vlive.tv/vproxy/channelplus/decodeChannelCode?app_id=${appId}&channelCode=${channelCode}`;
const vLiveChannelApi = `https://api-vfan.vlive.tv/channel.${channelId}?app_id=${appId}&fields=channel_name,fan_count,channel_cover_img,channel_profile_img,representative_color,background_color,celeb_board,fan_board`;
const vliveVideoApi = `https://api-vfan.vlive.tv/vproxy/channelplus/getChannelVideoList?app_id=${appId}&channelSeq=${channelId}&maxNumOfRows=${maxNumOfRows}`;
const vLivePostApi = `https://api-vfan.vlive.tv/v2/board.${channelBoardId}/posts?app_id=${appId}&limit=1`;

module.exports = (client = Discord.Client) => {
  vlive = async function vlive(discordChannel) {

    getData(vliveVideoApi).then(async (body) => {

      const result = body.result;
      const totalVideoCount = result.totalVideoCount;
      const videoList = result.videoList;

      for (let i = videoList.length - 1; i >= 0; i--) { //Loop by uploaded time (last element first)

        const video = videoList[i];

        //Video Info
        const videoSeq = video.videoSeq;
        const videoTitle = video.title;
        const videoUrl = 'https://www.vlive.tv/video/' + videoSeq;
        const videoType = video.videoType;
        const thumbnail = video.thumbnail;
        const playCount = video.playCount;
        const likeCount = video.likeCount;
        const commentCount = video.commentCount;
        const duration = secondsToHms(video.playTime, true);

        //=================================================================== LIVE VIDEO =================================

        if (!liveVid.some(e => e.seq === videoSeq) && videoType === 'LIVE') {

          var queryConfig = {
            text: 'INSERT INTO livevideo VALUES($1, $2, $3, $4);',
            values: [videoSeq, `${videoTitle}`, `${thumbnail}`, `${Date.now()}`]
          };

          pool.query(queryConfig).catch(err => console.log('Query to livevideo: ' + err));

          liveVid.push({
            seq: videoSeq,
            title: videoTitle,
            img: thumbnail,
            time: (Date.now()).toString()
          });

          console.log(JSON.stringify(liveVid));

          console.log('Channel is LIVE! =>');
          console.log(channelName);
          console.log('Id: ' + videoSeq);
          console.log('Title: ' + videoTitle);
          console.log('Thumbnail: ' + thumbnail);
          console.log('Type: ' + videoType);
          console.log('Play: ' + playCount);
          console.log('Like: ' + likeCount);
          console.log('Comment: ' + commentCount);

          const msgEmbed = new Discord.RichEmbed()
            .setColor('#52fffb')
            .setTitle(videoTitle)
            .setURL(videoUrl)
            .setAuthor(`${channelName} - New VLive`, 'https://imgur.com/wsC83yq.png', channelUrl)
            .setThumbnail('https://imgur.com/4GeeZTB.png')
            .addField('Plays', '▶ ' + playCount, true)
            .addField('Hearts', '❤ ' + likeCount, true)
            .addField('Comment', '💬 ' + commentCount, true)
            .setImage(thumbnail)
            .setTimestamp();

          discordChannel.send('@everyone');
          discordChannel.send(msgEmbed);
        }

        //=================================================================== NEW VIDEO =============================

        if (!newVid.includes(videoSeq) && videoType === 'VOD') {

          newVid.push(videoSeq);
          console.log('newvid: ' + JSON.stringify(newVid));

          promiseRetry((retry, number) => {
            return getVideoId(videoSeq)
              .catch(retry);
          })
            .then(([key, videoId]) => {
              const videoInfoApi = `https://global.apis.naver.com/rmcnmv/rmcnmv/vod_play_videoInfo.json?key=${key}&videoId=${videoId}`;

              getData(videoInfoApi).then((result) => {
                getEngSub(result).then(([engSub, highestReso]) => {

                  pool.query(`INSERT INTO newvideo VALUES(${videoSeq})`);

                  if (newVid.length > maxNumOfRows) {
                    const toRemove = newVid.splice(0, 1);
                    pool.query(`DELETE FROM newvideo WHERE id = ${toRemove}`);
                  }

                  console.log('New Video! =>');

                  console.log(channelName);
                  console.log('Id: ' + videoSeq);
                  console.log('Title: ' + videoTitle);
                  console.log('Thumbnail: ' + thumbnail);
                  console.log('Type: ' + videoType);
                  console.log('Duration: ' + duration);
                  console.log('Play: ' + playCount);
                  console.log('Like: ' + likeCount);
                  console.log('Comment: ' + commentCount);
                  console.log('Resolution: ' + highestReso);
                  console.log('English Subtitle: ' + engSub);

                  const msgEmbed = new Discord.RichEmbed()
                    .setColor('#FEE715')
                    .setTitle(videoTitle)
                    .setURL(videoUrl)
                    .setAuthor(`${channelName} - New Video Uploaded`, 'https://imgur.com/wsC83yq.png', channelUrl)
                    .setThumbnail(channelProfileImage)
                    .addField('Plays', '▶ ' + playCount, true)
                    .addField('Hearts', '❤ ' + likeCount, true)
                    .addField('Duration', '⏱ ' + duration, true)
                    .addField('Comment', '💬 ' + commentCount, true)
                    .addField('Resolution', `**${highestReso}**`, true)
                    .setImage(thumbnail)
                    .setTimestamp();

                  //Ignore eng sub for dance practice and MV
                  if (videoTitle.includes('Dance Practice') || videoTitle.includes(' MV ')) {
                    return discordChannel.send(msgEmbed);
                  }

                  msgEmbed.addField('English Subtitle', engSub, true)
                  discordChannel.send(msgEmbed);

                  if (engSub === '**❌**') {

                    var queryConfig = {
                      text: 'INSERT INTO nonsubvideo VALUES($1, $2, $3, $4, $5, $6);',
                      values: [videoSeq, `${videoId}`, `${videoTitle}`, `${videoUrl}`, `${thumbnail}`, `${key}`]
                    };

                    pool.query(queryConfig).catch(err => console.log('Query to nonsubvideo: ' + err));

                    nonSubVid.push({
                      seq: videoSeq,
                      id: videoId,
                      title: videoTitle,
                      url: videoUrl,
                      img: thumbnail,
                      key: key
                    });
                  }
                }).catch(e => console.log(e + videoSeq));
              })
            });
        }

        //=================================================================== NEW PLAYLIST ================

        if (!newVid.includes(videoSeq) && videoType === 'PLAYLIST') {
          newVid.push(videoSeq);
          pool.query(`INSERT INTO newvideo VALUES(${videoSeq})`);

          const playlist = video.videoPlaylist.videoList;
          const videoCount = playlist.length;

          var vidPlaylistTitles = '';
          for (let i = 0; i < videoCount; i++) {
            vidPlaylistTitles += `**${i + 1}.** [${playlist[i].title}](https://www.vlive.tv/video/${playlist[i].videoSeq})\n`;
          }

          var totalDuration = playlist.map(vid => vid.playTime).reduce((a, b) => a + b, 0);
          totalDuration = secondsToHms(totalDuration, true);

          console.log('newvid: ' + JSON.stringify(newVid));

          console.log('New Video Playlist! =>');
          console.log('Id: ' + videoSeq);
          console.log('Title: ' + videoTitle);
          console.log('Thumbnail: ' + thumbnail);
          console.log('Type: ' + videoType);
          console.log('videoCount: ' + videoCount);
          console.log('totalDuration: ' + totalDuration);

          const msgEmbed = new Discord.RichEmbed()
            .setColor('#660066')
            .setTitle(videoTitle)
            .setURL(videoUrl)
            .setAuthor(`${channelName} - New Video Playlist`, 'https://imgur.com/wsC83yq.png', channelUrl)
            .setThumbnail(channelProfileImage)
            .addField('Total Videos', '📹 ' + videoCount, true)
            .addField('Total Duration', '⏱ ' + totalDuration, true)
            .addField('Video List :', vidPlaylistTitles)
            .setImage(thumbnail)
            .setTimestamp();

          discordChannel.send(msgEmbed);
        }
      } //Outside video list loop


      //============================================================= LIVE VIDEO ENDED =======================================

      if (liveVid.length) {
        console.log('Status: Live');

        for (let i = liveVid.length - 1; i >= 0; i--) {
          const video = liveVid[i];

          if (!videoList.some(e => e.videoSeq === video.seq)) {
            liveVid.splice(i, 1);
            pool.query(`DELETE FROM livevideo WHERE seq = ${video.seq}`);

            var dur = Math.floor((Date.now() - parseInt(video.time)) / 1000) - 5;
            dur = secondsToHms(dur, false);

            console.log(`Vlive Just Ended =>`);
            console.log('Id: ' + video.seq);
            console.log('Title: ' + video.title);
            console.log('Thumbnail: ' + video.img);
            console.log('Lasted for: ' + dur);

            const msgEmbed = new Discord.RichEmbed()
              .setColor('#838a8e')
              .setTitle(video.title)
              .setAuthor(`${channelName} - Vlive Ended`, 'https://imgur.com/wsC83yq.png', channelUrl)
              .setThumbnail(video.img)
              .setFooter('Lasted for: ' + dur);

            discordChannel.send(msgEmbed);
          }
        }
      } else {
        console.log('Status: Not Live');
      }

    }).catch(err => console.log(err));

    //=================================================================== FIND ENG SUB =================================

    if (nonSubVid.length) {

      console.log('Status: Finding Eng Subs for ' + nonSubVid.map(vid => vid.seq).join(','));

      for (let i = nonSubVid.length - 1; i >= 0; i--) {
        const video = nonSubVid[i];
        const videoInfoApi = `https://global.apis.naver.com/rmcnmv/rmcnmv/vod_play_videoInfo.json?key=${video.key}&videoId=${video.id}`;

        getData(videoInfoApi).then((result) => {
          getEngSub(result).then(([engSub, highestReso]) => {

            if (engSub === '**✅**') {
              console.log('English Subtitle Out => ' + video.seq);

              nonSubVid.splice(i, 1);
              pool.query(`DELETE FROM nonsubvideo WHERE seq=${video.seq}`);
              console.log('Removed from nonSubVid: ' + video.seq);

              const msgEmbed = new Discord.RichEmbed()
                .setColor('#d60270')
                .setTitle(video.title)
                .setURL(video.url)
                .setAuthor(`${channelName} - English Subtitles Out`, 'https://imgur.com/wsC83yq.png', channelUrl)
                .setThumbnail(video.img)
                .setTimestamp();

              discordChannel.send(msgEmbed);
            } else {
              //console.log(`English Subs for ${video.seq} => ${engSub} (key: ${video.key})`);
              //console.log('Url : '+ videoInfoApi);
            }
          }).catch((e) => {
            if (!video.reset) {
              console.log(e + video.seq)
              video.reset = true;
              resetKey(video).then(() => video.reset = false); //Reset expired key
            }
          });
        });
      }
    }

    //=================================================================== NEW POST =================================

    getData(vLivePostApi).then(async (body) => {
      const result = body.data;

      if (result == null) return;
      const post = result[0];
      if (post == null) return;

      const postId = post.post_id;
      const author = post.author.nickname;
      const title = post.title;
      const content = post.content;
      const imgList = post.image_list;
      const imgToSend = await imgList.filter(img => img.type === 'PHOTO').map(img => img.thumb);
      const videoToSend = await imgList.filter(img => img.type === 'VIDEO').map(img => img.thumb);

      var typeString = '';
      var contentString = '';

      if (!newPost.includes(postId)) {

        if (newPost.length) {
          const toRemove = newPost.splice(0, 1);
          pool.query(`DELETE FROM newpost WHERE id = '${toRemove}'`);
        }

        newPost.push(postId);
        pool.query(`INSERT INTO newpost VALUES('${postId}')`);

        console.log('newPost: ' + JSON.stringify(newPost));

        const postUrl = `https://channels.vlive.tv/${channelCode}/celeb/${postId}`;

        console.log("New Post => ");
        console.log("Id: " + postId);
        console.log("Content: " + content);
        console.log("Img list: " + imgToSend);
        console.log("Video list: " + videoToSend);
        console.log("Url: " + postUrl);

        const msgEmbed = new Discord.RichEmbed()
          .setColor('#F791D1')
          .setAuthor(`${author} - New Post`, 'https://imgur.com/wsC83yq.png', postUrl)
          .setURL(postUrl);

        if (title) msgEmbed.setTitle(title);
        if (content) contentString += content;
        if (imgToSend.length > 5) {
          contentString += `*[See ${imgToSend.length - 5} more photos](${postUrl})*`;
          imgToSend.splice(0, 5);
        }
        if (videoToSend.length > 1) contentString += `*[See ${videoToSend.length - 1} more videos](${postUrl})*`;
        if (contentString) msgEmbed.setDescription(`${contentString}`);
        if (imgToSend.length) typeString += 'Photo ';
        if (videoToSend.length) {
          typeString += 'Video ';
          msgEmbed.setImage(videoToSend[0]);
        };

        msgEmbed.setFooter(typeString);

        discordChannel.send(msgEmbed).then(() => {
          if (imgToSend.length) discordChannel.send({ files: imgToSend });
        });
      }
    }).catch(err => console.log(err));;
  }
}

//=================================================================== UTILITY FUNCTIONS =================================

function getData(url) {

  const options = {
    url: url,
    method: 'GET',
    json: true
  };

  return new Promise((resolve, reject) => {
    request.get(options, (err, resp, body) => {
      if (err) {
        reject(err);
      } else {
        resolve(body);
      }
    });
  });
}

async function getVideoId(videoSeq) {

  const url = `https://www.vlive.tv/video/${videoSeq}`;
  const proxy = proxies[count];

  count++;
  if (count == proxies.length) count = 0;
  console.log(`Status: Getting VideoId(${videoSeq}) with proxy => ` + proxy);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', `--proxy-server=${proxy}`]
  });

  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 6_0_1 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) GSA/3.1.0.23513 Mobile/10A523 Safari/8536.25");

  var key, videoId, subtitles;

  return new Promise(async (resolve, reject) => {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
      .then(async () => {

        const elements = await page.evaluate(() => {
          let elements = Array.from(document.querySelectorAll('script'));
          let subs = elements.map(element => element.innerText);
          return subs;
        });

        var txt = elements[8];
        txt = txt.replace(/(\r\n\t|\n|\r\t|\s+)/g, "");
        const start = txt.indexOf('vlive.video.init(') + 17;
        const end = txt.indexOf(');vlive.video.suggest(', start);

        txt = txt.substr(start, end - start);
        var array = txt.split(',');

        //console.log(array);
        videoId = array[8].slice(1, -1);
        key = array[9].slice(1, -1);

        resolve([key, videoId]);
      })

      .catch(e => {
        //console.log('Page Error: ' + e);
        reject(e);
      });

    await browser.close();
  });
}

async function resetKey(video) {

  console.log(`Resetting key => ${video.seq} (${video.id})`);

  await promiseRetry((retry, number) => {
    return getVideoId(video.seq)
      .catch(retry);
  }).then(([key, videoId]) => {
    console.log('Reset successfully => ' + video.seq)
    console.log('Old key: ' + video.key);
    console.log('New key: ' + key);

    video.key = key;

    var queryConfig = {
      text: 'UPDATE nonsubvideo SET key = $1 WHERE seq = $2;',
      values: [key, video.seq]
    };

    pool.query(queryConfig).catch(err => console.log('Error Update key nonSubVideo: ' + err));
  });
}

function getEngSub(result) {

  return new Promise((resolve, reject) => {
    if (result.errorCode == 'INVALID_KEY') reject('Invalid Key, Ignored => ');
    if (result.errorCode === 'EXPIRED_KEY') reject('Key Expired => ');

    const resoList = result.videos.list.map(e => e.encodingOption.height);
    const highestReso = Math.max.apply(Math, resoList) + 'p';
    var engSub;

    if (result.captions == null) {
      engSub = '**❌**';
    } else {
      const subList = result.captions.list;
      engSub = subList.some(e => e.locale === 'en_US') ? '**✅**' : '**❌**';
    }

    resolve([engSub, highestReso]);
  });
}

function secondsToHms(d, option) {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor(d % 3600 / 60);
  var s = Math.floor(d % 3600 % 60);

  var hDisplay, mDisplay, sDisplay;

  if (option) {
    hDisplay = h > 0 ? h + ":" : "";
    mDisplay = m > 0 ? (m > 9 ? m + ":" : (h > 0 ? "0" + m + ":" : m + ":")) : (h > 0 ? "00:" : "0:");
    sDisplay = s > 0 ? (s > 9 ? s : "0" + s) : "00";
  } else {
    hDisplay = h > 0 ? h + "h " : "";
    mDisplay = m > 0 ? m + "m " : "";
    sDisplay = s > 0 ? s + "s" : "";
  }

  return hDisplay + mDisplay + sDisplay;
}
