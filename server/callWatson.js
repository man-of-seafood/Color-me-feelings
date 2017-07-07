const ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
const credentials = require('../config/config');
const { stateDict, countryDict } = require('../reference/dictionary');
const db = require('../database');

const toneAnalyzer = new ToneAnalyzerV3({
  username: credentials.WATSON_TA_USERNAME,
  password: credentials.WATSON_TA_PASSWORD,
  version_date: '2016-05-19'
});

// const params = {
//   // Get the text from the JSON file.
//   text: require(__dirname + '/../apis/news-sample.json').text,
//   tones: 'emotion', // omit for all three, comma separated listtones: 'emotion', // omit for all three, comma separated list
//   sentences: false
// };

// stores state and tone data
// format {az: {joy: 0, fear: 0, disgust: 0}, ca: {joy...}}

// const makeAvg = (obj, divisor) => {
//   for (const tone in obj) {
//     obj[tone] = obj[tone] / divisor * 100;
//   }
// };

// const callWatsonForScores = (articlesArr, finalObj, place, cb) => {
//   // only run cb if there are articles about that stat/country - cb assures makeAvg and adding to db happens after watson data is returned
//   // counter checks that all articles have been analyzed
//   let counter = 0;
//   console.log('analyzing', articlesArr.length, 'articles in Watson for', place);

//   articlesArr.forEach(article => {
//     params.text = article.text;
//     toneAnalyzer.tone(params, (err, res) => {
//       if (err) {
//         console.log('Watson: Error retreiving tone analysis', err);
//       } else {
//         counter++;

//         const tones = res.document_tone.tone_categories[0].tones;

//         // index of tone according to Watson response
//         const angerScore = tones[0].score;
//         const disgustScore = tones[1].score;
//         const fearScore = tones[2].score;
//         const joyScore = tones[3].score;
//         const sadnessScore = tones[4].score;

//         finalObj[place].anger += angerScore;
//         finalObj[place].disgust += disgustScore;
//         finalObj[place].fear += fearScore;
//         finalObj[place].joy += joyScore;
//         finalObj[place].sadness += sadnessScore;
//         if (counter === articlesArr.length) {
//           cb();
//         }
//       }
//     });
//   });
// };

const averageTonesForState // todo

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
              state: stateDict.stateCode,
              topic,
              tones
            });
          } else {
            analyzedArticleTones = new db.CountryTones({
              country: stateDict.countryCode,
              topic,
              tones
            });
          }

          analyzedArticleTones.save((err, success) => {
            err ? console.log('ERROR saving:', err) : counter++;
            if (counter === articles.length) {
              //calculate the averages

            }
          });
        });
      });
      console.log('outside the foreach', counter);
    }
  });
};




/*~~~ COUNTRY AND STATE ~~~*/
// const addTones = type => {
//   const collection = type === 'state' ? 'StateTones' : 'CountryTones';
//   const codeType = type === 'state' ? 'stateCode' : 'countryCode';

//   // UNCOMMENT next line to loop through all, currently limiting API calls
//   // const refObj = req.query.scope === 'state' ? stateDict : countryDict;
//   // then COMMENT out below line

//   const refObj =
//     type === 'state' ? { AL: 'Alabama', MD: 'Maryland' } : { CN: 'China', JP: 'Japan' };

//   // remove existing document from db
//   db[collection].remove().then(() => {
//     // loop through states/countries
//     for (let key in refObj) {
//       // find all articles about state:topic/country:topic in db
//       const codeObj = type === 'state' ? { stateCode: key } : { countryCode: key };

//       finalObj[key] = {};

//       db.Article.find(codeObj, (err, allArticles) => {
//         if (err) {
//           console.log(`Error getting ${key} articles in db`, err);
//         } else {
//           const topics = [
//             'Donald Trump',
//             'immigration',
//             'war',
//             'coffee',
//             'obesity',
//             'education',
//             'marijuana',
//             'refugees',
//             'capitalism',
//             'global warming'
//           ];

//           topics.forEach(topic => {
//             const articlesOnTopic = allArticles.filter(article => article.topic === topic);

//             finalObj[key][topic] = {
//               anger: 0,
//               disgust: 0,
//               fear: 0,
//               joy: 0,
//               sadness: 0
//             };

//             callWatsonForScores(allArticles, finalObj, key, () => {
//               makeAvg(finalObj[key], allArticles.length);

//               let newTone = new db[collection]({
//                 tones: {
//                   anger: finalObj[key].anger,
//                   disgust: finalObj[key].disgust,
//                   fear: finalObj[key].fear,
//                   joy: finalObj[key].joy,
//                   sadness: finalObj[key].sadness
//                 }
//               });
//               newTone[type] = key;
//               newTone.save((err, result) => {
//                 if (err) {
//                   console.log(`There was an error saving ${key}'s tone data`);
//                 }
//               });
//             });
//           });
//         }
//       });
//     }
//   });
// };

module.exports = addTones;
