var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
var dbURI = 'mongodb://localhost:27017/NewsDB';
mongoose.connect(dbURI);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'db connection error!'));
db.once('open', function() { console.log('mongoose connected successfully'); });
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

var articleSchema = new Schema({
  uuid: { type: String, required: true},
  date: { type: Date, default: Date.now },
  stateCode: { type: String, uppercase: true, minlength: 2, maxlength: 2 },
  text: String
});

var stateTones = new Schema({
  state: String,
  tones: {
    anger: {type: Number, default: null},
    disgust: {type: Number, default: null},
    fear: {type: Number, default: null},
    sadness: {type: Number, default: null},
    joy: {type: Number, default: null}
  }
});

var StateTone = mongoose.model('StateTone', stateTones);
var Article = mongoose.model('Article', articleSchema);

module.exports = {
  StateTone: StateTone,
  Article: Article
};