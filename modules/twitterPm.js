const Discord = require('discord.js');
const pg = require('pg');
var Twitter = require('twitter');

var { dbCredentials } = require('./../config.json');
dbCredentials.password = process.env.db_password;

var twitter_info = JSON.parse(process.env.twitter_key_and_secret);
var twitter_client = new Twitter({
  consumer_key: twitter_info.consumer_key,
  consumer_secret: twitter_info.consumer_secret,
  access_token_key: twitter_info.access_token_key,
  access_token_secret: twitter_info.access_token_secret,
});

var count_limit = twitter_info.count;

const pool = new pg.Pool(dbCredentials); //Postgresql connection
var tweetedId = global.tweet;

// First element of array is the channel name; others are possible names
var members = [
    ['wonyoung', 'wonyo'],
    ['sakura', 'kkura'],
    ['yuri'],
    ['yena'],
    ['yujin'],
    ['eunbi'],
    ['nako'],
    ['hyewon'],
    ['hitomi'],
    ['chaewon'],
    ['minju', 'minjoo'],
    ['chaeyeon']
];

module.exports = (client = Discord.Client) => {
    twitterPm = async function twitterPm() {
        var params = {screen_name: 'izonepm', count: count_limit};
        twitter_client.get('statuses/user_timeline', params, function(error, tweets, response) {
          if (!error) {
            tweets.forEach(tweet => {
                if (!tweetedId.includes(tweet.id.toString()) &&
                tweet.text.toLowerCase().includes('mail') &&
                tweet.extended_entities) {

                checkMember(tweet.text.toLowerCase()).then(memberChannel => {
                    tweetedId.push(tweet.id.toString());
                    pool.query(`INSERT INTO twitterpm (id, time_upload) VALUES('${tweet.id}', current_timestamp)`);

                    var text = tweet.text.substring(0, tweet.text.indexOf("https://t.co/"));
                    console.log('==== NEW MAIL ====');
                    console.log(tweet.id);
                    console.log(text);
                    var imgToSend = tweet.extended_entities.media.map(pic => pic.media_url_https);
                    imgToSend.forEach(pic => console.log(pic));

                    const channelToSend = client.channels.find(channel => channel.name === memberChannel);
                    if (channelToSend) {
                        channelToSend.send("**" + text + "**", { files: imgToSend });
                    } else {
                        console.log('Twitter PM cannot find channel : ' + memberChannel);
                    }
                });
            }
            });
          } else {
              console.log(error);
          }
        });
    }
}

function checkMember(name) {
    return new Promise((resolve) => {
        for (var i = 0; i < members.length; i++) {
            for (var k = 0; k < members[i].length; k++) {
                if (name.includes(members[i][k])) {
                    resolve(members[i][0]);
                }
            }
        }
    });
}