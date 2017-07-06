// var Promise = require('bluebird');
const mongoose = require('mongoose');
const axios = require('axios');
const dbIndex = require('../database-mongo/index');
const dbDict = require('../database-mongo/dictionary');
const config = require('../config/config'); // PRIVATE FILE - DO NOT COMMIT!

const Article = dbIndex.Article;
const statesList = dbDict.stateDict;
const countriesList = dbDict.countryDict;
const WEBHOSE_API_KEY = config['WEBHOSE_API_KEY'];

// const getSearchStr = stateCode => {
//   const fullTextName = dbDict.dictionary[stateCode].replace(/\s/g, '%20');
//   const timeNow = new Date().getTime(); // time in Unix Epoch ms...
//   const twoDaysAgo = timeNow - 86400000 - 86400000; // 86400000ms in a day
//   return 'http://webhose.io/filterWebContent?token='+
//           WEBHOSE_API_KEY +
//           '&format=json&ts=' +
//           twoDaysAgo +
//           '&sort=published&q=is_first:true language:english published:>' +
//           twoDaysAgo +
//           ' site_type:news thread.country:US performance_score:>7 location:"' +
//           fullTextName +
//           '"';
// };

// const clearStateData = stateCode => {
//   Article.find( {stateCode: stateCode} )
//          .remove( () => { console.log( stateCode + ' Cleared from DB'); });
// }

// const getStateData = function (stateCode) {
//   const queryString = getSearchStr(stateCode);

//   axios.get(queryString)
//   .then(result => {
//     const totalResults = result.data.totalResults;
//     console.log( totalResults + ' articles rec\'d for ' + stateCode + ' in hose-response');

//     if ( totalResults > 0 ){
//       clearStateData(stateCode);
//     } else {
//       console.log('ZERO NEW Articles for ' + stateCode + ', leaving STALE DATA as is.');
//     }

//     const arrOfArticleObj = result.data.posts;
//     arrOfArticleObj.forEach(articleObj => {
//       let inbound = new Article({
//         uuid: articleObj.uuid,
//         date: articleObj.published,
//         stateCode: stateCode,
//         text: articleObj.text,
//         title: articleObj.title,
//         url: articleObj.url
//       });
//       inbound.save(err => {
//         if (err) { console.error(err); }  //otherwise...
//         console.log('saved uuid-', articleObj.uuid);
//       });
//     });
//   })
//   .catch(error => { console.error(" ERROR!!! For State" + stateCode + "-->", error); } );
// };

// const dailyRefresh = () => {
//   // TO REQUEST DATA FOR ALL STATES - COMMENT OUT LINES 67-68, AND UN-COMMENT LINE 70
//   // var onlyFirstTenStates = statesList.slice(0,9);
//   let onlyFirstState = statesList.slice(0, 1); //testing with one state
//   onlyFirstState.forEach( (stateCode, i) => {
//   // statesList.forEach( (stateCode,i) => {
//     setTimeout(
//       function () { getStateData(stateCode) },
//       i * 1000
//     );
//   });
// };

/*~~~ COUNTRY ~~~*/
const getSearchStr = countryCode => {
  // const fullTextName = dbDict.dictionary[stateCode].replace(/\s/g, '%20');
  const timeNow = new Date().getTime(); // time in Unix Epoch ms...
  const twoDaysAgo = timeNow - 86400000 - 86400000; // 86400000ms in a day
  return 'http://webhose.io/filterWebContent?token='+
          WEBHOSE_API_KEY +
          '&format=json&ts=' +
          twoDaysAgo +
          '&sort=published&q=is_first:true language:english published:>' +
          twoDaysAgo +
          ' site_type:news thread.country:' +
          countryCode +
          ' performance_score:>7 location:"china"';
};


const getQueryStr = (code, type) => {
  let refObj, countryCode;
  if (type === 'state') { 
    refObj = stateDict;
    countryCode = 'US';
  } else {
    refObj = countryDict;
    countryCode = code;
  }
  const locationStr = refObj[code];
  const timeNow = new Date().getTime(); // time in Unix Epoch ms...
  const twoDaysAgo = timeNow - 86400000 - 86400000; // 86400000ms in a day

  return 'http://webhose.io/filterWebContent?token='+
          WEBHOSE_API_KEY +
          '&format=json&ts=' +
          twoDaysAgo +
          '&sort=published&q=is_first:true language:english published:>' +
          twoDaysAgo +
          ' site_type:news thread.country:' +
          countryCode +
          ' performance_score:>7 location:"' +
          locationStr +
          '"';
}

const getArticles = (code, type) => {
  const queryString = getSearchStr(code, type);

  axios.get(queryString)
  .then(result => {
    const totalResults = result.data.totalResults;
    console.log(totalResults, 'articles rec\'d for', type, code, 'in hose-response');

    if ( totalResults > 0 ){
      clearArticles(code, type);
    } else {
      console.log('ZERO NEW Articles for', type, code, ', leaving STALE DATA as is.');
    }

    const arrOfArticleObj = result.data.posts;
    arrOfArticleObj.forEach(articleObj => {
      const inbound = new Article({
        uuid: articleObj.uuid,
        date: articleObj.published,
        text: articleObj.text,
        title: articleObj.title,
        url: articleObj.url
      });
      const codeType = type === 'state' ? 'stateCode' : 'countryCode';
      inbound[codeType] = code;
      inbound.save(err => {
        if (err) { console.error(err); }  //otherwise...
        console.log('saved uuid-', articleObj.uuid);
      });
    });
  })
  .catch(error => { console.error('ERROR!!! For', type, code, '-->', error); });
};

const clearArticles = (code, type) => {
  const codeType = type === 'state' ? 'stateCode' : 'countryCode';
  Article.find( { codeType: code } )
         .remove(() => { console.log('Cleared', type, code, ' from DB'); });
}

const articleRefresh = (type) => {
  const refObj = type === 'state' ? { 'AL': 'Alabama' } : { 'JP': 'Japan' };
  let i = 0;

  for (let key in refObj) {
    i += 1000;
    setTimeout(() => { getArticles(key, type) }, i);
  }
};

module.exports = articleRefresh;