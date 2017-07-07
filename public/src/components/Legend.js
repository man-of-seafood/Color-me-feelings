import React from 'react';

const Legend = (props) => (
  <div id='state-legend' className="legend">
    <h3 className="legend-title">Level of {props.emotion[0].toUpperCase() + props.emotion.slice(1)}</h3>
    {
      props.color.map( (color, idx) => (
        <div>
          <div style={colorStyle(color)} key={idx} className="color-key"/>
          {idx * 25}
        </div>
      ))
    }
  </div>
);

const colorStyle = (color) => ({
 backgroundColor: color
});

export default Legend;
