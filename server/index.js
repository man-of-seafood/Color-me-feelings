var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var axios = require('axios');
var configFile = require('../config/config'); // PRIVATE FILE - DO NOT COMMIT!
var secret = configFile.keys;

var db = require('../database-mongo');
var refill = require('./addArticles');
var analyze = require('./callWatson');


app.use(express.static(__dirname + '/../react-client/dist'));

app.get('/items', function (req, res) {
  items.selectAll(function(err, data) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json(data);
    }
  });
});


/*~~~~~~~~~~~~~~~~~~~~~~~ STARTUP SERVER ~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
app.listen(3000, function() {
  console.log('listening on port 3000!');
});
