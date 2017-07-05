const mongoose = require('mongoose');
const axios = require('axios');
const dbIndex = require('../database/index');
const dbDict = require('../database/dictionary');
const config = require('../config/config'); // PRIVATE FILE - DO NOT COMMIT!

const Article = dbIndex.Article;
const statesList = dbDict.stateCodeArr;
const WEBHOSE_API_KEY = config['WEBHOSE_API_KEY'];

const getSearchStr = stateCode => {
  const fullTextName = dbDict.dictionary[stateCode].replace(/\s/g, '%20');
  const timeNow = new Date().getTime(); // time in Unix Epoch ms...
  const twoDaysAgo = timeNow - 86400000 - 86400000; // 86400000ms in a day
<<<<<<< HEAD
  return 'http://webhose.io/filterWebContent?token=' +
          WEBHOSE_API_KEY +
          '&format=json&ts=' +
          twoDaysAgo +
          '&sort=published&q=is_first%3Atrue%20language%3Aenglish%20published%3A%3E' +
          twoDaysAgo +
          '%20site_type%3Anews%20thread.country%3AUS%20performance_score%3A%3E7%20location%3A%22' +
          fullTextName +
          '%22';
};

const clearStateData = stateCode => {
  Article.find( {stateCode: stateCode} )
         .remove( () => { console.log( stateCode + ' Cleared from DB'); });
=======
  return (
    'http://webhose.io/filterWebContent?token=' +
    WEBHOSE_API_KEY +
    '&format=json&ts=' +
    twoDaysAgo +
    '&sort=published&q=is_first%3Atrue%20language%3Aenglish%20published%3A%3E' +
    twoDaysAgo +
    '%20site_type%3Anews%20thread.country%3AUS%20performance_score%3A%3E7%20location%3A%22' +
    fullTextName +
    '%22'
  );
};

const clearStateData = stateCode => {
  Article.find({ stateCode: stateCode }).remove(() => {
    console.log(stateCode + ' Cleared from DB');
  });
>>>>>>> 24369b858f7018e266b8c620a16f01e0b8dbacba
};

const getStateData = function(stateCode) {
  const queryString = getSearchStr(stateCode);

<<<<<<< HEAD
  axios.get(queryString)
    .then(result => {
      const totalResults = result.data.totalResults;
      console.log( totalResults + ' articles rec\'d for ' + stateCode + ' in hose-response');

      if ( totalResults > 0 ) {
=======
  axios
    .get(queryString)
    .then(result => {
      const totalResults = result.data.totalResults;
      console.log(totalResults + ' articles rec\'d for ' + stateCode + ' in hose-response');

      if (totalResults > 0) {
>>>>>>> 24369b858f7018e266b8c620a16f01e0b8dbacba
        clearStateData(stateCode);
      } else {
        console.log('ZERO NEW Articles for ' + stateCode + ', leaving STALE DATA as is.');
      }

      const arrOfArticleObj = result.data.posts;
      arrOfArticleObj.forEach(articleObj => {
<<<<<<< HEAD
        let inbound = new Article({
=======
        const inbound = new Article({
>>>>>>> 24369b858f7018e266b8c620a16f01e0b8dbacba
          uuid: articleObj.uuid,
          date: articleObj.published,
          stateCode: stateCode,
          text: articleObj.text,
          title: articleObj.title,
          url: articleObj.url
        });
        inbound.save(err => {
<<<<<<< HEAD
          if (err) { console.error(err); } // otherwise...
=======
          if (err) {
            console.error(err);
          } //otherwise...
>>>>>>> 24369b858f7018e266b8c620a16f01e0b8dbacba
          console.log('saved uuid-', articleObj.uuid);
        });
      });
    })
<<<<<<< HEAD
    .catch(error => { console.error('ERROR!!! For State' + stateCode + '-->', error); } );
=======
    .catch(error => {
      console.error(' ERROR!!! For State' + stateCode + '-->', error);
    });
>>>>>>> 24369b858f7018e266b8c620a16f01e0b8dbacba
};

const dailyRefresh = () => {
  // TO REQUEST DATA FOR ALL STATES - COMMENT OUT LINES 67-68, AND UN-COMMENT LINE 70
<<<<<<< HEAD
  // var onlyFirstTenStates = statesList.slice(0,9);
  let onlyFirstState = statesList.slice(0, 1); //testing with one state
  onlyFirstState.forEach( (stateCode, i) => {
  // statesList.forEach( (stateCode,i) => {
    setTimeout(
      function () { getStateData(stateCode); },
      i * 1000
    );
=======
  // const onlyFirstTenStates = statesList.slice(0,9);
  const onlyFirstState = statesList.slice(0, 1); //testing with one state
  onlyFirstState.forEach((stateCode, i) => {
    // statesList.forEach( (stateCode,i) => {
    setTimeout(() => {
      getStateData(stateCode);
    }, i * 1000);
>>>>>>> 24369b858f7018e266b8c620a16f01e0b8dbacba
  });
};

module.exports = dailyRefresh;
