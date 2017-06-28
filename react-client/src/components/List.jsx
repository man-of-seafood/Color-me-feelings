import React from 'react';
import ListItem from './ListItem.jsx';

const List = (props) => (
  <div id='state-legend' className='legend'>
    <h4>Legend</h4>
    <div><span style={{backgroundColor: 'hsl(0, 100%, 0%)'}}></span>0</div>
    <div><span style={{backgroundColor: 'hsl(0, 100%, 25%)'}}></span>25</div>
    <div><span style={{backgroundColor: 'hsl(0, 100%, 50%)'}}></span>50</div>
    <div><span style={{backgroundColor: 'hsl(0, 100%, 75%)'}}></span>75</div>
    <div><span style={{backgroundColor: 'hsl(0, 100%, 100%)'}}></span>100</div>
  </div>
);

export default List;
