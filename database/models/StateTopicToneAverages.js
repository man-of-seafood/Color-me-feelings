const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const stateTopicToneAveragesSchema = new Schema({
  state: String,
  topic: String,
  toneAverages: {
    anger: { type: Number, default: null },
    disgust: { type: Number, default: null },
    fear: { type: Number, default: null },
    sadness: { type: Number, default: null },
    joy: { type: Number, default: null }
  }
});

module.exports = mongoose.model('StateTopicToneAverages', stateTopicToneAveragesSchema);