import React from 'react';
import ListItem from './ListItem.jsx';

const List = (props) => (
  <div id='state-legend' className='legend'>
    <h4>Legend</h4>
    <div><span style={{backgroundColor: props.colorCode[0]}}></span>0</div>
    <div><span style={{backgroundColor: props.colorCode[1]}}></span>25</div>
    <div><span style={{backgroundColor: props.colorCode[2]}}></span>50</div>
    <div><span style={{backgroundColor: props.colorCode[3]}}></span>75</div>
    <div><span style={{backgroundColor: props.colorCode[4]}}></span>100</div>
  </div>
);

export default List;
