var mongoose = require('mongoose');
var Article = require('../database-mongo/index');
var axios = require('axios');
var bodyParser = require('body-parser'); // ??
var reference = require('../database-mongo/dictionary');
    var statesList = reference.stateCodeArr;
var configFile = require('../config/config'); // PRIVATE FILE - DO NOT COMMIT!
    var WEBHOSE_API_KEY = configFile['WEBHOSE_API_KEY'];

// var dbServer = 'mongodb://localhost/NewsFile';
// var db = mongoose.createConnection(dbServer);
// db.dropDatabase();

var searchString = function(stateCode){
  var fullTextName = reference.dictionary[stateCode];
      fullTextName.replace(/\s/g, '%20');
/*
For Thu, 29 Jun 2017 00:00:00 PST -->> Epoch timestamp: 1498719600
Human time (PST): Thursday, June 29, 2017 12:00:00 AM GMT-07:00
Human time (GMT): Thursday, June 29, 2017 7:00:00 AM
            Timestamp in milliseconds: 1498719600000

For Wed, 28 Jun 2017 00:00:00 PST -->> Epoch timestamp: 1498633200
Human time (PST): Wednesday, June 28, 2017 12:00:00 AM GMT-07:00
Human time (GMT): Wednesday, June 28, 2017 7:00:00 AM
            Timestamp in milliseconds: 1498633200000
*/
  var timeNow = new Date().getTime(); // time in Unix secs...
  var twoDaysAgo = timeNow - 86400000 - 86400000; // 86400secs in a day or 86400000ms
  return 'http://webhose.io/filterWebContent?token=e6d255ff-1622-4b08-9098-81186a9ca40e&format=json&ts='+ timeNow + '&sort=published&q=language%3Aenglish%20published%3A%3E'+ twoDaysAgo +'%20site_type%3Anews%20performance_score%3A%3E5%20location%3A%22' + fullTextName + '%22';
};

var getStateData = function(stateCode){
    var queryString = searchString(stateCode);
    axios.get(queryString)
    .then( (result) => { console.log('result from hose:'); } )
    .catch( (error) => { console.error(" UH OH!!! -->", error); } );
};

module.exports = getStateData;


// 13 places