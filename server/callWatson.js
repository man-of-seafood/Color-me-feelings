var db = require('../database-mongo');
var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
var configFile = require('../config/config'); // PRIVATE FILE - DO NOT COMMIT!
var secret = configFile.keys;
var dictionary = require('../database-mongo/dictionary'); // stateCodeArr, stateNameArr, dictionary

// create instance of Tone Analyzer service
var toneAnalyzer = new ToneAnalyzerV3({
  username: secret.WATSON_API_USERNAME,
  password: secret.WATSON_API_PASS,
  version_date: '2016-05-19'
});

var params = {
  // Get the text from the JSON file.
  text: require(__dirname + '/../apis/news-sample.json').text,
  tones: 'emotion', // omit for all three, comma separated list
  sentences: false
};

// Get each article from db >>> Call to Watson >>> Update each article with 5-scores based on the response...

// UNCOMMENT FOR Watson call


toneAnalyzer.tone(params, function(error, response) {
  error ? console.log('error:', error) : console.log(JSON.stringify(response, null, 2));
});

module.exports; // ?????  // I called this file 'analyze' in the index.js ¯\_(ツ)_/¯ --RW
