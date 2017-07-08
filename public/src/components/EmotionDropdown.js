import React from 'react';
import { Dropdown } from 'semantic-ui-react';

const style = {
  pointerEvents: `visible`,
  paddingLeft: `5em`,
};

const selectStyle = {
  width: `14em`,
  height: `2em`,
};

const EmotionDropdown = ({ handleEmotionChange, handleTopicChange, emotion, topic, emotions, topics }) => {
  const emotionsObj = emotions.map(emotion => {
    return { 
      text: emotion, 
      value: emotion 
    };
  });

  const topicsObj = topics.map(topic => {
    return { 
      text: topic, 
      value: topic 
    };
  });

  return (
    <span className="prompt">
      Who feels
      {' '}
      <Dropdown inline
        onChange={handleEmotionChange} 
        value={emotion} 
        options={emotionsObj} />
      regarding
      {' '}
      <Dropdown inline
        onChange={handleTopicChange} 
        value={topic} 
        options={topicsObj} />
      ?
    </span>
  )
}; 

export default EmotionDropdown;
