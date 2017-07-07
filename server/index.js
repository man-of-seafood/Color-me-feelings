const express = require('express');
const app = express();
const axios = require('axios');
const CronJob = require('cron').CronJob;

const db = require('../database'); // initializes db
const refill = require('./addArticles');
const { analyze, clearAllToneData } = require('./callWatson');
const dict = require('../reference/dictionary.js');

app.use(express.static(__dirname + '/../public/dist'));

//*~~~ COUNTRY AND STATE ~~~~*/
app.get('/tones', function (req, res) {
  const collection = req.query.scope === 'state' ? 'StateTone' : 'CountryTone';
  db[collection].find({}, function(err, result) {
    err ? res.sendState(500) : res.json(result);
  });
});

// UNCOMMENT TO get new articles for database
// refill('state'); //grab state articles
// setTimeout(() => { refill('country'); }, 4500); //grab country articles
// setTimeout(() => { refill('country'); }, Object.keys(dict.stateDict).length * 1000); //grab country articles
//wait for all states to run, though it's hardcoded for testing

//clearAllToneData();

// UNCOMMENT TO analyze articles in the database
analyze(); //analyze state tones
//analyze('country'); //analyze country tones

//just require anywhere you want to start a job and change crontime based on what you want
const job = new CronJob({
  cronTime: '00 30 11 * * 1,5',
  onTick: function() {
    /* run whatever you want scheduled in here.
     * Runs every weekday (Monday and Friday)
     * at 11:30:00 AM.
     */
    // run news api call
  },
  function() {
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
