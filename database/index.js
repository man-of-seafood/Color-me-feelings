const mongoose = require('mongoose');
const Article = require('./models/Article');
const CountryTones = require('./models/CountryTones');
const StateTones = require('./models/StateTones');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const dbURI = 'mongodb://localhost:27017/NewsDB';
mongoose.connect(dbURI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'db connection error!'));
db.once('open', () => { console.log('mongoose connected successfully'); });

module.exports = { Article, CountryTones, StateTones };
