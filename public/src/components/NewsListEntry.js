import React from 'react';
import { List } from 'semantic-ui-react';

const NewsListEntry = ({ article }) => (
  <List.Item
    onClick={() => window.open(article[1], '_blank')}
  >
    <List.Header as="h3">{article[0]}</List.Header>
    <List.Description>
      {article[1]}
      <List.Icon name="external" size="small"/>
    </List.Description>
  </List.Item>
);

export default NewsListEntry;
