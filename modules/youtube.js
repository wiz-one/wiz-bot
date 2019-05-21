var fs = require('fs');
var readline = require('readline');
var { google } = require('googleapis');
let { youtube } = require('./music');
var OAuth2 = google.auth.OAuth2;

const youtubeUrl = "https://www.youtube.com/watch?v=";

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl'];
var TOKEN_DIR = __dirname + '/../.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';
let videoId;

module.exports = {
  searchVideo: function searchVideo(q, message, event) {
    var oauth2Client = initialise();
  
    searchListByKeyword(oauth2Client, {'params': {'maxResults': '5',
      'part': 'snippet',
      'q': q,
      'type': 'forDeveloper'}}, message, event);
  },
  getPlaylist: function getPlaylist(q, message, event) {
    var oauth2Client = initialise();
  
    playlistItemsListByPlaylistId(oauth2Client, {'params': {
      'part': 'contentDetails',
      'maxResults': '50',
      'playlistId': q}}, message, event);
  }
};

function initialise() {
  try {
    var content = process.env.youtube_client_secret || fs.readFileSync(__dirname + '/../client_secret.json');
  } catch (err) {
    console.log('Error loading client secret file: ' + err);
  }

  // Authorize a client with the loaded credentials, then call the YouTube API.
  var oauth2Client = authorize(JSON.parse(content));
  return oauth2Client;
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, requestData, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
  var token;

  // Check if we have previously stored a token.
  try {
    token =  process.env.youtube_token || fs.readFileSync(TOKEN_PATH);
  } catch (err) {
    getNewToken(oauth2Client, requestData, callback);
    token = fs.readFileSync(TOKEN_PATH);
  }
  
  oauth2Client.credentials = JSON.parse(token);
  return oauth2Client;
  // callback(oauth2Client, requestData);
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, requestData, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client, requestData);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) throw err;
    console.log('Token stored to ' + TOKEN_PATH);
  });
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Remove parameters that do not have values.
 *
 * @param {Object} params A list of key-value pairs representing request
 *                        parameters and their values.
 * @return {Object} The params object minus parameters with no values set.
 */
function removeEmptyParameters(params) {
  for (var p in params) {
    if (!params[p] || params[p] == 'undefined') {
      delete params[p];
    }
  }
  return params;
}

function searchListByKeyword(auth, requestData, message, event) {
  var service = google.youtube('v3');
  var parameters = removeEmptyParameters(requestData['params']);
  parameters['auth'] = auth;

  try {
    service.search.list(parameters).then((response) => {
      for (results of response.data.items) {
        if (results.id.kind == 'youtube#video') {
          videoId = results.id.videoId;
          youtube.emit(event, youtubeUrl + videoId, message);
          break;
        }
      }
    });
  } catch (err) {
    console.log('The API returned an error: ' + err);
    return;
  }
}

function playlistItemsListByPlaylistId(auth, requestData, message, event) {
  var service = google.youtube('v3');
  var parameters = removeEmptyParameters(requestData['params']);
  parameters['auth'] = auth;

  var videoUrls = new Array();

  service.playlistItems.list(parameters, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }

    for (videos of response.data.items) {
      videoId = videos.contentDetails.videoId;
      videoUrls.push(youtubeUrl + videoId);
    }
    youtube.emit(event, videoUrls, message);
  });
}

