import React from 'react';
import { Modal, List } from 'semantic-ui-react';

import NewsListEntry from './NewsListEntry';

const NewsList = ({ state, open, onCloseClick, articles }) => (
  <Modal open={open} onClose={onCloseClick} closeIcon="close" size="small">
    <Modal.Header as="h2">Articles from {state}</Modal.Header>
    <Modal.Content>
      <List selection relaxed verticalAlign="middle">
        { articles.length
          ? articles.map((article, idx) => (
            <NewsListEntry key={idx} article={article} />
          )) 
          : <div>No articles found.</div>
        }
      </List>
    </Modal.Content>
  </Modal>
);

export default NewsList;
