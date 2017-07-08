import React from 'react';
import { List } from 'semantic-ui-react';

const NewsListEntry = ({ article }) => (
  <List.Item
    onClick={() => window.open(article.source, '_blank')}
  >
    <List.Header as="h3">{article.title}</List.Header>
    <List.Description>
      {article.source}
      <List.Icon name="external" size="small"/>
    </List.Description>
  </List.Item>
);

export default NewsListEntry;
