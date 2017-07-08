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
      I felt
      {' '}
      <Dropdown inline
        onChange={handleToneChange} 
        value={emotion} 
        options={emotionsObj} />
    </div>
  )
}; 

export default EmotionPrompt;
