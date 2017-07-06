const mongoose = require('mongoose');
const axios = require('axios');
const WEBHOSE_API_KEY = require('../config/config').WEBHOSE_API_KEY; // PRIVATE FILE - DO NOT COMMIT!
const webhose = require('webhoseio').config({ token: WEBHOSE_API_KEY });
const Article = require('../database/models/Article');
const dictionary = require('../database/dictionary').dictionary;
const stateCodes = require('../database/dictionary').stateCodeArr;

const getSearchStr = (topic, stateCode) => {
  const stateName = dictionary[stateCode].replace(/\s/g, '%20');
  const twoDaysAgo = Date.now() - 2 * 86400000; // 86400000ms in a day
  return `'${topic}' language:english thread.country:US location:${stateName}`;
  // return (
  //   `http://webhose.io/filterWebContent?token=${WEBHOSE_API_KEY}&format=json&ts=${twoDaysAgo}` +
  //   `&sort=published&q=is_first%3Atrue%20language%3Aenglish%20published%3A%3E${twoDaysAgo}` +
  //   `%20site_type%3Anews%20thread.country%3AUS%20performance_score%3A%3E7%20location%3A%22${stateName}%22`
  // );
};

const clearStateData = stateCode => {
  Article.find({ stateCode }).remove(() => {
    console.log(stateCode + ' Cleared from DB');
  });
};

const getStateData = function(stateCode) {
  const queryString = getSearchStr('war', stateCode); // todo: TOPIC

  webhose
    .query(queryString)
    .then(result => {
      const resultCount = result.data.totalResults;
      console.log(resultCount + ' articles rec\'d for ' + stateCode + ' in hose-response');

      resultCount
        ? clearStateData(stateCode)
        : console.log('ZERO NEW Articles for ' + stateCode + ', leaving STALE DATA as is.');

      const articles = result.data.posts;
      articles.forEach(article => {
        const inbound = new Article({
          uuid: article.uuid,
          date: article.published,
          stateCode: stateCode,
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
  // TO REQUEST DATA FOR ALL STATES - COMMENT OUT LINES 67-68, AND UN-COMMENT LINE 70
  // const onlyFirstTenStates = stateCodes.slice(0,9);
  const onlyFirstState = stateCodes.slice(0, 1); //testing with one state
  // stateCodes.forEach( (stateCode,i) => {
  onlyFirstState.forEach((stateCode, i) => {
    setTimeout(() => {
      getStateData(stateCode);
    }, i * 1000);
  });
};

module.exports = dailyRefresh;
