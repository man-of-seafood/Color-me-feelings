var Promise = require('bluebird');
var mongoose = require('mongoose');
var dbSetup = require('../database-mongo/index');
    var Article = dbSetup.Article;
var axios = require('axios');
var reference = require('../database-mongo/dictionary');
    var statesList = reference.stateCodeArr;
var configFile = require('../config/config'); // PRIVATE FILE - DO NOT COMMIT!
    var WEBHOSE_API_KEY = configFile.keys['WEBHOSE_API_KEY'];

  var getSearchStr = function(stateCode){
    var fullTextName = reference.dictionary[stateCode];
        fullTextName.replace(/\s/g, '%20');

    /* TIME: Must be in Unix ms which are 13-integers long! */
    var timeNow = new Date().getTime(); // time in Unix Epoch ms...
    var twoDaysAgo = timeNow - 86400000 - 86400000; // 86400000ms in a day
    return 'http://webhose.io/filterWebContent?token='+
            WEBHOSE_API_KEY +
            '&format=json&ts=' +
            twoDaysAgo +
            '&sort=published&q=is_first%3Atrue%20language%3Aenglish%20published%3A%3E' +
            twoDaysAgo +
            '%20site_type%3Anews%20thread.country%3AUS%20performance_score%3A%3E7%20location%3A%22' +
            fullTextName +
            '%22';
  };

  var getStateData = function(stateCode){
    var queryString = getSearchStr(stateCode);

    axios.get(queryString)
    .then( (result) => {
      var respObj = result.data;
      var totalResults = respObj.totalResults;
      console.log( totalResults+' total articles for '+ stateCode+' in rec\'d hose-response');

      var arrOfArticleObj = respObj.posts;
      arrOfArticleObj.forEach( (articleObj) => {
        var artuuid = articleObj.uuid;
        var artDate = articleObj.published;
        var artText = articleObj.text;

        var inbound = new Article({uuid: artuuid, date:artDate, stateCode:stateCode, text:artText})
        inbound.save( function(err) {
          if (err){ console.error(err); }  //otherwise...
          console.log('uuid saved...', artuuid);
        });
      });
    })
    .catch( (error) => { console.error(" UH OH!!! -->", error); } );
  };

  var dailyRefresh = function(){
    Article.find({}).remove(() => {console.log('DB Cleared');});

    var smallSample = statesList.slice(0,2);
    smallSample.forEach( (stateCode) => {
      getStateData(stateCode);
    });
  };

module.exports = dailyRefresh;