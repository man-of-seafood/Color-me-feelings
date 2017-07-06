const db = require('../database');
const ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
const credentials = require('../config/config'); // PRIVATE FILE - DO NOT COMMIT!
const dict = require('../reference/dictionary'); // stateDict, countryDict

const stateDict = dict.stateDict;
const countryDict = dict.countryDict;

// create instance of Tone Analyzer service
const toneAnalyzer = new ToneAnalyzerV3({
  username: credentials.WATSON_TA_USERNAME,
  password: credentials.WATSON_TA_PASSWORD,
  version_date: '2016-05-19'
});

const params = {
  // Get the text from the JSON file.
  text: require(__dirname + '/../apis/news-sample.json').text,
  tones: 'emotion', // omit for all three, comma separated listtones: 'emotion', // omit for all three, comma separated list
  sentences: false
};

// stores state and tone data
// format {az: {joy: 0, fear: 0, disgust: 0}, ca: {joy...}}
const finalObj = {};

const makeAvg = (obj, divisor) => {
  for (const tone in obj) {
    obj[tone] = obj[tone] / divisor * 100;
  }
};

const callWatsonForScores = (articlesArr, finalObj, place, cb) => {
  // only run cb if there are articles about that stat/country - cb assures makeAvg and adding to db happens after watson data is returned
  // counter checks that all articles have been analyzed
  let counter = 0;
  console.log('analyzing', articlesArr.length, 'articles in Watson for', place);

  articlesArr.forEach( (article) => {
    params.text = article.text;
    toneAnalyzer.tone(params, (err, res) => {
      if (err) { 
        console.log('Watson: Error retreiving tone analysis', err); 
      } else {
        counter++;

        // index of tone according to Watson response
        const angerScore = res.document_tone.tone_categories[0].tones[0].score;
        const disgustScore = res.document_tone.tone_categories[0].tones[1].score;
        const fearScore = res.document_tone.tone_categories[0].tones[2].score;
        const joyScore = res.document_tone.tone_categories[0].tones[3].score;
        const sadnessScore = res.document_tone.tone_categories[0].tones[4].score;
        // sum az's scores
        finalObj[place].anger = finalObj[place].anger + angerScore;
        finalObj[place].disgust = finalObj[place].disgust + disgustScore;
        finalObj[place].fear = finalObj[place].fear + fearScore;
        finalObj[place].joy = finalObj[place].joy + joyScore;
        finalObj[place].sadness = finalObj[place].sadness + sadnessScore;
        if (counter === articlesArr.length) { cb(); }
      }
    });
  });

};

/*~~~ COUNTRY AND STATE ~~~*/
const addTones = (type) => {
  const collection = type === 'state' ? 'StateTone' : 'CountryTone'; 
  const codeType = type === 'state' ? 'stateCode' : 'countryCode'; 
  // UNCOMMENT next line to loop through all, currently limiting API calls
  // const refObj = req.query.scope === 'state' ? stateDict : countryDict;
  // then COMMENT out below line
  const refObj = type === 'state' ? { 'AL': 'Alabama', 'MD': 'Maryland' } : { 'CN': 'China', 'JP': 'Japan' };

  // remove existing document from db
  db[collection].remove().then( () => {

    // loop through states/countries
    for (let key in refObj) {

      // find all articles about state/country in db
      const codeObj = type === 'state' ? { 'stateCode': key } : { 'countryCode': key };
      db.Article.find(codeObj, (err, allArticles) => {
        if (err) { 
          console.log(`Error getting ${key} articles in db`, err); 
        } else {
          finalObj[key] = {
            anger: 0, 
            disgust: 0, 
            fear: 0, 
            joy: 0, 
            sadness: 0
          };
          // run analyzer on all articles about state/country, add to finalObj
          callWatsonForScores(allArticles, finalObj, key, () => {
            // avg scores for state/country
            makeAvg(finalObj[key], allArticles.length);

            // create document
            let newTone = new db[collection]({
              tones: {
                anger: finalObj[key].anger, 
                disgust: finalObj[key].disgust, 
                fear: finalObj[key].fear, 
                joy: finalObj[key].joy, 
                sadness: finalObj[key].sadness
              }
            });
            newTone[type] = key;
            newTone.save((err, result) => {
              if (err) { console.log(`There was an error saving ${key}'s tone data`); } 
            });
          });
        }
      });
    };
  });
};

module.exports = addTones;
