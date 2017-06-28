var express = require('express');
var bodyParser = require('body-parser');
var axios = require('axios');
var items = require('../database-mongo');
var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

var app = express();

// UNCOMMENT FOR REACT
app.use(express.static(__dirname + '/../react-client/dist'));


// create instance of Tone Analyzer service
var toneAnalyzer = new ToneAnalyzerV3({
  username: 'b3e055a0-d5f2-4d3a-ad28-9493a6dfe847',
  password: 'hELQjqCGqz1s',
  version_date: '2016-05-19'
});

var params = {
  // Get the text from the JSON file.
  text: require(__dirname + '/../apis/news-sample.json').text,
  tones: 'emotion', // omit for all three, comma separated list
  sentences: false
};

toneAnalyzer.tone(params, function(error, response) {
  error ? console.log('error:', error) : console.log(JSON.stringify(response, null, 2));
});


app.get('/items', function (req, res) {
  items.selectAll(function(err, data) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json(data);
    }
  });
});


// req.body.params.tone > 
// app.get('/tones', function (req, res) {
//   axios({
//     method: 'post',
//     url: 'https://gateway.watsonplatform.net/tone-analyzer/api/v3/tone?version=2016-05-19&senetences=false',
//     data: {
//       user: 'b3e055a0-d5f2-4d3a-ad28-9493a6dfe847:hELQjqCGqz1s',
//       data: '{\'text\': \'Hi Team, I know the times are difficult! Our sales have been disappointing for the past three quarters for our data analytics product suite. We have a competitive data analytics product suite in the industry. But we need to do our job selling it! \'}'   
//     }
//   })
//     .then( (result) => { 
//       console.log('Watson: Saved tone analysis');
//       res.send(result); 
//     })
//     .catch( (err) => { console.log('Watson: Error ', err); });
// });


// API request to Watson
// axios({
//   method: 'post',
//   url: 'https://gateway.watsonplatform.net/tone-analyzer/api/v3/tone?version=2016-05-19&senetences=false',
//   data: {
//     user: 'b3e055a0-d5f2-4d3a-ad28-9493a6dfe847:hELQjqCGqz1s',
//     data: '{\'text\': \'Hi Team, I know the times are difficult! Our sales have been disappointing for the past three quarters for our data analytics product suite. We have a competitive data analytics product suite in the industry. But we need to do our job selling it! \'}'   
//   }
// })
//   .then( (res) => { console.log('Watson: Saved tone analysis'); })
//   .catch( (err) => { console.log('Watson: Error ', err); });



app.listen(3000, function() {
  console.log('listening on port 3000!');
});

