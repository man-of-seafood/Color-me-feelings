const mongoose = require('mongoose');
// const axios = require('axios');
const WEBHOSE_API_KEY = require('../config/config').WEBHOSE_API_KEY; // PRIVATE FILE - DO NOT COMMIT!
const webhose = require('webhoseio').config({ token: WEBHOSE_API_KEY });
const Article = require('../database/models/Article');
const dictionary = require('../database/dictionary').dictionary;
const stateCodes = require('../database/dictionary').stateCodeArr;

const getSearchStr = (topic, countryCode = 'US', stateCode) => {
  const stateName = dictionary[stateCode];
  const thirtyDaysAgo = Date.now() - 30 * 86400000; // 86400000ms in a day
  return (
    `thread.title:"${topic}" is_first:true crawled:>${thirtyDaysAgo} site_type:news` +
    ` language:english thread.country:${countryCode}` +
    (stateName ? ` location:${stateName}` : '')
  );
};

const clearStateData = stateCode => {
  Article.find({ stateCode }).remove(() => {
    console.log(stateCode + ' Cleared from DB');
  });
};

const getStateData = function(topic, countryCode, stateCode) {
  const queryString = getSearchStr(topic, countryCode, stateCode);
  console.log('programatically generated query String', queryString);
  webhose
    .query('filterWebContent', {q: queryString})
    .then(result => {
      //console.log(result);
      const resultCount = result.data.totalResults;
      console.log(resultCount + ' articles rec\'d for ' + stateCode + ' in hose-response');

      resultCount
        ? clearStateData(stateCode)
        : console.log('ZERO NEW Articles for ' + stateCode + ', leaving STALE DATA as is.');

      const articles = result.data.posts;
      articles.forEach(article => {
        const inbound = new Article({
          uuid: article.uuid,
          topic: topic,
          countryCode: countryCode || 'US',
          stateCode: stateCode || 'other country - no state provided',
          date: article.published,
          text: article.text,
          title: article.title,
          url: article.url
        });
        inbound.save(err => {
          err ? console.error(err) : console.log('saved uuid-', article.uuid);
        });
      });
    })
    .catch(error => {
      console.error(' ERROR!!! For State' + stateCode + '-->', error);
    });
};

const dailyRefresh = () => {
  const topics = ['war'];
  // const topics = ['love', 'war', 'coffee'];
  // const onlyFirstTenStates = stateCodes.slice(0, 9);
  //
  let queryCount = 0;
  const onlyFirstTwoStates = stateCodes.slice(0, 1);
  // stateCodes.forEach( (stateCode,i) => {
  onlyFirstTwoStates.forEach(stateCode => {
    topics.forEach(topic => {
      const countryCode = 'US';
      queryCount++;
      setTimeout(() => {
        getStateData(topic, countryCode, stateCode);
      }, queryCount * 1000);
    });
  });
};

module.exports = dailyRefresh;