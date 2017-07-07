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

const EmotionDropdown = ({ handleEmotionChange, value, options }) => {
  const optionsObj = options.map(option => {
    return { 
      text: option, 
      value: option 
    };
  });

  return (
    <Dropdown onChange={handleEmotionChange} value={value} fluid selection options={optionsObj}>
    </Dropdown>
  )
}; 

export default EmotionDropdown;
