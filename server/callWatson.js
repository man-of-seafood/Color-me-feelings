const ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
const credentials = require('../config/config');
//const { stateDict, countryDict } = require('../reference/dictionary');
const db = require('../database');
//const topics = require('../reference/topics');

const today = Date.now();
const timePeriods = {
  day: today - 86400000,
  week: today - 86400000 * 7,
  month: today - 86400000 * 30
}

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
  const stateDict = { 'AL': 'Alabama', 'MD': 'Maryland' }; // for testing
  const countryDict = { 'CN': 'China', 'JP': 'Japan' }; // for testing
  let stateTopicCounter = 0;
  let countryTopicCounter = 0;

  db.StateTopicToneAverages.remove().then(() => {
    db.StateTones.find({}, (err, analyzedStateArticleTones) => {
      //loop through all time frames
      for (let period in timePeriods) {

        for (let stateCode in stateDict) {
          topics.forEach(topic => {
            console.log('Calculating average for state', stateCode, 'on topic', topic, '. Iteration', stateTopicCounter++);
            //get all the articles with tagged with that state and topic
            const currentBatch = analyzedStateArticleTones.filter(article => {
              const articleDate = new Date(article.date);
              const dateMS = articleDate.getTime(articleDate);
              return article.state === stateCode && article.topic === topic && dateMS >= timePeriods[period];
            });
            console.log('There are', currentBatch.length, 'articles from', stateCode,'over the past', period + '.');
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
              period: period,
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

      }
    });
  });
  
  // repeat for country tones 
  db.CountryTopicToneAverages.remove().then(() => {
    db.CountryTones.find({}, (err, analyzedCountryArticleTones) => {
      //loop through all time frames
      for (let period in timePeriods) {

        for (let countryCode in countryDict) {
          topics.forEach(topic => {
            console.log('Calculating average for country', countryCode, 'on topic', topic, '. Iteration', countryTopicCounter++);
            //get all the articles with tagged with that state and topic
            const currentBatch = analyzedCountryArticleTones.filter(article => {
              const articleDate = new Date(article.date);
              const dateMS = articleDate.getTime(articleDate);
              return article.country === countryCode && article.topic === topic && dateMS >= timePeriods[period];
            });
            console.log('There are', currentBatch.length, 'articles from', countryCode, 'over the past', period + '.');
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
              period: period,
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

      }
    });
  });
};

const addTones = () => {
  let counter = 0;

  //clear StateTones and CountryTones
  db.StateTones.remove().then(() => {
    return db.CountryTones.remove();
  }).then(() => {
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
                tones,
                articleTitle: article.title,
                url: article.url,
                date: article.date
              });
            } else {
              analyzedArticleTones = new db.CountryTones({
                country: countryCode,
                topic,
                tones,
                articleTitle: article.title,
                url: article.url,
                date: article.date
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
  });
};


module.exports = {
  analyze: addTones,
  clearAllToneData
};
