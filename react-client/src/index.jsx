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
    }
  }
  componentDidMount() {
    mapboxgl.accessToken = "pk.eyJ1IjoiYmh1YW5nIiwiYSI6ImNqNDhxZWF6ZzBibjIycXBjaXN2Ymx3aHcifQ.MKQaPh3n3c94mcs0s2IfHw";
    var map = new mapboxgl.Map({
      container: 'map', // container id
      style: 'mapbox://styles/mapbox/dark-v9', //hosted style id
      center: [-77.38, 39], // starting position
      zoom: 3 // starting zoom
    });
  }
  render () {
    return (
      <div>
      </div>
    )}
}

ReactDOM.render(<App />, document.getElementById('app'));
