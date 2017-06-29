var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var axios = require('axios');
var configFile = require('../config/config'); // PRIVATE FILE - DO NOT COMMIT!
var secret = configFile.keys;

var db = require('../database-mongo');
var refill = require('./addArticles');
var analyze = require('./callWatson');
var CronJob = require('cron').CronJob;


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
//just require anywhere you want to start a job and change crontime based on what you want
var job = new CronJob({
  cronTime: '00 30 11 * * 1,5',
  onTick: function() {
    /* run whatever you want scheduled in here.
     * Runs every weekday (Monday and Friday)
     * at 11:30:00 AM. 
     */
  }, function() {
    //can remove, but runs when job is finihsed
  },
  start: false,
  timeZone: 'America/Los_Angeles'
});
job.start();
/*~~~~~~~~~~~~~~~~~~~~~~~ STARTUP SERVER ~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
app.listen(3000, function() {
  console.log('listening on port 3000!');
});
