import React from 'react';

import NewsListEntry from './NewsListEntry';

const NewsList = (props) => (
  <div className="news-list">
    <div>
      <h1 className="news-list-title">Articles from {props.state}</h1>
      <h1 className="news-list-closebtn"
        onClick={props.onCloseClick}>
        X
      </h1>
    </div>
    {props.articles.map( (article, idx) => (
      <NewsListEntry key={idx} article={article} />
    ))}
  </div>
);

export default NewsList;
