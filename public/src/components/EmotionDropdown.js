import React from 'react';

const style = {
  pointerEvents: `visible`,
  paddingLeft: `5em`,
};

const selectStyle = {
  width: `14em`,
  height: `2em`,
};

const EmotionDropdown = (props) => (
      <div style={style}>
        <select onChange={props.handleEmotionChange} value={props.value} style={selectStyle}>
          {props.options.map( (option, idx) => (
            <option key={idx}>{option}</option>
          ))}
        </select>
      </div>
    ); 

export default EmotionDropdown;
