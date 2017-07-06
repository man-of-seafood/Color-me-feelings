import React from 'react';

const EmotionDropdown = (props) => (
      <div>
        <select className='form-control selector' onChange={props.handleEmotionChange} value={props.value}>
          {props.options.map( (option, idx) => (
            <option key={idx}>{option}</option>
          ))}
        </select>
      </div>
    ); 

export default EmotionDropdown;
