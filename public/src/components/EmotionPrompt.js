import React from 'react';
import { Dropdown } from 'semantic-ui-react';

const style = {
  pointerEvents: `visible`,
  paddingLeft: `5em`,
};

const EmotionPrompt = ({ handleToneChange, emotion, emotions }) => {
  const emotionsObj = emotions.map(emotion => {
    return { 
      text: emotion, 
      value: emotion 
    };
  });

  return (
    <div className="prompt">
      here is how 
      {' '}
      <Dropdown compact inline
        onChange={handleToneChange} 
        value={emotion} 
        options={emotionsObj} />
      the world
    </div>
  )
}; 

export default EmotionPrompt;
