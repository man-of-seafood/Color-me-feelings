const ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
const { masonWatsonCredentials, joshWatsonCredentials } = require('../config/config');
const { stateDict, countryDict } = require('../reference/dictionary');
const db = require('../database');
const topics = require('../reference/topics');
let toneAnalyzer = new ToneAnalyzerV3({
  username: masonWatsonCredentials.WATSON_TA_USERNAME,
  password: masonWatsonCredentials.WATSON_TA_PASSWORD,
  version_date: '2016-05-19'
});

console.log(toneAnalyzer);

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
  // UNCOMMENT below for testing with limited topics/regions
  // const topics = ['war', 'coffee'];
  // const stateDict = { 'AL': 'Alabama', 'MD': 'Maryland' }; // for testing
  // const countryDict = { 'CN': 'China', 'JP': 'Japan' }; // for testing
  let stateTopicCounter = 0;
  let countryTopicCounter = 0;
  db.StateTopicToneAverages.remove().then(() => {
    db.StateTones.find({}, (err, analyzedStateArticleTones) => {
      for (let stateCode in stateDict) {
        topics.forEach(topic => {
          //increment masonCredentials and perform a check
          console.log('Calculating average for state', stateCode, 'on topic', topic, '. Iteration', stateTopicCounter++);
          //get all the articles with tagged with that state and topic
          const currentBatch = analyzedStateArticleTones.filter(article => article.state === stateCode && article.topic === topic);
          const averages = {
            anger: 0,
            disgust: 0,
            fear: 0,
            sadness: 0,
            joy: 0
          };
          const titleUrlTuple = [];
          currentBatch.forEach(article => {
            const { anger, disgust, fear, sadness, joy } = article.tones;
            averages.anger += anger;
            averages.disgust += disgust;
            averages.fear += fear;
            averages.sadness += sadness;
            averages.joy += joy;
            if (titleUrlTuple.length < 5) {
              titleUrlTuple.push([article.articleTitle, article.url]);
            }
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
            toneAverages: averages,
            articles: titleUrlTuple
          });
          //save it
          stateTopicAverages.save((err, success) => {
            err ? console.log('ERROR saving:', err) : null;
          });
        }); // end of stateDictForEach
      }
    });
  });
  
  // repeat for country tones 
  db.CountryTopicToneAverages.remove().then(() => {
    db.CountryTones.find({}, (err, analyzedCountryArticleTones) => {
      for (let countryCode in countryDict) {
        topics.forEach(topic => {
          console.log('Calculating average for country', countryCode, 'on topic', topic, '. Iteration', countryTopicCounter++);
          //get all the articles with tagged with that state and topic
          const currentBatch = analyzedCountryArticleTones.filter(article => article.country === countryCode && article.topic === topic);
          const averages = {
            anger: 0,
            disgust: 0,
            fear: 0,
            sadness: 0,
            joy: 0
          };
          const titleUrlTuple = [];
          currentBatch.forEach(article => {
            const { anger, disgust, fear, sadness, joy } = article.tones;
            averages.anger += anger;
            averages.disgust += disgust;
            averages.fear += fear;
            averages.sadness += sadness;
            averages.joy += joy;
            if (titleUrlTuple.length < 5) {
              titleUrlTuple.push([article.articleTitle, article.url]);
            }
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
            toneAverages: averages,
            articles: titleUrlTuple
          });
          //save it
          countryTopicAverages.save((err, success) => {
            err ? console.log('ERROR saving:', err) : null;
          });
        }); // end of countryDict forEach
      }
    });
  });
};

const addTones = () => {
  let counter = 0;
  const counters = {
    articlesAnalyzedUnderMason: 0,
    articlesAnalyzedUnderJosh: 0
  };
  let currentCounterKey = 'articlesAnalyzedUnderMason';
  db.Article.find({}, (err, articles) => {
    if (err) {
      console.log('error occurred finding articles', err);
    } else {
      let problemOccurred = false;
      for (let article of articles) {
        // if(articlesAnalyzedUnderMason > 40) {
        //   console.log('hit 40 articles');
        //   break;
        // }
        counters[currentCounterKey]++;
        if (counters['articlesAnalyzedUnderMason'] >= 2100) {
          toneAnalyzer = new ToneAnalyzerV3({
            username: joshWatsonCredentials.WATSON_TA_USERNAME,
            password: joshWatsonCredentials.WATSON_TA_PASSWORD,
            version_date: '2016-05-19'
          });
          currentCounterKey = 'articlesAnalyzedUnderJosh';
        }
        let { text, topic, stateCode, countryCode } = article;
        if (!text) {
          //console.log('no text found on article. article:', article);
          text = 'This is neutral text';
        } else {
          //console.log('text of article:', text.substring(0, 10));
        }
        
        const params = {
          text,
          tones: 'emotion',
          setences: false
        };
        setTimeout(() => {
          toneAnalyzer.tone(params, (err, res) => {
            if (err) {
              console.log('ERROR analyzing tones:', err, 'article uuid:', article.uuid);
              problemOccurred = true;
              return;
            }
            console.log('analyzing article #', counter);
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
                tones,
                articleTitle: article.title,
                url: article.url
              });
            } else {
              analyzedArticleTones = new db.CountryTones({
                country: countryCode,
                topic,
                tones,
                articleTitle: article.title,
                url: article.url
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
        }, 300 * (counters['articlesAnalyzedUnderMason'] + counters['articlesAnalyzedUnderJosh']));
        if (problemOccurred) {
          console.log('breaking out of loop because of an error analyzing tones. see somewhere above for article uuid of article that broke the TA');
          break;
        }
      } // end of articles loop
    }
  });
};



module.exports = {
  analyze: addTones,
  clearAllToneData
};
