const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dbURI = 'mongodb://localhost/NewsDB';
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
mongoose.connect(dbURI);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'db connection error!'));
db.once('open', function(){ console.log('mongoose connected successfully'); });
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

var articleSchema = new Schema({
  uuid: { type: String, required: true},
  date: { type: Date, default: Date.now },
  stateCode: { type: String, uppercase: true, minlength: 2, maxlength: 2 },
  text: String,
  processed: { type: Boolean, default: false },
  scores: {
    joy: { type: Number, default: null },
    anger: { type: Number, default: null },
    disgust: { type: Number, default: null },
    fear: { type: Number, default: null },
    sadness: { type: Number, default: null }
  }
},{minimize: false});


var Article = mongoose.model('Article', articleSchema);
module.exports = Article;

// var selectAll = function(callback) {
//   Item.find({}, function(err, items) {
//     if(err) {
//       callback(err, null);
//     } else {
//       callback(null, items);
//     }
//   });
// };

// module.exports.selectAll = selectAll;