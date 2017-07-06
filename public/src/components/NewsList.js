import React from 'react';

import NewsListEntry from './NewsListEntry';

const NewsList = (props) => (
  <div style={style}>
    <div>
      <h1 style={titleStyle}>Articles from {props.state}</h1>
      <h1 style={closeButtonStyle}
        onClick={props.onCloseClick}>
        X
      </h1>
    </div>
    {props.articles.map( (article, idx) => (
      <NewsListEntry key={idx} article={article} />
    ))}
  </div>
);

const style = {
  zIndex: `10`,
  width: `40em`,
  margin: `auto`,
  backgroundColor: `white`,
  verticalAlign: `middle`,
  minHeight: `30em`,
  borderRadius: `1em`,
  padding: `1em`,
  pointerEvents: `visible`,
};

const titleStyle = {
  color: `yellow`,
  display: `inline-block`,
  margin: `0`,
};

const closeButtonStyle = {
  color: `blue`,
  display: `inline-block`,
  float: `right`,
  margin: `0`,
};

export default NewsList;
