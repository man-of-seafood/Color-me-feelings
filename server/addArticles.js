const { stateDict, countryDict } = require('../reference/dictionary');
const topics = require('../reference/topics');
const Article = require('../database/models/Article');
const ArticleAsync = require('bluebird').promisifyAll(Article);
const webhose = require('webhoseio').config({ token: require('../config/config').config.WEBHOSE_API_KEY });

/*~~~ COUNTRY AND STATE ~~~*/
const getQueryStr = (topic, code, type) => {
  let refObj;
  let countryCode;
  if (type === 'state') {
    refObj = stateDict;
    countryCode = 'US';
  } else {
    refObj = countryDict;
    countryCode = code;
  }
  const locationStr = refObj[code];
  const timeNow = new Date().getTime(); // time in Unix Epoch ms...
  const thirtyDaysAgo = timeNow - 30 * 86400000; // 86400000ms in a day

  return (
    `thread.title:"${topic}" is_first:true crawled:>${thirtyDaysAgo} site_type:news` +
    ` language:english thread.country:${countryCode} location:${locationStr}`
  );
};

const clearArticles = (topic, code, type) => {
  const codeObj = type === 'state' ? { stateCode: code, topic: topic } : { countryCode: code, topic: topic };
  Article.find(codeObj).remove(() => {
    console.log('Cleared', type, code, 'from DB');
  });
};

const getArticles = (topic, code, type) => {
  const queryString = getQueryStr(topic, code, type);
  console.log(queryString);

  webhose
    .query('filterWebContent', { q: queryString })
    .then(result => {
      const totalResults = result.posts.length;
      console.log(totalResults, 'articles rec\'d for', type, code, topic, 'in hose-response');

      if (totalResults > 0) {
        clearArticles(topic, code, type);
      } else {
        console.log('ZERO NEW Articles for', type, code, topic, ', leaving STALE DATA as is.');
      }

      const arrOfArticleObj = result.posts;
      arrOfArticleObj.forEach(articleObj => {
        const inbound = new Article({
          topic,  
          stateCode: type === 'state' ? code : 'Out of the motherland',
          countryCode: type === 'country' ? code : 'US',
          uuid: articleObj.uuid,
          date: articleObj.published,
          text: articleObj.text,
          title: articleObj.title,
          url: articleObj.url
        });
        const codeType = type === 'state' ? 'stateCode' : 'countryCode';
        inbound[codeType] = code;
        inbound.save(err => {
          if (err) {
            console.error(err);
          } //otherwise...
          console.log('saved uuid-', articleObj.uuid);
        });
      });
    })
    .catch(error => {
      console.error('ERROR!!! For', type, code, '-->', error);
    });
};

const articleRefresh = type => {
  // UNCOMMENT BELOW for testing with limited topics (and limited api calls)
  // const topics = ['war', 'coffee']

  const refObj = type === 'state' ? stateDict : countryDict;
  // UNCOMMENT BELOW line and COMMENT above for testing
  // const refObj =
  //   type === 'state' ? { 'AL': 'Alabama', 'MD': 'Maryland' } : { 'CN': 'China', 'JP': 'Japan' };
  let i = 0;
  const queries = [];
  for (let key in refObj) {
    topics.forEach(topic => {
      i += 1050;
      queries.push(getQueryStr(topic, key, type));
      setTimeout(() => {
        getArticles(topic, key, type);
      }, i);
    });
  }
};

module.exports = articleRefresh;
