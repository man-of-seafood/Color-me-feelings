import React from 'react';

const Legend = (props) => (
  <div id='state-legend' className='legend'>
    <h4>Legend</h4>
    <div><span style={{backgroundColor: props.color[0]}}></span>0</div>
    <div><span style={{backgroundColor: props.color[1]}}></span>25</div>
    <div><span style={{backgroundColor: props.color[2]}}></span>50</div>
    <div><span style={{backgroundColor: props.color[3]}}></span>75</div>
    <div><span style={{backgroundColor: props.color[4]}}></span>100</div>
  </div>
);

export default Legend;
