import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import List from './components/List.jsx';
import mapboxgl from 'mapbox-gl';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: []
    };
    this.handleToneSelection = this.handleToneSelection.bind(this);
  }

  componentDidMount() {
    mapboxgl.accessToken = "pk.eyJ1IjoiYmh1YW5nIiwiYSI6ImNqNDhxZWF6ZzBibjIycXBjaXN2Ymx3aHcifQ.MKQaPh3n3c94mcs0s2IfHw";
    var map = new mapboxgl.Map({
      container: 'map', // container id
      style: 'mapbox://styles/mapbox/dark-v9', //hosted style id
      center: [-95.38, 39], // starting position
      zoom: 4 // starting zoom
    });
  }

  // TODO: News get request


  // when user selects tone
  handleToneSelection(tone) {
    $.ajax({
      type: 'GET',
      url: '/tones/' + tone + '/emotion',
      data: {tone: tone}, // from news
      success: (data) => {},
      error: (err) => { console.log('Watson: Failed to get tone data from server ', err); }
    }); 
  }


  render() {
    return (
      <div>
        <h1>THIS IS A TITLE</h1>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
