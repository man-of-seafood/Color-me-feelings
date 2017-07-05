var db = require('../database-mongo/index');
var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
var configFile = require('../config/config'); // PRIVATE FILE - DO NOT COMMIT!
var secret = configFile.keys;
import { dictionary } from '../database-mongo/dictionary'; // stateCodeArr, stateNameArr, dictionary

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

// stores state and tone data
// format {az: {joy: 0, fear: 0, disgust: 0}, ca: {joy...}}
var finalObj = {};


var makeAvg = (obj, divisor) => {
  for (var tone in obj) {
    obj[tone] = obj[tone] / divisor * 100;
  }
};

var callWatsonForScores = (articlesArr, finalObj, state, cb) => {
  // only run cb if there are articles about that state - cb assures makeAvg and adding to db happens after watson data is returned
  // counter checks that all articles have been analyzed
  var counter = 0;

  articlesArr.forEach( (article) => {
    params.text = article.text;
    toneAnalyzer.tone(params, (err, res) => {
      if (err) { 
        console.log('Watson: Error retreiving tone analysis', err); 
      } else {
        counter++;

        // index of tone according to Watson response
        var angerScore = res.document_tone.tone_categories[0].tones[0].score;
        var disgustScore = res.document_tone.tone_categories[0].tones[1].score;
        var fearScore = res.document_tone.tone_categories[0].tones[2].score;
        var joyScore = res.document_tone.tone_categories[0].tones[3].score;
        var sadnessScore = res.document_tone.tone_categories[0].tones[4].score;
        // sum az's scores
        finalObj[state].anger = finalObj[state].anger + angerScore;
        finalObj[state].disgust = finalObj[state].disgust + disgustScore;
        finalObj[state].fear = finalObj[state].fear + fearScore;
        finalObj[state].joy = finalObj[state].joy + joyScore;
        finalObj[state].sadness = finalObj[state].sadness + sadnessScore;
        if (counter === articlesArr.length) { cb(); }
      }
    });
  });

};

var addTones = () => {

  // remove existing document from db
  db.StateTone.remove().then( () => {

    // loop thru states
    dictionary.stateCodeArr.forEach( (state) => {

      // find all articles about 'state' in db
      db.Article.find({stateCode: state}, (err, allArticles) => { 
        if (err) { 
          console.log(`Error getting ${state} articles in db`, err); 
        } else {

          // make entry in finalObj for state
          finalObj[state] = {
            anger: 0, 
            disgust: 0, 
            fear: 0, 
            joy: 0, 
            sadness: 0
          };
          // run analyzer on all articles about state, add to finalObj
          callWatsonForScores(allArticles, finalObj, state, () => {
            // avg scores for state
            makeAvg(finalObj[state], allArticles.length);

            // create document
            var stateTone = new db.StateTone({
              state: state,
              tones: {
                anger: finalObj[state].anger, 
                disgust: finalObj[state].disgust, 
                fear: finalObj[state].fear, 
                joy: finalObj[state].joy, 
                sadness: finalObj[state].sadness
              }
            });
            stateTone.save( (err, stateTone) => {
              if (err) { console.log(`There was an error saving ${state}'s tone data`); } 
            });
          });
        }
      });
    });
  });
};

module.exports = addTones;










