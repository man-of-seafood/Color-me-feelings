import React from 'react';
import { Header, Segment } from 'semantic-ui-react';

const Legend = ({ emotion, color }) => (
  <Segment className="legend">
    <Header as="h3">Level of {emotion[0].toUpperCase() + emotion.slice(1)}</Header>
    {
      color.map((color, idx) => (
        <div key={idx}>
          <div style={colorStyle(color)} className="color-key"/>
          {idx * 25}
        </div>
      ))
    }
  </Segment>
);

const colorStyle = (color) => ({
 backgroundColor: color
});

export default Legend;
