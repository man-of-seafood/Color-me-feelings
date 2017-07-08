import React from 'react';
import { Dropdown } from 'semantic-ui-react';

const style = {
  pointerEvents: `visible`,
  paddingLeft: `5em`,
};

const TopicPrompt = ({ handleTopicChange, topic, topics }) => {
  const topicsObj = topics.map(topic => {
    return { 
      text: topic, 
      value: topic 
    };
  });

  return (
    <div className="prompt">
      regarding
      {' '}
      <Dropdown inline
        onChange={handleTopicChange} 
        value={topic} 
        options={topicsObj} />
    </div>
  )
}; 

export default TopicPrompt;
