var Article = require('../database-mongo/index');
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

exports.finalObj = {};

// eg {az: {joy: 0, fear: 0}, ax: joy}


var makeAvg = (obj, divisor) => {
  for (var tone in obj) {
    obj[tone] = obj[tone] / divisor * 100;
  }
};

exports.addTones = () => {
  // loop thru states
  dictionary.stateCodeArr.forEach( (state) => {
    // find all articles about az
    Article.find({type: state}, (err, allArticles) => { 
      if (err) { 
        console.log(`Error getting ${state} articles in db`, err); 
      } else {
        // make entry in finalObj for az
        finalObj[state] = {
          anger: 0, 
          disgust: 0, 
          fear: 0, 
          fear: 0, 
          joy: 0
        };
        // run analyzer on all articles about az, add to finalObj
        allArticles.forEach( (item) => {
          params.text = item.text;
          toneAnalyzer.tone(params, (err, res) => {
            if (err) { console.log('Watons: Error retreiving tone analysis', err); }
            // sum az's scores
            finalObj[state].anger = finalObj[state].anger + res.document_tone.tone_categories[0].tones[0].score;
            finalObj[state].disgust = finalObj[state].disgust + res.document_tone.tone_categories[0].tones[1].score;
            finalObj[state].fear = finalObj[state].fear + res.document_tone.tone_categories[0].tones[2].score;
            finalObj[state].joy = finalObj[state].joy + res.document_tone.tone_categories[0].tones[3].score;
            finalObj[state].sadness = finalObj[state].sadness + res.document_tone.tone_categories[0].tones[4].score;
          });
        });
        // avg scores for az
        makeAvg(finalObj, allArticles.length);
      }
    });
  });
};












