import React from 'react';

const Dropdown = (props) => (
  <div className='col-md-2 col-sm-2 col-lg-2'>
    <select className='form-control selector' onChange={props.handleToneSelection} value={/*props.currentEmotion[0].toUpperCase() + props.currentEmotion.slice(1)*/'Joy'}>
      <option>Joy</option>
      <option>Anger</option>
      <option>Disgust</option>
      <option>Fear</option>
      <option>Sadness</option>
    </select>
  </div>
);

export default Dropdown;