import React from 'react';

const Legend = (props) => (
  <div id='state-legend' style={style}>
    <h3 style={titleStyle}>Level of {props.emotion[0].toUpperCase() + props.emotion.slice(1)}</h3>
    <div><div style={colorStyle(props.color[0])}></div>0</div>
    <div><div style={colorStyle(props.color[1])}></div>25</div>
    <div><div style={colorStyle(props.color[2])}></div>50</div>
    <div><div style={colorStyle(props.color[3])}></div>75</div>
    <div><div style={colorStyle(props.color[4])}></div>100</div>
  </div>
);

const style = {
  position: `absolute`,
  right: `3em`,
  bottom: `3em`,
  backgroundColor: `#ffefd5`,
  padding: `10px`,
  borderRadius: `10px`,
  fontFamily: `arial`,
  width: `10em`,
};

const titleStyle = {
  color: `#073642`
}

const colorStyle = (color) => ({
  width: `1em`,
  height: `1em`,
  borderRadius: `0.2em`,
  display: `inline-block`,
  verticalAlign: `top`,
  marginRight: `0.5em`,
  marginBottom: `0.5em`,
  backgroundColor: color,
});

export default Legend;
