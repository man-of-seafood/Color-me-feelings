const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const stateTopicToneAveragesSchema = new Schema({
  period: String,
  state: String,
  topic: String,
  toneAverages: {
    anger: { type: Number, default: null },
    disgust: { type: Number, default: null },
    fear: { type: Number, default: null },
    sadness: { type: Number, default: null },
    joy: { type: Number, default: null }
  },
  articles: Array
});

module.exports = mongoose.model('StateTopicToneAverages', stateTopicToneAveragesSchema);


// const asdf = mongoose.model('StateTopicToneAverages', stateTopicToneAveragesSchema);

// console.log(new asdf({
//   state: 'CA',
//   topic: 'blah',
//   articles: [['title', 'http://bbc.com']]
// }));d