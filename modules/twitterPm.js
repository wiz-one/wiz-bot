const Discord = require('discord.js');
var Twitter = require('twitter');
 
var twitter_info = JSON.parse(process.env.twitter_key_and_secret);
var twitter_client = new Twitter({
  consumer_key: twitter_info.consumer_key,
  consumer_secret: twitter_info.consumer_secret,
  access_token_key: twitter_info.access_token_key,
  access_token_secret: twitter_info.access_token_secret,
});

var count_limit = twitter_info.count;

var tweetedId = [];
var members = ['wonyo','wonyoung','sakura','kkura',
'yuri','yena','yujin','eunbi','nako','hyewon', 'tomi',
'hitomi','chaewon','minju','minjoo','chaeyeon']

module.exports = (client = Discord.Client) => {
    twitterPm = async function twitterPm(discordChannel) {
        var params = {screen_name: 'izonepm', count: count_limit};
        twitter_client.get('statuses/user_timeline', params, function(error, tweets, response) {
          if (!error) {
            tweets.forEach(tweet => {
                if(!tweetedId.some(e => e === tweet.id)) {
                    if(members.some(member => tweet.text.toLowerCase().includes(member)) 
                    && tweet.text.toLowerCase().includes('mail')
                    && tweet.extended_entities) {

                      var text = tweet.text.substring(0,tweet.text.indexOf("https://t.co/"));
                      var imgToSend = tweet.extended_entities.media.map(pic => pic.media_url_https);

                      console.log('==== NEW MAIL ====');
                      console.log(tweet.id);
                      console.log(text);
                      imgToSend.forEach(pic => console.log(pic));

                      discordChannel.send("**"+text+"**", {files : imgToSend});

                      tweetedId.push(tweet.id);
                    }
                }
            });
          } else {
              console.log(error);
          }
        });
    }
}
