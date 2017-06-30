var mongoose = require('mongoose');
var Article = require('../database-mongo/index');
var axios = require('axios');
var bodyParser = require('body-parser'); // ??
var reference = require('../database-mongo/dictionary');
    var statesList = reference.stateCodeArr;
var configFile = require('../config/config'); // PRIVATE FILE - DO NOT COMMIT!
    var WEBHOSE_API_KEY = configFile['WEBHOSE_API_KEY'];

var searchString = function(stateCode){
  var fullTextName = reference.dictionary[stateCode];
      fullTextName.replace(/\s/g, '%20');

/* for TIME: Must be in Unix ms which are 13-integers long! */
  var timeNow = new Date().getTime(); // time in Unix Epoch ms...
  var twoDaysAgo = timeNow - 86400000 - 86400000; // 86400000ms in a day
  return 'http://webhose.io/filterWebContent?token=e6d255ff-1622-4b08-9098-81186a9ca40e&format=json&ts=' +
         twoDaysAgo +
         '&sort=published&q=is_first%3Atrue%20language%3Aenglish%20published%3A%3E' +
         twoDaysAgo +
         '%20site_type%3Anews%20thread.country%3AUS%20performance_score%3A%3E7%20location%3A%22+' +
         fullTextName +
         '%22';
};

var getStateData = function(stateCode){
    var queryString = searchString(stateCode);
    axios.get(queryString)
    .then( (result) => { console.log('result from hose:'); } )
    .catch( (error) => { console.error(" UH OH!!! -->", error); } );
};

var dailyRefresh = function(){
    var dbServer = 'mongodb://localhost/NewsFile';
    var db = mongoose.createConnection(dbServer);

    db.dropDatabase();

    statesList.forEach((stateCode) => {
      getStateData(stateCode);
    });
};

module.exports = dailyRefresh;