const mongoose = require('mongoose');
const axios = require('axios');
const Article = require('../database/models/Article');
const dictionary = require('../database/dictionary').dictionary;
const config = require('../config/config'); // PRIVATE FILE - DO NOT COMMIT!
const stateCodes = require('../database/dictionary').stateCodeArr;
const WEBHOSE_API_KEY = config['WEBHOSE_API_KEY'];

const getSearchStr = stateCode => {
  const fullStateName = dictionary[stateCode].replace(/\s/g, '%20');
  const twoDaysAgo = Date.now() - 2 * 86400000; // 86400000ms in a day
  return (
    `http://webhose.io/filterWebContent?token=${WEBHOSE_API_KEY}&format=json&ts=${twoDaysAgo}` +
    `&sort=published&q=is_first%3Atrue%20language%3Aenglish%20published%3A%3E${twoDaysAgo}` +
    `%20site_type%3Anews%20thread.country%3AUS%20performance_score%3A%3E7%20location%3A%22${fullStateName}%22`
  );
};

const clearStateData = stateCode => {
  Article.find({ stateCode }).remove(() => {
    console.log(stateCode + ' Cleared from DB');
  });
};

const getStateData = function(stateCode) {
  const queryString = getSearchStr(stateCode);

  axios
    .get(queryString)
    .then(result => {
      const totalResults = result.data.totalResults;
      console.log(totalResults + ' articles rec\'d for ' + stateCode + ' in hose-response');

      if (totalResults > 0) {
        clearStateData(stateCode);
      } else {
        console.log('ZERO NEW Articles for ' + stateCode + ', leaving STALE DATA as is.');
      }

      const arrOfArticleObj = result.data.posts;
      arrOfArticleObj.forEach(articleObj => {
        const inbound = new Article({
          uuid: articleObj.uuid,
          date: articleObj.published,
          stateCode: stateCode,
          text: articleObj.text,
          title: articleObj.title,
          url: articleObj.url
        });
        inbound.save(err => {
          err ? console.error(err) : console.log('saved uuid-', articleObj.uuid);
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
  onlyFirstState.forEach((stateCode, i) => {
    // stateCodes.forEach( (stateCode,i) => {
    setTimeout(() => {
      getStateData(stateCode);
    }, i * 1000);
  });
};

module.exports = dailyRefresh;
