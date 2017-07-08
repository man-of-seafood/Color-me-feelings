const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const countryTopicToneAveragesSchema = new Schema({
  period: String,
  country: String,
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

module.exports = mongoose.model('CountryTopicToneAverages', countryTopicToneAveragesSchema);