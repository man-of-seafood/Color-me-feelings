const express = require('express');
const app = express();
const axios = require('axios');
const CronJob = require('cron').CronJob;
const db = require('../database');
const refill = require('./addArticles');
const analyze = require('./callWatson');


app.use(express.static(__dirname + '/../react-client/dist'));

app.get('/tones', function (req, res) {
  db.StateTone.find({}, function(err, stateTones) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json(stateTones);
    }
  });
});

// UNCOMMENT TO get new articles for database
refill();
// UNCOMMENT TO analyze articles in the database
// analyze(); 

//just require anywhere you want to start a job and change crontime based on what you want
const job = new CronJob({
  cronTime: '00 30 11 * * 1,5',
  onTick: function() {
    /* run whatever you want scheduled in here.
     * Runs every weekday (Monday and Friday)
     * at 11:30:00 AM.
     */

     // run news api call
  }, function() {
    //can remove, but runs when job is finished

    // run watson + add tones to db
    analyze();
  },
  start: false,
  timeZone: 'America/Los_Angeles'
});
job.start();
/*~~~~~~~~~~~~~~~~~~~~~~~ STARTUP SERVER ~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
app.listen(3000, function() {
  console.log('listening on port 3000!');
});
