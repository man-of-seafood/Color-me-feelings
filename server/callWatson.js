const ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
const credentials = require('../config/config');
const { stateDict, countryDict } = require('../reference/dictionary');
const db = require('../database');
//const topics = require('../reference/topics');
const toneAnalyzer = new ToneAnalyzerV3({
  username: credentials.WATSON_TA_USERNAME,
  password: credentials.WATSON_TA_PASSWORD,
  version_date: '2016-05-19'
});

const clearAllToneData = function () {
  db.CountryTones.find({}).remove(() => {
    console.log('Cleared country tones from DB');
  });
  db.StateTones.find({}).remove(() => {
    console.log('Cleared state tones from DB');
  });
  db.CountryTopicToneAverages.find({}).remove(() => {
    console.log('Cleared country topic tone averages from DB');
  });
  db.StateTopicToneAverages.find({}).remove(() => {
    console.log('Cleared state topic tone averages from DB');
  });
};

const calculateAveragesTones = function() {
  const topics = ['war', 'coffee'];
  db.StateTones.find({}, (err, analyzedStateArticleTones) => {
    for (let stateCode in stateDict) {
      topics.forEach(topic => {
        //get all the articles with tagged with that state and topic
        const currentBatch = analyzedStateArticleTones.filter(article => article.state === stateCode && article.topic === topic);
        const averages = {
          anger: 0,
          disgust: 0,
          fear: 0,
          sadness: 0,
          joy: 0
        };
        currentBatch.forEach(article => {
          const { anger, disgust, fear, sadness, joy } = article.tones;
          averages.anger += anger;
          averages.disgust += disgust;
          averages.fear += fear;
          averages.sadness += sadness;
          averages.joy += joy;
        });
        //now divide each score by the number of articles
        if (currentBatch.length) {
          for (let tone in averages) {
            averages[tone] /= currentBatch.length;
          }
        }
        //store the averages 
        const stateTopicAverages = new db.StateTopicToneAverages({
          state: stateCode,
          topic: topic,
          toneAverages: averages
        });
        //save it
        stateTopicAverages.save((err, success) => {
          err ? console.log('ERROR saving:', err) : null;
        });
      });
    } // end of stateDictForEach
  });

  // repeat for country tones 
  db.CountryTones.find({}, (err, analyzedCountryArticleTones) => {
    for (let countryCode in countryDict) {
      topics.forEach(topic => {
        //get all the articles with tagged with that state and topic
        const currentBatch = analyzedCountryArticleTones.filter(article => article.country === countryCode && article.topic === topic);
        const averages = {
          anger: 0,
          disgust: 0,
          fear: 0,
          sadness: 0,
          joy: 0
        };
        currentBatch.forEach(article => {
          const { anger, disgust, fear, sadness, joy } = article.tones;
          averages.anger += anger;
          averages.disgust += disgust;
          averages.fear += fear;
          averages.sadness += sadness;
          averages.joy += joy;
        });
        //now divide each score by the number of articles
        if (currentBatch.length) {
          for (let tone in averages) {
            averages[tone] /= currentBatch.length;
          }
        }
        //store the averages 
        const countryTopicAverages = new db.CountryTopicToneAverages({
          country: countryCode,
          topic: topic,
          toneAverages: averages
        });
        //save it
        countryTopicAverages.save((err, success) => {
          err ? console.log('ERROR saving:', err) : null;
        });
      });
    } // end of countryDict forEach
  });
};

const addTones = () => {
  let counter = 0;
  db.Article.find({}, (err, articles) => {
    if (err) {
      console.log(err);
    } else {
      articles.forEach(article => {
        const { text, topic, stateCode, countryCode } = article;
        const params = {
          text,
          tones: 'emotion',
          setences: false
        };
        toneAnalyzer.tone(params, (err, res) => {
          if (err) {
            console.log('ERROR analyzing tones:', err);
            return;
          }
          const scores = res.document_tone.tone_categories[0].tones;
          const anger = scores[0].score;
          const disgust = scores[1].score;
          const fear = scores[2].score;
          const joy = scores[3].score;
          const sadness = scores[4].score;

          let analyzedArticleTones;
          const tones = {
            anger,
            disgust,
            fear,
            sadness,
            joy
          };

          if (countryCode === 'US') {
            analyzedArticleTones = new db.StateTones({
              state: stateCode,
              topic,
              tones
            });
          } else {
            analyzedArticleTones = new db.CountryTones({
              country: countryCode,
              topic,
              tones
            });
          }

          analyzedArticleTones.save((err, success) => {
            err ? console.log('ERROR saving:', err) : counter++;
            if (counter === articles.length) {
              //calculate the averages
              calculateAveragesTones();
            }
          });
        });
      });
      console.log('outside the foreach', counter);
    }
  });
};


module.exports = {
  analyze: addTones,
  clearAllToneData
};
