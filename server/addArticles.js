var mongoose = require('mongoose');
var article = require('../database-mongo/index.js');
var states = require('./stateConstants');
var configFile = require('../config/config'); // PRIVATE FILE - DO NOT COMMIT!
var WEBHOSE_API_KEY = configFile['WEBHOSE_API_KEY'];

var dbServer = 'mongodb://localhost/NewsFile';
var db = mongoose.createConnection(dbServer);

/* drop the database collection?...
db.dropDatabase()
db.articles.remove({}) ? ;
  OR?
  OR?
Article.find({}, function(err, allArticles) { // Obj{} of ALL Articles
  if (err) throw err;
  // otherwise success...
  console.log(allArticles);
});

OR?

db.articles.remove({}) // deletes everything in the databases' foo collection


Article.deleteMany({}, function (err) {})

Article.create({ size: 'small' }, function (err, small) {
  if (err) return handleError(err);
  // saved!
})


//
*/